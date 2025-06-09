import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode'; // ✳️ تم استيراد المكتبة

// تعريف واجهة للتعليق بناءً على استجابة الـ API الفعلية التي قدمتها سابقًا
interface Comment {
  id?: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  userId: string;
  userName: string;
  userProfilePicture: string | null;
  portfolioPostId: string;
  isEditing?: boolean;       // لتتبع وضع التعديل
  originalContent?: string;  // لحفظ المحتوى الأصلي قبل التعديل
}

// تعريف واجهة للبوست لتطابق ما تعيده خدمة PostsService
export interface PostDetails {
  id: string;
  imagePath: string;
  description: string;
  createdAt: string;
  applicationUserId: string;
  ownerUserName?: string | null;
  ownerProfilePicture?: string | null;
  title?: string;
  authorName?: string;
}

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {

  postId: string | null = null;
  comments: Comment[] = [];
  postDetails: PostDetails | null = null;
  newComment: string = '';

  // بيانات المستخدم الحالي - سيتم جلبها ديناميكياً من التوكن
  currentUser = {
    id: '', // ✳️ سيتم ملأها ديناميكياً من التوكن
    userName: 'المستخدم الحالي', // سيتم تحديثها من التوكن إن وجدت
    profilePicture: '/assets/avatar.png' // سيتم تحديثها من التوكن إن وجدت
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {
    console.log('CommentComponent constructor called.');
  }

  ngOnInit(): void {
    console.log('ngOnInit called in CommentComponent.');
    // ✳️ استدعاء دالة تحميل بيانات المستخدم قبل أي عمليات أخرى
    this.loadCurrentUser();

    this.route.paramMap.subscribe(params => {
      this.postId = params.get('postId');
      console.log('ParamMap subscription: postId =', this.postId);
      if (this.postId) {
        this.fetchComments();
        this.fetchPostDetails(this.postId);
      } else {
        console.error('معرف المنشور مفقود في المسار. إعادة التوجيه إلى الصفحة الرئيسية.');
        this.router.navigate(['/home']);
      }
    });
  }

  // ✳️ دالة جديدة لتحميل بيانات المستخدم الحالي من الـ JWT Token
  loadCurrentUser() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log('Decoded Token:', decodedToken); // عرض التوكن لترى محتواه

        // ✳️ هنا يتم استخراج الـ ID. تأكد من اسم الخاصية الصحيحة في التوكن الخاص بك.
        // جرب 'sub' أولاً، ثم 'nameid'، ثم 'userId' أو 'uid'.
        this.currentUser.id = decodedToken.sub || decodedToken.nameid || decodedToken.userId || decodedToken.uid || '';

        // ✳️ استخراج اسم المستخدم وصورته لو موجودين في التوكن
        this.currentUser.userName = decodedToken.userName || decodedToken.unique_name || 'المستخدم الحالي'; // "unique_name" شائع في .NET
        this.currentUser.profilePicture = decodedToken.profilePicture || '/assets/avatar.png';

        console.log('Current user loaded:', this.currentUser);

        if (!this.currentUser.id) {
          console.warn('User ID could not be extracted from the token. Please check the token payload structure.');
        }

      } catch (error) {
        console.error('خطأ في فك تشفير التوكن أو التوكن غير صالح:', error);
        // في حالة وجود خطأ في التوكن، يفضل مسحه وإعادة توجيه المستخدم لصفحة تسجيل الدخول
        localStorage.removeItem('token');
        // this.router.navigate(['/login']); // يمكنك تفعيل هذا لإعادة التوجيه
      }
    } else {
      console.warn('لم يتم العثور على توكن في الـ localStorage. معرف المستخدم قد لا يكون متاحاً.');
      // لو مفيش توكن، ممكن تظهر الأزرار للمستخدمين الضيوف أو تخفيها تماماً
    }
  }

  fetchComments() {
    if (!this.postId) {
      console.warn('تم استدعاء fetchComments بدون postId.');
      return;
    }

    const token = localStorage.getItem('token') || '';
    console.log('جلب التعليقات للمنشور بمعرف:', this.postId, 'مع التوكن (جزئي):', token.substring(0, 30) + '...');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const commentsApiUrl = `http://roomify0.runasp.net/api/Comments/post/${this.postId}`;

    this.http.get<Comment[]>(commentsApiUrl, { headers }).subscribe({
      next: (data) => {
        console.log('API استجاب ببيانات التعليقات:', data);
        if (Array.isArray(data)) {
          this.comments = data.map(comment => ({
            ...comment,
            userProfilePicture: comment.userProfilePicture || '/assets/jojo.jpg',
            isEditing: false, // افتراضياً، ليس في وضع التعديل
            originalContent: comment.content // حفظ المحتوى الأصلي
          }));
          console.log('تم تحديث مصفوفة التعليقات بعد الجلب:', this.comments);
        } else {
          console.warn('استجابة الـ API للتعليقات ليست مصفوفة أو فارغة:', data);
          this.comments = [];
        }
      },
      error: (error) => {
        console.error('خطأ في جلب التعليقات:', error);
      }
    });
  }

  fetchPostDetails(postId: string) {
    console.log('جلب تفاصيل المنشور بمعرف:', postId);
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const postApiUrl = `http://roomify0.runasp.net/api/PortfolioPost/${postId}`;

    this.http.get<PostDetails>(postApiUrl, { headers }).subscribe({
      next: (data) => {
        this.postDetails = data;
        console.log('تم جلب تفاصيل المنشور من الـ API:', this.postDetails);
        console.log('مسار الصورة من الـ API:', this.postDetails?.imagePath);
        console.log('الوصف من الـ API:', this.postDetails?.description);
      },
      error: (err) => {
        console.error('خطأ في جلب تفاصيل المنشور من الـ API:', err);
        this.postDetails = {
          id: postId,
          imagePath: '/assets/room1.jpg',
          description: 'فشل تحميل تفاصيل المنشور. الرجاء المحاولة لاحقاً.',
          createdAt: new Date().toISOString(),
          applicationUserId: 'unknown'
        };
      }
    });
  }

  addComment() {
    // ✳️ تأكد أن currentUser.id موجود قبل الإضافة
    if (this.newComment.trim() && this.postId && this.currentUser.id) {
      console.log('محاولة إضافة تعليق:', this.newComment.trim());
      const token = localStorage.getItem('token') || '';
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      const addCommentApiUrl = `http://roomify0.runasp.net/api/Comments?userId=${this.currentUser.id}`;

      const commentPayload = {
        content: this.newComment.trim(),
        PortfolioPostId: this.postId
      };
      console.log('حمولة التعليق المرسلة:', commentPayload);
      console.log('عنوان الـ API لإضافة التعليق:', addCommentApiUrl);

      this.http.post(addCommentApiUrl, commentPayload, { headers }).subscribe({
        next: (response: any) => {
          console.log('تمت إضافة التعليق بنجاح (استجابة الـ API):', response);
          this.comments.push({
            id: response.id || new Date().getTime().toString(),
            content: this.newComment.trim(),
            // ✳️ استخدم بيانات المستخدم الحالي اللي تم جلبها من التوكن
            userName: this.currentUser.userName,
            userProfilePicture: this.currentUser.profilePicture,
            createdAt: new Date().toISOString(),
            updatedAt: null,
            userId: this.currentUser.id, // ✳️ هنا بنستخدم الـ ID اللي جبناه من التوكن
            portfolioPostId: this.postId!,
            isEditing: false,
            originalContent: this.newComment.trim()
          });
          this.newComment = '';
          console.log('مصفوفة التعليقات المحلية بعد الإضافة:', this.comments);
        },
        error: (error) => {
          console.error('خطأ في إضافة التعليق:', error);
          alert('فشل في إضافة التعليق: ' + (error.error?.message || JSON.stringify(error.error) || 'خطأ غير معروف.'));
        }
      });
    } else {
      console.warn('لا يمكن إضافة تعليق فارغ، أو معرف المنشور/المستخدم مفقود. (newComment.trim():', !!this.newComment.trim(), 'postId:', !!this.postId, 'currentUser.id:', !!this.currentUser.id, ')');
      if (!this.currentUser.id) {
        alert('يجب تسجيل الدخول لإضافة تعليق.');
        // يمكنك هنا إعادة توجيه المستخدم لصفحة تسجيل الدخول
        // this.router.navigate(['/login']);
      }
    }
  }

  editComment(comment: Comment) {
    if (comment.userId === this.currentUser.id) {
      comment.isEditing = true;
      comment.originalContent = comment.content;
      console.log('تعديل التعليق:', comment.id);
    } else {
      alert('لا تملك صلاحية تعديل هذا التعليق.');
    }
  }

  saveEditedComment(comment: Comment) {
    if (!comment.id || !this.currentUser.id || !comment.content.trim()) {
      console.warn('لا يمكن حفظ تعليق فارغ أو معرف/معرف المستخدم مفقود.');
      return;
    }

    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const updateCommentApiUrl = `http://roomify0.runasp.net/api/Comments/${comment.id}?userId=${this.currentUser.id}`;
    const updatePayload = {
      content: comment.content.trim()
    };
    console.log('حفظ التعليق:', comment.id, 'بالمحتوى الجديد:', updatePayload.content);
    console.log('عنوان الـ API لتحديث التعليق:', updateCommentApiUrl);

    this.http.put(updateCommentApiUrl, updatePayload, { headers }).subscribe({
      next: (response) => {
        console.log('تم تحديث التعليق بنجاح:', response);
        comment.isEditing = false;
        comment.updatedAt = new Date().toISOString();
      },
      error: (error) => {
        console.error('خطأ في تحديث التعليق:', error);
        alert('فشل في تعديل التعليق: ' + (error.error?.message || JSON.stringify(error.error) || 'خطأ غير معروف.'));
        comment.content = comment.originalContent || comment.content;
        comment.isEditing = false;
      }
    });
  }

  cancelEdit(comment: Comment) {
    comment.content = comment.originalContent || comment.content;
    comment.isEditing = false;
    console.log('تم إلغاء التعديل للتعليق:', comment.id);
  }

  deleteComment(commentId: string | undefined) {
    // ✳️ تأكد أن currentUser.id موجود قبل الحذف
    if (!commentId || !this.currentUser.id) {
      console.warn('لا يمكن حذف التعليق، معرف التعليق أو معرف المستخدم مفقود.');
      return;
    }

    if (!confirm('هل أنت متأكد من أنك تريد حذف هذا التعليق؟')) {
      return;
    }

    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const deleteCommentApiUrl = `http://roomify0.runasp.net/api/Comments/${commentId}?userId=${this.currentUser.id}`;
    console.log('حذف التعليق:', commentId);
    console.log('عنوان الـ API لحذف التعليق:', deleteCommentApiUrl);

    this.http.delete(deleteCommentApiUrl, { headers }).subscribe({
      next: () => {
        console.log('تم حذف التعليق بنجاح.');
        this.comments = this.comments.filter(c => c.id !== commentId);
        console.log('مصفوفة التعليقات المحلية بعد الحذف:', this.comments);
      },
      error: (error) => {
        console.error('خطأ في حذف التعليق:', error);
        alert('فشل في حذف التعليق: ' + (error.error?.message || JSON.stringify(error.error) || 'خطأ غير معروف.'));
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
