# 🎨 Frontend Architecture

## 1. Overview

STRATA-AI frontend is a React Single Page Application (SPA) built with modern tooling for performance and developer experience.

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    App Shell                             │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │    │
│  │  │   Router    │  │   Layout    │  │  Error Boundary │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────────┐  │
│  │                      Pages                                 │  │
│  │  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │  │
│  │  │  Auth  │ │Dashboard │ │Scenarios │ │   Ideation     │  │  │
│  │  └────────┘ └──────────┘ └──────────┘ └────────────────┘  │  │
│  │  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │  │
│  │  │Roadmap │ │Financials│ │ Settings │ │   Onboarding   │  │  │
│  │  └────────┘ └──────────┘ └──────────┘ └────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────────┐  │
│  │                   Shared Components                        │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │  │
│  │  │ Charts │ │ Forms  │ │ Tables │ │ Modals │ │ Cards  │   │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────────┐  │
│  │                    State Management                        │  │
│  │  ┌─────────────────────┐  ┌─────────────────────────────┐ │  │
│  │  │   React Query       │  │   Zustand (minimal)         │ │  │
│  │  │   (Server State)    │  │   (Client State)            │ │  │
│  │  └─────────────────────┘  └─────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.0+ | UI Framework |
| TypeScript | 5.0+ | Type Safety |
| Vite | 5.0+ | Build Tool |
| Tailwind CSS | 3.4+ | Styling |
| React Router | 6.0+ | Routing |
| TanStack Query | 5.0+ | Server State |
| Zustand | 4.0+ | Client State (auth, UI tabs) |
| React Hook Form | 7.0+ | Forms |
| Zod | 3.0+ | Validation |
| Chart.js | 4.0+ | Charts (Line, Bar, Doughnut) |
| Framer Motion | 10.0+ | Animations |
| Lucide React | Latest | Icons |

## 3. Project Structure

