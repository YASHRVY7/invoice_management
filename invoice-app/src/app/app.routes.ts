import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { Dashboard } from './components/dashboard/dashboard';
import { Login } from './components/auth/login/login';
import { Signup } from './components/auth/signup/signup';
import { InvoiceList } from './components/invoices/invoice-list/invoice-list';
import { InvoiceCreate } from './components/invoices/invoice-create/invoice-create';
import { InvoiceDetail } from './components/invoices/invoice-detail/invoice-detail';
import { InvoiceEdit } from './components/invoices/invoice-edit/invoice-edit';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { roleGuard } from './admin/guard/role-guard';


export const routes: Routes = [
    { path: '', redirectTo: '/signup', pathMatch: 'full' },
    { path: 'dashboard', component: Dashboard ,canActivate: [authGuard]},
    { path: 'login', component: Login },
    { path: 'signup', component: Signup },
    { path: 'invoices', component: InvoiceList ,canActivate: [authGuard]},
    { path: 'invoices/create', component: InvoiceCreate ,canActivate: [authGuard]},
    { path: 'invoices/:id', component: InvoiceDetail ,canActivate: [authGuard]},
    { path: 'invoices/:id/edit', component: InvoiceEdit ,canActivate: [authGuard]},
    { 
        path: 'admin',
        component: AdminDashboard,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
    },

    { path: '**', redirectTo: 'signup' },

];
