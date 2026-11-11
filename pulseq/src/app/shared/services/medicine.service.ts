import { Injectable, signal, computed, inject } from '@angular/core';
import { Medicine, Pharmacy, MedicineOrder, NeedCategory } from '../models';
import { MEDS, NEEDS, SHAPE, CELLC } from '../../data/medicines.data';
import { SHOPS, AREAS } from '../../data/pharmacies.data';
import { StorageService } from './storage.service';

const ORD_KEY = 'pulseq.orders';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private storage = inject(StorageService);

  medicines = signal<Medicine[]>(MEDS);
  needs = signal<NeedCategory[]>(NEEDS);
  pharmacies = signal<Pharmacy[]>(SHOPS);
  areas = AREAS;
  shapeMap = SHAPE;
  cellColors = CELLC;

  selectedArea = signal<string>('');
  isNear = signal<boolean>(false);
  selectedShopId = signal<number | null>(null);

  // Cart key is "medId|mode" where mode is 's' (single) or 'p' (pack)
  cart = signal<Record<string, number>>({});
  medModes = signal<Record<number, 's' | 'p'>>({});
  infoOpen = signal<Record<number, boolean>>({});
  whereOpen = signal<Record<number, boolean>>({});

  orders = signal<MedicineOrder[]>([]);
  activeOrder = computed(() => this.orders().find(order => order.status !== 'delivered') || null);

  selectedShop = computed(() => {
    const id = this.selectedShopId();
    if (!id) return null;
    return this.pharmacies().find(s => s.id === id) || null;
  });

  cartItemCount = computed(() => {
    const entries = Object.entries(this.cart()).filter(([_, qty]) => qty > 0);
    return entries.length;
  });

  cartTotalUnits = computed(() => {
    return Object.values(this.cart()).reduce((sum, qty) => sum + qty, 0);
  });

  hasRxInCart = computed(() => {
    return Object.keys(this.cart()).some(key => {
      if ((this.cart()[key] || 0) <= 0) return false;
      const medId = Number(key.split('|')[0]);
      const med = this.getMedicineById(medId);
      return med?.rx === 1;
    });
  });

  constructor() {
    const savedOrders = this.storage.getItem<MedicineOrder[]>(ORD_KEY, []);
    this.orders.set(Array.isArray(savedOrders) ? savedOrders : []);
  }

  getMedicineById(id: number | string): Medicine | undefined {
    const numId = Number(id);
    return this.medicines().find(m => m.id === numId);
  }

  getPharmacyById(id: number | string): Pharmacy | undefined {
    const numId = Number(id);
    return this.pharmacies().find(p => p.id === numId);
  }

  packSize(m: Medicine): number {
    if (m.f === 'Tablet' || m.f === 'Capsule') {
      return [10, 7, 10, 12, 6, 14][m.id % 6];
    }
    return 1;
  }

  baseMedPrice(m: Medicine): number {
    return 40 + (m.id * 37) % 180;
  }

  isStockedAt(m: Medicine, sh: Pharmacy): boolean {
    return (m.id * 7 + sh.id * 3) % 5 !== 0;
  }

  priceAt(m: Medicine, sh: Pharmacy): number {
    return this.baseMedPrice(m) + ((m.id + sh.id) % 4) * 5;
  }

  areaMatch(sh: Pharmacy, area: string): boolean {
    const q = area.trim().toLowerCase();
    if (!q) return false;
    return sh.a.toLowerCase().includes(q) ||
      sh.c.toLowerCase() === q ||
      `${sh.a} ${sh.c}`.toLowerCase().includes(q);
  }

  selectArea(area: string, isNear: boolean = false): void {
    this.selectedArea.set(area);
    this.isNear.set(isNear);
    const currentShop = this.selectedShop();
    if (currentShop && !this.areaMatch(currentShop, area)) {
      this.selectedShopId.set(null);
    }
  }

  selectShop(shopId: number): void {
    this.selectedShopId.set(shopId);
  }

  setMode(medId: number, mode: 's' | 'p'): void {
    this.medModes.update(m => ({ ...m, [medId]: mode }));
  }

  toggleInfo(medId: number): void {
    this.infoOpen.update(m => ({ ...m, [medId]: !m[medId] }));
  }

  toggleWhere(medId: number): void {
    this.whereOpen.update(m => ({ ...m, [medId]: !m[medId] }));
  }

  addToCart(medId: number, mode?: 's' | 'p'): void {
    const actualMode = mode || this.medModes()[medId] || 'p';
    const key = `${medId}|${actualMode}`;
    this.cart.update(c => ({
      ...c,
      [key]: (c[key] || 0) + 1
    }));
  }

  plusCart(key: string): void {
    this.cart.update(c => ({
      ...c,
      [key]: (c[key] || 0) + 1
    }));
  }

  lessCart(key: string): void {
    this.cart.update(c => {
      const current = c[key] || 0;
      const next = Math.max(0, current - 1);
      return { ...c, [key]: next };
    });
  }

  buyHere(medId: number, shopId: number): void {
    const shop = this.getPharmacyById(shopId);
    if (shop) {
      this.selectedShopId.set(shop.id);
      this.selectArea(shop.a, false);
      this.addToCart(medId);
    }
  }

  modeOf(medId: number): 's' | 'p' {
    return this.medModes()[medId] || 'p';
  }

  isInfoOpen(medId: number): boolean {
    return !!this.infoOpen()[medId];
  }

  isWhereOpen(medId: number): boolean {
    return !!this.whereOpen()[medId];
  }

  inCartCount(medId: number, mode: 's' | 'p'): number {
    return this.cart()[`${medId}|${mode}`] || 0;
  }

  addOrder(order: MedicineOrder): void {
    const updated = [{ ...order, status: order.status || 'placed' as const }, ...this.orders()];
    this.orders.set(updated);
    this.storage.setItem(ORD_KEY, updated);
    this.cart.set({});
  }

  updateOrderStatus(code: string, status: MedicineOrder['status']): void {
    const updated = this.orders().map(order => order.code === code ? { ...order, status } : order);
    this.orders.set(updated);
    this.storage.setItem(ORD_KEY, updated);
  }

  cancelOrder(code: string): void {
    const updated = this.orders().filter(o => o.code !== code);
    this.orders.set(updated);
    this.storage.setItem(ORD_KEY, updated);
  }
}
