import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngFor
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink

// Define an interface for the following user data
interface FollowingUser {
  id: string; // The ID of the user being followed
  userName: string; // The user's username
  email: string; // The user's email
  role: string; // The user's role (e.g., "Interior Designer")
  profilePicture: string | null; // URL to the user's profile picture
}

@Component({
  selector: 'app-following',
  standalone: true, // Mark as standalone
  imports: [CommonModule, RouterModule], // Add CommonModule and RouterModule here
  templateUrl: './following.component.html',
  styleUrl: './following.component.css'
})
export class FollowingComponent implements OnInit {
  followingUsers: FollowingUser[] = []; // Array to store the fetched following users
  private http = inject(HttpClient); // Inject HttpClient

  ngOnInit(): void {
    this.getFollowingUsers(); // Call the method to fetch following users when the component initializes
  }

  getFollowingUsers(): void {
    const userId = localStorage.getItem('userId'); // Get the current user's ID from localStorage
    const token = localStorage.getItem('token'); // Get the authentication token from localStorage

    if (!userId || !token) {
      console.error('User ID or token not found in localStorage. Please log in.');
      // Optionally, redirect to login page
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<FollowingUser[]>(`http://roomify0.runasp.net/api/follow/following/${userId}`, { headers })
      .subscribe({
        next: (data) => {
          this.followingUsers = data; // Assign the fetched data to the followingUsers array
          console.log('Following users data:', this.followingUsers);
        },
        error: (error) => {
          console.error('Error fetching following users:', error);
          // Handle error (e.g., display an error message to the user)
        }
      });
  }
}
