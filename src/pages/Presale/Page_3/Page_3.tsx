import "./Page_3.css"
import Navbar from '../../../components/Navbar/Navbar'
import Footer from "../../../components/Footer/Footer"
import { PresaleContext } from "../../../setup/context/PresaleContext"
import { useContext, useState } from "react";
import { Link } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const scrollToTop = () => {
    window.scrollTo(0, 0)
}

const Page_3 = () => {
    const [hasCompletedForm, setHasCompletedForm] = useState<Boolean>(false);

    const presaleContext = useContext(PresaleContext);
    if (!presaleContext) {
        throw new Error('Page_3 must be used within a PresaleContext.Provider');
    }

    const {
        logoUrl, setLogoUrl,
        websiteLink, setWebsiteLink,
        twitterLink, setTwitterLink,
        instagramLink, setInstagramLink,
        facebookLink, setFacebookLink,
        telegramLink, setTelegramLink,
        githubLink, setGithubLink,
        discordLink, setDiscordLink,
        redditLink, setRedditLink,
        description, setDescription, } = presaleContext

        function validateForm () {
            console.log("validating")
            if (logoUrl === "") {
                console.log("Logo URL is Blank")
                toast("Logo URL is Blank");
              }else if (websiteLink === ""){
                toast("Website Link is blank");
              }else{
                setHasCompletedForm(true)
              }
        }
    return (
        <div className="page_3">
            <Navbar />
            <ToastContainer position="top-right"/>
            <main className="page_main">
                <div className="items_wrapper">
                    <div className="form_section">
                        <span className="required_label">(*) is a required field</span>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Logo URL</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                            </div>
                            <span className="group_2_note">
                                Learn more here
                            </span>
                        </div>


                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Website</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input type="text" value={websiteLink} onChange={(e) => setWebsiteLink(e.target.value)} />
                            </div>
                        </div>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Twitter</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input type="text" value={twitterLink} onChange={(e) => setTwitterLink(e.target.value)} />
                            </div>
                        </div>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Discord</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input type="text" value={discordLink} onChange={(e) => setDiscordLink(e.target.value)} />
                            </div>
                        </div>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Reddit</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input type="text" value={redditLink} onChange={(e) => setRedditLink(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="form_section">
                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Facebook</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input type="text" value={facebookLink} onChange={(e) => setFacebookLink(e.target.value)} />
                            </div>
                        </div>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Instagram</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input type="text" value={instagramLink} onChange={(e) => setInstagramLink(e.target.value)} />
                            </div>
                        </div>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Telegram</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input type="text" value={telegramLink} onChange={(e) => setTelegramLink(e.target.value)} />
                            </div>
                        </div>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Github</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input type="text" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} />
                            </div>
                        </div>
                    </div>


                </div>

                <div className="input_group_2_textarea">
                    <div className="group_2_label">
                        <span className="mt">Description</span>
                        <span className="ast">*</span>
                    </div>
                    <div className="group_3_input">
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                    </div>
                </div>

                <div className="form_buttons">
                    <Link className="react_link" to="/Create_presale_info" onClick={scrollToTop}>
                        <button style={{ "marginRight": "40px" }}>Back</button>
                    </Link>
                    <Link className="react_link" to="/Create_presale_submit" onClick={scrollToTop}><button>Next</button></Link>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default Page_3