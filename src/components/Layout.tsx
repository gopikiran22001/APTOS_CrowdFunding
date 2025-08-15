import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import { Home, Users, Plus, User, Shield, Heart } from 'lucide-react';
import { AptosClient } from 'aptos';


interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Campaigns', href: '/campaigns', icon: Users },
    { name: 'Create', href: '/create', icon: Plus },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Admin', href: '/admin', icon: Shield },
  ];
  const { connected,account } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
    const [aptosClient] = useState(() => new AptosClient(process.env.REACT_APP_APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com'));

  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!connected || !account) {
        setIsAdmin(false);
        return;
      }

      try {
        const walletAddress = account.address.toString();
        console.log('Checking admin status for wallet:', walletAddress);

        // First get the admin address from the contract
        try {
          const contractAdminAddress = process.env.REACT_APP_ADMIN_ADDRESS || '';
          // Handle MoveValue response properly
          console.log('Contract admin address:', contractAdminAddress);
          if (contractAdminAddress.toString() !== '') {

            // Check if current wallet is admin

            const adminStatus = contractAdminAddress.toString() === walletAddress.toString();

            setIsAdmin(adminStatus);

            console.log('Current wallet is admin:', adminStatus);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error fetching admin address:', error);
          setIsAdmin(false);
        }

      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
      }
    };

    checkAdminStatus();
  }, [connected, account,aptosClient]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">Aptos Crowdfunding</span>
            </Link>

            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                if (item.name === 'Admin' && !isAdmin) return;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <WalletSelector />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout; 