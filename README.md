# PulseQ — Healthcare Booking Platform for Pakistan

PulseQ is a high-performance, mobile-first Angular 18+ healthcare booking web application built for Pakistan. It provides real-time doctor appointments across multi-place clinics, hospital directories, surgery procedure cost comparisons, neighborhood medicine deliveries with custom blister-pack ordering, an interactive 2D/3D Body Map, and an AI healthcare triage assistant (Pulse) fluent in English and Urdu.

> **Current delivery status:** This repository is a frontend/demo application. Booking, medicine-order, and surgery data currently use local mock services and browser storage for demonstration only. Do not use it with real patient data. Before production, replace those services with authenticated server APIs and server-authoritative validation, then complete the security checklist below.

---

## Architecture & Technology Stack

- **Framework**: Angular 18+ (Standalone Components, Signals, New Control Flow `@if` / `@for` / `@let`)
- **Rendering**: Angular Universal / SSR (Server-Side Rendering) with static route pre-rendering (12 routes)
- **Styling**: SCSS reusing exact design tokens, fonts (`Bricolage Grotesque`, `DM Sans`, `Caveat`, `Noto Nastaliq Urdu`), animations, dark theme, and zero external UI kits
- **State Management**: Signals (`signal`, `computed`) & Injectable Domain Services
- **3D Graphics**: Three.js canvas with interactive organs (beating heart, brain, eyes, stomach, intestines) and skeleton layers + graceful 2D SVG fallback
- **Voice / Speech**: Web Speech API (`webkitSpeechRecognition`) supporting Urdu and English speech triage
- **Type Safety**: TypeScript strict mode throughout
- **Data Architecture**: Decoupled Typed Mock Layer easily switchable to REST APIs

---

## Security Requirements & Architecture

> **Security Core Principle**: Assume users can read everything the browser receives. Client-side code does not contain secrets or attempt security through obscurity (no blocking Inspect, right-click, or F12). **Minification is not security.**

### 1. No Secrets in the Frontend
- **Zero Secrets**: No API keys, passwords, database URLs, auth tokens, or private endpoint addresses exist in Angular source code, environment files, or JavaScript bundles.
- **Backend Proxy for Third Parties**: Third-party services (LLMs for Pulse AI, SMS/OTP gateways, email services, mapping APIs) are called exclusively from the backend server. The client only sends requests to our own backend endpoints (e.g. `POST /api/v1/ai/chat`).

### 2. Server-Authoritative Logic
- The browser is treated as an untrusted display and user interface.
- **Server Re-checks Everything**: Slot availability, pricing, fee calculations, stock levels, delivery fees, and booking cancellation rules are calculated and validated authoritatively on the server. The client cannot forge a price or claim an unavailable slot.

### 3. Server-Side Authentication & Authorisation (RBAC & IDOR Prevention)
- **Session Security**: Sessions use secure, `httpOnly`, `SameSite=Lax` (or `Strict`), `Secure` cookies, or short-lived JWT access tokens with secure refresh token rotation.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `patient`, `doctor`, `pharmacy`, `hospital_admin`, and `platform_admin`.
- **IDOR Protection**: Every data request validates that the authenticated user identity matches the resource owner. A patient cannot view another patient's booking by altering the URL or payload ID (`GET /api/v1/bookings/:id` verifies `booking.patient_id === session.user_id`).

### 4. Patient Data Protection (PII & Medical Records)
- **Transport Security**: HTTPS only with HTTP Strict Transport Security (HSTS) with `max-age=31536000; includeSubDomains; preload`.
- **Encryption at Rest**: Sensitive patient details (name, CNIC, phone, address, medical notes) are encrypted at rest using AES-256-GCM.
- **No PII in LocalStorage**: LocalStorage in production is strictly reserved for non-sensitive UX preferences (e.g. theme preference). Patient details, prescriptions, and medical history are never stored in `localStorage` in the production version.
- **No PII in URLs or Logs**: URLs, query parameters, referrers, and logging services never contain patient names, phone numbers, or health concerns.
- **Signed Short-Lived Links for Files**: Prescriptions and diagnostic reports are stored in private, non-public cloud buckets (e.g. AWS S3 private bucket). Access is granted exclusively through short-lived (e.g. 15-minute) pre-signed URLs generated after verifying the user's authorization.

