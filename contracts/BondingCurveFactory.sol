// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./BondingCurveLaunch.sol";

/**
 * @title MemeToken
 * @dev Simple ERC20 token for meme launches
 */
contract MemeToken is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address mintTo
    ) ERC20(name, symbol) {
        _mint(mintTo, totalSupply);
    }
}

/**
 * @title BondingCurveFactory
 * @dev Factory for creating bonding curve launches
 * Similar to four.meme's launch system
 */
contract BondingCurveFactory is Ownable {

    // Platform fee for creating a launch
    uint256 public creationFee = 0.01 ether;

    // All launches created
    address[] public allLaunches;
    mapping(address => address[]) public userLaunches;
    mapping(address => LaunchInfo) public launchInfo;

    struct LaunchInfo {
        address token;
        address creator;
        string name;
        string symbol;
        string logoUrl;
        string description;
        string website;
        string twitter;
        string telegram;
        string discord;
        uint256 createdAt;
        bool verified;
        bool flagged;
    }

    event LaunchCreated(
        address indexed launchAddress,
        address indexed token,
        address indexed creator,
        string name,
        string symbol,
        uint256 timestamp
    );

    event LaunchVerified(address indexed launchAddress, bool verified);
    event LaunchFlagged(address indexed launchAddress, bool flagged);

    constructor() {}

    /**
     * @dev Create a new bonding curve launch
     * @param name Token name
     * @param symbol Token symbol
     * @param totalSupply Total token supply
     * @param logoUrl URL to token logo
     * @param description Token description
     * @param website Website URL
     * @param twitter Twitter handle
     * @param telegram Telegram link
     * @param discord Discord link
     */
    function createLaunch(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        string memory logoUrl,
        string memory description,
        string memory website,
        string memory twitter,
        string memory telegram,
        string memory discord
    ) external payable returns (address launchAddress, address tokenAddress) {
        require(msg.value >= creationFee, "Insufficient creation fee");
        require(bytes(name).length > 0, "Name required");
        require(bytes(symbol).length > 0, "Symbol required");
        require(totalSupply > 0, "Supply must be > 0");

        // Create token
        MemeToken token = new MemeToken(
            name,
            symbol,
            totalSupply,
            address(this) // Mint to factory first
        );
        tokenAddress = address(token);

        // Create bonding curve launch
        BondingCurveLaunch launch = new BondingCurveLaunch(
            tokenAddress,
            msg.sender
        );
        launchAddress = address(launch);

        // Transfer tokens to launch contract
        token.transfer(launchAddress, totalSupply);

        // Store launch info
        launchInfo[launchAddress] = LaunchInfo({
            token: tokenAddress,
            creator: msg.sender,
            name: name,
            symbol: symbol,
            logoUrl: logoUrl,
            description: description,
            website: website,
            twitter: twitter,
            telegram: telegram,
            discord: discord,
            createdAt: block.timestamp,
            verified: false,
            flagged: false
        });

        allLaunches.push(launchAddress);
        userLaunches[msg.sender].push(launchAddress);

        emit LaunchCreated(
            launchAddress,
            tokenAddress,
            msg.sender,
            name,
            symbol,
            block.timestamp
        );

        return (launchAddress, tokenAddress);
    }

    /**
     * @dev Get all launches (paginated)
     */
    function getAllLaunches(
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory) {
        uint256 total = allLaunches.length;
        if (offset >= total) return new address[](0);

        uint256 end = offset + limit;
        if (end > total) end = total;

        uint256 size = end - offset;
        address[] memory result = new address[](size);

        for (uint256 i = 0; i < size; i++) {
            result[i] = allLaunches[total - 1 - (offset + i)]; // Reverse order (newest first)
        }

        return result;
    }

    /**
     * @dev Get user's launches
     */
    function getUserLaunches(address user) external view returns (address[] memory) {
        return userLaunches[user];
    }

    /**
     * @dev Get launch details
     */
    function getLaunchInfo(address launchAddress) external view returns (LaunchInfo memory) {
        return launchInfo[launchAddress];
    }

    /**
     * @dev Get total launches count
     */
    function getTotalLaunches() external view returns (uint256) {
        return allLaunches.length;
    }

    /**
     * @dev Verify a launch (admin only)
     */
    function verifyLaunch(address launchAddress, bool verified) external onlyOwner {
        require(launchInfo[launchAddress].creator != address(0), "Launch not found");
        launchInfo[launchAddress].verified = verified;
        emit LaunchVerified(launchAddress, verified);
    }

    /**
     * @dev Flag a malicious launch (admin only)
     */
    function flagLaunch(address launchAddress, bool flagged) external onlyOwner {
        require(launchInfo[launchAddress].creator != address(0), "Launch not found");
        launchInfo[launchAddress].flagged = flagged;
        emit LaunchFlagged(launchAddress, flagged);
    }

    /**
     * @dev Update creation fee
     */
    function setCreationFee(uint256 newFee) external onlyOwner {
        creationFee = newFee;
    }

    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    /**
     * @dev Get trending launches (by volume/activity)
     * This is a simplified version - would need off-chain indexing for real implementation
     */
    function getTrendingLaunches(uint256 limit) external view returns (address[] memory) {
        uint256 total = allLaunches.length;
        if (total == 0) return new address[](0);

        uint256 size = limit > total ? total : limit;
        address[] memory trending = new address[](size);

        // For now, just return most recent
        // In production, you'd sort by volume/activity from off-chain indexer
        for (uint256 i = 0; i < size; i++) {
            trending[i] = allLaunches[total - 1 - i];
        }

        return trending;
    }

    receive() external payable {}
}
