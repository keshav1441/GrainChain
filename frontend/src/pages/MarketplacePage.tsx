import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  UserIcon,
  CheckBadgeIcon,
  TruckIcon,
  ScaleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface CropListing {
  id: string;
  title: string;
  farmer: string;
  location: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  harvestDate: string;
  deliveryTime: string;
  verified: boolean;
  organic: boolean;
  featured: boolean;
}

const MarketplacePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const categories = [
    { id: 'all', name: 'All Products', count: 156 },
    { id: 'grains', name: 'Grains & Cereals', count: 45 },
    { id: 'vegetables', name: 'Vegetables', count: 38 },
    { id: 'fruits', name: 'Fruits', count: 29 },
    { id: 'pulses', name: 'Pulses & Legumes', count: 22 },
    { id: 'spices', name: 'Spices & Herbs', count: 18 },
    { id: 'organic', name: 'Organic Products', count: 34 }
  ];

  const mockListings: CropListing[] = [
    {
      id: '1',
      title: 'Premium Basmati Rice',
      farmer: 'Rajesh Kumar',
      location: 'Punjab, India',
      price: 85,
      unit: 'kg',
      quantity: 500,
      image: '🌾',
      rating: 4.8,
      reviews: 124,
      category: 'grains',
      harvestDate: '2024-01-15',
      deliveryTime: '2-3 days',
      verified: true,
      organic: true,
      featured: true
    },
    {
      id: '2',
      title: 'Fresh Organic Tomatoes',
      farmer: 'Priya Sharma',
      location: 'Maharashtra, India',
      price: 45,
      unit: 'kg',
      quantity: 200,
      image: '🍅',
      rating: 4.6,
      reviews: 89,
      category: 'vegetables',
      harvestDate: '2024-01-20',
      deliveryTime: '1-2 days',
      verified: true,
      organic: true,
      featured: false
    },
    {
      id: '3',
      title: 'Sweet Mangoes',
      farmer: 'Amit Patel',
      location: 'Gujarat, India',
      price: 120,
      unit: 'kg',
      quantity: 150,
      image: '🥭',
      rating: 4.9,
      reviews: 156,
      category: 'fruits',
      harvestDate: '2024-01-18',
      deliveryTime: '2-4 days',
      verified: true,
      organic: false,
      featured: true
    },
    {
      id: '4',
      title: 'Red Kidney Beans',
      farmer: 'Sunita Devi',
      location: 'Rajasthan, India',
      price: 95,
      unit: 'kg',
      quantity: 300,
      image: '🫘',
      rating: 4.5,
      reviews: 67,
      category: 'pulses',
      harvestDate: '2024-01-10',
      deliveryTime: '3-5 days',
      verified: true,
      organic: false,
      featured: false
    },
    {
      id: '5',
      title: 'Turmeric Powder',
      farmer: 'Ravi Krishnan',
      location: 'Kerala, India',
      price: 180,
      unit: 'kg',
      quantity: 100,
      image: '🧄',
      rating: 4.7,
      reviews: 92,
      category: 'spices',
      harvestDate: '2024-01-12',
      deliveryTime: '2-3 days',
      verified: true,
      organic: true,
      featured: true
    },
    {
      id: '6',
      title: 'Fresh Spinach',
      farmer: 'Meera Singh',
      location: 'Haryana, India',
      price: 35,
      unit: 'kg',
      quantity: 80,
      image: '🥬',
      rating: 4.4,
      reviews: 43,
      category: 'vegetables',
      harvestDate: '2024-01-22',
      deliveryTime: '1 day',
      verified: true,
      organic: true,
      featured: false
    }
  ];

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const filteredListings = mockListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🌾 Agricultural Marketplace
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Discover fresh, quality produce directly from verified farmers across India
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search crops, farmers, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center mb-6">
                <FunnelIcon className="h-6 w-6 text-gray-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-emerald-100 text-emerald-800 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredListings.length} Products Found
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">View:</span>
                <button className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <div className="grid grid-cols-2 gap-1 w-4 h-4">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center">
                    <div className="text-6xl">{listing.image}</div>
                    {listing.featured && (
                      <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                        Featured
                      </div>
                    )}
                    {listing.organic && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Organic
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(listing.id)}
                      className="absolute bottom-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      {favorites.includes(listing.id) ? (
                        <HeartSolidIcon className="h-5 w-5 text-red-500" />
                      ) : (
                        <HeartIcon className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 flex-1">
                        {listing.title}
                      </h3>
                      {listing.verified && (
                        <CheckBadgeIcon className="h-6 w-6 text-blue-500 ml-2" />
                      )}
                    </div>

                    <div className="flex items-center text-gray-600 mb-3">
                      <UserIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{listing.farmer}</span>
                    </div>

                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{listing.location}</span>
                    </div>

                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(listing.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        {listing.rating} ({listing.reviews} reviews)
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-2xl font-bold text-emerald-600">
                        <CurrencyRupeeIcon className="h-6 w-6" />
                        {listing.price}
                        <span className="text-sm text-gray-600 ml-1">/{listing.unit}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <ScaleIcon className="h-4 w-4 inline mr-1" />
                        {listing.quantity} {listing.unit} available
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Harvested: {new Date(listing.harvestDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <TruckIcon className="h-4 w-4 mr-1" />
                        {listing.deliveryTime}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center">
                        <ShoppingCartIcon className="h-5 w-5 mr-2" />
                        Add to Cart
                      </button>
                      <Link
                        to={`/marketplace/${listing.id}`}
                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="bg-white text-gray-700 px-8 py-4 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors font-medium">
                Load More Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
