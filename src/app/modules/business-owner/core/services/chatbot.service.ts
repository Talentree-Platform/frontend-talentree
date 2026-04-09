import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  private apiUrl = 'https://mona38-talentree-support.hf.space/chat'; // حطي اللينك بتاعك

  constructor(private http: HttpClient) {}

  sendMessage(messages: any[]): Observable<any> {
    return this.http.post(this.apiUrl, { messages });
  }
}
