import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundComponent } from '../../background/background.component';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RoomImageService } from '../../services/room-image.service'; // تأكد من المسار الصحيح لخدمتك

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
export class GenerateComponent {
  showSidebar = false;
  promptText = '';
  roomType = '';
  designStyle = '';
  generatedImageUrl = '';
  isLoading = false;

  // لإدارة الصورة المرفوعة
  selectedFile: File | null = null;
  // هذا معرف المستخدم. في تطبيق حقيقي، ستحصل عليه ديناميكيًا من خدمة المصادقة.
  // مثال: userId: string = this.authService.getCurrentUserId();
  userId: string = 'your-actual-user-id-here'; // **هام: استبدل هذا بمعرف المستخدم الفعلي من نظام المصادقة الخاص بك**

  // Room Type
  selectedRoomType: string = '';
  showRoomTypeMenu: boolean = false;

  roomTypes = [
    { name: 'Null', img: 'assets/roomtypes/null.png' },
    { name: 'Bedroom', img: 'assets/roomtypes/bedroom.png' },
    { name: 'Living Room', img: 'assets/roomtypes/livingroom.png' },
    { name: 'Kitchen', img: 'assets/roomtypes/kitchen.png' },
    { name: 'Office', img: 'assets/roomtypes/office.png' },
    { name: 'Bathroom', img: 'assets/roomtypes/bathroom.png' }
  ];

  // Design Style
  selectedDesignStyle: string = '';
  showDesignStyleMenu: boolean = false;

  designStyles = [
    { name: 'Null', img: 'assets/designstyles/null.png' },
    { name: 'Classic', img: 'assets/designstyles/classic.png' },
    { name: 'Modern', img: 'assets/designstyles/modern.png' },
    { name: 'Minimalist', img: 'assets/designstyles/minimalist.png' }
  ];

  constructor(private roomImageService: RoomImageService) {}

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
    this.toggleRoomTypeMenu(); // إغلاق القائمة بعد الاختيار
  }

  selectDesignStyle(style: any) {
    this.selectedDesignStyle = style.name;
    this.designStyle = style.name;
    this.toggleDesignStyleMenu(); // إغلاق القائمة بعد الاختيار
  }

  // دالة تُستدعى عند اختيار ملف صورة
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }

  generateDesign() {
    // يمكنك إضافة شروط هنا إذا كانت بعض الحقول إلزامية قبل التوليد
    // مثلاً: if (!this.promptText.trim() || !this.roomType) { return; }

    this.isLoading = true;

    // إنشاء كائن FormData لإرسال الملف والبيانات الأخرى
    const formData = new FormData();

    // 1. إضافة الصورة إلى FormData إذا تم اختيارها
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }
    // 2. إضافة البيانات النصية
    formData.append('descriptionText', this.promptText);
    formData.append('roomType', this.roomType);
    formData.append('roomStyle', this.designStyle);
    formData.append('userId', this.userId); // **هام: تأكد من أن هذا الـ userId صحيح وديناميكي في تطبيقك الحقيقي**

    // استدعاء خدمة RoomImageService لإرسال البيانات إلى الـ API
    this.roomImageService.generateDesign(formData)
      .subscribe({
        next: (res: any) => {
          // تأكد أن الـ API يرجع حقل اسمه 'imageUrl' بالصورة المولدة
          this.generatedImageUrl = res?.imageUrl;
          this.isLoading = false;
        },
        error: err => {
          console.error('Error generating design:', err);
          this.isLoading = false;
          // يمكنك عرض رسالة خطأ واضحة للمستخدم هنا
        }
      });
  }

  // دالة لتنزيل الصورة التي تم إنشاؤها
  downloadImage() {
    if (this.generatedImageUrl) {
      const link = document.createElement('a');
      link.href = this.generatedImageUrl;
      link.download = 'room_design.png'; // اسم الملف عند التنزيل
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
