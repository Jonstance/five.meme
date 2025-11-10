import Footer from "../../../components/Footer/Footer"
import Navbar from "../../../components/Navbar/Navbar"
import "./Page_2.css"
import { PresaleContext } from "../../../setup/context/PresaleContext"
import { useContext, useState, useCallback } from "react";
import { Link } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const scrollToTop = () => {
    window.scrollTo(0, 0)
}

const Page_2 = () => {
    const [hasCompletedForm, setHasCompletedForm] = useState<boolean>(false);
    const [isValidating, setIsValidating] = useState<boolean>(false);

    const presaleContext = useContext(PresaleContext);
    if (!presaleContext) {
        throw new Error('Page_2 must be used within a PresaleContext.Provider');
    }

    const {
        tokenName,
        tokenDecimal,
        tokenSymbol
    } = presaleContext;
    
    const { 
        presaleRate, setPresaleRate,
        whitelist, setWhitelist,
        softcap, setSoftcap,
        hardcap, setHardcap,
        minimumBuy, setMinimumBuy,
        maximumBuy, setMaximumBuy,
        refundType, setRefundType,
        router, setRouter,
        liquidity, setLiquidity,
        listingRate, setListingRate,
        startTime, setStartTime,
        endTime, setEndTime,
        vesting, setVesting,
        firstReleaseForPresale, setFirstReleaseForPresale,
        vestingPeriodEachCycle, setVestingPeriodEachCycle,
        presaleTokenReleaseEachCycle, setPresaleTokenReleaseEachCycle, // presaleTokenReleaseEachCycle is string type
        liquidityLockup, setLiquidityLockup,
    } = presaleContext

    // Validation helper functions
    const validateNumericField = (value: string, fieldName: string): boolean => {
        if (!value || value.trim() === "") {
            toast(`${fieldName} is required`);
            return false;
        }
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
            toast(`${fieldName} must be a positive number`);
            return false;
        }
        return true;
    };

    const validateSoftcapHardcap = (): boolean => {
        const softcapNum = parseFloat(String(softcap || '0'));
        const hardcapNum = parseFloat(String(hardcap || '0'));
        
        if (softcapNum >= hardcapNum) {
            toast("Softcap must be less than Hardcap");
            return false;
        }
        
        if (softcapNum < hardcapNum * 0.5) {
            toast("Softcap must be at least 50% of Hardcap");
            return false;
        }
        
        return true;
    };

    const validateBuyLimits = (): boolean => {
        const minBuy = parseFloat(String(minimumBuy || '0'));
        const maxBuy = parseFloat(String(maximumBuy || '0'));
        
        if (minBuy >= maxBuy) {
            toast("Minimum buy must be less than Maximum buy");
            return false;
        }
        
        return true;
    };

    const validateLiquidity = (): boolean => {
        const liquidityNum = parseFloat(String(liquidity || '0'));
        if (liquidityNum < 51 || liquidityNum > 100) {
            toast("Liquidity must be between 51% and 100%");
            return false;
        }
        return true;
    };

    const validateTimes = (): boolean => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();
        
        if (start <= now) {
            toast("Start time must be in the future");
            return false;
        }
        
        if (end <= start) {
            toast("End time must be after start time");
            return false;
        }
        
        return true;
    };

    const validateVesting = (): boolean => {
        if (!vesting) return true;
        
        if (!vestingPeriodEachCycle || String(vestingPeriodEachCycle).trim() === "") {
            toast("Vesting period is required when vesting is enabled");
            return false;
        }
        
        if (!presaleTokenReleaseEachCycle || String(presaleTokenReleaseEachCycle).trim() === "") {
            toast("Token release percentages are required when vesting is enabled");
            return false;
        }
        
        try {
            const percentages = String(presaleTokenReleaseEachCycle)
                .split(',')
                .map(item => {
                    const num = parseFloat(item.trim());
                    if (isNaN(num) || num <= 0) {
                        throw new Error("Invalid percentage value");
                    }
                    return num;
                });
            
            const total = percentages.reduce((sum, val) => sum + val, 0);
            
            if (Math.abs(total - 100) > 0.01) { // Allow for small floating point errors
                toast("Token release percentages must sum to exactly 100%");
                return false;
            }
            
        } catch (error) {
            toast("Invalid format for token release percentages. Use comma-separated numbers (e.g., 30,20,20,30)");
            return false;
        }
        
        return true;
    };

    const validateForm = useCallback(async () => {
        setIsValidating(true);
        
        try {
            // Basic field validations
            const validations = [
                () => validateNumericField(String(presaleRate), "Presale Rate"),
                () => validateNumericField(String(softcap), "Softcap"),
                () => validateNumericField(String(hardcap), "Hardcap"),
                () => validateNumericField(String(minimumBuy), "Minimum Buy"),
                () => validateNumericField(String(maximumBuy), "Maximum Buy"),
                () => validateNumericField(String(liquidity), "Liquidity"),
                () => validateNumericField(String(listingRate), "Listing Rate"),
                () => validateNumericField(String(liquidityLockup), "Liquidity Lockup"),
            ];
            
            // Check basic fields
            for (const validation of validations) {
                if (!validation()) {
                    return;
                }
            }
            
            // Check select fields
            if (!refundType) {
                toast("Please select a refund type");
                return;
            }
            
            if (!router || router === "unselected") {
                toast("Please select a router");
                return;
            }
            
            if (!startTime) {
                toast("Please select presale start time");
                return;
            }
            
            if (!endTime) {
                toast("Please select presale end time");
                return;
            }
            
            // Advanced validations
            if (!validateSoftcapHardcap()) return;
            if (!validateBuyLimits()) return;
            if (!validateLiquidity()) return;
            if (!validateTimes()) return;
            if (!validateVesting()) return;
            
            // If all validations pass
            setHasCompletedForm(true);
            toast.success("Form validated successfully!");
            
        } finally {
            setIsValidating(false);
        }
    }, [
        presaleRate, softcap, hardcap, minimumBuy, maximumBuy, 
        liquidity, listingRate, liquidityLockup, refundType, router,
        startTime, endTime, vesting, vestingPeriodEachCycle, 
        presaleTokenReleaseEachCycle
    ]);

    const handleVestingToggle = () => {
        setVesting(!vesting);
        if (vesting) {
            // Clear vesting fields when disabling
            setVestingPeriodEachCycle(0);
            setPresaleTokenReleaseEachCycle(0);
        }
    };

    return (
        <div className="page_2">
            <Navbar />
            <ToastContainer position="top-right" />
            <main className="page_main">
                <div className="items_wrapper">
                    <div className="form_section">
                        <span className="required_label">(*) is a required field</span>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Presale Rate</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    value={presaleRate} 
                                    onChange={(e) => setPresaleRate(parseFloat(e.target.value))}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <span className="group_2_note">
                                If I spend 1 BNB how many tokens will I receive?
                            </span>
                        </div>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Softcap (BNB)</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    value={softcap} 
                                    onChange={(e) => setSoftcap(parseFloat(e.target.value))}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <span className="group_2_note">
                                Softcap must be ≥ 50% of Hardcap
                            </span>
                        </div>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Minimum Buy (BNB)</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    value={minimumBuy} 
                                    onChange={(e) => setMinimumBuy(parseFloat(e.target.value))}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Refund Type</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <select 
                                    name="refund_type" 
                                    value={refundType} 
                                    onChange={(e) => setRefundType(e.target.value as "refund" | "burn")}
                                >
                                    <option value="refund">Refund</option>
                                    <option value="burn">Burn</option>
                                </select>
                            </div>
                        </div>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Router</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <select 
                                    name="router" 
                                    value={router} 
                                    onChange={(e) => setRouter(e.target.value)}
                                >
                                    <option value="unselected">--Select Router Exchange--</option>
                                    <option value="pancakeswap">PancakeSwap</option>
                                </select>
                            </div>
                        </div>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Liquidity (%)</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    value={liquidity} 
                                    onChange={(e) => setLiquidity(parseFloat(e.target.value))}
                                    min="51"
                                    max="100"
                                    step="0.01"
                                />
                            </div>
                            <span className="group_2_note">
                                Min 51%, Max 100%
                            </span>
                        </div>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Liquidity Lockup (days)</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    value={liquidityLockup} 
                                    onChange={(e) => setLiquidityLockup(parseFloat(e.target.value))}
                                    min="0"
                                    step="1"
                                />
                            </div>
                        </div>

                        <div className="vesting">
                            <input 
                                type="checkbox" 
                                checked={vesting} 
                                onChange={handleVestingToggle}
                                id="vesting-checkbox"
                            />
                            <label htmlFor="vesting-checkbox">
                                Using Vesting Contributor?
                            </label>
                        </div>

                        {vesting && (
                            <>
                                <div className="input_group_2">
                                    <div className="group_2_label">
                                        <span className="mt">Vesting Period Each Cycle (days)</span>
                                        <span className="ast">*</span>
                                    </div>
                                    <div className="group_2_input">
                                        <input 
                                            type="number" 
                                            placeholder="Enter days (e.g., 30)" 
                                            value={vestingPeriodEachCycle} 
                                            onChange={(e) => setVestingPeriodEachCycle(parseInt(e.target.value))}
                                            min="1"
                                            step="1"
                                        />
                                    </div>
                                </div>

                                <div className="input_group_2">
                                    <div className="group_2_label">
                                        <span className="mt">
                                            Token Release Each Cycle (%)
                                            <small> e.g., 30,20,20,30</small>
                                        </span>
                                        <span className="ast">*</span>
                                    </div>
                                    <div className="group_2_input">
                                        <input 
                                            type="text" 
                                            placeholder="e.g., 30,20,20,30" 
                                            value={presaleTokenReleaseEachCycle} 
                                            onChange={(e) => setPresaleTokenReleaseEachCycle(parseInt(e.target.value))}
                                        />
                                    </div>
                                    <span className="group_2_note">
                                        Values must sum to 100%
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="form_section">
                        <div className="input_group_3">
                            <div className="group_3_label">
                                <span className="mt">Whitelist</span>
                                <div className="whitelist_select">
                                    <div className="group" onClick={() => setWhitelist(false)}>
                                        <div className="outer">
                                            {!whitelist && <div className="inner"></div>}
                                        </div>
                                        <span className="group_text">Disable</span>
                                    </div>

                                    <div className="group" onClick={() => setWhitelist(true)}>
                                        <div className="outer">
                                            {whitelist && <div className="inner"></div>}
                                        </div>
                                        <span className="group_text">Enable</span>
                                    </div>
                                </div>
                                <span className="required_label">
                                    You can enable/disable whitelist anytime
                                </span>
                            </div>
                        </div>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Hardcap (BNB)</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    value={hardcap} 
                                    onChange={(e) => setHardcap(parseFloat(e.target.value))}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Maximum Buy (BNB)</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    value={maximumBuy} 
                                    onChange={(e) => setMaximumBuy(parseFloat(e.target.value))}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Listing Rate</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    value={listingRate} 
                                    onChange={(e) => setListingRate(parseInt(e.target.value))}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <span className="group_2_note_bold">
                                1 BNB = {listingRate || 0} {tokenSymbol}
                            </span>
                        </div>

                        <span className="required_label">
                            Enter the percentage of raised funds that should be allocated to liquidity (Min 51%, Max 100%)
                        </span>

                        <span className="required_label">
                            If I spend 1 BNB, how many tokens will I receive? Usually this amount is lower than presale rate to allow for a higher listing price
                        </span>

                        <span className="required_label_white">
                            Select start & end time (UTC) <span>*</span>
                        </span>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">Start Time (UTC)</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input 
                                    type="datetime-local" 
                                    value={startTime} 
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="input_group_2">
                            <div className="group_2_label">
                                <span className="mt">End Time (UTC)</span>
                                <span className="ast">*</span>
                            </div>
                            <div className="group_2_input">
                                <input 
                                    type="datetime-local" 
                                    value={endTime} 
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form_buttons">
                    <Link className="react_link" to="/Create_presale" onClick={scrollToTop}>
                        <button style={{ marginRight: "40px" }}>Back</button>
                    </Link>
                    
                    {!hasCompletedForm ? (
                        <button 
                            onClick={validateForm}
                            disabled={isValidating}
                            style={{ 
                                opacity: isValidating ? 0.7 : 1,
                                cursor: isValidating ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isValidating ? 'Validating...' : 'Next'}
                        </button>
                    ) : (
                        <Link className="react_link" to="/Create_presale_social_media" onClick={scrollToTop}>
                            <button style={{ background: 'green' }}>Next</button>
                        </Link>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default Page_2