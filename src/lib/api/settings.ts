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

export interface UserSettingsRequest {
  model_id: string;
  pattern_id: string;
  retrievalK: number;
}

export interface UserSettings {
  id: string;
  user_id: string;
  model_id: string;
  pattern_id: string;
  retrievalK: number;
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
}
