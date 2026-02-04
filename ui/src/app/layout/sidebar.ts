import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Button } from 'primeng/button';

import { ThemeIconButtonComponent } from '@shared/components/button';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Button, ThemeIconButtonComponent],
  template: `
    <aside class="bg-secondary-700 dark:bg-dark-primary-900 flex h-screen w-50 flex-col gap-8 px-2 py-4">
      <div class="flex items-center justify-center gap-2 p-2">
        <img class="h-24 w-auto" loading="eager" src="/logo2.png" alt="WiSave" />
      </div>

      <nav class="flex flex-1 flex-col justify-between">
        <ul class="flex flex-col gap-1">
          @for (item of navItems; track item.route) {
            <li>
              <a
                [routerLink]="item.route"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                class="text-secondary-100 hover:bg-secondary-800 hover:text-secondary-50 dark:text-dark-secondary-200 dark:hover:bg-dark-primary-800 dark:hover:text-dark-secondary-50 [&.active]:bg-secondary-900 [&.active]:text-secondary-50 dark:[&.active]:bg-dark-primary-700 dark:[&.active]:text-dark-secondary-50 [&.active]:hover:bg-secondary-900 dark:[&.active]:hover:bg-dark-primary-700 flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors"
                routerLinkActive="active">
                <i [class]="item.icon + ' text-base'"></i>
                <span class="font-medium">{{ item.label }}</span>
              </a>
            </li>
          }
        </ul>
      </nav>

      <div class="sidebar-actions mt-auto flex flex-row justify-around gap-2">
        <p-button class="p-button-xs sidebar-btn" variant="text" icon="pi pi-sign-out" size="small" />
        <p-button class="p-button-xs sidebar-btn" variant="text" icon="pi pi-cog" size="small" />
        <app-theme-icon-button class="sidebar-btn" />
      </div>
    </aside>
  `,
  styles: ``,
})
export class SidebarComponent {
  navItems = [
    { route: '/dashboard', label: 'Dashboard', exact: true, icon: 'pi pi-home' },
    { route: '/incomes', label: 'Incomes', exact: false, icon: 'pi pi-money-bill' },
    { route: '/expenses', label: 'Expenses', exact: false, icon: 'pi pi-credit-card' },
    { route: '/calendar', label: 'Calendar', exact: false, icon: 'pi pi-calendar' },
    { route: '/documents', label: 'Documents', exact: false, icon: 'pi pi-file' },
    { route: '/reports', label: 'Reports', exact: false, icon: 'pi pi-chart-line' },
  ];
}
