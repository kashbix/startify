# 🔒 Security Architecture

## 1. Overview

STRATA-AI implements defense-in-depth security across all layers, following OWASP guidelines and industry best practices.

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  TRANSPORT SECURITY                                      │    │
│  │  • HTTPS/TLS 1.3 everywhere                             │    │
│  │  • HSTS headers                                          │    │
│  │  • Certificate pinning (optional)                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  APPLICATION SECURITY                                    │    │
│  │  • JWT authentication                                    │    │
│  │  • Input validation (Pydantic)                          │    │
│  │  • Rate limiting                                         │    │
│  │  • CORS configuration                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  DATA SECURITY                                           │    │
│  │  • Password hashing (bcrypt)                            │    │
│  │  • Data isolation per user                              │    │
│  │  • Encrypted backups                                     │    │
│  │  • Secrets management                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Authentication

### 2.1 JWT Implementation

```python
# app/auth/jwt.py

from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Token configuration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_access_token(user_id: str, email: str) -> str:
    """Create JWT access token."""
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    """Create JWT refresh token."""
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": user_id,
        "exp": expire,
        "type": "refresh"
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    """Verify and decode JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise InvalidTokenError("Invalid or expired token")

def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return pwd_context.verify(plain_password, hashed_password)
```

### 2.2 Auth Middleware

```python
# app/auth/middleware.py

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.jwt import verify_token
from app.services.user_service import get_user_by_id

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Extract and validate user from JWT token."""
    token = credentials.credentials
    
    try:
        payload = verify_token(token)
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user
```

### 2.3 Password Requirements

| Requirement | Validation |
|-------------|------------|
| Minimum length | 8 characters |
| Maximum length | 128 characters |
| Complexity | At least 1 uppercase, 1 lowercase, 1 number |
| Common passwords | Checked against top 10,000 list |
| Hashing | bcrypt with cost factor 12 |

```python
# app/schemas/auth.py

from pydantic import BaseModel, validator
import re

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if len(v) > 128:
            raise ValueError('Password must be less than 128 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain a number')
        return v
```

## 3. Authorization

### 3.1 Data Isolation

Every database query includes user_id filtering to ensure strict data isolation:

```python
# app/services/startup_service.py

async def get_startup(user_id: str) -> Startup:
    """Get startup - always filtered by user_id."""
    startup = await db.startups.find_one({"user_id": ObjectId(user_id)})
    if not startup:
        raise NotFoundError("Startup not found")
    return Startup(**startup)

async def get_financials(user_id: str, startup_id: str) -> list[Financial]:
    """Get financials - verify ownership first."""
    # Verify startup belongs to user
    startup = await get_startup(user_id)
    if str(startup.id) != startup_id:
        raise ForbiddenError("Access denied")
    
    # Now safe to query
    records = await db.financials.find({"startup_id": ObjectId(startup_id)}).to_list()
    return [Financial(**r) for r in records]
```

### 3.2 Resource Ownership Verification

```python
# app/utils/ownership.py

async def verify_ownership(user_id: str, resource_type: str, resource_id: str):
    """Verify user owns the specified resource."""
    match resource_type:
        case "startup":
            startup = await db.startups.find_one({
                "_id": ObjectId(resource_id),
                "user_id": ObjectId(user_id)
            })
            if not startup:
                raise ForbiddenError("Access denied")
        
        case "scenario" | "idea" | "roadmap":
            # These belong to startups, verify startup ownership
            startup = await get_startup(user_id)
            resource = await db[f"{resource_type}s"].find_one({
                "_id": ObjectId(resource_id),
                "startup_id": startup.id
            })
            if not resource:
                raise ForbiddenError("Access denied")
```

## 4. Input Validation

### 4.1 Pydantic Validation

All API inputs are validated using Pydantic models:

```python
# app/schemas/financial.py

from pydantic import BaseModel, validator, Field
from typing import Optional
from datetime import date
import re

class RevenueInput(BaseModel):
    recurring: float = Field(ge=0, description="Monthly recurring revenue")
    one_time: float = Field(ge=0, default=0, description="One-time revenue")

class ExpensesInput(BaseModel):
    salaries: float = Field(ge=0, default=0)
    marketing: float = Field(ge=0, default=0)
    infrastructure: float = Field(ge=0, default=0)
    office: float = Field(ge=0, default=0)
    legal: float = Field(ge=0, default=0)
    other: float = Field(ge=0, default=0)

class FinancialEntryRequest(BaseModel):
    month: str
    revenue: RevenueInput
    expenses: ExpensesInput
    cash_balance_end: float = Field(ge=0)
    notes: Optional[str] = Field(max_length=500, default=None)
    
    @validator('month')
    def validate_month(cls, v):
        if not re.match(r'^\d{4}-(0[1-9]|1[0-2])$', v):
            raise ValueError('Month must be in YYYY-MM format')
        return v
    
    @validator('notes')
    def sanitize_notes(cls, v):
        if v:
            # Remove any HTML tags
            v = re.sub(r'<[^>]+>', '', v)
        return v
```

### 4.2 SQL/NoSQL Injection Prevention

```python
# Always use parameterized queries with Motor/PyMongo

# ❌ WRONG - vulnerable to injection
await db.users.find_one({"email": f"{user_input}"})

# ✅ CORRECT - parameterized
await db.users.find_one({"email": user_input})

# ✅ CORRECT - with ObjectId validation
from bson import ObjectId
from bson.errors import InvalidId

def validate_object_id(id_string: str) -> ObjectId:
    try:
        return ObjectId(id_string)
    except InvalidId:
        raise ValueError("Invalid ID format")
```

## 5. Rate Limiting

