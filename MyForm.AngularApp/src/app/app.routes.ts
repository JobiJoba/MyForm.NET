import { Routes } from '@angular/router';
import {SimpleFormComponent} from './components/simple-form/simple-form';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/forms',
    pathMatch: 'full'
  },
  {
    path: 'forms',
    component: SimpleFormComponent
  }
];
