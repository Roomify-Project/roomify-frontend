import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface UserProfile {
  fullName: string;
  userName: string;
  email: string;
  profilePictureUrl: string; // هذا هو الذي سيتم تحديثه ليعرض الصورة الجديدة
  userId?: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  userProfile: UserProfile = {
    fullName: '',
    userName: '',
    email: '',
    profilePictureUrl: '' // سيبدأ فارغًا أو بقيمة من localStorage
  };

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const storedFullName = localStorage.getItem('fullName');
    const storedUserName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('email');
    const storedProfilePictureUrl = localStorage.getItem('profilePictureUrl');
    const storedUserId = localStorage.getItem('userId');

    if (storedFullName) {
      this.userProfile.fullName = storedFullName;
    }
    if (storedUserName) {
      this.userProfile.userName = storedUserName;
    }
    if (storedEmail) {
      this.userProfile.email = storedEmail;
    }
    if (storedProfilePictureUrl) {
      this.userProfile.profilePictureUrl = storedProfilePictureUrl;
    } else {
      this.userProfile.profilePictureUrl = '/assets/default-pro.jpeg'; // صورة افتراضية
    }
    if (storedUserId) {
      this.userProfile.userId = storedUserId;
    }
    console.log('User Profile loaded:', this.userProfile); // للتحقق من القيم في console
  }

  // **هذه هي الدالة المسؤولة عن المعاينة الفورية**
  onProfilePictureSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // **تحديد إذا كان الملف صورة**
      if (!file.type.startsWith('image/')) {
        alert('الرجاء اختيار ملف صورة صالح (JPG, PNG, GIF, إلخ).');
        input.value = ''; // مسح اختيار الملف
        return;
      }

      // **عرض معاينة للصورة باستخدام FileReader**
      const reader = new FileReader();
      reader.onload = () => {
        // تحديث userProfile.profilePictureUrl بـ Data URL للصورة المختارة
        this.userProfile.profilePictureUrl = reader.result as string;
      };
      reader.readAsDataURL(file); // قراءة الملف كـ Data URL

      // هذا الجزء يمثل منطق الرفع الفعلي إلى السيرفر، والذي يجب أن تقوم بتطبيقه لاحقًا.
      // alert('تم اختيار صورة جديدة. (يجب تطبيق منطق الرفع إلى الخادم)');
      console.log('Selected file for upload:', file);
      // يمكنك تخزين الملف الذي تم اختياره في متغير آخر لرفعه لاحقًا عند الضغط على "Save Changes"
      // مثلاً: this.selectedNewProfileFile = file;
    } else {
      // إذا لم يتم اختيار ملف، قد ترغب في إعادة الصورة إلى الافتراضية أو القيمة المخزنة
      // this.loadUserProfile(); // لإعادة تحميل الصورة الأصلية أو الافتراضية
    }
  }

  saveChanges() {
    alert('Saving Changes (منطق حفظ التغييرات يجب أن يطبق)');
    console.log('User Profile to save:', this.userProfile);
    // إذا كنت قد قمت بتخزين الملف المختار في this.selectedNewProfileFile
    // فعليك هنا استدعاء دالة لرفع هذا الملف إلى السيرفر.
    // مثال: this.uploadProfilePicture(this.selectedNewProfileFile);
    // بعد الرفع الناجح، يمكنك تحديث localStorage بمسار الصورة الجديدة.
  }

  goToSettings() {
    this.router.navigate(['/changepass']);
  }

  goHome() {
    this.router.navigate(['/profile']);
  }
}
