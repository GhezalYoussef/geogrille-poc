import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../api';

export interface Order {
  id: number;
  grilleTitle: string;
  priceSnapshot?: number;
  orderDate: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  createOrder(grilleId: number) {
    return this.http.post<Order>(`${API_BASE}/orders`, { grilleId });
  }

  myOrders() {
    return this.http.get<Order[]>(`${API_BASE}/orders/me`);
  }
}
