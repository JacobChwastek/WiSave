import { Component, inject } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { ThemeService } from '@services/ThemeService';

@Component({
  selector: 'app-theme-icon-button',
  imports: [ButtonModule],
  template: ` <p-button [icon]="themeService.isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'" (click)="themeService.toggleTheme()" class="p-button-xs" variant="text" size="small" /> `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
})
export class ThemeIconButtonComponent {
  public themeService = inject(ThemeService);
}
