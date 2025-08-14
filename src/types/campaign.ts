export interface Campaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  deadline: Date;
  status: 'active' | 'funded' | 'expired' | 'cancelled';
  creator: string;
  images: CampaignImage[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
  backersCount: number;
  updates: CampaignUpdate[];
  rewards?: CampaignReward[];
}

export interface CampaignImage {
  id: string;
  url: string;
  publicId: string;
  fileName: string;
  altText?: string;
  isPrimary: boolean;
}

export interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  images?: CampaignImage[];
}

export interface CampaignReward {
  id: string;
  title: string;
  description: string;
  minimumAmount: number;
  maxBackers?: number;
  currentBackers: number;
  estimatedDelivery: Date;
  images?: CampaignImage[];
}

export interface Donation {
  id: string;
  campaignId: string;
  donor: string;
  amount: number;
  message?: string;
  createdAt: Date;
  transactionHash: string;
}

export interface User {
  id: string;
  address: string;
  username?: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  campaigns: Campaign[];
  donations: Donation[];
}

export interface CampaignFilters {
  category?: string;
  status?: Campaign['status'];
  minGoal?: number;
  maxGoal?: number;
  searchQuery?: string;
  sortBy?: 'newest' | 'oldest' | 'goal' | 'popularity';
}

export interface CreateCampaignData {
  title: string;
  description: string;
  goalAmount: number;
  deadline: string;
  category: string;
  images: File[];
}

export interface UpdateCampaignData {
  title?: string;
  description?: string;
  goalAmount?: number;
  deadline?: string;
  category?: string;
  images?: File[];
}
