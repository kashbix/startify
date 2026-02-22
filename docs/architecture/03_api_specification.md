# 🔌 API Specification

## 1. Overview

STRATA-AI exposes a RESTful API built with FastAPI. All endpoints follow consistent patterns for authentication, error handling, and response formatting.

**Base URL:** `https://api.strata-ai.com/api/v1` (production) | `http://localhost:8000/api/v1` (development)

## 2. Authentication

### 2.1 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│   API    │────▶│ Database │
└──────────┘     └──────────┘     └──────────┘
     │                │                │
     │  1. Login      │                │
     │  (email/pass)  │                │
     │───────────────▶│                │
     │                │  2. Verify     │
     │                │───────────────▶│
     │                │                │
     │                │  3. User data  │
     │                │◀───────────────│
     │                │                │
     │  4. JWT Token  │                │
     │◀───────────────│                │
     │                │                │
     │  5. API calls  │                │
     │  with Bearer   │                │
     │  token         │                │
     │───────────────▶│                │
```

### 2.2 JWT Token Structure

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "exp": 1737302400,
  "iat": 1737216000,
  "type": "access"
}
```

### 2.3 Authentication Header

```
Authorization: Bearer <jwt_token>
```

## 3. Response Format

### 3.1 Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### 3.2 Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

### 3.3 HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 422 | Unprocessable Entity (Pydantic validation) |
| 429 | Rate Limited |
| 500 | Internal Server Error |

---

## 4. API Endpoints

### 4.1 Authentication Endpoints

#### POST /auth/register

Create a new user account.

**Request:**
```json
{
  "email": "priya@startup.com",
  "password": "SecurePass123!",
  "full_name": "Priya Sharma"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "priya@startup.com",
      "full_name": "Priya Sharma",
      "created_at": "2026-01-18T10:00:00Z"
    },
    "access_token": "eyJhbGciOiJSUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 86400
  },
  "message": "Registration successful"
}
```

**Errors:**
- `400 EMAIL_EXISTS`: Email already registered
- `422 VALIDATION_ERROR`: Invalid email or weak password

---

#### POST /auth/login

Authenticate user and get JWT token.

**Request:**
```json
{
  "email": "priya@startup.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "priya@startup.com",
      "full_name": "Priya Sharma",
      "has_startup": true,
      "onboarding_completed": true
    },
    "access_token": "eyJhbGciOiJSUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 86400
  },
  "message": "Login successful"
}
```

**Errors:**
- `401 INVALID_CREDENTIALS`: Wrong email or password

---

#### POST /auth/refresh

Refresh JWT token.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 86400
  }
}
```

---

#### GET /auth/me

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "priya@startup.com",
    "full_name": "Priya Sharma",
    "avatar_url": null,
    "created_at": "2026-01-18T10:00:00Z"
  }
}
```

---

### 4.2 Startup Endpoints

#### POST /startup

Create startup profile (onboarding).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "LearnFlow",
  "description": "AI-powered learning management system",
  "industry": "EdTech",
  "stage": "mvp",
  "founded_date": "2025-06-01",
  "website_url": "https://learnflow.io",
  "team": {
    "size": 3,
    "roles": ["CEO/Product", "CTO", "Designer"],
    "founder_background": "Ex-Google engineer with 5 years in ML"
  },
  "current_cash_balance": 120000,
  "currency": "USD",
  "target_market": "Mid-market enterprises",
  "customer_segments": ["HR departments", "L&D teams"],
  "product_description": "LMS with AI-driven personalized learning paths"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "LearnFlow",
    "industry": "EdTech",
    "stage": "mvp",
    "onboarding_completed": true,
    "created_at": "2026-01-18T10:30:00Z"
  },
  "message": "Startup profile created"
}
```

---

#### GET /startup

Get current user's startup profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "LearnFlow",
    "description": "AI-powered learning management system",
    "industry": "EdTech",
    "stage": "mvp",
    "founded_date": "2025-06-01",
    "website_url": "https://learnflow.io",
    "team": {
      "size": 3,
      "roles": ["CEO/Product", "CTO", "Designer"],
      "founder_background": "Ex-Google engineer with 5 years in ML"
    },
    "current_cash_balance": 120000,
    "currency": "USD",
    "target_market": "Mid-market enterprises",
    "customer_segments": ["HR departments", "L&D teams"],
    "product_description": "LMS with AI-driven personalized learning paths",
    "onboarding_completed": true,
    "created_at": "2026-01-18T10:30:00Z",
    "updated_at": "2026-01-18T10:30:00Z"
  }
}
```

