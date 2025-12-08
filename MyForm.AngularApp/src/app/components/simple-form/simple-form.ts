import {Component, inject, OnInit, signal, isDevMode} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBarModule, MatSnackBar} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {SimpleForms, CreateFormRequest, ApiError} from '@/types/simpleForm';
import {FormService} from '@/app/services/form.service';

@Component({
  selector: 'app-simple-form',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  standalone: true,
  templateUrl: './simple-form.html',
  styleUrl: './simple-form.css',
})
export class SimpleFormComponent implements OnInit {
  private formService = inject(FormService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  
  forms = signal<SimpleForms>([]);
  submitted = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  validationErrors = signal<Record<string, string[]> | null>(null);
  loading = signal<boolean>(false);
  loadingForms = signal<boolean>(false);
  
  get isDev(): boolean {
    return isDevMode();
  }
  
  ngOnInit(): void {
    this.loadForms();
  }
  
  form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(1)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]]
  });

  loadForms(): void {
    this.loadingForms.set(true);
    this.errorMessage.set(null);
    this.validationErrors.set(null);
    
    this.formService.getAllForms().subscribe({
      next: (result: SimpleForms) => {
        this.forms.set(result);
        this.loadingForms.set(false);
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.validationErrors.set(error.errors || null);
        this.loadingForms.set(false);
        
        // Show error notification
        this.snackBar.open(error.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);
    this.validationErrors.set(null);
    
    if (this.form.valid) {
      const formValue: CreateFormRequest = this.form.value as CreateFormRequest;
      this.loading.set(true);
      
      this.formService.createForm(formValue).subscribe({
        next: () => {
          this.form.reset();
          this.submitted.set(false);
          this.loading.set(false);
          this.errorMessage.set(null);
          this.validationErrors.set(null);
          
          this.snackBar.open('Form submitted successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          
          // Reload forms list
          this.loadForms();
        },
        error: (error: ApiError) => {
          this.errorMessage.set(error.message);
          this.validationErrors.set(error.errors || null);
          this.submitted.set(false);
          this.loading.set(false);
          
          // Apply validation errors to form controls if available
          if (error.errors) {
            Object.keys(error.errors).forEach(key => {
              const control = this.form.get(key);
              if (control && error.errors?.[key]) {
                control.setErrors({ apiError: error.errors[key][0] });
                control.markAsTouched();
              }
            });
          }
          
          this.snackBar.open(error.message, 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }
  
  getFieldError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (!control || !control.errors || (!control.touched && !this.submitted())) {
      return null;
    }
    
    // Check for API validation errors first
    if (control.errors['apiError']) {
      return control.errors['apiError'];
    }
    
    // Check for standard validation errors
    if (control.errors['required']) {
      return `${fieldName === 'firstName' ? 'First name' : 'Last name'} is required`;
    }
    
    if (control.errors['minlength']) {
      return `${fieldName === 'firstName' ? 'First name' : 'Last name'} must be at least ${control.errors['minlength'].requiredLength} characters`;
    }
    
    return null;
  }
  
  getValidationErrorEntries(): Array<{key: string, errors: string[]}> {
    const errors = this.validationErrors();
    if (!errors) {
      return [];
    }
    return Object.entries(errors).map(([key, value]) => ({ key, errors: value }));
  }
  
  hasValidationErrors(): boolean {
    const errors = this.validationErrors();
    if (!errors) {
      return false;
    }
    return Object.keys(errors).length > 0;
  }
  
  triggerRandomError(): void {
    const errorTypes = [
      () => this.triggerNetworkError(),
      () => this.triggerValidationError(),
      () => this.triggerServerError(),
      () => this.triggerNotFoundError(),
      () => this.triggerUnauthorizedError(),
      () => this.triggerTimeoutError(),
      () => this.triggerTooManyRequestsError()
    ];
    
    const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    randomError();
  }
  
  private triggerNetworkError(): void {
    this.errorMessage.set(null);
    this.validationErrors.set(null);
    
    // Simulate network error
    const mockError: ApiError = {
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      errors: undefined,
      statusCode: 0
    };
    this.handleErrorResponse(mockError);
  }
  
  private triggerValidationError(): void {
    this.errorMessage.set(null);
    this.validationErrors.set(null);
    
    // Simulate validation error
    const mockError: ApiError = {
      message: 'Invalid form data. Please check your input and try again.',
      errors: {
        firstName: ['First name must be at least 3 characters long'],
        lastName: ['Last name cannot contain special characters']
      },
      statusCode: 400
    };
    this.handleErrorResponse(mockError);
  }
  
  private triggerServerError(): void {
    this.errorMessage.set(null);
    this.validationErrors.set(null);
    
    const mockError: ApiError = {
      message: 'A server error occurred. Our team has been notified. Please try again later.',
      errors: undefined,
      statusCode: 500
    };
    this.handleErrorResponse(mockError);
  }
  
  private triggerNotFoundError(): void {
    this.errorMessage.set(null);
    this.validationErrors.set(null);
    
    const mockError: ApiError = {
      message: 'The requested resource was not found.',
      errors: undefined,
      statusCode: 404
    };
    this.handleErrorResponse(mockError);
  }
  
  private triggerUnauthorizedError(): void {
    this.errorMessage.set(null);
    this.validationErrors.set(null);
    
    const mockError: ApiError = {
      message: 'You are not authorized to perform this action. Please log in and try again.',
      errors: undefined,
      statusCode: 401
    };
    this.handleErrorResponse(mockError);
  }
  
  private triggerTimeoutError(): void {
    this.errorMessage.set(null);
    this.validationErrors.set(null);
    
    const mockError: ApiError = {
      message: 'The request took too long. Please try again.',
      errors: undefined,
      statusCode: 408
    };
    this.handleErrorResponse(mockError);
  }
  
  private triggerTooManyRequestsError(): void {
    this.errorMessage.set(null);
    this.validationErrors.set(null);
    
    const mockError: ApiError = {
      message: 'Too many requests. Please wait a moment and try again.',
      errors: undefined,
      statusCode: 429
    };
    this.handleErrorResponse(mockError);
  }
  
  private handleErrorResponse(error: ApiError): void {
    this.errorMessage.set(error.message);
    this.validationErrors.set(error.errors || null);
    
    // Apply validation errors to form controls if available
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        const control = this.form.get(key);
        if (control && error.errors?.[key]) {
          control.setErrors({ apiError: error.errors[key][0] });
          control.markAsTouched();
        }
      });
    }
    
    this.snackBar.open(error.message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}