// Debug utility to check environment variables and configuration
export const debugConfig = () => {
  console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
  console.log('REACT_APP_MODULE_ADDRESS:', process.env.REACT_APP_MODULE_ADDRESS);
  console.log('REACT_APP_APTOS_NODE_URL:', process.env.REACT_APP_APTOS_NODE_URL);
  console.log('REACT_APP_APTOS_FAUCET_URL:', process.env.REACT_APP_APTOS_FAUCET_URL);
  console.log('REACT_APP_CLOUDINARY_CLOUD_NAME:', process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);
  console.log('REACT_APP_CLOUDINARY_UPLOAD_PRESET:', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
  console.log('=====================================');
  
  // Test blockchain configuration
  const moduleAddress = process.env.REACT_APP_MODULE_ADDRESS;
  const nodeUrl = process.env.REACT_APP_APTOS_NODE_URL;
  
  if (!moduleAddress) {
    console.error('❌ MODULE_ADDRESS is not set!');
  } else {
    console.log('✅ MODULE_ADDRESS:', moduleAddress);
  }
  
  if (!nodeUrl) {
    console.error('❌ APTOS_NODE_URL is not set!');
  } else {
    console.log('✅ APTOS_NODE_URL:', nodeUrl);
  }
  
  // Test the full function call
  if (moduleAddress && nodeUrl) {
    const fullFunction = `${moduleAddress}::crowdfunding::get_active_campaigns`;
    console.log('🔍 Full function call would be:', fullFunction);
  }
};
