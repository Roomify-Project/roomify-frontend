// src/app/services/post-refresh.service.ts

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostRefreshService {
  private postUploadedSource = new Subject<void>();

  // هذا هو الـ Observable الذي يمكن للمكونات الأخرى الاشتراك فيه للاستماع إلى التحديثات
  postUploaded$ = this.postUploadedSource.asObservable();

  // هذه الدالة سيتم استدعاؤها عندما يتم رفع منشور جديد بنجاح
  notifyPostUploaded() {
    this.postUploadedSource.next();
  }
}
