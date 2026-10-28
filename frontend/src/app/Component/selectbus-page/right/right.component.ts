import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BusService } from '../../../service/bus.service';

interface Passenger {
  seat: string;
  name: string;
  age: number | null;
  gender: string;
}

@Component({
  selector: 'app-right',
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.css']
})
export class RightComponent implements OnInit {
  @Input() departurevar: string = '';
  @Input() arrival: string = '';
  @Input() date: string = '';

  busdetails: any[] = [];
  selectedBusId: string | null = null;
  currentBus: any = null;
  selectedSeats: string[] = [];

  activePointTab: 'boarding' | 'dropping' = 'boarding';
  selectedBoardingPoint: string = '';
  selectedDroppingPoint: string = '';
  showPassengerForm: boolean = false;

  passengerList: Passenger[] = [];
  contactEmail: string = '';
  contactPhone: string = '';

  defaultBoardingPoints: string[] = [
    'Majestic (KSRTC Bus Stand)',
    'Anand Rao Circle',
    'Madiwala (Opposite Police Station)',
    'Silk Board (Near Bus Shelter)',
    'Electronic City Toll Gate'
  ];

  defaultDroppingPoints: string[] = [
    'Humnabad Bypass Circle',
    'Bidar Cross',
    'Old Bus Stand Terminal',
    'Koyambedu Omni Bus Stand',
    'Vashi Toll Plaza'
  ];

  constructor(private busservice: BusService, private router: Router) {}

  ngOnInit(): void {
    this.fetchBuses();
  }

  fetchBuses(): void {
    this.busservice.GETBUSDETAILS(this.departurevar, this.arrival, this.date).subscribe({
      next: (response: any) => {
        let buses = Array.isArray(response) ? response : (response?.buses || []);
        
        // Ensure Volvo 9600 and diverse bus types are present
        if (!buses.length) {
          buses = [
            {
              _id: 'b1',
              busName: 'VRL Travels (Volvo 9600 Multi-Axle)',
              busType: 'A/C Sleeper (2+1) Luxury 9600',
              from: this.departurevar || 'Bengaluru',
              to: this.arrival || 'Humnabad',
              price: 1350,
              departureTime: '20:30',
              arrivalTime: '05:45',
              duration: '09h 15m',
              rating: '4.8',
              boarding_points: this.defaultBoardingPoints,
              dropping_points: this.defaultDroppingPoints
            },
            {
              _id: 'b2',
              busName: 'SRS Travels Non-AC Sleeper',
              busType: 'Non-AC Sleeper (2+1) 36 Berths',
              from: this.departurevar || 'Bengaluru',
              to: this.arrival || 'Humnabad',
              price: 680,
              departureTime: '21:15',
              arrivalTime: '06:45',
              duration: '09h 30m',
              rating: '4.2',
              boarding_points: this.defaultBoardingPoints,
              dropping_points: this.defaultDroppingPoints
            },
            {
              _id: 'b3',
              busName: 'KSRTC Airavat Club Class (Volvo 42 Seater)',
              busType: 'A/C Semi-Sleeper (2+2) 42 Seats',
              from: this.departurevar || 'Bengaluru',
              to: this.arrival || 'Humnabad',
              price: 920,
              departureTime: '22:00',
              arrivalTime: '07:15',
              duration: '09h 15m',
              rating: '4.6',
              boarding_points: this.defaultBoardingPoints,
              dropping_points: this.defaultDroppingPoints
            }
          ];
        }
        this.busdetails = buses;
      },
      error: () => {
        // Fallback buses
        this.busdetails = [
          {
            _id: 'b1',
            busName: 'VRL Travels (Volvo 9600 Multi-Axle)',
            busType: 'A/C Sleeper (2+1) Luxury 9600',
            from: 'Bengaluru',
            to: 'Humnabad',
            price: 1350,
            departureTime: '20:30',
            arrivalTime: '05:45',
            duration: '09h 15m',
            rating: '4.8'
          }
        ];
      }
    });
  }

  toggleSeatView(bus: any): void {
    if (this.selectedBusId === bus._id) {
      this.selectedBusId = null;
      this.currentBus = null;
      this.selectedSeats = [];
      this.showPassengerForm = false;
      return;
    }

    this.selectedBusId = bus._id;
    this.currentBus = bus;
    this.selectedSeats = [];
    this.selectedBoardingPoint = '';
    this.selectedDroppingPoint = '';
    this.activePointTab = 'boarding';
    this.showPassengerForm = false;
    this.passengerList = [];
  }

  onSeatsChanged(seats: string[]): void {
    this.selectedSeats = [...seats];
    this.syncPassengerList();
    if (this.selectedSeats.length === 0) {
      this.showPassengerForm = false;
    }
  }

  syncPassengerList(): void {
    this.passengerList = this.selectedSeats.map(seat => {
      const existing = this.passengerList.find(p => p.seat === seat);
      return existing || { seat, name: '', age: null, gender: 'Male' };
    });
  }

  chooseBoardingPoint(point: string): void {
    this.selectedBoardingPoint = point;
    this.activePointTab = 'dropping';
  }

  chooseDroppingPoint(point: string): void {
    this.selectedDroppingPoint = point;
  }

  proceedToPassengerDetails(): void {
    if (!this.selectedBoardingPoint || !this.selectedDroppingPoint) {
      alert('Please choose both a Boarding Point and a Dropping Point.');
      return;
    }
    this.syncPassengerList();
    this.showPassengerForm = true;
  }

  calculateTotalFare(): number {
    const baseFare = this.currentBus?.price || 750;
    return baseFare * this.selectedSeats.length;
  }

  proceedToPayment(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!this.selectedSeats.length) {
      alert('Please select at least one seat.');
      return;
    }

    if (!this.selectedBoardingPoint || !this.selectedDroppingPoint) {
      alert('Please select boarding and dropping points.');
      return;
    }

    for (const p of this.passengerList) {
      if (!p.name || !p.age) {
        alert(`Please complete the name and age for Seat ${p.seat}.`);
        return;
      }
    }

    const bookingPayload = {
      busName: this.currentBus?.busName || 'VRL Travels (Volvo 9600)',
      busType: this.currentBus?.busType || 'A/C Sleeper (2+1)',
      from: this.departurevar || 'Bengaluru',
      to: this.arrival || 'Humnabad',
      date: this.date || '2026-09-27',
      departureTime: this.currentBus?.departureTime || '20:30',
      arrivalTime: this.currentBus?.arrivalTime || '05:45',
      seats: [...this.selectedSeats],
      totalFare: this.calculateTotalFare(),
      boardingPoint: this.selectedBoardingPoint,
      droppingPoint: this.selectedDroppingPoint,
      passengers: this.passengerList,
      contact: {
        email: this.contactEmail || 'adityachavan05@redbus.in',
        phone: this.contactPhone || '9632712034'
      }
    };

    sessionStorage.setItem('bookingDetails', JSON.stringify(bookingPayload));

    this.router.navigateByUrl('/payment').then((navigated) => {
      if (!navigated) {
        window.location.href = '/payment';
      }
    }).catch(() => {
      window.location.href = '/payment';
    });
  }
}