---

#### PUT /startup

Update startup profile.

**Headers:** `Authorization: Bearer <token>`

**Request:** (partial update supported)
```json
{
  "current_cash_balance": 115000,
  "team": {
    "size": 4
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "updated_at": "2026-01-18T11:00:00Z"
  },
  "message": "Startup profile updated"
}
```

---

### 4.3 Financial Endpoints

#### POST /financials

Add monthly financial record.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "month": "2026-01",
  "revenue": {
    "recurring": 8500,
    "one_time": 1500
  },
  "expenses": {
    "salaries": 18000,
    "marketing": 3000,
    "infrastructure": 1200,
    "office": 0,
    "legal": 500,
    "other": 800
  },
  "cash_balance_end": 120000,
  "notes": "Launched new marketing campaign"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "month": "2026-01",
    "revenue": {
      "recurring": 8500,
      "one_time": 1500,
      "total": 10000
    },
    "expenses": {
      "salaries": 18000,
      "marketing": 3000,
      "infrastructure": 1200,
      "office": 0,
      "legal": 500,
      "other": 800,
      "total": 23500
    },
    "net_burn": 13500,
    "cash_balance_end": 120000
  },
  "message": "Financial record added"
}
```

---

#### GET /financials

Get financial history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `start_month` (optional): YYYY-MM format
- `end_month` (optional): YYYY-MM format
- `limit` (optional): default 12

**Response (200):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "507f1f77bcf86cd799439013",
        "month": "2026-01",
        "revenue": { "recurring": 8500, "one_time": 1500, "total": 10000 },
        "expenses": { "total": 23500 },
        "net_burn": 13500,
        "cash_balance_end": 120000
      },
      {
        "id": "507f1f77bcf86cd799439014",
        "month": "2025-12",
        "revenue": { "recurring": 7500, "one_time": 2000, "total": 9500 },
        "expenses": { "total": 22000 },
        "net_burn": 12500,
        "cash_balance_end": 133500
      }
    ],
    "total_count": 6
  }
}
```

---

#### POST /financials/import

Import financial data from CSV.

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`
- `file`: CSV file

**CSV Format:**
```csv
month,revenue_recurring,revenue_one_time,salaries,marketing,infrastructure,office,legal,other,cash_balance
2025-12,7500,2000,18000,2500,1200,0,300,500,133500
2026-01,8500,1500,18000,3000,1200,0,500,800,120000
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "imported": 2,
    "skipped": 0,
    "errors": []
  },
  "message": "CSV imported successfully"
}
```

---

### 4.4 Runway Endpoints

#### GET /runway/current

Get current runway calculation.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "runway_months": 8.9,
    "cash_balance": 120000,
    "monthly_burn": 13500,
    "monthly_revenue": 10000,
    "net_monthly_burn": 13500,
    "trend": "declining",
    "trend_delta": -0.4,
    "risk_level": "medium",
    "confidence": {
      "best_case": 11.2,
      "expected": 8.9,
      "worst_case": 6.5
    },
    "alerts": [
      {
        "type": "warning",
        "message": "Runway below 12 months. Consider fundraising planning."
      }
    ],
    "calculated_at": "2026-01-18T12:00:00Z"
  }
}
```

---

#### POST /runway/project

