import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-selectbus-page',
  templateUrl: './selectbus-page.component.html',
  styleUrls: ['./selectbus-page.component.css']
})
export class SelectbusPageComponent implements OnInit {
  departure: string = 'Bengaluru';
  arrival: string = 'Goa';
  journeyDate: string = '15 Oct, 2026';

  buses: any[] = [];
  filteredBuses: any[] = [];
  activeFilter: string = 'all';

  // Map of busId -> array of selected seat numbers
  selectedSeatsMap: { [busId: string]: string[] } = {};

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const fromParam = params['departure'] || sessionStorage.getItem('search_from');
      const toParam = params['arrival'] || sessionStorage.getItem('search_to');
      const dateParam = params['date'] || sessionStorage.getItem('search_date');

      if (fromParam) this.departure = fromParam;
      if (toParam) this.arrival = toParam;
      if (dateParam) this.journeyDate = dateParam;

      this.loadRedBusDataset();
    });
  }

  // Generates 42 Berths (21 Lower + 21 Upper)
  generate2Plus1Decks(colsCount: number, price: number) {
    const lowerC: any[] = [];
    const lowerB: any[] = [];
    const lowerA: any[] = [];

    const upperC: any[] = [];
    const upperB: any[] = [];
    const upperA: any[] = [];

    const bookedLower = ['L2C', 'L4B', 'L6A', 'L3A'];
    const bookedUpper = ['U1C', 'U5B', 'U2A', 'U7C'];

    for (let i = 1; i <= colsCount; i++) {
      // Lower Deck
      const lcNo = `L${i}C`;
      lowerC.push({ no: lcNo, price: price, booked: bookedLower.includes(lcNo) });

      const lbNo = `L${i}B`;
      lowerB.push({ no: lbNo, price: price, booked: bookedLower.includes(lbNo) });

      const laNo = `L${i}A`;
      lowerA.push({ no: laNo, price: price, booked: bookedLower.includes(laNo) });

      // Upper Deck
      const ucNo = `U${i}C`;
      upperC.push({ no: ucNo, price: price, booked: bookedUpper.includes(ucNo) });

      const ubNo = `U${i}B`;
      upperB.push({ no: ubNo, price: price, booked: bookedUpper.includes(ubNo) });

      const uaNo = `U${i}A`;
      upperA.push({ no: uaNo, price: price, booked: bookedUpper.includes(uaNo) });
    }

    return { lowerC, lowerB, lowerA, upperC, upperB, upperA };
  }

  loadRedBusDataset(): void {
    const volvo1 = this.generate2Plus1Decks(7, 1450);
    const volvo2 = this.generate2Plus1Decks(7, 1680);
    const standard1 = this.generate2Plus1Decks(6, 1100);
    const standard2 = this.generate2Plus1Decks(6, 920);

    this.buses = [
      {
        _id: 'bus_101',
        operatorname: 'VRL Travels',
        bustype: 'Volvo Multi-Axle A/C Sleeper (2+1)',
        busdeparturetime: '21:00',
        busarrivaltime: '07:30',
        duration: '10h 30m',
        seatprice: 1450,
        rating: 4.8,
        totalratings: 1240,
        totalSeatsCapacity: 42,
        seatsRemaining: 34,
        isPrimo: true,
        isFreeCancel: true,
        category: 'ac',
        busFormat: 'sleeper',
        showSeats: false,
        departure: this.departure,
        arrival: this.arrival,
        boarding_points: ['Majestic (Kempegowda Bus Station)', 'Shantinagar TTMC', 'Yeshwantpur Toll'],
        dropping_points: ['Panjim Bus Stand', 'Madgaon', 'Mapusa'],
        chosenBoarding: 'Majestic (Kempegowda Bus Station)',
        chosenDropping: 'Panjim Bus Stand',
        ...volvo1
      },
      {
        _id: 'bus_102',
        operatorname: 'SRS Travels',
        bustype: 'Executive Multi-Axle 2+1 Comfort (Upper & Lower)',
        busdeparturetime: '22:15',
        busarrivaltime: '08:45',
        duration: '10h 30m',
        seatprice: 1100,
        rating: 4.5,
        totalratings: 890,
        totalSeatsCapacity: 36,
        seatsRemaining: 28,
        isPrimo: false,
        isFreeCancel: true,
        category: 'ac',
        busFormat: 'sleeper',
        showSeats: false,
        departure: this.departure,
        arrival: this.arrival,
        boarding_points: ['Majestic', 'Anand Rao Circle', 'Navrang Bar'],
        dropping_points: ['Panjim Kadamba Bus Terminus', 'Vasco'],
        chosenBoarding: 'Majestic',
        chosenDropping: 'Panjim Kadamba Bus Terminus',
        ...standard1
      },
      {
        _id: 'bus_103',
        operatorname: 'KSRTC / Kadamba Executive',
        bustype: 'Airavat Club Class 2+1 (Double Deck)',
        busdeparturetime: '20:30',
        busarrivaltime: '06:45',
        duration: '10h 15m',
        seatprice: 920,
        rating: 4.7,
        totalratings: 2150,
        totalSeatsCapacity: 36,
        seatsRemaining: 28,
        isPrimo: true,
        isFreeCancel: false,
        category: 'nonac',
        busFormat: 'seater',
        showSeats: false,
        departure: this.departure,
        arrival: this.arrival,
        boarding_points: ['Kempegowda Bus Station', 'Rajajinagar', 'Yeshwantpur'],
        dropping_points: ['Panjim Bus Stand', 'Ponda'],
        chosenBoarding: 'Kempegowda Bus Station',
        chosenDropping: 'Panjim Bus Stand',
        ...standard2
      },
      {
        _id: 'bus_104',
        operatorname: 'IntrCity SmartBus',
        bustype: 'Volvo B11R 9600 Multi-Axle Sleeper (2+1)',
        busdeparturetime: '23:00',
        busarrivaltime: '09:15',
        duration: '10h 15m',
        seatprice: 1680,
        rating: 4.9,
        totalratings: 630,
        totalSeatsCapacity: 42,
        seatsRemaining: 34,
        isPrimo: true,
        isFreeCancel: true,
        category: 'ac',
        busFormat: 'sleeper',
        showSeats: false,
        departure: this.departure,
        arrival: this.arrival,
        boarding_points: ['Madiwala', 'St. Johns Hospital', 'Majestic'],
        dropping_points: ['Panjim', 'Madgaon Railway Station'],
        chosenBoarding: 'Majestic',
        chosenDropping: 'Panjim',
        ...volvo2
      }
    ];

    this.buses.forEach(b => {
      this.selectedSeatsMap[b._id] = [];
    });

    this.applyFilters();
  }

  toggleSeats(bus: any): void {
    const currentState = !!bus.showSeats;
    this.buses.forEach(b => b.showSeats = false);
    bus.showSeats = !currentState;
  }

  pickSeat(bus: any, seat: any): void {
    if (seat.booked) return;

    if (!this.selectedSeatsMap[bus._id]) {
      this.selectedSeatsMap[bus._id] = [];
    }

    const idx = this.selectedSeatsMap[bus._id].indexOf(seat.no);
    if (idx > -1) {
      this.selectedSeatsMap[bus._id].splice(idx, 1);
    } else {
      this.selectedSeatsMap[bus._id].push(seat.no);
    }
  }

  isSeatChosen(busId: string, seatNo: string): boolean {
    return (this.selectedSeatsMap[busId] || []).includes(seatNo);
  }

  getComputedTotal(bus: any): number {
    const count = (this.selectedSeatsMap[bus._id] || []).length;
    return count * bus.seatprice;
  }

  checkout(bus: any): void {
    const seats = this.selectedSeatsMap[bus._id] || [];
    if (!seats.length) {
      alert('Please select at least one seat to proceed.');
      return;
    }

    const bookingPayload = {
      busId: bus._id,
      busName: bus.operatorname,
      busType: bus.bustype,
      departure: this.departure,
      arrival: this.arrival,
      from: this.departure,
      to: this.arrival,
      date: this.journeyDate,
      departureTime: bus.busdeparturetime,
      arrivalTime: bus.busarrivaltime,
      duration: bus.duration,
      boardingPoint: bus.chosenBoarding,
      droppingPoint: bus.chosenDropping,
      seats: seats,
      seatNumbers: seats.join(', '),
      totalSeats: seats.length,
      farePerSeat: bus.seatprice,
      totalFare: this.getComputedTotal(bus),
      bookingId: 'RB-' + Math.floor(100000 + Math.random() * 900000)
    };

    // Save to both storages for cross-component access
    sessionStorage.setItem('currentBooking', JSON.stringify(bookingPayload));
    sessionStorage.setItem('selectedBooking', JSON.stringify(bookingPayload));
    localStorage.setItem('currentBooking', JSON.stringify(bookingPayload));
    localStorage.setItem('selectedBooking', JSON.stringify(bookingPayload));

    // Navigate to payment page
    this.router.navigate(['/payment']);
  }

  swapLocations(): void {
    const tmp = this.departure;
    this.departure = this.arrival;
    this.arrival = tmp;

    sessionStorage.setItem('search_from', this.departure);
    sessionStorage.setItem('search_to', this.arrival);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { departure: this.departure, arrival: this.arrival },
      queryParamsHandling: 'merge'
    });
    this.loadRedBusDataset();
  }

  setFilter(type: string): void {
    this.activeFilter = (this.activeFilter === type) ? 'all' : type;
    this.applyFilters();
  }

  applyFilters(): void {
    if (this.activeFilter === 'all') {
      this.filteredBuses = [...this.buses];
    } else if (this.activeFilter === 'primo') {
      this.filteredBuses = this.buses.filter(b => b.isPrimo);
    } else if (this.activeFilter === 'ac') {
      this.filteredBuses = this.buses.filter(b => b.category === 'ac');
    } else if (this.activeFilter === 'sleeper') {
      this.filteredBuses = this.buses.filter(b => b.busFormat === 'sleeper');
    } else if (this.activeFilter === 'seater') {
      this.filteredBuses = this.buses.filter(b => b.busFormat === 'seater');
    } else {
      this.filteredBuses = [...this.buses];
    }
  }
}