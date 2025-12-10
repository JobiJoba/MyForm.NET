import { signal, computed } from '@angular/core';
import { SimpleForms } from '@/types/simpleForm';
import { BaseFormState } from '@/app/shared/state/base-form-state';

export interface LoadingState {
  submitting: boolean;
  loadingForms: boolean;
}

export class FormState extends BaseFormState {
  // Data state specific to this form
  private readonly _forms = signal<SimpleForms>([]);
  private readonly _loadingForms = signal<boolean>(false);
  
  readonly forms = this._forms.asReadonly();
  readonly loadingForms = this._loadingForms.asReadonly();

  // Override isLoading to include loadingForms
  readonly isLoading = computed(() => 
    this._submitting() || this._loadingForms()
  );

  readonly loadingState = computed<LoadingState>(() => ({
    submitting: this._submitting(),
    loadingForms: this._loadingForms()
  }));

  // State update methods
  setForms(forms: SimpleForms): void {
    this._forms.set(forms);
  }

  setLoadingForms(value: boolean): void {
    this._loadingForms.set(value);
  }

  override reset(): void {
    super.reset();
    this._loadingForms.set(false);
  }
}

