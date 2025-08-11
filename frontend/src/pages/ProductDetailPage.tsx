import React, { useState, useEffect } from 'react';
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
} from '@heroicons/react/24/outline';

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
  rating?: number;
  verified?: boolean;
  harvest_date?: string;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<CropListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            onClick={() => navigate('/marketplace')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Marketplace
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
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
                  <button className="w-full bg-emerald-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors">
                    Make Inquiry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
