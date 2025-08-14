import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockchain, CreateCampaignPayload } from '../hooks/useBlockchain';
import { CampaignImage } from '../types/campaign';
import { uploadToCloudinary } from '../utils/cloudinary';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const { createCampaign, loading } = useBlockchain();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    deadline: '',
    nft_mode: false,
    nft_unit_price: ''
  });
  
  const [uploadedImages, setUploadedImages] = useState<CampaignImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const image = await uploadToCloudinary(file);
        setUploadedImages(prev => [...prev, image]);
      }
      toast.success('Images uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.target_amount || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (uploadedImages.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    if (formData.nft_mode && !formData.nft_unit_price) {
      toast.error('Please specify NFT unit price when NFT mode is enabled');
      return;
    }

    try {
      // Convert deadline to Unix timestamp
      const deadlineDate = new Date(formData.deadline);
      const deadline_secs = Math.floor(deadlineDate.getTime() / 1000);
      
      // Get the main image URL (first uploaded image)
      const mainImageUrl = uploadedImages[0].url;
      
      const campaignPayload: CreateCampaignPayload = {
        title: formData.title,
        description: formData.description,
        image_url: mainImageUrl,
        target_amount: parseFloat(formData.target_amount) * 100000000, // Convert to octas (8 decimal places)
        deadline_secs,
        nft_mode: formData.nft_mode,
        nft_unit_price: formData.nft_mode ? parseFloat(formData.nft_unit_price) * 100000000 : 0
      };

      // Create campaign using blockchain service
      const success = await createCampaign(campaignPayload);

      if (success) {
        toast.success('Campaign created successfully!');
        navigate('/campaigns');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Campaign</h1>
          <p className="text-gray-600">Launch your crowdfunding campaign and start raising funds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="Enter your campaign title"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="input-field w-full"
                  placeholder="Describe your campaign in detail"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Goal (APT) *
                </label>
                <input
                  type="number"
                  name="target_amount"
                  value={formData.target_amount}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline *
                </label>
                <input
                  type="datetime-local"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  required
                />
              </div>
            </div>
          </div>

          {/* NFT Configuration */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">NFT Configuration</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="nft_mode"
                  checked={formData.nft_mode}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Enable NFT Mode
                </label>
              </div>

              {formData.nft_mode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NFT Unit Price (APT)
                  </label>
                  <input
                    type="number"
                    name="nft_unit_price"
                    value={formData.nft_unit_price}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Campaign Images</h2>
            
            <div className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {uploading ? 'Uploading...' : 'Click to upload images'}
                  </p>
                  <p className="text-gray-500">
                    Upload high-quality images for your campaign (PNG, JPG, GIF)
                  </p>
                </label>
              </div>

              {/* Uploaded Images */}
              {uploadedImages.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={image.fileName}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                            Main Image
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-medium hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Campaign...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign; 