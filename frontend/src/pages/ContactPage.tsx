import React, { useState } from 'react';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  GlobeAltIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    userType: 'farmer',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        userType: 'farmer',
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactMethods = [
    {
      icon: PhoneIcon,
      title: 'Phone Support',
      description: '24/7 customer support',
      contact: '1800-123-4567',
      subtext: 'Toll-free across India',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Support',
      description: 'Get help via email',
      contact: 'support@grainchain.com',
      subtext: 'Response within 24 hours',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Live Chat',
      description: 'Instant messaging support',
      contact: 'Available 9 AM - 9 PM',
      subtext: 'Quick responses guaranteed',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: UserGroupIcon,
      title: 'Field Support',
      description: 'On-ground assistance',
      contact: 'Regional coordinators',
      subtext: '500+ locations across India',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const offices = [
    {
      city: 'New Delhi',
      address: 'A-123, Sector 63, Noida, UP 201301',
      phone: '+91-11-4567-8900',
      type: 'Head Office',
    },
    {
      city: 'Mumbai',
      address: 'Office 456, Andheri East, Mumbai, MH 400069',
      phone: '+91-22-2345-6789',
      type: 'Regional Office',
    },
    {
      city: 'Bangalore',
      address: 'Tech Park, Electronic City, Bangalore, KA 560100',
      phone: '+91-80-1234-5678',
      type: 'Tech Center',
    },
    {
      city: 'Chandigarh',
      address: 'SCO 789, Sector 34-A, Chandigarh 160022',
      phone: '+91-172-987-6543',
      type: 'Agricultural Hub',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              We're here to help you succeed in agricultural trading. Reach out to our expert team.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {contactMethods.map((method, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className={`${method.bgColor} p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                <method.icon className={`h-8 w-8 ${method.color}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
              <p className="text-gray-600 mb-3">{method.description}</p>
              <div className="font-semibold text-gray-900">{method.contact}</div>
              <div className="text-sm text-gray-500">{method.subtext}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600">Thank you for contacting us. We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      I am a *
                    </label>
                    <select
                      name="userType"
                      value={formData.userType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="farmer">Farmer</option>
                      <option value="buyer">Buyer</option>
                      <option value="financier">Financier</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Please describe your inquiry in detail..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending Message...
                    </div>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Office Locations */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Offices</h2>
            <div className="space-y-6">
              {offices.map((office, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{office.city}</h3>
                      <span className="text-sm text-emerald-600 font-medium">{office.type}</span>
                    </div>
                    <MapPinIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-start">
                      <MapPinIcon className="h-4 w-4 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">{office.address}</span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{office.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <ClockIcon className="h-6 w-6 mr-2 text-emerald-600" />
                Business Hours
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
                <div className="border-t pt-2 mt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Emergency Support</span>
                    <span className="font-medium text-emerald-600">24/7 Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do I register as a farmer?</h3>
              <p className="text-gray-600 text-sm">
                Click on "Get Started" and select "Farmer" during registration. You'll need to provide your farm details and documentation for verification.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What are the transaction fees?</h3>
              <p className="text-gray-600 text-sm">
                We offer zero commission on your first 10 transactions. After that, a nominal 2% fee applies to successful transactions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How is payment security ensured?</h3>
              <p className="text-gray-600 text-sm">
                All payments are processed through secure, encrypted channels with escrow protection until delivery confirmation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do you provide crop insurance?</h3>
              <p className="text-gray-600 text-sm">
                Yes, we partner with leading insurance providers to offer comprehensive crop and weather insurance coverage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
