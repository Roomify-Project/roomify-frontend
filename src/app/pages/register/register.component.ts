import { RouterModule, Router } from '@angular/router'; // ✅ استيراد Router
import { RegistrationService } from './../../registration.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BackgroundComponent } from '../../background/background.component';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  standalone: true,
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;
  errorMessage: string | null = null; // لتخزين رسالة الخطأ عند وجودها

  constructor(
    private fb: FormBuilder,
    private authService: RegistrationService,
    private router: Router // ✅ حقن Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]+$')]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
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

    if (this.registerForm.valid) {
      const payload = {
        fullName: this.registerForm.value.fullName,
        userName: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        bio: '',
        profilePicture: '',
        roles: 'NormalUser',
      };

      this.authService.register(payload).subscribe(
        response => {
          console.log('Registration successful', response);
          this.router.navigate(['/confirm']); // ✅ التوجيه عند النجاح
        },
        error => {
          console.error('Registration failed', error);
          this.errorMessage = 'Failed to register. Please try again later.'; // تعيين رسالة الخطأ
          // لا نقوم بالتوجيه هنا حتى في حالة الفشل
        }
      );
    } else {
      // إذا كان الفورم غير صالح، لا يتم التوجيه
      this.errorMessage = 'Please fill in the form correctly.'; // رسالة الخطأ عند وجود بيانات غير صحيحة
    }
  }
}