Project runway to a future date.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "target_date": "2026-07-01",
  "assumptions": {
    "revenue_growth_percent": 10,
    "expense_growth_percent": 5
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "target_date": "2026-07-01",
    "months_ahead": 6,
    "projected": {
      "cash_balance": 28000,
      "runway_months": 1.8,
      "monthly_burn": 15600,
      "monthly_revenue": 17700,
      "risk_level": "high"
    },
    "recommendation": "Begin fundraising conversations by April to avoid critical runway.",
    "calculated_at": "2026-01-18T12:00:00Z"
  }
}
```

---

### 4.5 Scenario Endpoints

#### POST /scenarios

Create and calculate a what-if scenario.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Hire 2 Sales Reps",
  "description": "Impact of adding 2 sales representatives",
  "type": "hire",
  "modifications": {
    "expense_changes": {
      "salaries": 10000
    },
    "revenue_change_percent": 40,
    "description": "Add 2 sales reps at $5K/month each, expecting 40% revenue growth over 6 months"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439015",
    "name": "Hire 2 Sales Reps",
    "type": "hire",
    "modifications": {
      "expense_changes": { "salaries": 10000 },
      "revenue_change_percent": 40
    },
    "results": {
      "baseline_runway_months": 8.9,
      "new_runway_months": 5.1,
      "runway_delta": -3.8,
      "baseline_monthly_burn": 13500,
      "new_monthly_burn": 23500,
      "break_even_months": 8,
      "risk_score": "medium"
    },
    "created_at": "2026-01-18T12:30:00Z"
  },
  "message": "Scenario created and calculated"
}
```

---

#### GET /scenarios

List all scenarios.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `favorites_only` (optional): boolean
- `limit` (optional): default 20

**Response (200):**
```json
{
  "success": true,
  "data": {
    "scenarios": [
      {
        "id": "507f1f77bcf86cd799439015",
        "name": "Hire 2 Sales Reps",
        "type": "hire",
        "results": {
          "runway_delta": -3.8,
          "risk_score": "medium"
        },
        "is_favorite": true,
        "created_at": "2026-01-18T12:30:00Z"
      }
    ],
    "total_count": 5
  }
}
```

---

#### GET /scenarios/{id}

Get scenario details.

**Response (200):** Full scenario object

---

#### DELETE /scenarios/{id}

Delete a scenario.

**Response (200):**
```json
{
  "success": true,
  "message": "Scenario deleted"
}
```

---

#### POST /scenarios/compare

Compare multiple scenarios side-by-side.

**Request:**
```json
{
  "scenario_ids": ["507f1f77bcf86cd799439015", "507f1f77bcf86cd799439016"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "baseline": {
      "runway_months": 8.9,
      "monthly_burn": 13500
    },
    "scenarios": [
      {
        "id": "507f1f77bcf86cd799439015",
        "name": "Hire 2 Sales Reps",
        "runway_months": 5.1,
        "runway_delta": -3.8,
        "monthly_burn": 23500,
        "risk_score": "medium"
      },
      {
        "id": "507f1f77bcf86cd799439016",
        "name": "Increase Marketing",
        "runway_months": 7.2,
        "runway_delta": -1.7,
        "monthly_burn": 16500,
        "risk_score": "low"
      }
    ],
    "recommendation": "Scenario 'Increase Marketing' has lower risk with moderate runway impact."
  }
}
```

---

### 4.6 AI Endpoints

#### POST /ai/ideation

