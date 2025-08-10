# GrainChain MVP - AI-Powered Agricultural Trade Platform

## Overview
GrainChain connects farmers directly with institutional buyers while providing seamless access to finance through an AI-powered platform.

## Architecture
- **Backend**: FastAPI + PostgreSQL + Redis
- **Frontend**: React.js + TypeScript + Tailwind CSS
- **AI/ML**: Price prediction, credit scoring, recommendations
- **Deployment**: Railway/Render (backend), Vercel/Netlify (frontend)

## User Types
- **Farmers**: List crops, get price recommendations, find buyers
- **Buyers**: Browse inventory, contact farmers, manage procurement
- **Financiers**: Provide loans, assess credit, manage applications

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
npm start
```

### Database Setup
```bash
# PostgreSQL setup
createdb grainchain_db
# Run migrations
alembic upgrade head
```

## Development Timeline
- **Week 1**: Authentication & basic UI
- **Week 2**: Core models & farmer functionality
- **Week 3**: Buyer dashboard & messaging
- **Week 4**: AI components integration
- **Week 5**: Finance module
- **Week 6**: Payment integration & deployment

## API Documentation
Once running, visit: http://localhost:8000/docs

## Environment Variables
Copy `.env.example` to `.env` and configure:
- DATABASE_URL
- REDIS_URL
- JWT_SECRET_KEY
- CLOUDINARY_URL (for file uploads)
