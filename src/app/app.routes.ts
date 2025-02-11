import { OtherDesignsComponentComponent } from './other-designs-component/other-designs-component.component';
import { CreateRoomComponentComponent } from './create-room-component/create-room-component.component';
import { ProfileComponentComponent } from './profile-component/profile-component.component';
import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RouterModule} from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [


  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponentComponent },
  { path: 'create-room', component: CreateRoomComponentComponent },
  { path: 'other-designs', component: OtherDesignsComponentComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }

];
