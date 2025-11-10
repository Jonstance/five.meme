import Footer from "../../../components/Footer/Footer";
import Navbar from "../../../components/Navbar/Navbar";
import "./Page_1.css";
import { useContext, useEffect, useState } from "react";
import { PresaleContext } from "../../../setup/context/PresaleContext";
import { Link } from "react-router-dom";
import WalletContext from "../../../setup/context/walletContext";
import { ethers } from "ethers";
import { useAccount, useClient, useWalletClient } from 'wagmi';
import StandardToken from "../../../ABIs/StandardToken.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Page1 = () => {
  const LAUNCHPAD_FACTORY_ADDRESS = "0xf0ca9a712386489eeebe51473a2a2af9c45e9fad";

  const presaleContext = useContext(PresaleContext);
  if (!presaleContext) {
    throw new Error("PresaleContext must be used within a PresaleProvider");
  }

  const {
    tokenAddress,
    setTokenAddress,
    tokenName,
    setTokenName,
    tokenDecimal,
    setTokenDecimal,
    tokenSymbol,
    setTokenSymbol,
  } = presaleContext;

  const client = useClient();

  const { address, isConnected } = useAccount();
  const [approved, setApproved] = useState(false);
  const [presaleOwnerBalance, setPresaleOwnerBalance] = useState("");
    const { data: walletClient } = useWalletClient(); // Get the wallet client


  const handleTokenAdd = async (value: string) => {
    if (!walletClient) throw new Error("No wallet client available. Please connect your wallet.");

            const provider = new ethers.providers.Web3Provider(walletClient.transport);
            const signer = provider.getSigner();
    if (value && value.length > 6) {
      const tokenContract = new ethers.Contract(
        value,
        [
          {
            inputs: [],
            name: "decimals",
            outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "symbol",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "name",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [{ internalType: "address", name: "account", type: "address" }],
            name: "balanceOf",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        provider
      );

      try {
        const symbol = await tokenContract.symbol();
        const decimals = await tokenContract.decimals();
        const name = await tokenContract.name();
        const userBalance = await tokenContract.balanceOf(address);

        setTokenSymbol(symbol);
        setTokenDecimal(decimals);
        setTokenName(name);
        setPresaleOwnerBalance(userBalance.toString());
      } catch (error) {
        console.error("Error fetching token details:", error);
        toast.error("Failed to fetch token details. Please check the token address.");
      }
    }
  };

  const approveToken = async () => {
    const toastLoading = toast.loading("Approving token...");
    try {
      if (!walletClient) throw new Error("No wallet client available. Please connect your wallet.");

            const provider = new ethers.providers.Web3Provider(walletClient.transport);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, StandardToken.abi, signer);

      await tokenContract.approve(
        LAUNCHPAD_FACTORY_ADDRESS,
        ethers.utils.parseEther(presaleOwnerBalance)
      );

      toast.update(toastLoading, {
        render: "Token approved successfully!",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
      setApproved(true);
    } catch (error) {
      console.error("Token approval failed:", error);
      toast.update(toastLoading, {
        render: "Token approval failed!",
        type: "error",
        isLoading: false,
        autoClose: 1000,
      });
    }
  };

  const canShowApprove = !approved && tokenName && tokenSymbol && tokenDecimal && presaleOwnerBalance.trim();
  const canShowNext = approved && tokenName && tokenSymbol && tokenDecimal;

  return (
    <div className="page_1">
      <Navbar />
      <ToastContainer position="top-right" />
      <main className="page_main">
        <div className="items_wrapper">
          <span className="required_label">(*) is a required field</span>

          <div className="input_group_1">
            <div className="group_1_label">
              <span className="mt">Token Address</span><span className="ast">*</span>
            </div>
            <div className="group_1_input">
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => {
                  setTokenAddress(e.target.value);
                  handleTokenAdd(e.target.value);
                }}
              />
            </div>
            <span className="group_1_note">Create pool fee: 0.01 BNB</span>
          </div>

          <div className="token_info">
            <div className="ti_row"><span className="data">Name</span><span className="value">{tokenName}</span></div>
            <div className="ti_row"><span className="data">Symbol</span><span className="value">{tokenSymbol}</span></div>
            <div className="ti_row"><span className="data">Decimals</span><span className="value">{tokenDecimal}</span></div>
          </div>

          <div className="currency_details">
            <span className="currency">Currency</span>
            <span className="symbol">BNB</span>
          </div>

          <span className="notice">Users will pay with BNB for your token</span>

          <div className="warning_card">
            <span>
              Make sure the token has ‘Exclude transfer fee’ function if it has transfer fees.
            </span>
          </div>

          <div className="form_buttons">
            {canShowApprove && <button onClick={approveToken}>Approve</button>}
            {canShowNext && (
              <Link className="react_link" to="/Create_presale_info">
                <button style={{ background: "green" }}>Next</button>
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Page1;