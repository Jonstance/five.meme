import { Routes, Route, BrowserRouter } from "react-router-dom";
import Admin from "../pages/Admin/Admin";
import Airdrop from "../pages/Airdrop/Airdrop";
import CreateLock from "../pages/CreateLock/CreateLock";
import CreateToken from "../pages/CreateToken/CreateToken";
import Home from "../pages/Homepage/Home"
import LaunchPage from "../pages/LaunchPage/LaunchPage";
import MyLocks from "../pages/MyLocks/MyLocks";
import MyLocksList from "../pages/MyLocksList/MyLocksList";
import Page1 from "../pages/Presale/Page_1/Page1";
import Page_2 from "../pages/Presale/Page_2/Page_2";
import Page_3 from "../pages/Presale/Page_3/Page_3";
import Submit_Page from "../pages/Presale/Submit_Page/Submit_Page";
import PresaleList from "../pages/PresaleList/PresaleList";
import { DataContextProvider } from "./context/DataContext";
import MenuProvider from "./context/MenuContext";
import PresaleProvider from "./context/PresaleContext";
import { WalletProvider } from "./context/walletContext";

const Views = () => {
    return (
        <WalletProvider>
            <DataContextProvider>
                <MenuProvider>
                    <PresaleProvider>
                        <BrowserRouter>
                            <Routes>
                                
                            </Routes>
                        </BrowserRouter>
                    </PresaleProvider>
                </MenuProvider>
            </DataContextProvider>
        </WalletProvider>
    )
}

export default Views