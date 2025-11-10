import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import { ToastContainer } from "react-toastify";
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import TradingInterface from '../../components/TradingInterface/TradingInterface';
import LaunchPage from './LaunchPage'; // The existing presale page

interface LaunchData {
  isBondingCurve: boolean;
  name: string;
  symbol: string;
  graduated?: boolean;
}

const LaunchPageWrapper = () => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [launchData, setLaunchData] = useState<LaunchData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkLaunchType = async () => {
      if (!params?.id) return;

      setIsLoading(true);
      try {
        // First try to fetch from bonding curve API
        const bondingResponse = await axios.get(`/api/bonding-launches/${params.id}`);

        if (bondingResponse.data) {
          setLaunchData({
            isBondingCurve: true,
            name: bondingResponse.data.name,
            symbol: bondingResponse.data.symbol,
            graduated: bondingResponse.data.graduated || false
          });
        }
      } catch (err) {
        // If not found in bonding curve, it's a legacy presale
        // The LaunchPage component will handle fetching presale data
        setLaunchData({
          isBondingCurve: false,
          name: '',
          symbol: ''
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkLaunchType();
  }, [params?.id]);

  if (isLoading) {
    return (
      <div className="launchpage">
        <Navbar />
        <main className="page_wrapper">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading launch details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="launchpage">
        <Navbar />
        <main className="page_wrapper">
          <div className="error">
            <h3>⚠️ Error Loading Launch</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Render bonding curve trading interface
  if (launchData?.isBondingCurve && params?.id) {
    return (
      <div className="launchpage">
        <ToastContainer position="top-right" />
        <Navbar />
        <TradingInterface
          launchAddress={params.id}
          tokenSymbol={launchData.symbol}
          tokenName={launchData.name}
          graduated={launchData.graduated || false}
        />
        <Footer />
      </div>
    );
  }

  // Render legacy presale UI
  return <LaunchPage />;
};

export default LaunchPageWrapper;
