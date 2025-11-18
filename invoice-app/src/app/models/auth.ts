export interface SignupRequest {
    username: string;
    email: string;
    password: string;
  }
  
  export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface AuthResponse {
    access_token: string;
  }
  