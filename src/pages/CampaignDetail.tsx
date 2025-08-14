import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { 
  Heart, 
  Users, 
  Calendar, 
  Target, 
  Share2, 
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  User,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Campaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  deadline: Date;
  status: 'pending' | 'active' | 'successful' | 'failed' | 'closed' | 'rejected';
  organizer: string;
  imageUrl?: string;
  longDescription?: string;
  updates?: string[];
  backers?: number;
}

interface Donation {
  id: string;
  donor: string;
  amount: number;
  timestamp: Date;
  message?: string;
}

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { connected, account } = useWallet();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [isDonating, setIsDonating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'updates' | 'backers'>('overview');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCampaign: Campaign = {
      id: id || '1',
      title: 'Eco-Friendly Water Bottle',
      description: 'Sustainable water bottles made from recycled materials to reduce plastic waste.',
      longDescription: `Our mission is to create a sustainable alternative to single-use plastic water bottles. 
      We've developed a revolutionary design that uses 100% recycled materials while maintaining the durability 
      and functionality that consumers expect.

      The project will fund:
      - Research and development of new materials
      - Manufacturing equipment and facilities
      - Marketing and distribution channels
      - Environmental impact studies

      By supporting this campaign, you're not just getting a great water bottle - you're helping to reduce 
      plastic waste and create a more sustainable future for our planet.`,
      goalAmount: 5000,
      raisedAmount: 3200,
      deadline: new Date('2024-03-15'),
      status: 'active',
      organizer: '0x1234...5678',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      updates: [
        'Prototype development completed successfully',
        'Material testing phase initiated',
        'Manufacturing partner secured'
      ],
      backers: 45
    };

    const mockDonations: Donation[] = [
      {
        id: '1',
        donor: '0xabcd...efgh',
        amount: 100,
        timestamp: new Date('2024-01-15'),
        message: 'Great initiative! Looking forward to the final product.'
      },
      {
        id: '2',
        donor: '0xijkl...mnop',
        amount: 250,
        timestamp: new Date('2024-01-14'),
        message: 'This is exactly what our planet needs right now.'
      },
      {
        id: '3',
        donor: '0xqrst...uvwx',
        amount: 75,
        timestamp: new Date('2024-01-13')
      }
    ];

    setCampaign(mockCampaign);
    setDonations(mockDonations);
    setLoading(false);
  }, [id]);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'status-badge status-pending',
      active: 'status-badge status-active',
      successful: 'status-badge status-successful',
      failed: 'status-badge status-failed',
      closed: 'status-badge status-closed',
      rejected: 'status-badge status-rejected'
    };

    const statusLabels = {
      pending: 'Pending',
      active: 'Active',
      successful: 'Successful',
      failed: 'Failed',
      closed: 'Closed',
      rejected: 'Rejected'
    };

    return (
      <span className={statusClasses[status as keyof typeof statusClasses]}>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return `${amount.toLocaleString()} APT`;
  };

  const getDaysLeft = (deadline: Date) => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleDonation = async () => {
    if (!connected || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    setIsDonating(true);
    
    try {
      // Mock API call - replace with actual blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newDonation: Donation = {
        id: Date.now().toString(),
        donor: account.address?.toString() || 'Unknown',
        amount: parseFloat(donationAmount),
        timestamp: new Date(),
        message: donationMessage || undefined
      };

      setDonations([newDonation, ...donations]);
      setCampaign(prev => prev ? {
        ...prev,
        raisedAmount: prev.raisedAmount + parseFloat(donationAmount),
        backers: (prev.backers || 0) + 1
      } : null);

      setDonationAmount('');
      setDonationMessage('');
      toast.success('Donation successful! Thank you for your support.');
    } catch (error) {
      toast.error('Failed to process donation. Please try again.');
      console.error('Error processing donation:', error);
    } finally {
      setIsDonating(false);
    }
  };

  const shareCampaign = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign?.title,
        text: campaign?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Campaign link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!campaign) {
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

  const daysLeft = getDaysLeft(campaign.deadline);
  const progressPercentage = getProgressPercentage(campaign.raisedAmount, campaign.goalAmount);

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
          <img
            src={campaign.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'}
            alt={campaign.title}
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute top-4 right-4">
            {getStatusBadge(campaign.status)}
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
            {campaign.title}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {campaign.description}
          </p>

          {/* Campaign Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {formatAmount(campaign.raisedAmount)}
              </div>
              <div className="text-sm text-gray-600">Raised</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatAmount(campaign.goalAmount)}
              </div>
              <div className="text-sm text-gray-600">Goal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {campaign.backers || 0}
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {campaign.status === 'active' && (
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
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {campaign.longDescription}
              </p>
            </div>
          )}

          {activeTab === 'updates' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Updates</h3>
              {campaign.updates && campaign.updates.length > 0 ? (
                <div className="space-y-4">
                  {campaign.updates.map((update, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                      <p className="text-gray-700">{update}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No updates yet. Check back soon!</p>
              )}
            </div>
          )}

          {activeTab === 'backers' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Backers</h3>
              {donations.length > 0 ? (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {donation.donor.slice(0, 6)}...{donation.donor.slice(-4)}
                          </p>
                          {donation.message && (
                            <p className="text-sm text-gray-600">{donation.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-600">{formatAmount(donation.amount)}</p>
                        <p className="text-sm text-gray-500">
                          {donation.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No backers yet. Be the first to support this project!</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Donation Form */}
      {campaign.status === 'active' && (
        <div id="donation-form" className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Support This Project</h3>
          
          {!connected ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Connect your wallet to make a donation</p>
              <div className="inline-block p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-500">Wallet connection required</p>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleDonation(); }} className="space-y-4">
              <div>
                <label htmlFor="donationAmount" className="form-label">
                  Donation Amount (APT) *
                </label>
                <input
                  type="number"
                  id="donationAmount"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  min="0.1"
                  step="0.1"
                  placeholder="10"
                  className="input-field"
                  required
                />
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
                  placeholder="Leave a message of support..."
                  className="input-field resize-none"
                />
              </div>
              
              <button
                type="submit"
                disabled={isDonating || !donationAmount}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDonating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing Donation...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Make Donation</span>
                  </div>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignDetail; 