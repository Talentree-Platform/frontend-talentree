import { Component, ElementRef, ViewChild, AfterViewChecked, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../core/services/chatbot.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.css']
})
export class ChatbotWidgetComponent implements AfterViewChecked {
  
  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;

  isOpen = signal(false);
  inputValue = signal('');

  messages = this.chatbotService.messages;
  isSending = this.chatbotService.isSending;

  constructor(
  private chatbotService: ChatbotService,
  private sanitizer: DomSanitizer
) {}

extractImageData(text: string): string | null {
  const match = text.match(/data:image\/(png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=]+/);
  return match ? match[0] : null;
}

stripImageTag(text: string): string {
  return text.replace(/<img[^>]*>/g, '').trim();
}

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleWidget(): void {
    this.isOpen.update(v => !v);
  }

  send(): void {
    const message = this.inputValue().trim();
    if (!message || this.isSending()) {
      return;
    }

    this.inputValue.set('');
    this.chatbotService.sendMessage(message).subscribe();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch {
      /* no-op */
    }
  }
}
