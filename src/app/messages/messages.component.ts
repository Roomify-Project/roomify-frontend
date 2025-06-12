import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

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
  processedMessages: { type: string, value: any }[] = [];
  newMessage: string = '';

  currentUserId: string | null = null;
  private authToken: string | null = null;

  // **هام جدًا:** تأكد أن هذا الـ URL يتطابق مع الـ URL الأساسي للـ Auth API
  // تم تعديل الـ API_BASE_URL ليستخدم الـ Proxy
  private readonly API_BASE_URL = '/api'; // <--- هذا هو التعديل الأساسي

  constructor(
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.currentUserId = localStorage.getItem('userId');
    this.authToken = localStorage.getItem('token');

    console.log('NGONINIT - Current User ID from localStorage:', this.currentUserId);
    console.log('NGONINIT - Auth Token from localStorage:', this.authToken);

    if (!this.currentUserId || !this.authToken) {
      console.error('معرف المستخدم أو رمز المصادقة غير موجود في localStorage. يرجى التأكد من تسجيل الدخول بشكل صحيح أولاً.');
      // يمكنك توجيه المستخدم إلى صفحة تسجيل الدخول هنا إذا لزم الأمر
      return;
    }

    this.loadUsers();
  }

  private getAuthHeaders(): HttpHeaders {
    if (!this.authToken) {
      console.error('رمز المصادقة غير متوفر. لا يمكن إنشاء Headers للمصادقة.');
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`
    });
  }

  loadUsers(): void {
    console.log('Attempting to load users from:', `${this.API_BASE_URL}/users`, 'with token:', this.authToken);
    const headers = this.getAuthHeaders();
    this.http.get<any[]>(`${this.API_BASE_URL}/users`, { headers }).pipe(
      catchError(error => {
        console.error('حدث خطأ أثناء جلب المستخدمين:', error);
        return throwError(() => new Error('خطأ في جلب المستخدمين. يرجى المحاولة مرة أخرى.'));
      })
    ).subscribe(users => {
      // قم بتصفية المستخدم الحالي من القائمة إذا كان موجودًا
      this.users = users.filter(user => user.id !== this.currentUserId).map(user => ({
        ...user,
        lastMessageTime: new Date(Date.now() - Math.random() * 86400000) // هذا لا يزال بيانات وهمية، يمكنك تحديثه لاحقًا لآخر وقت رسالة حقيقي
      }));
    });
  }

  selectUser(user: any): void {
    if (this.selectedUser?.id !== user.id) {
      this.selectedUser = user;
      this.loadMessagesForSelectedUser(this.selectedUser.id);
    }
  }

  loadMessagesForSelectedUser(targetUserId: string): void {
    if (!this.currentUserId) {
        console.error('معرف المستخدم الحالي غير متوفر. لا يمكن جلب الرسائل.');
        return;
    }
    console.log(`Attempting to load messages for current user ${this.currentUserId} to chat with ${targetUserId} from: ${this.API_BASE_URL}/Chat/getMessages/${this.currentUserId} with token:`, this.authToken);
    const headers = this.getAuthHeaders();

    // API Call to get all messages for the current user
    this.http.get<any[]>(`${this.API_BASE_URL}/Chat/getMessages/${this.currentUserId}`, { headers }).pipe(
      catchError(error => {
        console.error('حدث خطأ أثناء جلب الرسائل:', error);
        return throwError(() => new Error('خطأ في جلب الرسائل.'));
      })
    ).subscribe(apiMessages => {
      // Filter messages relevant to the current chat (between current user and selected user)
      const relevantMessages = apiMessages
        .filter(msg =>
          (msg.senderId === this.currentUserId && msg.receiverId === targetUserId) ||
          (msg.senderId === targetUserId && msg.receiverId === this.currentUserId)
        )
        .map(msg => ({
          text: msg.content,
          // Determine sender based on currentUserId
          sender: msg.senderId === this.currentUserId ? 'me' : 'other',
          time: new Date(msg.sentAt)
        }));

      this.messages = relevantMessages;
      this.messages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      this.processMessagesForDisplay(this.messages);
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim() === '' || !this.selectedUser || !this.currentUserId) {
      console.warn('لا يمكن إرسال الرسالة: النص فارغ، أو لا يوجد مستخدم محدد، أو معرف المستخدم الحالي غير متوفر.');
      return;
    }

    const messagePayload = {
      senderId: this.currentUserId,
      receiverId: this.selectedUser.id,
      message: this.newMessage
    };

    // Add optimistic message to the UI
    const optimisticMessage = {
      text: this.newMessage,
      sender: 'me',
      time: new Date(),
      status: 'sending' // Custom status to indicate it's not confirmed yet
    };
    this.messages.push(optimisticMessage);
    this.processMessagesForDisplay(this.messages);
    this.scrollToBottom();

    console.log('Attempting to send message to:', `${this.API_BASE_URL}/Chat/sendMessage`, 'with payload:', messagePayload, 'and token:', this.authToken);
    const headers = this.getAuthHeaders();
    this.http.post(`${this.API_BASE_URL}/Chat/sendMessage`, messagePayload, { headers }).pipe(
      catchError(error => {
        console.error('حدث خطأ أثناء إرسال الرسالة:', error);
        // Remove optimistic message if sending fails
        this.messages = this.messages.filter(msg => msg !== optimisticMessage);
        this.processMessagesForDisplay(this.messages);
        return throwError(() => new Error('فشل إرسال الرسالة.'));
      })
    ).subscribe(response => {
      console.log('الرسالة أرسلت بنجاح:', response);
      // After successful send, refresh messages to get the confirmed message from the server
      // and remove the optimistic message
      this.messages = this.messages.filter(msg => msg !== optimisticMessage);
      this.loadMessagesForSelectedUser(this.selectedUser.id);
      this.newMessage = ''; // Clear the input field
    });
  }

  clearSelectedUser(): void {
    this.selectedUser = null;
    this.messages = [];
    this.processedMessages = [];
  }

  private processMessagesForDisplay(rawMessages: any[]): void {
    this.processedMessages = [];
    let lastDate: Date | null = null;

    rawMessages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    rawMessages.forEach(msg => {
      const messageDate = new Date(msg.time);
      messageDate.setHours(0, 0, 0, 0);

      if (!lastDate || messageDate.getTime() !== lastDate.getTime()) {
        let separatorText = '';
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (messageDate.getTime() === today.getTime()) {
          separatorText = 'اليوم';
        } else if (messageDate.getTime() === yesterday.getTime()) {
          separatorText = 'أمس';
        } else {
          separatorText = messageDate.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
        this.processedMessages.push({ type: 'separator', value: separatorText });
        lastDate = messageDate;
      }

      this.processedMessages.push({
        type: 'message',
        value: {
          text: msg.text,
          sender: msg.sender,
          time: new Date(msg.time)
        }
      });
    });
  }

  private scrollToBottom(): void {
    const chatBody = document.querySelector('.chat-body');
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }
}