```
src/
├── main.tsx                 # Entry point
├── App.tsx                  # Root component
├── vite-env.d.ts           # Vite types
│
├── assets/                  # Static assets
│   ├── images/
│   └── fonts/
│
├── components/              # Shared components
│   ├── ui/                  # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Toast.tsx
│   │   ├── Spinner.tsx
│   │   └── index.ts
│   │
│   ├── charts/              # Chart components (with empty states)
│   │   ├── RunwayGauge.tsx
│   │   ├── CashFlowChart.tsx      # Line chart - Income/Expenses/Net
│   │   ├── ExpenseBreakdown.tsx   # Doughnut chart - by category
│   │   ├── RevenueComparison.tsx  # Bar chart - YoY comparison
│   │   └── index.ts
│   │
│   ├── forms/               # Form components
│   │   ├── ScenarioForm.tsx       # Create what-if scenarios
│   │   ├── IdeaForm.tsx           # AI ideation with context
│   │   ├── RoadmapForm.tsx        # AI or manual roadmap creation
│   │   └── index.ts
│   │
│   ├── layout/              # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── MainLayout.tsx
│   │   └── AuthLayout.tsx
│   │
│   └── shared/              # Other shared components
│       ├── ModalController.tsx    # Controls modal rendering based on UI state
│       ├── StatCard.tsx           # Dashboard stat cards
│       ├── ScenarioCard.tsx       # Clickable scenario cards
│       ├── IdeaCard.tsx           # AI idea cards with roadmap generation
│       ├── RoadmapCard.tsx        # Roadmap summary cards
│       ├── ProtectedRoute.tsx     # Auth-protected route wrapper
│       └── index.ts
│
├── pages/                   # Page components
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ForgotPasswordPage.tsx
│   │
│   ├── onboarding/
│   │   ├── OnboardingWizard.tsx
│   │   ├── steps/
│   │   │   ├── StartupBasics.tsx
│   │   │   ├── FinancialSnapshot.tsx
│   │   │   ├── TeamComposition.tsx
│   │   │   └── Goals.tsx
│   │   └── index.ts
│   │
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   ├── components/
│   │   │   ├── RunwayCard.tsx
│   │   │   ├── AlertsPanel.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── MetricsGrid.tsx
│   │   └── index.ts
│   │
│   ├── financials/
│   │   ├── FinancialsPage.tsx
│   │   ├── FinancialEntryPage.tsx
│   │   ├── ImportCSVPage.tsx
│   │   └── index.ts
│   │
│   ├── scenarios/
│   │   ├── ScenariosPage.tsx
│   │   ├── ScenarioDetailPage.tsx
│   │   ├── CreateScenarioPage.tsx
│   │   ├── CompareScenarioPage.tsx
│   │   └── index.ts
│   │
│   ├── ideation/
│   │   ├── IdeationPage.tsx
│   │   ├── IdeaDetailPage.tsx
│   │   ├── components/
│   │   │   ├── IdeaCard.tsx
│   │   │   ├── IdeaGenerator.tsx
│   │   │   └── ConstraintsForm.tsx
│   │   └── index.ts
│   │
│   ├── roadmaps/
│   │   ├── RoadmapsPage.tsx
│   │   ├── RoadmapDetailPage.tsx
│   │   ├── components/
│   │   │   ├── PhaseCard.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── Timeline.tsx
│   │   │   └── ProgressBar.tsx
│   │   └── index.ts
│   │
│   └── settings/
│       └── SettingsPage.tsx       # 7 tabs: Profile, Startup, Alerts, Security, Import, LLM, Data
│
├── hooks/                   # Custom hooks
│   ├── useAuth.ts
│   ├── useStartup.ts
│   ├── useRunway.ts
│   ├── useScenarios.ts
│   ├── useIdeas.ts
│   ├── useRoadmaps.ts
│   ├── useFinancials.ts
│   └── useSettings.ts
│
├── services/                # API services
│   ├── api.ts               # Axios instance
│   ├── auth.service.ts
│   ├── startup.service.ts
│   ├── financial.service.ts
│   ├── runway.service.ts
│   ├── scenario.service.ts
│   ├── ai.service.ts
│   ├── roadmap.service.ts
│   ├── llm.service.ts       # LLM configuration management
│   └── settings.service.ts
│
├── stores/                  # Zustand stores
│   ├── auth.store.ts        # Authentication state (user, token, login/logout)
│   ├── ui.store.ts          # UI state (modals, activeTab)
│   ├── notification.store.ts # Notifications state (list, read/unread)
│   └── search.store.ts      # Global search state (query, results)
│
├── types/                   # TypeScript types
│   ├── auth.types.ts
│   ├── startup.types.ts
│   ├── financial.types.ts
│   ├── scenario.types.ts
│   ├── idea.types.ts
│   ├── roadmap.types.ts
│   ├── llm.types.ts         # LLM configuration types
│   └── api.types.ts
│
├── utils/                   # Utility functions
│   ├── format.ts            # Formatters (currency, date)
│   ├── calculations.ts      # Financial calculations
│   ├── validation.ts        # Zod schemas
│   └── constants.ts
│
├── styles/                  # Global styles
│   └── globals.css          # Tailwind imports
│
└── config/                  # Configuration
    ├── routes.ts            # Route definitions
    └── queryClient.ts       # React Query config
```

## 4. Notifications System

### Architecture

```typescript
// src/types/notification.types.ts
export type NotificationType = 'warning' | 'info' | 'success' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
}
```

### Store (Zustand)

```typescript
// src/stores/notification.store.ts
interface NotificationState {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
}
```

### Service

```typescript
// src/services/notification.service.ts
- fetchNotifications(): Fetches from API or generates from dashboard data
- generateNotificationsFromDashboard(): Creates alerts based on runway, burn rate
- markNotificationAsRead(id): Marks single notification as read
- markAllNotificationsAsRead(): Marks all as read
- formatTimeAgo(date): Returns human-readable timestamps
```

### Dynamic Notifications Generated

| Notification | Condition | Link |
|--------------|-----------|------|
| Runway Warning | runway < 6 months | `/` |
| Critical Runway | runway < 3 months | `/scenarios` |
| High Burn Rate | burn > $50k/month | `/` |
| Positive Cash Flow | burn < 0 | `/` |
| Welcome | No financial data | `/settings` |

