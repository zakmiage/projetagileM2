import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-text">Paramètres L'application</h1>
        <p class="text-gray-500 mt-1">Gérez vos préférences et la sécurité de votre compte KUBIK.</p>
      </div>

      <div class="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
        <div class="border-b border-gray-100 px-6 py-4">
          <h2 class="text-lg font-medium text-text flex items-center">
            <svg class="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Changer le mot de passe
          </h2>
        </div>
        
        <form (ngSubmit)="changePassword()" class="p-6 space-y-6">
          <div *ngIf="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center animate-fade-in">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            {{ successMessage }}
          </div>
          
          <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center animate-fade-in">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {{ errorMessage }}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
            <input type="password" [(ngModel)]="currentPassword" name="current" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
          </div>

          <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
              <input type="password" [(ngModel)]="newPassword" name="new" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
              <input type="password" [(ngModel)]="confirmPassword" name="confirm" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <button type="submit" [disabled]="isSaving" class="bg-primary text-white border border-transparent rounded-md shadow-sm py-2 px-6 inline-flex justify-center text-sm font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition">
              {{ isSaving ? 'Mise à jour...' : 'Mettre à jour' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
  `]
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
