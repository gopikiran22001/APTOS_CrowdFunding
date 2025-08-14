# 🚀 Aptos Crowdfunding Platform

A decentralized crowdfunding platform built on the Aptos blockchain, enabling users to create, fund, and manage crowdfunding campaigns with NFT support and admin governance.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Smart Contract](#smart-contract)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

The Aptos Crowdfunding Platform is a full-stack decentralized application (dApp) that leverages the Aptos blockchain to provide a secure, transparent, and efficient crowdfunding experience. Users can create campaigns, contribute funds, and track progress in real-time while maintaining full control over their digital assets.

## 📸 Screenshots

### Campaigns Page

This screenshot shows the main campaigns page, where users can discover, search, filter, and sort various crowdfunding campaigns.

<img width="1896" height="868" alt="Screenshot 2025-08-14 125351" src="https://github.com/user-attachments/assets/938f2157-6532-4063-ad28-a6dfdae9b743" />

Admin Dashboard

![WhatsApp Image 2025-08-14 at 13 11 46_83982b17](https://github.com/user-attachments/assets/5d4ee126-413c-47f8-9407-ed9b1543f0b9)


Profile

![WhatsApp Image 2025-08-14 at 13 11 46_4b04a76f](https://github.com/user-attachments/assets/deec908c-2736-4453-8ec4-1899cca09e4e)

Campaign Craetion

![WhatsApp Image 2025-08-14 at 13 11 46_58cea7ed](https://github.com/user-attachments/assets/584cad30-54f9-498c-b8e2-f9b8b0ce6353)

HomePage

![WhatsApp Image 2025-08-14 at 13 11 47_ae12dfa1](https://github.com/user-attachments/assets/9870d47e-b308-4bcc-bd7a-a1bb629cbfbd)






## ✨ Features

### 🎯 Core Functionality

- **Campaign Creation**: Users can create detailed crowdfunding campaigns
- **Funding**: Support campaigns with APT tokens
- **Campaign Management**: Organizers can manage their campaigns
- **Admin Panel**: Governance and approval system
- **User Profiles**: Track campaigns and donations
- **Real-time Updates**: Live blockchain data synchronization

### 🔐 Security Features

- **Wallet Integration**: Secure Aptos wallet connection
- **Smart Contract Validation**: On-chain verification of all operations
- **Admin Privileges**: Role-based access control
- **Transaction Signing**: Secure transaction processing

### 🎨 User Experience

- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, intuitive interface
- **Real-time Feedback**: Toast notifications and loading states
- **Search & Filter**: Advanced campaign discovery
- **Sorting Options**: Multiple sorting criteria (newest, popular, ending soon)

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons
- **React Router**: Client-side routing
- **React Hot Toast**: User notifications

### Blockchain
- **Aptos**: High-performance Layer 1 blockchain
- **Move Language**: Smart contract development
- **Petra Wallet**: Aptos wallet integration
- **Aptos SDK**: Blockchain interaction

### Development Tools
- **Vite**: Fast build tool and dev server
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **PostCSS**: CSS processing

## 📁 Project Structure

```
APTOS_HACK/
├── 📁 public/                    # Static assets
│   ├── index.html               # Main HTML file
│   └── manifest.json            # PWA manifest
├── 📁 src/                      # Source code
│   ├── 📁 components/           # Reusable UI components
│   │   └── Layout.tsx          # Main layout wrapper
│   ├── 📁 config/               # Configuration files
│   │   ├── blockchain.ts        # Blockchain configuration
│   │   └── cloudinary.ts        # Cloudinary image service config
│   ├── 📁 hooks/                # Custom React hooks
│   │   └── useBlockchain.ts     # Blockchain interaction hook
│   ├── 📁 pages/                # Application pages
│   │   ├── Admin.tsx            # Admin dashboard
│   │   ├── Campaigns.tsx        # Campaign listing
│   │   ├── CampaignDetail.tsx   # Individual campaign view
│   │   ├── CreateCampaign.tsx   # Campaign creation form
│   │   ├── Home.tsx             # Landing page
│   │   └── Profile.tsx          # User profile management
│   ├── 📁 services/             # Business logic services
│   │   └── blockchainService.ts # Blockchain interaction service
│   ├── 📁 types/                # TypeScript type definitions
│   │   └── campaign.ts          # Campaign-related interfaces
│   ├── 📁 utils/                # Utility functions
│   │   ├── cloudinary.ts        # Image upload utilities
│   │   └── debugConfig.ts       # Debug configuration
│   ├── App.tsx                  # Main application component
│   ├── index.tsx                # Application entry point
│   └── index.css                # Global styles
├── 📁 sources/                   # Smart contract source code
│   └── crowdfund.move           # Aptos Move smart contract
├── Move.toml                     # Move package configuration
├── package.json                  # Node.js dependencies
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.js             # PostCSS configuration
└── README.md                     # This file
```

## 🔗 Smart Contract

### Overview
The platform uses a custom Move smart contract (`sources/crowdfund.move`) that handles all blockchain operations including:

- Campaign creation and management
- Fund collection and distribution
- Admin governance
- NFT support (optional)

### Key Functions

```move
// Core campaign functions
create_campaign(title, description, image_url, target_amount, deadline, nft_mode, nft_unit_price)
donate_with_coin(campaign_id, amount)
approve_campaign(campaign_id) // Admin only
close_campaign(campaign_id, reason)

// View functions
get_active_campaigns()
get_campaign(campaign_id)
get_user_profile(user_address)
is_admin(address)
```

### Contract Features

- **Campaign Management**: Create, update, and close campaigns
- **Funding System**: Secure donation processing
- **Admin Controls**: Multi-signature approval system
- **NFT Integration**: Optional NFT-based fundraising
- **Security**: Built-in validation and access control

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Aptos CLI** (for smart contract deployment)
- **Petra Wallet** (for blockchain interaction)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd APTOS_HACK
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Blockchain Configuration
REACT_APP_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com
REACT_APP_MODULE_ADDRESS=your_deployed_module_address
REACT_APP_MODULE_NAME=crowdfunding

# Cloudinary Configuration (Optional)
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 4. Smart Contract Deployment

```bash
# Navigate to sources directory
cd sources

# Deploy the smart contract
aptos move publish --named-addresses crowdfunding=your_address

# Update .env with the deployed module address
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## ⚙️ Configuration

### Blockchain Configuration (`src/config/blockchain.ts`)

```typescript
export const BLOCKCHAIN_CONFIG = {
  APTOS_NODE_URL: process.env.REACT_APP_APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com',
  MODULE_ADDRESS: process.env.REACT_APP_MODULE_ADDRESS || '',
  MODULE_NAME: process.env.REACT_APP_MODULE_NAME || 'crowdfunding',
  MAX_GAS_AMOUNT: '2000',
  GAS_UNIT_PRICE: '100',
  TRANSACTION_TIMEOUT: 30000
};
```

### Tailwind Configuration (`tailwind.config.js`)

Custom color palette and design system:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { /* Custom primary colors */ },
        secondary: { /* Custom secondary colors */ },
        success: { /* Success state colors */ },
        warning: { /* Warning state colors */ },
        danger: { /* Error state colors */ }
      }
    }
  }
};
```

## 📱 Usage

### For Users

1. **Connect Wallet**: Use Petra wallet to connect to the platform
2. **Browse Campaigns**: View and search available campaigns
3. **Support Projects**: Contribute APT tokens to campaigns
4. **Create Campaigns**: Launch your own crowdfunding project
5. **Manage Profile**: Track your campaigns and donations

### For Administrators

1. **Access Admin Panel**: Navigate to `/admin` with admin privileges
2. **Review Campaigns**: Evaluate pending campaign submissions
3. **Approve/Reject**: Make governance decisions with blockchain transactions
4. **Monitor Platform**: View platform statistics and activity

### Campaign Creation

1. Navigate to "Create Campaign"
2. Fill in campaign details (title, description, goal, deadline)
3. Upload campaign images
4. Choose NFT mode (optional)
5. Submit for admin approval

## 🔌 API Reference

### Blockchain Service (`src/services/blockchainService.ts`)

#### Core Methods

```typescript
// Campaign Management
createCampaign(payload: CreateCampaignPayload): Promise<boolean>
getActiveCampaigns(): Promise<Campaign[]>
getCampaign(id: number): Promise<Campaign | null>

// User Operations
getUserProfile(userAddress: string): Promise<UserProfile>
donateToCampaign(campaignId: number, amount: number): Promise<boolean>

// Admin Functions
approveCampaign(campaignId: number): Promise<boolean>
closeCampaign(payload: CloseCampaignPayload): Promise<boolean>
isAdmin(address: string): Promise<boolean>
```

#### Data Interfaces

```typescript
interface Campaign {
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
}

interface CreateCampaignPayload {
  title: string;
  description: string;
  image_url: string;
  target_amount: number;
  deadline_secs: number;
  nft_mode: boolean;
  nft_unit_price: number;
}
```

### Custom Hooks

#### useBlockchain Hook

```typescript
const {
  loading,
  campaigns,
  userProfile,
  isAdmin,
  connected,
  account,
  loadCampaigns,
  createCampaign,
  donateToCampaign,
  approveCampaign
} = useBlockchain();
```

## 🚀 Deployment

### Production Build

```bash
npm run build
# or
yarn build
```

### Deployment Options

1. **Vercel**: Connect GitHub repository for automatic deployments
2. **Netlify**: Drag and drop build folder
3. **AWS S3**: Upload build files to S3 bucket
4. **Traditional Hosting**: Upload build files to web server

### Environment Variables for Production

Ensure all environment variables are properly set in your deployment platform:

- `REACT_APP_APTOS_NODE_URL`
- `REACT_APP_MODULE_ADDRESS`
- `REACT_APP_MODULE_NAME`
- `REACT_APP_CLOUDINARY_CLOUD_NAME`
- `REACT_APP_CLOUDINARY_UPLOAD_PRESET`

## 🧪 Testing

### Running Tests

```bash
npm test
# or
yarn test
```

### Test Coverage

```bash
npm run test:coverage
# or
yarn test:coverage
```

## 🔧 Development

### Code Quality

- **ESLint**: Code linting and style enforcement
- **Prettier**: Automatic code formatting
- **TypeScript**: Type safety and development experience

### Development Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### Adding New Features

1. **Create Components**: Add new UI components in `src/components/`
2. **Add Pages**: Create new pages in `src/pages/`
3. **Update Types**: Extend interfaces in `src/types/`
4. **Smart Contract**: Modify `sources/crowdfund.move` if needed
5. **Update Services**: Extend `blockchainService.ts` for new functionality

## 🤝 Contributing

### Contribution Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Standards

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent code formatting
- Add proper error handling
- Include TypeScript types for all functions
- Write meaningful commit messages

## 📊 Performance

### Optimization Features

- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Component lazy loading for better performance
- **Image Optimization**: Cloudinary integration for image management
- **Caching**: Blockchain data caching strategies
- **Bundle Optimization**: Vite build optimization

### Monitoring

- **Performance Metrics**: Core Web Vitals tracking
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: User behavior tracking
- **Blockchain Monitoring**: Transaction success rates

## 🔒 Security

### Security Measures

- **Wallet Validation**: Secure wallet connection verification
- **Input Validation**: Client and server-side input sanitization
- **Transaction Signing**: Secure transaction processing
- **Access Control**: Role-based permission system
- **Data Encryption**: Sensitive data encryption

### Best Practices

- Never expose private keys
- Validate all user inputs
- Use HTTPS in production
- Implement rate limiting
- Regular security audits

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Basic crowdfunding functionality
- ✅ Admin governance system
- ✅ User profile management
- ✅ Campaign creation and funding

### Phase 2 (Planned)
- 🔄 Advanced NFT features
- 🔄 Social features and sharing
- 🔄 Analytics dashboard
- 🔄 Mobile app development

### Phase 3 (Future)
- 📋 Multi-chain support
- 📋 Advanced governance tools
- 📋 Integration with DeFi protocols
- 📋 Internationalization support

## 🐛 Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure Petra wallet is installed and unlocked
   - Check network configuration
   - Verify wallet permissions

2. **Smart Contract Errors**
   - Verify module address in environment variables
   - Check contract deployment status
   - Ensure sufficient APT for gas fees

3. **Image Upload Issues**
   - Verify Cloudinary configuration
   - Check file size and format
   - Ensure proper CORS settings

### Debug Mode

Enable debug mode by setting environment variable:

```env
REACT_APP_DEBUG=true
```

## 📚 Resources

### Documentation
- [Aptos Developer Portal](https://aptos.dev/)
- [Move Language Documentation](https://move-language.github.io/move/)
- [React Documentation](https://reactjs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

### Community
- [Aptos Discord](https://discord.gg/aptos)
- [Move Language Community](https://community.move-language.com/)
- [GitHub Issues](https://github.com/your-repo/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Aptos Labs for the blockchain infrastructure
- Move Language community for smart contract development
- React and Tailwind CSS communities for frontend tools
- All contributors and supporters of the project

---

**Built with ❤️ on Aptos Blockchain**

For support and questions, please open an issue on GitHub or contact the development team. 
