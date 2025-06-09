import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// تأكد من إضافة Font Awesome CDN في ملف index.html
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

import { AllUsersService } from '../services/all-users.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, NgClass, FormsModule, DatePipe],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  users: any[] = [];
  selectedUser: any | null = null;
  messages: any[] = [];
  newMessage: string = '';

  constructor(private allUsersService: AllUsersService) {}

  ngOnInit() {
    this.allUsersService.getUsers().subscribe({
      next: (users) => {
        // إضافة خاصية lastMessageTime للمستخدمين لأغراض العرض
        this.users = users.map(user => ({
          ...user,
          lastMessageTime: new Date(Date.now() - Math.random() * 86400000) // وقت عشوائي لآخر رسالة
        }));
      },
      error: (err) => {
        console.error('حدث خطأ أثناء جلب المستخدمين:', err);
      }
    });
  }

  selectUser(user: any): void {
    this.selectedUser = user;
    this.loadDummyMessages(user.id);
  }

  sendMessage(): void {
    if (this.newMessage.trim() === '' || !this.selectedUser) {
      return;
    }

    const message = {
      text: this.newMessage,
      sender: 'me',
      time: new Date(),
    };

    this.messages.push(message);
    this.newMessage = '';

    // للتمرير التلقائي إلى أسفل بعد إرسال رسالة
    setTimeout(() => {
      this.scrollToBottom();
      this.simulateReply();
    }, 100); // وقت قصير لانتهاء إضافة الرسالة إلى DOM
  }

  clearSelectedUser(): void {
    this.selectedUser = null;
    this.messages = [];
  }

  private loadDummyMessages(userId: number): void {
    // هذه الرسائل يجب أن تأتي من خدمة الواجهة الخلفية في تطبيق حقيقي
    // مع تحديد تاريخ ووقت دقيقين لتطبيق فواصل "Yesterday", "Today"
    if (userId === 1) { // مثال للمستخدم 1
      this.messages = [
        { text: 'أهلاً بك يا علي، كيف حالك؟', sender: 'other', time: new Date('2025-06-03T08:20:00') },
        { text: 'أنا بخير، ماذا عنك؟', sender: 'me', time: new Date('2025-06-03T08:25:00') },
        { text: 'بخير والحمد لله.', sender: 'other', time: new Date('2025-06-04T09:00:00') },
        { text: 'هل أنت جاهز لاجتماع اليوم؟', sender: 'other', time: new Date('2025-06-04T09:05:00') },
        { text: 'نعم، أنا مستعد تمامًا.', sender: 'me', time: new Date('2025-06-04T09:10:00') },
      ];
    } else if (userId === 2) { // مثال للمستخدم 2
      this.messages = [
        { text: 'مرحبًا، كيف كان يومك؟', sender: 'other', time: new Date('2025-06-04T10:00:00') },
        { text: 'كان جيدًا، مشغولاً قليلاً.', sender: 'me', time: new Date('2025-06-04T10:05:00') },
      ];
    } else {
      this.messages = [
        { text: `مرحباً من ${this.selectedUser?.fullName || this.selectedUser?.userName}!`, sender: 'other', time: new Date() },
      ];
    }
    // للتأكد من التمرير لأسفل عند تحميل رسائل جديدة
    setTimeout(() => this.scrollToBottom(), 0);
  }

  private simulateReply(): void {
    if (this.selectedUser) {
      const replies = [
        'تمام، شكراً لسؤالك!',
        'لقد تلقيت رسالتك.',
        'كيف يمكنني المساعدة؟',
        'مرحباً بك!',
        'فكرة جيدة.'
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const replyMessage = {
        text: randomReply,
        sender: 'other',
        time: new Date(),
      };
      this.messages.push(replyMessage);
      this.scrollToBottom();
    }
  }

  // دالة للتمرير إلى أسفل الدردشة تلقائياً
  private scrollToBottom(): void {
    const chatBody = document.querySelector('.chat-body');
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }
}
