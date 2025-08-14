# Cloudinary Setup Guide for Unsigned Uploads

This guide will help you set up Cloudinary for simple unsigned image uploads in your Aptos crowdfunding application.

## What is Cloudinary?

Cloudinary is a cloud-based service that provides solutions for image and video management. It offers:
- Image upload and storage
- Image transformations and optimization
- CDN delivery
- Free tier with generous limits

## Step 1: Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up For Free"
3. Fill in your details and create an account
4. Verify your email address

## Step 2: Get Your Credentials

After signing in to your Cloudinary dashboard:

1. **Cloud Name**: Found in the top-right corner of your dashboard
   - Example: `myapp123`

2. **API Key**: Found in the "Account Details" section (optional for unsigned uploads)
   - Example: `123456789012345`

3. **API Secret**: Found in the "Account Details" section
   - **⚠️ Never expose this on the client-side**

## Step 3: Create an Upload Preset

1. In your Cloudinary dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Name**: Choose a descriptive name (e.g., `campaign_images`)
   - **Signing Mode**: Select **Unsigned** (for client-side uploads)
   - **Folder**: Optional - specify a folder for organization
   - **Allowed formats**: Select image formats (jpg, png, gif, webp)
   - **Max file size**: Set to 5MB or your preferred limit
5. Click **Save**

## Step 4: Update Configuration

Update the `src/config/cloudinary.ts` file with your actual credentials:

```typescript
export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: 'your-actual-cloud-name', // Replace with your cloud name
  UPLOAD_PRESET: 'your-actual-upload-preset', // Replace with your preset name
  API_KEY: 'your-actual-api-key', // Optional for unsigned uploads
  API_SECRET: 'your-actual-api-secret', // Never expose this on client-side
};
```

## Step 5: Create Environment Variables

1. Copy the `env.example` file to `.env`:
   ```bash
   cp env.example .env
   ```

2. Update `.env` with your actual credentials:
   ```env
   REACT_APP_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
   REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-actual-upload-preset
   ```

## Step 6: Test the Integration

1. Start your development server: `npm start`
2. Navigate to the Create Campaign page
3. Try uploading an image
4. Check the browser console for any errors
5. Verify the image appears in your Cloudinary media library

## Security Considerations

### Unsigned Uploads (Current Implementation)
- ✅ **Pros**: Simple setup, no server required
- ✅ **Pros**: No API key/secret exposure
- ❌ **Cons**: Less secure, upload preset is visible in code
- 🔒 **Security**: Use unsigned uploads with restricted presets

### Server-Side Uploads (Recommended for Production)
- ✅ **Pros**: Most secure, better control over uploads
- ❌ **Cons**: Requires backend server
- 🔒 **Security**: API secret stays on server

## How Unsigned Uploads Work

1. **Upload Preset**: A pre-configured preset allows uploads without authentication
2. **Cloud Name**: Identifies your Cloudinary account
3. **File Upload**: Files are sent directly to Cloudinary using the preset
4. **Response**: Cloudinary returns the uploaded file details and URLs

## Current Implementation Notes

✅ **SECURITY**: The current implementation uses unsigned uploads, which is safe for client-side use as it doesn't expose sensitive credentials.

## Troubleshooting

### Common Issues

1. **"Upload preset not found"**
   - Verify the preset name in your Cloudinary dashboard
   - Ensure the preset is set to "Unsigned"

2. **"File too large"**
   - Check the file size limit in your upload preset
   - Verify the `FILE_LIMITS.MAX_SIZE` in your config

3. **"Invalid file type"**
   - Check the allowed formats in your upload preset
   - Verify the `FILE_LIMITS.SUPPORTED_TYPES` in your config

4. **CORS errors**
   - Cloudinary handles CORS automatically for uploads
   - If you see CORS errors, check your browser console for more details

### Debug Mode

Enable debug logging by adding this to your component:

```typescript
const uploadToCloudinary = async (file: File): Promise<CampaignImage> => {
  console.log('Uploading file:', file.name, file.size, file.type);
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
  
  console.log('Form data:', {
    cloud_name: CLOUDINARY_CLOUD_NAME,
    upload_preset: CLOUDINARY_UPLOAD_PRESET
  });

  // ... rest of the function
};
```

## Advanced Features

### Image Transformations

Use Cloudinary's transformation parameters for optimized images:

```typescript
// Get optimized thumbnail
const thumbnailUrl = getCloudinaryUrl(publicId, 'w_200,h_200,c_fill,q_auto');

// Get responsive image
const responsiveUrl = getCloudinaryUrl(publicId, 'w_auto,dpr_auto,q_auto,f_auto');
```

### Multiple Image Sizes

Generate multiple sizes for responsive design:

```typescript
const imageSizes = {
  thumbnail: getCloudinaryUrl(publicId, 'w_200,h_200,c_fill'),
  medium: getCloudinaryUrl(publicId, 'w_400,h_400,c_fill'),
  large: getCloudinaryUrl(publicId, 'w_800,h_600,c_fill'),
};
```

## Support

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload API Reference](https://cloudinary.com/documentation/upload_images)
- [Unsigned Uploads Guide](https://cloudinary.com/documentation/upload_images#unsigned_upload_forms)
- [React Integration Examples](https://cloudinary.com/documentation/react_integration)

## Next Steps

After setting up Cloudinary:

1. Test image uploads with various file types and sizes
2. Implement image optimization and transformations
3. Add image compression before upload
4. Consider implementing a media library for campaign creators
5. Add image validation and moderation features
6. Implement proper error handling and retry logic
