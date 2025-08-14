# Aptos Crowdfunding Platform Frontend

A modern, full-scale React frontend for a decentralized crowdfunding platform built on the Aptos blockchain. This application provides a complete user experience for creating, funding, and managing crowdfunding campaigns with transparency and security.

## 🚀 Features

### Core Functionality
- **Campaign Creation**: Create compelling crowdfunding campaigns with rich descriptions, images, and funding goals
- **Campaign Discovery**: Browse and search through active campaigns with advanced filtering
- **Secure Donations**: Make donations using Aptos blockchain with wallet integration
- **Campaign Management**: Organizers can track and manage their campaigns
- **Admin Panel**: Comprehensive admin interface for campaign verification and moderation

### User Experience
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Real-time Updates**: Live campaign progress tracking and donation updates
- **Wallet Integration**: Support for multiple Aptos wallets (Petra, Martian, Pontem, Nightly)
- **Modern UI/UX**: Beautiful interface built with Tailwind CSS and Framer Motion

### Technical Features
- **TypeScript**: Full type safety and better development experience
- **React 18**: Latest React features with hooks and modern patterns
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Form Validation**: Robust form handling with React Hook Form and Zod
- **State Management**: Efficient state management with React hooks
- **Routing**: Client-side routing with React Router v6

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Wallet Integration**: Aptos Labs Wallet Adapter
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Custom components with Lucide React icons
- **Animations**: Framer Motion for smooth interactions
- **Notifications**: React Hot Toast for user feedback
- **Build Tool**: Create React App with custom configuration

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout with navigation
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── Campaigns.tsx   # Campaign listing
│   ├── CreateCampaign.tsx # Campaign creation form
│   ├── CampaignDetail.tsx # Individual campaign view
│   ├── Profile.tsx     # User profile and campaigns
│   └── Admin.tsx       # Admin dashboard
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── index.css           # Global styles and Tailwind imports
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Aptos wallet (Petra, Martian, Pontem, or Nightly)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aptos-crowdfunding-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_APTOS_NETWORK=testnet
REACT_APP_CONTRACT_ADDRESS=your_contract_address
```

### Tailwind Configuration
The project includes a custom Tailwind configuration with:
- Custom color palette for the crowdfunding theme
- Custom animations and transitions
- Responsive design utilities
- Custom component classes

## 💰 Smart Contract Integration

This frontend is designed to work with the Aptos crowdfunding smart contract. The contract provides:

- Campaign creation and management
- Secure donation handling
- Admin verification system
- Fund distribution and refund mechanisms

### Contract Functions
- `create_campaign()`: Create new campaigns
- `donate()`: Make donations to campaigns
- `verify_campaign()`: Admin verification
- `claim_funds()`: Campaign fund withdrawal
- `request_refund()`: Donor refund requests

## 🎨 Design System

### Color Palette
- **Primary**: Blue shades for main actions and branding
- **Success**: Green for positive actions and completed states
- **Warning**: Yellow for pending states and alerts
- **Danger**: Red for errors and destructive actions
- **Secondary**: Gray shades for neutral elements

### Component Library
- **Buttons**: Primary, secondary, success, and danger variants
- **Cards**: Consistent card layouts with shadows and borders
- **Forms**: Styled form inputs with validation states
- **Status Badges**: Color-coded status indicators
- **Progress Bars**: Visual progress tracking

## 📱 Responsive Design

The application is built with a mobile-first approach:
- **Mobile**: Optimized for small screens with touch-friendly interactions
- **Tablet**: Adaptive layouts for medium-sized devices
- **Desktop**: Full-featured experience with advanced navigation

## 🔐 Security Features

- **Wallet Authentication**: Secure wallet connection and verification
- **Input Validation**: Client-side and server-side validation
- **Transaction Security**: Secure blockchain transactions
- **Admin Controls**: Role-based access control for admin functions

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📦 Deployment

### Build and Deploy
```bash
# Build the application
npm run build

# Deploy to your preferred hosting service
# (Netlify, Vercel, AWS S3, etc.)
```

### Environment Setup
Ensure your production environment has:
- HTTPS enabled
- Proper CORS configuration
- Environment variables configured
- Aptos network access

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Aptos Labs** for the blockchain infrastructure
- **Tailwind CSS** for the utility-first CSS framework
- **React Team** for the amazing frontend framework
- **Open Source Community** for the various packages and tools

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Join our community discussions

---

**Built with ❤️ on Aptos Blockchain** 