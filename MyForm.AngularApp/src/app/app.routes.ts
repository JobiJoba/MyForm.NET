import { Routes } from '@angular/router';
import { SimpleFormComponent } from './features/forms/components/simple-form/simple-form';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { formsResolver } from './features/forms/resolvers/forms.resolver';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/forms',
    pathMatch: 'full'
  },
  {
    path: 'forms',
    component: SimpleFormComponent,
    resolve: { forms: formsResolver },
    // canActivate: [authGuard],  // Uncomment when auth is needed
    // canActivate: [roleGuard(['Admin', 'User'])],  // Example: require specific roles
  }
];
