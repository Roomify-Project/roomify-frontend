import { Component, OnInit, OnDestroy, inject } from '@angular/core'; // **أضف OnDestroy**
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "../../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs'; // **لاستخدام الاشتراك وإلغائه**
import { PostRefreshService } from '../../services/post-refresh.service';

interface PortfolioPost {
  id: string;
  imagePath: string;
  description: string;
  createdAt: string;
  applicationUserId: string;
  ownerUserName: string | null;
  ownerProfilePicture: string | null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterModule, NavbarComponent , CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy { // **طبق الواجهة OnDestroy**
  userName: string = 'User Name';
  role: string = 'InteriorDesigner';
  posts: PortfolioPost[] = [];
  isHeartLiked: boolean = false;
  selectedPostId: string | null = null;
  showOptions: boolean = false;

  private http = inject(HttpClient);
  private postRefreshService = inject(PostRefreshService); // **حقن (Inject) الخدمة الجديدة**
  private postRefreshSubscription!: Subscription; // **متغير للاحتفاظ بالاشتراك**

  ngOnInit() {
    this.loadUserProfileAndPosts(); // تحميل البيانات الأولية عند بدء تشغيل المكون

    // **الاشتراك في إشعارات رفع المنشورات**
    this.postRefreshSubscription = this.postRefreshService.postUploaded$.subscribe(() => {
      this.loadUserProfileAndPosts(); // إعادة جلب المنشورات عند تلقي إشعار
    });
  }

  // **دالة ngOnDestroy لتنظيف الاشتراك ومنع تسرب الذاكرة**
  ngOnDestroy() {
    if (this.postRefreshSubscription) {
      this.postRefreshSubscription.unsubscribe(); // إلغاء الاشتراك عند تدمير المكون
    }
  }

  // **دالة جديدة لجلب بيانات المستخدم والمنشورات**
  loadUserProfileAndPosts() {
    // جلب اسم المستخدم من localStorage
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      this.userName = storedUserName;
    } else {
      console.warn('اسم المستخدم غير موجود في localStorage. يرجى التأكد من تسجيل الدخول أولاً.');
    }

    const token = localStorage.getItem('token') || '';
    // **** التعديل الرئيسي هنا: جلب الـ userId من localStorage ****
    const userId = localStorage.getItem('userId');

    if (userId && token) { // التأكد إن الـ userId موجود قبل ما تعمل الـ request
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.get<PortfolioPost[]>(
        `http://roomify0.runasp.net/api/PortfolioPost/by-user/${userId}`, // استخدام الـ userId اللي تم جلبه من localStorage
        { headers }
      ).subscribe({
        next: (res) => {
          this.posts = res;
          console.log('البيانات المستلمة:', this.posts);
          // هنا مش محتاجين نعتمد على ownerUserName من البوستات طالما جبناه من localStorage
        },
        error: (err) => {
          console.error('حدث خطأ في تحميل الصور:', err);
        }
      });
    } else {
      console.warn('توكن أو معرف المستخدم غير موجود. الرجاء تسجيل الدخول.');
    }
  }

  toggleHeartLike() {
    this.isHeartLiked = !this.isHeartLiked;
  }

  toggleOptions(postId: string) {
    if (this.selectedPostId === postId) {
      this.showOptions = !this.showOptions;
    } else {
      this.selectedPostId = postId;
      this.showOptions = true;
    }
  }

  downloadImage() {
    if (this.selectedPostId) {
      const postToDownload = this.posts.find(p => p.id === this.selectedPostId);
      if (postToDownload && postToDownload.imagePath) {
        window.open(postToDownload.imagePath, '_blank');
      } else {
        console.warn('مسار الصورة غير موجود للتنزيل.');
        alert('لا يمكن تنزيل هذه الصورة حالياً.');
      }
    } else {
      console.warn('لم يتم تحديد بوست لتنزيله.');
    }
    this.showOptions = false;
  }

  saveImage() {
    if (this.selectedPostId) {
      console.log('جاري حفظ الصورة للبوست صاحب الـ ID:', this.selectedPostId);
      alert('تم حفظ الصورة في المفضلة (وظيفة وهمية).');
    } else {
      console.warn('لم يتم تحديد بوست لحفظه.');
    }
    this.showOptions = false;
  }

  deleteImage() {
    if (!this.selectedPostId) {
      console.warn('لم يتم تحديد بوست لحذفه.');
      return;
    }

    const token = localStorage.getItem('token') || '';
    if (!token) {
      alert('لا يوجد توكن مصادقة. الرجاء تسجيل الدخول.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const deleteUrl = `http://roomify0.runasp.net/api/PortfolioPost/${this.selectedPostId}`;

    if (confirm('هل أنت متأكد أنك تريد حذف هذا البوست؟')) {
      this.http.delete(deleteUrl, { headers }).subscribe({
        next: (res) => {
          console.log('تم حذف البوست بنجاح:', res);
          alert('تم حذف البوست بنجاح.');
          // بعد الحذف، أزل المنشور من القائمة محلياً
          this.posts = this.posts.filter(post => post.id !== this.selectedPostId);
          this.selectedPostId = null;
          // **أخبر الخدمة بأن المنشورات قد تغيرت (للتأكد من التناسق)**
          this.postRefreshService.notifyPostUploaded();
        },
        error: (err) => {
          console.error('حدث خطأ أثناء حذف البوست:', err);
          alert('فشل حذف البوست: ' + (err.error?.message || 'خطأ غير معروف'));
        }
      });
    }
    this.showOptions = false;
  }
}
