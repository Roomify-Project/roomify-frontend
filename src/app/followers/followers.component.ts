import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // استيراد CommonModule لاستخدام *ngFor
import { RouterModule } from '@angular/router'; // استيراد RouterModule لاستخدام routerLink

// تعريف واجهة لبيانات المتابع
interface Follower {
  id: string; // معرف المتابع
  userName: string; // اسم المستخدم للمتابع
  email: string; // بريد المتابع الإلكتروني
  role: string; // دور المتابع (مثل "Interior Designer")
  profilePicture: string | null; // رابط صورة الملف الشخصي للمتابع
}

@Component({
  selector: 'app-followers',
  standalone: true, // تحديد الكومبوننت كـ standalone
  imports: [CommonModule, RouterModule], // إضافة CommonModule و RouterModule هنا
  templateUrl: './followers.component.html',
  styleUrl: './followers.component.css'
})
export class FollowersComponent implements OnInit {
  followers: Follower[] = []; // مصفوفة لتخزين بيانات المتابعين التي سيتم جلبها
  private http = inject(HttpClient); // حقن خدمة HttpClient

  ngOnInit(): void {
    this.getFollowers(); // استدعاء الدالة لجلب المتابعين عند تهيئة الكومبوننت
  }

  getFollowers(): void {
    const userId = localStorage.getItem('userId'); // جلب معرف المستخدم الحالي من localStorage
    const token = localStorage.getItem('token'); // جلب توكن المصادقة من localStorage

    if (!userId || !token) {
      console.error('معرف المستخدم أو التوكن غير موجود في localStorage. يرجى تسجيل الدخول.');
      // يمكنك توجيه المستخدم لصفحة تسجيل الدخول هنا إذا أردت
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // إعداد الـ headers مع توكن المصادقة

    this.http.get<Follower[]>(`http://roomify0.runasp.net/api/follow/followers/${userId}`, { headers })
      .subscribe({
        next: (data) => {
          this.followers = data; // تعيين البيانات التي تم جلبها إلى مصفوفة المتابعين
          console.log('بيانات المتابعين:', this.followers);
        },
        error: (error) => {
          console.error('حدث خطأ أثناء جلب المتابعين:', error);
          // معالجة الخطأ (على سبيل المثال، عرض رسالة خطأ للمستخدم)
        }
      });
  }
}