---

## 5. Global Search

### Architecture

```typescript
// src/types/search.types.ts
export type SearchResultType = 'scenario' | 'idea' | 'roadmap' | 'report';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  link: string;
}
```

### Store (Zustand)

```typescript
// src/stores/search.store.ts
interface SearchState {
  query: string;
  results: SearchResult[];
  isOpen: boolean;
  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  clearSearch: () => void;
}
```

### Service

```typescript
// src/services/search.service.ts
- performSearch(query): Searches across scenarios, roadmaps, reports
- debouncedSearch(query, callback, delay): Debounced version (300ms)
```

### Searchable Content

| Type | Searches By |
|------|-------------|
| Scenarios | Name, type |
| Roadmaps | Title, description |
| Reports | Keywords (export, csv, monthly, etc.) |
| Pages | Dashboard, settings, ideation, roadmap, scenario |

---

## 6. Modal System

### ModalController Component

```typescript
// src/components/shared/ModalController.tsx
// Renders modals based on UI store state

switch (type) {
  case 'createScenario': return <Modal><ScenarioForm /></Modal>;
  case 'createIdea': return <Modal><IdeaForm /></Modal>;
  case 'createRoadmap': return <Modal><RoadmapForm /></Modal>;
}
```

### UI Store Modal State

```typescript
// src/stores/ui.store.ts
type ModalType = 'createScenario' | 'createIdea' | 'createRoadmap';

interface UiState {
  type: ModalType | null;
  isOpen: boolean;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
}
```

### Context-Specific Buttons

| Page | Button | Opens |
|------|--------|-------|
| `/scenarios` | New Scenario | ScenarioForm |
| `/ideation` | Generate Ideas | IdeaForm |
| `/roadmaps` | New Roadmap | RoadmapForm |

---

## 7. LLM Management Dashboard

The LLM Provider tab in Settings allows users to configure their AI provider without code changes.

### Architecture

```typescript
// src/types/llm.types.ts
export interface LLMProvider {
  id: string;           // 'groq' | 'openai' | 'gemini' | 'ollama'
  name: string;
  description: string;
  models: string[];
  requires_api_key: boolean;
  is_configured: boolean;
}

export interface LLMConfig {
  provider: string;
  model: string;
  is_connected: boolean;
  api_key_set: boolean;
  available_providers: LLMProvider[];
}
```

### Service

```typescript
// src/services/llm.service.ts
export const getLLMConfig = async (): Promise<LLMConfig>;
export const updateLLMConfig = async (config: UpdateLLMConfig): Promise<LLMConfig>;
export const testLLMConnection = async (request?: TestLLMRequest): Promise<TestLLMResponse>;
export const deleteAPIKey = async (provider: string): Promise<{ message: string }>;
```

### Default Configuration

Groq is pre-configured with the system API key. Users can use AI features immediately:

| Provider | Pre-configured | User Action |
|----------|---------------|-------------|
| **Groq** | ✅ System API key | Ready to use |
| **OpenAI** | ❌ | User adds their key |
| **Gemini** | ❌ | User adds their key |
| **Ollama** | ✅ No key needed | Local installation |

### UI Components

The LLM tab includes:
- **Connection Status**: Green (connected) / Yellow (not connected)
- **Provider Cards**: Clickable cards with model info and status badges
- **Model Dropdown**: Select from available models per provider
- **API Key Input**: Secure input with show/hide toggle
- **Test Connection**: Button with response preview and latency
- **Save/Reset**: Apply or revert configuration changes

### API Priority for Groq

```typescript
// Backend: get_effective_api_key()
// Priority order:
1. User's custom API key (if provided)
2. System Groq API key (from .env)
3. Environment variable fallback
```

---

## 8. Dashboard Tabs & Reports

The dashboard uses a shared `activeTab` state from Zustand to switch between three views:

### Tab Structure

| Tab | Components | Features |
|-----|------------|----------|
| **Overview** | StatCard, CashFlowChart, ExpenseBreakdown, RevenueComparison | Key metrics, visualizations |
| **Analytics** | StatCard, TrendAnalysis, KeyMetrics | Growth trends, CAC/LTV/MRR |
| **Reports** | ReportCards with CSV generation | 6 downloadable report types |

