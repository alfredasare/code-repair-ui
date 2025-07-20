import { useMutation, useQuery } from '@tanstack/react-query';
import { AssessmentAPI, type QueryRequest, type GenerateRecommendationRequest, type GenerateFixRequest, type EvaluateRequest, type StoreResultsRequest } from '@/lib/api/assessment';
import { useAuthStore } from '@/lib/auth/auth-store';

export function useQueryDatabase() {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: (request: QueryRequest) => {
      if (!token) {
        throw new Error('No authentication token');
      }
      return AssessmentAPI.query(token, request);
    },
  });
}

export function useGenerateRecommendation() {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: (request: GenerateRecommendationRequest) => {
      if (!token) {
        throw new Error('No authentication token');
      }
      return AssessmentAPI.generateRecommendation(token, request);
    },
  });
}

export function useGenerateFix() {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: (request: GenerateFixRequest) => {
      if (!token) {
        throw new Error('No authentication token');
      }
      return AssessmentAPI.generateFix(token, request);
    },
  });
}

export function useEvaluate() {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: (request: EvaluateRequest) => {
      if (!token) {
        throw new Error('No authentication token');
      }
      return AssessmentAPI.evaluate(token, request);
    },
  });
}

export function useStoreResults() {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: (request: StoreResultsRequest) => {
      if (!token) {
        throw new Error('No authentication token');
      }
      return AssessmentAPI.storeResults(token, request);
    },
  });
}

export function useAssessments() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['assessments'],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token');
      }
      return AssessmentAPI.getAssessments(token);
    },
    enabled: !!token,
  });
}

export function useAssessment(assessmentId: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token');
      }
      return AssessmentAPI.getAssessment(token, assessmentId);
    },
    enabled: !!token && !!assessmentId,
  });
}