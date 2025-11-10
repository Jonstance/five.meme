import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useWalletClient } from "wagmi";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./PresaleList.css";
import BNBLaunchPadJson from "../../ABIs/BNBLaunchPad.json";

const Badge = ({ type }: { type: string }) => {
  const badgeClass = type.toLowerCase();
  return <div className={badgeClass}>{type.toUpperCase()}</div>;
};

const Pool = ({ item }: { item: any }) => {
  const [totalBnbContributed, setTotalBnbContributed] = useState<any>(0);
  const [pFinalise, setPFinalise] = useState<any>(0);

  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    setValues();
  }, []);

  const setValues = async () => {
    try {
      // Skip if no presale address
      if (!item?.presaleAddress) {
        console.warn("No presale address available for", item?.name);
        return;
      }

      let provider;
      
      // Use wallet client if available, otherwise use public RPC
      if (walletClient) {
        provider = new ethers.providers.Web3Provider(walletClient.transport);
      } else {
        // Use public BSC RPC when wallet is not connected
        provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
      }

      const contract = new ethers.Contract(item.presaleAddress, BNBLaunchPadJson.output.abi, provider);

      // Check if contract exists by trying to get its code
      const contractCode = await provider.getCode(item.presaleAddress);
      if (contractCode === '0x') {
        console.warn("Contract not deployed at address:", item.presaleAddress);
        return;
      }

      // Try to call the contract methods with error handling for each
      try {
        // Note: totalBNBReceivedInAllTier is a public variable, not a function
        const bnbReceived = await contract.totalBNBReceivedInAllTier();
        setTotalBnbContributed(ethers.utils.formatEther(bnbReceived));
      } catch (bnbError) {
        console.warn("Failed to get totalBNBReceivedInAllTier for", item?.name, ":", bnbError.message);
        setTotalBnbContributed(0);
      }

      try {
        // presaleFinalized is also a public variable, not a function
        const finalized = await contract.presaleFinalized();
        setPFinalise(finalized);
      } catch (finalizeError) {
        console.warn("Failed to get presaleFinalized for", item?.name, ":", finalizeError.message);
        setPFinalise(false);
      }

    } catch (error) {
      console.error("Error fetching contract data for", item?.name, ":", error);
      // Set default values on error
      setTotalBnbContributed(0);
      setPFinalise(false);
    }
  };

  const getStatus = () => {
    const stD = new Date(item?.startTime);
    const endtD = new Date(item?.endTime);
    const today = new Date();

    if (item?.status === "Finalise") return "Finalise";
    if (today >= stD && today <= endtD && totalBnbContributed === item?.hardcap) return "completed";
    if (today >= stD && today >= endtD && totalBnbContributed > item?.softcap) return "completed";
    if (today >= stD && today >= endtD && totalBnbContributed < item?.softcap) return "failed";
    if (today >= stD && today <= endtD) return "Live";
    if (today <= stD) return "coming soon";
  };

  const progress = Math.min(100, (100 * (+totalBnbContributed / +item?.hardcap)) || 0);

  return (
    <div className="pool">
      <span className="name">{item?.name}</span>
      <div className="rw1">
        <div className="logo">
          <img src={item?.logo} alt="Project logo" />
        </div>
        <div className="btns" id="badges">
          {item?.verification?.map((val: string, idx: number) =>
            ["safu", "audit", "kyc"].includes(val.toLowerCase()) ? <Badge key={idx} type={val} /> : null
          )}
        </div>
      </div>

      <div className="rw2 dem">
        <span className="s1">{item?.name}</span>
        <span className="s2">{item?.symbol}</span>
      </div>

      <div className="rw3 dem">
        <span>Soft/Hard Cap</span>
        <span className="val">{+item?.softcap} BNB - {+item?.hardcap} BNB</span>
      </div>

      <div className="progress dem">
        <span className="s-a">Progress ({totalBnbContributed} BNB)</span>
        <div className="bar">
          <div className="fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="fill_count">
          <span>{progress.toFixed(2)}%</span>
        </div>
        <div className="groups">
          <div className="rw">
            <span className="l">Liquidity %:</span>
            <span className="r">{item?.liqPercent}</span>
          </div>
          <div className="rw">
            <span className="l">Lockup Time:</span>
            <span className="r">{item?.liqLockTime} days</span>
          </div>
        </div>
        <div className="status dem">
          <span className="l">Presale:</span>
          <span>{getStatus()}</span>
        </div>
        <div className="vp dem">
          <Link className="react_link" to={`/launch/${item?._id}`}>
            <div>View Pool</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

const PresaleList = () => {
  const [list, setList] = useState([]);
  const baseUrl: string = "/api";
  const [selectedStatus, setSelectedStatus] = useState("All");

  const getRoughStatus = (item: any): string => {
    const start = new Date(item?.startTime);
    const end = new Date(item?.endTime);
    const now = new Date();

    if (item?.status === "Finalise") return "Finalise";
    if (now < start) return "coming soon";
    if (now >= start && now <= end) return "Live";
    if (now > end) return "completed";
    return "unknown";
  };

  useEffect(() => {
    axios
      .get(`${baseUrl}/projects`)
      .then((data) => {
        setList(data.data);
      })
      .catch((err) => console.error("Failed to fetch projects:", err));
  }, []);

  return (
    <div className="presale_list">
      <Navbar />
      <main className="list_wrapper">
        <div className="search_section">
          <div className="top">
            <span>All Presales</span>
            <input type="text" placeholder="Enter token name or token symbol" />
          </div>
        </div>
        <div className="filter_controls">
          <span>Filter by Status:</span>
          <div className="filters">
            {["All", "Live", "coming soon", "completed", "failed"].map((status) => (
              <button
                key={status}
                className={selectedStatus === status ? "active" : ""}
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <div className="pools">
          {list
            .filter((item) => selectedStatus === "All" || getRoughStatus(item) === selectedStatus)
            .map((item, i) => (
              <Pool key={i} item={item} />
            ))}
        </div>

        <div className="vmp">
          <div>View more pools</div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PresaleList;