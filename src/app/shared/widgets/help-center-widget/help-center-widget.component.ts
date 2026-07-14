import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HelpCenterChatService } from '../../../modules/business-owner/core/services/help-center-chat.service';

@Component({
  selector: 'app-help-center-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './help-center-widget.component.html',
  styleUrls: ['./help-center-widget.component.css']
})
export class HelpCenterWidgetComponent implements AfterViewChecked, OnInit {
  readonly chatSvc = inject(HelpCenterChatService);

  @ViewChild('chatMessages') chatMessagesEl?: ElementRef<HTMLDivElement>;

  isChatOpen = signal(false);
  chatInput  = signal('');
  isDark     = signal(false);

  bubbles   = this.chatSvc.bubbles;
  isSending = this.chatSvc.isSending;

  private readonly THEME_KEY = 'hc-widget-theme';

  ngOnInit(): void {
    const saved = localStorage.getItem(this.THEME_KEY);
    this.isDark.set(saved === 'dark');
  }

  ngAfterViewChecked(): void {
    if (this.chatMessagesEl) {
      const el = this.chatMessagesEl.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  toggleTheme(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    localStorage.setItem(this.THEME_KEY, next ? 'dark' : 'light');
  }

  toggleChat(): void {
    this.isChatOpen.update(v => !v);
  }

  sendChat(): void {
    const text = this.chatInput().trim();
    if (!text || this.isSending()) return;
    this.chatInput.set('');
    this.chatSvc.sendMessage(text).subscribe();
  }

  onChatKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendChat();
    }
  }

  clearChat(): void {
    this.chatSvc.clearHistory();
  }
}
