import {
  AptosClient,
  Types,
  TxnBuilderTypes,
  BCS,
  TransactionBuilderABI
} from 'aptos';
import {
  BLOCKCHAIN_CONFIG,
  CONTRACT_FUNCTIONS,
  getModuleAddress,
  ERROR_MESSAGES
} from '../config/blockchain';
import { debugConfig } from '../utils/debugConfig';

// Initialize Aptos client
const aptosClient = new AptosClient(BLOCKCHAIN_CONFIG.APTOS_NODE_URL);

// Campaign interface matching the smart contract exactly
export interface Campaign {
  id: number;
  organizer: string;
  title: string;
  description: string;
  image_url: string;
  target_amount: number;
  raised_amount: number;
  deadline_secs: number;
  approved: boolean;
  nft_mode: boolean;
  nft_unit_price: number;
  is_closed: boolean;
  nft_collection_created: boolean;
}

// Donation record interface
export interface DonationRecord {
  campaign_id: number;
  amount: number;
}

// User profile interface
export interface UserProfile {
  campaigns_created: number[];
  donations_made: Campaign[];
}

// Create campaign payload
export interface CreateCampaignPayload {
  title: string;
  description: string;
  image_url: string;
  target_amount: number;
  deadline_secs: number;
  nft_mode: boolean;
  nft_unit_price: number;
}

// Extend deadline payload
export interface ExtendDeadlinePayload {
  campaign_id: number;
  new_deadline_secs: number;
}

// Close campaign payload
export interface CloseCampaignPayload {
  campaign_id: number;
  reason: string;
}

class BlockchainService {
  private moduleAddress: string;

  constructor() {
    debugConfig(); // Debug environment variables
    this.moduleAddress = getModuleAddress();
    console.log('BlockchainService initialized with module address:', this.moduleAddress);
  }

