import {Component, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {SimpleForms, CreateFormRequest, CreateFormResponse, ApiError} from '@/types/simpleForm';

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
    MatIconModule
  ],
  standalone: true,
  templateUrl: './simple-form.html',
  styleUrl: './simple-form.css',
})
export class SimpleFormComponent {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  forms = signal<SimpleForms>([]);
  submitted = signal<boolean>(false);
  
  form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(1)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]]
  });

  ngOnInit(): void {
    this.loadForms();
  }

  loadForms(): void {
    this.http.get<SimpleForms>('api/forms').subscribe({
      next: (result: SimpleForms) => this.forms.set(result),
      error: (error: ApiError) => {
        console.error('Failed to load forms:', error);
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.valid) {
      const formValue: CreateFormRequest = this.form.value as CreateFormRequest;
      this.http.post<CreateFormResponse>('api/forms', formValue).subscribe({
        next: (response: CreateFormResponse) => {
          this.form.reset();
          this.submitted.set(false);
          this.loadForms();
        },
        error: (error: ApiError) => {
          console.error('Failed to submit form:', error);
          this.submitted.set(false);
        }
      });
    }
  }
}