import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundComponent } from '../../background/background.component';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RoomImageService } from '../../services/room-image.service';
import { AuthService } from '../../services/auth.service'; // **تم استيراد AuthService**

@Component({
  selector: 'app-generate',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    BackgroundComponent,
    NavbarComponent
  ],
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.css']
})
export class GenerateComponent implements OnInit {
  showSidebar = false;
  promptText = '';
  roomType = '';
  designStyle = '';
  generatedImageUrl = '';
  isLoading = false;

  selectedFile: File | null = null;
  userId: string = ''; // سيتم جلبها من AuthService

  selectedRoomType: string = '';
  showRoomTypeMenu: boolean = false;

  roomTypes = [
    { name: 'Null', img: 'assets/roomtypes/null.png' },
    { name: 'Bedroom', img: 'assets/roomtypes/bedroom.png' },
    { name: 'LivingRoom', img: 'assets/roomtypes/livingroom.png' },
    { name: 'Kitchen', img: 'assets/roomtypes/kitchen.png' },
    { name: 'Office', img: 'assets/roomtypes/office.png' },
    { name: 'Bathroom', img: 'assets/roomtypes/bathroom.png' }
  ];

  selectedDesignStyle: string = '';
  showDesignStyleMenu: boolean = false;

  designStyles = [
    { name: 'Null', img: 'assets/designstyles/null.png' },
    { name: 'Classic', img: 'assets/designstyles/classic.png' },
    { name: 'Modern', img: 'assets/designstyles/modern.png' },
    { name: 'Minimalist', img: 'assets/designstyles/minimalist.png' }
  ];

  // **حقن AuthService في الـ constructor**
  constructor(private roomImageService: RoomImageService, private authService: AuthService) { }

  ngOnInit(): void {
    // **جلب الـ userId من localStorage باستخدام AuthService**
    // نفترض أن AuthService يقوم بحفظ الـ userId في localStorage بعد تسجيل الدخول
    // تحتاج للتأكد من أن الـ userId يتم حفظه في localStorage بواسطة AuthService عند تسجيل الدخول
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.userId = storedUserId;
    } else {
      console.warn('User ID not found in localStorage. User might not be logged in or userId was not stored.');
      // يمكنك هنا إضافة منطق لإعادة توجيه المستخدم لصفحة تسجيل الدخول
      // أو عرض رسالة خطأ
      alert('You are not logged in. Please log in to generate designs.');
      // مثال لإعادة التوجيه (يتطلب Router):
      // import { Router } from '@angular/router';
      // constructor(..., private router: Router) { }
      // this.router.navigate(['/login']);
    }
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  toggleRoomTypeMenu() {
    this.showRoomTypeMenu = !this.showRoomTypeMenu;
  }

  toggleDesignStyleMenu() {
    this.showDesignStyleMenu = !this.showDesignStyleMenu;
  }

  selectRoomType(type: any) {
    this.selectedRoomType = type.name;
    this.roomType = type.name;
    this.toggleRoomTypeMenu();
  }

  selectDesignStyle(style: any) {
    this.selectedDesignStyle = style.name;
    this.designStyle = style.name;
    this.toggleDesignStyleMenu();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }

  generateDesign() {
    // التحقق من الحقول المطلوبة قبل الإرسال
    if (!this.promptText.trim() && !this.selectedFile) {
      alert('Please provide a description or upload an image.');
      return;
    }
    if (!this.roomType || this.roomType === 'Null') {
        alert('Please select a room type.');
        return;
    }
    if (!this.designStyle || this.designStyle === 'Null') {
        alert('Please select a design style.');
        return;
    }
    // **التحقق من وجود userId قبل الإرسال**
    if (!this.userId) {
        alert('User ID is not available. Please ensure you are logged in.');
        this.isLoading = false;
        return;
    }


    this.isLoading = true;
    const formData = new FormData();

    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }
    formData.append('descriptionText', this.promptText);
    formData.append('roomType', this.roomType);
    formData.append('roomStyle', this.designStyle);
    formData.append('userId', this.userId); // **سيتم إرسال معرف المستخدم الذي تم جلبه من localStorage**

    this.roomImageService.generateDesign(formData)
      .subscribe({
        next: (res: any) => {
          if (res && res.originalRoomImage) {
            this.generatedImageUrl = res.originalRoomImage;
          } else if (res && res.generatedImageUrls && res.generatedImageUrls.length > 0) {
            this.generatedImageUrl = res.generatedImageUrls[0];
          } else {
            console.warn('API response did not contain expected image URL. Response:', res);
            this.generatedImageUrl = '';
            alert('Could not retrieve generated image URL from API response. Please check API response structure.');
          }
          this.isLoading = false;
        },
        error: err => {
          console.error('Error generating design:', err);
          this.isLoading = false;
          alert('Failed to generate design. Please check your network connection and try again. Error: ' + (err.message || 'Unknown error'));
        }
      });
  }

  downloadImage() {
    if (this.generatedImageUrl) {
      const link = document.createElement('a');
      link.href = this.generatedImageUrl;
      link.download = `room_design_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
