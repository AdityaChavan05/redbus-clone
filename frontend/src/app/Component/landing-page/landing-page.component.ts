import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  fromCity: string = 'Bengaluru';
  toCity: string = 'Goa';
  journeyDate: string = '2026-10-25';

  allCities: string[] = [
    'Bengaluru', 'Goa', 'Hyderabad', 'Mumbai', 'Pune',
    'Chennai', 'Delhi', 'Mangaluru', 'Hubli', 'Mysuru',
    'Ahmedabad', 'Coimbatore', 'Vijayawada', 'Kochi'
  ];

  filteredSourceCities: string[] = [];
  filteredDestCities: string[] = [];

  constructor(private router: Router) {
    const today = new Date().toISOString().split('T')[0];
    this.journeyDate = today;
  }

  filterSources(event?: any): void {
    const val = (typeof event === 'string' ? event : (event?.target?.value || this.fromCity || '')).toLowerCase().trim();
    if (!val) {
      this.filteredSourceCities = [...this.allCities.slice(0, 5)];
    } else {
      this.filteredSourceCities = this.allCities.filter(c => c.toLowerCase().includes(val));
    }
  }

  selectSource(city: string): void {
    this.fromCity = city;
    setTimeout(() => {
      this.filteredSourceCities = [];
    }, 150);
  }

  filterDestinations(event?: any): void {
    const val = (typeof event === 'string' ? event : (event?.target?.value || this.toCity || '')).toLowerCase().trim();
    if (!val) {
      this.filteredDestCities = [...this.allCities.slice(0, 5)];
    } else {
      this.filteredDestCities = this.allCities.filter(c => c.toLowerCase().includes(val));
    }
  }

  selectDestination(city: string): void {
    this.toCity = city;
    setTimeout(() => {
      this.filteredDestCities = [];
    }, 150);
  }

  swapCities(): void {
    const temp = this.fromCity;
    this.fromCity = this.toCity;
    this.toCity = temp;
  }

  searchBuses(): void {
    const origin = (this.fromCity || 'Bengaluru').trim();
    const dest = (this.toCity || 'Goa').trim();
    const date = this.journeyDate || '2026-10-25';

    sessionStorage.setItem('search_from', origin);
    sessionStorage.setItem('search_to', dest);
    sessionStorage.setItem('search_date', date);

    this.router.navigate(['/select-bus'], {
      queryParams: {
        departure: origin,
        arrival: dest,
        date: date
      }
    });
  }
}