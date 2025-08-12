export interface User {
    id?: number;
    email: string;
    name: string;
    role: string; 
  }
  
  export interface AuthState {
    id: number | null;
    user: User | null;
    token: string | null;
    refreshToken: string | null; 
    loading: boolean;
    error: string | null;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    name: string;
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    status: string;
    data: {
      id: number;
      name: string;
      email: string;
      role: string;
      token: string;
      refreshToken: string;
    };
  }
  