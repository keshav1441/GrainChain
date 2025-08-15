import React, { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  CalculatorIcon,
  BanknotesIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentCheckIcon,
  LockClosedIcon,
  HandThumbUpIcon,
  CurrencyRupeeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface LoanProduct {
  id: string;
  name: string;
  description: string;
  interestRate: number;
  maxAmount: number;
  tenure: string;
  processingTime: string;
  eligibility: string[];
  features: string[];
  icon: string;
  popular: boolean;
}

interface FinancialService {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  cta: string;
}

const FinancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('loans');
  const [loanAmount, setLoanAmount] = useState(100000);
  const [loanTenure, setLoanTenure] = useState(12);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const loanProducts: LoanProduct[] = [];

  const financialServices: FinancialService[] = [];

  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const monthlyRate = rate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  };

  const emi = calculateEMI(loanAmount, 8.5, loanTenure);
  const totalAmount = emi * loanTenure;
  const totalInterest = totalAmount - loanAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              💰 Agricultural Finance Hub
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Empowering farmers with accessible credit, insurance, and financial services
            </p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold">₹500Cr+</div>
                <div className="text-white/80">Loans Disbursed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold">50,000+</div>
                <div className="text-white/80">Farmers Financed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold">7.5%</div>
                <div className="text-white/80">Starting Interest Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            <div className="flex space-x-2">
              {[
                { id: 'loans', label: 'Loans', icon: BanknotesIcon },
                { id: 'services', label: 'Services', icon: CreditCardIcon },
                { id: 'calculator', label: 'EMI Calculator', icon: CalculatorIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loans Tab */}
        {activeTab === 'loans' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Loan Product</h2>
              <p className="text-xl text-gray-600">Tailored financing solutions for every agricultural need</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {loanProducts.map((loan) => (
                <div
                  key={loan.id}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden ${
                    loan.popular ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {loan.popular && (
                    <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="text-4xl mr-4">{loan.icon}</div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{loan.name}</h3>
                        <p className="text-gray-600">{loan.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">{loan.interestRate}%</div>
                        <div className="text-sm text-gray-600">Interest Rate</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-emerald-600">
                          ₹{(loan.maxAmount / 100000).toFixed(0)}L
                        </div>
                        <div className="text-sm text-gray-600">Max Amount</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-lg font-bold text-purple-600">{loan.tenure}</div>
                        <div className="text-sm text-gray-600">Tenure</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-lg font-bold text-orange-600">{loan.processingTime}</div>
                        <div className="text-sm text-gray-600">Processing</div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {loan.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Eligibility</h4>
                      <div className="space-y-2">
                        {loan.eligibility.map((criteria, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <DocumentCheckIcon className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                            {criteria}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                        Apply Now
                      </button>
                      <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Financial Services</h2>
              <p className="text-xl text-gray-600">Comprehensive financial solutions beyond lending</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {financialServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-8"
                >
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-2xl mr-4">
                      <service.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
                      <p className="text-gray-600">{service.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                    <div className="space-y-2">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-gray-600">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                    {service.cta}
                  </button>
                </div>
              ))}
            </div>

            {/* Additional Services */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose GrainChain Finance?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-green-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <LockClosedIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Secure & Trusted</h4>
                  <p className="text-gray-600">Bank-grade security with regulatory compliance</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <ClockIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Quick Processing</h4>
                  <p className="text-gray-600">Fast approval and disbursement within 24-48 hours</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <HandThumbUpIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Customer First</h4>
                  <p className="text-gray-600">24/7 support in local languages</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMI Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">EMI Calculator</h2>
              <p className="text-xl text-gray-600">Calculate your loan EMI and plan your finances</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calculator Inputs */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Loan Details</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Amount
                    </label>
                    <div className="relative">
                      <CurrencyRupeeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="range"
                        min="50000"
                        max="5000000"
                        step="10000"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                        className="w-full mt-2"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>₹50K</span>
                        <span className="font-semibold">₹{(loanAmount / 100000).toFixed(1)}L</span>
                        <span>₹50L</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Tenure (Months)
                    </label>
                    <input
                      type="range"
                      min="6"
                      max="180"
                      step="6"
                      value={loanTenure}
                      onChange={(e) => setLoanTenure(Number(e.target.value))}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>6 months</span>
                      <span className="font-semibold">{loanTenure} months</span>
                      <span>15 years</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Rate (Annual)
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">8.5% p.a.</div>
                      <div className="text-sm text-gray-600">Starting rate for crop loans</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculator Results */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">EMI Breakdown</h3>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        ₹{emi.toLocaleString()}
                      </div>
                      <div className="text-gray-600">Monthly EMI</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="text-xl font-bold text-emerald-600">
                        ₹{loanAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Principal Amount</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="text-xl font-bold text-orange-600">
                        ₹{totalInterest.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Interest</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="text-xl font-bold text-purple-600 text-center">
                      ₹{totalAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 text-center">Total Amount Payable</div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-3">Quick Facts</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Loan-to-Income Ratio:</span>
                        <span className="font-medium">Depends on income</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Fee:</span>
                        <span className="font-medium">0.5% - 2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prepayment:</span>
                        <span className="font-medium">Allowed</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                    Apply for This Loan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl shadow-xl p-8 mt-16 text-white">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Need Help? We're Here for You!</h3>
            <p className="text-xl text-white/90">
              Our financial experts are ready to assist you with personalized solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/10 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <PhoneIcon className="h-8 w-8" />
              </div>
              <h4 className="font-semibold mb-2">Call Us</h4>
              <p className="text-white/80">1800-123-4567</p>
              <p className="text-sm text-white/70">24/7 Support Available</p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8" />
              </div>
              <h4 className="font-semibold mb-2">Live Chat</h4>
              <p className="text-white/80">Instant Support</p>
              <p className="text-sm text-white/70">Available 9 AM - 9 PM</p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <UserGroupIcon className="h-8 w-8" />
              </div>
              <h4 className="font-semibold mb-2">Branch Visit</h4>
              <p className="text-white/80">Meet Our Experts</p>
              <p className="text-sm text-white/70">500+ Branches Nationwide</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
