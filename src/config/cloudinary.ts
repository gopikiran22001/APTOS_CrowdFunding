// Cloudinary Configuration
// Replace these values with your actual Cloudinary credentials
// For better security, use environment variables (see env.example file)

export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  UPLOAD_PRESET: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset',
  API_KEY: process.env.REACT_APP_CLOUDINARY_API_KEY || 'your-api-key',
  API_SECRET: process.env.REACT_APP_CLOUDINARY_API_SECRET || 'your-api-secret', // Never expose this on client-side
};

// Upload preset types
export const UPLOAD_PRESET_TYPES = {
  UNSIGNED: 'unsigned', // For client-side uploads (recommended)
  SIGNED: 'signed', // For server-side uploads (more secure)
};

// Image transformation options
export const IMAGE_TRANSFORMATIONS = {
  THUMBNAIL: 'w_200,h_200,c_fill',
  MEDIUM: 'w_400,h_400,c_fill',
  LARGE: 'w_800,h_600,c_fill',
  QUALITY: 'q_auto,f_auto',
};

// File size limits
export const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
};

// Helper function to get Cloudinary URL
export const getCloudinaryUrl = (publicId: string, transformation?: string): string => {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`;
  if (transformation) {
    return `${baseUrl}/${transformation}/${publicId}`;
  }
  return `${baseUrl}/${publicId}`;
};

// Helper function to validate file
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  if (!FILE_LIMITS.SUPPORTED_TYPES.includes(file.type)) {
    return { isValid: false, error: 'File type not supported' };
  }
  
  if (file.size > FILE_LIMITS.MAX_SIZE) {
    return { isValid: false, error: 'File size too large' };
  }
  
  return { isValid: true };
};

// Helper function to check if Cloudinary is properly configured
export const isCloudinaryConfigured = (): boolean => {
  return CLOUDINARY_CONFIG.CLOUD_NAME !== 'your-cloud-name' && 
         CLOUDINARY_CONFIG.UPLOAD_PRESET !== 'your-upload-preset';
};
