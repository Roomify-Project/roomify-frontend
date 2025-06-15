// src/app/registration.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  // **تأكد أن هذا الـ URL هو الصحيح لـ API الخاصة بك (roomify0 كما ذكرت)**
  private apiUrl = 'http://roomify0.runasp.net/api/Auth';

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // استخدام '/register' بحرف صغير 'r' بناءً على conventions الـ RESTful
    return this.http.post(`${this.apiUrl}/register`, userData, { headers: headers });
  }

  confirmEmail(confirmationData: { email: string; otpCode: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // URL الكامل: http://roomify0.runasp.net/api/Auth/confirm-email
    return this.http.post(`${this.apiUrl}/confirm-email`, confirmationData, { headers: headers });
  }
}
