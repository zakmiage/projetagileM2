import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  message = signal('Chargement...');

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getHello().subscribe({
      next: (res) => {
        console.log('Réponse API :', res);
        this.message.set(res.message);
      },
      error: (err) => {
        console.error('Erreur API :', err);
        this.message.set('Erreur API');
      }
    });
  }
}