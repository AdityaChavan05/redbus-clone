import { Component, OnInit } from '@angular/core';
import { BusService } from '../../service/bus.service';
import { Booking } from '../../model/booking.model';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {
  selecteditem: string = 'trips';
  currentcustomer: any = null;
  currentname: string = 'Aditya Chavan';
  currentemail: string = 'adityachavan@example.com';
  currentphone: string = '+91 9632712034';
  currentgender: string = 'Male';
  mytrip: Booking[] = [];

  handlelistitemclick(selected: string): void {
    this.selecteditem = selected;
  }

  constructor(private busbooking: BusService) {}

  ngOnInit(): void {
    const stored = sessionStorage.getItem('Loggedinuser');
    let user: any = null;
    if (stored) {
      try {
        user = JSON.parse(stored);
      } catch (e) {
        user = null;
      }
    }

    if (!user) {
      user = {
        _id: '660000000000000000000001',
        name: 'Aditya Chavan',
        email: 'adityachavan@example.com',
        phone: '+91 9632712034',
        gender: 'Male'
      };
      sessionStorage.setItem('Loggedinuser', JSON.stringify(user));
    }

    this.currentcustomer = user;
    this.currentname = user.name || 'Aditya Chavan';
    this.currentemail = user.email || 'adityachavan@example.com';
    this.currentphone = user.phone || '+91 9632712034';
    this.currentgender = user.gender || 'Male';

    const userId = user._id || '660000000000000000000001';
    this.busbooking.getbusmongo(userId).subscribe({
      next: (response: any) => {
        this.mytrip = Array.isArray(response) ? response : (response?.bookings || []);
      },
      error: () => {
        this.mytrip = [
          {
            _id: 'bk_demo_01',
            customerId: userId,
            passengerDetails: [{ name: this.currentname, gender: 'Male', age: 26 }],
            email: this.currentemail,
            phoneNumber: '9632712034',
            fare: 1880,
            status: 'Confirmed',
            bookingDate: '10 Nov, 2026',
            busId: 'rb_bus_121_ksrtc_karnataka',
            seats: [4, 5],
            departureDetails: { city: 'Bengaluru', time: 21, date: '12 Nov, 2026' },
            arrivalDetails: { city: 'Goa', time: 7, date: '13 Nov, 2026' },
            duration: '10h 30m'
          } as any
        ];
      }
    });
  }
}
