import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-drawer',
  templateUrl: './form-drawer.component.html',
  styleUrls: ['./form-drawer.component.css']
})
export class FormDrawerComponent {
  @Input() selectedseat: any[] = [];
  @Input() seatprice: number = 0;
  @Input() routedetails: any;
  @Input() busid: any;
  @Input() busarrivaltime: any;
  @Input() busdeparturetime: any;
  @Input() operatorname: any;

  passenger = {
    name: '',
    age: null,
    gender: 'Male',
    phone: '',
    email: ''
  };

  errorMessage: string = '';

  constructor(private router: Router) {}

  proceedToPayment(): void {
    if (!this.passenger.name || this.passenger.name.trim().length < 3) {
      this.errorMessage = 'Please enter a valid passenger full name.';
      return;
    }
    if (!this.passenger.age || this.passenger.age < 1 || this.passenger.age > 120) {
      this.errorMessage = 'Please enter a valid age between 1 and 120.';
      return;
    }
    if (!/^\d{10}$/.test((this.passenger.phone || '').trim())) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((this.passenger.email || '').trim())) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.errorMessage = '';

    const checkoutPayload = {
      busName: this.operatorname || 'pakyabus Prime Line',
      departureTime: this.busdeparturetime || '21:00',
      arrivalTime: this.busarrivaltime || '07:00',
      seats: this.selectedseat.map(s => s.number || s),
      totalFare: this.seatprice,
      passenger: this.passenger
    };

    sessionStorage.setItem('pakyabus_active_checkout', JSON.stringify(checkoutPayload));
    this.router.navigate(['/payment-page']);
  }
}