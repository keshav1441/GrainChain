import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { cropApi, cartApi } from '../services/api';
import { useCartStore } from '../stores/cartStore';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';

interface CropListing {
  id: string;
  crop_type: string;
  quantity: number;
  price_per_kg: number;
  unit?: string; // kg, tons, quintals, etc.
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
  organic?: boolean;
  premium?: boolean;
  discount?: number;
  originalPrice?: number;
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
          rating: 4.2 + Math.random() * 0.6, // Random rating between 4.2-4.8
          reviews: Math.floor(Math.random() * 100) + 20, // 20-120 reviews
          verified: Math.random() > 0.2, // 80% verified
          unit: getRandomUnit(listing.crop_type), // Assign appropriate unit
          image: getRandomCropEmoji(listing.crop_type),
          harvestDate: getRandomRecentDate(),
          deliveryTime: Math.random() > 0.5 ? '2-3 days' : '1-2 days',
          organic: Math.random() > 0.7, // 30% organic
          premium: Math.random() > 0.8, // 20% premium
          discount: Math.random() > 0.6 ? Math.floor(Math.random() * 25) + 5 : 0, // 40% have discount of 5-30%
          originalPrice: Math.random() > 0.6 ? Math.floor(listing.price_per_kg * (1 + (Math.random() * 0.3 + 0.1))) : undefined,
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

  // Helper functions for generating realistic placeholder data
  const getRandomCropEmoji = (cropType: string) => {
    const cropEmojis: { [key: string]: string[] } = {
      rice: ['🌾', '🍚'],
      wheat: ['🌾', '🍞'],
      corn: ['🌽'],
      tomato: ['🍅'],
      potato: ['🥔'],
      onion: ['🧅'],
      apple: ['🍎', '🍏'],
      banana: ['🍌'],
      orange: ['🍊'],
      mango: ['🥭'],
      default: ['🌾', '🥕', '🍅', '🌽', '🥔', '🧅', '🍎', '🍌', '🍊']
    };
    
    const lowerCropType = cropType.toLowerCase();
    for (const [key, emojis] of Object.entries(cropEmojis)) {
      if (lowerCropType.includes(key)) {
        return emojis[Math.floor(Math.random() * emojis.length)];
      }
    }
    return cropEmojis.default[Math.floor(Math.random() * cropEmojis.default.length)];
  };

  const getRandomRecentDate = () => {
    const today = new Date();
    const daysAgo = Math.floor(Math.random() * 30) + 1; // 1-30 days ago
    const harvestDate = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    return harvestDate.toISOString().split('T')[0];
  };

  const getRandomUnit = (cropType: string) => {
    const cropUnits: { [key: string]: string[] } = {
      rice: ['kg', 'quintal', 'ton'],
      wheat: ['kg', 'quintal', 'ton'],
      corn: ['kg', 'quintal'],
      tomato: ['kg', 'crate'],
      potato: ['kg', 'bag'],
      onion: ['kg', 'bag'],
      apple: ['kg', 'box'],
      banana: ['dozen', 'kg'],
      orange: ['kg', 'box'],
      mango: ['kg', 'box'],
      default: ['kg', 'quintal']
    };
    
    const lowerCropType = cropType.toLowerCase();
    for (const [key, units] of Object.entries(cropUnits)) {
      if (lowerCropType.includes(key)) {
        return units[Math.floor(Math.random() * units.length)];
      }
    }
    return cropUnits.default[Math.floor(Math.random() * cropUnits.default.length)];
  };

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

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
              {sortedListings.map((listing) => (
                <ProductCard
                  key={listing.id}
                  listing={listing}
                  quantity={quantities[listing.id] || 1}
                  isFavorite={favorites.includes(listing.id)}
                  itemCount={getItemCount(listing.id)}
                  onToggleFavorite={() => toggleFavorite(listing.id)}
                  onUpdateQuantity={(newQuantity) => updateQuantity(listing.id, newQuantity, listing.quantity)}
                  onAddToCart={() => handleAddToCart(listing)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
