import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Contexts
import { WalletProvider } from './setup/context/walletContext';
import PresaleProvider from './setup/context/PresaleContext';
import MenuProvider from './setup/context/MenuContext';

// Pages
import Home from './pages/Homepage/Home';
import Page1 from './pages/Presale/Page_1/Page1';
import Page_2 from './pages/Presale/Page_2/Page_2';
import Page_3 from './pages/Presale/Page_3/Page_3';
import Submit_Page from './pages/Presale/Submit_Page/Submit_Page';
import LaunchPageWrapper from './pages/LaunchPage/LaunchPageWrapper';
import CreateToken from './pages/CreateToken/CreateToken';
import CreateLock from './pages/CreateLock/CreateLock';
import Airdrop from './pages/Airdrop/Airdrop';
import PresaleList from './pages/PresaleList/PresaleList';
import Admin from './pages/Admin/Admin';
import MyLocks from './pages/MyLocks/MyLocks';
import MyLocksList from './pages/MyLocksList/MyLocksList';

// New Bonding Curve Pages
import MarketDiscovery from './pages/MarketDiscovery/MarketDiscovery';
import CreateBondingLaunch from './pages/CreateBondingLaunch/CreateBondingLaunch';

import { DataContextProvider } from './setup/context/DataContext';

function App() {
  return (
    <Router>
      <WalletProvider>
        <PresaleProvider>
          <MenuProvider>
            <DataContextProvider>
              {/* Context for managing data */}
            <div className="App">
              <Routes>
                <Route path="/" element={<Home />} />

                {/* Bonding Curve Routes (NEW) */}
                <Route path="/market" element={<MarketDiscovery />} />
                <Route path="/create-launch" element={<CreateBondingLaunch />} />

                {/* Legacy Presale Routes */}
                <Route path="/Create_presale" element={<Page1 />} />
                <Route path="/Create_presale_info" element={<Page_2 />} />
                <Route path="/Create_presale_social_media" element={<Page_3 />} />
                <Route path="/Create_presale_submit" element={<Submit_Page />} />
                <Route path="/launch/:id" element={<LaunchPageWrapper />} />
                <Route path="/Presale_list" element={<PresaleList />} />

                {/* Utility Routes */}
                <Route path="/Create_token" element={<CreateToken />} />
                <Route path="/Create_lock" element={<CreateLock />} />
                <Route path="/Airdrop" element={<Airdrop />} />
                <Route path="/Admin" element={<Admin />} />
                <Route path="/my_locks" element={<MyLocks />} />
                <Route path="/my_locks/:lockId" element={<MyLocks />} />
                <Route path="/my_locks_list" element={<MyLocksList />} />
              </Routes>
            </div>
            </DataContextProvider>
          </MenuProvider>
        </PresaleProvider>
      </WalletProvider>
    </Router>
  );
}

export default App;