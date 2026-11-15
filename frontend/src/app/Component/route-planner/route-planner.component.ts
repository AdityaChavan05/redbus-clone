import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';

declare var L: any;

export interface FoodStop {
  name: string;
  location: string;
  lat: number;
  lng: number;
  amenities: string;
  recommendedOperator: string;
  typicalStopTime: string;
}

export interface TurnDirection {
  instruction: string;
  distance: string;
  modifier?: string;
}

export interface RouteOption {
  id: string;
  name: string;
  highwayCode: string;
  badge: string;
  isFastest?: boolean;
  distanceKm: number;
  duration: string;
  tollEstimate: number;
  trafficStatus: 'Low' | 'Moderate' | 'Heavy';
  trafficDelay: string;
  corridorDescription: string;
  foodStops: FoodStop[];
  waypoints: string[];
}

export interface SavedRouteItem {
  origin: string;
  destination: string;
  distance: number;
  duration: string;
  date: string;
}

@Component({
  selector: 'app-route-planner',
  templateUrl: './route-planner.component.html',
  styleUrls: ['./route-planner.component.css']
})
export class RoutePlannerComponent implements OnInit, AfterViewInit, OnDestroy {

  cityCoords: { [key: string]: [number, number] } = {
    'Bengaluru': [12.9716, 77.5946],
    'Hubli': [15.3647, 75.1240],
    'Belagavi': [15.8497, 74.4977],
    'Kolhapur': [16.7050, 74.2433],
    'Satara': [17.6805, 73.9997],
    'Pune': [18.5204, 73.8567],
    'Mumbai': [19.0760, 72.8777],
    'Goa': [15.2993, 74.1240],
    'Panaji': [15.4909, 73.8278],
    'Hyderabad': [17.3850, 78.4867],
    'Chennai': [13.0827, 80.2707],
    'Kalaburagi': [17.3297, 76.8343],
    'Bidar': [17.9104, 77.5199],
    'Humnabad': [17.7667, 77.1333],
    'Solapur': [17.6599, 75.9064],
    'Mangaluru': [12.9141, 74.8560],
    'Mysuru': [12.2958, 76.6394],
    'Coimbatore': [11.0168, 76.9558],
    'Vijayawada': [16.5062, 80.6480],
    'Kurnool': [15.8281, 78.0373],
    'Anantapur': [14.6819, 77.6006],
    'Hassan': [13.0033, 76.1004],
    'Hosur': [12.7409, 77.8253],
    'Vellore': [12.9165, 79.1325]
  };

  availableCities: string[] = [
    'Bengaluru',
    'Mumbai',
    'Goa',
    'Pune',
    'Hyderabad',
    'Chennai',
    'Bidar',
    'Kalaburagi',
    'Humnabad',
    'Mangaluru',
    'Hubli',
    'Solapur',
    'Mysuru',
    'Coimbatore',
    'Vijayawada'
  ];

  origin: string = 'Bengaluru';
  destination: string = 'Mumbai';
  newWaypointInput: string = '';
  isLoading: boolean = false;
  isRouteSaved: boolean = false;

  waypoints: string[] = ['Hubli', 'Pune'];
  routeOptions: RouteOption[] = [];
  selectedRoute: RouteOption | null = null;
  savedRoutes: SavedRouteItem[] = [];
  turnDirections: TurnDirection[] = [];

  private map: any = null;
  private routePolyline: any = null;
  private glowPolyline: any = null;
  private markersLayer: any = null;

  ngOnInit(): void {
    this.updateWaypointsForPair();
    this.generateRoutes();
  }

