import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/components/welcome.component').then(m => m.WelcomeComponent)
  },
  {
    path: 'app',
    redirectTo: '/app/pets',
    pathMatch: 'full'
  },
  // Auth routes
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/components/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/components/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layouts/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      // Pet routes
      {
        path: 'pets',
        loadComponent: () => import('./features/pets/components/pet-list.component').then(m => m.PetListComponent)
      },
      {
        path: 'pets/new',
        loadComponent: () => import('./features/pets/components/pet-form.component').then(m => m.PetFormComponent)
      },
      {
        path: 'pets/:id',
        loadComponent: () => import('./features/pets/components/pet-detail.component').then(m => m.PetDetailComponent)
      },
      {
        path: 'pets/edit/:id',
        loadComponent: () => import('./features/pets/components/pet-form.component').then(m => m.PetFormComponent)
      },
      // Meal routes
      {
        path: 'meals',
        loadComponent: () => import('./features/meals/components/meal-list.component').then(m => m.MealListComponent)
      },
      {
        path: 'meals/new',
        loadComponent: () => import('./features/meals/components/meal-form.component').then(m => m.MealFormComponent)
      },
      {
        path: 'meals/edit/:id',
        loadComponent: () => import('./features/meals/components/meal-form.component').then(m => m.MealFormComponent)
      },
      // Reminder routes
      {
        path: 'reminders',
        loadComponent: () => import('./features/reminders/components/reminder-list.component').then(m => m.ReminderListComponent)
      },
      {
        path: 'reminders/new',
        loadComponent: () => import('./features/reminders/components/reminder-form.component').then(m => m.ReminderFormComponent)
      },
      {
        path: 'reminders/edit/:id',
        loadComponent: () => import('./features/reminders/components/reminder-form.component').then(m => m.ReminderFormComponent)
      },
      // Location routes
      {
        path: 'locations',
        loadComponent: () => import('./features/locations/components/location-list.component').then(m => m.LocationListComponent)
      },
      // Sharing routes
      {
        path: 'sharing',
        loadComponent: () => import('./features/sharing/components/sharing.component').then(m => m.SharingComponent)
      }
    ]
  },
  // Wildcard route
  {
    path: '**',
    redirectTo: ''
  }
];
