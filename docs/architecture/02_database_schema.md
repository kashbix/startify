# 🗄️ Database Schema Design

## 1. Overview

STRATA-AI uses **MongoDB Atlas** (free tier) as its primary database. MongoDB's document-based model is ideal for:
- Flexible startup profile data
- Nested financial records
- Variable scenario configurations
- Embedded roadmap structures

## 2. Collections Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    STRATA-AI DATABASE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐              │
│  │  users   │───▶│ startups │───▶│  financials  │              │
│  └──────────┘    └──────────┘    └──────────────┘              │
│       │               │                                         │
│       │               ├─────────▶┌──────────────┐              │
│       │               │          │  scenarios   │              │
│       │               │          └──────────────┘              │
│       │               │                                         │
│       │               ├─────────▶┌──────────────┐              │
│       │               │          │    ideas     │              │
│       │               │          └──────────────┘              │
│       │               │                                         │
│       │               └─────────▶┌──────────────┐              │
│       │                          │   roadmaps   │              │
│       │                          └──────────────┘              │
│       │                                                         │
│       └────────────────────────▶┌──────────────┐              │
│                                  │   settings   │              │
│                                  └──────────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Collection Schemas

### 3.1 Users Collection

Stores user authentication and profile information.

```javascript
{
  "_id": ObjectId,
  "email": String,              // unique, indexed
  "password_hash": String,      // bcrypt hashed
  "full_name": String,
  "avatar_url": String | null,
  "email_verified": Boolean,
  "auth_provider": String,      // "email" | "google" | "github"
  "oauth_id": String | null,    // for OAuth users
  "created_at": ISODate,
  "updated_at": ISODate,
  "last_login_at": ISODate | null
}
```

**Indexes:**
- `email`: unique index
- `oauth_id`: sparse index (for OAuth lookups)

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "priya@startup.com",
  "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.fGe",
  "full_name": "Priya Sharma",
  "avatar_url": null,
  "email_verified": true,
  "auth_provider": "email",
  "oauth_id": null,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-15T10:30:00Z",
  "last_login_at": "2026-01-18T09:00:00Z"
}
```

---

### 3.2 Startups Collection

Stores startup profile and metadata.

```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,          // reference to users
  "name": String,
  "description": String | null,
  "industry": String,           // e.g., "SaaS", "EdTech", "FinTech"
  "stage": String,              // "idea" | "mvp" | "growth" | "scale"
  "founded_date": ISODate | null,
  "website_url": String | null,
  
  // Team Information
  "team": {
    "size": Number,
    "roles": [String],          // e.g., ["CTO", "Developer", "Designer"]
    "founder_background": String // free text for AI context
  },
  
  // Financial Snapshot (latest)
  "current_cash_balance": Number,
  "currency": String,           // "USD" | "EUR" | "INR" etc.
  
  // AI Context
  "target_market": String | null,
  "customer_segments": [String],
  "product_description": String | null,
  "competitive_advantage": String | null,
  
  // Metadata
  "onboarding_completed": Boolean,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

**Indexes:**
- `user_id`: index (one startup per user in MVP)

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "user_id": "507f1f77bcf86cd799439011",
  "name": "LearnFlow",
  "description": "AI-powered learning management system",
  "industry": "EdTech",
  "stage": "mvp",
  "founded_date": "2025-06-01T00:00:00Z",
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
  "competitive_advantage": "Proprietary ML model for learning optimization",
  "onboarding_completed": true,
  "created_at": "2026-01-15T10:35:00Z",
  "updated_at": "2026-01-18T09:15:00Z"
}
```

---

### 3.3 Financials Collection

Stores monthly financial records.

```javascript
{
  "_id": ObjectId,
  "startup_id": ObjectId,       // reference to startups
  "month": String,              // "YYYY-MM" format
  "year": Number,
  "month_num": Number,          // 1-12
  
  // Revenue
  "revenue": {
    "recurring": Number,        // MRR
    "one_time": Number,
    "total": Number
  },
  
  // Expenses by Category
  "expenses": {
    "salaries": Number,
    "marketing": Number,
    "infrastructure": Number,   // servers, tools, subscriptions
    "office": Number,           // rent, utilities
    "legal": Number,
    "other": Number,
    "total": Number
  },
  
  // Calculated Fields
  "net_burn": Number,           // expenses.total - revenue.total
  "cash_balance_start": Number,
  "cash_balance_end": Number,
  
  // Optional Details
  "notes": String | null,
  "accounts_receivable": Number | null,
  "accounts_payable": Number | null,
  
  // Metadata
  "source": String,             // "manual" | "csv_import"
  "created_at": ISODate,
  "updated_at": ISODate
}
```

**Indexes:**
- `startup_id, month`: compound unique index
- `startup_id, created_at`: for time-series queries

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "startup_id": "507f1f77bcf86cd799439012",
  "month": "2026-01",
  "year": 2026,
  "month_num": 1,
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
  "cash_balance_start": 133500,
  "cash_balance_end": 120000,
  "notes": "Launched new marketing campaign",
  "accounts_receivable": 2000,
  "accounts_payable": 500,
  "source": "manual",
  "created_at": "2026-01-18T09:20:00Z",
  "updated_at": "2026-01-18T09:20:00Z"
}
```

