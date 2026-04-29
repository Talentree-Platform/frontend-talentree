import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatbotService } from '../../core/services/chatbot.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-business-chat',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './business-chat.component.html',
  styleUrl: './business-chat.component.css'
})
export class BusinessChatComponent {
    userInput = '';
    apiBody:any[]=[];
  botReply!:string;
  chatContent:any[]=[];
  enableSend:boolean=false;


  constructor(private chatbotService: ChatbotService) {}

  isOpen = false;

openPopup() {
  this.isOpen = true;
}

closePopup() {
  this.isOpen = false;
}



enableSendButton() {
  this.enableSend = !!this.userInput && !!this.userInput.trim();
}

sendMessage() {
  if (!this.enableSend) return;

  const message = this.userInput.trim(); // ✅ خزني الرسالة الأول

  this.apiBody .push({
    role: 'user',
    content: message
  });

  // ضيفي رسالة اليوزر فورًا (UX أحسن)
  this.chatContent.push({
    role: 'user',
    content: message,
    aiResponse: ''
  });

  this.userInput = '';
  this.enableSend = false;

  this.chatbotService.sendMessage(this.apiBody).subscribe({
    next: (res) => {
      console.log(res);

      // عدلي آخر رسالة وضيفي رد البوت
      this.chatContent[this.chatContent.length - 1].aiResponse = res.reply;
    },
    error: (err) => console.log(err)
  });
}

@ViewChild('chatBox') chatBox!: ElementRef;

ngAfterViewChecked() {
  this.scrollToBottom();
}

scrollToBottom() {
  try {
    this.chatBox.nativeElement.scrollTop = this.chatBox.nativeElement.scrollHeight;
  } catch (e) {}
}
}
