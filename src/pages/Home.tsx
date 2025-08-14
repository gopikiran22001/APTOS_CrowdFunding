import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { 
  Heart, 
  Shield, 
  TrendingUp, 
  Users, 
  Globe, 
  Zap,
  ArrowRight,
  Star
} from 'lucide-react';

const Home: React.FC = () => {
  const { connected } = useWallet();

  const features = [
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'Built on Aptos blockchain with smart contracts ensuring transparency and security.'
    },
    {
      icon: TrendingUp,
      title: 'Decentralized',
      description: 'No intermediaries. Direct peer-to-peer funding with instant settlements.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Connect with backers and creators from around the world.'
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Access to funding opportunities regardless of geographical location.'
    }
  ];

  const stats = [
    { label: 'Active Campaigns', value: '150+', icon: Heart },
    { label: 'Total Raised', value: '2.5M APT', icon: TrendingUp },
    { label: 'Happy Backers', value: '10K+', icon: Users },
    { label: 'Success Rate', value: '85%', icon: Star }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Decentralized{' '}
            <span className="text-gradient">Crowdfunding</span>
            <br />
            on Aptos Blockchain
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create, fund, and manage crowdfunding campaigns with transparency, 
            security, and global accessibility. No intermediaries, just direct 
            peer-to-peer funding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {connected ? (
              <Link to="/create" className="btn-primary text-lg px-8 py-4">
                Start Your Campaign
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Connect your wallet to get started</p>
                <div className="inline-block p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-500">Wallet connection required</p>
                </div>
              </div>
            )}
            <Link to="/campaigns" className="btn-secondary text-lg px-8 py-4">
              Browse Campaigns
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white rounded-2xl shadow-soft">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Aptos Crowdfunding?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of crowdfunding with blockchain technology
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="card hover:shadow-medium transition-shadow duration-300">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl text-center text-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators and backers on the most transparent 
            crowdfunding platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/create" 
              className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Create Campaign
            </Link>
            <Link 
              to="/campaigns" 
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Explore Projects
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple steps to get started with your crowdfunding campaign
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect Wallet</h3>
            <p className="text-gray-600">Connect your Aptos wallet to access the platform</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Campaign</h3>
            <p className="text-gray-600">Set your goal, deadline, and tell your story</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Funded</h3>
            <p className="text-gray-600">Receive funds directly to your wallet when goal is reached</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 