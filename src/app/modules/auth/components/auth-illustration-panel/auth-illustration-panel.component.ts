import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-illustration-panel',
  standalone: true,
  templateUrl: './auth-illustration-panel.component.html',
  styleUrl: './auth-illustration-panel.component.scss',
})
export class AuthIllustrationPanelComponent {
  @Input() heading = 'Growing Together';
  @Input() subtext = 'Talentree connects entrepreneurs, suppliers, and customers in one thriving ecosystem.';
}
