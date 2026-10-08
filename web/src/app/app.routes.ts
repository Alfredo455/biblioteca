import { Routes } from '@angular/router';
import { authGuard } from './auth.service';
import { BooksPage } from './books.page';
import { LoginPage } from './login.page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'books', component: BooksPage, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'books' },
  { path: '**', redirectTo: 'books' },
];