Generate pivot/expansion ideas.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "constraints": {
    "max_investment": 50000,
    "timeline_months": 6,
    "team_changes": "none"
  },
  "focus_areas": ["revenue_growth", "market_expansion"],
  "additional_context": "Looking to expand into adjacent markets"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ideas": [
      {
        "id": "507f1f77bcf86cd799439017",
        "title": "White-label Platform for Coaching Institutes",
        "description": "License your LMS technology to coaching institutes who need digital infrastructure but lack technical capability.",
        "rationale": "Your existing platform can be adapted with minimal changes. Coaching institutes represent a $5B market with low digital penetration.",
        "feasibility_score": 8,
        "market_opportunity": "high",
        "required_investment": 25000,
        "time_to_revenue_months": 3,
        "required_skills": ["Sales", "Partnership Management"],
        "risks": ["Channel conflict with direct sales", "Support complexity"],
        "first_steps": [
          "Identify 20 target institutes",
          "Create white-label demo",
          "Develop partnership pricing model"
        ]
      },
      {
        "id": "507f1f77bcf86cd799439018",
        "title": "Corporate Training Vertical",
        "description": "Pivot focus from general EdTech to B2B corporate training and compliance.",
        "rationale": "Corporate training budgets are larger and more predictable than consumer EdTech.",
        "feasibility_score": 7,
        "market_opportunity": "high",
        "required_investment": 40000,
        "time_to_revenue_months": 4,
        "required_skills": ["Enterprise Sales", "Compliance Knowledge"],
        "risks": ["Longer sales cycles", "Requires case studies"],
        "first_steps": [
          "Interview 10 HR leaders",
          "Build compliance module prototype",
          "Create ROI calculator for buyers"
        ]
      }
    ],
    "generation_context": {
      "llm_provider": "groq",
      "model": "llama-3.1-70b-versatile",
      "generated_at": "2026-01-18T13:00:00Z"
    }
  },
  "message": "Generated 2 pivot ideas"
}
```

---

#### POST /ai/roadmap

Generate execution roadmap for an idea.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "idea_id": "507f1f77bcf86cd799439017",
  "start_date": "2026-02-01",
  "constraints": {
    "max_duration_weeks": 12,
    "team_availability": "full-time"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "roadmap": {
      "id": "507f1f77bcf86cd799439019",
      "title": "White-label Platform Launch Roadmap",
      "total_duration_weeks": 12,
      "start_date": "2026-02-01",
      "phases": [
        {
          "phase_number": 1,
          "name": "Market Research & Validation",
          "description": "Validate demand and identify initial targets",
          "duration_weeks": 2,
          "start_week": 1,
          "end_week": 2,
          "tasks": [
            {
              "task_id": "t1",
              "title": "Create list of 50 target coaching institutes",
              "is_completed": false
            },
            {
              "task_id": "t2",
              "title": "Conduct 10 discovery calls",
              "is_completed": false
            },
            {
              "task_id": "t3",
              "title": "Document common requirements and objections",
              "is_completed": false
            }
          ],
          "kpis": [
            { "name": "Discovery calls completed", "target": "10" },
            { "name": "Interested prospects", "target": "3+" }
          ],
          "required_resources": ["Founder time", "CRM tool"],
          "estimated_cost": 500
        },
        {
          "phase_number": 2,
          "name": "Product Adaptation",
          "description": "Modify platform for white-label deployment",
          "duration_weeks": 3,
          "start_week": 3,
          "end_week": 5,
          "tasks": [
            {
              "task_id": "t4",
              "title": "Build white-label configuration system",
              "is_completed": false
            },
            {
              "task_id": "t5",
              "title": "Create customizable branding module",
              "is_completed": false
            },
            {
              "task_id": "t6",
              "title": "Develop partner admin dashboard",
              "is_completed": false
            }
          ],
          "kpis": [
            { "name": "White-label demo ready", "target": "Yes" }
          ],
          "required_resources": ["CTO", "Designer"],
          "estimated_cost": 5000
        }
      ],
      "overall_progress": 0,
      "status": "not_started"
    },
    "generation_context": {
      "llm_provider": "groq",
      "generated_at": "2026-01-18T13:30:00Z"
    }
  },
  "message": "Roadmap generated"
}
```

---

#### POST /ai/insights

Get AI-generated insights about current state.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "type": "warning",
        "title": "Marketing ROI Declining",
        "description": "Marketing spend increased 40% last month but revenue growth was only 6%. Consider reviewing channel effectiveness.",
        "action": "Review marketing channel performance"
      },
      {
        "type": "opportunity",
        "title": "Strong MRR Growth",
        "description": "Recurring revenue grew 13% month-over-month. This is above industry average of 8%.",
        "action": "Document what's working for repeatability"
      }
    ],
    "generated_at": "2026-01-18T14:00:00Z"
  }
}
```

---

### 4.7 Roadmap Endpoints

#### GET /roadmaps

List all roadmaps.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "roadmaps": [
      {
        "id": "507f1f77bcf86cd799439019",
        "title": "White-label Platform Launch Roadmap",
        "total_duration_weeks": 12,
        "overall_progress": 25,
        "status": "in_progress",
        "created_at": "2026-01-18T13:30:00Z"
      }
    ],
    "total_count": 1
  }
}
```

---

#### GET /roadmaps/{id}

Get full roadmap details.

**Response (200):** Full roadmap object with all phases and tasks

---

#### PATCH /roadmaps/{id}/tasks/{task_id}

Update task completion status.

**Request:**
```json
{
  "is_completed": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "task_id": "t1",
    "is_completed": true,
    "completed_at": "2026-01-18T15:00:00Z",
    "roadmap_progress": 8
  },
  "message": "Task updated"
}
```

