const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Query endpoint types
export interface QueryRequest {
  pattern_id: string;
  cwe_id: string;
  cve_id: string;
  additional_params?: Record<string, any>;
}

export interface QueryResponse {
  pattern_id: string;
  results: Record<string, any>;
  message: string;
}

// Generate recommendation types
export interface GenerateRecommendationRequest {
  model_type: "openai" | "groq";
  model_id: string;
  vulnerable_code: string;
  cwe_id: string;
  cve_id: string;
  retrieved_context: string;
}

export interface GenerateRecommendationResponse {
  recommendation: string;
}

// Generate fix types
export interface GenerateFixRequest {
  model_type: "openai" | "groq";
  model_id: string;
  vulnerable_code: string;
  cwe_id: string;
  cve_id: string;
  recommendation: string;
}

export interface GenerateFixResponse {
  fixed_code: string;
}

// Evaluate types
export interface EvaluateRequest {
  vulnerable_code: string;
  cwe_id: string;
  cve_id: string;
  recommendation: string;
  retrieved_context: string;
  model: string;
}

export interface EvaluateResponse {
  recommendation: string;
  vulnerable_code: string;
  cve_id: string;
  cwe_id: string;
  scores: Record<string, number>;
}

// Store results types
export interface StoreResultsRequest {
  scores: Record<string, any>;
  recommendation: string;
  vulnerable_code: string;
  fixed_code: string;
  cwe_id: string;
  cve_id: string;
  model_id: string;
}

export interface StoreResultsResponse {
  assessment_id: string;
  stored_fields: string[];
  message: string;
  stored_at: string;
}

// Assessment list types
export interface Assessment {
  id: string;
  user_id: string;
  evaluation_scores: Record<string, number>;
  recommendation: string;
  vulnerable_code: string;
  fixed_code: string;
  cwe_id: string;
  cve_id: string;
  model_id: string;
  date_created: string;
  date_modified: string;
}

export interface AssessmentsListResponse {
  assessments: Assessment[];
}

export class AssessmentAPI {
  static async query(token: string, request: QueryRequest): Promise<QueryResponse> {
    const response = await fetch(`${BACKEND_URL}/api/v1/query/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to execute query');
    }

    return response.json();
  }

  static async generateRecommendation(
    token: string,
    request: GenerateRecommendationRequest
  ): Promise<GenerateRecommendationResponse> {
    const response = await fetch(`${BACKEND_URL}/api/v1/assessments/generate-recommendation`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to generate recommendation');
    }

    return response.json();
  }

  static async generateFix(
    token: string,
    request: GenerateFixRequest
  ): Promise<GenerateFixResponse> {
    const response = await fetch(`${BACKEND_URL}/api/v1/assessments/generate-fix`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to generate fix');
    }

    return response.json();
  }

  static async evaluate(
    token: string,
    request: EvaluateRequest
  ): Promise<EvaluateResponse> {
    const response = await fetch(`${BACKEND_URL}/api/v1/assessments/evaluate`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to evaluate assessment');
    }

    return response.json();
  }

  static async storeResults(
    token: string,
    request: StoreResultsRequest
  ): Promise<StoreResultsResponse> {
    const response = await fetch(`${BACKEND_URL}/api/v1/assessments/store-results`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to store results');
    }

    return response.json();
  }

  static async getAssessments(token: string): Promise<AssessmentsListResponse> {
    const response = await fetch(`${BACKEND_URL}/api/v1/assessments/`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch assessments');
    }

    return response.json();
  }

  static async getAssessment(token: string, assessmentId: string): Promise<Assessment> {
    const response = await fetch(`${BACKEND_URL}/api/v1/assessments/${assessmentId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch assessment details');
    }

    return response.json();
  }

  static async deleteAssessment(token: string, assessmentId: string): Promise<void> {
    const response = await fetch(`${BACKEND_URL}/api/v1/assessments/${assessmentId}`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete assessment');
    }
  }

  // Helper function to determine model type
  static getModelType(modelId: string): "openai" | "groq" {
    return modelId.toLowerCase().includes('gpt') ? 'openai' : 'groq';
  }
}