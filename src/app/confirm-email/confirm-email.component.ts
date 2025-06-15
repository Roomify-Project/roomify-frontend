// src/app/confirm-email/confirm-email.component.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // استيراد FormBuilder, FormGroup, Validators, ReactiveFormsModule
import { CommonModule } from '@angular/common'; // استيراد CommonModule
import { RouterModule, Router } from '@angular/router'; // استيراد RouterModule, Router
import { HttpClientModule } from '@angular/common/http'; // استيراد HttpClientModule
import { RegistrationService } from '../registration.service'; // تأكد من المسار الصحيح لخدمتك

@Component({
  selector: 'app-confirm-email',
  // تأكد من إضافة الوحدات النمطية اللازمة هنا
  imports: [
    CommonModule,
    ReactiveFormsModule, // لإضافة النماذج التفاعلية
    RouterModule, // إذا كنت تستخدم routerLink أو Router في القالب
    HttpClientModule // لضمان عمل HttpClient
  ],
  standalone: true, // تأكد من أنها standalone component
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.css'
})
export class ConfirmEmailComponent {
  confirmEmailForm: FormGroup;
  submitted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null; // لعرض رسالة النجاح

  constructor(
    private fb: FormBuilder,
    private authService: RegistrationService, // حقن خدمة التسجيل
    private router: Router // حقن خدمة التوجيه
  ) {
    this.confirmEmailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      // كود OTP 6 أرقام، يتحقق من أنه رقمي فقط
      otpCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9]{6}$')]]
    });
  }

  //getter لسهولة الوصول إلى عناصر التحكم في النموذج في القالب
  get f() {
    return this.confirmEmailForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = null; // مسح رسالة الخطأ السابقة
    this.successMessage = null; // مسح رسالة النجاح السابقة

    if (this.confirmEmailForm.valid) {
      const payload = {
        email: this.confirmEmailForm.value.email,
        // تأكد من أن 'otpCode' بحرف 'C' كبير ليطابق الـ API
        otpCode: this.confirmEmailForm.value.otpCode
      };

      console.log('Payload being sent:', payload); // لعرض الـ payload المرسل للمساعدة في التصحيح

      this.authService.confirmEmail(payload).subscribe(
        response => {
          console.log('Email confirmation successful', response);
          this.successMessage = 'تم تأكيد البريد الإلكتروني بنجاح! سيتم توجيهك الآن إلى صفحة تسجيل الدخول.';
          // توجيه المستخدم إلى صفحة /login بعد فترة قصيرة
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000); // التوجيه بعد 2 ثانية (يمكنك تعديل هذه المدة)
        },
        error => {
          console.error('Email confirmation failed', error);
          // طباعة تفاصيل الخطأ الكاملة من الـ API للمساعدة في التصحيح
          console.log('Error response from API:', error.error);

          // محاولة عرض رسالة خطأ أكثر تفصيلاً من استجابة الـ API
          if (error.error && typeof error.error === 'object') {
            if (error.error.message) {
              this.errorMessage = error.error.message;
            } else {
              // إذا كان الـ API يرسل أخطاء تحقق في تنسيق كائن (مثل { "errors": { ... } } أو { "Email": ["The Email field is required."] })
              let details = '';
              for (const key in error.error) {
                if (error.error.hasOwnProperty(key)) {
                  if (Array.isArray(error.error[key])) {
                    details += `${key}: ${error.error[key].join(', ')}\n`;
                  } else if (typeof error.error[key] === 'string') {
                    details += `${key}: ${error.error[key]}\n`;
                  }
                }
              }
              this.errorMessage = `فشل تأكيد: ${details || 'البيانات غير صالحة.'}`;
            }
          } else if (error.status === 400) {
            this.errorMessage = 'فشل تأكيد البريد الإلكتروني. يرجى التحقق من البريد والكود والمحاولة مرة أخرى.';
          } else {
            this.errorMessage = 'حدث خطأ غير معروف. يرجى المحاولة مرة أخرى لاحقاً.';
          }
        }
      );
    } else {
      this.errorMessage = 'الرجاء إدخال البريد الإلكتروني والكود بشكل صحيح.';
    }
  }
}
