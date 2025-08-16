import { CampaignImage } from '../types/campaign';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (file: File): Promise<CampaignImage> => {
  try {
    console.log('Starting upload for:', file.name);
    console.log('Cloud Name:', CLOUDINARY_CLOUD_NAME);
    console.log('Upload Preset:', CLOUDINARY_UPLOAD_PRESET);

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration missing. Please check your environment variables.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    console.log('Form data prepared, sending request...');

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed with status:', response.status);
      console.error('Error response:', errorText);

      let errorMessage = 'Upload failed';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.error || errorMessage;
      } catch (e) {
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Upload successful:', data);

    return {
      id: data.public_id,
      url: data.secure_url,
      publicId: data.public_id,
      fileName: file.name,
      altText: file.name,
      isPrimary: false, // Will be set by the component
    };
  } catch (error) {
    console.error('Upload error details:', error);
    throw error;
  }
};
