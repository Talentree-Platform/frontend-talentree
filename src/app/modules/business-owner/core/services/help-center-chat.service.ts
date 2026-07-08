import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../core/environment/envirinment';

// ── DTOs matching Swagger contract ────────────────────────────────────────────

export interface HelpCenterMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface HelpCenterChatRequest {
  messages: HelpCenterMessage[];
}

export interface HelpCenterChatResponseData {
  reply: string;
}

export interface HelpCenterChatResponse {
  success: boolean;
  data: HelpCenterChatResponseData;
  message: string;
  errors: string[];
  timestamp: string;
}

// ── Display model ──────────────────────────────────────────────────────────────

export interface HelpChatBubble {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class HelpCenterChatService {
  private readonly baseUrl = `${environment.baseUrl}/api/help-center`;

  /** Full conversation history sent to the backend on every turn */
  private history: HelpCenterMessage[] = [];

  /** Reactive display state — components bind to these */
  bubbles = signal<HelpChatBubble[]>([]);
  isSending = signal(false);

  constructor(private http: HttpClient) {}

  /**
   * POST /api/help-center/chat
   * Appends the user message to history, sends the full context, and
   * appends the assistant reply to history and display state.
   */
  sendMessage(userText: string): Observable<HelpCenterChatResponse> {
    const userMsg: HelpCenterMessage = { role: 'user', content: userText };
    this.history.push(userMsg);

    this.bubbles.update(b => [
      ...b,
      { role: 'user', content: userText, timestamp: new Date() }
    ]);
    this.isSending.set(true);

    const body: HelpCenterChatRequest = { messages: [...this.history] };

    return this.http
      .post<HelpCenterChatResponse>(`${this.baseUrl}/chat`, body)
      .pipe(
        tap({
          next: (res) => {
            const reply = res?.data?.reply ?? res?.message ?? 'No response received.';
            const assistantMsg: HelpCenterMessage = { role: 'assistant', content: reply };
            this.history.push(assistantMsg);
            this.bubbles.update(b => [
              ...b,
              { role: 'assistant', content: reply, timestamp: new Date() }
            ]);
            this.isSending.set(false);
          },
          error: (err) => {
            const msg = err?.status === 503
              ? 'The AI assistant is temporarily unavailable. Please try again later.'
              : 'Sorry, something went wrong. Please try again.';
            this.bubbles.update(b => [
              ...b,
              { role: 'assistant', content: msg, timestamp: new Date() }
            ]);
            // Roll back the user message from history so the next send
            // doesn't include a user turn without an assistant reply.
            this.history.pop();
            this.isSending.set(false);
          }
        })
      );
  }

  /** Clear conversation history and display state */
  clearHistory(): void {
    this.history = [];
    this.bubbles.set([]);
  }
}
