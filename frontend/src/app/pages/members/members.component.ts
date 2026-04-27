import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MemberService } from '../../services/member.service';
import { FileService } from '../../services/file.service';
import { Member, MemberAttachment } from '../../models/member.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './members.component.html'
})
export class MembersComponent implements OnInit {
  private memberService = inject(MemberService);
  private fileService = inject(FileService);
  private cdr = inject(ChangeDetectorRef);
  
  members: Member[] = [];
  searchQuery = '';
  
  selectedMember: Member | null = null;
  editedMember!: Member;
  isNewMember = false;

  // Gestion de la modale de confirmation de suppression
  memberToDelete: Member | null = null;
  
  // Tableau de gestion dynamique des inputs d'allergies
  parsedAllergies: string[] = [];
  selectedFile: File | null = null;
  selectedDocumentType: string = 'CERTIFICATE';
  isUploading = false;

  ngOnInit() {
    this.memberService.getMembers().subscribe({
      next: (data) => {
        this.members = data;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  filteredMembers() {
    if (!this.searchQuery) return this.members;
    const q = this.searchQuery.toLowerCase();
    return this.members.filter(m => 
      m.first_name.toLowerCase().includes(q) || 
      m.last_name.toLowerCase().includes(q) || 
      m.email.toLowerCase().includes(q)
    );
  }

  trackByIndex(index: number, item: any) {
    return index;
  }

  openAddModal() {
    this.isNewMember = true;
    const newMemberTemplate: Partial<Member> = {
      first_name: '', last_name: '', email: '',
      t_shirt_size: 'M', allergies: '',
      is_certificate_ok: false, is_waiver_ok: false, is_image_rights_ok: false,
      attachments: []
    };
    this.selectedMember = newMemberTemplate as Member; // Trick display
    this.editedMember = JSON.parse(JSON.stringify(newMemberTemplate));
    this.parsedAllergies = [];
    this.selectedDocumentType = 'CERTIFICATE';
  }

  openModal(member: Member) {
    this.isNewMember = false;
    this.selectedMember = member;
    this.editedMember = JSON.parse(JSON.stringify(member));
    if (!this.editedMember.attachments) this.editedMember.attachments = [];
    
    // Parse les allergies ou set un array vide
    if (this.editedMember.allergies) {
      this.parsedAllergies = this.editedMember.allergies.split(',').map(s => s.trim()).filter(s => s.length > 0);
    } else {
      this.parsedAllergies = [];
    }

    this.selectedDocumentType = 'CERTIFICATE';

    this.loadAttachments(member.id);
  }

  closeModal() {
    this.selectedMember = null;
    this.isNewMember = false;
    this.selectedFile = null;
    this.isUploading = false;
  }

  addAllergy() {
    this.parsedAllergies.push('');
  }

  removeAllergy(index: number) {
    this.parsedAllergies.splice(index, 1);
  }

  saveMember() {
    if (!this.editedMember.first_name || !this.editedMember.last_name) return;

    // Reconstruire la string depuis les inputs dynamiques
    const filtered = this.parsedAllergies.map(s => s.trim()).filter(s => s.length > 0);
    this.editedMember.allergies = filtered.length > 0 ? filtered.join(', ') : '';

    if (this.isNewMember) {
      this.memberService.createMember(this.editedMember as Omit<Member, 'id' | 'created_at' | 'updated_at'>).subscribe({
        next: () => {
          // Recharger depuis l'API pour respecter le tri alphabétique
          this.memberService.getMembers().subscribe(members => {
            this.members = members;
            this.cdr.detectChanges();
          });
          this.closeModal();
        },
        error: () => alert("Erreur lors de la création")
      });
    } else {
      this.memberService.updateMember(this.editedMember.id, this.editedMember).subscribe({
        next: (updated) => {
          const index = this.members.findIndex(m => m.id === updated.id);
          if (index > -1) {
            this.members[index] = updated;
          }
          this.closeModal();
          this.cdr.detectChanges();
        },
        error: () => alert("Erreur lors de la mise a jour")
      });
    }
  }

  triggerUpload() {
    const inputElement = document.getElementById('member-file-input') as HTMLInputElement | null;
    inputElement?.click();
  }

  onFileSelected(event: any) {
    const file = event?.target?.files?.[0] ?? null;
    this.selectedFile = file;
  }

  upload() {
    if (!this.canUpload()) {
      return;
    }

    const memberId = this.editedMember.id;
    const selectedFile = this.selectedFile;
    if (!selectedFile) {
      return;
    }

    this.isUploading = true;

    this.fileService
      .uploadMemberAttachment(memberId, selectedFile, this.selectedDocumentType)
      .pipe(
        finalize(() => {
          this.isUploading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
      next: () => {
        this.selectedFile = null;

        const inputElement = document.getElementById('member-file-input') as HTMLInputElement | null;
        if (inputElement) {
          inputElement.value = '';
        }

        this.loadAttachments(memberId);
      },
      error: (error: HttpErrorResponse) => {
        this.selectedFile = null;
        const backendMessage = error?.error?.message;
        if (error.status === 0) {
          alert('Upload impossible: le backend ne repond pas. Verifie que le serveur Node tourne sur http://localhost:3000.');
          return;
        }

        alert(`Erreur upload (${error.status}): ${backendMessage || 'erreur inconnue'}`);
      }
    });
  }

  viewAttachment(att: MemberAttachment) {
    window.open(this.fileService.getFileUrl(att.file_path), '_blank');
  }

  removeAttachment(att: MemberAttachment, event: MouseEvent) {
    event.stopPropagation();

    if (!this.editedMember?.id) {
      return;
    }

    if (!confirm(`Supprimer le fichier "${att.file_name}" ?`)) {
      return;
    }

    this.fileService.deleteMemberAttachment(this.editedMember.id, att.id).subscribe({
      next: () => {
        this.editedMember.attachments = (this.editedMember.attachments ?? []).filter((item) => item.id !== att.id);
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        const backendMessage = error?.error?.message;
        alert(`Erreur suppression (${error.status}): ${backendMessage || 'erreur inconnue'}`);
      }
    });
  }

  canUpload(): boolean {
    return !!this.selectedFile && !!this.editedMember?.id && !this.isUploading;
  }

  // Ouvre la modale de confirmation (sans ouvrir la modal d'édition)
  requestDeleteMember(member: Member, event: MouseEvent) {
    event.stopPropagation();
    this.memberToDelete = member;
  }

  // Confirme la suppression : appelle l'API, filtre la liste localement
  confirmDelete() {
    if (!this.memberToDelete) return;
    const id = this.memberToDelete.id;
    this.memberService.deleteMember(id).subscribe({
      next: () => {
        this.members = this.members.filter(m => m.id !== id);
        this.memberToDelete = null;
        this.cdr.detectChanges();
      },
      error: () => alert('Erreur lors de la suppression du membre')
    });
  }

  // Annule la suppression
  cancelDelete() {
    this.memberToDelete = null;
  }

  private loadAttachments(memberId: number) {
    this.fileService.getMemberAttachments(memberId).subscribe({
      next: (attachments) => {
        this.editedMember.attachments = attachments.map((attachment) => ({
          ...attachment,
          file_path: this.fileService.getFileUrl(attachment.file_path)
        }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.editedMember.attachments = [];
        this.cdr.detectChanges();
      }
    });
  }
}