### Report Generation (CSV)

```typescript
// src/services/dashboard.service.ts
export type ReportType = 
  | 'monthly-summary' 
  | 'cash-flow' 
  | 'expense-breakdown' 
  | 'runway-analysis' 
  | 'revenue-analysis' 
  | 'investor-update';

export const generateReport = async (reportType: ReportType): Promise<void> => {
  // Fetches data from API, converts to CSV, triggers download
};
```

### Chart Empty States

All chart components handle missing data gracefully:

```typescript
// Example: CashFlowChart.tsx
const hasData = data && data.length > 0 && data.some(d => d.balance > 0);

if (!hasData) {
  return <EmptyState icon={TrendingUp} message="No cash flow data" />;
}
```

---

## 5. Settings Page Architecture

The Settings page uses a tab-based layout with 7 sections:

| Tab | State | Features |
|-----|-------|----------|
| My Profile | `fullName` | Update display name |
| Startup Profile | `startupName`, `industry`, `stage`, `teamSize` | Edit company info |
| Alert Thresholds | `warningThreshold`, `criticalThreshold`, `currency` | Configure alerts |
| Security | `currentPassword`, `newPassword`, `confirmPassword` | Change password |
| Import Data | `isImporting`, `importError`, `importSuccess`, `googleSheetUrl` | File uploads, Google Sheets |
| LLM Provider | Read-only | View AI configuration |
| Data & Account | - | Export data, delete account |

### Data Import Flow

```typescript
// Supported file types
const handleFileImport = async (file: File, fileTypeHint: string) => {
  // fileTypeHint: 'pitch_deck' | 'financial_csv' | 'bank_statement' | 'stripe_csv'
  // Calls: /api/v1/onboarding/extract-from-file-enhanced
};

const handleGoogleSheetConnect = async () => {
  // Calls: /api/v1/onboarding/connect-google-sheets
};
```

---

## 6. Routing Structure

```typescript
// src/config/routes.ts

export const routes = {
  // Public routes
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  
  // Onboarding
  onboarding: '/onboarding',
  
  // Protected routes
  dashboard: '/',
  
  // Scenarios
  scenarios: '/scenarios',
  scenarioCreate: '/scenarios/create',
  scenarioDetail: '/scenarios/:id',
  scenarioCompare: '/scenarios/compare',
  
  // Ideation
  ideation: '/ideation',
  ideaDetail: '/ideation/:id',
  
  // Roadmaps
  roadmaps: '/roadmaps',
  roadmapDetail: '/roadmaps/:id',
  
  // Settings (single page with tabs)
  settings: '/settings',
};
```

## 5. Component Examples

### 5.1 RunwayGauge Component

```typescript
// src/components/charts/RunwayGauge.tsx

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface RunwayGaugeProps {
  months: number;
  trend: 'improving' | 'stable' | 'declining';
  className?: string;
}

export function RunwayGauge({ months, trend, className }: RunwayGaugeProps) {
  const { color, label, percentage } = useMemo(() => {
    if (months < 3) return { color: 'red', label: 'Critical', percentage: 15 };
    if (months < 6) return { color: 'orange', label: 'Warning', percentage: 35 };
    if (months < 12) return { color: 'yellow', label: 'Caution', percentage: 60 };
    return { color: 'green', label: 'Healthy', percentage: 85 };
  }, [months]);

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
      <h3 className="text-sm font-medium text-gray-500 mb-4">Current Runway</h3>
      
      {/* Gauge visualization */}
      <div className="relative h-32 flex items-center justify-center">
        <svg viewBox="0 0 100 50" className="w-full max-w-[200px]">
          {/* Background arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <motion.path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={`var(--color-${color}-500)`}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: percentage / 100 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{months.toFixed(1)}</span>
          <span className="text-sm text-gray-500">months</span>
        </div>
      </div>
      
      {/* Status badge */}
      <div className="flex items-center justify-between mt-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-700`}>
          {label}
        </span>
        <span className={`text-sm ${trend === 'declining' ? 'text-red-500' : 'text-green-500'}`}>
          {trend === 'declining' ? '↓' : trend === 'improving' ? '↑' : '→'} {trend}
        </span>
      </div>
    </div>
  );
}
```

### 5.2 useRunway Hook

```typescript
// src/hooks/useRunway.ts

