# 📚 STRATA-AI Documentation

Complete documentation for the STRATA-AI startup survival and strategy assistant.

---

## 📋 Documentation Index

| Document | Description |
|----------|-------------|
| [**Product Requirements (PRD)**](./prd/prd.md) | Full product requirements, user personas, features |
| [**Architecture Overview**](./architecture/README.md) | Technical architecture documentation |

---

## 🏗️ Architecture Documentation

| Document | Description |
|----------|-------------|
| [System Overview](./architecture/01_system_overview.md) | High-level architecture, components, data flows |
| [Database Schema](./architecture/02_database_schema.md) | MongoDB collections, schemas, relationships |
| [API Specification](./architecture/03_api_specification.md) | REST API endpoints, requests, responses |
| [LLM Integration](./architecture/04_llm_integration.md) | LLM abstraction, providers, prompts |
| [Frontend Architecture](./architecture/05_frontend_architecture.md) | React components, state, routing |
| [Security Architecture](./architecture/06_security_architecture.md) | Auth, authorization, data protection |
| [Deployment Architecture](./architecture/07_deployment_architecture.md) | Infrastructure, CI/CD, environments |

---

## 🚀 Quick Links

### For Developers
- [Backend README](../backend/README.md) - Setup & API reference
- [Frontend README](../frontend/README.md) - Setup & component guide
- [Main README](../README.md) - Project overview

