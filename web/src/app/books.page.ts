import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { API, AuthService } from './auth.service';

interface Book {
  _id: string;
  title: string;
  author: string;
  available: number;
  copies: number;
}

@Component({
  selector: 'app-books',
  imports: [FormsModule],
  template: `
    <header class="row">
      <h1>Catálogo</h1>
      <button class="secondary" (click)="logout()">Salir</button>
    </header>
    <input placeholder="Buscar por título…" [(ngModel)]="query" (ngModelChange)="load()" />
    @if (message()) {
      <p class="notice">{{ message() }}</p>
    }
    <ul class="card list">
      @for (b of books(); track b._id) {
        <li class="row">
          <span>
            <strong>{{ b.title }}</strong> · {{ b.author }}
            <small>({{ b.available }}/{{ b.copies }} disponibles)</small>
          </span>
          <button [disabled]="b.available === 0" (click)="borrow(b)">Pedir prestado</button>
        </li>
      } @empty {
        <li>Sin resultados</li>
      }
    </ul>
  `,
})
export class BooksPage implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  books = signal<Book[]>([]);
  message = signal('');
  query = '';

  ngOnInit() {
    this.load();
  }

  load() {
    this.http.get<Book[]>(`${API}/books`, { params: this.query ? { q: this.query } : {} }).subscribe({
      next: (b) => this.books.set(b),
      error: (e) => (e.status === 401 ? this.logout() : this.message.set('Error al cargar')),
    });
  }

  borrow(book: Book) {
    this.http.post(`${API}/loans/borrow/${book._id}`, {}).subscribe({
      next: () => {
        this.message.set(`Prestado: ${book.title} (14 días)`);
        this.load();
      },
      error: (e) => this.message.set(e.error?.message ?? 'No se pudo pedir prestado'),
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