import { useQuery } from '@tanstack/react-query';
import { runwayService } from '@/services/runway.service';
import { RunwayData, ProjectionParams, ProjectionResult } from '@/types/runway.types';

export function useRunway() {
  return useQuery<RunwayData>({
    queryKey: ['runway', 'current'],
    queryFn: () => runwayService.getCurrent(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

export function useRunwayProjection(params: ProjectionParams) {
  return useQuery<ProjectionResult>({
    queryKey: ['runway', 'projection', params],
    queryFn: () => runwayService.project(params),
    enabled: !!params.targetDate,
  });
}
```

### 5.3 API Service

```typescript
// src/services/api.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 5.4 Auth Store (Zustand)

```typescript
// src/stores/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
      }),
      
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
```

## 6. State Management Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SERVER STATE (React Query)           CLIENT STATE (Zustand)    │
│  ─────────────────────────            ───────────────────────   │
│                                                                  │
│  • User data                          • Auth token              │
│  • Startup profile                    • UI state (modals,       │
│  • Financial records                    sidebars, themes)       │
│  • Scenarios                          • Form drafts             │
│  • Ideas                              • Temporary selections    │
│  • Roadmaps                                                      │
│  • Settings                                                      │
│                                                                  │
│  Features:                            Features:                  │
│  • Automatic caching                  • Persist to localStorage │
│  • Background refetching              • Simple API              │
│  • Optimistic updates                 • No boilerplate          │
│  • Infinite queries                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 7. Form Handling

```typescript
// Example: Financial Entry Form with React Hook Form + Zod

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const financialEntrySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format'),
  revenue: z.object({
    recurring: z.number().min(0),
    oneTime: z.number().min(0),
  }),
  expenses: z.object({
    salaries: z.number().min(0),
    marketing: z.number().min(0),
    infrastructure: z.number().min(0),
    office: z.number().min(0),
    legal: z.number().min(0),
    other: z.number().min(0),
  }),
  cashBalanceEnd: z.number().min(0),
  notes: z.string().optional(),
});

type FinancialEntryForm = z.infer<typeof financialEntrySchema>;

export function FinancialEntryForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FinancialEntryForm>({
    resolver: zodResolver(financialEntrySchema),
  });
  
  const onSubmit = (data: FinancialEntryForm) => {
    // Submit to API
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## 8. Error Handling

```typescript
// src/components/shared/ErrorFallback.tsx

import { FallbackProps } from 'react-error-boundary';
import { Button } from '@/components/ui';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        <Button onClick={resetErrorBoundary}>
          Try again
        </Button>
      </div>
    </div>
  );
}
```

## 9. Performance Optimizations

| Technique | Implementation |
|-----------|----------------|
| **Code Splitting** | React.lazy() for route-based splitting |
| **Memoization** | useMemo, useCallback for expensive computations |
| **Virtualization** | Virtual lists for large data sets |
| **Image Optimization** | Lazy loading, WebP format |
| **Bundle Analysis** | Vite bundle analyzer |
| **Caching** | React Query with stale-while-revalidate |

## 10. Responsive Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    BREAKPOINTS (Tailwind)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Mobile (< 640px)     │  Tablet (640-1024px)  │  Desktop (1024+) │
│  ─────────────────    │  ──────────────────   │  ──────────────  │
│                       │                        │                  │
│  • Single column      │  • Two columns         │  • Full sidebar  │
│  • Bottom nav         │  • Collapsible sidebar │  • Multi-column  │
│  • Stacked cards      │  • Responsive charts   │  • Side-by-side  │
│  • Simplified charts  │                        │    comparisons   │
│                       │                        │                  │
└─────────────────────────────────────────────────────────────────┘
```

---

**Next:** See [06_security_architecture.md](./06_security_architecture.md) for security implementation details.
