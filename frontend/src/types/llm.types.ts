export interface LLMProvider {
  id: string;
  name: string;
  description: string;
  models: string[];
  requires_api_key: boolean;
  api_key_env_var: string;
  is_configured: boolean;
}

export interface LLMConfig {
  provider: string;
  model: string;
  is_connected: boolean;
  api_key_set: boolean;
  available_providers: LLMProvider[];
}

export interface UpdateLLMConfig {
  provider: string;
  model: string;
  api_key?: string;
}

export interface TestLLMRequest {
  provider?: string;
  model?: string;
  api_key?: string;
  prompt?: string;
}

export interface TestLLMResponse {
  success: boolean;
  message: string;
  response?: string;
  latency_ms?: number;
}
