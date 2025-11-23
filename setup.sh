#!/bin/bash

# RiskFlux Quick Setup Script
# Automates the complete setup process

set -e  # Exit on any error

echo "🌍 RiskFlux Setup Script"
echo "========================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}❌ Docker is not installed. Please install Docker first.${NC}"
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓ Docker found${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}❌ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose found${NC}"

if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}❌ Git is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git found${NC}"

echo ""

# Step 1: Start Docker
echo -e "${BLUE}🐳 Starting Docker containers...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Database started${NC}"

# Wait for database to be ready
echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
sleep 5

echo ""

# Step 2: Backend setup
echo -e "${BLUE}🔧 Setting up backend...${NC}"
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "Backend dependencies already installed"
fi
echo -e "${GREEN}✓ Backend dependencies ready${NC}"

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations completed${NC}"
else
    echo -e "${YELLOW}⚠️  Migrations not found, initializing database...${NC}"
    npx prisma migrate dev --name init
fi

cd ..

echo ""

# Step 3: Frontend setup
echo -e "${BLUE}🎨 Setting up frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Frontend dependencies already installed"
fi
echo -e "${GREEN}✓ Frontend dependencies ready${NC}"

cd ..

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Start backend (Terminal 1):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2. Start frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Open browser:"
echo "   🌐 http://localhost:3000"
echo ""
echo "📚 Full documentation: See README.md"
echo ""
