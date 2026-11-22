import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  privateFleetPartners = [
    { name: 'VRL Travels (Volvo 9600)', routeFrom: 'Bengaluru', routeTo: 'Mumbai' },
    { name: 'Shyamoli Paribahan Starz', routeFrom: 'Bengaluru', routeTo: 'Mumbai' },
    { name: 'IntrCity SmartBus', routeFrom: 'Hyderabad', routeTo: 'Mumbai' },
    { name: 'Eicher Executive Sleeper', routeFrom: 'Humnabad', routeTo: 'Bengaluru' },
    { name: 'TATA Magna Luxury', routeFrom: 'Bengaluru', routeTo: 'Chennai' }
  ];

  topCorridors = [
    { label: 'Hyderabad → Mumbai', from: 'Hyderabad', to: 'Mumbai' },
    { label: 'Bengaluru → Mumbai', from: 'Bengaluru', to: 'Mumbai' },
    { label: 'Bengaluru → Hyderabad', from: 'Bengaluru', to: 'Hyderabad' },
    { label: 'Humnabad → Bengaluru', from: 'Humnabad', to: 'Bengaluru' },
    { label: 'Kalaburagi → Bengaluru', from: 'Kalaburagi', to: 'Bengaluru' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigateToRoute(from: string, to: string): void {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    this.router.navigate(['/select-bus'], {
      queryParams: {
        from,
        to,
        date: `${yyyy}-${mm}-${dd}`
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}