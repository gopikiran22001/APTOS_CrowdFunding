# Frontend - Aptos Crowdfunding Platform

React-based frontend application for the Aptos Crowdfunding Platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create environment file
copy env.example .env

# Start development server
npm start
```

## 📁 Structure

```
FrontEnd/
├── public/                 # Static assets
├── src/                   # Source code
│   ├── components/        # Reusable UI components
│   ├── config/           # Configuration files
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Application pages
│   ├── services/         # Business logic services
│   ├── types/            # TypeScript definitions
│   └── utils/            # Utility functions
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## 🛠️ Tech Stack

- React 18 + TypeScript
- Tailwind CSS
- Create React App
- Aptos SDK
- React Router
- React Hot Toast

## ⚙️ Configuration

Create `.env` file:

```env
REACT_APP_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com
REACT_APP_MODULE_ADDRESS=your_deployed_module_address
REACT_APP_MODULE_NAME=crowdfunding
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## 📜 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App