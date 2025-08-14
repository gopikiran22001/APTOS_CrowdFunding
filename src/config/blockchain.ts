// Blockchain Configuration for Aptos Crowdfunding dApp
export const BLOCKCHAIN_CONFIG = {
  // Module address from .env file
  MODULE_ADDRESS: process.env.REACT_APP_MODULE_ADDRESS || "0a530d3043952a54e96e20d7fb9461eabd252ad0b19b028bcb78c47fc518dec4",
  MODULE_NAME: 'crowdfunding',
  
  // Aptos network configuration
  APTOS_NODE_URL: process.env.REACT_APP_APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com',
  APTOS_FAUCET_URL: process.env.REACT_APP_APTOS_FAUCET_URL || 'https://faucet.testnet.aptoslabs.com',
  
  // Gas configuration
  MAX_GAS_AMOUNT: '2000',
  GAS_UNIT_PRICE: '100',
  
  // Transaction configuration
  TRANSACTION_TIMEOUT: 30000, // 30 seconds
};

// Smart contract function names matching the Move contract
export const CONTRACT_FUNCTIONS = {
  CREATE_CAMPAIGN: 'create_campaign',
  DONATE_WITH_COIN: 'donate_with_coin',
  APPROVE_CAMPAIGN: 'approve_campaign',
  EXTEND_DEADLINE: 'extend_deadline',
  CLOSE_CAMPAIGN: 'close_campaign',
  
  // View functions
  GET_CAMPAIGN: 'get_campaign',
  GET_ACTIVE_CAMPAIGNS: 'get_active_campaigns',
  GET_USER_PROFILE: 'get_user_profile',
  IS_USER: 'is_user',
  GET_DONOR_COUNT: 'get_donor_count',
  GET_ADMIN: 'get_admin',
  GET_NEXT_ID: 'get_next_id',
  IS_ADMIN: 'is_admin',
};

// Campaign status mapping based on contract logic
export const CAMPAIGN_STATUS = {
  PENDING: 'pending',      // approved = false
  ACTIVE: 'active',        // approved = true, not closed, not expired
  SUCCESSFUL: 'successful', // target reached
  EXPIRED: 'expired',      // deadline passed
  CLOSED: 'closed',        // is_closed = true
} as const;

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  INSUFFICIENT_BALANCE: 'Insufficient balance for transaction',
  CAMPAIGN_NOT_FOUND: 'Campaign not found',
  CAMPAIGN_NOT_APPROVED: 'Campaign not approved yet',
  CAMPAIGN_EXPIRED: 'Campaign deadline has expired',
  CAMPAIGN_CLOSED: 'Campaign is closed',
  TARGET_REACHED: 'Campaign target has been reached',
  INVALID_AMOUNT: 'Invalid amount specified',
  TRANSACTION_FAILED: 'Transaction failed. Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection',
  MODULE_NOT_DEPLOYED: 'Smart contract module not deployed',
  NOT_ORGANIZER: 'Only the campaign organizer can perform this action',
  NOT_ADMIN: 'Admin privileges required',
};

// Helper function to get full module address
export const getModuleAddress = (): string => {
  if (!BLOCKCHAIN_CONFIG.MODULE_ADDRESS) {
    throw new Error('MODULE_ADDRESS not configured in environment variables');
  }
  return BLOCKCHAIN_CONFIG.MODULE_ADDRESS;
};

// Helper function to validate module address
export const isValidModuleAddress = (): boolean => {
  return BLOCKCHAIN_CONFIG.MODULE_ADDRESS.length > 0;
};