---

### 3.4 Scenarios Collection

Stores what-if scenario configurations and results.

```javascript
{
  "_id": ObjectId,
  "startup_id": ObjectId,
  "name": String,
  "description": String | null,
  
  // Scenario Type
  "type": String,               // "hire" | "cut_expense" | "pricing" | "investment" | "custom"
  
  // Modifications (what changes)
  "modifications": {
    "revenue_change": Number | null,       // monthly delta
    "revenue_change_percent": Number | null,
    "expense_changes": {
      "salaries": Number | null,
      "marketing": Number | null,
      "infrastructure": Number | null,
      "other": Number | null
    },
    "one_time_cash_change": Number | null, // e.g., investment received
    "description": String                   // human-readable change
  },
  
  // Calculated Results
  "results": {
    "baseline_runway_months": Number,
    "new_runway_months": Number,
    "runway_delta": Number,
    "baseline_monthly_burn": Number,
    "new_monthly_burn": Number,
    "break_even_months": Number | null,
    "risk_score": String,       // "low" | "medium" | "high" | "critical"
    "calculated_at": ISODate
  },
  
  // Metadata
  "is_favorite": Boolean,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

**Indexes:**
- `startup_id, created_at`: for listing scenarios
- `startup_id, is_favorite`: for quick access to favorites

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "startup_id": "507f1f77bcf86cd799439012",
  "name": "Hire 2 Sales Reps",
  "description": "Impact of adding 2 sales representatives",
  "type": "hire",
  "modifications": {
    "revenue_change": null,
    "revenue_change_percent": 40,
    "expense_changes": {
      "salaries": 10000,
      "marketing": null,
      "infrastructure": null,
      "other": null
    },
    "one_time_cash_change": null,
    "description": "Add 2 sales reps at $5K/month each, expecting 40% revenue growth"
  },
  "results": {
    "baseline_runway_months": 8.9,
    "new_runway_months": 5.1,
    "runway_delta": -3.8,
    "baseline_monthly_burn": 13500,
    "new_monthly_burn": 23500,
    "break_even_months": 8,
    "risk_score": "medium",
    "calculated_at": "2026-01-18T10:00:00Z"
  },
  "is_favorite": true,
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T10:00:00Z"
}
```

---

### 3.5 Ideas Collection

Stores AI-generated pivot and expansion ideas.

```javascript
{
  "_id": ObjectId,
  "startup_id": ObjectId,
  
  // Idea Content
  "title": String,
  "description": String,
  "rationale": String,
  
  // Assessments
  "feasibility_score": Number,  // 1-10
  "market_opportunity": String, // "low" | "medium" | "high"
  "required_investment": Number | null,
  "time_to_revenue_months": Number | null,
  
  // Execution Considerations
  "required_skills": [String],
  "risks": [String],
  "first_steps": [String],
  
  // User Interaction
  "is_saved": Boolean,
  "user_rating": Number | null, // 1-5 stars
  "user_notes": String | null,
  
  // Generation Context
  "generation_context": {
    "prompt_summary": String,
    "llm_provider": String,
    "generated_at": ISODate
  },
  
  // Metadata
  "created_at": ISODate,
  "updated_at": ISODate
}
```

**Indexes:**
- `startup_id, is_saved`: for saved ideas
- `startup_id, created_at`: for idea history

---

### 3.6 Roadmaps Collection

Stores execution roadmaps with phases and tasks.

