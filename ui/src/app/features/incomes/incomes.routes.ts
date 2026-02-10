import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./views').then((m) => m.IncomesComponent),
    children: [
      {
        path: 'add',
        loadComponent: () => import('./views/add-income.component').then((m) => m.AddIncomeComponent),
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./views/edit-income.component').then((m) => m.EditIncomeComponent),
      },
      {
        path: 'import',
        loadComponent: () => import('./views/import-incomes.component').then((m) => m.ImportIncomesComponent),
      },
      {
        path: 'delete/:id',
        loadComponent: () => import('./views/delete-income.component').then((m) => m.DeleteIncomeComponent),
      },
    ],
  },
];
