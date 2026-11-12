import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MedicineService } from '../../shared/services/medicine.service';
import { ToastService } from '../../shared/services/toast.service';
import { SeoService } from '../../shared/services/seo.service';
import { Medicine, Pharmacy, MedicineOrder, NeedCategory } from '../../shared/models';

@Component({
  selector: 'app-medicine',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    @if (viewMode === 'catalog') {
      <section class="sec pg-medicine">
        <div class="wrap catalog-page">
          <a class="pgback" routerLink="/medicine">Back to medicine</a>
          <div class="catalog-heading">
            <span class="eyebrow">PulseQ medicine catalog</span>
            <h2>Search {{ medService.medicines().length }} medicines</h2>
            <p class="muted">Brands, generics and strengths from partner pharmacies.</p>
            <a class="btn btn-ink" routerLink="/medicine/pharmacies">Partner pharmacies</a>
            <label class="sr" for="catalogMedicineSearch">Search medicines</label>
            <input id="catalogMedicineSearch" class="inp" type="search" [(ngModel)]="catalogQuery" (ngModelChange)="resetCatalogPage()" placeholder="Medicine, brand or generic name" autocomplete="off">
          </div>
          <div class="catalog-filters">
            <div class="catalog-letters" role="group" aria-label="Browse medicines by first letter">
              <button class="catalog-letter" [class.on]="catalogLetter === '#'" type="button" aria-label="Medicines beginning with a number" [disabled]="medicineCountForLetter('#') === 0" [attr.aria-pressed]="catalogLetter === '#'" (click)="catalogLetter = '#'; resetCatalogPage()">#</button>
              @for (letter of catalogAlphabet; track letter) {
                <button class="catalog-letter" [class.on]="catalogLetter === letter" type="button" [disabled]="medicineCountForLetter(letter) === 0" [attr.aria-pressed]="catalogLetter === letter" (click)="catalogLetter = letter; resetCatalogPage()">{{ letter }}</button>
              }
            </div>
            <div class="catalog-filter-row" role="group" aria-label="Filter by medicine type">
              <span class="catalog-filter-label">Type</span>
              <button class="chip" [class.on]="catalogForm === 'all'" type="button" [attr.aria-pressed]="catalogForm === 'all'" (click)="catalogForm = 'all'; resetCatalogPage()">All types</button>
              @for (form of medicineForms(); track form) {
                <button class="chip" [class.on]="catalogForm === form" type="button" [attr.aria-pressed]="catalogForm === form" (click)="catalogForm = form; resetCatalogPage()">{{ form }} ({{ medicineCountForForm(form) }})</button>
              }
            </div>
            <div class="catalog-filter-row" role="group" aria-label="Filter by medicine category">
              <span class="catalog-filter-label">Category</span>
              <button class="chip" [class.on]="catalogCategory === 'all'" type="button" [attr.aria-pressed]="catalogCategory === 'all'" (click)="catalogCategory = 'all'; resetCatalogPage()">All categories</button>
              @for (category of medicineCategories(); track category.key) {
                <button class="chip" [class.on]="catalogCategory === category.key" type="button" [attr.aria-pressed]="catalogCategory === category.key" (click)="catalogCategory = category.key; resetCatalogPage()">{{ category.label }} ({{ medicineCountForCategory(category.key) }})</button>
              }
            </div>
            <div class="catalog-filter-row catalog-rx" role="group" aria-label="Prescription">
              <button class="chip" [class.on]="catalogRx === 'all'" [attr.aria-pressed]="catalogRx === 'all'" type="button" (click)="catalogRx = 'all'; resetCatalogPage()">All</button>
              <button class="chip" [class.on]="catalogRx === 'rx'" [attr.aria-pressed]="catalogRx === 'rx'" type="button" (click)="catalogRx = 'rx'; resetCatalogPage()">Prescription only</button>
              <button class="chip" [class.on]="catalogRx === 'otc'" [attr.aria-pressed]="catalogRx === 'otc'" type="button" (click)="catalogRx = 'otc'; resetCatalogPage()">No prescription</button>
            </div>
          </div>
          <div class="catalog-results-bar">
            @let catalogMeds = filteredCatalogMeds();
            <p aria-live="polite">Showing {{ Math.min(catalogVisibleLimit, catalogMeds.length) }} of {{ catalogMeds.length }} medicines</p>
            <label for="catalogMedicineSort">Sort</label>
            <select id="catalogMedicineSort" [(ngModel)]="catalogSort" (ngModelChange)="resetCatalogPage()" aria-label="Sort medicines">
              <option value="az">A to Z</option>
              <option value="za">Z to A</option>
            </select>
          </div>
          <div class="catalog-list" aria-live="polite">
            @for (m of catalogMeds.slice(0, catalogVisibleLimit); track m.id) {
              <a class="catalog-row" routerLink="/medicine" [queryParams]="{ medicine: m.id }">
                <span class="catalog-row-main">
                  <b>{{ m.n }}</b>
                  <small>{{ m.g }} · {{ m.f }}</small>
                </span>
                <span class="catalog-row-badges">
                  @if (m.rx === 1) { <span class="tag rx">Rx</span> }
                  <span class="catalog-category-badge">{{ categoryLabel(m.c) }}</span>
                </span>
                <span class="catalog-arrow" aria-hidden="true">›</span>
              </a>
            }
            @if (catalogMeds.length === 0) {
              <div class="empty">
                <h3 style="font-size:24px">No medicines match</h3>
                <p class="muted">Try another medicine name or generic.</p>
              </div>
            }
          </div>
          @if (catalogMeds.length > catalogVisibleLimit) {
            <div class="load-more-wrap">
              <button class="load-more-btn" type="button" (click)="loadMoreCatalog()">Load more medicines <span>{{ catalogMeds.length - catalogVisibleLimit }} remaining</span></button>
            </div>
          }
          <p class="medicine-safety-note">This information is general and is not medical advice. Follow your doctor’s prescription and the medicine label.</p>
        </div>
      </section>
    } @else if (viewMode === 'medicine-detail') {
      <section class="sec pg-medicine">
        <div class="wrap catalog-page">
          <a class="pgback" routerLink="/medicine/catalog">Back to medicine catalog</a>
          @if (getCatalogMedicine(); as m) {
            <article class="catalog-detail">
              <span class="eyebrow">PulseQ medicine catalog</span>
              <h2>{{ m.n }} @if (m.rx === 1) { <span class="tag rx">Prescription required</span> }</h2>
              <p class="muted">{{ m.g }} · {{ m.f }}</p>
              <p>{{ m.u }}</p>
              <div class="catalog-detail-grid">
                <div><h3>Good to know</h3><p class="muted">{{ m.w }}</p></div>
                <div><h3>Possible side effects</h3><ul>@for (item of m.s; track item) { <li>{{ item }}</li> }</ul></div>
                <div><h3>Precautions</h3><ul>@for (item of m.p; track item) { <li>{{ item }}</li> }</ul></div>
              </div>
              @if (m.rx === 1) {
                <p class="catalog-caution">This medicine requires a prescription. Do not use it without advice from a qualified healthcare professional.</p>
              }
              <div class="catalog-actions">
                <button class="btn btn-ink" type="button" (click)="addCatalogMedicine(m)">Add to your pack</button>
                <a class="btn btn-line" routerLink="/medicine/pharmacies">Browse partner pharmacies</a>
                <a class="btn btn-line" routerLink="/medicine">Go to ordering</a>
              </div>
            </article>
          } @else {
            <div class="empty"><h2>Medicine not found</h2><p class="muted">Choose a medicine from the catalog.</p></div>
          }
        </div>
      </section>
    } @else if (viewMode === 'pharmacies') {
      <section class="sec pg-medicine">
        <div class="wrap catalog-page">
          <a class="pgback" routerLink="/medicine">Back to medicine</a>
          <div class="catalog-heading">
            <span class="eyebrow">PulseQ pharmacies</span>
            <h2>Partner pharmacies near you.</h2>
            <p class="muted">Search by pharmacy, area or city. Open a pharmacy to browse its stock and prices.</p>
            <label class="sr" for="pharmacySearch">Search pharmacies</label>
            <input id="pharmacySearch" class="inp" type="search" [(ngModel)]="pharmacyQuery" placeholder="Pharmacy, area or city" autocomplete="off">
            <a class="btn btn-ink" routerLink="/medicine/catalog">Medicine catalog</a>
          </div>
          <div class="chips pharmacy-cities" role="group" aria-label="Pharmacy city">
            <button class="chip" [class.on]="pharmacyCity === 'all'" [attr.aria-pressed]="pharmacyCity === 'all'" type="button" (click)="pharmacyCity = 'all'">All cities</button>
            @for (city of pharmacyCities(); track city) {
              <button class="chip" [class.on]="pharmacyCity === city" [attr.aria-pressed]="pharmacyCity === city" type="button" (click)="pharmacyCity = city">{{ city }}</button>
            }
          </div>
          <div class="pharmacy-grid">
            @for (shop of filteredPharmacies(); track shop.id) {
              <article class="pharmacy-card">
                <h3>{{ shop.n }}</h3>
                <p class="muted">{{ shop.a }} · {{ shop.c }}</p>
                <div class="tags"><span class="tag">{{ shop.h }}</span><span class="tag">Delivery Rs {{ shop.fee }}</span></div>
                <a class="btn btn-ink full" [routerLink]="['/medicine/pharmacies', shop.id]">Open pharmacy</a>
              </article>
            }
            @if (filteredPharmacies().length === 0) {
              <div class="empty" style="grid-column:1/-1"><h3>No pharmacies match</h3><p class="muted">Try another name, area or city.</p></div>
            }
          </div>
        </div>
      </section>
    } @else if (viewMode === 'pharmacy-detail') {
      <section class="sec pg-medicine">
        <div class="wrap catalog-page">
          <a class="pgback" routerLink="/medicine/pharmacies">All partner pharmacies</a>
          @if (getPharmacyDetail(); as shop) {
            <div class="catalog-heading">
              <span class="eyebrow">PulseQ pharmacy</span>
              <h2>{{ shop.n }}</h2>
              <p class="muted">{{ shop.a }}, {{ shop.c }} · {{ shop.h }} · Delivery Rs {{ shop.fee }}</p>
              <label class="sr" for="pharmacyStockSearch">Search this pharmacy’s medicines</label>
              <input id="pharmacyStockSearch" class="inp" type="search" [(ngModel)]="catalogQuery" placeholder="Medicine, brand or generic name" autocomplete="off">
            </div>
            <div class="catalog-list">
              @for (m of pharmacyStock(shop); track m.id) {
                <a class="catalog-row" routerLink="/medicine" [queryParams]="{ medicine: m.id }">
                  <span class="catalog-row-main">
                    <b>{{ m.n }} @if (m.rx === 1) { <span class="tag rx">Rx</span> }</b>
                    <small>{{ m.g }} · {{ m.f }}</small>
                  </span>
                  <span class="catalog-price">Rs {{ medService.priceAt(m, shop) }}</span>
                  <span class="catalog-arrow" aria-hidden="true">›</span>
                </a>
              }
              @if (pharmacyStock(shop).length === 0) {
                <div class="empty"><h3>No stock matches</h3><p class="muted">Try another medicine name.</p></div>
              }
            </div>
            <p class="muted xs catalog-disclaimer">Confirm current availability and prices with the pharmacy before ordering.</p>
          } @else {
            <div class="empty"><h2>Pharmacy not found</h2><p class="muted">Choose a partner pharmacy from the directory.</p></div>
          }
        </div>
      </section>
    } @else {
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
            <div class="catalog-entry-row">
              <a class="catalog-entry catalog-entry-primary" routerLink="/medicine/catalog">
                <span class="catalog-entry-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 20.5a5 5 0 0 1-7-7l9-9a5 5 0 0 1 7 7z"/><path d="m8.5 8.5 7 7"/></svg>
                </span>
                <span><b>Medicine catalog</b><small>{{ medService.medicines().length }} medicines · search by name or generic</small></span>
                <span class="catalog-entry-go" aria-hidden="true">→</span>
              </a>
              <a class="catalog-entry" routerLink="/medicine/pharmacies">
                <span class="catalog-entry-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m4 9 1.5-5h13L20 9"/><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/></svg>
                </span>
                <span><b>Partner pharmacies</b><small>Stock and prices by pharmacy</small></span>
                <span class="catalog-entry-go" aria-hidden="true">→</span>
              </a>
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
              {{ matchingPharmacies().length }} {{ matchingPharmacies().length === 1 ? 'pharmacy' : 'pharmacies' }} in {{ selectedArea }}{{ isNear ? ' (near you)' : '' }}.
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
            @let on = !searchQuery && selectedNeed === n.k;
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
              @let baseMedsList = baseMeds();
              @let medicines = filteredMeds();
              @if (searchQuery.trim()) {
                <h3 style="font-size:26px;margin-bottom:12px">Results for “{{ searchQuery.trim() }}”</h3>
              } @else {
                @if (selectedNeedInfo(); as need) {
                  <h3 style="font-size:26px;margin-bottom:12px">{{ need.t }}</h3>
                  <div class="flag">
                    <p><b>See a doctor if:</b> {{ need.flag }}</p>
                    <a class="btn btn-ink" [routerLink]="['/find-doctors']" [queryParams]="{ spec: need.spec }">Book a doctor</a>
                  </div>
                }
              }

              @if (baseMedsList.length > 0) {
                <div class="mfilt">
                  <div class="chips" role="group" aria-label="Medicine form">
                    <button class="chip" [class.on]="mainForm === 'all'" [attr.aria-pressed]="mainForm === 'all'" type="button" (click)="mainForm = 'all'">All types</button>
                    @for (form of mainMedicineForms(); track form) {
                      <button class="chip" [class.on]="mainForm === form" [attr.aria-pressed]="mainForm === form" type="button" (click)="mainForm = form">{{ form }}</button>
                    }
                  </div>
                  <div class="chips" role="group" aria-label="Prescription">
                    <button class="chip" [class.on]="mainRx === 'all'" [attr.aria-pressed]="mainRx === 'all'" type="button" (click)="mainRx = 'all'">Any</button>
                    <button class="chip" [class.on]="mainRx === 'otc'" [attr.aria-pressed]="mainRx === 'otc'" type="button" (click)="mainRx = 'otc'">No prescription</button>
                    <button class="chip" [class.on]="mainRx === 'rx'" [attr.aria-pressed]="mainRx === 'rx'" type="button" (click)="mainRx = 'rx'">Needs Rx</button>
                  </div>
                  <label class="sr" for="mainMedicineSort">Sort medicines</label>
                  <select id="mainMedicineSort" [(ngModel)]="mainSort" aria-label="Sort medicines">
                    <option value="az">Name A to Z</option>
                    <option value="price">Price: low to high</option>
                  </select>
                </div>
                <p class="muted sm" aria-live="polite" style="margin:6px 0 12px">
                  {{ medicines.length }} {{ medicines.length === 1 ? 'medicine' : 'medicines' }}
                </p>
              }

              @if (medicines.length > 0) {
                @for (m of medicines; track m.id) {
                  @let u = getUnits(m);
                  @let mode = medService.modeOf(m.id);
                  @let selectedShop = medService.selectedShop();
                  @let isOpen = medService.isInfoOpen(m.id);
                  @let isWhere = medService.isWhereOpen(m.id);
                  @let inCart = medService.inCartCount(m.id, mode);
                  <article class="strip" [id]="'medicine-' + m.id">
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

                      <div class="medicine-price" aria-live="polite">
                        <span class="medicine-price-copy">
                          <b>{{ u[mode === 's' ? 0 : 1] }} price</b>
                          <small>{{ selectedShop ? 'Estimate for ' + selectedShop.n : 'Estimate · varies by pharmacy' }}</small>
                        </span>
                        <strong>Rs {{ mainMedicinePrice(m) }}</strong>
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
                          <span class="muted xs">Showing the {{ mode === 's' ? 'price of a single tablet/unit' : 'full strip/pack' }}.</span>
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
              } @else if (baseMedsList.length === 0 && searchQuery.trim()) {
                <div class="empty">
                  <h3 style="font-size:24px">We don’t list that one yet</h3>
                  <p class="muted">Check the spelling or try searching by generic name.</p>
                  <button class="btn btn-ink" type="button" (click)="clearMedicineSearch()">Clear search</button>
                </div>
              } @else if (baseMedsList.length > 0) {
                <div class="empty">
                  <h3 style="font-size:24px">Nothing matches these filters</h3>
                  <p class="muted">Try another medicine form or prescription filter.</p>
                  <button class="btn btn-ink" type="button" (click)="resetMainMedicineFilters()">Clear filters</button>
                </div>
              }
            </div>
            <p class="medicine-safety-note">Information is general and is not medical advice. Always follow your doctor’s prescription and the label. Medicines marked Rx need a prescription.</p>
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
              <p class="muted sm">Note: your file stays in this browser. A live site sends it securely to your pharmacy only.</p>
            </div>
            @if (medService.hasRxInCart()) {
              <p class="muted xs" id="rxNote">Your pack has prescription (Rx) medicines. Upload your prescription so the pharmacy can check it.</p>
            }
            <p class="err" id="medErr" role="alert" *ngIf="orderError && !orderError.includes('prescription')">{{ orderError }}</p>
            <button class="btn btn-coral full" id="medGo" type="button" (click)="submitOrder()">Place order</button>
          </aside>
        </div>

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
      <div class="modal order-success-modal" id="omodal" (click)="onBackdrop($event)">
        <div class="panel order-success-panel" role="dialog" aria-modal="true" aria-labelledby="oTitle" tabindex="-1" id="opanel">
          <div class="order-success-heading">
            <span class="order-success-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#102A43" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5"></path>
              </svg>
            </span>
            <h3 id="oTitle">Order placed</h3>
          </div>
          <p class="order-success-message" id="oMsg"><b>{{ lastOrderShop }}</b> will contact you on <b>{{ custPhone }}</b> to confirm your order and arrange delivery.</p>
          <div class="bk">
            <span class="muted xs">Order code</span>
            <code id="oCode">{{ lastOrderCode }}</code>
            <p class="sm" id="oItems">{{ lastOrderItems }}</p>
          </div>
          <p class="muted sm">Please keep your phone nearby.<br>Note: orders here are saved in this browser only.</p>
          <button class="btn btn-ink full" id="oClose" type="button" (click)="orderSuccessOpen = false">Done</button>
        </div>
      </div>
    }
    }
  `,
  styles: [`
    :host { display: block; }
    .pg-medicine { display: block !important; }
    .catalog-page { max-width: 1080px; }
    .strip { scroll-margin-top: 24px; }
    .catalog-heading { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; margin: 8px 0 16px; }
    .catalog-heading h2, .catalog-detail h2 { font-size: clamp(28px, 4vw, 44px); }
    .catalog-heading .inp { width: min(100%, 560px); }
    .catalog-heading > .btn { order: 2; }
    .catalog-heading > label, .catalog-heading > .inp { order: 3; }
    .order-success-modal {
      align-items: flex-start;
      padding-top: max(24px, env(safe-area-inset-top, 0px));
      padding-bottom: max(24px, env(safe-area-inset-bottom, 0px));
    }
    .order-success-panel {
      max-height: calc(100dvh - max(48px, env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px)));
      overflow-y: auto;
      gap: 14px;
    }
    .order-success-heading {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .order-success-heading h3 {
      font-size: clamp(26px, 5vw, 32px);
      line-height: 1.05;
    }
    .order-success-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--mint);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
    }
    .order-success-message {
      font-size: clamp(17px, 3vw, 20px);
      line-height: 1.45;
    }
    @media (max-width: 640px) {
      .order-success-modal {
        align-items: flex-start !important;
        justify-content: center !important;
        padding: max(16px, env(safe-area-inset-top, 0px)) 12px 16px !important;
      }
      .order-success-panel {
        width: 100% !important;
        max-width: 560px !important;
        max-height: calc(100dvh - max(32px, env(safe-area-inset-top, 0px) + 16px)) !important;
        margin: 0 !important;
        padding: 22px 18px !important;
        border-radius: 28px !important;
      }
    }
    .catalog-filters { display: flex; flex-direction: column; gap: 10px; margin: 8px 0 10px; }
    .catalog-letters { display: flex; flex-wrap: wrap; gap: 4px; }
    .catalog-letter { width: 30px; min-height: 30px; padding: 0; border: 1px solid #DCE8F8; border-radius: 8px; background: #fff; color: #1558B8; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
    .catalog-letter:hover:not(:disabled), .catalog-letter.on { border-color: #2381FF; background: #EAF3FF; }
    .catalog-letter:disabled { color: #B8C2CE; background: #F8FAFC; cursor: not-allowed; }
    .catalog-filter-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
    .catalog-filter-label { width: 66px; flex: none; color: var(--muted); font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
    .catalog-filter-row .chip { min-height: 38px; padding: 0 14px; font-size: 14px; }
    .catalog-rx { margin-top: 2px; }
    .catalog-results-bar { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin: 8px 0 10px; color: var(--muted); font-size: 13px; }
    .catalog-results-bar p { flex: 1; margin: 0; color: var(--fg); font-size: 14px; font-weight: 700; }
    .catalog-results-bar select { min-height: 38px; border: 1px solid #DCE8F8; border-radius: 12px; background: #fff; padding: 0 10px; color: var(--fg); font: inherit; }
    .pharmacy-cities { margin-bottom: 16px; }
    .catalog-list { display: grid; gap: 10px; }
    .catalog-row { display: flex; align-items: center; gap: 14px; min-width: 0; padding: 12px 14px; border-radius: 16px; background: #fff; box-shadow: inset 0 0 0 1px #DCE8F8; color: var(--fg); text-decoration: none; }
    .catalog-row:hover { box-shadow: inset 0 0 0 2px #2381FF; }
    .catalog-row-main { flex: 1; min-width: 0; }
    .catalog-row-main b, .catalog-row-main small { display: block; }
    .catalog-row-main b { font-size: 15px; }
    .catalog-row-main small { color: var(--muted); margin-top: 3px; font-size: 13px; }
    .catalog-row-badges { display: flex; flex: none; align-items: center; gap: 6px; }
    .catalog-category-badge { border-radius: 999px; background: #EFF6FF; color: #1558B8; padding: 5px 10px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .catalog-arrow, .catalog-price { flex: none; color: #1558B8; font-weight: 800; }
    .catalog-detail { padding: clamp(20px, 4vw, 36px); border-radius: 24px; background: #fff; box-shadow: inset 0 0 0 1px #DCE8F8; }
    .catalog-detail h2 { margin: 10px 0 6px; }
    .catalog-detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 16px; margin-top: 24px; }
    .catalog-detail-grid > div { padding: 18px; border-radius: 16px; background: #F5F9FF; }
    .catalog-detail-grid h3 { margin-bottom: 8px; }
    .catalog-detail-grid ul { padding-left: 20px; }
    .catalog-caution { margin-top: 18px; padding: 12px 14px; border-radius: 12px; background: #FFF7E5; color: #78350F; }
    .medicine-safety-note { margin-top: 20px; max-width: 640px; padding: 16px 18px; border: 1px solid #BFDBFE; border-left: 5px solid #2381FF; border-radius: 16px; background: #EFF6FF; color: #102A43; font-size: 16px; font-weight: 600; line-height: 1.55; }
    .catalog-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
    .catalog-disclaimer { margin-top: 18px; max-width: 700px; }
    .pharmacy-grid { display: grid; width: 100%; min-width: 0; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
    .pharmacy-card { display: flex; min-width: 0; flex-direction: column; gap: 10px; padding: 20px; border-radius: 20px; background: #fff; box-shadow: inset 0 0 0 1px #DCE8F8; }
    .pharmacy-card .tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .pharmacy-card .btn { margin-top: auto; }
    @media (max-width: 1100px) { .pharmacy-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (max-width: 900px) { .pharmacy-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 560px) { .pharmacy-grid { grid-template-columns: minmax(0, 1fr); } }
    .catalog-entry-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 12px; max-width: 640px; }
    .catalog-entry { display: flex; align-items: center; gap: 14px; min-height: 78px; padding: 14px 16px; border-radius: 20px; background: #fff; box-shadow: inset 0 0 0 1.5px #DCE8F8, 0 1px 2px rgba(16,42,67,.04); color: #102A43; text-decoration: none; transition: transform .18s, box-shadow .18s; }
    .catalog-entry:hover { transform: translateY(-2px); box-shadow: inset 0 0 0 1.5px #2381FF, 0 14px 30px -16px rgba(35,129,255,.6); }
    .catalog-entry-primary { color: #fff; background: linear-gradient(135deg,#2381FF,#1558B8); }
    .catalog-entry-icon { display: grid; place-items: center; flex: none; width: 46px; height: 46px; border-radius: 14px; color: #1558B8; background: #EAF3FF; font-weight: 800; }
    .catalog-entry-primary .catalog-entry-icon, .catalog-entry-primary .catalog-entry-go { color: #fff; background: rgba(255,255,255,.18); }
    .catalog-entry b, .catalog-entry small { display: block; }
    .catalog-entry small { margin-top: 3px; color: #526477; font-size: 13px; }
    .catalog-entry-primary small { color: rgba(255,255,255,.88); }
    .catalog-entry-go { display: grid; place-items: center; flex: none; width: 32px; height: 32px; border-radius: 50%; color: #1558B8; background: #EAF3FF; }
    .mfilt { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 18px; margin: 4px 0 6px; }
    .mfilt .chips { gap: 6px; }
    .mfilt .chip { min-height: 40px; padding: 0 14px; font-size: 14px; }
    .mfilt select { min-height: 44px; max-width: 100%; border: 1.5px solid var(--line); border-radius: 999px; background: #fff; padding: 0 14px; font: inherit; }
    @media (max-width: 760px) { .mfilt { align-items: flex-start; flex-direction: column; } }
    @media (max-width: 560px) {
      .catalog-heading { margin-top: 0; }
      .catalog-heading h2, .catalog-detail h2 { font-size: 32px; }
      .catalog-filter-label { width: 100%; }
      .catalog-letters { gap: 3px; }
      .catalog-letter { width: 28px; }
      .catalog-row { align-items: flex-start; gap: 8px; padding: 12px; }
      .catalog-row-badges { flex-direction: column; align-items: flex-end; }
      .catalog-category-badge { max-width: 112px; overflow: hidden; text-overflow: ellipsis; }
      .catalog-arrow { align-self: center; }
    }
    @media (prefers-reduced-motion: reduce) { .catalog-entry { transition: none; } }
  `]
})
export class MedicineComponent implements OnInit {
  medService = inject(MedicineService);
  toast = inject(ToastService);
  seo = inject(SeoService);
  router = inject(Router);

  viewMode: 'main' | 'catalog' | 'medicine-detail' | 'pharmacies' | 'pharmacy-detail' = 'main';
  catalogQuery = '';
  pharmacyQuery = '';
  catalogForm = 'all';
  catalogCategory = 'all';
  catalogRx: 'all' | 'rx' | 'otc' = 'all';
  catalogLetter = 'all';
  catalogSort: 'az' | 'za' = 'az';
  catalogAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  catalogVisibleLimit = 20;
  pharmacyCity = 'all';
  routeId: number | null = null;

  areaNames = Object.keys(this.medService.areas);
  areaInput = '';
  selectedArea = '';
  isNear = false;
  selectedNeed = 'pain';
  selectedMedicineId: number | null = null;
  searchQuery = '';
  mainForm = 'all';
  mainRx: 'all' | 'otc' | 'rx' = 'all';
  mainSort: 'az' | 'price' = 'az';

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
    const [url, query = ''] = this.router.url.split('?');
    if (url === '/medicine/catalog') {
      this.viewMode = 'catalog';
      this.seo.setPage('Medicine Catalog');
    } else if (url.startsWith('/medicine/catalog/')) {
      this.viewMode = 'medicine-detail';
      this.routeId = Number(url.split('/').pop());
      this.seo.setPage('Medicine Details');
    } else if (url === '/medicine/pharmacies') {
      this.viewMode = 'pharmacies';
      this.seo.setPage('Partner Pharmacies');
    } else if (url.startsWith('/medicine/pharmacies/')) {
      this.viewMode = 'pharmacy-detail';
      this.routeId = Number(url.split('/').pop());
      this.seo.setPage('Pharmacy Details');
    } else {
      this.seo.setPage('Order Medicine Online');
      const selectedMedicineId = Number(new URLSearchParams(query).get('medicine'));
      const selectedMedicine = Number.isInteger(selectedMedicineId) && selectedMedicineId > 0
        ? this.medService.getMedicineById(selectedMedicineId)
        : undefined;
      if (selectedMedicine) {
        this.selectedMedicineId = selectedMedicine.id;
        this.searchQuery = selectedMedicine.n;
        this.selectedNeed = selectedMedicine.c;
        if (!this.medService.isInfoOpen(selectedMedicine.id)) {
          this.medService.toggleInfo(selectedMedicine.id);
        }
        if (!this.medService.isWhereOpen(selectedMedicine.id)) {
          this.medService.toggleWhere(selectedMedicine.id);
        }
        if (typeof document !== 'undefined') {
          setTimeout(() => {
            document.getElementById(`medicine-${selectedMedicine.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }
      }
    }
  }

  filteredCatalogMeds(): Medicine[] {
    const q = this.catalogQuery.trim().toLowerCase();
    return this.medService.medicines()
      .filter(m =>
        (!q || `${m.n} ${m.g} ${m.f} ${m.u}`.toLowerCase().includes(q)) &&
        (this.catalogLetter === 'all' || this.catalogInitial(m.n) === this.catalogLetter) &&
        (this.catalogForm === 'all' || m.f === this.catalogForm) &&
        (this.catalogCategory === 'all' || m.c === this.catalogCategory) &&
        (this.catalogRx === 'all' || (this.catalogRx === 'rx' ? m.rx === 1 : m.rx !== 1))
      )
      .sort((a, b) => this.catalogSort === 'az' ? a.n.localeCompare(b.n) : b.n.localeCompare(a.n));
  }

  resetCatalogPage(): void {
    this.catalogVisibleLimit = 20;
  }

  loadMoreCatalog(): void {
    this.catalogVisibleLimit += 20;
  }

  catalogInitial(name: string): string {
    const initial = name.trim().charAt(0).toUpperCase();
    return /^[A-Z]$/.test(initial) ? initial : '#';
  }

  medicineCountForLetter(letter: string): number {
    return this.medService.medicines().filter(m => this.catalogInitial(m.n) === letter).length;
  }

  medicineCountForForm(form: string): number {
    return this.medService.medicines().filter(m => m.f === form).length;
  }

  medicineCountForCategory(category: string): number {
    return this.medService.medicines().filter(m => m.c === category).length;
  }

  medicineForms(): string[] {
    return [...new Set(this.medService.medicines().map(m => m.f))].sort((a, b) => a.localeCompare(b));
  }

  medicineCategories(): { key: string; label: string }[] {
    return [...new Set(this.medService.medicines().map(m => m.c))]
      .map(key => ({ key, label: this.medService.needs().find(need => need.k === key)?.t || key }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  categoryLabel(key: string): string {
    return this.medService.needs().find(need => need.k === key)?.t || key;
  }

  getCatalogMedicine(): Medicine | undefined {
    return this.routeId ? this.medService.getMedicineById(this.routeId) : undefined;
  }

  getPharmacyDetail(): Pharmacy | undefined {
    return this.routeId ? this.medService.getPharmacyById(this.routeId) : undefined;
  }

  filteredPharmacies(): Pharmacy[] {
    const q = this.pharmacyQuery.trim().toLowerCase();
    return this.medService.pharmacies()
      .filter(shop => (this.pharmacyCity === 'all' || shop.c === this.pharmacyCity) && (!q || `${shop.n} ${shop.a} ${shop.c}`.toLowerCase().includes(q)))
      .sort((a, b) => a.c.localeCompare(b.c) || a.n.localeCompare(b.n));
  }

  pharmacyCities(): string[] {
    return [...new Set(this.medService.pharmacies().map(shop => shop.c))].sort((a, b) => a.localeCompare(b));
  }

  pharmacyStock(shop: Pharmacy): Medicine[] {
    const q = this.catalogQuery.trim().toLowerCase();
    return this.medService.medicines().filter(m =>
      this.medService.isStockedAt(m, shop) &&
      (!q || `${m.n} ${m.g} ${m.f} ${m.u}`.toLowerCase().includes(q))
    );
  }

  addCatalogMedicine(medicine: Medicine): void {
    this.medService.addToCart(medicine.id);
    this.toast.show(`${medicine.n} added to your pack`);
  }

  onSearchInput(): void {
    this.selectedMedicineId = null;
    this.mainForm = 'all';
    this.mainRx = 'all';
  }

  clearMedicineSearch(): void {
    this.selectedMedicineId = null;
    this.searchQuery = '';
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
    this.selectedMedicineId = null;
    this.selectedNeed = key;
    this.searchQuery = '';
    this.mainForm = 'all';
    this.mainRx = 'all';
  }

  selectedNeedInfo(): NeedCategory | undefined {
    return this.medService.needs().find(need => need.k === this.selectedNeed);
  }

  baseMeds(): Medicine[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (this.selectedMedicineId !== null) {
      return this.medService.medicines().filter(m => m.id === this.selectedMedicineId);
    }
    return q
      ? this.medService.medicines().filter(m => `${m.n} ${m.g} ${m.u}`.toLowerCase().includes(q))
      : this.medService.medicines().filter(m => m.c === this.selectedNeed);
  }

  mainMedicineForms(): string[] {
    return [...new Set(this.baseMeds().map(m => m.f))].sort((a, b) => a.localeCompare(b));
  }

  filteredMeds(): Medicine[] {
    return this.baseMeds()
      .filter(m =>
        (this.mainForm === 'all' || m.f === this.mainForm) &&
        (this.mainRx === 'all' || (this.mainRx === 'rx' ? m.rx === 1 : m.rx !== 1))
      )
      .sort((a, b) => this.mainSort === 'price'
        ? this.mainMedicinePrice(a) - this.mainMedicinePrice(b)
        : a.n.localeCompare(b.n));
  }

  mainMedicinePrice(m: Medicine): number {
    const shop = this.medService.selectedShop();
    const price = shop ? this.medService.priceAt(m, shop) : this.medService.baseMedPrice(m);
    return this.medService.modeOf(m.id) === 's' ? Math.ceil(price / this.medService.packSize(m)) : price;
  }

  resetMainMedicineFilters(): void {
    this.mainForm = 'all';
    this.mainRx = 'all';
    this.mainSort = 'az';
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
