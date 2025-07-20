import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsAPI, type UserSettingsRequest } from '@/lib/api/settings';
import { useAuthStore } from '@/lib/auth/auth-store';

export function useModels() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['models'],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token');
      }
      return SettingsAPI.getModels(token);
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePatterns() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['patterns'],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token');
      }
      return SettingsAPI.getPatterns(token);
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserSettings() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['userSettings'],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token');
      }
      return SettingsAPI.getUserSettings(token);
    },
    enabled: !!token,
    retry: (failureCount, error) => {
      // Don't retry if it's a 404 (no settings found)
      if (error instanceof Error && error.message === 'No settings found') {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1 * 60 * 1000, // 1 minute (shorter for user settings)
  });
}

export function useCreateUserSettings() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: UserSettingsRequest) => {
      if (!token) {
        throw new Error('No authentication token');
      }
      return SettingsAPI.createUserSettings(token, settings);
    },
    onSuccess: () => {
      // Invalidate and refetch user settings
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
  });
}

export function useUpdateUserSettings() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: UserSettingsRequest) => {
      if (!token) {
        throw new Error('No authentication token');
      }
      return SettingsAPI.updateUserSettings(token, settings);
    },
    onSuccess: () => {
      // Invalidate and refetch user settings
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
  });
}