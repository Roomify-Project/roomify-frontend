import { CommonModule } from '@angular/common';
import { BottomNavigationComponent } from './../bottom-navigation/bottom-navigation.component';
import { RouterModule } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [RouterModule , BottomNavigationComponent , CommonModule],
})
export class HomeComponent {
  

  goToProfile() {
    // الانتقال إلى صفحة الملف الشخصي
    console.log('Profile clicked');
  }

  createRoom() {
    // الانتقال إلى صفحة إنشاء تصميم جديد
    console.log('Create Room clicked');
  }

  viewOtherDesigns() {
    // عرض تصاميم الغرف الأخرى
    console.log('View Other Designs clicked');
  }
}
