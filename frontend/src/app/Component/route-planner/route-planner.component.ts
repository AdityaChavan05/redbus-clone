import { Component, OnInit } from '@angular/core';

export interface RouteOption {
  id: string;
  name: string;
  distance: string;
  duration: string;
  trafficStatus: 'Low' | 'Moderate' | 'Heavy';
  delayMinutes: number;
  tollEstimate: string;
  recommended: boolean;
  stops: string[];
}

export interface SavedRoute {
  id: string;
  origin: string;
  destination: string;
  waypoints: string[];
  savedAt: string;
}

@Component({
  selector: 'app-route-planner',
  templateUrl: './route-planner.component.html',
  styleUrls: ['./route-planner.component.css']
})
export class RoutePlannerComponent implements OnInit {
  origin: string = 'Bengaluru';
  destination: string = 'Mumbai';
  waypoints: string[] = ['Hubli', 'Pune'];
  newWaypointInput: string = '';
  
  isLoading: boolean = false;
  selectedRouteIndex: number = 0;
  
  routeOptions: RouteOption[] = [];
  savedRoutes: SavedRoute[] = [];

  ngOnInit(): void {
    const cached = localStorage.getItem('redbus_saved_routes');
    if (cached) {
      this.savedRoutes = JSON.parse(cached);
    }
    this.planJourney();
  }

  addWaypoint(): void {
    const stop = this.newWaypointInput.trim();
    if (stop && !this.waypoints.includes(stop)) {
      this.waypoints.push(stop);
      this.newWaypointInput = '';
      this.planJourney();
    }
  }

  removeWaypoint(index: number): void {
    this.waypoints.splice(index, 1);
    this.planJourney();
  }

  planJourney(): void {
    if (!this.origin.trim() || !this.destination.trim()) return;

    this.isLoading = true;

    // Simulate multi-route calculation & live traffic metrics
    setTimeout(() => {
      const allStops = [this.origin, ...this.waypoints, this.destination];
      
      this.routeOptions = [
        {
          id: 'route-1',
          name: 'NH-48 Golden Quadrilateral (Recommended)',
          distance: '984 km',
          duration: '14 hrs 30 mins',
          trafficStatus: 'Low',
          delayMinutes: 0,
          tollEstimate: '?1,240',
          recommended: true,
          stops: allStops
        },
        {
          id: 'route-2',
          name: 'Via Solapur - Pune Bypass',
          distance: '1,040 km',
          duration: '16 hrs 15 mins',
          trafficStatus: 'Moderate',
          delayMinutes: 28,
          tollEstimate: '?980',
          recommended: false,
          stops: [this.origin, 'Solapur', 'Pune', this.destination]
        },
        {
          id: 'route-3',
          name: 'Scenic Coastal Corridor (NH-66)',
          distance: '1,120 km',
          duration: '18 hrs 45 mins',
          trafficStatus: 'Heavy',
          delayMinutes: 65,
          tollEstimate: '?750',
          recommended: false,
          stops: [this.origin, 'Mangaluru', 'Goa', this.destination]
        }
      ];

      this.selectedRouteIndex = 0;
      this.isLoading = false;
    }, 450);
  }

  selectRoute(index: number): void {
    this.selectedRouteIndex = index;
  }

  saveCurrentRoute(): void {
    const newEntry: SavedRoute = {
      id: 'SR-' + Date.now(),
      origin: this.origin,
      destination: this.destination,
      waypoints: [...this.waypoints],
      savedAt: new Date().toLocaleDateString()
    };

    this.savedRoutes.unshift(newEntry);
    localStorage.setItem('redbus_saved_routes', JSON.stringify(this.savedRoutes));
    alert('Route successfully saved to your quick-access favorites!');
  }

  loadSavedRoute(route: SavedRoute): void {
    this.origin = route.origin;
    this.destination = route.destination;
    this.waypoints = [...route.waypoints];
    this.planJourney();
  }

  deleteSavedRoute(index: number, event: MouseEvent): void {
    event.stopPropagation();
    this.savedRoutes.splice(index, 1);
    localStorage.setItem('redbus_saved_routes', JSON.stringify(this.savedRoutes));
  }
}