  // Get all active campaigns
  async getActiveCampaigns(): Promise<Campaign[]> {
    try {
      console.log('Attempting to fetch active campaigns...');
      console.log('Module address:', this.moduleAddress);
      console.log('Function:', `${this.moduleAddress}::${CONTRACT_FUNCTIONS.GET_ACTIVE_CAMPAIGNS}`);

      const response = await aptosClient.view({
        function: `${this.moduleAddress}::crowdfunding::${CONTRACT_FUNCTIONS.GET_ACTIVE_CAMPAIGNS}`,
        type_arguments: [],
        arguments: []
      });

      console.log('Response received:', response);
      return this.parseActiveCampaignsResponse(response);
    } catch (error: any) {
      console.error('Error fetching active campaigns:', error);

      // Check if it's a resource not found error (contract not deployed)
      if (error.error_code === 'invalid_input' && error.vm_error_code === 4008) {
        throw new Error('Smart contract not deployed. Please deploy the crowdfunding contract first or check the module address.');
      }

      // Check if it's a module not found error
      if (error.error_code === 'invalid_input' && error.message?.includes('Failed to borrow global resource')) {
        throw new Error('Smart contract module not found. Please verify the module address and ensure the contract is deployed.');
      }

      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  // Get campaign by ID
  async getCampaign(id: number): Promise<Campaign | null> {
    try {
      const response = await aptosClient.view({
        function: `${this.moduleAddress}::crowdfunding::${CONTRACT_FUNCTIONS.GET_CAMPAIGN}`,
        type_arguments: [],
        arguments: [id.toString()]
      });

      return this.parseCampaignResponse(id, response);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }
  }

  // Get user profile
  async getUserProfile(userAddress: string): Promise<UserProfile> {
    try {
      const response = await aptosClient.view({
        function: `${this.moduleAddress}::crowdfunding::${CONTRACT_FUNCTIONS.GET_USER_PROFILE}`,
        type_arguments: [],
        arguments: [userAddress]
      });

      return this.parseUserProfileResponse(response);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  // Check if user exists
  async isUser(address: string): Promise<boolean> {
    try {
      const response = await aptosClient.view({
        function: `${this.moduleAddress}::crowdfunding::${CONTRACT_FUNCTIONS.IS_USER}`,
        type_arguments: [],
        arguments: [address]
      });

      // Convert MoveValue to boolean
      return Boolean(response);
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return false;
    }
  }

  // Check if address is admin
  async isAdmin(address: string): Promise<boolean> {
    try {
      const response = await aptosClient.view({
        function: `${this.moduleAddress}::crowdfunding::${CONTRACT_FUNCTIONS.IS_ADMIN}`,
        type_arguments: [],
        arguments: [address]
      });

      // Convert MoveValue to boolean
      return Boolean(response);
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Get donor count for a campaign
  async getDonorCount(campaignId: number): Promise<number> {
    try {
      const response = await aptosClient.view({
        function: `${this.moduleAddress}::crowdfunding::${CONTRACT_FUNCTIONS.GET_DONOR_COUNT}`,
        type_arguments: [],
        arguments: [campaignId.toString()]
      });

      // Convert MoveValue to number
      return Number(response);
    } catch (error) {
      console.error('Error fetching donor count:', error);
      return 0;
    }
  }

  // Create campaign transaction payload
  createCampaignPayload(payload: CreateCampaignPayload): Types.EntryFunctionPayload {
    
    const entryFunctionPayload = {
      function: `${this.moduleAddress}::crowdfunding::${CONTRACT_FUNCTIONS.CREATE_CAMPAIGN}`,
      type_arguments: [],
      arguments: [
        payload.title,
        payload.description,
        payload.image_url,
        payload.target_amount.toString(),
        payload.deadline_secs.toString(),
        payload.nft_mode,
        payload.nft_unit_price.toString()
      ]
    };

    // This line prints the payload to the console
    console.log("Generated Payload:", JSON.stringify(entryFunctionPayload, null, 2));

    return entryFunctionPayload;
  }

  // Donate to campaign transaction payload
  donatePayload(campaignId: number, amount: number): Types.EntryFunctionPayload {
    return {
      function: `${this.moduleAddress}::crowdfunding::${CONTRACT_FUNCTIONS.DONATE_WITH_COIN}`,
      type_arguments: [],
      arguments: [
        campaignId.toString(),
        amount.toString()
      ]
    };
  }

  // Approve campaign transaction payload (admin only)
  approveCampaignPayload(campaignId: number): Types.EntryFunctionPayload {
    return {
      function: `${this.moduleAddress}::crowdfunding::${CONTRACT_FUNCTIONS.APPROVE_CAMPAIGN}`,
      type_arguments: [],
      arguments: [campaignId.toString()]
    };
  }

  // Extend deadline transaction payload
  extendDeadlinePayload(payload: ExtendDeadlinePayload): Types.EntryFunctionPayload {
    return {
      function: `${this.moduleAddress}::crowdfunding::${CONTRACT_FUNCTIONS.EXTEND_DEADLINE}`,
      type_arguments: [],
      arguments: [
        payload.campaign_id.toString(),
        payload.new_deadline_secs.toString()
      ]
    };
  }

  // Close campaign transaction payload
  closeCampaignPayload(payload: CloseCampaignPayload): Types.EntryFunctionPayload {
    return {
      function: `${this.moduleAddress}::crowdfunding::${CONTRACT_FUNCTIONS.CLOSE_CAMPAIGN}`,
      type_arguments: [],
      arguments: [
        payload.campaign_id.toString(),
        payload.reason
      ]
    };
  }

  // Submit transaction
  async submitTransaction(
    sender: string,
    payload: Types.EntryFunctionPayload,
    maxGasAmount?: string
  ): Promise<any> {
    try {
      const transaction = await aptosClient.generateTransaction(sender, payload, {
        max_gas_amount: maxGasAmount || BLOCKCHAIN_CONFIG.MAX_GAS_AMOUNT,
        gas_unit_price: BLOCKCHAIN_CONFIG.GAS_UNIT_PRICE,
        expiration_timestamp_secs: (Math.floor(Date.now() / 1000) + 60).toString() // 1 minute
      });

      return transaction;
    } catch (error) {
      console.error('Error generating transaction:', error);
      throw new Error(ERROR_MESSAGES.TRANSACTION_FAILED);
    }
  }

  // Wait for transaction
  async waitForTransaction(hash: string): Promise<any> {
    try {
      const transaction = await aptosClient.waitForTransaction(hash, {
        timeoutSecs: BLOCKCHAIN_CONFIG.TRANSACTION_TIMEOUT / 1000
      });
      return transaction;
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      throw new Error(ERROR_MESSAGES.TRANSACTION_FAILED);
    }
  }

  // Parse active campaigns response
  private parseActiveCampaignsResponse(response: any): Campaign[] {
    if (!response || !Array.isArray(response)) return [];

    try {
      return response.map((item: any) => {
        if (item && item.id && item.campaign) {
          return this.parseCampaignResponse(item.id, item.campaign);
        }
        return null;
      }).filter((item): item is Campaign => item !== null);
    } catch (error) {
      console.error('Error parsing active campaigns response:', error);
      return [];
    }
  }

  // Parse campaign response
  private parseCampaignResponse(id: number, response: any): Campaign | null {
    if (!response) return null;

    try {
      // Handle both direct campaign object and tuple response
      let campaignData: any;

      if (response.organizer !== undefined) {
        // Direct campaign object
        campaignData = response;
      } else if (Array.isArray(response)) {
        // Tuple response from get_campaign view function
        campaignData = {
          organizer: response[0],
          title: response[1],
          description: response[2],
          image_url: response[3],
          target_amount: parseInt(response[4]),
          raised_amount: parseInt(response[5]),
          deadline_secs: parseInt(response[6]),
          approved: response[7],
          nft_mode: response[8],
          nft_unit_price: parseInt(response[9]),
          is_closed: response[10],
          nft_collection_created: false // Default value
        };
      } else {
        return null;
      }

      return {
        id,
        organizer: campaignData.organizer,
        title: campaignData.title,
        description: campaignData.description,
        image_url: campaignData.image_url,
        target_amount: campaignData.target_amount,
        raised_amount: campaignData.raised_amount,
        deadline_secs: campaignData.deadline_secs,
        approved: campaignData.approved,
        nft_mode: campaignData.nft_mode,
        nft_unit_price: campaignData.nft_unit_price,
        is_closed: campaignData.is_closed,
        nft_collection_created: campaignData.nft_collection_created || false
      };
    } catch (error) {
      console.error('Error parsing campaign response:', error);
      return null;
    }
  }

  // Parse user profile response
  private parseUserProfileResponse(response: any): UserProfile {
    if (!response || !Array.isArray(response) || response.length < 2) {
      return {
        campaigns_created: [],
        donations_made: []
      };
    }

    try {
      const campaigns_created = response[0] || [];
      const donations_made = response[1] || [];

      return {
        campaigns_created: campaigns_created.map((id: any) => parseInt(id)),
        donations_made: donations_made.map((item: any) =>
          this.parseCampaignResponse(item.id, item.campaign)
        ).filter(Boolean)
      };
    } catch (error) {
      console.error('Error parsing user profile response:', error);
      return {
        campaigns_created: [],
        donations_made: []
      };
    }
  }

  // Check if module is deployed
  async isModuleDeployed(): Promise<boolean> {
    try {
      await aptosClient.getAccountModule(
        BLOCKCHAIN_CONFIG.MODULE_ADDRESS,
        BLOCKCHAIN_CONFIG.MODULE_NAME
      );
      return true;
    } catch (error: any) {
      console.error('Module deployment check failed:', error);

      if (error.error_code === 'not_found') {
        console.log(`Module '${BLOCKCHAIN_CONFIG.MODULE_NAME}' not found at address ${BLOCKCHAIN_CONFIG.MODULE_ADDRESS}`);
      } else if (error.error_code === 'invalid_input') {
        console.log(`Invalid module address: ${BLOCKCHAIN_CONFIG.MODULE_ADDRESS}`);
      }

      return false;
    }
  }

  // Get campaign status based on contract logic
  getCampaignStatus(campaign: Campaign): string {
    if (campaign.is_closed) {
      return 'closed';
    }

    if (!campaign.approved) {
      return 'pending';
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (campaign.deadline_secs < currentTime) {
      return 'expired';
    }

    if (campaign.raised_amount >= campaign.target_amount) {
      return 'successful';
    }

    return 'active';
  }
}

export const blockchainService = new BlockchainService();
