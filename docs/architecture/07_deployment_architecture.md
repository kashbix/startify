# 🚀 Deployment Architecture

## 1. Overview

STRATA-AI uses a modern JAMstack-style deployment with separate hosting for frontend and backend, all on free tiers.

```
┌─────────────────────────────────────────────────────────────────┐
│                  DEPLOYMENT ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                        ┌─────────────┐                          │
│                        │   GitHub    │                          │
│                        │ Repository  │                          │
│                        └──────┬──────┘                          │
│                               │                                  │
│              ┌────────────────┼────────────────┐                │
│              │                │                │                │
│              ▼                ▼                ▼                │
│     ┌────────────────┐ ┌────────────┐ ┌────────────────┐       │
│     │  Vercel        │ │  Render    │ │ MongoDB Atlas  │       │
│     │  (Frontend)    │ │  (Backend) │ │  (Database)    │       │
│     │                │ │            │ │                │       │
│     │  React SPA     │ │  FastAPI   │ │  Free M0       │       │
│     │  CDN + Edge    │ │  Docker    │ │  512MB         │       │
│     └────────────────┘ └────────────┘ └────────────────┘       │
│              │                │                │                │
│              └────────────────┼────────────────┘                │
│                               │                                  │
│                               ▼                                  │
│                      ┌────────────────┐                         │
│                      │  LLM Providers │                         │
│                      │  Groq/Gemini   │                         │
│                      └────────────────┘                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Infrastructure Components

| Component | Provider | Tier | Limits |
|-----------|----------|------|--------|
| Frontend | Vercel | Free | 100GB bandwidth, unlimited deploys |
| Backend | Render | Free | 750 hrs/month, 512MB RAM, auto-sleep |
| Database | MongoDB Atlas | M0 Free | 512MB storage, 500 connections |
| LLM (Default) | Groq | Free | ~30 req/min |
| LLM (Fallback) | Google AI | Free | 60 req/min |

## 3. Frontend Deployment (Vercel)

### 3.1 Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 3.2 Environment Variables (Vercel Dashboard)

```bash
VITE_API_URL=https://strata-ai-api.onrender.com/api/v1
VITE_APP_NAME=STRATA-AI
VITE_ENVIRONMENT=production
```

### 3.3 Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          ui: ['framer-motion', '@headlessui/react'],
        },
      },
    },
  },
});
```

## 4. Backend Deployment (Render)

### 4.1 Dockerfile

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY ./app ./app

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 4.2 Render Configuration

```yaml
# render.yaml
services:
  - type: web
    name: strata-ai-api
    env: docker
    plan: free
    healthCheckPath: /health
    envVars:
      - key: ENVIRONMENT
        value: production
      - key: SECRET_KEY
        sync: false  # Set in dashboard
      - key: MONGODB_URI
        sync: false
      - key: GROQ_API_KEY
        sync: false
      - key: GEMINI_API_KEY
        sync: false
```

### 4.3 Requirements

```txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
pydantic-settings==2.1.0
motor==3.3.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
httpx==0.26.0
groq==0.4.2
google-generativeai==0.3.2
python-multipart==0.0.6
python-dotenv==1.0.0
```

## 5. Database Setup (MongoDB Atlas)

### 5.1 Cluster Configuration

