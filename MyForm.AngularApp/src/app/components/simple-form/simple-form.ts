import {Component, inject, OnInit, isDevMode, DestroyRef} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {finalize} from 'rxjs';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBarModule, MatSnackBar} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CreateFormRequest, ApiError} from '@/types/simpleForm';
import {FormService} from '@/app/services/form.service';
import {MockErrorService} from '@/app/services/mock-error.service';
import {FormState} from './form-state';

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
  private mockErrorService = inject(MockErrorService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);
  
  // Encapsulated state management
  readonly state = new FormState();
  
  // Expose state signals for template
  readonly forms = this.state.forms;
  readonly submitted = this.state.submitted;
  readonly errorMessage = this.state.errorMessage;
  readonly validationErrors = this.state.validationErrors;
  readonly loading = this.state.submitting;
  readonly loadingForms = this.state.loadingForms;
  readonly isLoading = this.state.isLoading;
  readonly hasError = this.state.hasError;
  readonly hasValidationErrors = this.state.hasValidationErrors;
  
  get isDev(): boolean {
    return isDevMode();
  }
  
  ngOnInit(): void {
    this.loadForms();
  }
  
  form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]]
  });

  loadForms(): void {
    this.state.setLoadingForms(true);
    this.state.clearError();
    
    this.formService.getAllForms()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.state.setLoadingForms(false))
      )
      .subscribe({
        next: (result) => {
          this.state.setForms(result);
        },
        error: (error: ApiError) => {
          this.state.setError(error);
          this.showErrorNotification(error.message);
        }
      });
  }

  onSubmit(): void {
    this.state.setSubmitted(true);
    this.state.clearError();
    
    if (this.form.valid) {
      const formValue: CreateFormRequest = this.form.value as CreateFormRequest;
      this.state.setSubmitting(true);
      
      this.formService.createForm(formValue)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => {
            this.state.setSubmitting(false);
            this.state.setSubmitted(false);
          })
        )
        .subscribe({
          next: () => {
            this.form.reset();
            this.state.clearError();
            
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
            this.state.setError(error);
            this.applyValidationErrorsToForm(error);
            this.showErrorNotification(error.message);
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
    if (!control || !control.errors || (!control.touched && !this.state.submitted())) {
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
    
    if (control.errors['maxlength']) {
      return `${fieldName === 'firstName' ? 'First name' : 'Last name'} must not exceed ${control.errors['maxlength'].requiredLength} characters`;
    }
    
    return null;
  }
  
  getValidationErrorEntries(): Array<{key: string, errors: string[]}> {
    const errors = this.state.validationErrors();
    if (!errors) {
      return [];
    }
    return Object.entries(errors).map(([key, value]) => ({ key, errors: value }));
  }
  
  triggerRandomError(): void {
    const mockError = this.mockErrorService.getRandomError();
    this.handleErrorResponse(mockError);
  }
  
  private handleErrorResponse(error: ApiError): void {
    this.state.setError(error);
    this.applyValidationErrorsToForm(error);
    this.showErrorNotification(error.message);
  }
  
  private applyValidationErrorsToForm(error: ApiError): void {
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        const control = this.form.get(key);
        if (control && error.errors?.[key]) {
          control.setErrors({ apiError: error.errors[key][0] });
          control.markAsTouched();
        }
      });
    }
  }
  
  private showErrorNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}