import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  ShoppingCartIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  TruckIcon,
  ScaleIcon,
  CheckBadgeIcon,
  CurrencyRupeeIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface ProductDetail {
  id: string;
  title: string;
  farmer: {
    name: string;
    avatar?: string;
    rating: number;
    totalSales: number;
    verified: boolean;
    location: string;
    joinDate: string;
  };
  location: string;
  price: number;
  unit: string;
  quantity: number;
  images: string[];
  rating: number;
  reviews: number;
  category: string;
  harvestDate: string;
  deliveryTime: string;
  verified: boolean;
  organic: boolean;
  description: string;
  specifications: {
    variety: string;
    grade: string;
    moisture: string;
    purity: string;
    packaging: string;
  };
  certifications: string[];
  reviews_list: {
    id: string;
    buyer: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock product data - replace with actual API call
    const mockProduct: ProductDetail = {
      id: id || '1',
      title: 'Premium Basmati Rice',
      farmer: {
        name: 'Rajesh Kumar',
        rating: 4.8,
        totalSales: 156,
        verified: true,
        location: 'Punjab, India',
        joinDate: '2022-03-15',
      },
      location: 'Punjab, India',
      price: 85,
      unit: 'kg',
      quantity: 500,
      images: ['🌾', '🌾', '🌾', '🌾'],
      rating: 4.8,
      reviews: 124,
      category: 'grains',
      harvestDate: '2024-01-15',
      deliveryTime: '2-3 days',
      verified: true,
      organic: true,
      description: 'Premium quality Basmati rice grown in the fertile plains of Punjab. Known for its long grains, aromatic fragrance, and excellent taste. Perfect for biryanis, pulao, and other rice dishes. Grown using traditional farming methods with minimal use of chemicals.',
      specifications: {
        variety: 'Basmati 1121',
        grade: 'Grade A',
        moisture: '12-14%',
        purity: '99.5%',
        packaging: '50kg jute bags',
      },
      certifications: ['Organic Certified', 'FSSAI Approved', 'Export Quality'],
      reviews_list: [
        {
          id: '1',
          buyer: 'Priya Sharma',
          rating: 5,
          comment: 'Excellent quality rice! Very aromatic and cooks perfectly. Will definitely order again.',
          date: '2024-01-20',
        },
        {
          id: '2',
          buyer: 'Amit Patel',
          rating: 4,
          comment: 'Good quality rice, delivered on time. Packaging was also good.',
          date: '2024-01-18',
        },
        {
          id: '3',
          buyer: 'Sunita Devi',
          rating: 5,
          comment: 'Best basmati rice I have purchased online. Highly recommended!',
          date: '2024-01-16',
        },
      ],
    };

    setTimeout(() => {
      setProduct(mockProduct);
      setIsLoading(false);
    }, 1000);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <Link to="/marketplace" className="text-emerald-600 hover:text-emerald-700">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl p-8 mb-4 flex items-center justify-center h-96">
              <div className="text-8xl">{product.images[selectedImage]}</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg p-4 flex items-center justify-center h-20 ${
                    selectedImage === index ? 'ring-2 ring-emerald-500' : ''
                  }`}
                >
                  <div className="text-2xl">{image}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <div className="flex items-center space-x-4">
                  {product.organic && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Organic
                    </span>
                  )}
                  {product.verified && (
                    <div className="flex items-center text-blue-600">
                      <CheckBadgeIcon className="h-5 w-5 mr-1" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <ShareIcon className="h-6 w-6 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600 ml-2">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center text-3xl font-bold text-emerald-600 mb-2">
                <CurrencyRupeeIcon className="h-8 w-8" />
                {product.price}
                <span className="text-lg text-gray-600 ml-1">/{product.unit}</span>
              </div>
              <div className="text-gray-600">
                <ScaleIcon className="h-4 w-4 inline mr-1" />
                {product.quantity} {product.unit} available
              </div>
            </div>

            {/* Farmer Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserIcon className="h-10 w-10 text-gray-400 mr-3" />
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-semibold text-gray-900">{product.farmer.name}</h3>
                      {product.farmer.verified && (
                        <CheckBadgeIcon className="h-4 w-4 text-blue-500 ml-1" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 inline mr-1" />
                      {product.farmer.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      {product.farmer.rating} • {product.farmer.totalSales} sales
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200">
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                    <PhoneIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity ({product.unit})
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-3 py-2 text-center border-0 focus:outline-none"
                    min="1"
                    max={product.quantity}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Total: ₹{(product.price * quantity).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-8">
              <button className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center">
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
              <button className="px-6 py-3 border border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors font-medium">
                Buy Now
              </button>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Harvested: {new Date(product.harvestDate).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <TruckIcon className="h-4 w-4 mr-2" />
                Delivery: {product.deliveryTime}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Quality Assured
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Description */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

                <h4 className="font-semibold text-gray-900 mb-3">Specifications</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Variety:</span>
                    <span className="text-gray-600 ml-2">{product.specifications.variety}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Grade:</span>
                    <span className="text-gray-600 ml-2">{product.specifications.grade}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Moisture:</span>
                    <span className="text-gray-600 ml-2">{product.specifications.moisture}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Purity:</span>
                    <span className="text-gray-600 ml-2">{product.specifications.purity}</span>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 mb-3 mt-6">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                  {product.reviews_list.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4">
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">{review.buyer}</span>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {new Date(review.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to={`/marketplace/${product.id}/reviews`}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-4 inline-block"
                >
                  View All Reviews ({product.reviews})
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
