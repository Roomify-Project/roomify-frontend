import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule , RouterModule],
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  login() {
    // التحقق من البريد الإلكتروني وكلمة المرور
    if (this.email === 'eslamembaby33@gmail.com' && this.password === 'eslam2003619') {
      // التوجيه إلى الصفحة الرئيسية
      this.router.navigate(['/home']);
    } else {
      alert('Invalid Email or Password!');
    }
  }
}
