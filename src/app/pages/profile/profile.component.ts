import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "../../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
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

// واجهة جديدة لاستقبال بيانات أعداد المتابعين
interface FollowCounts {
  followers: number;
  following: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterModule, NavbarComponent , CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  userName: string = 'User Name';
  role: string = 'InteriorDesigner';
  posts: PortfolioPost[] = [];
  isHeartLiked: boolean = false;
  selectedPostId: string | null = null;
  showOptions: boolean = false;
  // خصائص جديدة لتخزين أعداد المتابعين ومن يتابعهم
  followersCount: number = 0;
  followingCount: number = 0;

  private http = inject(HttpClient);
  private postRefreshService = inject(PostRefreshService);
  private postRefreshSubscription!: Subscription;

  ngOnInit() {
    this.loadUserProfileAndPosts();
    this.postRefreshSubscription = this.postRefreshService.postUploaded$.subscribe(() => {
      this.loadUserProfileAndPosts();
    });
  }

  ngOnDestroy() {
    if (this.postRefreshSubscription) {
      this.postRefreshSubscription.unsubscribe();
    }
  }

  loadUserProfileAndPosts() {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      this.userName = storedUserName;
    } else {
      console.warn('اسم المستخدم غير موجود في localStorage. يرجى التأكد من تسجيل الدخول أولاً.');
    }

    const token = localStorage.getItem('token') || '';
    const userId = localStorage.getItem('userId'); // جلب الـ userId من localStorage

    if (userId && token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      // جلب منشورات المستخدم
      this.http.get<PortfolioPost[]>(
        `http://roomify.runasp.net/api/PortfolioPost/by-user/${userId}`,
        { headers }
      ).subscribe({
        next: (res) => {
          this.posts = res;
          console.log('البيانات المستلمة (المنشورات):', this.posts);
        },
        error: (err) => {
          console.error('حدث خطأ في تحميل الصور:', err);
        }
      });

      // جلب أعداد المتابعين ومن يتابعهم
      this.http.get<FollowCounts>(
        `http://roomify.runasp.net/api/follow/counts/${userId}`, // استخدام الـ userId في رابط الـ API
        { headers }
      ).subscribe({
        next: (res) => {
          this.followersCount = res.followers;
          this.followingCount = res.following;
          console.log('أعداد المتابعين المستلمة:', res);
        },
        error: (err) => {
          console.error('حدث خطأ أثناء جلب أعداد المتابعين:', err);
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
    const deleteUrl = `http://roomify.runasp.net/api/PortfolioPost/${this.selectedPostId}`;

    if (confirm('هل أنت متأكد أنك تريد حذف هذا البوست؟')) {
      this.http.delete(deleteUrl, { headers }).subscribe({
        next: (res) => {
          console.log('تم حذف البوست بنجاح:', res);
          alert('تم حذف البوست بنجاح.');
          this.posts = this.posts.filter(post => post.id !== this.selectedPostId);
          this.selectedPostId = null;
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
