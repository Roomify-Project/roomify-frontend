import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundComponent } from '../../background/background.component';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RoomImageService } from '../../services/room-image.service';

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
  }

  selectDesignStyle(style: any) {
    this.selectedDesignStyle = style.name;
    this.designStyle = style.name;
  }

  generateDesign() {
    if (!this.promptText.trim()) return;

    this.isLoading = true;
    this.roomImageService.generateDesign(this.promptText, this.roomType, this.designStyle)
      .subscribe({
        next: (res: any) => {
          this.generatedImageUrl = res?.imageUrl;
          this.isLoading = false;
        },
        error: err => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }
}
