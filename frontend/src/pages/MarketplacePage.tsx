import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  HeartIcon,
  StarIcon,
  MapPinIcon,
  UserIcon,
  CheckBadgeIcon,
  ShoppingCartIcon,
  EyeIcon,
  CurrencyRupeeIcon,
  ScaleIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { cropApi, cartApi } from '../services/api';
import { useCartStore } from '../stores/cartStore';
import toast from 'react-hot-toast';

interface CropListing {
  id: string;
  crop_type: string;
  quantity: number;
  price_per_kg: number;
  farmer_id: string;
  farmer_name: string;
  location: string;
  status: string;
  // Optional fields that might not be in the API response
  rating?: number;
  reviews?: number;
  verified?: boolean;
  image?: string;
  harvestDate?: string;
  deliveryTime?: string;
}

const MarketplacePage: React.FC = () => {
  const [listings, setListings] = useState<CropListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  const { addToCart, getItemCount } = useCartStore();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await cropApi.getMarketplaceListings();
        // Add placeholder data for fields not in API response
        const formattedListings = response.data.map((listing: CropListing) => ({
          ...listing,
          rating: 4.5, // Placeholder
          reviews: Math.floor(Math.random() * 100),
          verified: true, // Placeholder
          image: '🌾',
          harvestDate: '2024-01-15',
          deliveryTime: '2-3 days',
        }));
        setListings(formattedListings);
      } catch (err) {
        setError('Failed to fetch crop listings.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
    setIsVisible(true);
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const updateQuantity = (id: string, newQuantity: number, maxQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantities(prev => ({ ...prev, [id]: newQuantity }));
    }
  };

  const handleAddToCart = async (listing: CropListing) => {
    const selectedQuantity = quantities[listing.id] || 1;
    
    try {
      // Add to backend cart
      await cartApi.addToCart({
        crop_listing_id: listing.id,
        quantity: selectedQuantity
      });
      
      // Update local cart store
      addToCart({
        id: listing.id,
        crop_type: listing.crop_type,
        price_per_kg: listing.price_per_kg,
        quantity: listing.quantity,
        farmer_id: listing.farmer_id,
        farmer_name: listing.farmer_name,
        location: listing.location,
        image: listing.image,
        max_quantity: listing.quantity,
        selected_quantity: selectedQuantity,
      });
      
      toast.success(`${listing.crop_type} added to cart!`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add item to cart');
      console.error('Add to cart error:', error);
    }
  };

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'grains', name: 'Grains & Cereals' },
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'fruits', name: 'Fruits' },
    { id: 'pulses', name: 'Pulses & Legumes' },
    { id: 'spices', name: 'Spices & Herbs' },
    { id: 'organic', name: 'Organic Products' }
  ];

  const filteredListings = listings.filter(listing => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = listing.crop_type.toLowerCase().includes(searchTermLower) ||
                          listing.farmer_name.toLowerCase().includes(searchTermLower) ||
                          listing.location.toLowerCase().includes(searchTermLower);

    const matchesCategory = selectedCategory === 'all' || listing.crop_type.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return a.price_per_kg - b.price_per_kg;
    } else if (sortBy === 'price-desc') {
      return b.price_per_kg - a.price_per_kg;
    } else if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  if (loading) {
    return <div className="text-center py-10">Loading marketplace...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">🌾 Agricultural Marketplace</h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Discover fresh, quality produce directly from verified farmers across India
            </p>
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
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center mb-6">
                <FunnelIcon className="h-6 w-6 text-gray-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${selectedCategory === category.id ? 'bg-emerald-100 text-emerald-800 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {sortedListings.length} Products Found
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {sortedListings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] overflow-hidden group border border-gray-100">
                  <div className="relative h-32 bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
                    <div className="text-4xl">{listing.image || '🌾'}</div>
                    <button onClick={() => toggleFavorite(listing.id)} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors shadow-sm">
                      {favorites.includes(listing.id) ? (
                        <HeartSolidIcon className="h-4 w-4 text-red-500" />
                      ) : (
                        <HeartIcon className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors truncate">
                        {listing.crop_type}
                      </h3>
                      {listing.verified && (
                        <CheckBadgeIcon className="h-4 w-4 text-blue-500 ml-1 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <UserIcon className="h-3 w-3 mr-1" />
                      <span className="text-xs truncate">{listing.farmer_name || 'Unknown Farmer'}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      <span className="text-xs truncate">{listing.location}</span>
                    </div>
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} className={`h-3 w-3 ${i < Math.floor(listing.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 ml-1">
                        {listing.rating?.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-lg font-bold text-emerald-600">
                        <CurrencyRupeeIcon className="h-4 w-4" />
                        {listing.price_per_kg}
                        <span className="text-xs text-gray-600 ml-1">/kg</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <ScaleIcon className="h-3 w-3 inline mr-1" />
                        {listing.quantity} kg
                      </div>
                    </div>
                    <div className="space-y-2">
                      {/* Compact Quantity Selector */}
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                        <span className="text-xs font-medium text-gray-700">Qty:</span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => updateQuantity(listing.id, (quantities[listing.id] || 1) - 1, listing.quantity)}
                            className="p-0.5 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                            disabled={(quantities[listing.id] || 1) <= 1}
                          >
                            <MinusIcon className="h-3 w-3 text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-xs font-medium">{quantities[listing.id] || 1}</span>
                          <button
                            onClick={() => updateQuantity(listing.id, (quantities[listing.id] || 1) + 1, listing.quantity)}
                            className="p-0.5 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                            disabled={(quantities[listing.id] || 1) >= listing.quantity}
                          >
                            <PlusIcon className="h-3 w-3 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Compact Action Buttons */}
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleAddToCart(listing)}
                          className="flex-1 bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center relative"
                        >
                          <ShoppingCartIcon className="h-3 w-3 mr-1" />
                          Add
                          {getItemCount(listing.id) > 0 && (
                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                              {getItemCount(listing.id)}
                            </span>
                          )}
                        </button>
                        <Link
                          to={`/marketplace/${listing.id}`}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                          title="View Details"
                        >
                          <EyeIcon className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
