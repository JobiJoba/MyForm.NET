import { signal, computed } from '@angular/core';
import { ApiError } from '@/types/simpleForm';

export interface ErrorState {
  message: string | null;
  validationErrors: Record<string, string[]> | null;
}

export class BaseFormState {
  // Loading states
  protected readonly _submitting = signal<boolean>(false);
  
  // Error states
  protected readonly _errorMessage = signal<string | null>(null);
  protected readonly _validationErrors = signal<Record<string, string[]> | null>(null);
  
  // Form submission state
  protected readonly _submitted = signal<boolean>(false);

  // Public readonly signals
  readonly submitting = this._submitting.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly validationErrors = this._validationErrors.asReadonly();
  readonly submitted = this._submitted.asReadonly();

  // Computed signals for derived state
  readonly hasError = computed(() => 
    this._errorMessage() !== null
  );

  readonly hasValidationErrors = computed(() => {
    const errors = this._validationErrors();
    return errors !== null && Object.keys(errors).length > 0;
  });

  readonly errorState = computed<ErrorState>(() => ({
    message: this._errorMessage(),
    validationErrors: this._validationErrors()
  }));

  // State update methods
  setSubmitting(value: boolean): void {
    this._submitting.set(value);
  }

  setError(error: ApiError | null): void {
    if (error === null) {
      this._errorMessage.set(null);
      this._validationErrors.set(null);
    } else {
      this._errorMessage.set(error.message);
      this._validationErrors.set(error.errors || null);
    }
  }

  clearError(): void {
    this._errorMessage.set(null);
    this._validationErrors.set(null);
  }

  setSubmitted(value: boolean): void {
    this._submitted.set(value);
  }

  reset(): void {
    this._submitting.set(false);
    this._errorMessage.set(null);
    this._validationErrors.set(null);
    this._submitted.set(false);
  }

  resetError(): void {
    this.clearError();
  }
}



