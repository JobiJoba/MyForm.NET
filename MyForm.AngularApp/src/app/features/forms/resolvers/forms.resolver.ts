import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FormService } from '../services/form.service';
import { SimpleForms } from '@/types/simpleForm';

export const formsResolver: ResolveFn<SimpleForms> = (route, state) => {
  const formService = inject(FormService);
  return formService.getAllForms();
};
