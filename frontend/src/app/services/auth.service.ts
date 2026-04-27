import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_KEY = 'kubik_auth_session';

  constructor(private router: Router) { }

  // Vérifie les identifiants en dur pour le prototype
  login(email: string, password: string): boolean {
    if (email === 'toto@mail.com' && password === 'toto') {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 1); // 1 jour de session
      
      const sessionData = {
        email,
        role: 'ADMIN', // toto est admin — accès complet à toutes les fonctionnalités
        expiresAt: expirationDate.getTime()
      };
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.AUTH_KEY, JSON.stringify(sessionData));
      }
      return true;
    }
    return false;
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.AUTH_KEY);
    }
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    const sessionStr = localStorage.getItem(this.AUTH_KEY);
    if (!sessionStr) {
      return false;
    }

    try {
      const sessionData = JSON.parse(sessionStr);
      const now = new Date().getTime();
      
      if (now > sessionData.expiresAt) {
        this.logout(); // Session expirée
        return false;
      }
      
      return true;
    } catch (e) {
      return false;
    }
  }

  // Simule l'envoi d'email pour l'oubli de mot de passe
  forgotPassword(email: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Dans la vraie vie, requete XHR HTTP client...
        resolve(true);
      }, 800);
    });
  }

  /** Retourne le rôle de l'utilisateur connecté (hardcodé TRESORIER en attendant l'auth réelle). */
  getRole(): string {
    if (typeof localStorage === 'undefined') return 'BUREAU';
    const sessionStr = localStorage.getItem(this.AUTH_KEY);
    if (!sessionStr) return 'BUREAU';
    try {
      const sessionData = JSON.parse(sessionStr);
      return sessionData.role ?? 'BUREAU';
    } catch {
      return 'BUREAU';
    }
  }

  /** Retourne true si le rôle actuel fait partie de la liste fournie. */
  hasRole(...roles: string[]): boolean {
    return roles.includes(this.getRole());
  }
}
