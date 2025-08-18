# GrainChain - AI-Powered Agricultural Trade Platform

## Overview
GrainChain connects farmers directly with institutional buyers while providing seamless access to finance through an AI-powered platform. Our solution streamlines agricultural trade, reduces intermediaries, and democratizes access to financial services for farmers.


## Key Features

### For Farmers
- List crops with AI-recommended pricing
- Access to multiple loan products and financing options
- Credit assessment and eligibility checking
- Direct connection with institutional buyers
- Transaction history and payment tracking

### For Buyers
- Browse available crop inventory
- Filter by location, quality, and quantity
- Direct communication with farmers
- Streamlined procurement process
- Payment processing and transaction management

### For Financiers
- AI-powered credit scoring system
- Loan application review workflow
- Risk-based pricing models
- Disbursement and repayment tracking
- Portfolio management dashboard

## Architecture

### Backend
- **Framework**: FastAPI
- **Database**: MongoDB
- **Caching**: Redis
- **Authentication**: JWT with HTTPBearer
- **API Documentation**: OpenAPI/Swagger

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with HeadlessUI components
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **API Integration**: Axios + React Query
- **Routing**: React Router v6

### AI/ML Components
- Price prediction algorithms
- Credit scoring and risk assessment
- Crop recommendation engine
- Market trend analysis
- Fraud detection

## Finance Module
Our comprehensive finance module supports:
- Multiple loan products (crop loans, equipment loans, working capital)
- Complete loan lifecycle management
- AI-powered credit assessment
- Payment processing with gateway integrations
- Transaction history and reporting

## Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
```bash
# MongoDB setup instructions
# Run migrations if applicable
```

## Development Workflow
1. Clone the repository
2. Set up environment variables (copy `.env.example` to `.env`)
3. Install dependencies for both backend and frontend
4. Run the development servers
5. Access the API docs at http://localhost:8000/docs
6. Access the frontend at http://localhost:5173

## Environment Variables
Copy `.env.example` to `.env` and configure:
- MONGODB_URI
- REDIS_URL
- JWT_SECRET_KEY
- API_V1_STR
- CORS_ORIGINS
- Other service-specific credentials

## Deployment
- **Backend**: Railway/Render
- **Frontend**: Vercel/Netlify
- **Database**: MongoDB Atlas
- **Caching**: Redis Cloud

## Contributing
Please read our contribution guidelines before submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
