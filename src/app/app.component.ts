import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackgroundComponent } from "./background/background.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { FormsModule } from '@angular/forms';

// ✳️ استيراد وحدات الأنيميشن
import {
  trigger,
  transition,
  style,
  query,
  group,
  animate,
} from '@angular/animations';

// ✳️ تعريف الأنيميشن: تأثير slide-in/slide-out بسيط
export const slideInAnimation =
  trigger('routeAnimations', [
    // الانتقال من أي صفحة لأي صفحة أخرى
    transition('* <=> *', [
      // تحديد أن العناصر الداخلة والخارجة يجب أن تكون في موضع مطلق لتجنب مشاكل التخطيط
      query(':enter, :leave',
        style({ position: 'absolute', width: '100%', overflow: 'hidden' }), // إضافة overflow: 'hidden' لمنع ظهور شريط التمرير أثناء الأنيميشن
        { optional: true }),
      group([
        // حركة الصفحة الداخلة (entering)
        query(':enter', [
          style({ transform: 'translateX(100%)' }), // تبدأ من خارج الشاشة على اليمين
          animate('0.6s ease-out', style({ transform: 'translateX(0%)' })) // تتحرك لليسار في 0.6 ثانية
        ], { optional: true }),
        // حركة الصفحة الخارجة (leaving)
        query(':leave', [
          style({ transform: 'translateX(0%)' }), // تبدأ من مكانها الحالي
          animate('0.6s ease-out', style({ transform: 'translateX(-100%)' })) // تتحرك لليسار وتخرج في 0.6 ثانية
        ], { optional: true })
      ])
    ])
  ]);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, BackgroundComponent, NavbarComponent], // ✳️ تأكد من وجود NavbarComponent هنا إذا كانت تستخدم في الـ app.component.html
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [ slideInAnimation ] // ✳️ إضافة الأنيميشن هنا
})
export class AppComponent {
  title = 'Roomify';

  // ✳️ دالة لجلب حالة الأنيميشن للـ Router Outlet
  // هذه الدالة ستحتاج 'data' في الـ routes لتحديد الأنيميشن لكل صفحة
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
