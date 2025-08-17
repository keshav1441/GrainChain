import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
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
  SparklesIcon,
  TruckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface ProductCardProps {
  listing: {
    id: string;
    crop_type: string;
    quantity: number;
    price_per_kg: number;
    unit?: string;
    farmer_id: string;
    farmer_name: string;
    location: string;
    status: string;
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
  };
  quantity: number;
  isFavorite: boolean;
  itemCount: number;
  onToggleFavorite: () => void;
  onUpdateQuantity: (newQuantity: number) => void;
  onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  listing,
  quantity,
  isFavorite,
  itemCount,
  onToggleFavorite,
  onUpdateQuantity,
  onAddToCart,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Determine if product is out of stock
  const isOutOfStock = listing.quantity === 0;
  
  // Calculate discount percentage if applicable
  const discountPercentage = listing.originalPrice 
    ? Math.round(((listing.originalPrice - listing.price_per_kg) / listing.originalPrice) * 100)
    : listing.discount || 0;

  return (
    <div
      className={`relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden group border border-gray-200 ${isOutOfStock ? 'opacity-75' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-3 left-14 z-20 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
          -{discountPercentage}%
        </div>
      )}

      {/* Status Badges */}
      <div className="absolute top-3 right-3 z-20 flex flex-col space-y-1">
        {listing.organic && (
          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg flex items-center">
            <SparklesIcon className="h-3 w-3 mr-1" />
            Organic
          </div>
        )}
        {listing.premium && (
          <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            Premium
          </div>
        )}
        {isOutOfStock && (
          <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        {/* Main Product Icon/Image */}
        <div className={`text-6xl transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
          🌾
        </div>

        {/* Hover Overlay with Quick Actions */}
        <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Link
              to={`/marketplace/${listing.id}`}
              className="bg-white/90 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-white transition-colors shadow-lg flex items-center"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Quick View
            </Link>
          </div>
        </div>

        {/* Favorite Button */}
        <button 
          onClick={onToggleFavorite}
          className={`absolute top-3 left-3 p-2 rounded-full transition-all duration-300 shadow-lg ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-white'}`}
        >
          {isFavorite ? (
            <HeartSolidIcon className="h-4 w-4" />
          ) : (
            <HeartIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Product Information */}
      <div className="p-4">
        {/* Product Title and Verification */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 flex-1">
            {listing.crop_type}
          </h3>
          {listing.verified && (
            <CheckBadgeIcon className="h-5 w-5 text-blue-500 ml-2 flex-shrink-0" />
          )}
        </div>

        {/* Farmer Information */}
        <div className="flex items-center text-gray-600 mb-2">
          <UserIcon className="h-4 w-4 mr-2" />
          <span className="text-sm truncate">{listing.farmer_name}</span>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <MapPinIcon className="h-4 w-4 mr-2" />
          <span className="text-sm truncate">{listing.location}</span>
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(listing.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
            <span className="text-sm text-gray-600 ml-2">
              {listing.rating?.toFixed(1)}
            </span>
            {listing.reviews && (
              <span className="text-xs text-gray-500 ml-1">
                ({listing.reviews})
              </span>
            )}
          </div>
          
          {/* Delivery Info */}
          {listing.deliveryTime && (
            <div className="flex items-center text-xs text-green-600">
              <TruckIcon className="h-3 w-3 mr-1" />
              {listing.deliveryTime}
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-2xl font-bold text-emerald-600">
            <CurrencyRupeeIcon className="h-6 w-6" />
            {listing.price_per_kg.toLocaleString()}
            <span className="text-sm text-gray-600 ml-1">/{listing.unit || 'kg'}</span>
          </div>
          
          {/* Original Price (if discounted) */}
          {listing.originalPrice && (
            <div className="flex items-center text-sm text-gray-500 line-through">
              <CurrencyRupeeIcon className="h-4 w-4" />
              {listing.originalPrice}
            </div>
          )}
        </div>
        
        {/* Quantity Available */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <ScaleIcon className="h-4 w-4 mr-1" />
          <span className={listing.quantity < 10 ? 'text-orange-600 font-medium' : ''}>
            {listing.quantity} {listing.unit || 'kg'} available
          </span>
        </div>

        {/* Harvest Date */}
        {listing.harvestDate && (
          <div className="flex items-center text-xs text-gray-500 mb-4">
            <ClockIcon className="h-3 w-3 mr-1" />
            Harvested: {new Date(listing.harvestDate).toLocaleDateString()}
          </div>
        )}

        {/* Quantity Selector */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Quantity ({listing.unit || 'kg'}):</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))}
                className="p-1 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={quantity <= 1 || isOutOfStock}
              >
                <MinusIcon className="h-4 w-4 text-gray-600" />
              </button>
              
              <span className="w-8 text-center font-semibold">{quantity}</span>
              
              <button
                onClick={() => onUpdateQuantity(Math.min(listing.quantity, quantity + 1))}
                className="p-1 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={quantity >= listing.quantity || isOutOfStock}
              >
                <PlusIcon className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Total Price Preview */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-600">Total:</span>
            <div className="flex items-center font-bold text-emerald-600">
              <CurrencyRupeeIcon className="h-4 w-4" />
              {(listing.price_per_kg * quantity).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button 
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center relative ${
              isOutOfStock 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg'
            }`}
          >
            <ShoppingCartIcon className="h-5 w-5 mr-2" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            
            {/* Cart Count Badge */}
            {itemCount > 0 && !isOutOfStock && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          
          <Link
            to={`/marketplace/${listing.id}`}
            className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center justify-center font-medium text-sm"
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            View Details
          </Link>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
