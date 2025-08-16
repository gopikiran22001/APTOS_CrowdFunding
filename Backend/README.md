# Backend - Aptos Crowdfunding Platform

Smart contract backend for the Aptos Crowdfunding Platform built with Move language.

## 🚀 Quick Start

```bash
# Deploy smart contract
aptos move publish --named-addresses crowdfunding=your_address
```

## 📁 Structure

```
Backend/
├── sources/              # Move source files
│   └── crowdfund.move   # Main smart contract
└── Move.toml            # Move package configuration
```

## 🛠️ Tech Stack

- Move Language
- Aptos Blockchain
- Aptos CLI

## 📋 Smart Contract Functions

### Core Functions
- `create_campaign()` - Create new campaign
- `donate_with_coin()` - Donate to campaign
- `approve_campaign()` - Admin approval
- `close_campaign()` - Close campaign

### View Functions
- `get_active_campaigns()` - Get all active campaigns
- `get_campaign()` - Get specific campaign
- `get_user_profile()` - Get user profile
- `is_admin()` - Check admin status

## 🚀 Deployment

1. Install Aptos CLI
2. Configure your account
3. Deploy contract:
   ```bash
   aptos move publish --named-addresses crowdfunding=YOUR_ADDRESS
   ```