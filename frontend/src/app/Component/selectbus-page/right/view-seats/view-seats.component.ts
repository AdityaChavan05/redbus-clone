import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface SeatBerth {
  id: string;
  deck: 'lower' | 'upper';
  status: 'available' | 'booked' | 'female-available' | 'female-booked' | 'selected';
  gender?: 'male' | 'female';
  price: number;
}

@Component({
  selector: 'app-view-seats',
  templateUrl: './view-seats.component.html',
  styleUrls: ['./view-seats.component.css']
})
export class ViewSeatsComponent implements OnInit {
  @Input() bus: any;
  @Output() seatSelected = new EventEmitter<string[]>();

  // Active policy/info tab
  currentTab: 'highlights' | 'cancellation' | 'reschedule' | 'route' | 'boarding' | 'stops' | 'features' | 'reviews' | 'safety' | 'other' = 'highlights';
  
  selectedSeats: SeatBerth[] = [];

  // Lower & Upper Deck Layout for Volvo 9600 Multi-Axle (2+1 Sleeper)
  lowerSingle: SeatBerth[] = [];
  lowerDouble: SeatBerth[][] = [];
  upperSingle: SeatBerth[] = [];
  upperDouble: SeatBerth[][] = [];

  // Selected Boarding & Dropping Point indices
  selectedBoardingIndex: number = 0;
  selectedDroppingIndex: number = 0;

  boardingPoints = [
    { time: '18:00', landmark: 'Lakdikapul VRL Terminal', address: 'Near Petrol Bunk, Main Junction, Hyderabad' },
    { time: '18:45', landmark: 'Gachibowli Outer Ring Road', address: 'Under Flyover Bridge pickup point, Hyderabad' },
    { time: '19:15', landmark: 'Miyapur Cross Roads', address: 'Opposite Allwyn Colony Bus Stop, Hyderabad' }
  ];

  droppingPoints = [
    { time: '09:30', landmark: 'Vashi Toll Plaza', address: 'Highway Service Road, Navi Mumbai' },
    { time: '10:15', landmark: 'Maitri Park, Chembur', address: 'Near Highway Bus Shelter, Chembur, Mumbai' },
    { time: '11:00', landmark: 'Sion Circle Terminal', address: 'VRL Head Office & Passenger Lounge, Sion, Mumbai' }
  ];

  ngOnInit(): void {
    this.generateAuthenticRedbusLayout();
  }

  setTab(tabName: any): void {
    this.currentTab = tabName;
  }

  generateAuthenticRedbusLayout(): void {
    const basePrice = this.bus?.price || 1749;
    const premiumSinglePrice = basePrice > 1800 ? basePrice + 350 : basePrice + 200;

    // --- LOWER DECK (Single Berth Window + Double Berth Window/Aisle) ---
    this.lowerSingle = [
      { id: 'L1', deck: 'lower', status: 'available', price: premiumSinglePrice },
      { id: 'L4', deck: 'lower', status: 'booked', price: premiumSinglePrice },
      { id: 'L7', deck: 'lower', status: 'booked', price: premiumSinglePrice },
      { id: 'L10', deck: 'lower', status: 'available', price: premiumSinglePrice },
      { id: 'L13', deck: 'lower', status: 'booked', price: premiumSinglePrice }
    ];

    this.lowerDouble = [
      [
        { id: 'L2', deck: 'lower', status: 'booked', price: basePrice },
        { id: 'L3', deck: 'lower', status: 'available', price: basePrice }
      ],
      [
        { id: 'L5', deck: 'lower', status: 'booked', price: basePrice },
        { id: 'L6', deck: 'lower', status: 'booked', price: basePrice }
      ],
      [
        { id: 'L8', deck: 'lower', status: 'booked', price: basePrice },
        { id: 'L9', deck: 'lower', status: 'booked', price: basePrice }
      ],
      [
        { id: 'L11', deck: 'lower', status: 'female-available', price: basePrice },
        { id: 'L12', deck: 'lower', status: 'booked', price: basePrice }
      ],
      [
        { id: 'L14', deck: 'lower', status: 'booked', price: basePrice },
        { id: 'L15', deck: 'lower', status: 'booked', price: basePrice }
      ]
    ];

    // --- UPPER DECK (Single Berth Window + Double Berth Window/Aisle) ---
    this.upperSingle = [
      { id: 'U1', deck: 'upper', status: 'available', price: premiumSinglePrice },
      { id: 'U4', deck: 'upper', status: 'booked', price: premiumSinglePrice },
      { id: 'U7', deck: 'upper', status: 'available', price: premiumSinglePrice },
      { id: 'U10', deck: 'upper', status: 'available', price: premiumSinglePrice },
      { id: 'U13', deck: 'upper', status: 'available', price: premiumSinglePrice }
    ];

    this.upperDouble = [
      [
        { id: 'U2', deck: 'upper', status: 'female-booked', price: basePrice },
        { id: 'U3', deck: 'upper', status: 'booked', price: basePrice }
      ],
      [
        { id: 'U5', deck: 'upper', status: 'booked', price: basePrice },
        { id: 'U6', deck: 'upper', status: 'available', price: basePrice }
      ],
      [
        { id: 'U8', deck: 'upper', status: 'available', price: basePrice },
        { id: 'U9', deck: 'upper', status: 'booked', price: basePrice }
      ],
      [
        { id: 'U11', deck: 'upper', status: 'available', price: basePrice },
        { id: 'U12', deck: 'upper', status: 'booked', price: basePrice }
      ],
      [
        { id: 'U14', deck: 'upper', status: 'female-available', price: basePrice },
        { id: 'U15', deck: 'upper', status: 'booked', price: basePrice }
      ]
    ];
  }

  toggleSeat(seat: SeatBerth): void {
    if (seat.status === 'booked' || seat.status === 'female-booked') {
      return;
    }

    const idx = this.selectedSeats.findIndex(s => s.id === seat.id);
    if (idx > -1) {
      this.selectedSeats.splice(idx, 1);
      seat.status = (seat.id.includes('11') || seat.id.includes('14')) ? 'female-available' : 'available';
    } else {
      if (this.selectedSeats.length >= 6) {
        alert('You can select a maximum of 6 berths per booking.');
        return;
      }
      this.selectedSeats.push(seat);
      seat.status = 'selected';
      seat.gender = 'male';
    }

    this.seatSelected.emit(this.selectedSeats.map(s => s.id));
  }

  selectBoarding(index: number): void {
    this.selectedBoardingIndex = index;
  }

  selectDropping(index: number): void {
    this.selectedDroppingIndex = index;
  }
}