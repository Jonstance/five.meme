import { useState, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ethers } from "ethers"
import WalletContext from "../../setup/context/walletContext"
import Navbar from "../../components/Navbar/Navbar"
import Footer from "../../components/Footer/Footer"
import StandardTokenFactory from "../../ABIs/StandardTokenFactory.json"
import { getSigner } from "../../utility/getSigner"

const CreateToken = () => {
  const walletContext = useContext(WalletContext)
  if (!walletContext) {
    throw new Error("WalletContext is undefined")
  }
  
  const { wallet } = walletContext
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    totalSupply: "",
    decimals: "18",
    mintable: false,
    burnable: false,
    pausable: false
  })
  
  // UI state
  const [currentStep, setCurrentStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [createdToken, setCreatedToken] = useState<any>(null)
  const [errors, setErrors] = useState<any>({})
  const [estimatedCost, setEstimatedCost] = useState("0.01")

  // Validation
  const validateStep = (step: number) => {
    const newErrors: any = {}
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Token name is required"
      if (formData.name.length > 50) newErrors.name = "Token name must be under 50 characters"
      
      if (!formData.symbol.trim()) newErrors.symbol = "Token symbol is required"
      if (formData.symbol.length > 10) newErrors.symbol = "Symbol must be under 10 characters"
      if (!/^[A-Z0-9]+$/.test(formData.symbol)) newErrors.symbol = "Symbol must contain only uppercase letters and numbers"
    }
    
    if (step === 2) {
      if (!formData.totalSupply) newErrors.totalSupply = "Total supply is required"
      if (parseFloat(formData.totalSupply) <= 0) newErrors.totalSupply = "Total supply must be greater than 0"
      if (parseFloat(formData.totalSupply) > 1000000000000) newErrors.totalSupply = "Total supply too large"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const createToken = async () => {
    if (!validateStep(2)) return
    
    try {
      setIsCreating(true)
      const signer = await getSigner()
      
      const factory = new ethers.Contract(
        "0x...", // Add your factory contract address
        StandardTokenFactory.abi,
        signer
      )
      
      const tx = await factory.createToken(
        formData.name,
        formData.symbol,
        formData.decimals,
        ethers.parseUnits(formData.totalSupply, formData.decimals),
        formData.mintable,
        formData.burnable,
        formData.pausable,
        { value: ethers.parseEther("0.01") }
      )
      
      const receipt = await tx.wait()
      
      // Extract token address from logs
      const tokenAddress = receipt.logs[0].address
      
      setCreatedToken({
        address: tokenAddress,
        name: formData.name,
        symbol: formData.symbol,
        totalSupply: formData.totalSupply,
        txHash: receipt.hash
      })
      
      setCurrentStep(3)
    } catch (error) {
      console.error("Token creation failed:", error)
      alert("Token creation failed. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0f', 
      color: '#ffffff',
      fontFamily: "'Inter', sans-serif"
    }}>
      <Navbar />
      
      {/* Header Section */}
      <section style={{
        padding: '8rem 2rem 4rem 2rem',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a1f 100%)',
        textAlign: 'center'
      }}>
        <motion.h1 
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #f3ba2f, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Create Your Meme Token
        </motion.h1>
        <motion.p 
          style={{
            fontSize: '1.2rem',
            color: '#e5e5e5',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Launch your meme token in minutes with our no-code solution. Fast, secure, and affordable.
        </motion.p>
      </section>

      {/* Progress Steps */}
      <section style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem',
            position: 'relative'
          }}>
            {/* Progress Line */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '0',
              right: '0',
              height: '2px',
              background: '#27272a',
              zIndex: 1
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #f3ba2f, #8b5cf6)',
                width: `${((currentStep - 1) / 2) * 100}%`,
                transition: 'width 0.3s ease'
              }}></div>
            </div>

            {/* Step Indicators */}
            {[1, 2, 3].map((step) => (
              <div key={step} style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: step <= currentStep 
                    ? 'linear-gradient(135deg, #f3ba2f, #8b5cf6)' 
                    : '#27272a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  color: step <= currentStep ? '#000' : '#666',
                  transition: 'all 0.3s ease'
                }}>
                  {step}
                </div>
                <span style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: step <= currentStep ? '#f3ba2f' : '#666'
                }}>
                  {step === 1 ? 'Token Info' : step === 2 ? 'Supply & Features' : 'Deploy'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section style={{ padding: '0 2rem 4rem 2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <motion.div
            style={{
              background: 'linear-gradient(135deg, #141419, #1a1a1f)',
              border: '1px solid #27272a',
              borderRadius: '1.5rem',
              padding: '3rem',
              position: 'relative',
              overflow: 'hidden'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Token Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 style={{
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: '#f3ba2f',
                    marginBottom: '2rem',
                    textAlign: 'center'
                  }}>
                    Token Information
                  </h2>

                  {/* Token Name */}
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#e5e5e5',
                      marginBottom: '0.75rem'
                    }}>
                      Token Name <span style={{ color: '#f3ba2f' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., DogeCoin Moon"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: errors.name ? '2px solid #ef4444' : '2px solid #27272a',
                        background: '#0a0a0f',
                        color: '#ffffff',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => {
                        if (!errors.name) e.target.style.borderColor = '#f3ba2f'
                      }}
                      onBlur={(e) => {
                        if (!errors.name) e.target.style.borderColor = '#27272a'
                      }}
                    />
                    {errors.name && (
                      <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>
                        {errors.name}
                      </span>
                    )}
                  </div>

                  {/* Token Symbol */}
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#e5e5e5',
                      marginBottom: '0.75rem'
                    }}>
                      Token Symbol <span style={{ color: '#f3ba2f' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.symbol}
                      onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                      placeholder="e.g., DOGE"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: errors.symbol ? '2px solid #ef4444' : '2px solid #27272a',
                        background: '#0a0a0f',
                        color: '#ffffff',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => {
                        if (!errors.symbol) e.target.style.borderColor = '#f3ba2f'
                      }}
                      onBlur={(e) => {
                        if (!errors.symbol) e.target.style.borderColor = '#27272a'
                      }}
                    />
                    {errors.symbol && (
                      <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>
                        {errors.symbol}
                      </span>
                    )}
                    <span style={{ color: '#a1a1aa', fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>
                      3-10 characters, uppercase letters and numbers only
                    </span>
                  </div>

                  {/* Next Button */}
                  <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <motion.button
                      onClick={nextStep}
                      style={{
                        background: 'linear-gradient(135deg, #f3ba2f, #fbbf24)',
                        color: '#000',
                        padding: '1rem 3rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue to Supply Settings
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Supply & Features */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 style={{
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: '#f3ba2f',
                    marginBottom: '2rem',
                    textAlign: 'center'
                  }}>
                    Supply & Features
                  </h2>

                  {/* Total Supply */}
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#e5e5e5',
                      marginBottom: '0.75rem'
                    }}>
                      Total Supply <span style={{ color: '#f3ba2f' }}>*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.totalSupply}
                      onChange={(e) => handleInputChange('totalSupply', e.target.value)}
                      placeholder="e.g., 1000000000"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: errors.totalSupply ? '2px solid #ef4444' : '2px solid #27272a',
                        background: '#0a0a0f',
                        color: '#ffffff',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => {
                        if (!errors.totalSupply) e.target.style.borderColor = '#f3ba2f'
                      }}
                      onBlur={(e) => {
                        if (!errors.totalSupply) e.target.style.borderColor = '#27272a'
                      }}
                    />
                    {errors.totalSupply && (
                      <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>
                        {errors.totalSupply}
                      </span>
                    )}
                  </div>

                  {/* Decimals */}
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#e5e5e5',
                      marginBottom: '0.75rem'
                    }}>
                      Decimals
                    </label>
                    <select
                      value={formData.decimals}
                      onChange={(e) => handleInputChange('decimals', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: '2px solid #27272a',
                        background: '#0a0a0f',
                        color: '#ffffff',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    >
                      <option value="9">9 (Standard)</option>
                      <option value="18">18 (Ethereum Standard)</option>
                    </select>
                  </div>

                  {/* Token Features */}
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#e5e5e5',
                      marginBottom: '1rem'
                    }}>
                      Token Features (Optional)
                    </h3>
                    
                    {[
                      { key: 'mintable', label: 'Mintable', desc: 'Allow creating new tokens after deployment' },
                      { key: 'burnable', label: 'Burnable', desc: 'Allow tokens to be permanently destroyed' },
                      { key: 'pausable', label: 'Pausable', desc: 'Allow pausing token transfers' }
                    ].map((feature) => (
                      <div key={feature.key} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: '1px solid #27272a',
                        marginBottom: '1rem',
                        background: formData[feature.key as keyof typeof formData] ? '#1a1a1f' : 'transparent'
                      }}>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#e5e5e5' }}>
                            {feature.label}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>
                            {feature.desc}
                          </div>
                        </div>
                        <label style={{ cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={formData[feature.key as keyof typeof formData] as boolean}
                            onChange={(e) => handleInputChange(feature.key, e.target.checked)}
                            style={{ display: 'none' }}
                          />
                          <div style={{
                            width: '48px',
                            height: '24px',
                            borderRadius: '12px',
                            background: formData[feature.key as keyof typeof formData] 
                              ? 'linear-gradient(135deg, #f3ba2f, #fbbf24)' 
                              : '#27272a',
                            position: 'relative',
                            transition: 'all 0.3s ease'
                          }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              position: 'absolute',
                              top: '2px',
                              left: formData[feature.key as keyof typeof formData] ? '26px' : '2px',
                              transition: 'all 0.3s ease'
                            }}></div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Cost Display */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1a1a1f, #141419)',
                    border: '1px solid #f3ba2f',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>
                      Estimated Cost
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f3ba2f' }}>
                      {estimatedCost} BNB
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#a1a1aa', marginTop: '0.5rem' }}>
                      + gas fees
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                    <motion.button
                      onClick={prevStep}
                      style={{
                        background: 'transparent',
                        color: '#e5e5e5',
                        padding: '1rem 2rem',
                        borderRadius: '0.75rem',
                        border: '2px solid #27272a',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        flex: 1
                      }}
                      whileHover={{ borderColor: '#f3ba2f' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      onClick={createToken}
                      disabled={isCreating || !wallet}
                      style={{
                        background: isCreating || !wallet 
                          ? '#27272a' 
                          : 'linear-gradient(135deg, #f3ba2f, #fbbf24)',
                        color: isCreating || !wallet ? '#666' : '#000',
                        padding: '1rem 2rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: isCreating || !wallet ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        flex: 2
                      }}
                      whileHover={!isCreating && wallet ? { scale: 1.02 } : {}}
                      whileTap={!isCreating && wallet ? { scale: 0.98 } : {}}
                    >
                      {isCreating ? 'Creating Token...' : !wallet ? 'Connect Wallet' : 'Create Token 🚀'}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Success */}
              {currentStep === 3 && createdToken && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                  <h2 style={{
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: '#f3ba2f',
                    marginBottom: '1rem'
                  }}>
                    Token Created Successfully!
                  </h2>
                  <p style={{
                    fontSize: '1.1rem',
                    color: '#e5e5e5',
                    marginBottom: '2rem',
                    lineHeight: '1.6'
                  }}>
                    Your token <strong>{createdToken.name} ({createdToken.symbol})</strong> has been deployed to the blockchain.
                  </p>

                  {/* Token Details */}
                  <div style={{
                    background: '#0a0a0f',
                    border: '1px solid #27272a',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: '#a1a1aa' }}>Token Address:</span>
                      <span style={{ color: '#f3ba2f', fontWeight: '600', fontSize: '0.9rem' }}>
                        {createdToken.address.slice(0, 6)}...{createdToken.address.slice(-4)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: '#a1a1aa' }}>Total Supply:</span>
                      <span style={{ color: '#e5e5e5', fontWeight: '600' }}>
                        {parseInt(createdToken.totalSupply).toLocaleString()} {createdToken.symbol}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#a1a1aa' }}>Transaction:</span>
                      <a 
                        href={`https://bscscan.com/tx/${createdToken.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3b82f6', textDecoration: 'none' }}
                      >
                        View on BSCScan ↗
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <motion.button
                      onClick={() => navigator.clipboard.writeText(createdToken.address)}
                      style={{
                        background: 'linear-gradient(135deg, #f3ba2f, #fbbf24)',
                        color: '#000',
                        padding: '1rem 2rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      📋 Copy Token Address
                    </motion.button>
                    <motion.a
                      href="/Create_presale"
                      style={{
                        display: 'block',
                        background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                        color: '#ffffff',
                        padding: '1rem 2rem',
                        borderRadius: '0.75rem',
                        textDecoration: 'none',
                        fontSize: '1rem',
                        fontWeight: '700',
                        textAlign: 'center'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🚀 Create Presale for This Token
                    </motion.a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default CreateToken