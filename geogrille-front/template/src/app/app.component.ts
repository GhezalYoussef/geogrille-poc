import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { AuthService } from './services/auth.service';
import { GrilleService, Grille } from './services/grille.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  email = 'user1@test.com';
  password = 'Password123!';
  title = 'Grille dispo';
  price: number | null = 10;

  private map!: L.Map;
  private markersLayer = L.layerGroup();
  private addMode = false;

  constructor(private auth: AuthService, private grilles: GrilleService) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.reload();
  }

  private initMap() {
    this.map = L.map('map').setView([48.8566, 2.3522], 12); // Paris

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);

    this.map.on('click', (e: any) => {
      if (!this.addMode) return;

      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

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
        error: (err) => alert('Erreur create (tu es login ?) ' + (err?.error?.message ?? ''))
      });
    });

    this.map.on('moveend', () => this.searchInView());
  }

  enableAddMode() {
    this.addMode = true;
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

  private renderMarkers(items: Grille[]) {
    this.markersLayer.clearLayers();

    for (const g of items) {
      const m = L.marker([g.lat, g.lng]);
      m.bindPopup(
        `<b>${g.title}</b><br/>Owner: ${g.ownerEmail}<br/>Prix/jour: ${g.pricePerDay ?? '-'}`
      );
      m.addTo(this.markersLayer);
    }
  }

  register() {
    this.auth.register(this.email, this.password).subscribe({
      next: () => alert('Registered'),
      error: (err) => alert('Register error: ' + (err?.error?.message ?? ''))
    });
  }

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => alert('Logged in'),
      error: (err) => alert('Login error: ' + (err?.error?.message ?? ''))
    });
  }

  logout() {
    this.auth.logout();
    alert('Logged out');
  }
}
