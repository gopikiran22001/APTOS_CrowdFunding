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
  Users,
  Key
} from 'lucide-react';
import toast from 'react-hot-toast';
import { blockchainService } from '../services/blockchainService';
import { getModuleAddress } from '../config/blockchain';
import { AptosClient } from 'aptos';

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAddress, setAdminAddress] = useState<string>('');
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [aptosClient] = useState(() => new AptosClient(process.env.REACT_APP_APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com'));

  // Check admin status when wallet connects
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!connected || !account) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        setCheckingAdmin(true);
        const walletAddress = account.address.toString();
        console.log('Checking admin status for wallet:', walletAddress);
        
        // First get the admin address from the contract
        try {
          const response = await aptosClient.view({
            function: `${getModuleAddress()}::crowdfunding::get_admin`,
            type_arguments: [],
            arguments: []
          });
          
          // Handle MoveValue response properly
          if (response && Array.isArray(response) && response.length > 0) {
            const contractAdminAddress = response[0] as string;
            setAdminAddress(contractAdminAddress);
            
            // Check if current wallet is admin
            const adminStatus = await blockchainService.isAdmin(walletAddress);
            setIsAdmin(adminStatus);
            
            console.log('Contract admin address:', contractAdminAddress);
            console.log('Current wallet is admin:', adminStatus);
          } else {
            setAdminAddress('Unable to fetch');
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error fetching admin address:', error);
          setAdminAddress('Unable to fetch');
          setIsAdmin(false);
        }
        
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [connected, account, aptosClient]);

  // Load campaigns from blockchain
  const loadCampaigns = async () => {
    if (!isAdmin) return;
    
    try {
      setLoading(true);
      console.log('Loading campaigns from blockchain...');
      
      // Load real campaigns from blockchain
      const activeCampaigns = await blockchainService.getActiveCampaigns();
      console.log('Active campaigns loaded:', activeCampaigns);
      
      // Convert blockchain campaigns to UI format
      const uiCampaigns: Campaign[] = activeCampaigns.map(c => ({
        id: c.id.toString(),
        title: c.title,
        description: c.description,
        goalAmount: c.target_amount / 100000000, // Convert from octas to APT
        raisedAmount: c.raised_amount / 100000000, // Convert from octas to APT
        deadline: new Date(c.deadline_secs * 1000),
        status: c.approved ? 'active' : 'pending',
        organizer: c.organizer,
        imageUrl: c.image_url,
        createdAt: new Date(), // Would need to get from contract events
        adminNotes: ''
      }));
      
      // Sort campaigns by newest first (by ID)
      uiCampaigns.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      
      setCampaigns(uiCampaigns);
      console.log('UI campaigns set:', uiCampaigns);
      
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns from blockchain. Using mock data instead.');
      
      // Fallback to mock data if blockchain fails
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
        }
      ];
      
      // Sort mock campaigns by newest first (by ID)
      mockCampaigns.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      
      setCampaigns(mockCampaigns);
    } finally {
      setLoading(false);
    }
  };

  // Load campaigns when admin status is confirmed
  useEffect(() => {
    if (isAdmin) {
      loadCampaigns();
    }
  }, [isAdmin]);

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
    if (!isAdmin) {
      toast.error('Admin privileges required');
      return;
    }

    if (!connected || !account) {
      toast.error('Wallet not connected');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Use blockchain service to approve campaign
      const campaignIdNum = parseInt(campaignId);
      const payload = blockchainService.approveCampaignPayload(campaignIdNum);
      
      console.log('Approval payload:', payload);
      
      // Use window.aptos for transaction signing (Petra wallet)
      if (typeof window !== 'undefined' && window.aptos) {
        const response = await window.aptos.signAndSubmitTransaction(payload);
        console.log('Transaction submitted:', response);
        
        // Wait for transaction confirmation
        await aptosClient.waitForTransaction(response.hash);
        
        // Refresh campaigns from blockchain to get updated state
        await loadCampaigns();
        
        setSelectedCampaign(null);
        setAdminNotes('');
        toast.success('Campaign approved successfully! Transaction confirmed on blockchain.');
      } else {
        throw new Error('Petra wallet not available');
      }
    } catch (error) {
      console.error('Error approving campaign:', error);
      toast.error('Failed to approve campaign. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (campaignId: string) => {
    if (!isAdmin) {
      toast.error('Admin privileges required');
      return;
    }

    if (!connected || !account) {
      toast.error('Wallet not connected');
      return;
    }

    if (!adminNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Use blockchain service to close/reject campaign
      const campaignIdNum = parseInt(campaignId);
      const payload = blockchainService.closeCampaignPayload({
        campaign_id: campaignIdNum,
        reason: adminNotes
      });
      
      console.log('Rejection payload:', payload);
      
      // Use window.aptos for transaction signing (Petra wallet)
      if (typeof window !== 'undefined' && window.aptos) {
        const response = await window.aptos.signAndSubmitTransaction(payload);
        console.log('Transaction submitted:', response);
        
        // Wait for transaction confirmation
        await aptosClient.waitForTransaction(response.hash);
        
        // Refresh campaigns from blockchain to get updated state
        await loadCampaigns();
        
        setSelectedCampaign(null);
        setAdminNotes('');
        toast.success('Campaign rejected successfully! Transaction confirmed on blockchain.');
      } else {
        throw new Error('Petra wallet not available');
      }
    } catch (error) {
      console.error('Error rejecting campaign:', error);
      toast.error('Failed to reject campaign. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter campaigns to show only pending ones by default
  const filteredCampaigns = campaigns.filter(campaign => 
    filterStatus === 'all' || campaign.status === filterStatus
  );

  // Get counts for different statuses
  const pendingCount = campaigns.filter(c => c.status === 'pending').length;
  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const rejectedCount = campaigns.filter(c => c.status === 'rejected').length;

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

  // Show loading while checking admin status
  if (checkingAdmin) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin privileges...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin using blockchain service
  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Access Denied</h2>
        <p className="text-gray-500 mb-6">
          You don't have permission to access admin features
        </p>
        <div className="inline-block p-6 bg-gray-100 rounded-lg">
          <div className="text-sm text-gray-500 mb-2">
            <strong>Current Wallet:</strong> {account?.address?.toString().slice(0, 6)}...{account?.address?.toString().slice(-4)}
          </div>
          <div className="text-sm text-gray-500">
            <strong>Admin Address:</strong> {adminAddress ? `${adminAddress.slice(0, 6)}...${adminAddress.slice(-4)}` : 'Loading...'}
          </div>
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

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 mb-2">
              Manage and verify crowdfunding campaigns on the platform
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-primary-600" />
                <span className="text-gray-600">Admin Address:</span>
                <span className="font-mono text-primary-700 bg-primary-50 px-2 py-1 rounded">
                  {adminAddress ? `${adminAddress.slice(0, 6)}...${adminAddress.slice(-4)}` : 'Loading...'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Current Wallet:</span>
                <span className="font-mono text-green-700 bg-green-50 px-2 py-1 rounded">
                  {account?.address?.toString().slice(0, 6)}...{account?.address?.toString().slice(-4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Status Note */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-green-900 mb-1">Admin Access Verified - Blockchain Ready</h3>
            <p className="text-sm text-green-700">
              Your wallet has admin privileges. Campaign approval/rejection actions now perform real blockchain transactions. 
              Make sure your Petra wallet is connected and has sufficient APT for gas fees.
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
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadCampaigns}
              disabled={loading}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </div>
              <span>Refresh</span>
            </button>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field w-48"
            >
              <option value="pending">Pending Review</option>
              <option value="active">Active Campaigns</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Status</option>
            </select>
          </div>
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
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                        className="btn-secondary hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </button>
                      
                      {campaign.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(campaign.id)}
                            disabled={isProcessing}
                            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {isProcessing ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(campaign.id)}
                            disabled={isProcessing}
                            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {isProcessing ? 'Processing...' : 'Reject'}
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
                      className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex-1"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {isProcessing ? 'Processing...' : 'Approve Campaign'}
                    </button>
                    <button
                      onClick={() => handleReject(selectedCampaign.id)}
                      disabled={isProcessing || !adminNotes.trim()}
                      className="inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex-1"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      {isProcessing ? 'Processing...' : 'Reject Campaign'}
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