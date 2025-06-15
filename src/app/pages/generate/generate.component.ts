import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundComponent } from '../../background/background.component';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RoomImageService } from '../../services/room-image.service';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // ✳️ تم استيراد DomSanitizer للتعامل مع مسارات الصور المحلية

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
  // ✳️ تم تغيير generatedImageUrl إلى مصفوفة لتخزين الروابط المتعددة
  generatedImageUrls: string[] = [];
  // ✳️ متغير جديد لتخزين URL الصورة الأصلية التي تم رفعها
  originalUploadedImageUrl: SafeUrl | null = null;
  isLoading = false;

  selectedFile: File | null = null;
  userId: string = '';

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

  constructor(
    private roomImageService: RoomImageService,
    private authService: AuthService,
    private sanitizer: DomSanitizer // ✳️ حقن DomSanitizer
  ) { }

  ngOnInit(): void {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.userId = storedUserId;
    } else {
      console.warn('User ID not found in localStorage. User might not be logged in or userId was not stored.');
      alert('You are not logged in. Please log in to generate designs.');
      // يمكنك هنا إضافة منطق لإعادة توجيه المستخدم لصفحة تسجيل الدخول باستخدام Router
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
      // ✳️ عرض معاينة للصورة التي تم رفعها محليًا
      const reader = new FileReader();
      reader.onload = () => {
        this.originalUploadedImageUrl = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = null;
      this.originalUploadedImageUrl = null;
    }
  }

  generateDesign() {
    // ✳️ إعادة تعيين الصور الناتجة والصورة الأصلية من الرفع في كل عملية توليد جديدة
    this.generatedImageUrls = [];
    // originalUploadedImageUrl لا يتم مسحها هنا، بل في onFileSelected إذا لم يتم اختيار ملف

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
    if (!this.userId) {
        alert('User ID is not available. Please ensure you are logged in.');
        this.isLoading = false; // تأكد من إيقاف حالة التحميل
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
    formData.append('userId', this.userId);

    this.roomImageService.generateDesign(formData)
      .subscribe({
        next: (res: any) => {
          // ✳️ عرض الصورة الأصلية التي جاءت من الـ API (إذا كانت موجودة)
          if (res && res.originalRoomImage) {
            // إذا كان الـ API يرجع رابط للصورة الأصلية، استخدمه
            this.originalUploadedImageUrl = res.originalRoomImage;
          } else if (this.selectedFile) {
            // وإلا، حافظ على الصورة التي تم رفعها محليًا للمعاينه
            // (تم التعامل معها بالفعل في onFileSelected)
          } else {
            this.originalUploadedImageUrl = null; // لا يوجد لا صورة مرفوعة ولا صورة من الـ API
          }

          // ✳️ تخزين الروابط المولدة في مصفوفة
          if (res && res.generatedImageUrls && res.generatedImageUrls.length > 0) {
            this.generatedImageUrls = res.generatedImageUrls;
          } else {
            console.warn('API response did not contain expected generated image URLs. Response:', res);
            this.generatedImageUrls = [];
            // alert('Could not retrieve generated image URLs from API response.');
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

  downloadImage(imageUrl: string) { // ✳️ تم تعديل الدالة لتقبل رابط الصورة المراد تحميلها
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      // استخراج اسم الملف من الرابط أو استخدام اسم افتراضي
      const fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1) || `room_design_${Date.now()}.png`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
