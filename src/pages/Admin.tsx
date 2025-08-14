import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Eye, 
  AlertCircle,
  Clock,
  TrendingUp,
  Users
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
  createdAt: Date;
  adminNotes?: string;
}

const Admin: React.FC = () => {
  const { connected, account } = useWallet();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('pending');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        title: 'Eco-Friendly Water Bottle',
        description: 'Sustainable water bottles made from recycled materials to reduce plastic waste.',
        goalAmount: 5000,
        raisedAmount: 0,
        deadline: new Date('2024-03-15'),
        status: 'pending',
        organizer: '0x1234...5678',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        createdAt: new Date('2024-01-10'),
        adminNotes: 'Campaign looks promising but needs more details about manufacturing process.'
      },
      {
        id: '2',
        title: 'Community Garden Project',
        description: 'Building a community garden to provide fresh produce and educational opportunities.',
        goalAmount: 3000,
        raisedAmount: 0,
        deadline: new Date('2024-02-20'),
        status: 'pending',
        organizer: '0x8765...4321',
        imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        createdAt: new Date('2024-01-08')
      },
      {
        id: '3',
        title: 'Local Art Gallery',
        description: 'Supporting local artists by creating a community art gallery space.',
        goalAmount: 8000,
        raisedAmount: 0,
        deadline: new Date('2024-04-10'),
        status: 'pending',
        organizer: '0x9999...8888',
        imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
        createdAt: new Date('2024-01-12')
      },
      {
        id: '4',
        title: 'Tech Education for Kids',
        description: 'Providing coding and technology education to underprivileged children.',
        goalAmount: 6000,
        raisedAmount: 0,
        deadline: new Date('2024-05-15'),
        status: 'rejected',
        organizer: '0xaaaa...bbbb',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
        createdAt: new Date('2024-01-05'),
        adminNotes: 'Rejected due to insufficient project planning and unclear budget allocation.'
      }
    ];

    setCampaigns(mockCampaigns);
    setLoading(false);
  }, []);

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

  const handleApprove = async (campaignId: string) => {
    setIsProcessing(true);
    
    try {
      // Mock API call - replace with actual blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, status: 'active' as const, adminNotes }
          : campaign
      ));
      
      setSelectedCampaign(null);
      setAdminNotes('');
      toast.success('Campaign approved successfully!');
    } catch (error) {
      toast.error('Failed to approve campaign. Please try again.');
      console.error('Error approving campaign:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (campaignId: string) => {
    if (!adminNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Mock API call - replace with actual blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, status: 'rejected' as const, adminNotes }
          : campaign
      ));
      
      setSelectedCampaign(null);
      setAdminNotes('');
      toast.success('Campaign rejected successfully!');
    } catch (error) {
      toast.error('Failed to reject campaign. Please try again.');
      console.error('Error rejecting campaign:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    filterStatus === 'all' || campaign.status === filterStatus
  );

  if (!connected) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Wallet Connection Required</h2>
        <p className="text-gray-500 mb-6">
          Please connect your Aptos wallet to access admin features
        </p>
        <div className="inline-block p-6 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-500">Connect your wallet using the button in the header</p>
        </div>
      </div>
    );
  }

  // Check if user is admin (mock check - replace with actual admin verification)
  const isAdmin = account?.address?.toString() === '0x1234...5678'; // Replace with actual admin address check

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Access Denied</h2>
        <p className="text-gray-500 mb-6">
          You don't have permission to access admin features
        </p>
        <div className="inline-block p-6 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-500">Admin privileges required</p>
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

  const pendingCount = campaigns.filter(c => c.status === 'pending').length;
  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const rejectedCount = campaigns.filter(c => c.status === 'rejected').length;

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Manage and verify crowdfunding campaigns on the platform
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-warning-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{pendingCount}</div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-success-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{activeCount}</div>
          <div className="text-sm text-gray-600">Active Campaigns</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-6 h-6 text-danger-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{rejectedCount}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-secondary-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{campaigns.length}</div>
          <div className="text-sm text-gray-600">Total Campaigns</div>
        </div>
      </div>

      {/* Campaign Management */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Campaign Management</h2>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-48"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No campaigns found</h3>
            <p className="text-gray-500">No campaigns match the current filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                <div className="md:flex items-start space-x-4">
                  <div className="md:w-32 md:h-24 flex-shrink-0 mb-4 md:mb-0">
                    <img
                      src={campaign.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'}
                      alt={campaign.title}
                      className="w-full h-24 md:h-full object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{campaign.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{campaign.description}</p>
                      </div>
                      {getStatusBadge(campaign.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-primary-600">
                          {formatAmount(campaign.goalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">Goal</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {getDaysLeft(campaign.deadline)}
                        </div>
                        <div className="text-xs text-gray-500">Days Left</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatDate(campaign.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">Created</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {campaign.organizer.slice(0, 6)}...{campaign.organizer.slice(-4)}
                        </div>
                        <div className="text-xs text-gray-500">Organizer</div>
                      </div>
                    </div>
                    
                    {campaign.adminNotes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Admin Notes:</strong> {campaign.adminNotes}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedCampaign(campaign)}
                        className="btn-secondary"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </button>
                      
                      {campaign.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(campaign.id)}
                            disabled={isProcessing}
                            className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(campaign.id)}
                            disabled={isProcessing}
                            className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Review Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Review Campaign</h3>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Campaign Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">{selectedCampaign.title}</h5>
                    <p className="text-gray-600 text-sm mb-3">{selectedCampaign.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Goal:</span>
                        <span className="ml-2 font-medium">{formatAmount(selectedCampaign.goalAmount)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Deadline:</span>
                        <span className="ml-2 font-medium">{formatDate(selectedCampaign.deadline)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Organizer:</span>
                        <span className="ml-2 font-medium">{selectedCampaign.organizer}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-2 font-medium">{formatDate(selectedCampaign.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="adminNotes" className="form-label">
                    Admin Notes
                  </label>
                  <textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    placeholder="Add notes about this campaign..."
                    className="input-field resize-none"
                  />
                </div>
                
                {selectedCampaign.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(selectedCampaign.id)}
                      disabled={isProcessing}
                      className="btn-success flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Campaign
                    </button>
                    <button
                      onClick={() => handleReject(selectedCampaign.id)}
                      disabled={isProcessing || !adminNotes.trim()}
                      className="btn-danger flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Campaign
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 