import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./views').then((m) => m.IncomesComponent),
  },
];
