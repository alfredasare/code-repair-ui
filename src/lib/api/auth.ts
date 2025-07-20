const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
}

export class AuthAPI {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Login failed" }));
      throw new Error(error.detail || "Login failed");
    }

    return response.json();
  }

  static async logout(token: string): Promise<void> {
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }
  }

  static async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }

    return response.json();
  }

  static async validateToken(token: string): Promise<boolean> {
    try {
      await this.getCurrentUser(token);
      return true;
    } catch {
      return false;
    }
  }
}
