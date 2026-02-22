export interface StartupProfile {
  id: string;
  name: string;
  industry: string;
  stage: 'idea' | 'mvp' | 'growth' | 'scale';
  description?: string;
  
  // Team info
  team_size: number;
  founder_background?: string;
  key_roles?: string[];
  
  // Initial financials
  initial_cash_balance?: number;
  initial_monthly_revenue?: number;
  initial_monthly_expenses?: number;
  
  // Settings
  currency: string;
  runway_warning_threshold: number;
  runway_critical_threshold: number;
  
  // Goals
  goals?: string[];
  target_runway_months?: number;
  
  // Metadata
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateStartupInput {
  name: string;
  industry: string;
  stage: 'idea' | 'mvp' | 'growth' | 'scale';
  description?: string;
  team_size?: number;
  founder_background?: string;
  key_roles?: string[];
  initial_cash_balance?: number;
  initial_monthly_revenue?: number;
  initial_monthly_expenses?: number;
  goals?: string[];
  target_runway_months?: number;
}

export type UpdateStartupInput = Partial<CreateStartupInput>;

export interface UserSettings {
  email: string;
  full_name?: string;
  startup_name?: string;
  industry?: string;
  stage?: string;
  currency: string;
  runway_warning_threshold: number;
  runway_critical_threshold: number;
  llm_provider: string;
  llm_model: string;
}

export interface UpdateSettingsInput {
  full_name?: string;
  runway_warning_threshold?: number;
  runway_critical_threshold?: number;
  currency?: string;
}

export interface DataExport {
  user: Record<string, unknown>;
  startup_profile?: Record<string, unknown>;
  financial_records: Record<string, unknown>[];
  export_date: string;
  record_count: number;
}
