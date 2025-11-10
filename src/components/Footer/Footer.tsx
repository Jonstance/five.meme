import "./Footer.css"
import telegramIcon from "../../assets/icons/telegram.svg"
import twitterIcon from "../../assets/icons/twitter.svg"
import { Link } from "react-router-dom"

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-grid">
                    <div className="footer-section">
                        <h3 className="footer-title">pad.meme</h3>
                        <p className="footer-description">
                            Launch and trade meme tokens instantly on bonding curves.
                            Fair launches, no presales, instant trading.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-heading">Platform</h4>
                        <ul className="footer-links">
                            <li><Link to="/market">Discover Tokens</Link></li>
                            <li><Link to="/create-launch">Create Launch</Link></li>
                            <li><Link to="/Presale_list">Presales</Link></li>
                            <li><Link to="/Create_token">Create Token</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-heading">Tools</h4>
                        <ul className="footer-links">
                            <li><Link to="/Create_lock">Token Lock</Link></li>
                            <li><Link to="/My_locks_list">My Locks</Link></li>
                            <li><Link to="/Airdrop">Airdrop</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-heading">Community</h4>
                        <div className="social">
                            <Link className="social-link" to="https://x.com/BilliPadFinance" target="_blank" rel="noopener noreferrer">
                                <img src={twitterIcon} alt="Twitter" className="social-icon" />
                                <span>Twitter</span>
                            </Link>
                            <Link className="social-link" to="https://t.me/padmeme" target="_blank" rel="noopener noreferrer">
                                <img src={telegramIcon} alt="Telegram" className="social-icon" />
                                <span>Telegram</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <p className="disclaimer">
                    Disclaimer: The information provided shall not in any way constitute a recommendation as to whether you should invest in any product discussed.
                    Cryptocurrency trading involves significant risk. Always do your own research.
                </p>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} pad.meme. All rights reserved.</p>
            </div>
        </footer>
    )
}

export default Footer;
