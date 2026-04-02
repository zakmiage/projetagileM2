import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../services/event.service';
import { MemberService } from '../../../services/member.service';
import { EventRegistration } from '../../../models/event.model';
import { Member } from '../../../models/member.model';

@Component({
  selector: 'app-participants-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './participants-tab.component.html',
  styleUrls: ['./participants-tab.component.css']
})
export class ParticipantsTabComponent implements OnInit {
  @Input() eventId!: number;
  private eventService = inject(EventService);
  private memberService = inject(MemberService);

  registrations: EventRegistration[] = [];
  
  // Directory Search
  directoryMembers: Member[] = [];
  searchQuery = '';
  showResults = false;
  selectedMemberToRegister: Member | null = null;

  ngOnInit() {
    this.loadRegistrations();
    // Pre-load directory members for search
    this.memberService.getMembers().subscribe(members => {
      this.directoryMembers = members;
    });
  }

  loadRegistrations() {
    this.eventService.getEvent(this.eventId).subscribe(ev => {
      this.registrations = ev.registrations || [];
    });
  }

  filteredDirectory() {
    if (!this.searchQuery) return [];
    const q = this.searchQuery.toLowerCase();
    
    // Filter out already registered members
    const registeredIds = this.registrations.map(r => r.member_id);
    const available = this.directoryMembers.filter(m => !registeredIds.includes(m.id));

    return available.filter(m => 
      m.first_name.toLowerCase().includes(q) || 
      m.last_name.toLowerCase().includes(q) || 
      m.email.toLowerCase().includes(q)
    ).slice(0, 5); // Limit to 5 results for clean dropdown
  }

  selectMember(m: Member) {
    this.selectedMemberToRegister = m;
    this.searchQuery = m.first_name + ' ' + m.last_name;
    this.showResults = false;
  }

  addParticipant() {
    if (!this.selectedMemberToRegister) return;
    
    this.eventService.addParticipant(this.eventId, this.selectedMemberToRegister).subscribe({
      next: () => {
        this.loadRegistrations(); // refresh
        this.selectedMemberToRegister = null;
        this.searchQuery = '';
      },
      error: (err) => alert(err.message)
    });
  }

  removeParticipant(reg: EventRegistration) {
    if (confirm("Désinscrire ce membre ?")) {
      this.eventService.removeParticipant(this.eventId, reg.member_id).subscribe(() => {
        this.loadRegistrations();
      });
    }
  }
}
