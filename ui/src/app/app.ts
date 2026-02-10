import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '@layout/sidebar';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, RouterOutlet],
  template: `
    <app-sidebar />
    <div class="min-w-0 flex-1">
      <router-outlet />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: row;
    }
  `,
})
export class AppComponent {}
