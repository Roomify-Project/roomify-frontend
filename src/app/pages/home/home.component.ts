import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { PostsService } from './../../services/posts.service';
import { Component, OnInit } from '@angular/core';
import type { Post } from '../../services/posts.service';
import { BackgroundComponent } from "../../background/background.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule, BackgroundComponent],
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];

  constructor(private postsService: PostsService) {}

  ngOnInit(): void {
    // ✳️ استمع للتغييرات في البوستات من الخدمة
    this.postsService.posts$.subscribe((res) => {
      this.posts = res;
      console.log('HomeComponent received updated posts:', this.posts);
    });

    // ✳️ تأكد إنك بتعمل جلب للبوستات أول مرة لما الكومبوننت يتحمل
    // ده مهم عشان لو مفيش أي كومبوننت تاني عمل تحديث قبل ما الـ HomeComponent يشتغل
    this.postsService.getAllPosts().subscribe(); // مجرد subscribe عشان ينفذ الـ tap ويحدث الـ BehaviorSubject
  }
}
