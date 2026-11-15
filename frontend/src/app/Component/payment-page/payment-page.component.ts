import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

@Component({
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.css']
})
export class PaymentPageComponent implements OnInit, OnDestroy {

  busName: string = '';
  busType: string = '';
  fromCity: string = '';
  toCity: string = '';
  journeyDate: string = '';
  depTime: string = '';
  arrTime: string = '';
  selectedSeats: string = '';
  pickupPoint: string = '';
  dropPoint: string = '';
  totalFare: number = 0;

  activeTab: PaymentMethod = 'upi';
  upiSubMethod: 'qr' | 'apps' | 'id' = 'qr';
  selectedUpiApp: string = 'phonepe';
  customUpiId: string = '';
  copiedVpa: boolean = false;

  // Interactive Live Card Preview Data
  cardNumber: string = '';
  cardExpiry: string = '';
  cardCvv: string = '';
  cardName: string = 'ADITYA CHAVAN';
  cardNetwork: 'visa' | 'mastercard' | 'rupay' = 'visa';

  // Netbanking Selection
  selectedBank: string = 'SBI';

  // Wallet Selection
  selectedWallet: string = 'amazon';

  // UPI Metadata
  upiVpa: string = 'adityaaditya2034@naviaxis';
  payeeName: string = 'ADITYA ADITYA';

  // Checkout State
  isProcessing: boolean = false;
  bookingSuccess: boolean = false;
  bookingRef: string = '';
  paidVia: string = '';

  timerMinutes: number = 9;
  timerSeconds: number = 59;
  private timerInterval: any;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.busName = params['bus'] || 'VRL Travels';
      this.busType = params['type'] || 'Volvo Multi-Axle AC Sleeper (2+1)';
      this.fromCity = params['from'] || 'Bengaluru';
      this.toCity = params['to'] || 'Goa';
      this.journeyDate = params['date'] || 'Today';
      this.depTime = params['dep'] || '21:00';
      this.arrTime = params['arr'] || '07:30';
      this.selectedSeats = params['seats'] || 'L-A1 (Standard Berth)';
      this.pickupPoint = params['pickup'] || 'Central Bus Stand';
      this.dropPoint = params['drop'] || 'City Terminal';
      this.totalFare = Number(params['fare']) || 1200;
    });

    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
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
          alert('Booking session expired. Please reselect your seats.');
          this.router.navigate(['/']);
        }
      }
    }, 1000);
  }

  setTab(tab: PaymentMethod): void {
    this.activeTab = tab;
  }

  setUpiSubMethod(method: 'qr' | 'apps' | 'id'): void {
    this.upiSubMethod = method;
  }

  selectUpiApp(app: string): void {
    this.selectedUpiApp = app;
  }

  selectBank(bank: string): void {
    this.selectedBank = bank;
  }

  selectWallet(wallet: string): void {
    this.selectedWallet = wallet;
  }

  // Live Card Masking & Network Detection
  onCardNumberInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.substring(0, 16);

    // Network Identification
    if (value.startsWith('4')) {
      this.cardNetwork = 'visa';
    } else if (value.startsWith('5')) {
      this.cardNetwork = 'mastercard';
    } else if (value.startsWith('6') || value.startsWith('508')) {
      this.cardNetwork = 'rupay';
    }

    // Format with spaces
    this.cardNumber = value.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  onExpiryInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.substring(0, 4);
    if (value.length >= 3) {
      this.cardExpiry = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    } else {
      this.cardExpiry = value;
    }
  }

  copyVpa(): void {
    navigator.clipboard.writeText(this.upiVpa);
    this.copiedVpa = true;
    setTimeout(() => { this.copiedVpa = false; }, 2000);
  }

  processPayment(methodDescription?: string): void {
    this.isProcessing = true;
    this.paidVia = methodDescription || this.getFormattedPaymentMethod();

    setTimeout(() => {
      this.isProcessing = false;
      this.bookingRef = 'RB' + Math.floor(100000 + Math.random() * 900000);
      this.bookingSuccess = true;
    }, 1000);
  }

  getFormattedPaymentMethod(): string {
    switch (this.activeTab) {
      case 'upi':
        return this.upiSubMethod === 'qr' ? 'PhonePe Dynamic QR' : `UPI (${this.selectedUpiApp.toUpperCase()})`;
      case 'card':
        return `${this.cardNetwork.toUpperCase()} Debit/Credit Card`;
      case 'netbanking':
        return `Net Banking (${this.selectedBank})`;
      case 'wallet':
        return `Digital Wallet (${this.selectedWallet.toUpperCase()})`;
      default:
        return 'Online Secure Checkout';
    }
  }
}

export { PaymentPageComponent as PaymentComponent };