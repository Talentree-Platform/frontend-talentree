import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../core/environment/envirinment';

export interface ChatbotSettings {
  targetAudience: string;
  tone: string;
  businessName: string;
  businessCategory: string;
}

export interface ChatbotMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private baseUrl = `${environment.baseUrl}/api/bo/chatbot`;

  // Shared state so the widget keeps its conversation across route changes
  messages = signal<ChatbotMessage[]>([]);
  isSending = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  getSettings(): Observable<ChatbotSettings> {
    return this.http.get<ChatbotSettings>(`${this.baseUrl}/settings`);
  }

  updateSettings(settings: Partial<Pick<ChatbotSettings, 'targetAudience' | 'tone'>>): Observable<ChatbotSettings> {
    return this.http.put<ChatbotSettings>(`${this.baseUrl}/settings`, settings);
  }

  sendMessage(message: string): Observable<{ response: string }> {
    this.messages.update(msgs => [...msgs, { sender: 'user', text: message, timestamp: new Date() }]);
    this.isSending.set(true);

    return this.http.post<{ response: string }>(`${this.baseUrl}/send`, { message }).pipe(
      tap({
        next: (res) => {
          this.messages.update(msgs => [...msgs, { sender: 'bot', text: res.response, timestamp: new Date() }]);
          this.isSending.set(false);
        },
        error: () => {
          this.messages.update(msgs => [
            ...msgs,
            { sender: 'bot', text: 'Sorry, something went wrong. Please try again.', timestamp: new Date() }
          ]);
          this.isSending.set(false);
        }
      })
    );
  }
}