import { Link } from "react-router-dom"
import Footer from "../../components/Footer/Footer"
import Navbar from "../../components/Navbar/Navbar"
import "./Admin.css"
import { cancelProject, fetchAllPools, logIn, logOut, verifyProject } from "../../apiCalls/admin"
import { useContext, useEffect, useState } from "react"
import { ProjectDTO } from "../../dto/project.dto"
import { toast } from 'react-toastify';
import DataContext from "../../setup/context/DataContext"
const Admin = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('Admin must be used within a DataContext Provider');
    }
    const { isLoggedIn, setIsLoggedIn } = context;
    const [allPools, setAllPools] = useState<ProjectDTO[]>([])
    const [poolQuery, setPoolQuery] = useState<string>("")
    const [resultPools, setResultPools] = useState<ProjectDTO[]>([])
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const fetchPools = async () => {
        const allPoolsRes = await fetchAllPools()
        allPoolsRes.error ? console.log(allPoolsRes.errorMessage) : setAllPools(allPoolsRes.data)
    }
    const handleVerification = async (verificationType: String, projectId: String | undefined) => {
        let token = JSON.parse(localStorage.getItem("loginStateToken") || '{}')
        let userToken = token.userToken;
        const verifyRes = await verifyProject(verificationType, projectId, userToken);
        if (verifyRes.error) {
            toast.error(`An error occured. ${verifyRes.errorMessage.message}`)
        } else {
            toast.success(`${verificationType} verification has been added to the project`)
        }
    }

    const handleCancelProject = async (projectId: String | undefined) => {
        let token = JSON.parse(localStorage.getItem("loginStateToken") || '{}')
        let userToken = token.userToken;
        const cancelRes = await cancelProject(projectId, userToken)
        if (cancelRes.error) {
            toast.error(`An error occured. ${cancelRes.errorMessage.message}`)
        } else {
            toast.success("Presale cancelled.");
            fetchPools()
        }
    }

    const handleLoginAdmin = async () => {
        if (email == "" || password == "") {
            toast.error("Please enter all credentials to login.")
        } else {
            const loginRes = await logIn(email, password);
            if (loginRes.error) {
                toast.error("Unable to login. Wrong credentials or server error.");
            } else {
                toast.success("Welcome! Admin.");
                setIsLoggedIn(true);
                fetchPools()
                const userObj = { userToken: loginRes.data.token, email: email }
                localStorage.setItem("loginStateToken", JSON.stringify(userObj))
            }
        }
    }

    const [isSearching, setIsSearching] = useState<Boolean>(false)
    const checkAuthState = () => {
        let token = JSON.parse(localStorage.getItem("loginStateToken") || '{}')
        if (!token.userToken) {
            setIsLoggedIn(false);
            localStorage.removeItem("loginStateToken")
        } else {
            setIsLoggedIn(true);
            setEmail(token.email)
            fetchPools()
        }

    }

    const handleLogout = async () => {
        logOut().then(() => {
            localStorage.removeItem("loginStateToken")
            setIsLoggedIn(false)
            toast.success("Logged out.")
        })

    }

    const handlePoolSearch = () => {
        if (poolQuery == "") {
            setIsSearching(false)
        } else {
            setIsSearching(true)
        }

        let matchedPools = allPools.filter(pool => pool.address == poolQuery)
        setResultPools([...matchedPools])
    }
    useEffect(() => {
        handlePoolSearch()
        checkAuthState()
        if (isLoggedIn) {
            fetchPools()
        }
    }, [poolQuery])

    const Pool = ({ props }: { props: any }) => {
        const setProjectStatusBgColor = () => {
            switch (props.status) {
                case "Live":
                    return "#1ACC78"
                    break;

                case "Coming soon":
                    return "blue"
                    break;

                case "Completed":
                    return "blue"
                    break;
                case "Finalized":
                    return "green"
                    break;
                case "Failed":
                    return "red"
                    break;
            }

        }
        return (
            <>
                <div className="wrapper">
                    <div className="admin_pool">
                        <div className="top">
                            <span className="pr_name">{props.name}</span>
                            <div className="pr_status" style={{
                                "backgroundColor": setProjectStatusBgColor()
                            }}>{props.status}</div>
                        </div>
                        <div className="mid">
                            <div className="btn x" onClick={() => handleVerification("AUDIT", props._id)}>Verify Audit</div>

                            <div className="btn y" onClick={() => handleVerification("KYC", props._id)}>Verify KYC</div>

                            <div className="btn z" onClick={() => handleVerification("SAFU", props._id)}>Verify SAFU</div>
                        </div>
                        <div className="btm">
                            <Link to={`/launch/${props._id}`} className="react_link">
                                <div className="btn_2 view">View</div>
                            </Link>

                            <div className="btn_2 cancel" onClick={() => handleCancelProject(props._id)}>Cancel</div>
                        </div>
                    </div>

                </div>
            </>
        )
    }

    return (
        <div className="admin">
            <Navbar />
            <main className="page_wrapper">
                {!isLoggedIn && <div className="login_form">
                    <form action="">
                        <title>Admin Login</title>
                        <div className="input_g">
                            <label htmlFor="email">Email</label>
                            <input type="text" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div className="input_g">
                            <label htmlFor="pass">Password</label>
                            <input type="password" id="pass" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <div className="loginbtn" onClick={handleLoginAdmin}>Login</div>
                    </form>
                </div>}
                {isLoggedIn && <>
                    <div className="top_s">
                        <span style={{ "maxWidth": "300px", "width": "50%", "wordWrap": "break-word", "display": "block", "overflow": "hidden" }}> {email} </span>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                    <header><h1>Pools</h1></header>
                    <div className="search_c">
                        <input type="text" placeholder="Paste project address" value={poolQuery} onChange={(e) => setPoolQuery(e.target.value)} />
                    </div>
                    <div className="admin_pools_wrapper">
                        {isSearching ? <>
                            {resultPools.length == 0 ?

                                <>
                                    <span style={{ "fontWeight": "bold", "color": "white" }}>No project found with that contract address</span>
                                </> : resultPools.map((eachPool, i) => {
                                    return (
                                        <>
                                            <Pool key={i} props={eachPool} />
                                        </>
                                    )
                                })
                            }
                        </> :

                            <>
                                {allPools.map((eachPool, i) => {
                                    return (
                                        <>
                                            <Pool key={i} props={eachPool} />
                                        </>
                                    )
                                })}</>
                        }

                    </div>
                </>}
            </main>
            <Footer />

        </div>
    )
}

export default Admin