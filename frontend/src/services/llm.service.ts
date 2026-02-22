import { apiClient } from './api.client';
import type { LLMConfig, LLMProvider, UpdateLLMConfig, TestLLMRequest, TestLLMResponse } from '@/types/llm.types';

/**
 * Get current LLM configuration
 */
export const getLLMConfig = async (): Promise<LLMConfig> => {
  return apiClient.get<LLMConfig>('/llm/config');
};

/**
 * Update LLM configuration (provider, model, API key)
 */
export const updateLLMConfig = async (config: UpdateLLMConfig): Promise<LLMConfig> => {
  return apiClient.put<LLMConfig>('/llm/config', config);
};

/**
 * Test LLM connection
 */
export const testLLMConnection = async (request?: TestLLMRequest): Promise<TestLLMResponse> => {
  return apiClient.post<TestLLMResponse>('/llm/test', request || {});
};

/**
 * Get all available providers
 */
export const getAvailableProviders = async (): Promise<LLMProvider[]> => {
  return apiClient.get<LLMProvider[]>('/llm/providers');
};

/**
 * Delete API key for a provider
 */
export const deleteAPIKey = async (provider: string): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/llm/api-key/${provider}`);
};
