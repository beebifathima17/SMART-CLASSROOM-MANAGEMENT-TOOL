import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  imports: [CommonModule],
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      [class]="customClass"
      [ngSwitch]="name"
    >
      <!-- Dashboard / Home -->
      <g *ngSwitchCase="'layout-dashboard'">
        <rect width="7" height="9" x="3" y="3" rx="1"/>
        <rect width="7" height="5" x="14" y="3" rx="1"/>
        <rect width="7" height="9" x="14" y="12" rx="1"/>
        <rect width="7" height="5" x="3" y="16" rx="1"/>
      </g>

      <g *ngSwitchCase="'home'">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </g>

      <!-- Live / Radio / Cast -->
      <g *ngSwitchCase="'radio'">
        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
        <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
        <circle cx="12" cy="12" r="2"/>
        <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
        <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>
      </g>

      <!-- Poll / Vote / BarChart -->
      <g *ngSwitchCase="'poll'">
        <path d="M18 20V10"/>
        <path d="M12 20V4"/>
        <path d="M6 20v-6"/>
      </g>

      <g *ngSwitchCase="'bar-chart-3'">
        <path d="M3 3v18h18"/>
        <path d="M18 17V9"/>
        <path d="M13 17V5"/>
        <path d="M8 17v-3"/>
      </g>

      <!-- Quiz / Help / CheckSquare -->
      <g *ngSwitchCase="'quiz'">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <path d="M9 15l2 2 4-4"/>
      </g>

      <!-- Students / Users -->
      <g *ngSwitchCase="'users'">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </g>

      <g *ngSwitchCase="'user'">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </g>

      <!-- History / Clock -->
      <g *ngSwitchCase="'history'">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
        <path d="M12 7v5l4 2"/>
      </g>

      <g *ngSwitchCase="'clock'">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </g>

      <!-- Log out -->
      <g *ngSwitchCase="'log-out'">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" x2="9" y1="12" y2="12"/>
      </g>

      <!-- Actions: Plus, Trash, Edit, Check, X -->
      <g *ngSwitchCase="'plus'">
        <path d="M5 12h14"/>
        <path d="M12 5v14"/>
      </g>

      <g *ngSwitchCase="'trash-2'">
        <path d="M3 6h18"/>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        <line x1="10" x2="10" y1="11" y2="17"/>
        <line x1="14" x2="14" y1="11" y2="17"/>
      </g>

      <g *ngSwitchCase="'edit-3'">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
      </g>

      <g *ngSwitchCase="'check'">
        <polyline points="20 6 9 17 4 12"/>
      </g>

      <g *ngSwitchCase="'check-circle-2'">
        <circle cx="12" cy="12" r="10"/>
        <path d="m9 12 2 2 4-4"/>
      </g>

      <g *ngSwitchCase="'x'">
        <line x1="18" x2="6" y1="6" y2="18"/>
        <line x1="6" x2="18" y1="6" y2="18"/>
      </g>

      <g *ngSwitchCase="'search'">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" x2="16.65" y1="21" y2="16.65"/>
      </g>

      <g *ngSwitchCase="'bell'">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      </g>

      <!-- Play, Pause, Sparkles, Star -->
      <g *ngSwitchCase="'play'">
        <polygon points="6 3 20 12 6 21 6 3"/>
      </g>

      <g *ngSwitchCase="'pause'">
        <rect width="4" height="16" x="6" y="4"/>
        <rect width="4" height="16" x="14" y="4"/>
      </g>

      <g *ngSwitchCase="'sparkles'">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      </g>

      <g *ngSwitchCase="'star'">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </g>

      <g *ngSwitchCase="'award'">
        <circle cx="12" cy="8" r="7"/>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
      </g>

      <g *ngSwitchCase="'arrow-right'">
        <line x1="5" x2="19" y1="12" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
      </g>

      <g *ngSwitchCase="'arrow-left'">
        <line x1="19" x2="5" y1="12" y2="12"/>
        <polyline points="12 19 5 12 12 5"/>
      </g>

      <g *ngSwitchCase="'download'">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" x2="12" y1="15" y2="3"/>
      </g>

      <g *ngSwitchCase="'share-2'">
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
        <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
      </g>

      <g *ngSwitchCase="'shield'">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
      </g>

      <g *ngSwitchCase="'book-open'">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </g>

      <g *ngSwitchCase="'chevron-right'">
        <polyline points="9 18 15 12 9 6"/>
      </g>

      <g *ngSwitchCase="'chevron-left'">
        <polyline points="15 18 9 12 15 6"/>
      </g>

      <g *ngSwitchCase="'eye'">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
      </g>

      <g *ngSwitchCase="'eye-off'">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
        <line x1="2" x2="22" y1="2" y2="22"/>
      </g>

      <g *ngSwitchCase="'graduation-cap'">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </g>

      <g *ngSwitchCase="'settings'">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
      </g>

      <g *ngSwitchCase="'alert-circle'">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" x2="12" y1="8" y2="12"/>
        <line x1="12" x2="12.01" y1="16" y2="16"/>
      </g>

      <g *ngSwitchCase="'info'">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4"/>
        <path d="M12 8h.01"/>
      </g>

      <!-- Default Fallback Circle -->
      <circle *ngSwitchDefault cx="12" cy="12" r="10"/>
    </svg>
  `
})
export class IconComponent {
  @Input() name: string = 'circle';
  @Input() size: number = 20;
  @Input() strokeWidth: number = 2;
  @Input() customClass: string = '';
}
