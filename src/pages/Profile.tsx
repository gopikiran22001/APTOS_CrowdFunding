import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Heart, 
  Plus, 
  Settings, 
  ExternalLink, 
  Calendar,
  Target,
  TrendingUp,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react';
import { blockchainService } from '../services/blockchainService';

interface Campaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  deadline: Date;
  status: 'pending' | 'active' | 'successful' | 'failed' | 'closed' | 'rejected';
  imageUrl?: string;
}

interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  timestamp: Date;
  message?: string;
}

const Profile: React.FC = () => {
  const { connected, account } = useWallet();
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'donations'>('overview');
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([]);
  const [userDonations, setUserDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user data from blockchain
  useEffect(() => {
    const loadUserData = async () => {
      if (!connected || !account) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const walletAddress = account.address.toString();
        
        // Get user profile from blockchain
        const userProfile = await blockchainService.getUserProfile(walletAddress);
        
        // Get campaigns created by user
        const userCampaignsData: Campaign[] = [];
        for (const campaignId of userProfile.campaigns_created) {
          try {
            const campaign = await blockchainService.getCampaign(campaignId);
            if (campaign) {
              userCampaignsData.push({
                id: campaign.id.toString(),
                title: campaign.title,
                description: campaign.description,
                goalAmount: campaign.target_amount / 100000000, // Convert from octas to APT
                raisedAmount: campaign.raised_amount / 100000000, // Convert from octas to APT
                deadline: new Date(campaign.deadline_secs * 1000),
                status: campaign.approved ? 'active' : 'pending',
                imageUrl: campaign.image_url
              });
            }
          } catch (campaignError) {
            console.error(`Error loading campaign ${campaignId}:`, campaignError);
            // Continue with other campaigns
          }
        }
        
        // Get donations made by user
        const userDonationsData: Donation[] = [];
        for (const campaign of userProfile.donations_made) {
          try {
            userDonationsData.push({
              id: `${campaign.id}-${Date.now()}`, // Generate unique ID
              campaignId: campaign.id.toString(),
              campaignTitle: campaign.title,
              amount: campaign.raised_amount / 100000000, // This would need to be actual donation amount
              timestamp: new Date(campaign.deadline_secs * 1000), // This would need to be actual donation timestamp
              message: 'Donation made'
            });
          } catch (donationError) {
            console.error(`Error processing donation for campaign ${campaign.id}:`, donationError);
            // Continue with other donations
          }
        }
        
        setUserCampaigns(userCampaignsData);
        setUserDonations(userDonationsData);
        
      } catch (error) {
        console.error('Error loading user data from blockchain:', error);
        // Fallback to empty arrays if blockchain fails
        setUserCampaigns([]);
        setUserDonations([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [connected, account]);

  const getStatusBadge = (status: Campaign['status']) => {
    const statusClasses = {
      pending: 'status-badge status-pending',
      active: 'status-badge status-active',
      successful: 'status-badge status-successful',
      failed: 'status-badge status-failed',
      closed: 'status-badge status-closed',
      rejected: 'status-badge status-rejected'
    } as const;

    const statusLabels = {
      pending: 'Pending',
      active: 'Active',
      successful: 'Successful',
      failed: 'Failed',
      closed: 'Closed',
      rejected: 'Rejected'
    } as const;

    return (
      <span className={statusClasses[status]}>
        {statusLabels[status]}
      </span>
    );
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatAmount = (amount: number) => {
    return `${amount.toLocaleString()} APT`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysLeft = (deadline: Date) => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (!connected) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Wallet Connection Required</h2>
        <p className="text-gray-500 mb-6">
          Please connect your Aptos wallet to view your profile
        </p>
        <div className="inline-block p-6 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-500">Connect your wallet using the button in the header</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalDonated = userDonations.reduce((sum, donation) => sum + donation.amount, 0);
  const totalRaised = userCampaigns.reduce((sum, campaign) => sum + campaign.raisedAmount, 0);
  const activeCampaigns = userCampaigns.filter(campaign => campaign.status === 'active').length;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600 mb-4">
              Wallet: {account?.address?.toString().slice(0, 6)}...{account?.address?.toString().slice(-4)}
            </p>
            <div className="flex items-center space-x-4">
              <Link to="/create" className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Link>
              <button className="btn-secondary">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{formatAmount(totalRaised)}</div>
          <div className="text-sm text-gray-600">Total Raised</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-success-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{formatAmount(totalDonated)}</div>
          <div className="text-sm text-gray-600">Total Donated</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-warning-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{activeCampaigns}</div>
          <div className="text-sm text-gray-600">Active Campaigns</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-secondary-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{userDonations.length}</div>
          <div className="text-sm text-gray-600">Donations Made</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {['overview', 'campaigns', 'donations'].map((tab) => (
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {userDonations.slice(0, 3).map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Heart className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Donated {formatAmount(donation.amount)} to {donation.campaignTitle}
                          </p>
                          <p className="text-sm text-gray-500">{formatDate(donation.timestamp)}</p>
                        </div>
                      </div>
                      <Link
                        to={`/campaigns/${donation.campaignId}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Campaign
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Active Campaigns</h3>
                {userCampaigns.filter(c => c.status === 'active').length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userCampaigns.filter(c => c.status === 'active').slice(0, 2).map((campaign) => (
                      <div key={campaign.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{campaign.title}</h4>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">{campaign.description}</div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress: {getProgressPercentage(campaign.raisedAmount, campaign.goalAmount).toFixed(1)}%</span>
                            <span>{getDaysLeft(campaign.deadline)} days left</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${getProgressPercentage(campaign.raisedAmount, campaign.goalAmount)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No active campaigns</p>
                )}
              </div>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">My Campaigns</h3>
                <Link to="/create" className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </Link>
              </div>
              
              {userCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {userCampaigns.map((campaign) => (
                    <div key={campaign.id} className="card p-0 overflow-hidden">
                      <div className="md:flex">
                        <div className="md:w-48 md:h-32 flex-shrink-0">
                          <img
                            src={campaign.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'}
                            alt={campaign.title}
                            className="w-full h-32 md:h-full object-cover"
                          />
                        </div>
                        <div className="p-6 flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-xl font-semibold text-gray-900">{campaign.title}</h4>
                            {getStatusBadge(campaign.status)}
                          </div>
                          <p className="text-gray-600 mb-4">{campaign.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-primary-600">
                                {formatAmount(campaign.raisedAmount)}
                              </div>
                              <div className="text-xs text-gray-500">Raised</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">
                                {formatAmount(campaign.goalAmount)}
                              </div>
                              <div className="text-xs text-gray-500">Goal</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">
                                {getProgressPercentage(campaign.raisedAmount, campaign.goalAmount).toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500">Progress</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">
                                {getDaysLeft(campaign.deadline)}
                              </div>
                              <div className="text-xs text-gray-500">Days Left</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 mt-3">
                            <Link
                              to={`/campaigns/${campaign.id}`}
                              className="btn-primary"
                            >
                              View Campaign
                            </Link>
                            {campaign.status === 'active' && (
                              <button className="btn-secondary">
                                <Settings className="w-4 h-4 mr-2" />
                                Manage
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Plus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No campaigns yet</h3>
                  <p className="text-gray-500 mb-6">Start your first crowdfunding campaign</p>
                  <Link to="/create" className="btn-primary">
                    Create Your First Campaign
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Donations Tab */}
          {activeTab === 'donations' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">My Donations</h3>
              
              {userDonations.length > 0 ? (
                <div className="space-y-4">
                  {userDonations.map((donation) => (
                    <div key={donation.id} className="card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <Heart className="w-6 h-6 text-primary-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{donation.campaignTitle}</h4>
                            <p className="text-sm text-gray-500">{formatDate(donation.timestamp)}</p>
                            {donation.message && (
                              <p className="text-sm text-gray-600 mt-1">"{donation.message}"</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-semibold text-primary-600">
                            {formatAmount(donation.amount)}
                          </div>
                          <Link
                            to={`/campaigns/${donation.campaignId}`}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                          >
                            View Campaign
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No donations yet</h3>
                  <p className="text-gray-500 mb-6">Support amazing projects and see them here</p>
                  <Link to="/campaigns" className="btn-primary">
                    Browse Campaigns
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 