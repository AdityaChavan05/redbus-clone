import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

export interface BookingPayload {
  bookingId: string;
  busId?: string;
  busName: string;
  busType: string;
  departure?: string;
  arrival?: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  duration?: string;
  boardingPoint: string;
  droppingPoint: string;
  seats: string[];
  seatNumbers?: string;
  totalSeats?: number;
  farePerSeat?: number;
  totalFare: number;
}

@Component({
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.css']
})
export class PaymentPageComponent implements OnInit, OnDestroy {
  booking: BookingPayload = {
    bookingId: 'RB-829104',
    busName: 'VRL Travels',
    busType: 'Volvo Multi-Axle A/C Sleeper (2+1)',
    from: 'Bengaluru',
    to: 'Goa',
    date: '25 Oct, 2026',
    departureTime: '21:00',
    arrivalTime: '07:30',
    duration: '10h 30m',
    boardingPoint: 'Majestic (Kempegowda Bus Station)',
    droppingPoint: 'Panjim Bus Stand',
    seats: ['L1A', 'L2A'],
    seatNumbers: 'L1A, L2A',
    totalSeats: 2,
    farePerSeat: 1450,
    totalFare: 2900
  };

  selectedTab: 'upi' | 'card' | 'netbanking' | 'wallet' = 'upi';

  // QR state
  showQrAnimation: boolean = true;
  upiId: string = 'adityaaditya2034@naviaxis';
  payeeName: string = 'ADITYA ADITYA';
  qrApiUrl: string = '';

  // Form Controls
  cardNumber: string = '';
  cardExpiry: string = '';
  cardCvv: string = '';
  cardHolder: string = '';
  selectedBank: string = 'HDFC';
  selectedWallet: string = 'Paytm';

  isProcessing: boolean = false;
  paymentSuccess: boolean = false;

  // Session timer (10 mins)
  timerMinutes: number = 9;
  timerSeconds: number = 59;
  private timerInterval: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    try {
      const rawData = sessionStorage.getItem('currentBooking') ||
                      sessionStorage.getItem('selectedBooking') ||
                      localStorage.getItem('currentBooking') ||
                      localStorage.getItem('selectedBooking');

      if (rawData) {
        const parsed = JSON.parse(rawData);
        if (parsed && typeof parsed === 'object') {
          this.booking = {
            ...this.booking,
            ...parsed,
            seats: Array.isArray(parsed.seats) ? parsed.seats : [parsed.seats || 'L1A'],
            seatNumbers: parsed.seatNumbers || (Array.isArray(parsed.seats) ? parsed.seats.join(', ') : 'L1A'),
            totalFare: Number(parsed.totalFare) || 1450
          };
        }
      }
    } catch (err) {
      console.warn('Error reading booking payload from storage:', err);
    }

    this.constructQrCodeUrl();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  constructQrCodeUrl(): void {
    const total = this.booking.totalFare || 1450;
    const upiUri = encodeURIComponent(`upi://pay?pa=adityaaditya2034@naviaxis&pn=ADITYA%20ADITYA&am=${total}&cu=INR`);
    this.qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${upiUri}&margin=1`;
  }

  startCountdown(): void {
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
      } else {
        if (this.timerMinutes > 0) {
          this.timerMinutes--;
          this.timerSeconds = 59;
        } else {
          clearInterval(this.timerInterval);
        }
      }
    }, 1000);
  }

  get formattedTime(): string {
    const m = this.timerMinutes < 10 ? '0' + this.timerMinutes : this.timerMinutes;
    const s = this.timerSeconds < 10 ? '0' + this.timerSeconds : this.timerSeconds;
    return `${m}:${s}`;
  }

  setTab(tab: 'upi' | 'card' | 'netbanking' | 'wallet'): void {
    this.selectedTab = tab;
  }

  toggleQrDisplay(): void {
    this.showQrAnimation = !this.showQrAnimation;
  }

  processPayment(): void {
    this.isProcessing = true;
    setTimeout(() => {
      this.isProcessing = false;
      this.paymentSuccess = true;
    }, 1500);
  }

  goToHome(): void {
    sessionStorage.removeItem('currentBooking');
    sessionStorage.removeItem('selectedBooking');
    this.router.navigate(['/']);
  }
}

export { PaymentPageComponent as PaymentComponent };