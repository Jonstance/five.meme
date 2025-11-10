// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BondingCurveLaunch
 * @dev Implements a bonding curve token launch similar to four.meme
 * Features:
 * - Continuous buy/sell on bonding curve
 * - Anti-sniping with max buy limits in early blocks
 * - Rush mode (time-locked selling)
 * - Automatic graduation to PancakeSwap when target reached
 * - Referral rewards system
 */
contract BondingCurveLaunch is ReentrancyGuard, Ownable {

    // Token being launched
    IERC20 public token;

    // Bonding curve parameters
    uint256 public constant CURVE_MULTIPLIER = 1e15; // Price multiplier
    uint256 public constant GRADUATION_SUPPLY = 800_000_000 * 1e18; // 80% of supply triggers graduation
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 1e18;

    // Anti-sniping parameters
    uint256 public immutable launchBlock;
    uint256 public constant ANTI_SNIPE_BLOCKS = 3; // First 3 blocks have limits
    uint256 public constant MAX_BUY_ANTI_SNIPE = 10 ether; // Max buy during anti-snipe

    // Rush mode (time-locked selling)
    uint256 public constant RUSH_MODE_DURATION = 10 minutes;
    uint256 public immutable rushModeEnd;

    // Fee structure
    uint256 public constant TRADING_FEE = 100; // 1% (in basis points)
    uint256 public constant REFERRAL_REWARD = 25; // 0.25% of fees
    uint256 public feeCollected;

    // Graduation state
    bool public graduated;
    address public pancakeswapPair;

    // Supply tracking
    uint256 public totalSold;

    // User balances and referrals
    mapping(address => uint256) public tokenBalance;
    mapping(address => address) public referrers;
    mapping(address => uint256) public referralEarnings;

    // Rush mode tracking
    mapping(address => uint256) public lastBuyTime;

    // Events
    event TokensPurchased(
        address indexed buyer,
        uint256 bnbAmount,
        uint256 tokensReceived,
        uint256 newPrice,
        address indexed referrer
    );

    event TokensSold(
        address indexed seller,
        uint256 tokenAmount,
        uint256 bnbReceived,
        uint256 newPrice
    );

    event Graduated(
        uint256 liquidityBNB,
        uint256 liquidityTokens,
        address pancakeswapPair
    );

    event ReferralSet(address indexed user, address indexed referrer);
    event ReferralRewardPaid(address indexed referrer, uint256 amount);

    constructor(
        address _token,
        address _owner
    ) {
        require(_token != address(0), "Invalid token");
        token = IERC20(_token);
        launchBlock = block.number;
        rushModeEnd = block.timestamp + RUSH_MODE_DURATION;
        _transferOwnership(_owner);
    }

    /**
     * @dev Calculate token price based on current supply sold
     * Uses a linear bonding curve: price = (totalSold / CURVE_MULTIPLIER)^2
     */
    function getCurrentPrice() public view returns (uint256) {
        if (totalSold == 0) return 1e12; // Starting price: 0.000001 BNB per token

        // Linear bonding curve formula
        uint256 progress = (totalSold * 1e18) / GRADUATION_SUPPLY;
        uint256 price = (progress * progress) / 1e18;
        return price + 1e12; // Minimum price
    }

    /**
     * @dev Calculate tokens received for a given BNB amount
     */
    function calculateTokensForBNB(uint256 bnbAmount) public view returns (uint256) {
        require(bnbAmount > 0, "Amount must be > 0");

        uint256 fee = (bnbAmount * TRADING_FEE) / 10000;
        uint256 bnbAfterFee = bnbAmount - fee;

        uint256 currentPrice = getCurrentPrice();
        uint256 tokensToReceive = (bnbAfterFee * 1e18) / currentPrice;

        // Ensure we don't exceed graduation supply
        if (totalSold + tokensToReceive > GRADUATION_SUPPLY) {
            tokensToReceive = GRADUATION_SUPPLY - totalSold;
        }

        return tokensToReceive;
    }

    /**
     * @dev Calculate BNB received for selling tokens
     */
    function calculateBNBForTokens(uint256 tokenAmount) public view returns (uint256) {
        require(tokenAmount > 0, "Amount must be > 0");
        require(tokenAmount <= totalSold, "Exceeds sold supply");

        uint256 currentPrice = getCurrentPrice();
        uint256 bnbBeforeFee = (tokenAmount * currentPrice) / 1e18;
        uint256 fee = (bnbBeforeFee * TRADING_FEE) / 10000;

        return bnbBeforeFee - fee;
    }

    /**
     * @dev Buy tokens with BNB
     */
    function buyTokens(address referrer) external payable nonReentrant {
        require(!graduated, "Already graduated to DEX");
        require(msg.value > 0, "Must send BNB");
        require(totalSold < GRADUATION_SUPPLY, "Bonding curve complete");

        // Anti-sniping check
        if (block.number < launchBlock + ANTI_SNIPE_BLOCKS) {
            require(msg.value <= MAX_BUY_ANTI_SNIPE, "Exceeds anti-snipe limit");
        }

        // Set referrer (only once per user)
        if (referrer != address(0) && referrer != msg.sender && referrers[msg.sender] == address(0)) {
            referrers[msg.sender] = referrer;
            emit ReferralSet(msg.sender, referrer);
        }

        // Calculate fees
        uint256 tradingFee = (msg.value * TRADING_FEE) / 10000;
        uint256 referralReward = 0;

        // Pay referral reward if applicable
        address userReferrer = referrers[msg.sender];
        if (userReferrer != address(0)) {
            referralReward = (tradingFee * REFERRAL_REWARD) / 100;
            referralEarnings[userReferrer] += referralReward;
            emit ReferralRewardPaid(userReferrer, referralReward);
        }

        feeCollected += (tradingFee - referralReward);

        // Calculate tokens
        uint256 tokensToReceive = calculateTokensForBNB(msg.value);
        require(tokensToReceive > 0, "Insufficient amount");

        // Update state
        totalSold += tokensToReceive;
        tokenBalance[msg.sender] += tokensToReceive;
        lastBuyTime[msg.sender] = block.timestamp;

        uint256 newPrice = getCurrentPrice();
        emit TokensPurchased(msg.sender, msg.value, tokensToReceive, newPrice, userReferrer);

        // Check if graduation threshold reached
        if (totalSold >= GRADUATION_SUPPLY) {
            _graduateToDEX();
        }
    }

    /**
     * @dev Sell tokens back to bonding curve
     */
    function sellTokens(uint256 tokenAmount) external nonReentrant {
        require(!graduated, "Use DEX for trading");
        require(tokenAmount > 0, "Amount must be > 0");
        require(tokenBalance[msg.sender] >= tokenAmount, "Insufficient balance");

        // Rush mode check - prevent immediate dumps
        if (block.timestamp < rushModeEnd) {
            require(
                lastBuyTime[msg.sender] == 0 ||
                block.timestamp >= lastBuyTime[msg.sender] + RUSH_MODE_DURATION,
                "Rush mode: Cannot sell yet"
            );
        }

        uint256 bnbToReceive = calculateBNBForTokens(tokenAmount);
        require(address(this).balance >= bnbToReceive, "Insufficient contract balance");

        // Update state
        tokenBalance[msg.sender] -= tokenAmount;
        totalSold -= tokenAmount;

        // Transfer BNB to seller
        (bool success, ) = msg.sender.call{value: bnbToReceive}("");
        require(success, "BNB transfer failed");

        uint256 newPrice = getCurrentPrice();
        emit TokensSold(msg.sender, tokenAmount, bnbToReceive, newPrice);
    }

    /**
     * @dev Claim tokens to wallet (internal accounting to actual tokens)
     */
    function claimTokens() external nonReentrant {
        uint256 balance = tokenBalance[msg.sender];
        require(balance > 0, "No tokens to claim");

        tokenBalance[msg.sender] = 0;
        require(token.transfer(msg.sender, balance), "Transfer failed");
    }

    /**
     * @dev Claim referral earnings
     */
    function claimReferralEarnings() external nonReentrant {
        uint256 earnings = referralEarnings[msg.sender];
        require(earnings > 0, "No earnings to claim");

        referralEarnings[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: earnings}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Internal function to graduate to PancakeSwap
     * Called automatically when bonding curve reaches target
     */
    function _graduateToDEX() internal {
        require(!graduated, "Already graduated");

        graduated = true;

        // Reserve liquidity amounts (20% of supply remains)
        uint256 liquidityTokens = TOTAL_SUPPLY - GRADUATION_SUPPLY;
        uint256 liquidityBNB = address(this).balance - feeCollected;

        // Here you would integrate with PancakeSwap router
        // This is a placeholder - implement actual DEX integration
        // IPancakeRouter02 router = IPancakeRouter02(PANCAKE_ROUTER);
        // token.approve(address(router), liquidityTokens);
        // router.addLiquidityETH{value: liquidityBNB}(...);

        emit Graduated(liquidityBNB, liquidityTokens, pancakeswapPair);
    }

    /**
     * @dev Emergency withdraw for owner (before graduation)
     */
    function emergencyWithdraw() external onlyOwner {
        require(!graduated, "Cannot withdraw after graduation");
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        uint256 amount = feeCollected;
        require(amount > 0, "No fees to withdraw");

        feeCollected = 0;
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Withdraw failed");
    }

    /**
     * @dev Get market stats
     */
    function getMarketStats() external view returns (
        uint256 currentPrice,
        uint256 marketCap,
        uint256 liquidityBNB,
        uint256 progressPercent,
        uint256 holdersCount,
        bool isGraduated
    ) {
        currentPrice = getCurrentPrice();
        marketCap = (totalSold * currentPrice) / 1e18;
        liquidityBNB = address(this).balance;
        progressPercent = (totalSold * 100) / GRADUATION_SUPPLY;
        holdersCount = 0; // Would need to track this separately
        isGraduated = graduated;
    }

    receive() external payable {}
}
