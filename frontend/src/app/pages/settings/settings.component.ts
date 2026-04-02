import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  
  successMessage = '';
  errorMessage = '';
  isSaving = false;

  changePassword() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = "Veuillez remplir tous les champs.";
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = "Les nouveaux mots de passe ne correspondent pas.";
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = "Le nouveau mot de passe doit faire au moins 6 caractères.";
      return;
    }

    this.isSaving = true;
    // Simulate API call
    setTimeout(() => {
      this.isSaving = false;
      this.successMessage = "Votre mot de passe a bien été mis à jour.";
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    }, 800);
  }
}
