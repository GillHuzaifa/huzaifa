import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicineService } from '../../shared/services/medicine.service';
import { ToastService } from '../../shared/services/toast.service';
import { SeoService } from '../../shared/services/seo.service';
import { Medicine, Pharmacy, MedicineOrder } from '../../shared/models';

@Component({
  selector: 'app-medicine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="sec pg-medicine" id="page-medicine">
      <div class="wrap">
        <div class="mhero">
          <div style="flex:1 1 420px;min-width:0;display:flex;flex-direction:column;gap:16px">
            <span class="eyebrow">PulseQ medicine</span>
            <h2 style="font-size:clamp(27px,4.3vw,55px)">Tell us what you need. We bring the medicine.</h2>
            <p class="muted" style="font-size:18px;max-width:520px">Pick a pharmacy near you, then start from how you feel, not from a name you may not know. Build your pack and that shop contacts you to confirm and delivers it.</p>
            <div class="symbox" style="margin:0;max-width:560px">
              <div class="field wide">
                <label for="mq">Already know the name?</label>
                <input id="mq" type="search" enterkeyhint="search" placeholder="Search a medicine or what it treats" autocomplete="off" [(ngModel)]="searchQuery" (input)="onSearchInput()">
              </div>
            </div>
          </div>
          <div class="rxcard">
            <span class="pillart" aria-hidden="true"><i></i><i class="r"></i><i></i></span>
            <h3 style="font-size:26px">Have a prescription?</h3>
            <p class="muted">Skip the browsing. Choose your pharmacy and upload a photo or PDF of it. The pharmacy contacts you to check it and prepare your order.</p>
            <button class="btn btn-ink full" type="button" (click)="scrollToCart()">Order with a prescription</button>
          </div>
        </div>

        <div class="picker" id="picker">
          <div class="row-between" style="align-items:flex-end;gap:16px">
            <div><span class="eyebrow">Step 1</span><h3 style="font-size:28px;margin-top:6px">Which pharmacy near you?</h3></div>
            <button class="chip" id="pLoc" style="gap:8px" (click)="locate()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path>
                <circle cx="12" cy="12" r="8"></circle>
              </svg>
              Use my location
            </button>
          </div>
          <div class="symbox" style="margin:14px 0 10px">
            <div class="field wide">
              <label for="pArea">Your area</label>
              <input id="pArea" list="pAreas" type="text" placeholder="e.g. PWD, G-11, Gulberg" autocomplete="off" [(ngModel)]="areaInput" (input)="onAreaInput()">
            </div>
          </div>
          <datalist id="pAreas">
            @for (a of areaNames; track a) {
              <option [value]="a"></option>
            }
          </datalist>
          <div class="chips" id="pChips" role="group" aria-label="Popular areas" style="margin-bottom:10px">
            @for (a of areaNames; track a) {
              <button class="chip" [class.on]="selectedArea.toLowerCase() === a.toLowerCase()" (click)="pickArea(a)">{{ a }}</button>
            }
          </div>
          <p class="muted sm" id="pNote" aria-live="polite" style="margin-bottom:12px">
            @if (!selectedArea) {
              Choose your area to see partner pharmacies that deliver there.
            } @else if (matchingPharmacies().length === 0) {
              No partner pharmacy in “{{ selectedArea }}” yet. Try a nearby area, or send us your area on WhatsApp.
            } @else {
              {{ matchingPharmacies().length }} {{ matchingPharmacies().length === 1 ? 'pharmacy' : 'pharmacies' }} in {{ selectedArea }}{{ isNear ? ' (near you)' : '' }}. Sample shops for this demo.
            }
          </p>
          <div class="shops" id="pShops">
            @for (s of matchingPharmacies(); track s.id) {
              @let on = medService.selectedShopId() === s.id;
              <article class="shop" [class.on]="on">
                <h4>{{ s.n }}</h4>
                <p class="muted sm">{{ s.a }} · {{ s.c }}</p>
                <div class="tags"><span class="tag">{{ s.h }}</span><span class="tag">Delivery Rs {{ s.fee }}</span></div>
                <button class="btn full" [class.btn-coral]="on" [class.btn-ink]="!on" type="button" (click)="selectPharmacy(s.id)">{{ on ? 'Selected' : 'Order from this shop' }}</button>
              </article>
            }
          </div>
        </div>

        <span class="eyebrow" style="display:block;margin-top:36px">Step 2</span>
        <h3 style="font-size:28px;margin:6px 0 14px">What do you need relief from?</h3>
        <div class="needs" id="mNeeds" role="group" aria-label="Choose a need">
          @for (n of medService.needs(); track n.k) {
            @let on = selectedNeed === n.k;
            @let cnt = getMedCount(n.k);
            <button class="need {{ n.cls }}" [class.on]="on" [attr.aria-pressed]="on" type="button" (click)="selectNeed(n.k)">
              <span class="pillart" aria-hidden="true"><i></i><i class="r"></i></span>
              <b>{{ n.t }}</b>
              <small>{{ n.s }}</small>
              <small><b style="font-family:var(--body);font-size:13px">{{ cnt }} medicines</b></small>
            </button>
          }
        </div>

        <div class="mlayout" style="margin-top:28px">
          <div class="min0" style="flex:1 1 520px">
            <div id="mArea" aria-live="polite">
              @if (filteredMeds().length > 0) {
                @for (m of filteredMeds(); track m.id) {
                  @let u = getUnits(m);
                  @let mode = medService.modeOf(m.id);
                  @let isOpen = medService.isInfoOpen(m.id);
                  @let isWhere = medService.isWhereOpen(m.id);
                  @let inCart = medService.inCartCount(m.id, mode);
                  <article class="strip">
                    <div class="strip-art" aria-hidden="true">
                      <span class="sh sh-{{ medService.shapeMap[m.f] || 'tablet' }}"></span>
                    </div>
                    <div class="strip-body">
                      <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
                        <h3 style="font-size:22px">{{ m.n }}</h3>
                        @if (m.rx === 1) {
                          <span class="tag rx">Rx</span>
                        }
                      </div>
                      <p class="muted">{{ m.u }}</p>

                      @if (isOpen) {
                        <div class="info">
                          <span><b>Contains:</b> {{ m.g }}</span>
                          <span><b>Good to know:</b> {{ m.w }}</span>
                          <h4>Possible side effects</h4>
                          <ul>
                            @for (x of (m.s || []); track x) {
                              <li>{{ x }}</li>
                            }
                          </ul>
                          <h4>Precautions</h4>
                          <ul>
                            @for (x of (m.p || []); track x) {
                              <li>{{ x }}</li>
                            }
                          </ul>
                          <span class="xs" style="margin-top:6px"><b>Get urgent help</b> for swelling of the face or lips, or a rash with trouble breathing. Tell your doctor or pharmacist about every medicine you take, and if you are pregnant or breastfeeding.</span>
                        </div>
                      }

                      <div class="seg" role="group" [attr.aria-label]="'Choose single or full pack for ' + m.n">
                        <button [class.on]="mode === 's'" type="button" (click)="medService.setMode(m.id, 's')" [attr.aria-pressed]="mode === 's'">{{ u[0] }}</button>
                        <button [class.on]="mode === 'p'" type="button" (click)="medService.setMode(m.id, 'p')" [attr.aria-pressed]="mode === 'p'">{{ u[1] }}</button>
                      </div>

                      <div class="strip-act">
                        <button class="btn" [class.btn-line]="inCart > 0" [class.btn-ink]="inCart === 0" type="button" (click)="medService.addToCart(m.id, mode)">
                          {{ inCart > 0 ? 'In your pack · ' + inCart : 'Add ' + (mode === 's' ? u[0].toLowerCase() : u[1].toLowerCase()) }}
                        </button>
                        <button class="more" type="button" (click)="medService.toggleInfo(m.id)">{{ isOpen ? 'Show less' : 'What to know' }}</button>
                        <button class="more" type="button" (click)="medService.toggleWhere(m.id)">{{ isWhere ? 'Hide pharmacies' : 'Where to buy' }}</button>
                      </div>

                      @if (isWhere) {
                        <div class="wh">
                          <h4>Where to buy {{ m.n }}</h4>
                          <span class="muted xs">Sample stock and prices for this demo, showing the {{ mode === 's' ? 'price of a single tablet/unit' : 'full strip/pack' }}.</span>
                          @for (sh of sortedPharmacies(); track sh.id) {
                            @let ok = medService.isStockedAt(m, sh);
                            @let pr = medService.priceAt(m, sh);
                            @let sz = medService.packSize(m);
                            @let unitPr = mode === 's' ? Math.ceil(pr / sz) : pr;
                            <div class="whr" [class.out]="!ok">
                              <span>
                                <b>{{ sh.n }}</b><br>
                                <span class="muted xs">{{ sh.a }}, {{ sh.c }} · {{ sh.h }}</span>
                              </span>
                              @if (ok) {
                                <span style="display:flex;gap:10px;align-items:center">
                                  <b>Rs {{ unitPr }}</b>
                                  <button class="btn btn-ink" type="button" (click)="medService.buyHere(m.id, sh.id)">Buy here</button>
                                </span>
                              } @else {
                                <span class="muted xs">Out of stock</span>
                              }
                            </div>
                          }
                        </div>
                      }
                    </div>
                  </article>
                }
              } @else {
                <div class="empty">
                  <h3 style="font-size:24px">We don’t list that one yet</h3>
                  <p class="muted">Check the spelling or try searching by generic name.</p>
                  <button class="btn btn-ink" type="button" (click)="searchQuery = ''">Clear search</button>
                </div>
              }
            </div>
            <p class="muted xs" style="margin-top:20px;max-width:640px">Sample catalogue for this demo. Information is general and is not medical advice. Always follow your doctor’s prescription and the label. Medicines marked Rx need a prescription.</p>
          </div>

          <aside class="mcart" aria-label="Your pack">
            <div class="row-between">
              <h3 style="font-size:24px">Your pack</h3>
              <span class="muted sm" id="packCount">{{ medService.cartItemCount() }} {{ medService.cartItemCount() === 1 ? 'item' : 'items' }}</span>
            </div>
            <div class="shopline" id="shopLine">
              @if (medService.selectedShop(); as sh) {
                <span><b>{{ sh.n }}</b> · {{ sh.a }}</span>
                <span class="muted xs">Delivery Rs {{ sh.fee }}</span>
              } @else {
                <span>Choose a pharmacy above to order.</span>
              }
            </div>
            <div class="pack" id="mPack" aria-hidden="true">
              @let blisterData = getBlisterData();
              @if (blisterData.length === 0) {
                <div class="bl">
                  <b>Empty strip · 7 tablets</b>
                  <div class="blg" style="grid-template-columns:repeat(4,minmax(0,1fr))">
                    <span class="cell"></span><span class="cell"></span>
                    <span class="cell"></span><span class="cell"></span>
                    <span class="cell"></span><span class="cell"></span>
                    <span class="cell"></span>
                  </div>
                </div>
              } @else {
                @for (b of blisterData; track b.id + b.stripIndex) {
                  <div class="bl">
                    <b>{{ b.name }} · {{ b.fill }} of {{ b.size }} {{ b.size > 1 ? 'tablets' : 'unit' }}</b>
                    <div class="blg" [style.grid-template-columns]="'repeat(' + Math.min(b.size, 5) + ',minmax(0,1fr))'">
                      @for (cell of b.cells; track $index) {
                        @if (cell.filled) {
                          <span class="cell full" [style.background]="cell.color">{{ cell.letter }}</span>
                        } @else {
                          <span class="cell"></span>
                        }
                      }
                    </div>
                  </div>
                }
              }
            </div>
            <div id="mList">
              @for (entry of getCartEntries(); track entry.key) {
                @let m = entry.med;
                @let isSingle = entry.mode === 's';
                <div class="mline">
                  <b>
                    {{ m.n }}
                    @if (m.rx === 1) {
                      <span class="tag rx" style="min-height:22px;padding:0 8px;font-size:11px">Rx</span>
                    }
                    <span class="unit">{{ isSingle ? 'Single' : 'Full pack' }}</span>
                  </b>
                  <span class="qty">
                    <button type="button" (click)="medService.lessCart(entry.key)">−</button>
                    <span>{{ entry.qty }}</span>
                    <button type="button" (click)="medService.plusCart(entry.key)">+</button>
                  </span>
                </div>
              }
            </div>
            <div>
              <label class="lbl" for="medName">Your name</label>
              <input class="inp" id="medName" type="text" autocomplete="name" autocapitalize="words" enterkeyhint="next" [(ngModel)]="custName">
            </div>
            <div>
              <label class="lbl" for="medPhone">Mobile number</label>
              <input class="inp" id="medPhone" type="tel" inputmode="numeric" placeholder="03xx xxxxxxx" autocomplete="tel" enterkeyhint="next" [(ngModel)]="custPhone">
            </div>
            <div>
              <label class="lbl" for="medAddr">Delivery address and city</label>
              <textarea class="inp" id="medAddr" placeholder="House, street, area, city" [(ngModel)]="custAddr"></textarea>
            </div>
            <div>
              <label class="lbl" for="medNote">Anything else? (optional)</label>
              <textarea class="inp" id="medNote" placeholder="e.g. medicines from your prescription" style="min-height:80px" [(ngModel)]="custNote"></textarea>
            </div>
            <div>
              <span class="lbl">Prescription</span>
              <label class="drop" id="drop">
                <input class="sr" type="file" id="medFile" accept="image/*,application/pdf" (change)="onFileSelect($event)">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none">
                  <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"></path>
                </svg>
                <span>Upload a photo or PDF of your prescription</span>
              </label>
              @if (rxFileName) {
                <div class="rxprev" id="rxPrev">
                  @if (rxFileIsImg && rxFileUrl) {
                    <img id="rxImg" [src]="rxFileUrl" alt="Your prescription">
                  } @else {
                    <span class="pdf" id="rxPdf">PDF</span>
                  }
                  <div class="min0" style="flex:1">
                    <b id="rxName" style="overflow-wrap:anywhere">{{ rxFileName }}</b>
                    <span class="xs muted" id="rxSize" style="display:block">{{ rxFileSize }}</span>
                  </div>
                  <button class="chip" type="button" id="rxRemove" (click)="clearRx()">Remove</button>
                </div>
              }
              <p class="err" id="rxErr" role="alert" *ngIf="orderError && orderError.includes('prescription')">{{ orderError }}</p>
              <p class="muted xs">Demo: your file stays in this browser. A live site sends it securely to your pharmacy only.</p>
            </div>
            @if (medService.hasRxInCart()) {
              <p class="muted xs" id="rxNote">Your pack has prescription (Rx) medicines. Upload your prescription so the pharmacy can check it.</p>
            }
            <p class="err" id="medErr" role="alert" *ngIf="orderError && !orderError.includes('prescription')">{{ orderError }}</p>
            <button class="btn btn-coral full" id="medGo" type="button" (click)="submitOrder()">Place order</button>
          </aside>
        </div>

        @if (medService.orders().length > 0) {
          <div id="ordWrap" style="margin-top:44px">
            <h3 style="font-size:28px;margin-bottom:14px">Your medicine orders</h3>
            <div class="mine" id="ordList">
              @for (o of medService.orders(); track o.code) {
                <div class="bk">
                  <span class="muted xs">{{ o.shop }}</span>
                  <code>{{ o.code }}</code>
                  <p class="sm">{{ o.items }}</p>
                  <p class="sm muted">Waiting for the pharmacy to contact you on {{ o.phone }}</p>
                  <button class="btn btn-line" (click)="medService.cancelOrder(o.code)" style="margin-top:8px">Cancel order</button>
                </div>
              }
            </div>
          </div>
        }

        <div class="partner">
          <div>
            <h3 style="font-size:26px">Run a pharmacy?</h3>
            <p class="muted">Join PulseQ to get orders from patients in your area. You contact each patient to confirm and deliver it yourself.</p>
          </div>
          <form id="partnerForm" style="flex:1 1 360px;min-width:0;display:flex;flex-direction:column;gap:10px" novalidate (submit)="submitPartner($event)">
            <div><label class="lbl" for="ptName">Pharmacy name</label><input class="inp" id="ptName" type="text" [(ngModel)]="ptName" name="ptName"></div>
            <div><label class="lbl" for="ptArea">Area and city</label><input class="inp" id="ptArea" type="text" placeholder="e.g. PWD, Islamabad" [(ngModel)]="ptArea" name="ptArea"></div>
            <div><label class="lbl" for="ptPhone">Contact number</label><input class="inp" id="ptPhone" type="tel" inputmode="numeric" autocomplete="tel" [(ngModel)]="ptPhone" name="ptPhone"></div>
            <p class="err" id="ptMsg" role="status" *ngIf="ptMessage">{{ ptMessage }}</p>
            <button class="btn btn-ink" type="submit">Apply to list your pharmacy</button>
          </form>
        </div>

        <div class="mflow">
          <div class="mstep"><span class="pillart" aria-hidden="true"><i></i></span><h3>You build the pack</h3><p class="muted">Pick medicines from a need, or send a prescription.</p></div>
          <div class="mstep"><span class="pillart" aria-hidden="true"><i></i><i class="r"></i></span><h3>A pharmacist checks it</h3><p class="muted">They contact you to confirm price, availability and any prescription.</p></div>
          <div class="mstep"><span class="pillart" aria-hidden="true"><i></i><i class="r"></i><i></i></span><h3>It comes to your door</h3><p class="muted">Pay and receive as agreed with the pharmacy.</p></div>
        </div>
      </div>
    </section>

    <!-- Order Success Modal (omodal) -->
    @if (orderSuccessOpen) {
      <div class="modal" id="omodal" (click)="onBackdrop($event)">
        <div class="panel" role="dialog" aria-modal="true" aria-labelledby="oTitle" tabindex="-1" id="opanel">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="width:48px;height:48px;border-radius:50%;background:var(--mint);display:flex;align-items:center;justify-content:center;flex:none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#102A43" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5"></path>
              </svg>
            </span>
            <h3 id="oTitle" style="font-size:28px">Order placed</h3>
          </div>
          <p id="oMsg" style="font-size:18px"><b>{{ lastOrderShop }}</b> will contact you on <b>{{ custPhone }}</b> to confirm your order and arrange delivery.</p>
          <div class="bk">
            <span class="muted xs">Order code</span>
            <code id="oCode">{{ lastOrderCode }}</code>
            <p class="sm" id="oItems">{{ lastOrderItems }}</p>
          </div>
          <p class="muted sm">Please keep your phone nearby. Demo note: orders here are saved in this browser only.</p>
          <button class="btn btn-ink full" id="oClose" type="button" (click)="orderSuccessOpen = false">Done</button>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .pg-medicine { display: block !important; }
  `]
})
export class MedicineComponent implements OnInit {
  medService = inject(MedicineService);
  toast = inject(ToastService);
  seo = inject(SeoService);

  areaNames = Object.keys(this.medService.areas);
  areaInput = '';
  selectedArea = '';
  isNear = false;
  selectedNeed = 'pain';
  searchQuery = '';

  Math = Math;

  // Rx upload
  rxFileName = '';
  rxFileSize = '';
  rxFileIsImg = false;
  rxFileUrl = '';
  private rxFileObj: File | null = null;

  // Checkout details
  custName = '';
  custPhone = '';
  custAddr = '';
  custNote = '';
  orderError = '';

  orderSuccessOpen = false;
  lastOrderCode = '';
  lastOrderShop = '';
  lastOrderItems = '';

  // Partner form
  ptName = '';
  ptArea = '';
  ptPhone = '';
  ptMessage = '';

  ngOnInit(): void {
    this.seo.setPage('Order Medicine Online');
  }

  onSearchInput(): void {
    // triggers reactive search
  }

  onAreaInput(): void {
    this.selectedArea = this.areaInput.trim();
    this.isNear = false;
    this.medService.selectArea(this.selectedArea, false);
  }

  pickArea(area: string): void {
    this.areaInput = area;
    this.selectedArea = area;
    this.isNear = false;
    this.medService.selectArea(area, false);
  }

  locate(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.toast.show("Location isn’t available here. Choose your area instead.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        let best: string | null = null;
        let bd = 1e9;
        Object.entries(this.medService.areas).forEach(([k, coords]) => {
          const d = Math.pow(coords[0] - pos.coords.latitude, 2) + Math.pow(coords[1] - pos.coords.longitude, 2);
          if (d < bd) {
            bd = d;
            best = k;
          }
        });
        if (best && bd < 0.05) {
          this.pickArea(best);
          this.isNear = true;
          this.medService.isNear.set(true);
          this.toast.show(`Showing pharmacies near ${best}`);
        } else {
          this.toast.show("No partner pharmacies near you yet. Choose an area instead.");
        }
      },
      () => {
        this.toast.show("Location isn’t available here. Choose your area instead.");
      },
      { timeout: 8000 }
    );
  }

  matchingPharmacies(): Pharmacy[] {
    if (!this.selectedArea) return [];
    return this.medService.pharmacies().filter(s => this.medService.areaMatch(s, this.selectedArea));
  }

  selectPharmacy(shopId: number): void {
    this.medService.selectShop(shopId);
    const shop = this.medService.getPharmacyById(shopId);
    if (shop) {
      this.toast.show(`Ordering from ${shop.n}`);
    }
  }

  sortedPharmacies(): Pharmacy[] {
    return [...this.medService.pharmacies()].sort((a, b) => {
      const aMatch = this.medService.areaMatch(a, this.selectedArea) ? 1 : 0;
      const bMatch = this.medService.areaMatch(b, this.selectedArea) ? 1 : 0;
      return bMatch - aMatch || a.id - b.id;
    });
  }

  getMedCount(catKey: string): number {
    return this.medService.medicines().filter(m => m.c === catKey).length;
  }

  selectNeed(key: string): void {
    this.selectedNeed = key;
    this.searchQuery = '';
  }

  filteredMeds(): Medicine[] {
    const q = this.searchQuery.toLowerCase();
    if (q) {
      return this.medService.medicines().filter(m => `${m.n} ${m.g} ${m.u}`.toLowerCase().includes(q));
    }
    return this.medService.medicines().filter(m => m.c === this.selectedNeed);
  }

  getUnits(m: Medicine): [string, string] {
    const single = m.f === 'Tablet' ? 'Single tablet' : m.f === 'Capsule' ? 'Single capsule' : 'Single';
    const pack = (m.f === 'Tablet' || m.f === 'Capsule') ? 'Full strip' : 'Full pack';
    return [single, pack];
  }

  scrollToCart(): void {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('drop');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        const inp = document.getElementById('medFile');
        if (inp) inp.click();
      }
    }
  }

  onFileSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleRxFile(input.files[0]);
    }
  }

  private handleRxFile(f: File): void {
    const ok = /^image\//.test(f.type) || f.type === 'application/pdf';
    if (!ok) {
      this.orderError = "Upload a photo (JPG, PNG) or a PDF.";
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      this.orderError = "That file is over 8 MB. Upload a smaller photo or PDF.";
      return;
    }
    this.orderError = '';
    this.rxFileObj = f;
    this.rxFileName = f.name;
    this.rxFileSize = f.size / 1024 < 1024 ? `${Math.round(f.size / 1024)} KB` : `${(f.size / 1048576).toFixed(1)} MB`;
    this.rxFileIsImg = /^image\//.test(f.type);
    if (this.rxFileIsImg && typeof URL !== 'undefined') {
      try {
        this.rxFileUrl = URL.createObjectURL(f);
      } catch {}
    }
  }

  clearRx(): void {
    this.rxFileName = '';
    this.rxFileSize = '';
    this.rxFileIsImg = false;
    this.rxFileUrl = '';
    this.rxFileObj = null;
  }

  getCartEntries(): { key: string; med: Medicine; mode: string; qty: number }[] {
    const cart = this.medService.cart();
    return Object.entries(cart)
      .filter(([_, qty]) => qty > 0)
      .map(([key, qty]) => {
        const [id, mode] = key.split('|');
        const med = this.medService.getMedicineById(Number(id))!;
        return { key, med, mode, qty };
      });
  }

  getBlisterData(): any[] {
    const entries = this.getCartEntries();
    const totals: Record<number, number> = {};
    entries.forEach(e => {
      const sz = this.medService.packSize(e.med);
      totals[e.med.id] = (totals[e.med.id] || 0) + (e.mode === 's' ? e.qty : e.qty * sz);
    });

    const result: any[] = [];
    Object.keys(totals).forEach((idStr, j) => {
      const medId = Number(idStr);
      const m = this.medService.getMedicineById(medId)!;
      const sz = this.medService.packSize(m);
      const totalUnits = totals[medId];
      const stripsCount = Math.ceil(totalUnits / sz);

      for (let st = 0; st < Math.min(stripsCount, 4); st++) {
        const fill = Math.min(sz, totalUnits - st * sz);
        const cells: any[] = [];
        for (let c = 0; c < sz; c++) {
          cells.push({
            filled: c < fill,
            color: this.medService.cellColors[j % this.medService.cellColors.length],
            letter: m.n[0]
          });
        }
        result.push({
          id: medId,
          stripIndex: st,
          name: m.n,
          fill,
          size: sz,
          cells
        });
      }
    });
    return result;
  }

  submitOrder(): void {
    const cleanPhone = this.custPhone.replace(/[^0-9]/g, '');
    const entries = this.getCartEntries();
    const shop = this.medService.selectedShop();

    if (!shop) {
      this.orderError = "Choose a pharmacy first.";
      const el = document.getElementById('picker');
      el?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!entries.length && !this.custNote.trim() && !this.rxFileObj) {
      this.orderError = "Add a medicine, describe what you need, or upload a prescription.";
      return;
    }

    if (this.medService.hasRxInCart() && !this.rxFileObj) {
      this.orderError = "Upload your prescription for the Rx medicines in your pack.";
      return;
    }

    if (this.custName.trim().length < 2) {
      this.orderError = "Enter your name.";
      return;
    }

    if (cleanPhone.length < 10 || cleanPhone.length > 13) {
      this.orderError = "Enter a mobile number with 10 to 13 digits.";
      return;
    }

    if (this.custAddr.trim().length < 6) {
      this.orderError = "Enter your delivery address and city.";
      return;
    }

    this.orderError = '';

    const ch = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "MD-";
    for (let i = 0; i < 5; i++) code += ch[Math.floor(Math.random() * ch.length)];

    const parts = entries.map(e => `${e.med.n} (${e.mode === 's' ? 'single' : 'full pack'}) × ${e.qty}`);
    if (this.rxFileObj) parts.push(`Prescription: ${this.rxFileObj.name}`);
    if (this.custNote.trim()) parts.push(this.custNote.trim());
    const items = parts.join(', ');

    const order: MedicineOrder = {
      code,
      shop: `${shop.n} · ${shop.a}`,
      items,
      phone: this.custPhone.trim()
    };

    this.medService.addOrder(order);
    this.lastOrderCode = code;
    this.lastOrderShop = shop.n;
    this.lastOrderItems = items;
    this.orderSuccessOpen = true;

    this.custNote = '';
    this.clearRx();
  }

  submitPartner(e: Event): void {
    e.preventDefault();
    const ph = this.ptPhone.replace(/[^0-9]/g, '');
    if (this.ptName.trim().length < 2 || this.ptArea.trim().length < 2) {
      this.ptMessage = "Enter the pharmacy name and its area.";
      return;
    }
    if (ph.length < 10 || ph.length > 13) {
      this.ptMessage = "Enter a contact number with 10 to 13 digits.";
      return;
    }
    this.ptMessage = `Thanks. We will contact you on ${this.ptPhone} to set up ${this.ptName}.`;
    this.ptName = '';
    this.ptArea = '';
    this.ptPhone = '';
  }

  onBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal')) {
      this.orderSuccessOpen = false;
    }
  }
}
