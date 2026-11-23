import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface BusFilterCriteria {
  primo: boolean;
  ac: boolean;
  sleeper: boolean;
  singleSeats: boolean;
  evening18to24: boolean;
  highRated: boolean;
  liveTracking: boolean;
  volvo: boolean;
  depBefore6AM: boolean;
  dep6AMto12PM: boolean;
  dep12PMto6PM: boolean;
  depAfter6PM: boolean;
}

@Component({
  selector: 'app-left',
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})
export class LeftComponent implements OnInit {
  @Input() fromCity: string = 'Hyderabad';
  @Input() toCity: string = 'Mumbai';
  @Input() totalFilteredCount: number = 21;
  @Input() distanceKm: number = 709;
  @Input() duration: string = '14h 30m';

  @Output() filtersChanged = new EventEmitter<BusFilterCriteria>();

  filters: BusFilterCriteria = {
    primo: false,
    ac: false,
    sleeper: false,
    singleSeats: false,
    evening18to24: false,
    highRated: false,
    liveTracking: false,
    volvo: false,
    depBefore6AM: false,
    dep6AMto12PM: false,
    dep12PMto6PM: false,
    depAfter6PM: false
  };

  ngOnInit(): void {}

  toggleFilter(key: keyof BusFilterCriteria): void {
    this.filters[key] = !this.filters[key];
    this.emitFilters();
  }

  onCheckboxChange(): void {
    this.emitFilters();
  }

  applyQuickTip(): void {
    this.filters.ac = true;
    this.filters.highRated = true;
    this.emitFilters();
  }

  clearAllFilters(): void {
    this.filters = {
      primo: false,
      ac: false,
      sleeper: false,
      singleSeats: false,
      evening18to24: false,
      highRated: false,
      liveTracking: false,
      volvo: false,
      depBefore6AM: false,
      dep6AMto12PM: false,
      dep12PMto6PM: false,
      depAfter6PM: false
    };
    this.emitFilters();
  }

  get activeFilterCount(): number {
    return Object.values(this.filters).filter(Boolean).length;
  }

  private emitFilters(): void {
    this.filtersChanged.emit({ ...this.filters });
  }
}