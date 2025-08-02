export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message: string;
}

export interface ApiV5Response<T = any> {
  success: boolean;
  data: any;
  message: string;
  timestamp: string;
  errors?: any[];
}

export interface ApiV5ListResponse<T = any> extends ApiV5Response<{
  items: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}> {}

export interface ApiV5ErrorResponse {
  success: false;
  message: string;
  errors: any[];
  timestamp: string;
}
