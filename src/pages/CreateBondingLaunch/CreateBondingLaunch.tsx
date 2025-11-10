import React, { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './CreateBondingLaunch.scss';

interface FormData {
  name: string;
  symbol: string;
  totalSupply: string;
  logoUrl: string;
  description: string;
  website: string;
  twitter: string;
  telegram: string;
  discord: string;
}

const CreateBondingLaunch: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    symbol: '',
    totalSupply: '1000000000', // 1 billion default
    logoUrl: '',
    description: '',
    website: '',
    twitter: '',
    telegram: '',
    discord: ''
  });

  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.symbol || !formData.totalSupply) {
          toast.error('Please fill in all required token details');
          return false;
        }
        if (parseFloat(formData.totalSupply) <= 0) {
          toast.error('Total supply must be greater than 0');
          return false;
        }
        return true;
      case 2:
        if (!formData.description) {
          toast.error('Please provide a token description');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleCreate = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!validateStep(currentStep)) return;

    setIsCreating(true);

    try {
      // Get provider and signer
      const provider = new ethers.providers.Web3Provider(walletClient as any);
      const signer = provider.getSigner();

      // Import factory ABI and address
      const BondingCurveFactory = require('../../ABIs/BondingCurveFactory.json');
      const FACTORY_ADDRESS = "0x..."; // TODO: Update with deployed address

      // Create contract instance
      const factoryContract = new ethers.Contract(
        FACTORY_ADDRESS,
        BondingCurveFactory.abi,
        signer
      );

      // Prepare parameters
      const totalSupplyWei = ethers.utils.parseEther(formData.totalSupply);
      const creationFee = ethers.utils.parseEther("0.01"); // 0.01 BNB

      toast.info('Creating launch... Please confirm the transaction');

      // Call createLaunch
      const tx = await factoryContract.createLaunch(
        formData.name,
        formData.symbol,
        totalSupplyWei,
        formData.logoUrl || 'https://via.placeholder.com/100',
        formData.description,
        formData.website || '',
        formData.twitter || '',
        formData.telegram || '',
        formData.discord || '',
        { value: creationFee }
      );

      toast.info('Transaction submitted. Waiting for confirmation...');

      const receipt = await tx.wait();

      // Find LaunchCreated event
      const event = receipt.events?.find((e: any) => e.event === 'LaunchCreated');

      if (event) {
        const launchAddress = event.args.launchAddress;
        const tokenAddress = event.args.token;

        toast.success('Launch created successfully! 🎉');

        // Navigate to the new launch page
        setTimeout(() => {
          navigate(`/launch/${launchAddress}`);
        }, 2000);
      } else {
        toast.success('Launch created successfully!');
      }

    } catch (error: any) {
      console.error('Error creating launch:', error);

      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient BNB for gas + creation fee (0.01 BNB)');
      } else {
        toast.error(error?.message || 'Failed to create launch');
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="create-bonding-launch">
      <Navbar />

      <div className="create-container">
        {/* Header */}
        <div className="create-header">
          <h1>Launch Your Token</h1>
          <p>Create a bonding curve launch in minutes</p>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Token Details</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Description</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Social Links</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Review & Launch</div>
          </div>
        </div>

        {/* Form Card */}
        <div className="form-card">
          {/* Step 1: Token Details */}
          {currentStep === 1 && (
            <div className="form-step">
              <h2>Token Details</h2>
              <p className="step-description">Basic information about your token</p>

              <div className="form-group">
                <label>Token Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., My Awesome Token"
                  value={formData.name}
                  onChange={handleInputChange}
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label>Token Symbol *</label>
                <input
                  type="text"
                  name="symbol"
                  placeholder="e.g., MAT"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  maxLength={10}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group">
                <label>Total Supply *</label>
                <input
                  type="number"
                  name="totalSupply"
                  placeholder="1000000000"
                  value={formData.totalSupply}
                  onChange={handleInputChange}
                  min="1"
                />
                <div className="form-hint">Recommended: 1 billion tokens</div>
              </div>

              <div className="form-group">
                <label>Logo URL</label>
                <input
                  type="url"
                  name="logoUrl"
                  placeholder="https://example.com/logo.png"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                />
                <div className="form-hint">PNG or JPG, recommended 512x512px</div>
              </div>
            </div>
          )}

          {/* Step 2: Description */}
          {currentStep === 2 && (
            <div className="form-step">
              <h2>Token Description</h2>
              <p className="step-description">Tell the world about your token</p>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  placeholder="Describe your token, its purpose, and what makes it unique..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  maxLength={500}
                />
                <div className="form-hint">{formData.description.length}/500 characters</div>
              </div>
            </div>
          )}

          {/* Step 3: Social Links */}
          {currentStep === 3 && (
            <div className="form-step">
              <h2>Social Links</h2>
              <p className="step-description">Connect your community (optional but recommended)</p>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  placeholder="https://yourproject.com"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Twitter</label>
                <input
                  type="url"
                  name="twitter"
                  placeholder="https://twitter.com/yourproject"
                  value={formData.twitter}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Telegram</label>
                <input
                  type="url"
                  name="telegram"
                  placeholder="https://t.me/yourproject"
                  value={formData.telegram}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Discord</label>
                <input
                  type="url"
                  name="discord"
                  placeholder="https://discord.gg/yourproject"
                  value={formData.discord}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="form-step">
              <h2>Review & Launch</h2>
              <p className="step-description">Double-check everything before launching</p>

              <div className="review-section">
                <h3>Token Information</h3>
                <div className="review-item">
                  <span className="label">Name:</span>
                  <span className="value">{formData.name}</span>
                </div>
                <div className="review-item">
                  <span className="label">Symbol:</span>
                  <span className="value">{formData.symbol.toUpperCase()}</span>
                </div>
                <div className="review-item">
                  <span className="label">Total Supply:</span>
                  <span className="value">{parseFloat(formData.totalSupply).toLocaleString()} tokens</span>
                </div>
                <div className="review-item">
                  <span className="label">Description:</span>
                  <span className="value">{formData.description}</span>
                </div>
              </div>

              <div className="review-section">
                <h3>Launch Details</h3>
                <div className="review-item">
                  <span className="label">Launch Type:</span>
                  <span className="value">Bonding Curve</span>
                </div>
                <div className="review-item">
                  <span className="label">Trading Fee:</span>
                  <span className="value">1%</span>
                </div>
                <div className="review-item">
                  <span className="label">Anti-Sniping:</span>
                  <span className="value">Yes (first 3 blocks)</span>
                </div>
                <div className="review-item">
                  <span className="label">Rush Mode:</span>
                  <span className="value">10 minutes</span>
                </div>
                <div className="review-item">
                  <span className="label">Graduation Target:</span>
                  <span className="value">80% sold → PancakeSwap</span>
                </div>
              </div>

              <div className="cost-summary">
                <h3>Cost Summary</h3>
                <div className="cost-item">
                  <span>Creation Fee</span>
                  <span className="amount">0.01 BNB</span>
                </div>
                <div className="cost-item">
                  <span>Estimated Gas</span>
                  <span className="amount">~0.005 BNB</span>
                </div>
                <div className="cost-total">
                  <span>Total Estimate</span>
                  <span className="amount">~0.015 BNB</span>
                </div>
              </div>

              <div className="warning-box">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>Once launched, token details cannot be changed</li>
                  <li>Tokens will be tradeable immediately on bonding curve</li>
                  <li>At 80% supply sold, tokens automatically list on PancakeSwap</li>
                  <li>You will be the contract owner with admin privileges</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-actions">
            {currentStep > 1 && (
              <button
                className="btn-secondary"
                onClick={handleBack}
                disabled={isCreating}
              >
                Back
              </button>
            )}

            {currentStep < 4 ? (
              <button
                className="btn-primary"
                onClick={handleNext}
              >
                Next Step
              </button>
            ) : (
              <button
                className="btn-launch"
                onClick={handleCreate}
                disabled={isCreating || !isConnected}
              >
                {!isConnected ? 'Connect Wallet' :
                 isCreating ? 'Creating Launch...' :
                 '🚀 Create Launch (0.01 BNB)'}
              </button>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="info-cards">
          <div className="info-card">
            <div className="icon">⚡</div>
            <h3>Instant Trading</h3>
            <p>Your token is tradeable immediately on the bonding curve</p>
          </div>
          <div className="info-card">
            <div className="icon">📈</div>
            <h3>Fair Launch</h3>
            <p>No presale, everyone buys at the same bonding curve price</p>
          </div>
          <div className="info-card">
            <div className="icon">🎓</div>
            <h3>Auto DEX Listing</h3>
            <p>Automatically lists on PancakeSwap when 80% sold</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateBondingLaunch;