```python
# app/middleware/rate_limit.py

from fastapi import Request, HTTPException
from collections import defaultdict
import time

class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)
    
    def is_rate_limited(
        self,
        key: str,
        max_requests: int,
        window_seconds: int
    ) -> bool:
        now = time.time()
        window_start = now - window_seconds
        
        # Clean old requests
        self.requests[key] = [
            t for t in self.requests[key] if t > window_start
        ]
        
        if len(self.requests[key]) >= max_requests:
            return True
        
        self.requests[key].append(now)
        return False

rate_limiter = RateLimiter()

# Rate limit configurations
RATE_LIMITS = {
    "auth": (10, 60),      # 10 requests per minute
    "ai": (20, 60),        # 20 requests per minute
    "default": (100, 60),  # 100 requests per minute
}

async def rate_limit_middleware(request: Request, call_next):
    # Determine rate limit category
    path = request.url.path
    if "/auth/" in path:
        category = "auth"
    elif "/ai/" in path:
        category = "ai"
    else:
        category = "default"
    
    max_requests, window = RATE_LIMITS[category]
    
    # Use IP + user_id as key
    client_ip = request.client.host
    key = f"{category}:{client_ip}"
    
    if rate_limiter.is_rate_limited(key, max_requests, window):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded",
            headers={
                "X-RateLimit-Limit": str(max_requests),
                "X-RateLimit-Reset": str(window)
            }
        )
    
    return await call_next(request)
```

## 6. CORS Configuration

```python
# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Production origins
ALLOWED_ORIGINS = [
    "https://strata-ai.vercel.app",
    "https://www.strata-ai.com",
]

# Development origins
if settings.ENVIRONMENT == "development":
    ALLOWED_ORIGINS.extend([
        "http://localhost:3000",
        "http://localhost:5173",
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining"],
    max_age=600,  # Cache preflight for 10 minutes
)
```

## 7. Security Headers

```python
# app/middleware/security_headers.py

from fastapi import Request

async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=()"
    
    # HSTS (enable in production with HTTPS)
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response
```

## 8. Secrets Management

```bash
# .env file structure (NEVER commit to git)

# Application
SECRET_KEY=your-256-bit-secret-key-here
ENVIRONMENT=development

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/strata-ai

# LLM API Keys
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxx

# OAuth (optional)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
```

```python
# app/config.py

from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Required
    SECRET_KEY: str
    MONGODB_URI: str
    
    # Optional with defaults
    ENVIRONMENT: str = "development"
    LLM_PROVIDER: str = "groq"
    
    # API Keys (optional based on provider)
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
```

## 9. Data Privacy

### 9.1 LLM Data Handling

```python
# app/services/ai_service.py

async def generate_ideas(startup: Startup, constraints: dict) -> list[Idea]:
    """
    Generate ideas using LLM.
    
    PRIVACY NOTICE: This sends startup data to external LLM provider.
    For complete privacy, users should configure Ollama (local).
    """
    
    # Log what data is being sent (for audit)
    logger.info(
        "LLM request",
        extra={
            "user_id": str(startup.user_id),
            "provider": settings.LLM_PROVIDER,
            "data_sent": ["industry", "stage", "team_size", "product_description"]
        }
    )
    
    # Build prompt with only necessary data
    # Avoid sending specific financial figures unless required
    prompt = build_ideation_prompt(
        industry=startup.industry,
        stage=startup.stage,
        team_size=startup.team.size,
        product_description=startup.product_description,
        # Generalize financial data
        runway_range=get_runway_range(startup),  # "3-6 months" instead of exact
    )
    
    response = await LLMService.generate(prompt)
    return parse_ideas(response)
```

### 9.2 Data Export

```python
# app/services/settings_service.py

async def export_user_data(user_id: str) -> dict:
    """Export all user data for GDPR compliance."""
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    startup = await db.startups.find_one({"user_id": ObjectId(user_id)})
    
    export = {
        "user": sanitize_for_export(user),
        "startup": sanitize_for_export(startup),
        "financials": [],
        "scenarios": [],
        "ideas": [],
        "roadmaps": [],
        "exported_at": datetime.utcnow().isoformat()
    }
    
    if startup:
        startup_id = startup["_id"]
        export["financials"] = await db.financials.find(
            {"startup_id": startup_id}
        ).to_list(1000)
        export["scenarios"] = await db.scenarios.find(
            {"startup_id": startup_id}
        ).to_list(1000)
        # ... etc
    
    return export

def sanitize_for_export(doc: dict) -> dict:
    """Remove sensitive fields from export."""
    if not doc:
        return None
    
    doc = dict(doc)
    doc.pop("password_hash", None)
    doc["_id"] = str(doc["_id"])
    return doc
```

## 10. Security Checklist

| Category | Item | Status |
|----------|------|--------|
| **Authentication** | JWT with expiration | ✅ |
| | Password hashing (bcrypt) | ✅ |
| | Secure password requirements | ✅ |
| | Token refresh mechanism | ✅ |
| **Authorization** | User data isolation | ✅ |
| | Resource ownership verification | ✅ |
| **Transport** | HTTPS only (production) | ✅ |
| | HSTS headers | ✅ |
| **Input** | Pydantic validation | ✅ |
| | SQL injection prevention | ✅ |
| | XSS prevention | ✅ |
| **Rate Limiting** | Auth endpoints | ✅ |
| | AI endpoints | ✅ |
| | General API | ✅ |
| **Headers** | Security headers | ✅ |
| | CORS configuration | ✅ |
| **Secrets** | Environment variables | ✅ |
| | No secrets in code | ✅ |
| **Privacy** | Data export | ✅ |
| | Local LLM option | ✅ |
| | Clear data handling disclosure | ✅ |

---

**Next:** See [07_deployment_architecture.md](./07_deployment_architecture.md) for deployment configuration.