---

#### PUT /roadmaps/{id}

Update roadmap (edit phases, tasks, etc.).

**Request:** Partial roadmap object

**Response (200):** Updated roadmap

---

#### DELETE /roadmaps/{id}

Delete a roadmap.

**Response (200):**
```json
{
  "success": true,
  "message": "Roadmap deleted"
}
```

---

### 4.8 Settings Endpoints

#### GET /settings

Get user settings.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "alerts": {
      "runway_critical_months": 3,
      "runway_warning_months": 6,
      "email_notifications": false
    },
    "display": {
      "currency": "USD",
      "date_format": "MM/DD/YYYY",
      "theme": "system"
    },
    "llm": {
      "preferred_provider": "groq",
      "show_reasoning": true
    }
  }
}
```

---

#### PUT /settings

Update user settings.

**Request:** Partial settings object

**Response (200):** Updated settings

---

#### POST /settings/export

Export all user data.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "download_url": "https://api.strata-ai.com/exports/abc123.json",
    "expires_at": "2026-01-18T18:00:00Z",
    "format": "json"
  },
  "message": "Export ready for download"
}
```

---

#### DELETE /settings/account

Delete user account and all data.

**Request:**
```json
{
  "confirm": true,
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account scheduled for deletion within 30 days"
}
```

---

## 5. LLM Management API

Endpoints for configuring AI providers directly from the UI.

### 5.1 Get LLM Configuration

#### GET /llm/config

Get current LLM configuration and available providers.

**Response (200):**
```json
{
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "is_connected": true,
  "api_key_set": true,
  "available_providers": [
    {
      "id": "groq",
      "name": "Groq",
      "description": "Ultra-fast inference with Llama models",
      "models": ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "mixtral-8x7b-32768"],
      "requires_api_key": true,
      "api_key_env_var": "GROQ_API_KEY",
      "is_configured": true
    },
    {
      "id": "openai",
      "name": "OpenAI",
      "description": "GPT-4 and GPT-3.5 models",
      "models": ["gpt-4-turbo-preview", "gpt-4", "gpt-3.5-turbo"],
      "requires_api_key": true,
      "api_key_env_var": "OPENAI_API_KEY",
      "is_configured": false
    }
  ]
}
```

### 5.2 Update LLM Configuration

#### PUT /llm/config

Update provider, model, or API key.

**Request:**
```json
{
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "api_key": "sk-..." 
}
```

**Response (200):** Updated LLMConfig object

### 5.3 Test LLM Connection

#### POST /llm/test

Test LLM connection with a simple prompt.

**Request:**
```json
{
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "api_key": null,
  "prompt": "Say 'Hello, STRATA-AI is connected!'"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully connected to groq using llama-3.3-70b-versatile",
  "response": "Hello, STRATA-AI is connected!",
  "latency_ms": 245
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "No API key configured for openai. Please add your API key.",
  "response": null,
  "latency_ms": null
}
```

### 5.4 Get Available Providers

#### GET /llm/providers

Get list of all available LLM providers and their models.

**Response (200):** Array of LLMProvider objects

### 5.5 Delete API Key

#### DELETE /llm/api-key/{provider}

Delete stored API key for a provider.

**Response (200):**
```json
{
  "message": "API key for openai deleted successfully"
}
```

### Default Provider Configuration

Groq is pre-configured with the system API key. The `get_effective_api_key` function determines which key to use:

1. **User's custom API key** (highest priority)
2. **System Groq API key** (from environment, for Groq only)
3. **Environment variable fallback**

---

## 6. Rate Limiting

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Authentication | 10 requests | 1 minute |
| AI Endpoints | 20 requests | 1 minute |
| LLM Management | 30 requests | 1 minute |
| General API | 100 requests | 1 minute |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1737216060
```

---

## 6. Webhook Events (Future)

Reserved for v2:
- `runway.critical` - Runway dropped below critical threshold
- `scenario.completed` - Scenario calculation finished
- `roadmap.milestone` - Roadmap phase completed

---

**Next:** See [04_llm_integration.md](./04_llm_integration.md) for LLM abstraction layer details.
