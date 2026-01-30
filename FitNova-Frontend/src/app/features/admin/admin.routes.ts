import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: AdminLayoutComponent,
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./users/users.component').then(m => m.UsersComponent)
            },
            {
                path: 'workouts',
                loadComponent: () => import('./workouts/workouts.component').then(m => m.WorkoutsComponent)
            },
            {
                path: 'diets',
                loadComponent: () => import('./diets/diets.component').then(m => m.DietsComponent)
            }
        ]
    }
];
