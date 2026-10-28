import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'redbus-clone';
  showLoginModal: boolean = false;
  mobileNumber: string = '';

  ngOnInit(): void {
    const activeUser = localStorage.getItem('redbus_user');
    // Prompt upfront if not logged in
    if (!activeUser) {
      this.showLoginModal = true;
    }
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  loginWithPhone(): void {
    if (!/^\d{10}$/.test(this.mobileNumber.trim())) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    const user = { phone: this.mobileNumber, provider: 'phone' };
    localStorage.setItem('redbus_user', JSON.stringify(user));
    this.showLoginModal = false;
  }

  loginWithSocial(provider: string): void {
    const user = { email: `user@${provider.toLowerCase()}.com`, provider };
    localStorage.setItem('redbus_user', JSON.stringify(user));
    this.showLoginModal = false;
  }
}