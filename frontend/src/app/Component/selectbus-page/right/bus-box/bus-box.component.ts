import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

export interface BusPhotoItem {
  id?: string;
  title: string;
  category: string;
  url: string;
}

export interface SeatItem {
  id: string;
  label: string;
  deck: 'lower' | 'upper' | 'seater';
  type: 'single' | 'double' | 'seater';
  price: number;
  isBooked: boolean;
  isSelected: boolean;
}

export interface SleeperRow {
  single: SeatItem;
  doubleLeft: SeatItem;
  doubleRight: SeatItem;
}

export interface SeaterRow {
  leftWindow: SeatItem;
  leftAisle: SeatItem;
  rightAisle: SeatItem;
  rightWindow: SeatItem;
  middleBack?: SeatItem;
}

export interface BoardingPoint {
  location: string;
  time: string;
  landmark: string;
  contact: string;
}

export interface CancellationTier {
  timeWindow: string;
  deductionPercentage: string;
  refundAmountApprox: string;
}

export interface AmenityItem {
  icon: string;
  name: string;
  desc: string;
}

export interface BusReviewItem {
  reviewer: string;
  rating: number;
  date: string;
  comment: string;
}

@Component({
  selector: 'app-bus-box',
  templateUrl: './bus-box.component.html',
  styleUrls: ['./bus-box.component.css']
})
export class BusBoxComponent implements OnInit, OnChanges {

  @Input() busid: string = 'VRL-9600-01';
  @Input() operatorname: string = 'VRL Travels';
  @Input() bustypename: string = 'Volvo 9600 Multi-Axle A/C Sleeper (2+1)';
  @Input() busdeparturetime: number | string = '21:00';
  @Input() busarrivaltime: number | string = '10:30';
  @Input() seatprivce: number = 1850;
  @Input() avgrating: number = 4.8;
  @Input() totalreview: number = 4820;
  @Input() livetracking: number = 1;
  @Input() reschedulable: number = 1;
  @Input() filledseats: any[] = [];
  @Input() routedetails: any = {
    duration: '13h 30m',
    departureLocation: { name: 'Bengaluru' },
    arrivalLocation: { name: 'Mumbai' }
  };
  @Input() photos: BusPhotoItem[] = [];

  isExpanded: boolean = false;
  activeDeck: 'lower' | 'upper' = 'lower';
  activeRightTab: 'highlights' | 'photos' | 'boarding' | 'dropping' | 'amenities' | 'cancellation' | 'reviews' = 'highlights';

  currentDynamicFare: number = 1850;
  surgeMultiplier: number = 1.0;
  surgeMultiplierTag: string = 'Standard Daily Fare';
  surgeExplanation: string = 'Standard everyday average operator rate.';

  lowerDeckRows: SleeperRow[] = [];
  upperDeckRows: SleeperRow[] = [];
  seaterRows: SeaterRow[] = [];
  selectedSeatsList: SeatItem[] = [];

  officialBoardingPoints: BoardingPoint[] = [];
  officialDroppingPoints: BoardingPoint[] = [];

  galleryPhotos: BusPhotoItem[] = [];
  selectedPhotoIndex: number = 0;

  vrlAmenities: AmenityItem[] = [
    { icon: '❄️', name: 'Individual A/C Vents', desc: 'Directable airflow nozzle with custom volume knob' },
    { icon: '🔌', name: '65W Fast USB-C & Sockets', desc: 'Dedicated fast charger for laptops & mobile devices' },
    { icon: '🛏️', name: 'Sanitized Bedroll & Blanket', desc: 'Thermal fleece blanket and washed pillow in sealed pack' },
    { icon: '💡', name: 'Dual LED Reading Lamps', desc: 'Warm touch-activated focus reading spotlight' },
    { icon: '🪟', name: 'Panoramic Acoustic Glass', desc: 'Acoustic laminated windows blocking NH highway rumble' },
    { icon: '📍', name: 'Live GPS Telematics', desc: 'Real-time vehicle speed and location tracking link' },
    { icon: '💧', name: 'Bottled Mineral Water', desc: 'Complimentary 500ml sealed packaged drinking water' },
    { icon: '🧯', name: 'Fire Suppression & Escape Hatch', desc: 'Automated engine bay fire system and ceiling hatches' }
  ];

