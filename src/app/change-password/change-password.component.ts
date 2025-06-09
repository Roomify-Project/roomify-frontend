import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // ✅ استيراد Router

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule , CommonModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  showModal = true;

  oldPassword = '';
  newPassword = '';

  constructor(private router: Router) {} // ✅ حقن الـ Router

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  confirmChange() {
    console.log('Old:', this.oldPassword);
    console.log('New:', this.newPassword);

    // ✅ التوجيه إلى صفحة settings
    this.router.navigate(['/settings']);
  }
}
