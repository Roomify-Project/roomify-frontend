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
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    this.isStepTwoVisible = true;

    // أول خطوة: إرسال الكود
    this.http.post('http://roomify.runasp.net/api/Auth/forget-password', { email: this.email })
      .subscribe({
        next: () => {
          this.successMessage = 'Verification code sent.';
          this.errorMessage = '';
        },
        error: err => {
          this.errorMessage = err.error?.message || 'An error occurred.';
          this.successMessage = '';
        }
      });
  }

  confirmReset() {
    const payload = {
      email: this.email,
      otpCode: this.verificationCode,
      newPassword: this.newPassword
    };

    this.http.post('http://roomify.runasp.net/api/Auth/reset-password', payload)
      .subscribe({
        next: () => {
          this.successMessage = 'Password reset successfully.';
          this.errorMessage = '';
          this.router.navigate(['/login']);
        },
        error: err => {
          this.errorMessage = err.error?.message || 'An error occurred.';
          this.successMessage = '';
        }
      });
  }
}
