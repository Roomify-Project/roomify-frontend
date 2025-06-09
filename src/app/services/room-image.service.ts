import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RoomImageService {
  private baseUrl = 'http://roomify0.runasp.net/api/RoomImage';

  constructor(private http: HttpClient) {}

  generateDesign(prompt: string, roomType: string, style: string) {
    return this.http.post(`${this.baseUrl}/generate-design`, { prompt, roomType, style });
  }

  saveDesign(data: any) {
    return this.http.post(`${this.baseUrl}/save-design`, data);
  }

  getSavedDesigns(userId: string) {
    return this.http.get(`${this.baseUrl}/saved-designs/${userId}`);
  }

  downloadImage(imageUrl: string) {
    const params = new HttpParams().set('imageUrl', imageUrl);
    return this.http.get(`${this.baseUrl}/download`, { params, responseType: 'blob' });
  }
}
