import { RouterModule, Router } from '@angular/router';
import { RegistrationService } from './../../registration.service'; // تأكد من المسار الصحيح لخدمتك
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // تأكد من استيراد HttpClientModule في AppModule أو حيثما هو مطلوب

// لا نحتاج لـ BackgroundComponent هنا إذا لم تكن تستخدمه في هذا المكون مباشرةً
// import { BackgroundComponent } from '../../background/background.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  // تأكد من أن HttpClientModule متاح في الـ imports الخاصة بالـ AppModule أو standalone component
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule], // أضف HttpClientModule
  standalone: true,
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;
  errorMessage: string | null = null; // لتخزين رسالة الخطأ عند وجودها

  constructor(
    private fb: FormBuilder,
    private authService: RegistrationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      // هنا 'username' هو اسم الـ form control
      username: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]+$')]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          // تأكد من أن الـ Regular Expression يطابق متطلبات الـ API بدقة
          Validators.pattern('(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}'),
        ],
      ],
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = null; // مسح رسالة الخطأ السابقة عند كل محاولة إرسال

    if (this.registerForm.valid) {
      const payload = {
        fullName: this.registerForm.value.fullName,
        // **هام جداً:** هنا نقوم بإرسال 'userName' (بحرف N كبير) كما تتوقعه الـ API
        // بينما الـ form control لدينا اسمه 'username' (بحرف n صغير).
        userName: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        // هذه القيم اختيارية في Postman (أو يمكن إرسالها فارغة)
        // إذا كانت الـ API تتوقع قيمًا معينة هنا، يجب توفيرها
        bio: '', // يمكنك تعديل هذه القيمة إذا كنت تريد إرسال Bio افتراضي
        profilePicture: '', // يمكنك تعديل هذه القيمة إذا كنت تريد إرسال صورة افتراضية
        // تأكد من أن الدور الذي ترسله ('NormalUser') مقبول من الـ API
        // في مثال Postman كان 'InteriorDesigner'
        roles: 'NormalUser', // استخدم الدور الافتراضي الذي تريده لتطبيقك
      };

      this.authService.register(payload).subscribe(
        response => {
          console.log('Registration successful', response);
          this.router.navigate(['/confirm']); // التوجيه عند النجاح
        },
        error => {
          console.error('Registration failed', error);
          // رسالة خطأ أكثر تحديداً من استجابة الـ API إذا كانت متوفرة
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'فشل التسجيل. يرجى التأكد من البيانات والمحاولة مرة أخرى.';
          }
        }
      );
    } else {
      // إذا كان الفورم غير صالح، لا يتم التوجيه
      this.errorMessage = 'الرجاء ملء النموذج بشكل صحيح.'; // رسالة الخطأ عند وجود بيانات غير صحيحة
    }
  }
}
