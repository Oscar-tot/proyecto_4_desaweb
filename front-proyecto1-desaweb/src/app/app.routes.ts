import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { App } from './app';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { UserGuard } from './guards/user.guard';
import { UnauthorizedComponent } from './components/unauthorized.component';
import { UserDashboardComponent } from './components/user-dashboard.component';
import { ReportesComponent } from './components/reportes/reportes.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  // Rutas para administradores
  { 
    path: 'admin', 
    component: App, 
    canActivate: [AdminGuard],
    data: { requiresAdmin: true } 
  },
  
  // Ruta de reportes (solo administradores)
  { 
    path: 'reportes', 
    component: ReportesComponent, 
    canActivate: [AdminGuard],
    data: { requiresAdmin: true } 
  },
  
  // Rutas para usuarios normales
  { 
    path: 'panel-usuario', 
    component: UserDashboardComponent, 
    canActivate: [UserGuard],
    data: { requiresUser: true } 
  },
  
  // Ruta de marcador (requiere autenticación, cualquier rol)
  { 
    path: 'marcador', 
    component: App, 
    canActivate: [AuthGuard] 
  },
  
  // Página de acceso no autorizado
  { path: 'unauthorized', component: UnauthorizedComponent },
  
  // Redirecciones por defecto
  { path: '**', redirectTo: '/login' }
];
