import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forget.component.html',
  styleUrl: './forget.component.css'
})
export class ForgetComponent {
  email: string = '';
  verificationCode: string = '';
  newPassword: string = '';
  isStepTwoVisible: boolean = false;
  successMessage: string = '';
  errorMessage: string = ''; // سنبقيها موجودة ولكن لن نستخدمها لعرض الأخطاء في الواجهة

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    // اجعل الخطوة الثانية مرئية بمجرد الضغط على زر "Continue"
    // الرسائل لا تعرض أخطاء الكود هنا، فقط رسالة تأكيد إرسال الكود
    this.successMessage = 'Verification code sent. Please enter it below.';
    this.errorMessage = ''; // تأكد من مسح أي أخطاء سابقة
    this.isStepTwoVisible = true;

    // أول خطوة: إرسال الكود
    this.http.post('http://roomify.runasp.net/api/Auth/forget-password', { email: this.email })
      .subscribe({
        next: () => {
          // يمكننا تسجيل النجاح هنا في الكونسول إذا أردت للتأكد
          console.log('Forget password request successful, code sent.');
        },
        error: err => {
          // لن نعرض رسالة الخطأ للمستخدم في الواجهة هنا، ولكن يمكن تسجيلها للمطور
          console.error('Error sending forget password request:', err.error?.message || 'An error occurred.');
          // يمكنك إرجاع isStepTwoVisible = false; هنا إذا أردت أن تختفي الخطوة الثانية عند فشل الإرسال
          // isStepTwoVisible: false;
        }
      });
  }

  confirmReset() {
    // امسح رسائل النجاح/الخطأ السابقة قبل المحاولة الجديدة
    this.successMessage = '';
    this.errorMessage = ''; // لن نستخدمها لعرض الخطأ في الواجهة

    const payload = {
      email: this.email,
      otpCode: this.verificationCode,
      newPassword: this.newPassword
    };

    this.http.post('http://roomify.runasp.net/api/Auth/reset-password', payload)
      .subscribe({
        next: () => {
          this.successMessage = 'Password reset successfully!';
          // الانتقال الفوري لصفحة تسجيل الدخول بعد النجاح
          this.router.navigate(['/login']);
        },
        error: err => {
          // لن نعرض رسالة الخطأ للمستخدم في الواجهة هنا، ولكن يمكن تسجيلها للمطور
          console.error('Error resetting password:', err.error?.message || 'An error occurred during password reset.');
          // إذا لم يتم إعادة التوجيه لصفحة تسجيل الدخول، يمكن افتراض أن هناك خطأ ما (الكود غلط مثلاً)
          // ولكن لن نعرض رسالة خطأ صريحة للمستخدم
        }
      });
  }
}
