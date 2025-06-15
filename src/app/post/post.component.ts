import { Component, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PostRefreshService } from '../services/post-refresh.service';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavbarComponent
],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent {
  selectedFile: File | null = null;
  description: string = '';
  // لم نعد بحاجة لتعريف applicationUserId هنا كقيمة ثابتة
  // applicationUserId: string = 'fe72adca-8d75-43e1-f750-08dd9d2dd006'; // هذا السطر يجب حذفه أو التعليق عليه

  private http = inject(HttpClient);
  private router = inject(Router);
  private postRefreshService = inject(PostRefreshService);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  onUpload() {
    if (!this.selectedFile) {
      alert('الرجاء اختيار صورة لرفعها.');
      return;
    }

    if (!this.description.trim()) {
      alert('الرجاء كتابة وصف للصورة.');
      return;
    }

    const token = localStorage.getItem('token') || '';
    if (!token) {
      alert('لا يوجد توكن مصادقة. الرجاء تسجيل الدخول.');
      this.router.navigate(['/login']);
      return;
    }

    // **** التعديل الرئيسي هنا: جلب الـ userId من localStorage ****
    const applicationUserId = localStorage.getItem('userId');
    if (!applicationUserId) {
      alert('معرف المستخدم غير موجود في localStorage. الرجاء تسجيل الدخول.');
      this.router.navigate(['/login']); // أو أي مسار لصفحة تسجيل الدخول
      return;
    }

    const formData = new FormData();
    formData.append('ImageFile', this.selectedFile, this.selectedFile.name);
    formData.append('Description', this.description);
    // استخدم applicationUserId الذي تم جلبه من localStorage
    formData.append('ApplicationUserId', applicationUserId);

    // عنوان الـ API يجب أن يكون متناسقاً مع الـ userId الذي نستخدمه
    // لاحظ أنك حالياً تستخدم userId ثابت في الـ URL هنا أيضاً:
    // 'http://roomify0.runasp.net/api/PortfolioPost/upload/fe72adca-8d75-43e1-f750-08dd9d2dd006'
    // يجب أن يصبح ديناميكياً أيضاً باستخدام applicationUserId
    const uploadUrl = `http://roomify.runasp.net/api/PortfolioPost/upload/${applicationUserId}`;


    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(uploadUrl, formData, { headers }) // استخدم uploadUrl الديناميكي
      .subscribe({
        next: (response) => {
          console.log('تم الرفع بنجاح:', response);
          alert('تم رفع الصورة بنجاح!');
          this.postRefreshService.notifyPostUploaded();
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          console.error('حدث خطأ أثناء الرفع:', error);
          alert('فشل رفع الصورة: ' + (error.error?.message || 'خطأ غير معروف'));
        }
      });
  }
}
