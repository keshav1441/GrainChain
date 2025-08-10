# GrainChain Finance Module Documentation

## Overview

The GrainChain Finance Module provides comprehensive financial services for agricultural lending and payment processing. It integrates with the AI/ML module for automated credit assessment and supports the complete loan lifecycle from application to disbursement.

## Features

### 🏦 Loan Management
- **Multiple Loan Products**: Crop loans, Equipment loans, Working Capital, Term loans, Kisan Credit Card
- **Automated Credit Assessment**: AI/ML powered credit scoring and risk assessment
- **Complete Workflow**: Application → Review → Approval → Disbursement
- **Role-based Access**: Farmers apply, Financiers review, Admins monitor

### 💳 Payment Processing
- **Multiple Payment Types**: Transactions, Commissions, Loan processing fees, Disbursements
- **Payment Gateway Integration**: Ready for Razorpay, Stripe, PayU integration
- **Transaction History**: Complete payment tracking and history
- **Real-time Status Updates**: Pending, Processing, Completed, Failed

### 📊 Credit Assessment
- **AI-Powered Scoring**: Uses machine learning for credit score calculation
- **Risk-based Pricing**: Interest rates adjusted based on credit profile
- **Automated Decisions**: Auto-approval for excellent credit scores
- **Comprehensive Factors**: Income, assets, farming experience, diversification

## API Endpoints

### Loan Management

#### Create Loan Application
```http
POST /api/v1/finance/loan-applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "loan_type": "crop_loan",
  "requested_amount": 100000.0,
  "loan_purpose": "Wheat cultivation for Rabi season",
  "repayment_period_months": 12,
  "income_proof_doc": "income_proof.pdf",
  "land_documents": "land_records.pdf",
  "bank_statements": "bank_statement.pdf"
}
```

#### Submit Application for Review
```http
POST /api/v1/finance/loan-applications/{application_id}/submit
Authorization: Bearer <token>
```

#### Review Application (Financier)
```http
POST /api/v1/finance/loan-applications/{application_id}/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "decision": "approve",
  "notes": "Good credit profile and solid farming experience"
}
```

#### Disburse Loan (Financier)
```http
POST /api/v1/finance/loan-applications/{application_id}/disburse
Authorization: Bearer <token>
```

#### Get Loan Applications
```http
GET /api/v1/finance/loan-applications?status=submitted
Authorization: Bearer <token>
```

#### Get Loan Eligibility (Farmer)
```http
GET /api/v1/finance/eligibility
Authorization: Bearer <token>
```

### Payment Processing

#### Create Payment
```http
POST /api/v1/finance/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "payee_id": "farmer_123",
  "amount": 25000.0,
  "payment_type": "transaction",
  "description": "Payment for 500kg wheat"
}
```

#### Get Payment History
```http
GET /api/v1/finance/payments?limit=50
Authorization: Bearer <token>
```

#### Get Payment Details
```http
GET /api/v1/finance/payments/{payment_id}
Authorization: Bearer <token>
```

## Data Models

### LoanApplication
```python
{
  "id": "string",
  "application_id": "LOAN_20241210_ABC12345",
  "farmer_id": "string",
  "financier_id": "string",
  "loan_type": "crop_loan",
  "requested_amount": 100000.0,
  "approved_amount": 90000.0,
  "interest_rate": 8.5,
  "processing_fee": 900.0,
  "status": "approved",
  "credit_score": 720,
  "credit_score_range": "good",
  "risk_assessment": "low",
  "application_date": "2024-12-10T10:00:00Z",
  "approval_date": "2024-12-11T15:30:00Z"
}
```

### Payment
```python
{
  "id": "string",
  "payment_id": "PAY_20241210_XYZ98765",
  "amount": 25000.0,
  "currency": "INR",
  "payment_type": "transaction",
  "status": "completed",
  "payer_user_id": "buyer_123",
  "payee_user_id": "farmer_456",
  "gateway_provider": "razorpay",
  "gateway_payment_id": "pay_abc123def456",
  "initiated_at": "2024-12-10T12:00:00Z",
  "completed_at": "2024-12-10T12:02:15Z"
}
```

## Loan Types and Terms

### 1. Crop Loan
- **Purpose**: Short-term financing for crop cultivation
- **Amount Range**: ₹10,000 - ₹5,00,000
- **Tenure**: 6-12 months
- **Base Interest Rate**: 9.0%
- **Eligibility**: Credit score 500+

### 2. Equipment Loan
- **Purpose**: Purchase of agricultural equipment
- **Amount Range**: ₹50,000 - ₹10,00,000
- **Tenure**: 12-60 months
- **Base Interest Rate**: 11.0%
- **Eligibility**: Credit score 600+

### 3. Working Capital
- **Purpose**: General farming operations
- **Amount Range**: ₹25,000 - ₹7,50,000
- **Tenure**: 12-36 months
- **Base Interest Rate**: 12.0%
- **Eligibility**: Credit score 550+

### 4. Kisan Credit Card
- **Purpose**: Flexible credit facility
- **Amount Range**: ₹25,000 - ₹3,00,000
- **Tenure**: 12 months (renewable)
- **Base Interest Rate**: 7.0%
- **Eligibility**: Credit score 650+

