import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit {
  fullText = 'Smart, elegant, and personalized room ideas – powered by AI.';
  displayedText = '';
  currentIndex = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startTyping();

    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 5000); // خلي وقت النقل بعد انتهاء الكتابة
  }

  startTyping(): void {
    const typingSpeed = 50; // سرعة الكتابة (كل 50ms)

    const typeChar = () => {
      if (this.currentIndex < this.fullText.length) {
        this.displayedText += this.fullText[this.currentIndex];
        this.currentIndex++;
        setTimeout(typeChar, typingSpeed);
      }
    };

    typeChar();
  }
}
