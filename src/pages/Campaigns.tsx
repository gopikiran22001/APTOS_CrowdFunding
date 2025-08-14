import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Heart, Users, Calendar, Target } from 'lucide-react';
import { useBlockchain, Campaign } from '../hooks/useBlockchain';

const Campaigns: React.FC = () => {
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { 
    loading, 
    campaigns, 
    loadCampaigns, 
    checkModuleDeployment,
    getCampaignStatus 
  } = useBlockchain();

  useEffect(() => {
    const initializeData = async () => {
      await checkModuleDeployment();
      await loadCampaigns();
    };
    initializeData();
  }, [checkModuleDeployment, loadCampaigns]);

  useEffect(() => {
    let filtered = [...campaigns];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => getCampaignStatus(campaign) === statusFilter);
    }

    // Apply category filter (if you have categories in your contract)
    if (categoryFilter !== 'all') {
      // For now, we'll skip category filtering since it's not in the contract
      // filtered = filtered.filter(campaign => campaign.category === categoryFilter);
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, searchTerm, statusFilter, categoryFilter, getCampaignStatus]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  // Check if there's an error loading campaigns (likely contract not deployed)
  if (false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-yellow-800 mb-4">Smart Contract Not Deployed</h2>
            <p className="text-yellow-700 mb-6">
              The crowdfunding smart contract is not deployed at the address specified in your configuration.
            </p>
            
            <div className="bg-white rounded-lg p-6 text-left mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">To fix this:</h3>
              <ol className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2 mt-0.5">1</span>
                  <span>Deploy your <code className="bg-gray-100 px-1 rounded">crowdfunding.move</code> contract to Aptos testnet</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2 mt-0.5">2</span>
                  <span>Update your <code className="bg-gray-100 px-1 rounded">.env</code> file with the correct <code className="bg-gray-100 px-1 rounded">REACT_APP_MODULE_ADDRESS</code></span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-1 rounded mr-2 mt-0.5">3</span>
                  <span>Restart your application</span>
                </li>
              </ol>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-medium text-gray-900 mb-2">Current Configuration:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Module Address:</strong> <code className="bg-gray-200 px-1 rounded">{process.env.REACT_APP_MODULE_ADDRESS || 'Not set'}</code></div>
                <div><strong>Module Name:</strong> <code className="bg-gray-200 px-1 rounded">crowdfunding</code></div>
                <div><strong>Network:</strong> <code className="bg-gray-200 px-1 rounded">Testnet</code></div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
              <button 
                onClick={() => window.open('https://aptos.dev/tutorials/deploy-your-first-move-module/', '_blank')} 
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors ml-3"
              >
                View Deployment Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Campaigns
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Support innovative projects and make a difference in the world through decentralized crowdfunding
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="custom-dropdown appearance-none input-field w-full pr-10 cursor-pointer transition-all duration-300 ease-in-out"
              >
                <option value="all" className="py-3 px-4 bg-gradient-to-r from-white to-gray-50 hover:from-primary-50 hover:to-primary-100">All Status</option>
                <option value="pending" className="py-3 px-4 bg-gradient-to-r from-white to-yellow-50 hover:from-yellow-50 hover:to-yellow-100">Pending</option>
                <option value="active" className="py-3 px-4 bg-gradient-to-r from-white to-green-50 hover:from-green-50 hover:to-green-100">Active</option>
                <option value="successful" className="py-3 px-4 bg-gradient-to-r from-white to-blue-50 hover:from-blue-50 hover:to-blue-100">Successful</option>
                <option value="expired" className="py-3 px-4 bg-gradient-to-r from-white to-red-50 hover:from-red-50 hover:to-red-100">Expired</option>
                <option value="closed" className="py-3 px-4 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100">Closed</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <div className="w-7 h-7 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="custom-dropdown appearance-none input-field w-full pr-10 cursor-pointer transition-all duration-300 ease-in-out"
              >
                <option value="all">All Categories</option>
                {/* Add categories when available */}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <div className="w-7 h-7 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div className="relative">
              <select className="custom-dropdown appearance-none input-field w-full pr-10 cursor-pointer transition-all duration-300 ease-in-out">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="ending">Ending Soon</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <div className="w-7 h-7 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Campaign Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary-100 to-secondary-100">
                  {campaign.image_url ? (
                    <img
                      src={campaign.image_url}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(campaign)}
                  </div>
                </div>

                {/* Campaign Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {campaign.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {campaign.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>${campaign.raised_amount.toLocaleString()}</span>
                      <span>${campaign.target_amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(campaign.raised_amount, campaign.target_amount)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Campaign Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(campaign.deadline_secs)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Organizer</span>
                    </div>
                  </div>

                  {/* NFT Mode Indicator */}
                  {campaign.nft_mode && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center text-purple-700">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-sm font-medium">NFT Mode</span>
                        <span className="ml-2 text-xs">${campaign.nft_unit_price} per NFT</span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link
                    to={`/campaign/${campaign.id}`}
                    className="block w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-center py-3 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 transform hover:scale-105"
                  >
                    View Campaign
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaigns; 