```javascript
{
  "_id": ObjectId,
  "startup_id": ObjectId,
  "idea_id": ObjectId | null,   // linked idea if applicable
  
  // Roadmap Info
  "title": String,
  "description": String | null,
  "total_duration_weeks": Number,
  "start_date": ISODate | null,
  
  // Phases
  "phases": [
    {
      "phase_number": Number,
      "name": String,
      "description": String,
      "duration_weeks": Number,
      "start_week": Number,
      "end_week": Number,
      
      // Tasks within phase
      "tasks": [
        {
          "task_id": String,     // UUID
          "title": String,
          "description": String | null,
          "is_completed": Boolean,
          "completed_at": ISODate | null
        }
      ],
      
      // KPIs for phase
      "kpis": [
        {
          "name": String,
          "target": String,
          "current": String | null
        }
      ],
      
      // Resources
      "required_resources": [String],
      "estimated_cost": Number | null
    }
  ],
  
  // Progress Tracking
  "overall_progress": Number,   // 0-100 percentage
  "status": String,             // "not_started" | "in_progress" | "completed" | "abandoned"
  
  // Generation Context
  "generation_context": {
    "llm_provider": String,
    "generated_at": ISODate
  },
  
  // Metadata
  "created_at": ISODate,
  "updated_at": ISODate
}
```

**Indexes:**
- `startup_id, status`: for active roadmaps
- `startup_id, created_at`: for roadmap history

---

### 3.7 Settings Collection

Stores user preferences and configuration.

```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,          // unique reference to users
  
  // Alert Preferences
  "alerts": {
    "runway_critical_months": Number,    // default: 3
    "runway_warning_months": Number,     // default: 6
    "email_notifications": Boolean       // future use
  },
  
  // Display Preferences
  "display": {
    "currency": String,                  // "USD" | "EUR" | "INR"
    "date_format": String,               // "MM/DD/YYYY" | "DD/MM/YYYY"
    "theme": String                      // "light" | "dark" | "system"
  },
  
  // LLM Preferences (informational - actual config in .env)
  "llm": {
    "preferred_provider": String | null, // user's preference
    "show_reasoning": Boolean            // show AI reasoning in outputs
  },
  
  // Metadata
  "created_at": ISODate,
  "updated_at": ISODate
}
```

**Indexes:**
- `user_id`: unique index

---

## 4. Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ENTITY RELATIONSHIPS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   users (1) ─────────────────┬──────────────────── (1) settings             │
│      │                       │                                               │
│      │ 1:1 (MVP)             │                                               │
│      ▼                       │                                               │
│   startups (1) ──────────────┼─────────────────────────────────────────     │
│      │                       │                                         │     │
│      │ 1:N                   │ 1:N                1:N              1:N │     │
│      ▼                       ▼                    ▼                    ▼     │
│   financials              scenarios            ideas              roadmaps   │
│   (monthly records)       (what-if)            (AI generated)     (plans)   │
│                                                      │                       │
│                                                      │ 0:1                   │
│                                                      ▼                       │
│                                                 roadmaps                     │
│                                                 (linked)                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5. Data Validation Rules

| Collection | Field | Validation |
|------------|-------|------------|
| users | email | Valid email format, unique |
| users | password_hash | Min 60 chars (bcrypt) |
| startups | stage | Enum: idea, mvp, growth, scale |
| startups | currency | ISO 4217 codes |
| financials | month | Format: YYYY-MM |
| financials | revenue.*, expenses.* | >= 0 |
| scenarios | type | Enum: hire, cut_expense, pricing, investment, custom |
| scenarios | results.risk_score | Enum: low, medium, high, critical |
| ideas | feasibility_score | 1-10 |
| roadmaps | status | Enum: not_started, in_progress, completed, abandoned |
| roadmaps | overall_progress | 0-100 |

## 6. Storage Estimation

| Collection | Est. Doc Size | Est. Docs/User | Total (1000 users) |
|------------|---------------|----------------|-------------------|
| users | 0.5 KB | 1 | 0.5 MB |
| startups | 2 KB | 1 | 2 MB |
| financials | 1 KB | 60 (5 years) | 60 MB |
| scenarios | 1.5 KB | 20 | 30 MB |
| ideas | 2 KB | 50 | 100 MB |
| roadmaps | 5 KB | 10 | 50 MB |
| settings | 0.5 KB | 1 | 0.5 MB |
| **Total** | | | **~243 MB** |

✅ Fits well within MongoDB Atlas free tier (512 MB)

---

**Next:** See [03_api_specification.md](./03_api_specification.md) for API endpoint details.
