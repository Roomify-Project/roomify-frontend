import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';



@Component({
  selector: 'app-navbar',
  standalone: true ,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

}
