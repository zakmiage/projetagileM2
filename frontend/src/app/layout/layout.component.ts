import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  pageTitle = 'Tableau de bord';

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      if (url.includes('/events')) this.pageTitle = 'Événements';
      else if (url.includes('/members')) this.pageTitle = 'Annuaire';
      else if (url.includes('/settings')) this.pageTitle = 'Paramètres';
      else if (url.includes('/dashboard')) this.pageTitle = 'Tableau de bord';
      else this.pageTitle = 'Espace de gestion';
    });
  }

  logout() {
    this.authService.logout();
  }
}
