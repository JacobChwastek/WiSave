import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Dialog } from 'primeng/dialog';

export type DialogPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topleft'
  | 'topright'
  | 'bottomleft'
  | 'bottomright';

export type DialogPositionInput = DialogPosition | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const POSITION_ALIASES: Readonly<Record<DialogPositionInput, DialogPosition>> = {
  center: 'center',
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  topleft: 'topleft',
  topright: 'topright',
  bottomleft: 'bottomleft',
  bottomright: 'bottomright',
  'top-left': 'topleft',
  'top-right': 'topright',
  'bottom-left': 'bottomleft',
  'bottom-right': 'bottomright',
};

const DEFAULT_DIALOG_STYLE: Readonly<Record<string, string>> = {
  width: 'min(42rem, 92vw)',
};

const DEFAULT_DIALOG_BREAKPOINTS: Readonly<Record<string, string>> = {
  '960px': '90vw',
  '640px': '95vw',
};

const DEFAULT_DIALOG_STYLE_CLASS =
  'rounded-2xl border border-secondary-200 bg-secondary-50 shadow-xl dark:border-dark-divider dark:bg-dark-primary-850';

const DEFAULT_DIALOG_CONTENT_CLASS = 'px-6 py-5 text-secondary-700 dark:text-dark-secondary-100';

const DEFAULT_DIALOG_MASK_CLASS = 'bg-secondary-900/40 backdrop-blur-[2px] dark:bg-black/60';

@Component({
  selector: 'app-dialog',
  imports: [Dialog],
  template: `
    <p-dialog
      [visible]="visible()"
      (visibleChange)="visibleChange.emit($event)"
      [modal]="modal()"
      [dismissableMask]="dismissableMask()"
      [closeOnEscape]="closeOnEscape()"
      [closable]="closable()"
      [draggable]="draggable()"
      [resizable]="resizable()"
      [position]="resolvedPosition()"
      [appendTo]="appendTo()"
      [blockScroll]="blockScroll()"
      [focusOnShow]="focusOnShow()"
      [showHeader]="showHeader()"
      [closeAriaLabel]="closeAriaLabel()"
      [style]="dialogStyle()"
      [breakpoints]="breakpoints()"
      [styleClass]="dialogStyleClass()"
      [contentStyleClass]="contentStyleClassResolved()"
      [maskStyleClass]="maskStyleClassResolved()"
      (onShow)="opened.emit()"
      (onHide)="closed.emit()"
    >
      <ng-template pTemplate="header">
        <ng-content select="[dialogHeader]" />
      </ng-template>

      <ng-content />

      <ng-template pTemplate="footer">
        <ng-content select="[dialogFooter]" />
      </ng-template>
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDialogComponent {
  readonly visible = input<boolean>(false);
  readonly visibleChange = output<boolean>();

  readonly opened = output<void>();
  readonly closed = output<void>();

  readonly modal = input<boolean>(true);
  readonly dismissableMask = input<boolean>(true);
  readonly closeOnEscape = input<boolean>(true);
  readonly closable = input<boolean>(true);
  readonly draggable = input<boolean>(false);
  readonly resizable = input<boolean>(false);
  readonly showHeader = input<boolean>(true);
  readonly blockScroll = input<boolean>(true);
  readonly focusOnShow = input<boolean>(true);

  readonly position = input<DialogPositionInput>('center');
  readonly appendTo = input<'body' | 'self' | HTMLElement | null>('body');
  readonly closeAriaLabel = input<string>('Close dialog');

  readonly style = input<Record<string, string> | null>(null);
  readonly breakpoints = input<Record<string, string> | null>(DEFAULT_DIALOG_BREAKPOINTS);

  readonly styleClass = input<string | null>(null);
  readonly contentStyleClass = input<string | null>(null);
  readonly maskStyleClass = input<string | null>(null);

  protected readonly dialogStyle = computed(() => this.style() ?? DEFAULT_DIALOG_STYLE);
  protected readonly resolvedPosition = computed(() => POSITION_ALIASES[this.position()]);
  protected readonly dialogStyleClass = computed(() =>
    this.styleClass() ? `${DEFAULT_DIALOG_STYLE_CLASS} ${this.styleClass()}` : DEFAULT_DIALOG_STYLE_CLASS,
  );
  protected readonly contentStyleClassResolved = computed(() =>
    this.contentStyleClass()
      ? `${DEFAULT_DIALOG_CONTENT_CLASS} ${this.contentStyleClass()}`
      : DEFAULT_DIALOG_CONTENT_CLASS,
  );
  protected readonly maskStyleClassResolved = computed(() =>
    this.maskStyleClass() ? `${DEFAULT_DIALOG_MASK_CLASS} ${this.maskStyleClass()}` : DEFAULT_DIALOG_MASK_CLASS,
  );
}
