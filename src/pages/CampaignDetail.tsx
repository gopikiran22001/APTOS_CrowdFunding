import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { 
  Heart, 
  Share2, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useBlockchain, Campaign } from '../hooks/useBlockchain';
import toast from 'react-hot-toast';

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { connected, account } = useWallet();
  const { 
    loading, 
    currentCampaign, 
    loadCampaign, 
    donateToCampaign,
    getDonorCount,
    getCampaignStatus
  } = useBlockchain();
  
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'updates' | 'backers'>('overview');
  const [donorCount, setDonorCount] = useState(0);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<number | null>(null);

  // Load user's APT balance using smart contract view function
  const loadUserBalance = async () => {
    if (!connected || !account) return;
    
    try {
      console.log('Loading balance for address:', account.address.toString());
      
      const aptosClient = new (await import('aptos')).AptosClient(
        process.env.REACT_APP_APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com'
      );
      
      // Use the smart contract view function to get balance
      const payload = {
        function: `${process.env.REACT_APP_MODULE_ADDRESS}::crowdfunding::get_signer_balance`,
        type_arguments: [],
        arguments: [account.address.toString()]
      };
      
      console.log('Calling view function with payload:', payload);
      
      const response = await aptosClient.view(payload);
      console.log('View function response:', response);
      
      if (response && response.length > 0) {
        const balanceInOctas = parseInt(response[0] as string);
        console.log('Balance in octas from smart contract:', balanceInOctas);
        setUserBalance(balanceInOctas);
      } else {
        console.log('No balance returned from view function');
        setUserBalance(0);
      }
    } catch (error) {
      console.error('Error loading user balance:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error type'
      });
      setUserBalance(null);
    }
  };

  // Load user balance when wallet connection changes
  useEffect(() => {
    if (connected && account) {
      loadUserBalance();
    } else {
      setUserBalance(null);
    }
  }, [connected, account]);

  // Load campaign data when component mounts
  useEffect(() => {
    if (id) {
      const campaignId = parseInt(id);
      if (!isNaN(campaignId)) {
        console.log('Loading campaign with ID:', campaignId);
        setCampaignLoading(true);
        setCampaignError(null);
        
        loadCampaign(campaignId).then((campaign) => {
          console.log('Campaign loaded:', campaign);
          setCampaignLoading(false);
          if (campaign) {
            getDonorCount(campaignId).then(setDonorCount);
          } else {
            setCampaignError('Failed to load campaign data');
          }
        }).catch((error) => {
          console.error('Error loading campaign:', error);
          setCampaignLoading(false);
          setCampaignError('Failed to load campaign data');
        });
      } else {
        setCampaignError('Invalid campaign ID');
        setCampaignLoading(false);
      }
    }
  }, [id, loadCampaign, getDonorCount]);

  const getStatusBadge = (campaign: Campaign) => {
    const status = getCampaignStatus(campaign);
    
    const statusConfig = {
      pending: { text: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
      active: { text: 'Active', class: 'bg-green-100 text-green-800' },
      successful: { text: 'Successful', class: 'bg-blue-100 text-blue-800' },
      expired: { text: 'Expired', class: 'bg-red-100 text-red-800' },
      closed: { text: 'Closed', class: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getProgressPercentage = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return `${amount.toLocaleString()} APT`;
  };

  const getDaysLeft = (deadline: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (24 * 60 * 60));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!currentCampaign) {
      toast.error('Campaign not found');
      return;
    }
    
    if (getCampaignStatus(currentCampaign) !== 'active') {
      toast.error('This campaign is not active for donations');
      return;
    }
    
    // Debug logging
    console.log('Donation amount input:', donationAmount);
    console.log('Donation amount type:', typeof donationAmount);
    console.log('Parsed donation amount:', parseFloat(donationAmount));
    
    // Convert donation amount to octas (1 APT = 100,000,000 octas)
    const donationAmountInOctas = Math.floor(parseFloat(donationAmount) * 100000000);
    
    console.log('Donation amount in octas:', donationAmountInOctas);
    console.log('Donation amount in APT (calculated back):', donationAmountInOctas / 100000000);
    
    if (donationAmountInOctas < 10000000) { // 0.1 APT minimum
      toast.error('Minimum donation is 0.1 APT');
      return;
    }
    
    // Prevent extremely large amounts (more than 1000 APT)
    if (donationAmountInOctas > 100000000000000) { // 1000 APT maximum
      toast.error('Maximum donation is 1000 APT. Please enter a smaller amount.');
      return;
    }
    
    // Check if user has enough balance (including gas fees)
    const estimatedGasFees = 5000000; // 0.05 APT in octas for gas
    const totalRequired = donationAmountInOctas + estimatedGasFees;
    
    console.log('Estimated gas fees (octas):', estimatedGasFees);
    console.log('Total required (octas):', totalRequired);
    console.log('User balance (octas):', userBalance);
    
    if (userBalance !== null && userBalance < totalRequired) {
      toast.error(`Insufficient balance. You need ${(parseFloat(donationAmount) + 0.05).toFixed(6)} APT (${donationAmount} APT + ~0.05 APT gas)`);
      return;
    }
    
    toast.loading('Processing donation on blockchain...', { id: 'donation' });
    
    try {
      console.log('Calling donateToCampaign with:', {
        campaignId: currentCampaign.id,
        amountInOctas: donationAmountInOctas,
        amountInAPT: donationAmountInOctas / 100000000
      });
      
      const success = await donateToCampaign(currentCampaign.id, donationAmountInOctas);
      
      if (success) {
        toast.success('Donation successful! Transaction confirmed on blockchain.', { id: 'donation' });
        setDonationAmount('');
        setDonationMessage('');
        
        // Reload campaign data and user balance
        if (id) {
          await loadCampaign(parseInt(id));
          await getDonorCount(parseInt(id)).then(setDonorCount);
        }
        await loadUserBalance();
      }
    } catch (error) {
      console.error('Error in donation:', error);
      toast.error('Failed to process donation. Please try again.', { id: 'donation' });
    } finally {
      toast.dismiss();
    }
  };

  const shareCampaign = () => {
    if (navigator.share) {
      navigator.share({
        title: currentCampaign?.title,
        text: currentCampaign?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Campaign link copied to clipboard!');
    }
  };

  if (campaignLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (campaignError) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Error Loading Campaign</h2>
        <p className="text-gray-500 mb-6">{campaignError}</p>
        <button onClick={() => navigate('/campaigns')} className="btn-primary">
          Back to Campaigns
        </button>
      </div>
    );
  }

  if (!currentCampaign) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Campaign Not Found</h2>
        <p className="text-gray-500 mb-6">The campaign you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/campaigns')} className="btn-primary">
          Back to Campaigns
        </button>
      </div>
    );
  }

  const daysLeft = getDaysLeft(currentCampaign.deadline_secs);
  const progressPercentage = getProgressPercentage(currentCampaign.raised_amount, currentCampaign.target_amount);
  const status = getCampaignStatus(currentCampaign);

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/campaigns')}
        className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Campaigns</span>
      </button>

      {/* Campaign Header */}
      <div className="card p-0 overflow-hidden">
        <div className="relative">
          {currentCampaign.image_url ? (
            <img
              src={currentCampaign.image_url}
              alt={currentCampaign.title}
              className="w-full h-64 md:h-80 object-cover"
            />
          ) : (
            <div className="w-full h-64 md:h-80 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute top-4 right-4">
            {getStatusBadge(currentCampaign)}
          </div>
          <div className="absolute bottom-4 right-4">
            <button
              onClick={shareCampaign}
              className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {currentCampaign.title}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {currentCampaign.description}
          </p>

          {/* Campaign Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {formatAmount(currentCampaign.raised_amount)}
              </div>
              <div className="text-sm text-gray-600">Raised</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatAmount(currentCampaign.target_amount)}
              </div>
              <div className="text-sm text-gray-600">Goal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {donorCount}
              </div>
              <div className="text-sm text-gray-600">Backers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {daysLeft}
              </div>
              <div className="text-sm text-gray-600">Days Left</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{progressPercentage.toFixed(1)}% funded</span>
              <span>{daysLeft} days left</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* NFT Mode Indicator */}
          {currentCampaign.nft_mode && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center text-purple-700">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium">NFT Mode</span>
                <span className="ml-2 text-xs">${currentCampaign.nft_unit_price} per NFT</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {status === 'active' && (
              <button
                onClick={() => document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary flex-1"
              >
                <Heart className="w-5 h-5 mr-2" />
                Support This Project
              </button>
            )}
            <button
              onClick={shareCampaign}
              className="btn-secondary flex-1"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Content Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {['overview', 'updates', 'backers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">About This Project</h3>
              <p className="text-gray-600 leading-relaxed">
                {currentCampaign.description}
              </p>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Campaign Details</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div><strong>Organizer:</strong> {currentCampaign.organizer.slice(0, 6)}...{currentCampaign.organizer.slice(-4)}</div>
                    <div><strong>Created:</strong> {formatDate(currentCampaign.deadline_secs - (30 * 24 * 60 * 60))}</div>
                    <div><strong>Deadline:</strong> {formatDate(currentCampaign.deadline_secs)}</div>
                    <div><strong>Status:</strong> {getStatusBadge(currentCampaign)}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Funding Progress</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div><strong>Target:</strong> {formatAmount(currentCampaign.target_amount)}</div>
                    <div><strong>Raised:</strong> {formatAmount(currentCampaign.raised_amount)}</div>
                    <div><strong>Progress:</strong> {progressPercentage.toFixed(1)}%</div>
                    <div><strong>Backers:</strong> {donorCount}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'updates' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Updates</h3>
              <p className="text-gray-500 text-center py-8">No updates yet. Check back soon!</p>
            </div>
          )}

          {activeTab === 'backers' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Backers</h3>
              <p className="text-gray-500 text-center py-8">No backers yet. Be the first to support this project!</p>
            </div>
          )}
        </div>
      </div>

      {/* Donation Form */}
      {currentCampaign && getCampaignStatus(currentCampaign) === 'active' && (
        <div id="donation-form" className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Support This Project</h3>
          
          {/* Donation Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Blockchain Donation</p>
                <p className="mt-1">
                  Your donation will be processed as a real blockchain transaction. 
                  APT coins will be transferred directly from your wallet to the campaign organizer's wallet. 
                  Make sure you have sufficient APT for both the donation amount and gas fees.
                </p>
                <p className="mt-2 text-blue-600">
                  💡 <strong>Need testnet APT?</strong> Use the Petra wallet faucet or visit{' '}
                  <a
                    href="https://aptoslabs.com/testnet-faucet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-800"
                  >
                    Aptos Testnet Faucet
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* User Balance Display */}
          {connected && (
            <>
              {userBalance !== null && userBalance > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-700 font-medium">Your Balance:</span>
                      <span className="text-green-900 font-bold">{userBalance.toLocaleString()} octas</span>
                      <span className="text-green-600 text-sm">({(userBalance / 100000000).toFixed(6)} APT)</span>
                    </div>
                    <button
                      onClick={loadUserBalance}
                      className="text-green-600 hover:text-green-800 text-sm underline"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              )}

              {userBalance === null && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-700 font-medium">Balance Loading...</span>
                    </div>
                    <button
                      onClick={loadUserBalance}
                      className="text-yellow-600 hover:text-yellow-800 text-sm underline"
                    >
                      Retry
                    </button>
                  </div>
                  <p className="text-yellow-600 text-sm mt-1">
                    Unable to load balance. Please try refreshing the page.
                  </p>
                </div>
              )}

              {userBalance === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-700 font-medium">No Balance</span>
                    </div>
                    <button
                      onClick={loadUserBalance}
                      className="text-red-600 hover:text-red-800 text-sm underline"
                    >
                      Refresh
                    </button>
                  </div>
                  <p className="text-red-600 text-sm mt-1">
                    You need APT coins to make a donation. Get testnet APT from the faucet.
                  </p>
                  <div className="mt-2">
                    <a
                      href="https://aptoslabs.com/testnet-faucet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-800 text-sm underline"
                    >
                      Aptos Testnet Faucet →
                    </a>
                  </div>
                </div>
              )}
            </>
          )}

          <form onSubmit={handleDonation} className="space-y-4">
            <div>
              <label htmlFor="donationAmount" className="form-label">
                Donation Amount (APT) *
              </label>
              <input
                type="number"
                id="donationAmount"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                step="0.1"
                min="0.1"
                max="1000"
                required
                className="input-field"
                placeholder="Enter amount in APT"
              />
              <p className="text-xs text-gray-600 mt-1">
                Minimum: 0.1 APT • Maximum: 1000 APT • Gas fees: ~0.05 APT • Amount will be converted to octas
              </p>
            </div>

            <div>
              <label htmlFor="donationMessage" className="form-label">
                Message (Optional)
              </label>
              <textarea
                id="donationMessage"
                value={donationMessage}
                onChange={(e) => setDonationMessage(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="Leave a message of support..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || !connected || !currentCampaign || getCampaignStatus(currentCampaign) !== 'active'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? (
                'Processing on Blockchain...'
              ) : (
                `Make Donation (${donationAmount ? parseFloat(donationAmount) : 0} APT)`
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CampaignDetail; 