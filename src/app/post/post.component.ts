import { Component, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // استيراد HttpClient و HttpHeaders
import { CommonModule } from '@angular/common'; // لـ ngIf و ngFor (إذا احتجت)
import { FormsModule } from '@angular/forms'; // **مهم جداً لـ [(ngModel)]**
import { Router } from '@angular/router'; // لاستخدامه في التوجيه بعد الرفع

@Component({
  selector: 'app-post',
  standalone: true, // تأكد من أنها مستقلة
  imports: [
    CommonModule, // أضف CommonModule
    FormsModule // **أضف FormsModule هنا**
  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css' // تم تغييرها من styleUrls إلى styleUrl في Angular 17+
})
export class PostComponent {
  // متغيرات لتخزين بيانات النموذج
  selectedFile: File | null = null;
  description: string = '';
  // يمكنك الحصول على هذا من خدمة المصادقة أو localStorage
  applicationUserId: string = 'fe72adca-8d75-43e1-f750-08dd9d2dd006';

  // حقن HttpClient و Router
  private http = inject(HttpClient);
  private router = inject(Router);

  // دالة تُستدعى عند اختيار ملف
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  // دالة تُستدعى عند النقر على زر الرفع
  onUpload() {
    if (!this.selectedFile) {
      alert('الرجاء اختيار صورة لرفعها.');
      return;
    }

    if (!this.description.trim()) {
      alert('الرجاء كتابة وصف للصورة.');
      return;
    }

    // الحصول على التوكن من localStorage (افترض أنه مخزن هناك بعد تسجيل الدخول)
    const token = localStorage.getItem('token') || '';
    if (!token) {
      alert('لا يوجد توكن مصادقة. الرجاء تسجيل الدخول.');
      this.router.navigate(['/login']); // أو أي مسار لصفحة تسجيل الدخول
      return;
    }

    // إنشاء FormData لإرسال الملف والبيانات الأخرى
    const formData = new FormData();
    formData.append('ImageFile', this.selectedFile, this.selectedFile.name);
    formData.append('Description', this.description);
    formData.append('ApplicationUserId', this.applicationUserId);

    // إرسال طلب الـ POST
    // لاحظ أن الـ Content-Type لا يتم تعيينه يدوياً عند استخدام FormData، المتصفح يقوم بذلك
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('http://roomify0.runasp.net/api/PortfolioPost/upload/fe72adca-8d75-43e1-f750-08dd9d2dd006', formData, { headers })
      .subscribe({
        next: (response) => {
          console.log('تم الرفع بنجاح:', response);
          alert('تم رفع الصورة بنجاح!');
          // التوجيه إلى صفحة الملف الشخصي بعد الرفع الناجح
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          console.error('حدث خطأ أثناء الرفع:', error);
          alert('فشل رفع الصورة: ' + (error.error?.message || 'خطأ غير معروف'));
        }
      });
  }
}