  cancellationPolicy: CancellationTier[] = [
    { timeWindow: 'Between 0 to 2 hours before departure', deductionPercentage: '100% (No Refund)', refundAmountApprox: '₹0' },
    { timeWindow: 'Between 2 to 12 hours before departure', deductionPercentage: '50% Cancellation Fee', refundAmountApprox: '₹925' },
    { timeWindow: 'Between 12 to 24 hours before departure', deductionPercentage: '25% Cancellation Fee', refundAmountApprox: '₹1,387' },
    { timeWindow: 'More than 24 hours prior to departure', deductionPercentage: '10% Minimal Processing Fee', refundAmountApprox: '₹1,665' }
  ];

  busReviews: BusReviewItem[] = [
    {
      reviewer: 'Suresh Patil',
      rating: 5,
      date: '3 days ago',
      comment: 'Very comfortable ride with minimal fatigue on overnight journey.'
    },
    {
      reviewer: 'Meera Nambiar',
      rating: 5,
      date: '1 week ago',
      comment: 'Very clean interiors and professional driving crew.'
    },
    {
      reviewer: 'Raghavendra Joshi',
      rating: 4,
      date: '2 weeks ago',
      comment: 'Punctual departure and smooth suspension handling.'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.calculateDynamicFare();
    this.syncCityPoints();
    this.initPhotos();
    this.generateSeatMatrix();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bustypename'] || changes['seatprivce'] || changes['busdeparturetime']) {
      this.calculateDynamicFare();
      this.generateSeatMatrix();
    }
    if (changes['routedetails']) {
      this.syncCityPoints();
    }
    if (changes['photos']) {
      this.initPhotos();
    }
  }

  isSeaterBus(): boolean {
    const t = (this.bustypename || '').toLowerCase();
    const op = (this.operatorname || '').toLowerCase();
    return t.includes('seater') || t.includes('semi-sleeper') || op.includes('airavat');
  }

