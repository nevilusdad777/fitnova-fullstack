import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AdminGuard } from './features/admin/guards/admin.guard';
import { userGuard } from './core/guards/user.guard';


export const routes: Routes = [
    {
        path: '',
        redirectTo: 'landing',
        pathMatch: 'full'
    },
    {
        path: 'landing',
        loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
    },
    {
        path: 'auth',
        children: [
            {
                path: 'login',
                component: LoginComponent
            },
            {
                path: 'register',
                loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
            },
            {
                path: 'forgot-password',
                loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
            },
            {
                path: 'reset-password/:token',
                loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
            }
        ]
    },
    {
        path: 'about',
        loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [userGuard], // Ensure user is authenticated
        children: [
            {
                path: 'home',
                loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
            },
            {
                path: 'workout',
                loadComponent: () => import('./features/workout/workout.component').then(m => m.WorkoutComponent)
            },
            {
                path: 'nutrition',
                loadComponent: () => import('./features/diet/diet.component').then(m => m.DietComponent)
            },
            {
                path: 'food-database',
                loadComponent: () => import('./features/food-database/food-database.component').then(m => m.FoodDatabaseComponent)
            },
            {
                path: 'tracker',
                loadComponent: () => import('./features/tracker/tracker.component').then(m => m.TrackerComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
            }
        ]
    },

    {
        path: 'admin',
        children: [
            {
                path: 'auth',
                children: [
                    {
                        path: 'login',
                        loadComponent: () => import('./features/admin/auth/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
                    },
                    {
                        path: 'register',
                        loadComponent: () => import('./features/admin/auth/admin-register/admin-register.component').then(m => m.AdminRegisterComponent)
                    }
                ]
            },
            {
                path: '',
                loadComponent: () => import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
                canActivate: [AdminGuard],
                children: [
                    {
                        path: 'dashboard',
                        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
                    },
                    {
                        path: 'users',
                        children: [
                            {
                                path: '',
                                loadComponent: () => import('./features/admin/users/user-list/user-list.component').then(m => m.UserListComponent)
                            },
                            {
                                path: ':id',
                                loadComponent: () => import('./features/admin/users/user-detail/user-detail.component').then(m => m.UserDetailComponent)
                            }
                        ]
                    },
                    {
                        path: 'foods',
                        children: [
                            {
                                path: '',
                                loadComponent: () => import('./features/admin/foods/food-list/food-list.component').then(m => m.FoodListComponent)
                            },
                            {
                                path: 'new',
                                loadComponent: () => import('./features/admin/foods/food-form/food-form.component').then(m => m.FoodFormComponent)
                            },
                            {
                                path: 'edit/:id',
                                loadComponent: () => import('./features/admin/foods/food-form/food-form.component').then(m => m.FoodFormComponent)
                            }
                        ]
                    },
                    {
                        path: 'exercises',
                        children: [
                            {
                                path: '',
                                loadComponent: () => import('./features/admin/exercises/exercise-list/exercise-list.component').then(m => m.ExerciseListComponent)
                            },
                            {
                                path: 'new',
                                loadComponent: () => import('./features/admin/exercises/exercise-form/exercise-form.component').then(m => m.ExerciseFormComponent)
                            },
                            {
                                path: 'edit/:id',
                                loadComponent: () => import('./features/admin/exercises/exercise-form/exercise-form.component').then(m => m.ExerciseFormComponent)
                            }
                        ]
                    },
                    {
                        path: 'admins',
                        children: [
                            {
                                path: '',
                                loadComponent: () => import('./features/admin/admins/admin-list/admin-list.component').then(m => m.AdminListComponent)
                            },
                            {
                                path: 'new',
                                loadComponent: () => import('./features/admin/admins/admin-form/admin-form.component').then(m => m.AdminFormComponent)
                            },
                            {
                                path: 'edit/:id',
                                loadComponent: () => import('./features/admin/admins/admin-form/admin-form.component').then(m => m.AdminFormComponent)
                            }
                        ]
                    },
                    {
                        path: '',
                        redirectTo: 'dashboard',
                        pathMatch: 'full'
                    }
                ]
            }
        ]
    },

    {
        path: '**',
        redirectTo: 'home'
    }
];