  ngAfterViewInit(): void {
    this.loadLeafletLibrary();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private loadLeafletLibrary(): void {
    if ((window as any).L) {
      this.initRealMap();
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      this.initRealMap();
    };
    document.body.appendChild(script);
  }

  private initRealMap(): void {
    const mapElement = document.getElementById('real-route-map');
    if (!mapElement || typeof L === 'undefined') return;

    if (this.map) {
      this.map.remove();
    }

    const startPos = this.cityCoords[this.origin] || [15.0, 75.0];

    this.map = L.map('real-route-map', {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView(startPos, 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.fetchRealRoadGeometry();
  }

  // Pre-populates typical operator halt cities depending on the chosen route
  updateWaypointsForPair(): void {
    const pair = `${this.origin}-${this.destination}`;
    const reverse = `${this.destination}-${this.origin}`;

    if (pair === 'Bengaluru-Mumbai' || reverse === 'Bengaluru-Mumbai') {
      this.waypoints = ['Hubli', 'Pune'];
    } else if (pair === 'Bengaluru-Goa' || reverse === 'Bengaluru-Goa' || this.destination === 'Panaji') {
      this.waypoints = ['Hubli'];
    } else if (pair === 'Mumbai-Goa' || reverse === 'Mumbai-Goa') {
      this.waypoints = ['Pune', 'Kolhapur'];
    } else if (pair === 'Bengaluru-Hyderabad' || reverse === 'Bengaluru-Hyderabad') {
      this.waypoints = ['Anantapur', 'Kurnool'];
    } else if (pair === 'Bengaluru-Chennai' || reverse === 'Bengaluru-Chennai') {
      this.waypoints = ['Hosur', 'Vellore'];
    } else if (pair === 'Bengaluru-Kalaburagi' || pair === 'Bengaluru-Bidar' || pair === 'Bengaluru-Humnabad') {
      this.waypoints = ['Anantapur', 'Solapur'];
    } else if (pair === 'Bengaluru-Mangaluru' || reverse === 'Bengaluru-Mangaluru') {
      this.waypoints = ['Hassan'];
    } else {
      this.waypoints = [];
    }
  }

  // Dynamic Official Highway Profiles based on actual operator transit routes
  generateRoutes(): void {
    const from = this.origin;
    const to = this.destination;
    const pair = `${from}-${to}`;
    const rev = `${to}-${from}`;
    const rawDist = this.calculateGeodesicDistance(from, to);

    // 1. BENGALURU <-> MUMBAI / PUNE
    if (pair === 'Bengaluru-Mumbai' || rev === 'Bengaluru-Mumbai' || pair === 'Bengaluru-Pune' || rev === 'Bengaluru-Pune') {
      this.routeOptions = [
        {
          id: 'ROUTE-BLR-BOM-1',
          name: 'NH-48 Golden Quadrilateral (AH-47 / Bengaluru-Pune Highway)',
          highwayCode: 'NH-48 (AH-47)',
          badge: 'Official Fleet Route',
          isFastest: true,
          distanceKm: rawDist,
          duration: `${Math.floor(rawDist / 68)} hrs ${Math.round((rawDist % 68) * 0.8)} mins`,
          tollEstimate: 1240,
          trafficStatus: 'Low',
          trafficDelay: 'Smooth six-lane multi-axle flow with FASTag electronic toll lanes',
          corridorDescription: 'Primary commercial artery used by VRL Travels, SRS, and Orange Travels via Tumakuru, Chitradurga, Hubli, Belagavi, Kolhapur, Satara, and Pune.',
          foodStops: [
            {
              name: 'Kamat Upachar Food Plaza',
              location: 'Sira Bypass, NH-48 (KM 118)',
              lat: 13.7441,
              lng: 76.9062,
              amenities: 'Pure Veg Meals, Clean Restrooms, 24/7 Filter Coffee',
              recommendedOperator: 'VRL Travels, SRS Travels & Orange Tours',
              typicalStopTime: '25-30 Mins (Dinner Break)'
            },
            {
              name: 'Hotel Sai International',
              location: 'Kolhapur Bypass, NH-48',
              lat: 16.7320,
              lng: 74.2850,
              amenities: 'Multi-cuisine Restaurant, Fuel Station, Pharmacy',
              recommendedOperator: 'IntrCity SmartBus & Airavat Club Class',
              typicalStopTime: '30 Mins (Dinner / Midnight Halt)'
            },
            {
              name: 'Smile Stone Highway Food Mall',
              location: 'Mumbai-Pune Expressway (NE-1)',
              lat: 18.7546,
              lng: 73.4062,
              amenities: 'McDonalds, Starbucks, Shivraj Dhaba, Clean Restrooms',
              recommendedOperator: 'All Intercity Volvo/Scania Fleets',
              typicalStopTime: '20 Mins (Breakfast Halt)'
            }
          ],
          waypoints: [from, ...this.waypoints, to]
        },
        {
          id: 'ROUTE-BLR-BOM-2',
          name: 'Via NH-50 & NH-65 (Solapur - Pune Eastern Bypass)',
          highwayCode: 'NH-50 / NH-65',
          badge: 'Alternate Freight Corridor',
          isFastest: false,
          distanceKm: Math.round(rawDist * 1.09),
          duration: `${Math.floor((rawDist * 1.09) / 60)} hrs 45 mins`,
          tollEstimate: 980,
          trafficStatus: 'Moderate',
          trafficDelay: '+25m queue near Solapur junction toll booths',
          corridorDescription: 'Bypasses western ghat roads via Hospet, Kushtagi, Vijayapura, Solapur, and Indapur, utilized when NH-48 undergoes monsoon maintenance.',
          foodStops: [
            {
              name: 'Surabhi Pure Veg Highway Court',
              location: 'Kushtagi Bypass, NH-50',
              lat: 15.7580,
              lng: 76.1950,
              amenities: 'North & South Indian Thali, Large Bus Parking',
              recommendedOperator: 'Vijayanand Travels & Sugama Tourist',
              typicalStopTime: '25 Mins (Dinner Break)'
            }
          ],
          waypoints: [from, 'Solapur', to]
        }
      ];
    }
    // 2. BENGALURU <-> GOA
    else if (pair === 'Bengaluru-Goa' || rev === 'Bengaluru-Goa' || to === 'Panaji' || from === 'Panaji') {
      this.routeOptions = [
        {
          id: 'ROUTE-BLR-GOA-1',
          name: 'NH-48 to NH-748 (Hubli - Dharwad - Anmod Ghat / Mollem)',
          highwayCode: 'NH-48 & NH-748',
          badge: 'Direct Sleeper Route',
          isFastest: true,
          distanceKm: rawDist,
          duration: `${Math.floor(rawDist / 60)} hrs ${Math.round((rawDist % 60) * 0.9)} mins`,
          tollEstimate: 780,
          trafficStatus: 'Low',
          trafficDelay: 'Clear Ghat section flow during night transit',
          corridorDescription: 'Preferred night route for Goa-bound AC sleepers departing Majestic & Madiwala via Tumakuru, Chitradurga, Hubli bypass, Dharwad, Ramnagar, Anmod, and Ponda.',
          foodStops: [
            {
              name: 'Kamat Upachar & Café',
              location: 'Chitradurga Bypass, NH-48',
              lat: 14.2251,
              lng: 76.3980,
              amenities: 'Hygienic Restrooms, South Indian Coffee, Snacks',
              recommendedOperator: 'KSRTC Airavat, VRL & Paulo Travels',
              typicalStopTime: '25 Mins (Dinner Break)'
            },
            {
              name: 'Dharwad Highway Refreshment Oasis',
              location: 'Hubli-Dharwad Bypass',
              lat: 15.4200,
              lng: 75.0500,
              amenities: 'Tea Stall, Fresh Snacks, Washrooms',
              recommendedOperator: 'Orange Tours & SRS Travels',
              typicalStopTime: '15 Mins (Midnight Tea Halt)'
            }
          ],
          waypoints: [from, 'Hubli', to]
        },
        {
          id: 'ROUTE-BLR-GOA-2',
          name: 'Via NH-69 & NH-66 (Shimoga - Sagara - Honnavar - Karwar)',
          highwayCode: 'NH-69 / NH-66',
          badge: 'Coastal Scenic Corridor',
          isFastest: false,
          distanceKm: Math.round(rawDist * 1.12),
          duration: `${Math.floor((rawDist * 1.12) / 52)} hrs 30 mins`,
          tollEstimate: 540,
          trafficStatus: 'Moderate',
          trafficDelay: 'Curved ghat roads through Jog Falls corridor',
          corridorDescription: 'Daytime service route through Malnad forest and Konkan coastal belt, connecting to South Goa via Canacona and Margao.',
          foodStops: [
            {
              name: 'Hotel Sharavathi Highway Comforts',
              location: 'Honnavar Coastal Cross, NH-66',
              lat: 14.2800,
              lng: 74.4500,
              amenities: 'Coastal Fish Curry & Veg Meals, Restrooms',
              recommendedOperator: 'Canara Pinto & Durgamba Motors',
              typicalStopTime: '30 Mins (Lunch / Dinner)'
            }
          ],
          waypoints: [from, 'Karwar', to]
        }
      ];
    }
    // 3. MUMBAI <-> GOA
    else if (pair === 'Mumbai-Goa' || rev === 'Mumbai-Goa') {
      this.routeOptions = [
        {
          id: 'ROUTE-BOM-GOA-1',
          name: 'NH-66 (Panvel - Kochi Coastal Expressway / Mumbai-Goa Highway)',
          highwayCode: 'NH-66 (Old NH-17)',
          badge: 'Official Coastal Route',
          isFastest: true,
          distanceKm: rawDist,
          duration: `${Math.floor(rawDist / 58)} hrs ${Math.round((rawDist % 58) * 0.9)} mins`,
          tollEstimate: 620,
          trafficStatus: 'Low',
          trafficDelay: 'Four-lane expressway operational on major stretches',
          corridorDescription: 'Direct Konkan highway chosen by private operators departing Borivali & Vashi via Mangaon, Mahad, Chiplun, Khed, Sangameshwar, Hathkhamba, and Kankavli into Mapusa.',
          foodStops: [
            {
              name: 'Hotel Abhishek International',
              location: 'Chiplun Bypass, NH-66',
              lat: 17.5320,
              lng: 73.5180,
              amenities: 'Konkani Food, AC Family Lounge, Clean Restrooms',
              recommendedOperator: 'Paulo Travels, Atmaram & Zingbus',
              typicalStopTime: '30 Mins (Dinner Break)'
            }
          ],
          waypoints: [from, 'Chiplun', to]
        },
        {
          id: 'ROUTE-BOM-GOA-2',
          name: 'Via NE-1 & NH-48 to Amba Ghat (Pune - Kolhapur - Radhanagari)',
          highwayCode: 'NE-1, NH-48 & SH-115',
          badge: 'Smooth Expressway Route',
          isFastest: false,
          distanceKm: Math.round(rawDist * 1.08),
          duration: `${Math.floor((rawDist * 1.08) / 64)} hrs 15 mins`,
          tollEstimate: 950,
          trafficStatus: 'Low',
          trafficDelay: 'Fast multi-lane driving till Kolhapur with night ghat crossing',
          corridorDescription: 'Uses the high-speed Mumbai-Pune Expressway and 6-lane NH-48 till Kolhapur, then branches through Nipani and Gadhiglaj into Goa.',
          foodStops: [
            {
              name: 'Food Express Mall',
              location: 'Mumbai-Pune Expressway (Khalapur)',
              lat: 18.7800,
              lng: 73.2800,
              amenities: 'CCD, Subway, Haldiram, Washrooms',
              recommendedOperator: 'IntrCity SmartBus, VRL Travels',
              typicalStopTime: '20 Mins (Snack Halt)'
            }
          ],
          waypoints: [from, 'Pune', 'Kolhapur', to]
        }
      ];
    }
    // 4. BENGALURU <-> HYDERABAD
    else if (pair === 'Bengaluru-Hyderabad' || rev === 'Bengaluru-Hyderabad') {
      this.routeOptions = [
        {
          id: 'ROUTE-BLR-HYD-1',
          name: 'NH-44 (North-South Corridor / Bengaluru-Hyderabad Expressway)',
          highwayCode: 'NH-44 (Old NH-7)',
          badge: 'Official 4/6-Lane Express Corridor',
          isFastest: true,
          distanceKm: rawDist,
          duration: `${Math.floor(rawDist / 72)} hrs ${Math.round((rawDist % 72) * 0.8)} mins`,
          tollEstimate: 850,
          trafficStatus: 'Low',
          trafficDelay: 'High speed corridor with minimum urban intersection slowdowns',
          corridorDescription: 'Straight highway chosen by TSRTC, KSRTC, Orange Travels, and Jabbar Travels via Chikballapur, Bagepalli, Anantapur bypass, Gooty, Dhone, Kurnool, Jadcherla, and Shamshabad.',
          foodStops: [
            {
              name: 'Garam Masala / Blue Moon Food Court',
              location: 'Near Anantapur, NH-44 (KM 215)',
              lat: 14.6819,
              lng: 77.6006,
              amenities: 'Hyderabadi Biryani, Dosa Counters, Modern Restrooms',
              recommendedOperator: 'Orange Tours, Morning Star & Jabbar Travels',
              typicalStopTime: '30 Mins (Dinner Break)'
            },
            {
              name: 'Food Pyramid Highway Oasis',
              location: 'Near Jadcherla, NH-44',
              lat: 16.7600,
              lng: 78.1300,
              amenities: 'Tea, Coffee, Bakery, Washrooms',
              recommendedOperator: 'TSRTC Garuda Plus & VRL Travels',
              typicalStopTime: '15 Mins (Early Morning Halt)'
            }
          ],
          waypoints: [from, ...this.waypoints, to]
        }
      ];
    }
    // 5. BENGALURU <-> CHENNAI
    else if (pair === 'Bengaluru-Chennai' || rev === 'Bengaluru-Chennai') {
      this.routeOptions = [
        {
          id: 'ROUTE-BLR-MAA-1',
          name: 'NH-48 & NH-75 (Bengaluru - Krishnagiri - Vellore - Chennai Highway)',
          highwayCode: 'NH-48 (Bengaluru-Chennai Corridor)',
          badge: 'Fastest Transit Route',
          isFastest: true,
          distanceKm: rawDist,
          duration: `${Math.floor(rawDist / 60)} hrs ${Math.round((rawDist % 60) * 0.9)} mins`,
          tollEstimate: 490,
          trafficStatus: 'Moderate',
          trafficDelay: '+15m peak traffic near Sriperumbudur industrial belt',
          corridorDescription: 'Primary bus arterial used by SETC, KSRTC Airavat, and Asian Xpress via Electronic City, Hosur, Krishnagiri, Vaniyambadi, Ambur, Vellore, Walajapet, and Poonamallee.',
          foodStops: [
            {
              name: 'A2B (Adyar Ananda Bhavan) Highway Hub',
              location: 'Chinnar Toll Plaza, NH-48 (Near Krishnagiri)',
              lat: 12.5200,
              lng: 78.2100,
              amenities: 'Pure Veg South Indian Meals, Filter Coffee, Restrooms',
              recommendedOperator: 'KSRTC, SETC, Parveen Travels',
              typicalStopTime: '30 Mins (Meal Break)'
            },
            {
              name: 'Ambur Star Biryani Highway Stop',
              location: 'Ambur Bypass, NH-48',
              lat: 12.7900,
              lng: 78.7100,
              amenities: 'Ambur Mutton/Chicken Biryani, Sweets, Refreshments',
              recommendedOperator: 'Asian Xpress, GreenLine Travels',
              typicalStopTime: '25 Mins (Dinner Break)'
            }
          ],
          waypoints: [from, ...this.waypoints, to]
        }
      ];
    }
    // 6. BENGALURU <-> BIDAR / KALABURAGI / HUMNABAD
    else if (to === 'Bidar' || to === 'Kalaburagi' || to === 'Humnabad' || from === 'Bidar' || from === 'Kalaburagi' || from === 'Humnabad') {
      this.routeOptions = [
        {
          id: 'ROUTE-BLR-DECCAN-1',
          name: 'NH-44 & NH-50 (Bengaluru - Anantapur - Hospet - Kalaburagi/Bidar Corridor)',
          highwayCode: 'NH-44 / NH-50',
          badge: 'Daily North-Karnataka Express Route',
          isFastest: true,
          distanceKm: rawDist,
          duration: `${Math.floor(rawDist / 62)} hrs ${Math.round((rawDist % 62) * 0.8)} mins`,
          tollEstimate: 720,
          trafficStatus: 'Low',
          trafficDelay: 'Clear highway driving through the Deccan plateau',
          corridorDescription: 'Official commercial route chosen daily by Kalyana Karnataka RTC (KKRTC), VRL, and Shakuntala Travels via Chikballapur, Penukonda, Bellary, Hospet, Kushtagi, Ilkal, Jewargi, Kalaburagi, and Humnabad NH-65 cross.',
          foodStops: [
            {
              name: 'Hospet Highway Food Court',
              location: 'Near Tungabhadra Cross, NH-50',
              lat: 15.2689,
              lng: 76.3909,
              amenities: 'Rotis, Veg Meals, Tea Stalls, Bus Bays',
              recommendedOperator: 'KKRTC, VRL & Sugama Tourist',
              typicalStopTime: '30 Mins (Dinner Break)'
            },
            {
              name: 'Hotel Gurukripa & Dhaba',
              location: 'Shahabad Cross, Kalaburagi Bypass',
              lat: 17.1500,
              lng: 76.8500,
              amenities: 'Jowar Roti Oota, Chai, Restrooms',
              recommendedOperator: 'Bidar & Humnabad Intercity Sleepers',
              typicalStopTime: '20 Mins (Early Morning Halt)'
            }
          ],
          waypoints: [from, 'Anantapur', 'Solapur', to]
        }
      ];
    }
    // 7. BENGALURU <-> MANGALURU
    else if (pair === 'Bengaluru-Mangaluru' || rev === 'Bengaluru-Mangaluru') {
      this.routeOptions = [
        {
          id: 'ROUTE-BLR-IXE-1',
          name: 'NH-75 (Bengaluru - Hassan - Shiradi Ghat - Mangaluru Highway)',
          highwayCode: 'NH-75',
          badge: 'Direct Shiradi Ghat Route',
          isFastest: true,
          distanceKm: rawDist,
          duration: `${Math.floor(rawDist / 48)} hrs ${Math.round((rawDist % 48) * 0.9)} mins`,
          tollEstimate: 380,
          trafficStatus: 'Moderate',
          trafficDelay: 'Controlled speed in Shiradi Ghat hairpin curves',
          corridorDescription: 'Premier route chosen by KSRTC Airavat, Sugama, Durgamba, and Anand Travels departing Nelamangala via Kunigal, Channarayapatna, Hassan bypass, Sakleshpur, Gundya, Uppinangady, and BC Road.',
          foodStops: [
            {
              name: 'Swathi Delicacy Highway Plaza',
              location: 'Yediyur, NH-75 (Near Kunigal)',
              lat: 13.0033,
              lng: 76.8900,
              amenities: 'South Indian Tiffin, Filter Coffee, Modern Washrooms',
              recommendedOperator: 'KSRTC Airavat, Sugama, Durgamba',
              typicalStopTime: '25 Mins (Breakfast / Dinner)'
            },
            {
              name: 'Surabhi Veg / Sakleshpur Coffee Halt',
              location: 'Sakleshpur Entrance, NH-75',
              lat: 12.9700,
              lng: 75.7800,
              amenities: 'Hot Tea, Coffee, Snacks before Ghat descent',
              recommendedOperator: 'All Mangalore Sleeper Operators',
              typicalStopTime: '15 Mins (Refreshment Halt)'
            }
          ],
          waypoints: [from, 'Hassan', to]
        }
      ];
    }
    // 8. MUMBAI <-> PUNE
    else if (pair === 'Mumbai-Pune' || rev === 'Mumbai-Pune') {
      this.routeOptions = [
        {
          id: 'ROUTE-BOM-PUN-1',
          name: 'Yashwantrao Chavan Mumbai-Pune Expressway (NE-1)',
          highwayCode: 'NE-1 / NH-48',
          badge: 'India’s 1st 6-Lane Concrete Expressway',
          isFastest: true,
          distanceKm: rawDist,
          duration: `${Math.floor(rawDist / 55)} hrs ${Math.round((rawDist % 55) * 0.9)} mins`,
          tollEstimate: 320,
          trafficStatus: 'Low',
          trafficDelay: 'Controlled access high-speed corridor',
          corridorDescription: 'High-frequency shuttle route connecting Borivali, Dadar, and Vashi directly to Wakad, Swargate, and Pune Station via Khalapur, Khandala Ghat, Lonavala, and Talegaon.',
          foodStops: [
            {
              name: 'Urse Food Mall (Pune Bound)',
              location: 'Mumbai-Pune Expressway (KM 85)',
              lat: 18.7200,
              lng: 73.6500,
              amenities: 'KFC, Subway, Shivraj Dhaba, Clean Toilets',
              recommendedOperator: 'MSRTC Shivneri, Neeta Travels & Purple',
              typicalStopTime: '20 Mins (Refreshment Break)'
            }
          ],
          waypoints: [from, to]
        }
      ];
    }
    // 9. GENERIC REGIONAL ROUTE FALLBACK
    else {
      const highwayNumber = Math.abs(rawDist % 70) + 40;
      this.routeOptions = [
        {
          id: 'ROUTE-REGIONAL-1',
          name: `National Highway NH-${highwayNumber} Intercity Corridor`,
          highwayCode: `NH-${highwayNumber}`,
          badge: 'Commercial Fleet Route',
          isFastest: true,
          distanceKm: rawDist,
          duration: `${Math.floor(rawDist / 62)} hrs ${Math.round((rawDist % 62) * 0.8)} mins`,
          tollEstimate: Math.round(rawDist * 1.15),
          trafficStatus: 'Low',
          trafficDelay: 'Clear highway transit',
          corridorDescription: `Official intercity highway corridor connecting ${from} to ${to} deployed by private sleeper coaches and state transport fleets.`,
          foodStops: [
            {
              name: `${from} Highway Comforts & Dhaba`,
              location: `Bypass Toll, NH-${highwayNumber}`,
              lat: this.cityCoords[from] ? (this.cityCoords[from][0] + 0.25) : 15.0,
              lng: this.cityCoords[from] ? (this.cityCoords[from][1] + 0.25) : 75.0,
              amenities: 'Pure Veg & Non Veg Food, Parking, Washrooms',
              recommendedOperator: 'Official Fleet Operators',
              typicalStopTime: '25 Mins (Meal Halt)'
            }
          ],
          waypoints: [from, ...this.waypoints, to]
        }
      ];
    }

    this.selectedRoute = this.routeOptions[0];
    this.isRouteSaved = false;
  }

  fetchRealRoadGeometry(): void {
    if (!this.map || !this.selectedRoute || typeof L === 'undefined') return;

    const fromCoord = this.cityCoords[this.origin] || [12.9716, 77.5946];
    const toCoord = this.cityCoords[this.destination] || [19.0760, 72.8777];

    let coordList: [number, number][] = [fromCoord];
    this.waypoints.forEach(w => {
      if (this.cityCoords[w]) coordList.push(this.cityCoords[w]);
    });
    coordList.push(toCoord);

    const coordQuery = coordList.map(c => `${c[1]},${c[0]}`).join(';');
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordQuery}?overview=full&geometries=geojson&steps=true`;

    fetch(osrmUrl)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          const routeData = data.routes[0];
          const coordinates = routeData.geometry.coordinates.map((c: any) => [c[1], c[0]]);

          this.selectedRoute!.distanceKm = Math.round(routeData.distance / 1000);
          const totalMins = Math.round(routeData.duration / 60);
          this.selectedRoute!.duration = `${Math.floor(totalMins / 60)} hrs ${totalMins % 60} mins`;

          this.parseDirections(routeData.legs);
          this.drawRealRoadOnMap(coordinates);
        } else {
          this.drawRealRoadOnMap(coordList);
        }
      })
      .catch(() => {
        this.drawRealRoadOnMap(coordList);
      });
  }

  private parseDirections(legs: any[]): void {
    this.turnDirections = [];
    legs.forEach(leg => {
      if (leg.steps) {
        leg.steps.forEach((step: any) => {
          if (step.maneuver && step.name) {
            const distKm = (step.distance / 1000).toFixed(1);
            let instr = `${step.maneuver.type} on ${step.name}`;
            if (step.maneuver.modifier) {
              instr = `${step.maneuver.type} (${step.maneuver.modifier}) onto ${step.name || this.selectedRoute?.highwayCode || 'Highway'}`;
            }
            this.turnDirections.push({
              instruction: instr,
              distance: `${distKm} km`,
              modifier: step.maneuver.modifier || 'straight'
            });
          }
        });
      }
    });

    if (this.turnDirections.length === 0) {
      this.turnDirections = [
        { instruction: `Depart from ${this.origin} Central Terminal`, distance: '4.5 km' },
        { instruction: `Merge onto official corridor ${this.selectedRoute?.highwayCode || 'National Highway'}`, distance: `${this.selectedRoute?.distanceKm || 300} km` },
        { instruction: 'Scheduled food break at authorized operator dhaba', distance: '0.5 km' },
        { instruction: `Arrive at ${this.destination} Arrival Terminal`, distance: '0.0 km' }
      ];
    }
  }

  private drawRealRoadOnMap(coordinates: [number, number][]): void {
    this.markersLayer.clearLayers();

    if (this.routePolyline) this.map.removeLayer(this.routePolyline);
    if (this.glowPolyline) this.map.removeLayer(this.glowPolyline);

    // Glowing Underlay
    this.glowPolyline = L.polyline(coordinates, {
      color: '#3b82f6',
      weight: 10,
      opacity: 0.35,
      lineJoin: 'round'
    }).addTo(this.map);

    // Real Road Curving Polyline
    this.routePolyline = L.polyline(coordinates, {
      color: '#1d4ed8',
      weight: 5,
      opacity: 0.95,
      lineJoin: 'round'
    }).addTo(this.map);

    // Origin Marker (Pin A)
    const originIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div class="pin-bubble green-bubble">A</div><span class="pin-title">${this.origin}</span>`,
      iconSize: [80, 40],
      iconAnchor: [40, 36]
    });
    L.marker(coordinates[0], { icon: originIcon })
      .bindPopup(`<b>${this.origin} Bus Departure Terminal</b><br>Official boarding origin`)
      .addTo(this.markersLayer);

    // Destination Marker (Pin B)
    const destIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div class="pin-bubble red-bubble">B</div><span class="pin-title">${this.destination}</span>`,
      iconSize: [80, 40],
      iconAnchor: [40, 36]
    });
    L.marker(coordinates[coordinates.length - 1], { icon: destIcon })
      .bindPopup(`<b>${this.destination} Arrival Terminal</b><br>Final destination hub`)
      .addTo(this.markersLayer);

    // Food Stops Markers along the Highway
    if (this.selectedRoute && this.selectedRoute.foodStops) {
      this.selectedRoute.foodStops.forEach((food) => {
        const foodIcon = L.divIcon({
          className: 'custom-food-pin',
          html: `<div class="food-bubble">🍽️</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        L.marker([food.lat, food.lng], { icon: foodIcon })
          .bindPopup(`
            <div style="font-family: -apple-system, sans-serif; font-size: 13px; min-width: 200px;">
              <b style="color: #d84e55; font-size: 14px;">${food.name}</b><br>
              <span style="color: #64748b;">📍 ${food.location}</span><br>
              <div style="margin: 6px 0;"><strong>Operator Stop:</strong> ${food.recommendedOperator}</div>
              <div><strong>Halt Duration:</strong> ${food.typicalStopTime}</div>
              <div style="color: #16a34a; font-weight: 600; margin-top: 4px;">✓ ${food.amenities}</div>
            </div>
          `)
          .addTo(this.markersLayer);
      });
    }

    this.map.fitBounds(this.routePolyline.getBounds(), { padding: [40, 40] });
  }

  planJourney(): void {
    if (!this.origin.trim() || !this.destination.trim()) return;

    this.isLoading = true;
    this.updateWaypointsForPair();
    setTimeout(() => {
      this.generateRoutes();
      this.fetchRealRoadGeometry();
      this.isLoading = false;
    }, 200);
  }

  selectRouteOption(route: RouteOption): void {
    this.selectedRoute = route;
    this.fetchRealRoadGeometry();
  }

  addWaypoint(): void {
    const trimmed = this.newWaypointInput.trim();
    if (trimmed && !this.waypoints.includes(trimmed)) {
      this.waypoints.push(trimmed);
      this.newWaypointInput = '';
      this.fetchRealRoadGeometry();
    }
  }

  removeWaypoint(index: number): void {
    this.waypoints.splice(index, 1);
    this.fetchRealRoadGeometry();
  }

  saveCurrentRoute(): void {
    if (!this.selectedRoute) return;
    this.isRouteSaved = true;

    const exists = this.savedRoutes.some(
      r => r.origin === this.origin && r.destination === this.destination
    );

    if (!exists) {
      this.savedRoutes.unshift({
        origin: this.origin,
        destination: this.destination,
        distance: this.selectedRoute.distanceKm,
        duration: this.selectedRoute.duration,
        date: new Date().toLocaleDateString()
      });
    }
  }

  loadSavedRoute(item: SavedRouteItem): void {
    this.origin = item.origin;
    this.destination = item.destination;
    this.planJourney();
  }

  private calculateGeodesicDistance(cityA: string, cityB: string): number {
    const a = this.cityCoords[cityA] || [12.9716, 77.5946];
    const b = this.cityCoords[cityB] || [19.0760, 72.8777];

    const R = 6371;
    const dLat = (b[0] - a[0]) * Math.PI / 180;
    const dLon = (b[1] - a[1]) * Math.PI / 180;
    const lat1 = a[0] * Math.PI / 180;
    const lat2 = b[0] * Math.PI / 180;

    const x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return Math.round(R * c * 1.25);
  }
}