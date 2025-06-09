import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // استيراد CommonModule من أجل ngFor و ngIf
import { HttpClient, HttpHeaders } from '@angular/common/http'; // استيراد HttpClient من أجل استدعاءات الـ API
import { Observable, catchError, of } from 'rxjs'; // استيراد Observable وعمليات من أجل معالجة الأخطاء
import { finalize } from 'rxjs/operators'; // استيراد finalize لتنظيف حالة التحميل

// تعريف واجهة لهيكل بيانات الإشعار
interface Notification {
  id: string;
  recipientUserId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId: string;
}

// تعريف واجهة لاستجابة الـ API بشكل عام (لـ GET)
interface ApiResponse {
  status: boolean;
  message: string;
  data: Notification[];
}

// تعريف واجهة لاستجابة الـ API لعمليات التحديث (قراءة إشعار واحد أو جميع الإشعارات)
// لأن هذه الـ APIs لا ترجع بيانات (data) وإنما فقط حالة (status) ورسالة (message)
interface StatusResponse {
  status: boolean;
  message: string;
}


@Component({
  selector: 'app-notifications',
  standalone: true, // تحديد كمكون مستقل لـ Angular 15+
  imports: [CommonModule], // إضافة CommonModule هنا للتوجيهات مثل *ngFor
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  // مصفوفة لاحتواء الإشعارات المستردة
  notifications: Notification[] = [];
  // متغير لتخزين أي رسائل خطأ
  errorMessage: string = '';
  // مؤشر التحميل لاستدعاءات الـ API لجلب الإشعارات
  isLoading: boolean = true;
  // مؤشر التحميل لعملية قراءة الكل
  isMarkingAllAsRead: boolean = false;

  // حقن HttpClient في المكون
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }

  /**
   * يجلب الإشعارات من الـ API.
   */
  fetchNotifications(): void {
    this.isLoading = true; // تعيين التحميل إلى صحيح قبل الجلب
    this.errorMessage = ''; // مسح أي رسائل خطأ سابقة

    const apiUrl = 'http://roomify0.runasp.net/api/notifications';
    // **********************************************************************
    // هام جداً: يجب استبدال هذا برمز JWT حديث وصالح.
    // الرمز الذي أرسلته سابقًا منتهي الصلاحية أو غير صالح للوصول إلى هذا الـ API.
    // يجب الحصول على هذا الرمز من عملية تسجيل الدخول أو المصادقة في تطبيقك.
    // **********************************************************************
    const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZTcyYWRjYS04ZDc1LTQzZTEtZjc1MC0wOGRkOWQyZGQwMDYiLCJlbWFpbCI6ImJhc2FudHlhc2VyckBnbWFpbC5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImZlNzJhZGNhLThkNzUtNDNlMS1mNzUwLTA4ZGQ5ZDJkZDAwNiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJiYXNhbnR0dCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkludGVyaW9yRGVzaWduZXIiLCJyb2xlIjoiSW50ZXJpb3JEZXNpZ25lciIsImV4cCI6MTc1MDA1ODcxNCwiaXNzIjoiUm9vbWlmeSIsImF1ZCI6IlJvb21pZnlVc2VycyJ9.8aZyz4gn7F9TmdXP7pBbCSjAnzJcc51D5JgddnQ6VX0'; // <--- يرجى تحديث هذا السطر برمز JWT حقيقي

    // إعداد ترويسات HTTP مع رمز التفويض
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}` // تأكد من إضافة 'Bearer ' بشكل صحيح
    });

    // قم بإجراء طلب HTTP GET
    this.http.get<ApiResponse>(apiUrl, { headers }) // هنا نحدد النوع المتوقع هو ApiResponse
      .pipe(
        // التقاط أي أخطاء تحدث أثناء استدعاء الـ API
        catchError(error => {
          console.error('Error fetching notifications:', error);
          if (error.status === 401) {
            this.errorMessage = 'فشلت المصادقة. يرجى التأكد من أن رمز JWT الخاص بك صالح وغير منتهي الصلاحية.';
          } else {
            this.errorMessage = 'فشل تحميل الإشعارات. يرجى المحاولة مرة أخرى لاحقًا.';
          }
          return of({ status: false, message: this.errorMessage, data: [] }); // إرجاع Observable مع مصفوفة بيانات فارغة
        }),
        finalize(() => this.isLoading = false) // توقف التحميل دائمًا، سواء نجح الطلب أو فشل
      )
      .subscribe(response => {
        if (response.status && response.data) {
          this.notifications = response.data;
        } else {
          this.errorMessage = response.message || 'حدث خطأ غير معروف.';
        }
      });
  }

  /**
   * يقوم بتنسيق سلسلة التاريخ إلى تنسيق أكثر قابلية للقراءة.
   * @param dateString سلسلة التاريخ من الـ API.
   * @returns سلسلة تاريخ منسقة.
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    // يمكنك تخصيص تنسيق التاريخ حسب الحاجة
    return date.toLocaleString('ar-EG', { // استخدام التنسيق العربي المصري
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * يضع علامة على إشعار كمقروء عن طريق استدعاء API.
   * @param notification كائن الإشعار لوضع علامة عليه كمقروء.
   */
  markAsRead(notification: Notification): void {
    if (notification.isRead) {
      // إذا كان الإشعار مقروءاً بالفعل، فلا داعي لإجراء طلب API مرة أخرى.
      return;
    }

    const apiUrl = `http://roomify0.runasp.net/api/notifications/${notification.id}/read`;
    const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZTcyYWRjYS04ZDc1LTQzZTEtZjc1MC0wOGRkOWQyZGQwMDYiLCJlbWFpbCI6ImJhc2FudHlhc2VyckBnbWFpbC5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImZlNzJhZGNhLThkNzUtNDNlMS1mNzUwLTA4ZGQ5ZDJkZDAwNiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJiYXNhbnR0dCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkludGVyaW9yRGVzaWduZXIiLCJyb2xlIjoiSW50ZXJpb3JEZXNpZ25lciIsImV4cCI6MTc1MDA1ODcxNCwiaXNzIjoiUm9vbWlmeSIsImF1ZCI6IlJvb21pZnlVc2VycyJ9.8aZyz4gn7F9TmdXP7pBbCSjAnzJcc51D5JgddnQ6VX0'; // <--- يرجى التأكد من استخدام نفس رمز JWT الصالح

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    });

    // يتم إرسال طلب PUT لـ API لتحديث حالة الإشعار
    this.http.put<StatusResponse>(apiUrl, {}, { headers }) // هنا نحدد النوع المتوقع هو StatusResponse
      .pipe(
        catchError(error => {
          console.error(`Error marking notification ${notification.id} as read:`, error);
          if (error.status === 401) {
            this.errorMessage = 'فشلت المصادقة عند محاولة وضع علامة على الإشعار كمقروء. يرجى تسجيل الدخول مرة أخرى.';
          } else {
            this.errorMessage = 'فشل وضع علامة على الإشعار كمقروء. يرجى المحاولة مرة أخرى.';
          }
          return of(null); // إرجاع Observable فارغ لتجنب كسر السلسلة
        })
      )
      .subscribe(response => {
        if (response && response.status === true) {
          // إذا كان الطلب ناجحاً، قم بتحديث حالة الإشعار في الواجهة الأمامية
          notification.isRead = true;
          console.log(`Notification ${notification.id} marked as read successfully.`);
        } else {
          console.log(`Failed to mark notification ${notification.id} as read.`);
        }
      });
  }

  /**
   * يضع علامة على جميع الإشعارات كمقروءة عن طريق استدعاء API.
   */
  markAllAsRead(): void {
    if (this.notifications.every(n => n.isRead)) {
      // إذا كانت جميع الإشعارات مقروءة بالفعل، فلا داعي لإجراء طلب API.
      this.errorMessage = 'لا توجد إشعارات غير مقروءة لتعليمها.';
      return;
    }

    this.isMarkingAllAsRead = true; // بدء مؤشر التحميل للزر
    this.errorMessage = ''; // مسح أي رسائل خطأ سابقة

    const apiUrl = 'http://roomify0.runasp.net/api/notifications/read-all';
    const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZTcyYWRjYS04ZDc1LTQzZTEtZjc1MC0wOGRkOWQyZGQwMDYiLCJlbWFpbCI6ImJhc2FudHlhc2VyckBnbWFpbC5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImZlNzJhZGNhLThkNzUtNDNlMS1mNzUwLTA4ZGQ5ZDJkZDAwNiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJiYXNhbnR0dCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkludGVyaW9yRGVzaWduZXIiLCJyb2xlIjoiSW50ZXJpb3JEZXNpZ25lciIsImV4cCI6MTc1MDA1ODcxNCwiaXNzIjoiUm9vbWlmeSIsImF1ZCI6IlJvb21pZnlVc2VycyJ9.8aZyz4gn7F9TmdXP7pBbCSjAnzJcc51D5JgddnQ6VX0'; // <--- يرجى التأكد من استخدام نفس رمز JWT الصالح

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    });

    this.http.put<StatusResponse>(apiUrl, {}, { headers }) // هنا نحدد النوع المتوقع هو StatusResponse
      .pipe(
        catchError(error => {
          console.error('Error marking all notifications as read:', error);
          if (error.status === 401) {
            this.errorMessage = 'فشلت المصادقة عند محاولة وضع علامة على جميع الإشعارات كمقروءة. يرجى تسجيل الدخول مرة أخرى.';
          } else {
            this.errorMessage = 'فشل وضع علامة على جميع الإشعارات كمقروءة. يرجى المحاولة مرة أخرى.';
          }
          return of(null);
        }),
        finalize(() => this.isMarkingAllAsRead = false) // توقف التحميل دائمًا عند الانتهاء
      )
      .subscribe(response => {
        if (response && response.status === true) { // بناءً على هيكل استجابتك
          // تحديث جميع الإشعارات في الواجهة الأمامية إلى مقروءة
          this.notifications.forEach(notification => {
            notification.isRead = true;
          });
          console.log('All notifications marked as read successfully.');
        } else {
          // التعامل مع الرسالة من الـ API إذا كان هناك خطأ في الاستجابة ولكن ليس خطأ HTTP
          this.errorMessage = response?.message || 'حدث خطأ غير معروف عند تعليم الكل كمقروء.';
          console.log('Failed to mark all notifications as read.');
        }
      });
  }

  // خاصية مساعدة لتحديد ما إذا كانت هناك أي إشعارات غير مقروءة
  get hasUnreadNotifications(): boolean {
    return this.notifications.some(n => !n.isRead);
  }
}
