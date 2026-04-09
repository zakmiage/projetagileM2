import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  
  errorMsg = '';
  forgotSuccessMsg = '';
  isLoading = false;
  viewMode: 'login' | 'forgot' = 'login';

  toggleView() {
    this.viewMode = this.viewMode === 'login' ? 'forgot' : 'login';
    this.errorMsg = '';
    this.forgotSuccessMsg = '';
  }

  onSubmit() {
    this.errorMsg = '';
    if (this.viewMode === 'login') {
      this.doLogin();
    } else {
      this.doForgot();
    }
  }

  private doLogin() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.authService.login(this.email, this.password)) {
      // Connecté avec succès
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMsg = 'Identifiants incorrects.';
    }
  }

  private doForgot() {
    if (!this.email) {
      this.errorMsg = 'Veuillez saisir votre adresse email.';
      return;
    }

    this.isLoading = true;
    this.authService.forgotPassword(this.email).then(() => {
      this.isLoading = false;
      this.forgotSuccessMsg = 'Un e-mail contenant votre mot de passe vous a été envoyé !';
    });
  }
}
