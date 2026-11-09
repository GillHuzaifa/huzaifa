import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'PulseQ — Healthcare booking for Pakistan'
  },
  {
    path: 'find-doctors',
    loadComponent: () => import('./features/find-doctors/find-doctors.component').then(m => m.FindDoctorsComponent),
    title: 'Find Doctors — PulseQ Pakistan'
  },
  {
    path: 'doctor/:id',
    loadComponent: () => import('./features/doctor-profile/doctor-profile.component').then(m => m.DoctorProfileComponent),
    title: 'Doctor Profile — PulseQ Pakistan'
  },
  {
    path: 'hospitals',
    loadComponent: () => import('./features/hospitals/hospitals.component').then(m => m.HospitalsComponent),
    title: 'Hospitals — PulseQ Pakistan'
  },
  {
    path: 'hospital/:id',
    loadComponent: () => import('./features/hospital-detail/hospital-detail.component').then(m => m.HospitalDetailComponent),
    title: 'Hospital Details — PulseQ Pakistan'
  },
  {
    path: 'body-map',
    loadComponent: () => import('./features/body-map/body-map.component').then(m => m.BodyMapComponent),
    title: 'Pulse Body Map — PulseQ Pakistan'
  },
  {
    path: 'surgery',
    loadComponent: () => import('./features/surgery/surgery.component').then(m => m.SurgeryComponent),
    title: 'Surgery & Procedures — PulseQ Pakistan'
  },
  {
    path: 'medicine',
    loadComponent: () => import('./features/medicine/medicine.component').then(m => m.MedicineComponent),
    title: 'Order Medicine — PulseQ Pakistan'
  },
  {
    path: 'clinics',
    loadComponent: () => import('./features/clinics/clinics.component').then(m => m.ClinicsComponent),
    title: 'For Hospitals & Clinics — PulseQ Pakistan'
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent),
    title: 'About Us — PulseQ Pakistan'
  },
  {
    path: 'privacy',
    loadComponent: () => import('./features/privacy/privacy.component').then(m => m.PrivacyComponent),
    title: 'Privacy Policy — PulseQ Pakistan'
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/terms/terms.component').then(m => m.TermsComponent),
    title: 'Terms of Use — PulseQ Pakistan'
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact Us — PulseQ Pakistan'
  },
  {
    path: '404',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found — PulseQ Pakistan'
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
