export interface SimpleForm {
  id: number;
  firstName: string;
  lastName: string;
}

export type SimpleForms = SimpleForm[];

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export interface CreateFormRequest {
  firstName: string;
  lastName: string;
}

export interface CreateFormResponse extends SimpleForm {}
