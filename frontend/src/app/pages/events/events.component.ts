import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './events.component.html'
})
export class EventsComponent implements OnInit {
  private eventService = inject(EventService);
  events: Event[] = [];
  searchQuery = '';

  isModalOpen = false;
  newEvent: Partial<Event> = {};
  start_date_input = '';
  end_date_input = '';

  ngOnInit() {
    this.eventService.getEvents().subscribe(data => {
      this.events = data;
    });
  }

  filteredEvents() {
    if (!this.searchQuery) return this.events;
    const lowerQuery = this.searchQuery.toLowerCase();
    return this.events.filter(e => 
      e.name.toLowerCase().includes(lowerQuery) || 
      (e.description && e.description.toLowerCase().includes(lowerQuery))
    );
  }

  openAddModal() {
    this.newEvent = { name: '', description: '', capacity: 50 };
    // Mettre la date d'aujourd'hui par défaut
    this.start_date_input = new Date().toISOString().split('T')[0];
    this.end_date_input = '';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveEvent() {
    if (!this.newEvent.name || !this.start_date_input) return;

    // Convert input YYYY-MM-DD to full ISO format
    this.newEvent.start_date = new Date(this.start_date_input).toISOString();
    
    // Logique de Date : si end_date est spécifié on le valide, sinon on efface pr avoir un événement FIXE
    if (this.end_date_input) {
      this.newEvent.end_date = new Date(this.end_date_input).toISOString();
    } else {
      this.newEvent.end_date = undefined;
    }

    this.eventService.createEvent(this.newEvent as Omit<Event, 'id' | 'created_at'>).subscribe({
      next: (event) => {
        this.events = [...this.events, event];
        this.closeModal();
      },
      error: () => alert("Erreur lors de la création de l'événement")
    });
  }
}
