import type { 
  StartupProfile, 
  CreateStartupInput, 
  UpdateStartupInput,
  UserSettings,
  UpdateSettingsInput,
  DataExport
} from '@/types/startup.types';
import { apiClient } from './api.client';

// ============== Startup Profile ==============

export const getStartupProfile = async (): Promise<StartupProfile | null> => {
  console.log('Fetching startup profile from API...');
  try {
    const profile = await apiClient.get<StartupProfile>('/startup/profile');
    return profile;
  } catch (error) {
    // 404 means no profile yet (user hasn't completed onboarding)
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
};

export const createStartupProfile = async (input: CreateStartupInput): Promise<StartupProfile> => {
  console.log('Creating startup profile:', input);
  const profile = await apiClient.post<StartupProfile>('/startup/profile', input);
  console.log('Startup profile created');
  return profile;
};

export const updateStartupProfile = async (input: UpdateStartupInput): Promise<StartupProfile> => {
  console.log('Updating startup profile:', input);
  const profile = await apiClient.put<StartupProfile>('/startup/profile', input);
  console.log('Startup profile updated');
  return profile;
};

// ============== User Settings ==============

export const getSettings = async (): Promise<UserSettings> => {
  console.log('Fetching user settings...');
  const settings = await apiClient.get<UserSettings>('/startup/settings');
  return settings;
};

export const updateSettings = async (input: UpdateSettingsInput): Promise<UserSettings> => {
  console.log('Updating settings:', input);
  const settings = await apiClient.put<UserSettings>('/startup/settings', input);
  console.log('Settings updated');
  return settings;
};

// ============== User Info ==============

export const getCurrentUser = async (): Promise<{
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  onboarding_completed: boolean;
}> => {
  console.log('Fetching current user info...');
  return await apiClient.get('/startup/me');
};

// ============== Data Export & Account ==============

export const exportAllData = async (): Promise<DataExport> => {
  console.log('Exporting all user data...');
  const data = await apiClient.get<DataExport>('/startup/export');
  return data;
};

export const deleteAccount = async (): Promise<{ message: string; deleted_at: string }> => {
  console.log('Deleting account...');
  return await apiClient.delete('/startup/account');
};
