import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs'; // ✳️ نضيف BehaviorSubject و tap

export interface Post {
  id: string;
  imagePath: string;
  description: string;
  createdAt: string;
  applicationUserId: string;
  // ممكن تضيف ownerUserName و ownerProfilePicture هنا لو بترجع في كل البوستات
  ownerUserName?: string | null;
  ownerProfilePicture?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  // ✳️ تأكد من الـ URL الصحيح هنا
  private apiUrl = 'http://roomify0.runasp.net/api/PortfolioPost/'; // ✳️ يفضل يكون نفس الـ Base URL بتاعك

  // ✳️ BehaviorSubject للاحتفاظ بقائمة البوستات الحالية وإبلاغ المشتركين بالتغييرات
  private _posts = new BehaviorSubject<Post[]>([]);
  // Observable عشان الكومبوننتس تقدر تعمل subscribe عليه
  public readonly posts$ = this._posts.asObservable();

  constructor(private http: HttpClient) {}

  // دالة لجلب كل البوستات وتحديث الـ BehaviorSubject
  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl).pipe(
      tap(res => {
        this._posts.next(res); // ✳️ لما البوستات تيجي من الـ API، بنحدث الـ BehaviorSubject بيها
        console.log('Posts fetched and updated in service:', res);
      })
    );
  }

  // ✳️ دالة لإضافة بوست جديد (لو عندك API لإضافة بوست)
  // دي مجرد مثال، تحتاج تعديلها لتناسب الـ API بتاعك
  addPost(newPost: Post): Observable<Post> {
    // افترض إن الـ API بتاعك بيرجع البوست اللي تم إضافته
    return this.http.post<Post>(this.apiUrl, newPost).pipe(
      tap(addedPost => {
        // بنضيف البوست الجديد لقائمة البوستات الحالية وبنحدث الـ BehaviorSubject
        const currentPosts = this._posts.getValue();
        this._posts.next([...currentPosts, addedPost]);
        console.log('Post added and service updated:', addedPost);
      })
    );
  }

  // ✳️ دالة لحذف بوست وتحديث الـ BehaviorSubject
  deletePost(postId: string): Observable<any> {
    const deleteUrl = `${this.apiUrl}${postId}`; // رابط الحذف غالباً بيكون api/PortfolioPost/{id}
    return this.http.delete(deleteUrl).pipe(
      tap(() => {
        // بنعمل فلترة للبوستات عشان نشيل البوست اللي اتحذف
        const currentPosts = this._posts.getValue();
        const updatedPosts = currentPosts.filter(post => post.id !== postId);
        this._posts.next(updatedPosts); // ✳️ بنحدث الـ BehaviorSubject بالقائمة الجديدة
        console.log('Post deleted and service updated. Remaining posts:', updatedPosts);
      })
    );
  }

  // ممكن تضيف دالة لتعديل بوست برضه
  // updatePost(...) { ... }
}
