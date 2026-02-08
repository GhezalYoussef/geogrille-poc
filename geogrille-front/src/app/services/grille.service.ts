import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../api';

export interface Grille {
  id: number;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  pricePerDay?: number;
  ownerEmail: string;
}

@Injectable({ providedIn: 'root' })
export class GrilleService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Grille[]>(`${API_BASE}/grilles`);
  }

  searchBbox(minLat: number, maxLat: number, minLng: number, maxLng: number) {
    return this.http.get<Grille[]>(
      `${API_BASE}/grilles/search?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`
    );
  }

  create(payload: { title: string; description?: string; lat: number; lng: number; pricePerDay?: number }) {
    return this.http.post<Grille>(`${API_BASE}/grilles`, payload);
  }

  update(id: number, payload: { title?: string; lat?: number; lng?: number; pricePerDay?: number }) {
    return this.http.put<Grille>(`${API_BASE}/grilles/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${API_BASE}/grilles/${id}`);
  }
}