### For Product/Business
- [PRD](./prd/prd.md) - Full product requirements
- [User Personas](./prd/prd.md#4-target-users--use-cases) - Target users
- [Features](./prd/prd.md#6-functional-requirements) - Feature specifications

---

## 🎯 Feature Requirements Summary

| ID | Feature | Status |
|----|---------|--------|
| FR-1 | User Authentication & Onboarding | ✅ Implemented |
| FR-2 | Financial Data Management | ✅ Implemented |
| FR-3 | AI Runway Predictor | ✅ Implemented |
| FR-4 | Future Condition Simulator | ✅ Implemented |
| FR-5 | What-If Scenario Analyzer | ✅ Implemented |
| FR-6 | AI Ideation & Pivot Engine | ✅ Implemented |
| FR-7 | Smart Execution Roadmaps | ✅ Implemented |
| FR-8 | Visualization Dashboard | ✅ Implemented |
| FR-9 | Hybrid LLM Provider System | ✅ Implemented |
| FR-10 | Password Management (Change/Reset) | ✅ Implemented |
| FR-11 | Data Import (Files, Google Sheets) | ✅ Implemented |
| FR-12 | Dashboard Tabs (Overview/Analytics/Reports) | ✅ Implemented |
| FR-13 | CSV Report Generation (6 types) | ✅ Implemented |
| FR-14 | Settings Page (7 tabs) | ✅ Implemented |
| FR-15 | Notifications System (Dynamic alerts) | ✅ Implemented |
| FR-16 | Global Search (Scenarios, Roadmaps, Pages) | ✅ Implemented |
| FR-17 | Scenario Detail Page | ✅ Implemented |
| FR-18 | Modal System (Create Scenario/Idea/Roadmap) | ✅ Implemented |
| FR-19 | Analytics Empty States | ✅ Implemented |
| FR-20 | LLM Management Dashboard | ✅ Implemented |
| FR-21 | Groq Default Provider (Pre-configured) | ✅ Implemented |

---

## 📊 New Features (Latest Updates)

### 🔔 Notifications System

Dynamic notifications based on financial data:
- **Runway Warning**: Alert when runway < 6 months
- **Critical Runway**: Alert when runway < 3 months
- **High Burn Rate**: Alert when burn > $50k/month
- **Positive Cash Flow**: Celebration when net positive
- **Welcome**: Guidance for new users

Features: Red dot indicator, mark as read, click to navigate, human-readable timestamps.

### 🔍 Global Search

Search across your entire workspace:
- Search scenarios by name or type
- Search roadmaps by title or description
- Search reports by keywords
- Quick navigation to pages (Dashboard, Settings, etc.)

Features: Debounced search, results grouped by type, clear button, click-outside to close.

### 📝 Scenario Management

**Scenario Detail Page** (`/scenarios/:id`):
- Header with scenario name, type icon, runway impact badge
- Metrics grid: New Runway, Runway Impact, New Burn Rate, Created Date
- Modifications details: expense/revenue changes, one-time cash impact

**Clickable Scenario Cards**: Navigate to detail page on click.

### 💡 Modal System

Context-aware modals for creating content:
| Page | Button | Modal |
|------|--------|-------|
| `/scenarios` | New Scenario | Create scenario with financial modifications |
| `/ideation` | Generate Ideas | AI ideation with context input |
| `/roadmaps` | New Roadmap | AI-generated or manual roadmap creation |

### 🤖 LLM Management Dashboard

Full LLM provider management from Settings page:

**Supported Providers:**
| Provider | Pre-configured | Description |
|----------|---------------|-------------|
| **Groq** | ✅ Yes (Default) | Ultra-fast inference with Llama 3.3 |
| **OpenAI** | ❌ User adds key | GPT-4, GPT-3.5 |
| **Google Gemini** | ❌ User adds key | Gemini Pro, 1.5 |
| **Ollama** | ✅ No key needed | Local inference |

**Dashboard Features:**
- Connection status indicator (Green/Yellow)
- Provider selection cards with model info
- Model dropdown per provider
- API key input with show/hide toggle
- Test connection button with response preview
- Latency display after testing
- Save/Reset configuration buttons

**API Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/llm/config` | GET | Get current config |
| `/api/v1/llm/config` | PUT | Update provider/model/key |
| `/api/v1/llm/test` | POST | Test connection |
| `/api/v1/llm/providers` | GET | List all providers |
| `/api/v1/llm/api-key/{provider}` | DELETE | Delete API key |

**Key Behavior:**
1. Groq is pre-configured with system API key
2. Users can use AI features immediately (no setup)
3. Users can switch to other providers by adding their own API keys
4. User's custom API keys take priority over system keys

### Dashboard Enhancements

The dashboard now includes three tabs accessible from the header:

| Tab | Content |
|-----|---------|
| **Overview** | Stats cards, Cash Flow chart, Expense Breakdown donut chart, Revenue Comparison bar chart |
| **Analytics** | Trend Analysis card, Key Metrics (with empty states when no data) |
| **Reports** | 6 downloadable CSV reports with one-click generation |

### Settings Page

Complete settings management with 7 tabs:

| Tab | Features |
|-----|----------|
| My Profile | Update display name |
| Startup Profile | Company name, industry, stage, team size |
| Alert Thresholds | Runway warning/critical levels, currency |
| Security | Change password (requires current password) |
| Import Data | Upload Pitch Deck, Spreadsheets, Bank Statements, Stripe exports, Google Sheets |
| LLM Provider | View AI provider configuration |
| Data & Account | Export all data (JSON), Delete account |

### CSV Report Generation

Generate and download detailed financial reports:

1. **Monthly Summary** - Period overview with revenue, expenses, cash flow
2. **Cash Flow Statement** - Monthly inflows/outflows with running balance
3. **Expense Breakdown** - Categorized expenses with percentages
4. **Runway Analysis** - Current status + projection scenarios (10%, 20% burn reduction)
5. **Revenue Analysis** - Revenue streams breakdown with recurring ratio
6. **Investor Update** - Executive summary with key metrics

### Empty States

All components show helpful empty states when no data is connected:
- **Charts**: "No cash flow data", "No expense data", "No revenue data"
- **Analytics**: "No trend data available", "No metrics available"
- **Notifications**: "No notifications" with bell icon

---

## 🛠️ Tech Stack Overview

### Backend
```
FastAPI + Python 3.11+
├── MongoDB Atlas (Database)
├── Beanie ODM (Object-Document Mapper)
├── Pydantic v2 (Validation)
├── python-jose (JWT Auth)
├── Groq API (LLM)
└── scikit-learn (ML Forecasting)
```

### Frontend
```
React 19 + TypeScript
├── Vite (Build Tool)
├── TailwindCSS (Styling)
├── Zustand (State Management)
├── React Query (Server State)
├── Chart.js (Visualizations)
└── Framer Motion (Animations)
```

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           STRATA-AI                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐              ┌─────────────────────────────┐  │
│  │    FRONTEND     │              │          BACKEND            │  │
│  │  (Vercel/CDN)   │    REST      │         (Render)            │  │
│  │                 │◄────────────►│                             │  │
│  │  React 19       │    JSON      │  FastAPI                    │  │
│  │  TypeScript     │              │  Python 3.11+               │  │
│  │  TailwindCSS    │              │                             │  │
│  │  Chart.js       │              │  ┌─────────────────────┐   │  │
│  │                 │              │  │     Services        │   │  │
│  └─────────────────┘              │  │  ┌───────────────┐  │   │  │
│                                   │  │  │ Runway Engine │  │   │  │
│                                   │  │  │ Forecast Eng. │  │   │  │
│                                   │  │  │ Scenario Eng. │  │   │  │
│                                   │  │  │ AI Service    │  │   │  │
│                                   │  │  └───────────────┘  │   │  │
│                                   │  └─────────────────────┘   │  │
│                                   └──────────────┬──────────────┘  │
│                                                  │                  │
│                          ┌───────────────────────┼──────────────┐  │
│                          │                       │              │  │
│                          ▼                       ▼              │  │
│               ┌──────────────────┐    ┌──────────────────┐     │  │
│               │  MongoDB Atlas   │    │   LLM Providers  │     │  │
│               │  (Database)      │    │                  │     │  │
│               │                  │    │  • Groq (default)│     │  │
│               │  • Users         │    │  • OpenAI        │     │  │
│               │  • Financials    │    │  • Gemini        │     │  │
│               │  • Roadmaps      │    │  • Ollama        │     │  │
│               └──────────────────┘    └──────────────────┘     │  │
│                                                                  │  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Contributing to Documentation

1. All docs are in Markdown format
2. Place architecture docs in `/docs/architecture/`
3. Update this README index when adding new docs
4. Keep docs synchronized with code changes

---

## 📅 Last Updated

**2026-01-20** - Added LLM Management Dashboard with Groq as default provider, Notifications System, Global Search, Scenario Detail Page, Modal System, Analytics Empty States, and updated all documentation.
