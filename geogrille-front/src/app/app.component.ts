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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
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

  private grilleIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#1976d2"/>
      <circle cx="12" cy="12" r="5" fill="#fff"/>
    </svg>`,
    className: 'grille-marker',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -32]
  });

  private renderMarkers(items: Grille[]) {
    this.markersLayer.clearLayers();
    const currentEmail = this.auth.userEmail;

    for (const g of items) {
      const m = L.marker([g.lat, g.lng], { icon: this.grilleIcon });
      const isOwner = this.isProprietaire && g.ownerEmail === currentEmail;

      let popup = `<div class="popup-grille"><b>${g.title}</b>`;
      if (g.pricePerDay) popup += `<span class="popup-price">${g.pricePerDay} /jour</span>`;

      if (this.isChercheur) {
        popup += `<button class="btn-commander" data-grille-id="${g.id}">Commander</button>`;
      }
      if (isOwner) {
        popup += `<div class="popup-actions">`;
        popup += `<button class="btn-move" data-grille-id="${g.id}">Deplacer</button>`;
        popup += `<button class="btn-delete" data-grille-id="${g.id}">Supprimer</button>`;
        popup += `</div>`;
      }
      popup += `</div>`;

      m.bindPopup(popup);

      m.on('popupopen', () => {
        document.querySelector(`.btn-commander[data-grille-id="${g.id}"]`)
          ?.addEventListener('click', () => this.commander(g.id));
        document.querySelector(`.btn-move[data-grille-id="${g.id}"]`)
          ?.addEventListener('click', () => {
            this.moveGrilleId = g.id;
            this.addMode = false;
            this.map.closePopup();
            alert('Clique sur la carte pour deplacer la grille.');
          });
        document.querySelector(`.btn-delete[data-grille-id="${g.id}"]`)
          ?.addEventListener('click', () => this.deleteGrille(g.id));
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