## Credit Scoring System

### Score Ranges
- **Excellent (750+)**: Auto-approval, best rates, full amount
- **Good (650-749)**: Fast approval, good rates, 90% amount
- **Fair (550-649)**: Manual review, standard rates, 80% amount
- **Poor (<550)**: High scrutiny, premium rates, 60% amount

### Factors Considered
- **Annual Income** (30%)
- **Farm Size and Assets** (25%)
- **Farming Experience** (20%)
- **Crop Diversification** (15%)
- **Insurance Coverage** (10%)

### Interest Rate Adjustments
- **Excellent Credit**: -1.5% discount
- **Good Credit**: -0.5% discount
- **Fair Credit**: +1.0% premium
- **Poor Credit**: +2.5% premium

## Payment Gateway Integration

### Supported Gateways
1. **Razorpay** (Primary)
   - UPI, Cards, Net Banking, Wallets
   - Instant settlements
   - Comprehensive APIs

2. **Stripe** (International)
   - Global payment methods
   - Advanced fraud detection
   - Developer-friendly

3. **PayU** (Alternative)
   - Local payment methods
   - EMI options
   - Merchant solutions

### Payment Flow
1. **Initiate**: Create payment record
2. **Process**: Send to payment gateway
3. **Verify**: Webhook confirmation
4. **Complete**: Update status and notify users
5. **Settle**: Transfer funds to payee

## Security Features

### Data Protection
- **Encryption**: All sensitive data encrypted at rest
- **PCI Compliance**: Payment data handled securely
- **Access Control**: Role-based permissions
- **Audit Logging**: Complete transaction trails

### Fraud Prevention
- **Risk Scoring**: AI-based fraud detection
- **Velocity Checks**: Transaction frequency limits
- **Device Fingerprinting**: Suspicious device detection
- **Manual Review**: High-risk transaction flagging

## Workflow States

### Loan Application States
```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED → DISBURSED → ACTIVE → COMPLETED
```

### Payment States
```
PENDING → PROCESSING → COMPLETED/FAILED
```

## Integration Points

### AI/ML Module
- Credit score calculation
- Risk assessment
- Loan recommendations
- Fraud detection

### User Management
- Role-based access control
- Profile verification
- KYC compliance

### Notification System
- Application status updates
- Payment confirmations
- Due date reminders

## Testing

### Test Coverage
- Unit tests for all service methods
- Integration tests for API endpoints
- End-to-end workflow testing
- Payment gateway mocking

### Test Data
- Multiple user profiles
- Various loan scenarios
- Payment success/failure cases
- Edge case handling

## Deployment Considerations

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/grainchain

# Payment Gateways
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret

# Security
JWT_SECRET_KEY=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

### Production Setup
1. **Database**: MongoDB Atlas or self-hosted
2. **Payment Gateways**: Production credentials
3. **SSL/TLS**: HTTPS enforcement
4. **Monitoring**: Application and transaction monitoring
5. **Backups**: Regular database backups

## Monitoring and Analytics

### Key Metrics
- **Loan Applications**: Volume, approval rates, default rates
- **Payments**: Success rates, processing times, failure reasons
- **Credit Scores**: Distribution, accuracy, model performance
- **User Activity**: Application patterns, payment behavior

### Dashboards
- **Admin Dashboard**: Overall system metrics
- **Financier Dashboard**: Portfolio performance
- **Farmer Dashboard**: Application status, payment history

## Future Enhancements

### Planned Features
1. **Mobile Payments**: UPI integration, mobile wallets
2. **Loan Marketplace**: Multiple lender competition
3. **Insurance Integration**: Crop insurance bundling
4. **Blockchain**: Transparent loan records
5. **Advanced Analytics**: Predictive modeling, market insights

### API Versioning
- Current version: v1
- Backward compatibility maintained
- Deprecation notices for breaking changes

## Support and Maintenance

### Error Handling
- Comprehensive error messages
- Retry mechanisms for transient failures
- Graceful degradation for service outages

### Logging
- Structured logging with correlation IDs
- Performance metrics collection
- Security event monitoring

### Documentation
- API documentation with examples
- Integration guides for partners
- Troubleshooting guides

---

## Quick Start Guide

### 1. Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export MONGODB_URI="mongodb://localhost:27017/grainchain"

# Initialize database
python -c "from app.core.database import init_db; asyncio.run(init_db())"
```

### 2. Test Finance Module
```bash
# Run integration tests
python test_finance_integration.py

# Run API tests
pytest app/tests/test_finance_api.py
```

### 3. Start Application
```bash
# Start FastAPI server
uvicorn app.main:app --reload --port 8000

# Access API documentation
# http://localhost:8000/docs
```

### 4. Create First Loan Application
```bash
# Register as farmer
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer@example.com","password":"password123","role":"farmer"}'

# Login and get token
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer@example.com","password":"password123"}'

# Create loan application
curl -X POST "http://localhost:8000/api/v1/finance/loan-applications" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"loan_type":"crop_loan","requested_amount":50000,"loan_purpose":"Wheat cultivation","repayment_period_months":12}'
```

This completes the comprehensive Finance Module implementation for GrainChain! 🚀
