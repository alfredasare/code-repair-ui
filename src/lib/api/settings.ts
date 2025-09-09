const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface Model {
  id: string;
  name: string;
  model_id: string;
  type: "openai";
  date_created: string;
  date_modified: string;
}

export interface ModelsResponse {
  models: Model[];
  total: number;
}

export interface Pattern {
  id: string;
  name: string;
  pattern_id: string;
  description: string;
  full_description?: string;
  date_created: string;
  date_modified: string;
}

export interface PatternsResponse {
  patterns: Pattern[];
  total: number;
}

export interface DataSource {
  id: string;
  name: string;
  db_type: "vector" | "graph";
  provider: string;
  is_default: boolean;
  is_active: boolean;
}

export interface UserSettingsRequest {
  model_id: string;
  pattern_id: string;
  retrievalK: number;
  vector_data_source_id?: string | null;
  graph_data_source_id?: string | null;
}

export interface UserSettings {
  id: string;
  user_id: string;
  model_id: string;
  pattern_id: string;
  retrievalK: number;
  vector_data_source_id?: string | null;
  graph_data_source_id?: string | null;
  date_created: string;
  date_modified: string;
}

export class SettingsAPI {
  static async getModels(token: string): Promise<ModelsResponse> {
    const response = await fetch(`${BACKEND_URL}/api/v1/models/`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch models");
    }

    return response.json();
  }

  static async getPatterns(token: string): Promise<PatternsResponse> {
    const response = await fetch(`${BACKEND_URL}/api/v1/patterns/`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch patterns");
    }

    return response.json();
  }

  static async getUserSettings(token: string): Promise<UserSettings> {
    const response = await fetch(`${BACKEND_URL}/api/v1/settings/`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No settings found, return null or throw specific error
        throw new Error("No settings found");
      }
      throw new Error("Failed to fetch user settings");
    }

    return response.json();
  }

  static async createUserSettings(
    token: string,
    settings: UserSettingsRequest
  ): Promise<UserSettings> {
    const response = await fetch(`${BACKEND_URL}/api/v1/settings/`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error("Failed to create user settings");
    }

    return response.json();
  }

  static async updateUserSettings(
    token: string,
    settings: UserSettingsRequest
  ): Promise<UserSettings> {
    const response = await fetch(`${BACKEND_URL}/api/v1/settings/`, {
      method: "PUT",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error("Failed to update user settings");
    }

    return response.json();
  }

  static async getDataSources(
    token: string,
    params?: {
      db_type?: "vector" | "graph";
      active_only?: boolean;
    }
  ): Promise<DataSource[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.db_type) {
      searchParams.append("db_type", params.db_type);
    }
    
    if (params?.active_only !== undefined) {
      searchParams.append("active_only", params.active_only.toString());
    }

    const url = `${BACKEND_URL}/api/v1/data-sources/${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data sources");
    }

    return response.json();
  }
}
