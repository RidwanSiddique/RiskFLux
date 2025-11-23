# RiskFlux 🌍⚠️

A modern, full-stack web application for computing natural hazard risk scores at any geographic location. RiskFlux combines flood, storm, and snow hazard assessments into a comprehensive risk intelligence platform.

## 📋 Project Overview

RiskFlux is a Natural Hazard Risk Assessment Platform that helps users understand environmental vulnerabilities at specific geographic locations. The system computes multi-factor risk scores considering:

- **Flood Risk**: Proximity to water bodies and elevation analysis
- **Storm Risk**: Historical storm exposure indices
- **Snow Risk**: Latitude-based snow severity assessment
- **Overall Risk**: Aggregate hazard score combining all factors

### Key Features

✅ **Real-time Hazard Scoring** - Compute risk scores instantly for any latitude/longitude  
✅ **Multi-factor Analysis** - Considers distance to water, elevation, storm exposure, and snow severity  
✅ **Factor Contribution Tracking** - Understand which environmental factors drive risk  
✅ **Location-based API** - RESTful API for programmatic access  
✅ **Modern UI Dashboard** - Intuitive web interface for risk assessment  
✅ **Scalable Architecture** - Docker-ready for easy deployment  

## 🏗️ Architecture

### Technology Stack

**Backend:**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js v5
- **Database**: PostgreSQL 17
- **ORM**: Prisma v6
- **Server**: ts-node-dev for development

**Frontend:**
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack React Query v5
- **HTTP Client**: Axios

**DevOps:**
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 17 with persistent volumes

### Project Structure

```
RiskFlux/
├── backend/                          # Node.js/Express API
│   ├── src/
│   │   ├── index.ts                 # Entry point
│   │   ├── app.ts                   # Express app setup
│   │   ├── config/
│   │   │   ├── env.ts              # Environment variables
│   │   │   └── modelConfig.ts      # Hazard model configuration
│   │   ├── controllers/
│   │   │   └── hazardScoreController.ts    # Request handlers
│   │   ├── services/
│   │   │   └── hazardScoreService.ts       # Business logic
│   │   ├── utils/
│   │   │   └── scoringUtils.ts     # Hazard computation algorithms
│   │   ├── routes/
│   │   │   └── hazardScoreRoutes.ts        # API routes
│   │   ├── db/
│   │   │   └── prismaClient.ts     # Database client
│   │   ├── middlewares/
│   │   │   └── errorHandler.ts     # Error handling
│   │   └── docs/                    # API documentation
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   └── migrations/             # Database migrations
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                         # Next.js React App
│   ├── app/
│   │   ├── dashboard/              # Dashboard page
│   │   │   └── page.tsx           # Main UI component
│   │   ├── layout.tsx             # Root layout with providers
│   │   └── globals.css            # Global styles
│   ├── lib/
│   │   ├── apiClient.ts           # Axios HTTP client
│   │   ├── types.ts               # TypeScript type definitions
│   │   └── config.ts              # Frontend configuration
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.ts
│
├── docker-compose.yml              # Multi-container orchestration
└── README.md                        # This file
```

## 🚀 Quick Start with Docker

The easiest way to get started is using Docker Compose. This automatically sets up PostgreSQL and all dependencies.

### Prerequisites

- **Docker** (v20.10+) - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** (v1.29+) - Usually included with Docker Desktop
- **Git** - For cloning the repository

### Setup & Run (3 Easy Steps)

#### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/RiskFlux.git
cd RiskFlux
```

#### Step 2: Start Services with Docker Compose

```bash
docker-compose up -d
```

This command:
- Starts PostgreSQL database on port `5433`
- Creates the database `riskfluxintel`
- Sets up persistent data volumes

**Output:**
```
[+] Running 2/2
 ✓ Network riskflux_default        Created
 ✓ Container risk-flux-db           Started
```

#### Step 3: Setup Backend & Frontend

**In Terminal 1 - Backend Setup:**

```bash
cd backend

# Install dependencies
npm install

# Run Prisma migrations
npx prisma migrate dev

# Start development server (runs on port 4000)
npm run dev
```

**In Terminal 2 - Frontend Setup:**

```bash
cd frontend

# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev
```

### Access the Application

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:4000/api/v1
- **Database**: PostgreSQL on localhost:5433

## 📖 Usage Guide

### Web Dashboard

1. Open http://localhost:3000 in your browser
2. Enter location details:
   - Optional address description
   - Latitude (e.g., 52.1332)
   - Longitude (e.g., -106.6700)
3. Click "Get Hazard Score"
4. View results:
   - Overall, Flood, Storm, and Snow scores (0-100)
   - Risk driver contributions showing which factors impact the score

### API Endpoints

#### Calculate Hazard Score

**POST** `/api/v1/hazard-score`

Request Body:
```json
{
  "latitude": 52.1332,
  "longitude": -106.6700,
  "address": "Saskatchewan, Canada"
}
```

Response:
```json
{
  "id": "cuid_id",
  "overallScore": 45,
  "floodScore": 38,
  "stormScore": 52,
  "snowScore": 41,
  "location": {
    "id": "loc_id",
    "latitude": 52.1332,
    "longitude": -106.6700,
    "address": "Saskatchewan, Canada"
  },
  "modelVersion": {
    "id": "model_id",
    "name": "v1.0-natural-hazards",
    "description": "Baseline natural hazard model..."
  },
  "factors": [
    {
      "id": "factor_id",
      "factorName": "distance_to_water_km",
      "factorValue": 2.5,
      "weight": 0.4,
      "contribution": 40.2
    }
    // ... more factors
  ]
}
```

#### Get Hazard Score by ID

**GET** `/api/v1/hazard-score/:id`

## 🔧 Environment Configuration

### Backend (.env)

Create `.env` file in `backend/` directory:

```env
# Database Connection
DATABASE_URL="postgresql://riskfluxuser:riskfluxpass@localhost:5433/riskfluxintel?schema=public"

# Server
PORT=4000
NODE_ENV=development
```

### Frontend (.env.local)

Create `.env.local` file in `frontend/` directory:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

## 📊 Database Schema

The project uses Prisma ORM with the following models:

### Core Models

- **Location**: Geographic coordinates and address
- **HazardScore**: Multi-factor risk assessment result
- **HazardFactorContribution**: Individual factor impact on risk score
- **ModelVersion**: Hazard model configuration and versioning

### Supporting Models

- **KnowledgeBaseArticle**: Educational content about hazards
- **Feedback**: User feedback and issue reports
- **ApiKey**: API authentication for programmatic access

## 🏭 Production Deployment

### Build for Production

**Backend:**
```bash
cd backend
npm run build
npm run start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run start
```

### Docker Production Build

```bash
# Build backend image
docker build -f backend.Dockerfile -t riskflux-backend:latest .

# Build frontend image  
docker build -f frontend.Dockerfile -t riskflux-frontend:latest .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🔨 Development Commands

### Backend

```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm run start    # Run production build
```

### Prisma Migrations

```bash
# Create and apply new migration
npx prisma migrate dev --name migration_name

# Rollback to previous state
npx prisma migrate resolve --rolled-back migration_name

# View migration status
npx prisma migrate status

# Generate Prisma Client
npx prisma generate

# Validate schema
npx prisma validate
```

### Frontend

```bash
npm run dev      # Start Next.js dev server with hot reload
npm run build    # Build for production
npm run start    # Run production server
npm run lint     # Run ESLint
```

## 🐛 Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

**Solution**:
```bash
# Verify PostgreSQL is running
docker ps | grep risk-flux-db

# Check database logs
docker logs risk-flux-db

# Restart database
docker restart risk-flux-db
```

### Port Already in Use

**Error**: `Port 5433 is already allocated`

**Solution**:
```bash
# Change port in docker-compose.yml
# Or kill existing process:
lsof -i :5433  # macOS/Linux
# Then find PID and kill it
```

### Prisma Migration Conflicts

**Error**: `Migration not found`

**Solution**:
```bash
cd backend
# Reset database (clears all data!)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name fix_issue
```

### Frontend Build Errors

**Error**: `Module not found '@/lib/types'`

**Solution**: Ensure path aliases in `tsconfig.json` are correct:
```json
"paths": {
  "@/*": ["./*"]
}
```

## 📈 Hazard Scoring Model

The system uses a weighted multi-factor model:

```
Overall Risk = (Flood Score + Storm Score + Snow Score) / 3

Flood Risk = (Distance Weight × Distance Factor) + (Elevation Weight × Elevation Factor)
Storm Risk = Storm Weight × Storm Index × 100
Snow Risk = Snow Weight × Snow Index × 100

Clamped to [0, 100] integer range
```

### Model Configuration

Default model: `v1.0-natural-hazards`

**Weights:**
- Distance to Water: 0.4
- Elevation: -0.3
- Storm Index: 0.2
- Snow Index: 0.1

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Contact the maintainers

## 🗺️ Roadmap

- [ ] Advanced visualization (heat maps, geographic overlays)
- [ ] Historical data trends and predictions
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Real-time weather data integration
- [ ] Custom model creation interface
- [ ] API rate limiting and analytics dashboard
- [ ] OAuth2 authentication
- [ ] Batch processing for multiple locations
- [ ] Export results (PDF, CSV, GeoJSON)

## ✨ What You've Accomplished

This project demonstrates:

✅ **Full-Stack Development**: Modern TypeScript/Node.js backend with Next.js frontend  
✅ **Database Design**: Relational schema with Prisma ORM and migrations  
✅ **API Design**: RESTful endpoints with proper error handling  
✅ **Deployment**: Docker containerization for reproducible environments  
✅ **Type Safety**: End-to-end TypeScript for reliability  
✅ **Modern DevOps**: Docker Compose for local development  
✅ **Scalable Architecture**: Separation of concerns with services and controllers  

---

**Happy Risk Assessing! 🚀**