  format12HrTime(timeVal: string | number): string {
    if (timeVal === undefined || timeVal === null) return '';
    const str = String(timeVal).trim();
    const parts = str.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts.length > 1 ? parts[1].padStart(2, '0') : '00';

    if (isNaN(hours)) return str;

    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${hours}:${minutes} ${period}`;
  }

  initPhotos(): void {
    if (this.photos && this.photos.length > 0) {
      this.galleryPhotos = this.photos;
    } else {
      this.galleryPhotos = [
        {
          id: 'side1',
          title: 'Coach Profile',
          category: 'Chassis',
          url: 'assets/vrl-photos/side1.png'
        }
      ];
    }
    this.selectedPhotoIndex = 0;
  }

  slideCarousel(direction: 'left' | 'right'): void {
    const total = this.galleryPhotos.length;
    if (total === 0) return;
    if (direction === 'right') {
      this.selectedPhotoIndex = (this.selectedPhotoIndex + 1) % total;
    } else {
      this.selectedPhotoIndex = (this.selectedPhotoIndex - 1 + total) % total;
    }
  }

  setPhoto(idx: number): void {
    this.selectedPhotoIndex = idx;
  }

  syncCityPoints(): void {
    const origin = (this.routedetails?.departureLocation?.name || 'Bengaluru').toLowerCase();
    const dest = (this.routedetails?.arrivalLocation?.name || 'Mumbai').toLowerCase();

    if (origin.includes('bengaluru') || origin.includes('bangalore')) {
      this.officialBoardingPoints = [
        { location: 'Majestic (Kempegowda Bus Station)', time: '20:30', landmark: 'Platform 18 Entry Bay', contact: '080-22971201' },
        { location: 'Anand Rao Circle', time: '21:00', landmark: 'Near Central Counter', contact: '080-22971200' },
        { location: 'Navrang Circle / Rajajinagar', time: '21:20', landmark: 'Near Navrang Signal', contact: '080-22971205' },
        { location: 'Yeshwantpur TTMC', time: '21:45', landmark: 'BMTC Govardhan Complex', contact: '080-22971210' },
        { location: 'Jalahalli Cross', time: '22:00', landmark: 'Near Ayyappa Temple', contact: '080-22971214' },
        { location: 'Nelamangala Toll Plaza', time: '22:30', landmark: 'NH-48 Highway Junction', contact: '080-22971220' }
      ];
    } else if (origin.includes('mumbai') || origin.includes('bombay')) {
      this.officialBoardingPoints = [
        { location: 'Borivali (E) National Park', time: '17:30', landmark: 'Near Western Express Highway', contact: '022-28901200' },
        { location: 'Andheri (E) Bisleri Compound', time: '18:00', landmark: 'Opp. WEH Metro', contact: '022-28901205' },
        { location: 'Sion Circle', time: '18:45', landmark: 'Near Cinemax Cinema', contact: '022-28901210' },
        { location: 'Vashi Toll Plaza', time: '20:00', landmark: 'Highway Entry Gate', contact: '022-27801200' }
      ];
    } else {
      this.officialBoardingPoints = [
        { location: `${this.routedetails?.departureLocation?.name || 'Central'} Bus Terminal`, time: '20:00', landmark: 'Main Station Bay', contact: '1800-102-1234' }
      ];
    }

    if (dest.includes('mumbai') || dest.includes('bombay')) {
      this.officialDroppingPoints = [
        { location: 'Panvel Highway Plaza', time: '08:00', landmark: 'Near Kalamboli Junction', contact: '022-27801200' },
        { location: 'Vashi Plaza Highway Gate', time: '08:45', landmark: 'Near Vashi Toll', contact: '022-27801205' },
        { location: 'Sion Circle', time: '09:45', landmark: 'Near Cinemax', contact: '022-28901215' },
        { location: 'Borivali (E) National Park', time: '11:00', landmark: 'Near Flyover', contact: '022-28901230' }
      ];
    } else if (dest.includes('bengaluru') || dest.includes('bangalore')) {
      this.officialDroppingPoints = [
        { location: 'Nelamangala Toll Plaza', time: '08:00', landmark: 'NH-48 Junction', contact: '080-22971220' },
        { location: 'Yeshwantpur TTMC', time: '08:50', landmark: 'Govardhan Complex', contact: '080-22971210' },
        { location: 'Majestic Bus Stand', time: '10:00', landmark: 'Kempegowda Bus Station', contact: '080-22971201' }
      ];
    } else {
      this.officialDroppingPoints = [
        { location: `${this.routedetails?.arrivalLocation?.name || 'Destination'} Central Terminal`, time: '09:15', landmark: 'Main Platform', contact: '1800-102-1237' }
      ];
    }
  }

  calculateDynamicFare(): void {
    const t = (this.bustypename || '').toLowerCase();
    const op = (this.operatorname || '').toLowerCase();
    let base = 1350;

    if (op.includes('airavat') || t.includes('airavat')) {
      base = 1350; // KSRTC Airavat 2.0 Semi-Sleeper Seater base
    } else if (t.includes('9600') || t.includes('15m')) {
      base = 1550;
    } else if (t.includes('eicher')) {
      base = 1150;
    } else if (t.includes('magna') || t.includes('non-a/c') || t.includes('non ac')) {
      base = 1050;
    } else if (t.includes('seater') && t.includes('sleeper')) {
      base = 950;
    }

    const depHour = parseInt(String(this.busdeparturetime).split(':')[0], 10) || 20;
    if (depHour >= 18 && depHour <= 22) {
      this.surgeMultiplier = 1.15;
      this.surgeMultiplierTag = '⚡ Evening Peak Demand (+15%)';
      this.surgeExplanation = 'Demand peak applied during prime evening departure hours.';
    } else {
      this.surgeMultiplier = 1.0;
      this.surgeMultiplierTag = 'Standard Daily Fare';
      this.surgeExplanation = 'Standard everyday operator average.';
    }

    this.currentDynamicFare = Math.round(base * this.surgeMultiplier);
  }

  isVolvo9600(): boolean {
    const t = (this.bustypename || '').toLowerCase();
    return t.includes('9600') || t.includes('multi-axle');
  }

  isVrlVolvo9600(): boolean {
    const op = (this.operatorname || '').toLowerCase();
    return (op.includes('vrl') || op.includes('vijayanand')) && this.isVolvo9600();
  }

  getTotalBerthsCount(): number {
    if (this.isSeaterBus()) return 51;
    return this.isVolvo9600() ? 42 : 36;
  }

  getDeckBerthsCount(): number {
    return this.isVolvo9600() ? 21 : 18;
  }

  toggleSeatDrawer(): void {
    this.isExpanded = !this.isExpanded;
  }

  setRightTab(tab: 'highlights' | 'photos' | 'boarding' | 'dropping' | 'amenities' | 'cancellation' | 'reviews'): void {
    this.activeRightTab = tab;
  }

  generateSeatMatrix(): void {
    const price = this.currentDynamicFare;

    if (this.isSeaterBus()) {
      // Build 51-seat Semi-Sleeper Seater matrix (12 rows of 4 + 1 last row of 5)
      const rows: SeaterRow[] = [];
      const bookedSeed = [3, 4, 7, 8, 30, 41, 42];
      let sNum = 1;

      // Rows 1 to 12 (4 seats each = 48 seats)
      for (let i = 1; i <= 12; i++) {
        const s1 = sNum++;
        const s2 = sNum++;
        const s3 = sNum++;
        const s4 = sNum++;

        rows.push({
          leftWindow: { id: `S-${s1}`, label: `S${s1}`, deck: 'seater', type: 'seater', price, isBooked: bookedSeed.includes(s1), isSelected: s1 === 5 },
          leftAisle: { id: `S-${s2}`, label: `S${s2}`, deck: 'seater', type: 'seater', price, isBooked: bookedSeed.includes(s2), isSelected: false },
          rightAisle: { id: `S-${s3}`, label: `S${s3}`, deck: 'seater', type: 'seater', price, isBooked: bookedSeed.includes(s3), isSelected: false },
          rightWindow: { id: `S-${s4}`, label: `S${s4}`, deck: 'seater', type: 'seater', price, isBooked: bookedSeed.includes(s4), isSelected: false }
        });
      }

      // Row 13 (Last back row with 5 seats = 48 + 3 = 51 seats)
      const b1 = sNum++;
      const b2 = sNum++;
      const b3 = sNum++;
      rows.push({
        leftWindow: { id: `S-${b1}`, label: `S${b1}`, deck: 'seater', type: 'seater', price, isBooked: false, isSelected: false },
        leftAisle: { id: `S-${b2}`, label: `S${b2}`, deck: 'seater', type: 'seater', price, isBooked: true, isSelected: false },
        middleBack: { id: `S-${sNum}`, label: `S${sNum++}`, deck: 'seater', type: 'seater', price, isBooked: false, isSelected: false },
        rightAisle: { id: `S-${sNum}`, label: `S${sNum++}`, deck: 'seater', type: 'seater', price, isBooked: false, isSelected: false },
        rightWindow: { id: `S-${b3}`, label: `S${b3}`, deck: 'seater', type: 'seater', price, isBooked: false, isSelected: false }
      });

      this.seaterRows = rows;
    } else {
      // Sleeper Matrix Generation
      const bays = this.isVolvo9600() ? 7 : 6;
      const lower: SleeperRow[] = [];
      const upper: SleeperRow[] = [];
      const bookedSeedLower = [1, 5,];
      const bookedSeedUpper = [0, 3, 15];

      let seatNum = 1;
      for (let i = 0; i < bays; i++) {
        const s = seatNum++;
        const dl = seatNum++;
        const dr = seatNum++;
        lower.push({
          single: { id: `L-${s}`, label: `L${s}`, deck: 'lower', type: 'single', price, isBooked: bookedSeedLower.includes(i * 3), isSelected: i === 2 },
          doubleLeft: { id: `L-${dl}`, label: `L${dl}`, deck: 'lower', type: 'double', price, isBooked: bookedSeedLower.includes(i * 3 + 1), isSelected: false },
          doubleRight: { id: `L-${dr}`, label: `L${dr}`, deck: 'lower', type: 'double', price, isBooked: bookedSeedLower.includes(i * 3 + 2), isSelected: false }
        });
      }

      seatNum = 1;
      for (let i = 0; i < bays; i++) {
        const s = seatNum++;
        const dl = seatNum++;
        const dr = seatNum++;
        upper.push({
          single: { id: `U-${s}`, label: `U${s}`, deck: 'upper', type: 'single', price: price + 50, isBooked: bookedSeedUpper.includes(i * 3), isSelected: false },
          doubleLeft: { id: `U-${dl}`, label: `U${dl}`, deck: 'upper', type: 'double', price: price + 50, isBooked: bookedSeedUpper.includes(i * 3 + 1), isSelected: false },
          doubleRight: { id: `U-${dr}`, label: `U${dr}`, deck: 'upper', type: 'double', price: price + 50, isBooked: bookedSeedUpper.includes(i * 3 + 2), isSelected: false }
        });
      }

      this.lowerDeckRows = lower;
      this.upperDeckRows = upper;
    }

    this.refreshSelectedList();
  }

  toggleSeat(seat: SeatItem): void {
    if (seat.isBooked) return;
    seat.isSelected = !seat.isSelected;
    this.refreshSelectedList();
  }

  private refreshSelectedList(): void {
    const selected: SeatItem[] = [];

    if (this.isSeaterBus()) {
      for (const r of this.seaterRows) {
        if (r.leftWindow?.isSelected) selected.push(r.leftWindow);
        if (r.leftAisle?.isSelected) selected.push(r.leftAisle);
        if (r.middleBack?.isSelected) selected.push(r.middleBack);
        if (r.rightAisle?.isSelected) selected.push(r.rightAisle);
        if (r.rightWindow?.isSelected) selected.push(r.rightWindow);
      }
    } else {
      const all = [...this.lowerDeckRows, ...this.upperDeckRows];
      for (const row of all) {
        if (row.single.isSelected) selected.push(row.single);
        if (row.doubleLeft.isSelected) selected.push(row.doubleLeft);
        if (row.doubleRight.isSelected) selected.push(row.doubleRight);
      }
    }

    this.selectedSeatsList = selected;
  }

  getTotalPrice(): number {
    if (this.selectedSeatsList.length === 0) return this.currentDynamicFare;
    return this.selectedSeatsList.reduce((acc, s) => acc + s.price, 0);
  }

  getSelectedBerthLabels(): string {
    if (this.selectedSeatsList.length === 0) {
      return this.isSeaterBus() ? 'S0 (Window Seat)' : 'L0 (Single Berth)';
    }
    return this.selectedSeatsList.map(s => s.label).join(', ');
  }

  proceedToBook(): void {
    const fromCity = this.routedetails?.departureLocation?.name || 'Bengaluru';
    const toCity = this.routedetails?.arrivalLocation?.name || 'Mumbai';
    const seatNames = this.selectedSeatsList.map(s => s.label).join(', ') || 'S5';

    this.router.navigate(['/payment'], {
      queryParams: {
        bus: this.operatorname,
        type: this.bustypename,
        from: fromCity,
        to: toCity,
        fare: this.getTotalPrice(),
        seats: seatNames,
        dep: this.format12HrTime(this.busdeparturetime),
        arr: this.format12HrTime(this.busarrivaltime),
        pickup: this.officialBoardingPoints[0]?.location || 'Main Boarding Terminal',
        drop: this.officialDroppingPoints[0]?.location || 'Main Dropping Terminal'
      }
    });
  }
}