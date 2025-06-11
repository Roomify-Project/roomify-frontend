import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomImageService {
  // هذا هو رابط الـ API الخاص بك الذي يستقبل طلبات التصميم
  private apiUrl = 'http://roomify0.runasp.net/api/RoomImage/generate-design';

  constructor(private http: HttpClient) { }

  // هذه الدالة ترسل كائن FormData الذي يحتوي على الصورة والنصوص
  generateDesign(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
}
