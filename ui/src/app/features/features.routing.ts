import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'incomes',
    loadChildren: () => import('./incomes/incomes.routes').then((m) => m.routes),
  },
];
