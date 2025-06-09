import { HttpClient } from '@angular/common/http'; // شيل HttpClientModule من هنا، هو مش كومبوننت
import { Injectable } from '@angular/core';
// شيل import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // تأكد إن ده الـ URL الصحيح للـ Auth API
  // لاحظ إن الـ URL اللي مديهولي في الكومبوننت كان 'http://roomify0.runasp.net/api/Auth'
  // وهنا 'http://roomify.runasp.net/api/Auth'
  // لازم يكونوا واحد عشان مفيش مشاكل CORS
  private baseUrl = 'http://roomify0.runasp.net/api/Auth'; // استخدم ده الأفضل بناءً على الكود اللي فات

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    // هيرجع الـ Observable مباشرة بدون tap
    return this.http.post<any>(`${this.baseUrl}/login`, { email, password });
  }

  // ممكن تضيف دالة logOut هنا
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    // ممكن توجيه المستخدم لصفحة تسجيل الدخول
    // this.router.navigate(['/login']);
  }
}
