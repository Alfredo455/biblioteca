import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="submit()" class="card">
      <h1>Biblioteca</h1>
      <input name="email" type="email" placeholder="Email" [(ngModel)]="email" required />
      <input name="password" type="password" placeholder="Contraseña (mín. 8)" [(ngModel)]="password" required minlength="8" />
      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
      <div class="row">
        <button type="submit">Entrar</button>
        <button type="button" class="secondary" (click)="signUp()">Crear cuenta</button>
      </div>
    </form>
  `,
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = '';
  password = '';
  error = signal('');

  private fail = (e: { error?: { message?: string | string[] } }) => {
    const m = e.error?.message;
    this.error.set(Array.isArray(m) ? m.join(', ') : (m ?? 'No se pudo conectar'));
  };

  submit() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl('/books'),
      error: this.fail,
    });
  }

  signUp() {
    this.auth.register(this.email, this.password).subscribe({ next: () => this.submit(), error: this.fail });
  }
}
