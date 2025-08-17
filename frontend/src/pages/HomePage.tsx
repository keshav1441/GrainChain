import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CurrencyDollarIcon, 
  UserGroupIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

export const HomePage: React.FC = () => {

  return (
    <div className="bg-white overflow-hidden">
      {/* Farm-themed Hero Section */}
      <div className="relative overflow-hidden min-h-screen">
        {/* Farm-themed Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-yellow-900">
          {/* Animated Field Gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-green-600/20 via-yellow-500/15 to-orange-400/10 animate-pulse"></div>
          
          {/* Floating Farm Elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-green-400/40 to-yellow-400/30 rounded-full animate-float blur-sm"></div>
          <div className="absolute top-60 right-32 w-24 h-24 bg-gradient-to-br from-orange-400/30 to-yellow-500/30 rounded-full animate-float animation-delay-1000 blur-sm"></div>
          <div className="absolute bottom-40 left-32 w-40 h-40 bg-gradient-to-br from-emerald-400/30 to-green-500/30 rounded-full animate-float animation-delay-2000 blur-sm"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full animate-float animation-delay-3000 blur-sm"></div>
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        </div>



        {/* Main Content */}
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Farm-themed Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8">
              <span className="block bg-gradient-to-r from-white via-green-100 to-yellow-100 bg-clip-text text-transparent drop-shadow-2xl mb-4">
                🌾 GrainChain
              </span>
              <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-300 via-yellow-300 to-orange-300 bg-clip-text text-transparent">
                From Farm to Fortune
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              Empowering India's farmers with 
              <span className="font-bold text-green-300">smart technology</span>, connecting fields to markets through our 
              <span className="font-bold text-yellow-300">AI-powered agricultural ecosystem</span>
            </p>

            {/* Farm-themed Interactive Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
              {[
                { number: "50K+", label: "Happy Farmers", icon: "👨‍🌾", color: "from-green-400 to-emerald-500" },
                { number: "₹500Cr+", label: "Crop Value Traded", icon: "🌾", color: "from-yellow-400 to-orange-400" },
                { number: "1000+", label: "Villages Connected", icon: "🏡", color: "from-orange-400 to-red-400" }
              ].map((stat, index) => (
                <div key={index} className="group">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                      {stat.number}
                    </div>
                    <div className="text-white/80 text-sm font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <Link to="/register" className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-yellow-400 to-orange-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-yellow-500 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-yellow-600 transition-all duration-300 flex items-center">
                  Start Farming Smart
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              
              <Link to="/marketplace" className="group">
                <div className="bg-white/10 backdrop-blur-lg border border-white/30 text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 flex items-center">
                  Browse Fresh Crops
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>

            {/* Farm Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center space-x-8 text-white/60 text-sm">
              <div className="flex items-center">
                <CheckIcon className="w-4 h-4 mr-2 text-green-400" />
                Zero fees for first harvest
              </div>
              <div className="flex items-center">
                <ShieldCheckIcon className="w-4 h-4 mr-2 text-yellow-400" />
                Crop insurance included
              </div>
              <div className="flex items-center">
                <CheckIcon className="w-4 h-4 mr-2 text-orange-400" />
                24/7 farming support
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Features Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-4">
              <CheckIcon className="w-4 h-4 mr-2" />
              Comprehensive Platform
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides comprehensive tools for farmers, buyers, and financiers 
              to trade efficiently and transparently.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            <div className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  <UserGroupIcon className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">
                  Smart Farming
                </h3>
                
                <p className="text-gray-600 text-lg leading-relaxed">
                  AI-powered insights and recommendations to optimize crop yield and farming practices.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCartIcon className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">
                  Direct Trading
                </h3>
                
                <p className="text-gray-600 text-lg leading-relaxed">
                  Connect directly with buyers and eliminate middlemen for better pricing and transparency.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CurrencyDollarIcon className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">
                  Financial Support
                </h3>
                
                <p className="text-gray-600 text-lg leading-relaxed">
                  Access to credit, loans, and financial products tailored for agricultural needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Enhanced CTA Section */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]"></div>
        
        <div className="relative max-w-4xl mx-auto text-center py-20 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl mb-6">
              <span className="block">Ready to get started?</span>
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Join GrainChain today
              </span>
            </h2>
            <p className="text-xl text-white opacity-90 max-w-2xl mx-auto leading-relaxed">
              Whether you're a farmer, buyer, or financier, our platform has everything you need 
              to succeed in agricultural trade. Start your journey today!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/register" className="group">
              <div className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-emerald-600 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <span>Create Account</span>
                <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            
            <Link to="/login" className="group">
              <div className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border-2 border-white rounded-xl hover:bg-white hover:text-emerald-600 transform hover:scale-105 transition-all duration-200">
                <span>Sign In</span>
              </div>
            </Link>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-white opacity-90">
            <div className="flex items-center">
              <PhoneIcon className="w-5 h-5 mr-2" />
              <span>+91 1800-GRAIN-CHAIN</span>
            </div>
            <div className="flex items-center">
              <EnvelopeIcon className="w-5 h-5 mr-2" />
              <span>support@grainchain.in</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
