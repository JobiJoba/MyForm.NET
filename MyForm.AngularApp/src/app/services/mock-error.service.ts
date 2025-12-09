import { Injectable } from '@angular/core';
import { ApiError } from '@/types/simpleForm';

@Injectable({
  providedIn: 'root'
})
export class MockErrorService {
  getRandomError(): ApiError {
    const errorTypes = [
      () => this.getNetworkError(),
      () => this.getValidationError(),
      () => this.getServerError(),
      () => this.getNotFoundError(),
      () => this.getUnauthorizedError(),
      () => this.getTimeoutError(),
      () => this.getTooManyRequestsError()
    ];
    
    const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    return randomError();
  }
  
  getNetworkError(): ApiError {
    return {
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      errors: undefined,
      statusCode: 0
    };
  }
  
  getValidationError(): ApiError {
    return {
      message: 'Invalid form data. Please check your input and try again.',
      errors: {
        firstName: ['First name must be at least 3 characters long'],
        lastName: ['Last name cannot contain special characters']
      },
      statusCode: 400
    };
  }
  
  getServerError(): ApiError {
    return {
      message: 'A server error occurred. Our team has been notified. Please try again later.',
      errors: undefined,
      statusCode: 500
    };
  }
  
  getNotFoundError(): ApiError {
    return {
      message: 'The requested resource was not found.',
      errors: undefined,
      statusCode: 404
    };
  }
  
  getUnauthorizedError(): ApiError {
    return {
      message: 'You are not authorized to perform this action. Please log in and try again.',
      errors: undefined,
      statusCode: 401
    };
  }
  
  getTimeoutError(): ApiError {
    return {
      message: 'The request took too long. Please try again.',
      errors: undefined,
      statusCode: 408
    };
  }
  
  getTooManyRequestsError(): ApiError {
    return {
      message: 'Too many requests. Please wait a moment and try again.',
      errors: undefined,
      statusCode: 429
    };
  }
}

