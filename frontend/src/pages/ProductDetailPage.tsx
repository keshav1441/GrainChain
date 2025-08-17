import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cropApi } from '../services/api';
import {
  ArrowLeftIcon,
  StarIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  ScaleIcon,
  CheckBadgeIcon,
  CurrencyRupeeIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '../stores/cartStore';
import { InquiryForm } from '../components/forms/InquiryForm';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

// Simplified interface to match the backend response
interface CropListing {
  id: string;
  crop_type: string;
  quantity: number;
  price_per_kg: number;
  farmer_id: string;
  farmer_name: string;
  location: string;
  status: string;
  description?: string; // Assuming description might be available
  // Placeholder for data not yet in backend
  unit?: string;
  rating?: number;
  verified?: boolean;
  harvest_date?: string;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<CropListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const { addToCart, getItemCount } = useCartStore();

  useEffect(() => {
    if (!id) {
      setError('Product ID is missing.');
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await cropApi.getListing(id);
        // Add placeholder data for fields not yet in API response
        const formattedProduct = {
          ...response.data,
          rating: 4.8, // Placeholder
          verified: true, // Placeholder
          harvest_date: '2024-01-15', // Placeholder
        };
        setProduct(formattedProduct);
      } catch (err) {
        setError('Failed to fetch product details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const updateQuantity = useCallback((newQuantity: number) => {
    if (product && newQuantity >= 1 && newQuantity <= product.quantity) {
      setQuantity(newQuantity);
    }
  }, [product]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      crop_type: product.crop_type,
      price_per_kg: product.price_per_kg,
      quantity: product.quantity,
      farmer_id: product.farmer_id,
      farmer_name: product.farmer_name,
      location: product.location,
      image: '🌾',
      max_quantity: product.quantity,
      selected_quantity: quantity,
    });
    toast.success(`${product.crop_type} added to cart!`);
  }, [product, quantity, addToCart]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    
    handleAddToCart();
    navigate('/cart');
  }, [product, handleAddToCart, navigate]);

  const handleMakeInquiry = useCallback(() => {
    if (!user) {
      toast.error('Please login to make an inquiry');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'buyer') {
      toast.error('Only buyers can make inquiries');
      return;
    }
    
    setShowInquiryModal(true);
  }, [user, navigate]);

  const handleInquirySuccess = useCallback(() => {
    setShowInquiryModal(false);
    toast.success('Inquiry sent successfully!');
  }, []);

  const handleInquiryCancel = useCallback(() => {
    setShowInquiryModal(false);
  }, []);

  const handleQuantityDecrease = useCallback(() => {
    updateQuantity(quantity - 1);
  }, [updateQuantity, quantity]);

  const handleQuantityIncrease = useCallback(() => {
    updateQuantity(quantity + 1);
  }, [updateQuantity, quantity]);

  const handleBackToMarketplace = useCallback(() => {
    navigate('/marketplace');
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={handleBackToMarketplace}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Marketplace
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left side: Image and basic info */}
              <div>
                <div className="aspect-w-1 aspect-h-1 w-full bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-[30vw] leading-none">🌾</span>
                </div>
              </div>

              {/* Right side: Details and actions */}
              <div className="flex flex-col justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.crop_type}</h1>
                  <div className="flex items-center mb-4">
                    <UserIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-lg text-gray-700">Sold by {product.farmer_name}</span>
                    {product.verified && <CheckBadgeIcon className="h-6 w-6 text-blue-500 ml-2" />}
                  </div>
                  <div className="flex items-center mb-6">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-md text-gray-600 ml-2">{product.rating?.toFixed(1)}</span>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-600 leading-relaxed">{product.description || 'No description available.'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-md text-gray-700 mb-8">
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                      <span>{product.location}</span>
                    </div>
                    <div className="flex items-center">
                      <ScaleIcon className="h-5 w-5 mr-2 text-gray-500" />
                      <span>{product.quantity} kg available</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                      <span>Harvested: {product.harvest_date ? new Date(product.harvest_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <ShieldCheckIcon className="h-5 w-5 mr-2 text-gray-500" />
                      <span>Status: {product.status}</span>
                    </div>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl text-gray-600">Price</span>
                    <div className="flex items-center text-4xl font-bold text-emerald-600">
                      <CurrencyRupeeIcon className="h-8 w-8" />
                      {product.price_per_kg}
                      <span className="text-lg text-gray-600 ml-1">/kg</span>
                    </div>
                  </div>
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 mb-4">
                    <span className="text-lg font-medium text-gray-700">Quantity (kg):</span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleQuantityDecrease}
                        className="p-2 rounded-full bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-colors"
                        disabled={quantity <= 1}
                      >
                        <MinusIcon className="h-5 w-5 text-gray-600" />
                      </button>
                      <span className="w-16 text-center text-xl font-semibold">{quantity}</span>
                      <button
                        onClick={handleQuantityIncrease}
                        className="p-2 rounded-full bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-colors"
                        disabled={quantity >= product.quantity}
                      >
                        <PlusIcon className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Total Price */}
                  <div className="flex items-center justify-between mb-6 p-4 bg-emerald-50 rounded-lg">
                    <span className="text-lg font-medium text-gray-700">Total:</span>
                    <div className="flex items-center text-2xl font-bold text-emerald-600">
                      <CurrencyRupeeIcon className="h-6 w-6" />
                      {(product.price_per_kg * quantity).toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button 
                      onClick={handleBuyNow}
                      className="w-full bg-orange-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-orange-700 transition-colors"
                    >
                      Buy Now
                    </button>
                    <button 
                      onClick={handleAddToCart}
                      className="w-full bg-emerald-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors flex items-center justify-center relative"
                    >
                      <ShoppingCartIcon className="h-6 w-6 mr-2" />
                      Add to Cart
                      {getItemCount(product.id) > 0 && (
                        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                          {getItemCount(product.id)}
                        </span>
                      )}
                    </button>
                    <button 
                      onClick={handleMakeInquiry}
                      className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 mr-2" />
                      Make Inquiry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Inquiry Modal */}
      {showInquiryModal && product && (
        <InquiryForm
          listingId={product.id}
          cropName={product.crop_type}
          farmerName={product.farmer_name}
          currentPrice={product.price_per_kg}
          availableQuantity={product.quantity}
          unit={product.unit}
          onSuccess={handleInquirySuccess}
          onCancel={handleInquiryCancel}
          isModal={true}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;