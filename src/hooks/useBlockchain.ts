import { useState, useCallback } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { blockchainService, Campaign, DonationRecord, CreateCampaignPayload, ExtendDeadlinePayload, CloseCampaignPayload, UserProfile } from '../services/blockchainService';
import { ERROR_MESSAGES } from '../config/blockchain';
import toast from 'react-hot-toast';


declare global {
  interface Window {
    aptos: any;
  }
}

// Re-export the interfaces for use in other components
export type { Campaign, DonationRecord, CreateCampaignPayload, ExtendDeadlinePayload, CloseCampaignPayload, UserProfile } from '../services/blockchainService';

export const useBlockchain = () => {
  const { connected, account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isUser, setIsUser] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if wallet is connected
  const checkWalletConnection = useCallback(() => {
    if (!connected || !account) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return false;
    }
    return true;
  }, [connected, account]);

  // Load all active campaigns
  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const campaignsData = await blockchainService.getActiveCampaigns();
      console.log("campaignsData",campaignsData);
      setCampaigns(campaignsData);
      // console.log(campaignsData);
      return campaignsData;
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Load campaign by ID
  const loadCampaign = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const campaign = await blockchainService.getCampaign(id);
      // const response = await window.aptos.signAndSubmitTransaction(campaign);
      console.log(campaign);
      setCurrentCampaign(campaign);
      return campaign;
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast.error('Failed to load campaign');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user profile
  const loadUserProfile = useCallback(async () => {
    if (!checkWalletConnection()) return null;
    
    setLoading(true);
    try {
      const profile = await blockchainService.getUserProfile(account!.address.toString());
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load your profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [account, checkWalletConnection]);

  // Check if user exists
  const checkUserExists = useCallback(async () => {
    if (!checkWalletConnection()) return false;
    
    try {
      const exists = await blockchainService.isUser(account!.address.toString());
      setIsUser(exists);
      return exists;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return false;
    }
  }, [account, checkWalletConnection]);

  // Check if user is admin
  const checkAdminStatus = useCallback(async () => {
    if (!checkWalletConnection()) return false;
    
    try {
      const admin = await blockchainService.isAdmin(account!.address.toString());
      setIsAdmin(admin);
      return admin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }, [account, checkWalletConnection]);

  // Create campaign (simplified for now)
  const createCampaign = useCallback(async (payload: CreateCampaignPayload) => {
    if (!checkWalletConnection()) return false;
    
    setLoading(true);
    try {
      // For now, simulate the transaction and add to local state
      // TODO: Implement real blockchain transaction when type issues are resolved
      const newCampaign: Campaign = {
        id: Date.now(),
        organizer: account!.address.toString(),
        title: payload.title,
        description: payload.description,
        image_url: payload.image_url,
        target_amount: payload.target_amount,
        raised_amount: 0,
        deadline_secs: payload.deadline_secs,
        approved: false,
        nft_mode: payload.nft_mode,
        nft_unit_price: payload.nft_unit_price,
        is_closed: false,
        nft_collection_created: false
      };
      const data=await blockchainService.createCampaignPayload(newCampaign);
      const response = await window.aptos.signAndSubmitTransaction(data);
      console.log(response);
      setCampaigns(prev => [...prev, newCampaign]);
      console.log(campaigns)
      toast.success('Campaign created successfully! (Local) Waiting for admin approval.');
      return true;
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
      return false;
    } finally {
      setLoading(false);
    }
  }, [account, checkWalletConnection]);

  // Donate to campaign (simplified for now)
  const donateToCampaign = useCallback(async (campaignId: number, amount: number) => {
    if (!checkWalletConnection()) return false;
    
    setLoading(true);
    try {
      // For now, simulate the transaction and update local state
      // TODO: Implement real blockchain transaction when type issues are resolved
      toast.success('Donation successful! (Local)');
      
      // Update campaign raised amount
      setCampaigns(prev => prev.map(c => 
        c.id === campaignId 
          ? { ...c, raised_amount: c.raised_amount + amount }
          : c
      ));
      
      return true;
    } catch (error) {
      console.error('Error donating to campaign:', error);
      toast.error('Failed to process donation');
      return false;
    } finally {
      setLoading(false);
    }
  }, [account, checkWalletConnection]);

  // Approve campaign (admin only) - simplified for now
  const approveCampaign = useCallback(async (campaignId: number) => {
    if (!checkWalletConnection()) return false;
    if (!isAdmin) {
      toast.error(ERROR_MESSAGES.NOT_ADMIN);
      return false;
    }
    
    setLoading(true);
    try {
      // For now, simulate the transaction
      // TODO: Implement real blockchain transaction when type issues are resolved
      setCampaigns(prev => prev.map(c => 
        c.id === campaignId 
          ? { ...c, approved: true }
          : c
      ));
      
      toast.success('Campaign approved successfully! (Local)');
      return true;
    } catch (error) {
      console.error('Error approving campaign:', error);
      toast.error('Failed to approve campaign');
      return false;
    } finally {
      setLoading(false);
    }
  }, [account, checkWalletConnection, isAdmin]);

  // Extend deadline (simplified for now)
  const extendDeadline = useCallback(async (payload: ExtendDeadlinePayload) => {
    if (!checkWalletConnection()) return false;
    
    setLoading(true);
    try {
      // For now, simulate the transaction
      // TODO: Implement real blockchain transaction when type issues are resolved
      setCampaigns(prev => prev.map(c => 
        c.id === payload.campaign_id 
          ? { ...c, deadline_secs: payload.new_deadline_secs }
          : c
      ));
      
      toast.success('Deadline extended successfully! (Local)');
      return true;
    } catch (error) {
      console.error('Error extending deadline:', error);
      toast.error('Failed to extend deadline');
      return false;
    } finally {
      setLoading(false);
    }
  }, [account, checkWalletConnection]);

  // Close campaign (simplified for now)
  const closeCampaign = useCallback(async (payload: CloseCampaignPayload) => {
    if (!checkWalletConnection()) return false;
    
    setLoading(true);
    try {
      // For now, simulate the transaction
      // TODO: Implement real blockchain transaction when type issues are resolved
      setCampaigns(prev => prev.map(c => 
        c.id === payload.campaign_id 
          ? { ...c, is_closed: true }
          : c
      ));
      
      toast.success('Campaign closed successfully! (Local)');
      return true;
    } catch (error) {
      console.error('Error closing campaign:', error);
      toast.error('Failed to close campaign');
      return false;
    } finally {
      setLoading(false);
    }
  }, [account, checkWalletConnection]);

  // Get donor count for a campaign
  const getDonorCount = useCallback(async (campaignId: number) => {
    try {
      return await blockchainService.getDonorCount(campaignId);
    } catch (error) {
      console.error('Error fetching donor count:', error);
      return 0;
    }
  }, []);

  // Check if module is deployed
  const checkModuleDeployment = useCallback(async () => {
    try {
      const isDeployed = await blockchainService.isModuleDeployed();
      if (!isDeployed) {
        toast.error('Smart contract module not deployed. Please deploy the contract first.');
      }
      return isDeployed;
    } catch (error) {
      console.error('Error checking module deployment:', error);
      return false;
    }
  }, []);

  // Get campaign status
  const getCampaignStatus = useCallback((campaign: Campaign) => {
    return blockchainService.getCampaignStatus(campaign);
  }, []);

  return {
    // State
    loading,
    campaigns,
    currentCampaign,
    userProfile,
    isUser,
    isAdmin,
    connected,
    account,
    
    // Actions
    loadCampaigns,
    loadCampaign,
    loadUserProfile,
    checkUserExists,
    checkAdminStatus,
    createCampaign,
    donateToCampaign,
    approveCampaign,
    extendDeadline,
    closeCampaign,
    getDonorCount,
    checkModuleDeployment,
    checkWalletConnection,
    getCampaignStatus,
  };
};
