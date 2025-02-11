import { HomeComponent } from './../home/home.component';
import { BottomNavigationComponent } from './../bottom-navigation/bottom-navigation.component';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-component',
  standalone: true,
  imports: [BottomNavigationComponent , FormsModule , CommonModule],
  templateUrl: './profile-component.component.html',
  styleUrl: './profile-component.component.css'
})
export class ProfileComponentComponent {
  isPasswordModalOpen: boolean = false; // حالة النافذة (مفتوحة/مغلقة)
  oldPassword: string = ''; // كلمة المرور القديمة
  newPassword: string = ''; // كلمة المرور الجديدة
  confirmNewPassword: string = ''; // تأكيد كلمة المرور الجديدة

  togglePasswordModal() {
    this.isPasswordModalOpen = !this.isPasswordModalOpen;
  }


    // وظيفة لتغيير كلمة المرور
    handleChangePassword() {
      if (this.newPassword !== this.confirmNewPassword) {
        alert('New passwords do not match!');
        return;
      }

       // منطق تغيير كلمة المرور
    console.log('Old Password:', this.oldPassword);
    console.log('New Password:', this.newPassword);

    // بعد الحفظ، أغلق النافذة
    this.togglePasswordModal();
  }
}