1. Create free M0 cluster
2. Select region: AWS us-east-1 (closest to Render)
3. Create database user with readWrite permissions
4. Whitelist IP: 0.0.0.0/0 (required for Render's dynamic IPs)

### 5.2 Connection String

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/strata-ai?retryWrites=true&w=majority
```

### 5.3 Index Creation Script

```javascript
// MongoDB Shell / Atlas UI
use strata-ai

// Users collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "oauth_id": 1 }, { sparse: true })

// Startups collection
db.startups.createIndex({ "user_id": 1 })

// Financials collection
db.financials.createIndex({ "startup_id": 1, "month": 1 }, { unique: true })
db.financials.createIndex({ "startup_id": 1, "created_at": -1 })

// Scenarios collection
db.scenarios.createIndex({ "startup_id": 1, "created_at": -1 })
db.scenarios.createIndex({ "startup_id": 1, "is_favorite": 1 })

// Ideas collection
db.ideas.createIndex({ "startup_id": 1, "is_saved": 1 })
db.ideas.createIndex({ "startup_id": 1, "created_at": -1 })

// Roadmaps collection
db.roadmaps.createIndex({ "startup_id": 1, "status": 1 })
db.roadmaps.createIndex({ "startup_id": 1, "created_at": -1 })

// Settings collection
db.settings.createIndex({ "user_id": 1 }, { unique: true })
```

## 6. CI/CD Pipeline (GitHub Actions)

### 6.1 Frontend Workflow

```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

  # Vercel handles deployment automatically via GitHub integration
```

### 6.2 Backend Workflow

```yaml
# .github/workflows/backend.yml
name: Backend CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
  pull_request:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install ruff pytest pytest-asyncio
      
      - name: Lint with Ruff
        run: ruff check .
      
      - name: Type check with mypy
        run: mypy app --ignore-missing-imports
      
      - name: Run tests
        run: pytest tests/ -v
        env:
          ENVIRONMENT: test
          SECRET_KEY: test-secret-key
          MONGODB_URI: ${{ secrets.TEST_MONGODB_URI }}

  # Render handles deployment automatically via GitHub integration
```

## 7. Environment Configuration

### 7.1 Development

```bash
# backend/.env.development
ENVIRONMENT=development
DEBUG=true
SECRET_KEY=dev-secret-key-not-for-production
MONGODB_URI=mongodb://localhost:27017/strata-ai-dev
LLM_PROVIDER=groq
GROQ_API_KEY=your-groq-key
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

```bash
# frontend/.env.development
VITE_API_URL=http://localhost:8000/api/v1
VITE_ENVIRONMENT=development
```

### 7.2 Production

```bash
# Set in Render Dashboard
ENVIRONMENT=production
SECRET_KEY=<generate-256-bit-key>
MONGODB_URI=mongodb+srv://...
LLM_PROVIDER=groq
GROQ_API_KEY=<your-key>
GEMINI_API_KEY=<your-key>
LLM_FALLBACK_ENABLED=true
LLM_FALLBACK_CHAIN=groq,gemini
```

## 8. Monitoring & Health Checks

### 8.1 Health Endpoint

```python
# app/routes/health.py
from fastapi import APIRouter
from app.database import db
from app.llm.factory import ProviderFactory

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check."""
    return {"status": "healthy"}

@router.get("/health/detailed")
async def detailed_health():
    """Detailed health check with dependencies."""
    checks = {
        "api": True,
        "database": False,
        "llm": False
    }
    
    # Check database
    try:
        await db.command("ping")
        checks["database"] = True
    except Exception:
        pass
    
    # Check LLM provider
    try:
        provider = ProviderFactory.get_provider()
        checks["llm"] = await provider.health_check()
    except Exception:
        pass
    
    status = "healthy" if all(checks.values()) else "degraded"
    return {"status": status, "checks": checks}
```

### 8.2 Render Health Check

Render automatically pings `/health` every 30 seconds. If it fails 3 times, the service restarts.

## 9. Handling Cold Starts

Render free tier sleeps after 15 minutes of inactivity. Strategies:

### 9.1 Frontend Loading State

```typescript
// src/hooks/useApiHealth.ts
export function useApiHealth() {
  const [isWaking, setIsWaking] = useState(false);
  
  const checkHealth = async () => {
    setIsWaking(true);
    try {
      await api.get('/health', { timeout: 45000 }); // 45s timeout for cold start
    } finally {
      setIsWaking(false);
    }
  };
  
  return { isWaking, checkHealth };
}
```

### 9.2 Loading Screen

```typescript
// src/components/shared/WakingScreen.tsx
export function WakingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">
          Waking up the server...
        </p>
        <p className="text-sm text-gray-400">
          This may take up to 30 seconds on first load
        </p>
      </div>
    </div>
  );
}
```

## 10. Deployment Checklist

| Step | Action | Status |
|------|--------|--------|
| **MongoDB Atlas** | Create cluster | ☐ |
| | Create database user | ☐ |
| | Whitelist IPs (0.0.0.0/0) | ☐ |
| | Create indexes | ☐ |
| **Render** | Connect GitHub repo | ☐ |
| | Set environment variables | ☐ |
| | Configure health check | ☐ |
| | Deploy backend | ☐ |
| **Vercel** | Connect GitHub repo | ☐ |
| | Set environment variables | ☐ |
| | Configure build settings | ☐ |
| | Deploy frontend | ☐ |
| **DNS (Optional)** | Configure custom domain | ☐ |
| | Set up SSL | ☐ |
| **Testing** | End-to-end flow works | ☐ |
| | Health checks passing | ☐ |
| | LLM integration works | ☐ |

---

**End of Architecture Documentation**
