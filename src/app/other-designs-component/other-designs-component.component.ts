import { BottomNavigationComponent } from './../bottom-navigation/bottom-navigation.component';
import { Component } from '@angular/core';
import { HomeComponent } from "../home/home.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-other-designs-component',
  standalone: true,
  imports: [BottomNavigationComponent , CommonModule],
  templateUrl: './other-designs-component.component.html',
  styleUrl: './other-designs-component.component.css'
})
export class OtherDesignsComponentComponent {
  rooms = [
    {
      image: 'assets/room1.jpg',
      userAvatar: 'assets/user1.jpg'
    },
    {
      image: 'assets/room1.jpg',
      userAvatar: 'assets/user1.jpg'
    },
    {
      image: 'assets/room1.jpg',
      userAvatar: 'assets/user1.jpg'
    },
    {
      image: 'assets/room1.jpg',
      userAvatar: 'assets/user1.jpg'
    },
    {
      image: 'assets/room1.jpg',
      userAvatar: 'assets/user1.jpg'
    },

  ];
}