### 5. Secure File Uploads (Prescriptions & Reports)
- **Validation**: File MIME type and magic byte inspection on the server to prevent masquerading executables.
- **Allowed Formats & Limits**: Only `image/jpeg`, `image/png`, and `application/pdf` up to a hard limit of 8 MB.
- **Safe Storage**: Uploaded files are virus/malware scanned, renamed with cryptographically random UUIDs (e.g. `uuidv4() + .pdf`), and stored in non-executable private cloud storage outside web root.

### 6. Input & Output Safety
- **Strict Server Validation**: All incoming request bodies are validated using strict schema validators (e.g. Zod, Joi, or class-validator).
- **Injection Prevention**: Database interactions use parameterized queries / ORM prepared statements (preventing SQL and NoSQL injection).
- **XSS Prevention**: Angular's built-in contextual encoding is used for all template interpolation. Raw `innerHTML` with unsanitized markup is forbidden.
- **CSRF Protection**: SameSite cookie policies combined with Anti-CSRF double-submit cookies or CSRF tokens on all state-mutating requests (`POST`, `PUT`, `DELETE`).

### 7. Browser Hardening & HTTP Security Headers
The production web server / reverse proxy (Nginx / Cloudflare / Express) emits strict security headers:
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://api.pulseq.pk; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(self), geolocation=(self), payment=()
```

### 8. Abuse & Bot Protection
- **Rate Limiting**: Distributed rate limiting (Redis token bucket) on authentication, OTP generation, booking submission, and prescription upload endpoints (e.g., max 5 OTP requests per hour per phone number).
- **OTP Verification**: Patient mobile numbers must be verified via SMS OTP before appointments or medicine orders are accepted by clinics or pharmacies.
- **Account Lockouts**: Automated lockouts after consecutive failed password/OTP attempts.

### 9. Production Build & Source Map Privacy
- Angular production mode enables AOT compilation, tree-shaking, and minification.
- **Source Maps Disabled**: Public source maps (`sourceMap: false`) are disabled in production builds to prevent exposing source comments, architecture, and internals.
- The production Angular configuration explicitly sets `sourceMap: false`. Verify deployed artifacts contain no `.map` files.

### 10. Dependency Management & Vulnerability Scanning
- All dependencies in `package.json` are pinned.
- `package-lock.json` is committed to version control.
- Regular `npm audit` scans with zero high/critical vulnerabilities.

### 11. Audit Logging & Privacy Compliance
- **Audit Logs**: Immutable server audit logs record who accessed or modified patient data (timestamp, actor ID, action, resource ID) without logging sensitive health payloads.
- **Right to Deletion**: Support for patient data deletion requests in compliance with applicable data protection laws.
- **Phone Number Masking**: Masked contact details (e.g., `0300 ****123`) in public dashboard displays to protect privacy.

### 12. Encrypted Backups & Infrastructure Monitoring
- Automated daily encrypted database backups stored offsite with lifecycle policies.
- Real-time application performance monitoring (APM) and anomaly alerts for suspicious spikes in traffic or failed requests.

### 14. Angular & SSR Dependency Management
- **Angular 18+ and `@angular/ssr`**: Built using official Angular Standalone Components, Signal-based reactivity, and `@angular/ssr` Express Engine.
- **Vulnerability Management**: All dependencies are locked with `package-lock.json`. Routine audits ensure zero high or critical vulnerabilities before delivery.

### 15. Server Hardening (`server.ts`)
The Node.js Express SSR engine is hardened with enterprise security layers:
- **Helmet**: Strict Content Security Policy, HSTS (`max-age=31536000; includeSubDomains; preload`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and strict referrer policy.
- **Compression**: Gzip/Brotli response compression enabled.
- **Body & Size Limits**: Strict JSON body size limit (1 MB) and URL-encoded limits to prevent memory exhaustion DoS.
- **Timeouts**: Enforced 15-second request timeouts returning HTTP 408 on hanging requests.
- **Host Header Validation**: Strictly validated against an allowed-hosts whitelist (`localhost`, `127.0.0.1`, `pulseq.pk`, `www.pulseq.pk`). Forged `Host` and `X-Forwarded-*` headers are rejected with HTTP 400.
- **Rate Limiting**: In-memory IP bucket rate limiter enforced (240 req/min for general browsing, 60 req/min for API endpoints) returning HTTP 429.
- **Header Sanitization**: `X-Powered-By` header disabled to prevent server fingerprinting.
- **HTTPS Redirection**: Automatic 301 redirection from HTTP to HTTPS in production environments.

### 16. SSR Rules & State Transfer Safety
- **No Personal Data in SSR**: Pages containing sensitive patient data, medical records, or user accounts are never pre-rendered or cached.
- **Cache-Control**: Sensitive and dynamic endpoints send `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`.
- **Transfer State Protection**: Authentication tokens, patient identifiers, and credentials are never placed in server-rendered HTML or the Angular TransferState store.

### 17. Authentication & Credentials
- **Phone OTP**: 6-digit numeric OTP sent via SMS with 5-minute expiry, maximum 3 verification attempts per window, and 60-second resend cooldown.
- **Multi-Factor Authentication (2FA)**: Required for doctor, clinic staff, pharmacy, and hospital administrative portals.
- **Session Lifespans**: Short-lived sessions (15-minute access tokens) with secure refresh rotation, automatic idle logout after 15 minutes of inactivity on shared devices, and "Logout from all devices" capability.
- **Password Storage**: Passwords hashed using Argon2id (or bcrypt with salt round >= 12).
- **Anti-Enumeration**: Identical timing-safe generic error messages for "wrong user" and "wrong password".

### 18. Default-Deny Authorisation (RBAC & IDOR)
- **Deny by Default**: Unauthenticated access is rejected on all sensitive endpoints.
- **Role Verification**: Separate permission boundaries for `patient`, `doctor`, `pharmacy`, `hospital_admin`, and `platform_admin`.
- **Ownership Verification**: Resource-level checks guarantee that a patient can only access their own appointments, orders, prescriptions, and reports.

### 19. Prescription & Diagnostic Report Storage
- **Isolated Storage**: All medical uploads are stored in private cloud buckets outside the public web root.
- **Security Processing**: Files are scanned for malware, EXIF and GPS metadata is stripped, and files are renamed with cryptographically random UUIDs.
- **Short-Lived Signed URLs**: Access is granted strictly via pre-signed URLs expiring in 15 minutes.
- **Data Retention**: Files are permanently purged after the legal medical retention period or upon verified deletion request.

### 20. Privacy by Design & PII Masking
- **Minimal Collection**: Only data strictly required for healthcare appointment booking and medication delivery is collected.
- **Masking**: Phone numbers and sensitive addresses are masked in staff displays (e.g., `0300 ****123`) until clinical necessity requires unmasking.
- **URL & Log Hygiene**: URLs, query parameters, page titles, analytics events, and server error logs never contain patient names, phone numbers, or health concerns.
- **Zero Third-Party Trackers**: No advertising pixels or third-party behavioral trackers are loaded on health-related pages.

### 21. Medicine & Booking Integrity
- **Server Authority**: The server alone sets consultation fees, medicine unit prices, delivery charges, and slot availability. Client-sent prices or quantities are never trusted.
- **Double-Booking Prevention**: Database transactions with row-level locks prevent conflicting reservations for the same doctor or procedure time.
- **Idempotency**: Order and booking creation endpoints support idempotency keys to safely handle network retries without duplicate charges.

### 22. AI Healthcare Assistant Safety (Pulse AI)
- **Triage Only (Not a Diagnosis)**: Clear notices state that PulseQ AI suggests relevant medical specialties and does not provide clinical diagnosis.
- **PII Minimization**: The client and server scrub patient names, phone numbers, and identifying details before querying the AI engine.
- **Input & Output Guardrails**: Prompts and responses are sanitized to prevent jailbreaks, prompt injection, and exposure of other users' data.
- **No Full Log Retention**: Conversation transcripts are not persisted permanently with patient identifiers.

### 23. Content Security Policy & Resource Integrity
- **Zero Inline Script Execution**: Unsafe inline scripts and `eval()` are blocked.
- **Approved Origins**: Scripts (`self`, CDN for Three.js), fonts (`fonts.googleapis.com`, `fonts.gstatic.com`), and styles are restricted to approved domains.
- **Subresource Integrity (SRI)**: External CDN scripts (e.g. Three.js) verify integrity hashes.

### 24. Secure Cookies & CSRF Defense
- **Cookie Security**: Auth cookies are tagged `HttpOnly`, `Secure`, and `SameSite=Lax` (or `Strict`), using the `__Host-` prefix in production.
- **Anti-CSRF**: State-changing requests (`POST`, `PUT`, `DELETE`) require a cryptographically verified Anti-CSRF token.

### 25. Secrets Management & Environment Separation
- **Strict Separation**: Isolated environments for development, staging, and production.
- **Zero Secrets in Git**: No API keys, database credentials, or private URLs exist in version control.
- **Environment Template**: `.env.example` provides a documented template with fake values.

### 26. Security Logging & Monitoring
- **Audit Trails**: Security events (logins, failed attempts, privilege escalations, record views) are logged with actor ID, timestamp, and IP address, without recording health payloads.
- **Automated Alerts**: Automated webhooks alert the engineering team on traffic spikes, abnormal download rates, or repeated authentication failures.

### 27. Automated Testing & Verification
- **Build Checks**: CI/CD pipelines run automated dependency audits (`npm audit`), secret scanners, and static code analysis.
- **OWASP Verification**: Core booking, payment, and file flows are tested against the OWASP Top 10 web vulnerabilities.

### 28. No Client-Side Obfuscation or Anti-Inspect Gimmicks
- **Principle**: True security stems from server-side authentication, authorization, and validation.
- **No Blocking Scripts**: No scripts block browser Inspect, right-click, or F12. Minification is used strictly for network performance, not security.

### 13. Authenticated Endpoints Specification (for Real Backend)

The following endpoints require authenticated sessions and strict RBAC verification:

| Endpoint | Method | Required Role | Description |
|---|---|---|---|
| `/api/v1/auth/login` | `POST` | Public | Login with credentials / phone number |
| `/api/v1/auth/verify-otp` | `POST` | Public | Verify OTP code |
| `/api/v1/auth/refresh` | `POST` | Public | Rotate refresh token |
| `/api/v1/patient/me` | `GET` | Patient | Get authenticated patient profile |
| `/api/v1/bookings` | `GET` | Patient | List bookings owned by authenticated patient |
| `/api/v1/bookings` | `POST` | Patient | Create booking with server slot reservation |
| `/api/v1/bookings/:id/cancel` | `POST` | Patient / Doctor | Cancel appointment |
| `/api/v1/medicine/orders` | `GET` | Patient | List patient's medicine orders |
| `/api/v1/medicine/orders` | `POST` | Patient | Place pharmacy order |
| `/api/v1/prescriptions/upload` | `POST` | Patient | Upload prescription (JPG/PNG/PDF, max 8 MB) |
| `/api/v1/prescriptions/:id/link` | `GET` | Patient / Pharmacy | Generate short-lived signed download URL |
| `/api/v1/surgery/requests` | `GET` | Patient | List surgery consultation requests |
| `/api/v1/surgery/requests` | `POST` | Patient | Request surgical consultation |
| `/api/v1/clinic/dashboard` | `GET` | Doctor / Clinic | Clinic live queue, arrivals, diary |
| `/api/v1/clinic/walk-in` | `POST` | Clinic Staff | Register walk-in patient |
| `/api/v1/clinic/doctors/:id/toggle` | `POST` | Clinic Staff | Block / unblock doctor availability |
| `/api/v1/ai/chat` | `POST` | Public / Rate-limited | Pulse AI triage proxy (no API key in browser) |

---

## What is Currently Demo-Only (Must Be Replaced Before Launch)

Before taking the application into production with real patients, replace the following demo elements:
1. **Mock Data Sets** (`src/app/data/`):
   - `doctors.data.ts`: Replace sample doctors, degrees, and timings with real verified PMDC-registered doctors.
   - `hospitals.data.ts`: Replace sample hospital profiles and photos with official partner agreements.
   - `pharmacies.data.ts` & `medicines.data.ts`: Replace sample medicine catalogue, prices, and stock with verified drug licensing data (DRAP) and real-time pharmacy inventory sync.
   - `surgery.data.ts`: Replace estimated cost bands with formal written quotes from partner hospitals.
   - `about.data.ts`: Replace director placeholder profiles and founding story with finalized executive announcements.
   - `privacy.data.ts` & `terms.data.ts`: Remove "Draft for review" notices once approved by qualified Pakistani legal counsel.
2. **Storage Layer**:
   - `localStorage` usage in `BookingsService`, `MedicineService`, and `SurgeryService` must be replaced with the real authenticated REST API endpoints described above.
3. **SMS / OTP Service**:
   - Phone verification must be backed by an enterprise Pakistani SMS gateway (e.g. Jazz, Telenor, or Twilio) with rate limiting.

---

## Project Structure

```
PulseQ_main_website/
├── openapi.yaml                 # OpenAPI 3.0 specification for the backend
├── SAMPLE_DATA_CHECKLIST.md     # Production data audit checklist
├── README.md                    # System documentation and security requirements
└── pulseq/                      # Angular 18 application root
    ├── src/
    │   ├── index.html           # Viewport, Three.js defer script, typography
    │   ├── styles.scss          # Complete global design tokens and styles
    │   ├── main.ts              # Browser bootstrap
    │   ├── main.server.ts       # Server-side rendering bootstrap
    │   ├── server.ts            # Express SSR server
    │   ├── assets/              # Static assets (logo.png, icons)
    │   └── app/
    │       ├── app.routes.ts    # Lazy-loaded routes (/find-doctors, /surgery, /medicine, /clinics, etc.)
    │       ├── app.component.ts # Main application shell with header, footer, modal
    │       ├── data/            # Strongly-typed datasets extracted from single source of truth
    │       ├── shared/
    │       │   ├── models/      # Shared TypeScript interfaces (Doctor, Slot, Medicine, etc.)
    │       │   ├── services/    # Domain injectable services (Bookings, Medicine, Surgery, Doctors, etc.)
    │       │   ├── utils/       # 3D Body Map Three.js controller
    │       │   └── components/  # Header, Footer, DoctorCard, ClinicDashboard, Modal, Toast, PulseAI
    │       └── features/        # Lazy-loaded feature modules
    │           ├── home/             # Hero carousel, Body Map 3D/2D, Conditions, Clinic laptop
    │           ├── find-doctors/     # Search & filter directory
    │           ├── doctor-profile/   # Multi-location practice selector & slot booking
    │           ├── hospitals/        # Hospital directory with city & dept filters
    │           ├── hospital-detail/  # Affiliated doctors & hospital overview
    │           ├── body-map/         # 3D interactive Three.js + 2D SVG anatomical triage
    │           ├── surgery/          # Procedure costs, hospital comparison, quote tracker
    │           ├── medicine/         # Area pharmacies, blister pack builder, Rx upload
    │           ├── clinics/          # Working laptop mockup clinic dashboard
    │           ├── about/            # Story timeline, values, 3 directors
    │           ├── privacy/          # Plain-language privacy policy & TOC
    │           ├── terms/            # Plain-language terms of use & TOC
    │           ├── contact/          # Support grid, emergency warnings, WhatsApp
    │           └── not-found/        # Friendly 404 error page
```

---

## Setup & Running Locally

### 1. Installation
Navigate into the `pulseq` directory and install project dependencies:
```bash
cd pulseq
npm install
```

### 2. Development Server
Run the local dev server:
```bash
npx ng serve --host=0.0.0.0 --port=4200
```
Open your browser and navigate to `http://localhost:4200/`. The application will automatically reload if you change any source files.

### 3. Production Build & SSR Pre-rendering
Build the production bundle with Server-Side Rendering:
```bash
npx ng build
```
This generates the optimized client bundles in `dist/pulseq/browser` and the server engine in `dist/pulseq/server`, while pre-rendering all 12 static routes with **zero errors**.

### 4. Running the SSR Server
To run the server-side rendered application:
```bash
node dist/pulseq/server/server.mjs
```
