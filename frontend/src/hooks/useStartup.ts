import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getStartupProfile, 
  createStartupProfile,
  updateStartupProfile,
  getSettings,
  updateSettings,
  getCurrentUser,
  exportAllData,
  deleteAccount
} from '@/services/startup.service';
import type { CreateStartupInput, UpdateStartupInput, UpdateSettingsInput } from '@/types/startup.types';

export const useStartupProfile = () => {
  return useQuery({
    queryKey: ['startupProfile'],
    queryFn: getStartupProfile,
  });
};

export const useCreateStartupProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateStartupInput) => createStartupProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startupProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useUpdateStartupProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: UpdateStartupInput) => updateStartupProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startupProfile'] });
    },
  });
};

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => updateSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });
};

export const useExportData = () => {
  return useMutation({
    mutationFn: exportAllData,
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: deleteAccount,
  });
};
