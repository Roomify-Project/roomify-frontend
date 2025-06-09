import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "../../navbar/navbar.component";
import { CommonModule } from '@angular/common';

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
export class ProfileComponent implements OnInit {
  userName: string = 'User Name'; // قيمة مبدئية، سيتم تحديثها من localStorage
  role: string = 'InteriorDesigner'; // ممكن تجيبها من localStorage لو الـ API بيرجعها
  posts: PortfolioPost[] = [];
  isHeartLiked: boolean = false;
  selectedPostId: string | null = null;
  showOptions: boolean = false;

  private http = inject(HttpClient);

  ngOnInit() {
    // جلب اسم المستخدم من localStorage
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      this.userName = storedUserName;
    } else {
      console.warn('اسم المستخدم غير موجود في localStorage. يرجى التأكد من تسجيل الدخول أولاً.');
      // هنا ممكن تضيف توجيه لصفحة تسجيل الدخول لو اسم المستخدم مش موجود
      // this.router.navigate(['/login']); // لو عندك Router service هنا
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
          this.posts = this.posts.filter(post => post.id !== this.selectedPostId);
          this.selectedPostId = null;
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
