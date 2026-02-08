import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { AuthService } from './services/auth.service';
import { GrilleService, Grille } from './services/grille.service';
import { OrderService, Order } from './services/order.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  // Modales
  showRegisterModal = false;
  showLoginModal = false;

  // Champs register
  regEmail = '';
  regPassword = '';
  selectedRole = 'PROPRIETAIRE';

  // Champs login
  loginEmail = '';
  loginPassword = '';

  // Grille creation
  title = 'Grille dispo';
  price: number | null = 10;

  // Commandes
  orders: Order[] = [];
  showOrders = false;

  // Mode deplacement
  private moveGrilleId: number | null = null;

  private map!: L.Map;
  private markersLayer = L.layerGroup();
  private addMode = false;

  constructor(public auth: AuthService, private grilles: GrilleService, private orderService: OrderService) {}

  get isLoggedIn() { return this.auth.isLoggedIn; }
  get isProprietaire() { return this.auth.isProprietaire; }
  get isChercheur() { return this.auth.isChercheur; }

  ngAfterViewInit(): void {
    this.initMap();
    this.reload();
  }

  private initMap() {
    this.map = L.map('map').setView([48.8566, 2.3522], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);

    this.map.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      // Mode deplacement
      if (this.moveGrilleId !== null) {
        const id = this.moveGrilleId;
        this.moveGrilleId = null;
        this.grilles.update(id, { lat, lng }).subscribe({
          next: () => this.reload(),
          error: (err) => alert('Erreur deplacement: ' + (err?.error?.message ?? ''))
        });
        return;
      }

      // Mode ajout
      if (!this.addMode) return;

      this.grilles.create({
        title: this.title || 'Grille',
        lat,
        lng,
        pricePerDay: this.price ?? undefined
      }).subscribe({
        next: () => {
          this.addMode = false;
          this.reload();
        },
        error: (err) => alert('Erreur create: ' + (err?.error?.message ?? ''))
      });
    });

    this.map.on('moveend', () => this.searchInView());
  }

  enableAddMode() {
    this.addMode = true;
    this.moveGrilleId = null;
    alert('Clique sur la carte pour placer la grille.');
  }

  reload() {
    this.grilles.list().subscribe(data => this.renderMarkers(data));
  }

  private searchInView() {
    const b = this.map.getBounds();
    this.grilles.searchBbox(
      b.getSouthWest().lat,
      b.getNorthEast().lat,
      b.getSouthWest().lng,
      b.getNorthEast().lng
    ).subscribe(data => this.renderMarkers(data));
  }

  private traxIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="38" height="38">
      <!-- Chenille -->
      <rect x="4" y="40" width="46" height="14" rx="7" ry="7" fill="#333"/>
      <circle cx="12" cy="47" r="5" fill="#555"/><circle cx="12" cy="47" r="2.5" fill="#888"/>
      <circle cx="27" cy="47" r="5" fill="#555"/><circle cx="27" cy="47" r="2.5" fill="#888"/>
      <circle cx="42" cy="47" r="5" fill="#555"/><circle cx="42" cy="47" r="2.5" fill="#888"/>
      <!-- Cabine -->
      <rect x="24" y="20" width="22" height="20" rx="3" fill="#f5a623"/>
      <rect x="28" y="23" width="14" height="10" rx="1" fill="#d4eeff"/>
      <!-- Bras -->
      <rect x="6" y="16" width="22" height="6" rx="2" fill="#f5a623" transform="rotate(-15 17 19)"/>
      <!-- Godet -->
      <path d="M2 22 L10 14 L14 20 L8 26 Z" fill="#e08e14"/>
      <!-- Cheminee -->
      <rect x="42" y="14" width="4" height="8" rx="1" fill="#555"/>
      <ellipse cx="44" cy="13" rx="3" ry="2" fill="#999"/>
    </svg>`,
    className: 'trax-marker',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -34]
  });

  private renderMarkers(items: Grille[]) {
    this.markersLayer.clearLayers();
    const currentEmail = this.auth.userEmail;

    for (const g of items) {
      const m = L.marker([g.lat, g.lng], { icon: this.traxIcon });
      let popupContent = `<b>${g.title}</b><br/>Owner: ${g.ownerEmail}<br/>Prix/jour: ${g.pricePerDay ?? '-'}`;

      // Bouton Commander pour CHERCHEUR
      if (this.isChercheur) {
        popupContent += `<br/><button class="btn-commander" data-grille-id="${g.id}">Commander</button>`;
      }

      // Boutons Deplacer / Supprimer pour le PROPRIETAIRE de cette grille
      if (this.isProprietaire && g.ownerEmail === currentEmail) {
        popupContent += `<br/><div class="popup-owner-actions">`;
        popupContent += `<button class="btn-move" data-grille-id="${g.id}">Deplacer</button>`;
        popupContent += `<button class="btn-delete" data-grille-id="${g.id}">Supprimer</button>`;
        popupContent += `</div>`;
      }

      m.bindPopup(popupContent);

      m.on('popupopen', () => {
        // Commander
        const btnCmd = document.querySelector(`.btn-commander[data-grille-id="${g.id}"]`);
        if (btnCmd) {
          btnCmd.addEventListener('click', () => this.commander(g.id));
        }
        // Deplacer
        const btnMove = document.querySelector(`.btn-move[data-grille-id="${g.id}"]`);
        if (btnMove) {
          btnMove.addEventListener('click', () => {
            this.moveGrilleId = g.id;
            this.addMode = false;
            this.map.closePopup();
            alert('Clique sur la carte pour deplacer la grille.');
          });
        }
        // Supprimer
        const btnDel = document.querySelector(`.btn-delete[data-grille-id="${g.id}"]`);
        if (btnDel) {
          btnDel.addEventListener('click', () => this.deleteGrille(g.id));
        }
      });

      m.addTo(this.markersLayer);
    }
  }

  deleteGrille(id: number) {
    if (!confirm('Supprimer cette grille ?')) return;
    this.grilles.delete(id).subscribe({
      next: () => this.reload(),
      error: (err) => alert('Erreur suppression: ' + (err?.error?.message ?? ''))
    });
  }

  commander(grilleId: number) {
    this.orderService.createOrder(grilleId).subscribe({
      next: () => {
        alert('Commande effectuee !');
        this.loadOrders();
      },
      error: (err) => alert('Erreur commande: ' + (err?.error?.message ?? ''))
    });
  }

  toggleOrders() {
    this.showOrders = !this.showOrders;
    if (this.showOrders) {
      this.loadOrders();
    }
  }

  loadOrders() {
    this.orderService.myOrders().subscribe({
      next: (data) => this.orders = data,
      error: (err) => alert('Erreur chargement commandes: ' + (err?.error?.message ?? ''))
    });
  }

  register() {
    this.auth.register(this.regEmail, this.regPassword, this.selectedRole).subscribe({
      next: () => {
        alert('Compte cree avec succes ! Vous pouvez maintenant vous connecter.');
        this.showRegisterModal = false;
        this.loginEmail = this.regEmail;
        this.regEmail = '';
        this.regPassword = '';
      },
      error: (err) => alert('Erreur inscription: ' + (err?.error?.message ?? ''))
    });
  }

  login() {
    this.auth.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => {
        this.showLoginModal = false;
        this.loginPassword = '';
        this.reload();
      },
      error: (err) => alert('Erreur connexion: ' + (err?.error?.message ?? ''))
    });
  }

  logout() {
    this.auth.logout();
    this.showOrders = false;
    this.orders = [];
    this.reload();
  }
}
