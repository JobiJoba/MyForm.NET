import {Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBarModule, MatSnackBar} from '@angular/material/snack-bar';
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
    MatSnackBarModule
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
  loading = signal<boolean>(false);
  
  form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(1)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]]
  });

  ngOnInit(): void {
    this.loadForms();
  }

  loadForms(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    
    this.formService.getAllForms().subscribe({
      next: (result: SimpleForms) => {
        this.forms.set(result);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.loading.set(false);
        this.snackBar.open(error.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);
    
    if (this.form.valid) {
      const formValue: CreateFormRequest = this.form.value as CreateFormRequest;
      this.loading.set(true);
      
      this.formService.createForm(formValue).subscribe({
        next: () => {
          this.form.reset();
          this.submitted.set(false);
          this.loading.set(false);
          this.snackBar.open('Form submitted successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.loadForms();
        },
        error: (error: ApiError) => {
          this.errorMessage.set(error.message);
          this.submitted.set(false);
          this.loading.set(false);
          this.snackBar.open(error.message, 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      });
    }
  }
}