import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BackgroundComponent } from '../../background/background.component';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule , HttpClientModule , RouterModule , BackgroundComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        // **** التعديل هنا: حفظ كل قيمة بمفتاحها الخاص ****
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.userId);     // حفظ الـ userId
        localStorage.setItem('userName', res.userName); // حفظ اسم المستخدم

        // لو عاوز تحفظ الـ roles برضه
        if (res.roles) {
          localStorage.setItem('userRoles', JSON.stringify(res.roles)); // لو الـ roles مصفوفة
        }

        this.router.navigate(['/profile']); // توجيه لصفحة البروفايل
      },
      error: (err: any) => {
        console.error(err);
        // رسالة خطأ أوضح للمستخدم
        this.errorMessage = 'فشل تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور.';
      }
    });
  }
}
