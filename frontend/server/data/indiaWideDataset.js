// Comprehensive India-Wide Operators and Routes Dataset
// Demonstrates realistic intercity bus network across India

const OPERATORS = [
  // Private Operators (24)
  { name: 'VRL Travels', type: 'private', state: 'Karnataka', rating: 4.8, totalRatings: 5400, fleetCount: 4200, isPrimo: true, badge: 'India’s Largest Fleet' },
  { name: 'SRS Travels', type: 'private', state: 'Karnataka', rating: 4.5, totalRatings: 3200, fleetCount: 2800, isPrimo: false, badge: 'Executive Class' },
  { name: 'Orange Tours and Travels', type: 'private', state: 'Telangana', rating: 4.7, totalRatings: 4100, fleetCount: 1600, isPrimo: true, badge: 'Primo Verified' },
  { name: 'KPN Travels', type: 'private', state: 'Tamil Nadu', rating: 4.4, totalRatings: 2900, fleetCount: 1100, isPrimo: false, badge: 'South Corridor Pioneer' },
  { name: 'IntrCity SmartBus', type: 'private', state: 'Pan India', rating: 4.9, totalRatings: 6800, fleetCount: 950, isPrimo: true, badge: 'Lounge & Washroom Coach' },
  { name: 'National Travels', type: 'private', state: 'Karnataka', rating: 4.6, totalRatings: 2100, fleetCount: 650, isPrimo: true, badge: 'Volvo Sleeper Specialist' },
  { name: 'Sharma Transports', type: 'private', state: 'Karnataka', rating: 4.5, totalRatings: 1800, fleetCount: 400, isPrimo: false, badge: 'Long Distance Express' },
  { name: 'Sugama Tourist', type: 'private', state: 'Karnataka', rating: 4.4, totalRatings: 1950, fleetCount: 520, isPrimo: false, badge: 'Coastal Karnataka Express' },
  { name: 'Sea Bird Tourist', type: 'private', state: 'Karnataka', rating: 4.3, totalRatings: 1400, fleetCount: 380, isPrimo: false, badge: 'Coastal & Goa Express' },
  { name: 'Anand Travels', type: 'private', state: 'Karnataka', rating: 4.3, totalRatings: 1100, fleetCount: 300, isPrimo: false, badge: 'Interstate Service' },
  { name: 'Jabbar Travels', type: 'private', state: 'Telangana', rating: 4.5, totalRatings: 2200, fleetCount: 450, isPrimo: false, badge: 'Hyderabad-Bengaluru Express' },
  { name: 'Dhanunjaya Travels', type: 'private', state: 'Andhra Pradesh', rating: 4.4, totalRatings: 1350, fleetCount: 290, isPrimo: false, badge: 'Rayalaseema Express' },
  { name: 'Morning Star Travels', type: 'private', state: 'Andhra Pradesh', rating: 4.6, totalRatings: 2800, fleetCount: 620, isPrimo: true, badge: 'Primo Verified' },
  { name: 'Rajesh Transports', type: 'private', state: 'Karnataka', rating: 4.3, totalRatings: 900, fleetCount: 220, isPrimo: false, badge: 'Regional Deluxe' },
  { name: 'Paulo Travels', type: 'private', state: 'Goa', rating: 4.5, totalRatings: 3100, fleetCount: 780, isPrimo: true, badge: 'Goa Holiday Line' },
  { name: 'Neeta Travels', type: 'private', state: 'Maharashtra', rating: 4.4, totalRatings: 4900, fleetCount: 1400, isPrimo: false, badge: 'Expressway Pioneer' },
  { name: 'Purple Metrolink', type: 'private', state: 'Maharashtra', rating: 4.6, totalRatings: 2500, fleetCount: 820, isPrimo: true, badge: 'Intercity Luxury' },
  { name: 'Prasanna Purple', type: 'private', state: 'Maharashtra', rating: 4.7, totalRatings: 3400, fleetCount: 910, isPrimo: true, badge: 'Purple Mobility' },
  { name: 'Hans Travels', type: 'private', state: 'Madhya Pradesh', rating: 4.5, totalRatings: 2600, fleetCount: 840, isPrimo: false, badge: 'Central India Express' },
  { name: 'Chartered Bus', type: 'private', state: 'Madhya Pradesh', rating: 4.6, totalRatings: 2900, fleetCount: 680, isPrimo: true, badge: 'AICTSL Partner' },
  { name: 'Zingbus', type: 'private', state: 'Pan India', rating: 4.8, totalRatings: 7200, fleetCount: 1200, isPrimo: true, badge: 'Smart Electric & AC Coach' },
  { name: 'NueGo', type: 'private', state: 'Pan India', rating: 4.8, totalRatings: 5600, fleetCount: 850, isPrimo: true, badge: '100% Green Electric Fleet' },
  { name: 'VRL Logistics Passenger Services', type: 'private', state: 'Karnataka', rating: 4.7, totalRatings: 3800, fleetCount: 1500, isPrimo: true, badge: 'Corporate Multi-Axle' },
  { name: 'GreenLine Travels', type: 'private', state: 'Karnataka', rating: 4.3, totalRatings: 1100, fleetCount: 340, isPrimo: false, badge: 'Value Sleeper' },

  // Government State Transport Corporations (11)
  { name: 'KSRTC Karnataka', type: 'government', state: 'Karnataka', rating: 4.9, totalRatings: 9400, fleetCount: 8200, isPrimo: true, badge: 'Airavat Club Class 2.0 • Government of Karnataka' },
  { name: 'APSRTC', type: 'government', state: 'Andhra Pradesh', rating: 4.7, totalRatings: 8100, fleetCount: 11400, isPrimo: true, badge: 'Amaravati / Garuda • Andhra Pradesh RTC' },
  { name: 'TGSRTC', type: 'government', state: 'Telangana', rating: 4.7, totalRatings: 7600, fleetCount: 9300, isPrimo: true, badge: 'Garuda Plus / Lahari • Telangana RTC' },
  { name: 'TNSTC', type: 'government', state: 'Tamil Nadu', rating: 4.5, totalRatings: 6700, fleetCount: 19800, isPrimo: false, badge: 'Tamil Nadu State Transport' },
  { name: 'SETC', type: 'government', state: 'Tamil Nadu', rating: 4.6, totalRatings: 5400, fleetCount: 1400, isPrimo: true, badge: 'Ultra Deluxe & AC Sleeper • State Express' },
  { name: 'MSRTC', type: 'government', state: 'Maharashtra', rating: 4.8, totalRatings: 8800, fleetCount: 15200, isPrimo: true, badge: 'Shivneri AC / Shivshahi • Maharashtra RTC' },
  { name: 'GSRTC', type: 'government', state: 'Gujarat', rating: 4.6, totalRatings: 6100, fleetCount: 8700, isPrimo: false, badge: 'Gurjarnagri & Volvo • Gujarat RTC' },
  { name: 'RSRTC', type: 'government', state: 'Rajasthan', rating: 4.5, totalRatings: 5200, fleetCount: 4500, isPrimo: false, badge: 'Goldline & Super Deluxe • Rajasthan RTC' },
  { name: 'UPSRTC', type: 'government', state: 'Uttar Pradesh', rating: 4.5, totalRatings: 6900, fleetCount: 11800, isPrimo: false, badge: 'Janrath AC & Shatabdi • UP RTC' },
  { name: 'PEPSU', type: 'government', state: 'Punjab', rating: 4.4, totalRatings: 3100, fleetCount: 1100, isPrimo: false, badge: 'Kilometre Scheme AC • PEPSU RTC' },
  { name: 'HRTC', type: 'government', state: 'Himachal Pradesh', rating: 4.8, totalRatings: 4900, fleetCount: 3100, isPrimo: true, badge: 'Himgaura Volvo • Himachal Roadways' }
];

// Major Indian cities and their authentic boarding/dropping points
const CITY_STOPS = {
  'Bengaluru': [
    'Majestic Kempegowda Bus Stand',
    'Anand Rao Circle VRL Plaza',
    'Madiwala St. Johns Hospital',
    'Silk Board Junction',
    'Electronic City Toll Gate',
    'Marathahalli Bridge',
    'Hebbal Esteem Mall',
    'Yeshwanthpur Govardhan Theater'
  ],
  'Mysuru': ['Suburban Bus Stand Mysuru', 'Columbia Asia Hospital Circle', 'KSRTC Central Bus Station', 'Infosys Gate Hebbal'],
  'Mangaluru': ['PVS Circle Mangaluru', 'Pumpwell Circle', 'KSRTC Bus Stand Bejai', 'Hampankatta'],
  'Hubballi': ['Old Bus Stand Hubballi', 'Neeligin Road VRL Hub', 'Gokul Road Bus Terminal', 'Chennamma Circle'],
  'Belagavi': ['CBT Central Bus Stand Belagavi', 'Chennamma Circle', 'Fort Lake Road', 'Rani Channamma University Circle'],
  'Kalaburagi': ['Central Bus Stand Kalaburagi', 'MSK Mill Road', 'Sardar Patel Chowk', 'Sedam Road'],
  'Mumbai': ['Borivali East National Park', 'Andheri East Bisleri Compound', 'Dadar TT Circle Asiad Stand', 'Sion Circle', 'Chembur Kake Da Hotel', 'Vashi Toll Plaza'],
  'Pune': ['Swargate Bus Stand', 'Pune Railway Station', 'Wakad Ginger Hotel', 'Hinjewadi Bridge', 'Viman Nagar Chandan Nagar'],
  'Nagpur': ['Ganeshpeth Bus Stand', 'Dharampeth Extension', 'Chatrapati Square', 'Rani Jhansi Square Sitabuldi'],
  'Nashik': ['Dwarka Circle Nashik', 'Mumbai Naka', 'Thakkar Bazaar', 'Panchavati'],
  'Delhi': ['Kashmere Gate ISBT Gate 1', 'Anand Vihar ISBT Metro', 'Dhaula Kuan Metro Station', 'Majnu Ka Tilla HP Petrol Pump', 'RK Ashram Metro Marg'],
  'Jaipur': ['Sindhi Camp Central Bus Stand', 'Narayan Singh Circle', '200 Feet Bypass Ajmer Road', 'Transport Nagar'],
  'Ahmedabad': ['Paldi Crossroads', 'Geeta Mandir Central Bus Station', 'C.G. Road', 'Iskon Cross Road SG Highway'],
  'Surat': ['Kamrej Char Rasta', 'Surat Central Bus Station', 'Varachha Main Road', 'Ring Road Sahara Darwaja'],
  'Vadodara': ['Amit Nagar Circle', 'Central Bus Terminal Station', 'Pandya Bridge', 'Golden Chokdi'],
  'Goa': ['Panaji Kadamba Bus Terminal', 'Madgaon KTC Bus Stand', 'Mapusa Kadamba Stand', 'Calangute Tourist Circle'],
  'Hyderabad': ['Lakdikapul Downtown Mall', 'Ameerpet Metro Pillar 1081', 'Miyapur Allwyn X Road', 'Gachibowli Outer Ring Road', 'LB Nagar Ring Road', 'Kukatpally Housing Board'],
  'Vijayawada': ['Pandit Nehru Bus Station (PNBS)', 'Benz Circle Highway Gate', 'Ramavarappadu Ring', 'Varadhi Junction'],
  'Visakhapatnam': ['Dwaraka Bus Station (RTC Complex)', 'Maddilapalem Junction', 'Gajuwaka Main Road', 'NAD Kotha Road'],
  'Chennai': ['Koyambedu CMBT Terminal', 'Guindy Metro Station', 'Tambaram Railway Station', 'Ashok Pillar', 'Central Railway Station'],
  'Coimbatore': ['Gandhipuram Central Bus Stand', 'Omni Bus Stand', 'Ukkadam Bus Stand', 'Singanallur Junction'],
  'Madurai': ['Mattuthavani Integrated Bus Terminus', 'Periyar Bus Stand', 'Arapalayam'],
  'Kochi': ['Vytilla Mobility Hub', 'Edappally Toll Junction', 'Aluva Bypass Metro Station', 'Ernakulam KSRTC Stand'],
  'Thiruvananthapuram': ['Thampanoor Central Bus Station', 'Kazhakkoottam Technopark', 'Attingal Municipal Bus Stand'],
  'Kolkata': ['Esplanade Bus Terminus', 'Ultadanga Hudco More', 'Kolkata Airport Gate 1', 'Babughat Eden Gardens'],
  'Bhubaneswar': ['Baramunda ISBT', 'Master Canteen Square', 'Jayadev Vihar Overbridge', 'Vani Vihar'],
  'Lucknow': ['Alambagh ISBT Terminal', 'Charbagh Railway Station Gate', 'Nahariya Chauraha Awadh Bus Stand', 'Polytechnic Chauraha'],
  'Kanpur': ['Jhakarkati Inter State Bus Stand', 'Fazalganj Crossing', 'Rama Devi Chowk'],
  'Varanasi': ['Cantt Railway Station Bus Depot', 'Chaudhary Charan Singh ISBT', 'Lanka BHU Gate'],
  'Indore': ['Sarwate Bus Stand', 'Navlakha Bus Terminal', 'Vijay Nagar Square', 'Radisson Square Bypass'],
  'Bhopal': ['ISBT Habibganj', 'Kushabhau Thakre ISBT', 'Nadra Bus Stand', 'Lalghati Square'],
  'Chandigarh': ['ISBT Sector 43', 'ISBT Sector 17', 'Tribune Chowk', 'Mohali Phase 7'],
  'Amritsar': ['Amritsar ISBT Central Bus Terminal', 'Golden Temple Approach Road', 'Hall Gate'],
  'Dehradun': ['ISBT Dehradun Haridwar Bypass', 'Clock Tower Prince Chowk', 'Jakhan Rajpur Road'],
  'Guwahati': ['ISBT Betkuchi', 'Paltan Bazaar Railway Station', 'Khanapara GS Road'],
  'Patna': ['Bairiya Patliputra ISBT', 'Gandhi Maidan Bus Depot', 'Mithapur Bus Stand'],
  'Ranchi': ['Birsa Munda Bus Terminal Khadgarha', 'Kanta Toli Chowk', 'Ranchi Railway Station Road'],
  'Raipur': ['Sri Balaji Swami ISBT Bhatagaon', 'Pandri Bus Stand', 'Telibandha Chowk'],
  'Jammu': ['General Bus Stand Jammu', 'TRC Tourist Reception Centre', 'Trikuta Nagar Overbridge']
};

// Amenities Pool
const ALL_AMENITIES = [
  { icon: '🛏️', name: 'Blanket & Pillow' },
  { icon: '🔌', name: 'USB Charging Point' },
  { icon: '💡', name: 'Personal Reading Light' },
  { icon: '📍', name: 'Live GPS Tracking' },
  { icon: '📶', name: 'Free Wi-Fi' },
  { icon: '🧴', name: 'Sanitized Bed Rolls' },
  { icon: '🚰', name: 'Mineral Water Bottle' },
  { icon: '🎥', name: 'CCTV Surveillance' },
  { icon: '❄️', name: 'Climate Control A/C' },
  { icon: '🚨', name: 'Emergency Exit Button' },
  { icon: '📺', name: 'Individual Entertainment Screen' },
  { icon: '🚻', name: 'Onboard Washroom' }
];

// Helper to pick sub-array of amenities
function pickAmenities(hasWashroom = false, isElectric = false) {
  const base = [ALL_AMENITIES[0], ALL_AMENITIES[1], ALL_AMENITIES[2], ALL_AMENITIES[3], ALL_AMENITIES[5], ALL_AMENITIES[7]];
  if (hasWashroom) base.push(ALL_AMENITIES[11]);
  if (isElectric) base.push({ icon: '⚡', name: 'Zero Emission Electric' });
  return base;
}

// Corridor Definitions: 40 major intercity pairs across India
const CORRIDOR_SPECS = [
  // 1. South Corridors
  { from: 'Bengaluru', to: 'Hubballi', dist: 412, dur: '6h 30m' },
  { from: 'Bengaluru', to: 'Belagavi', dist: 508, dur: '8h 00m' },
  { from: 'Bengaluru', to: 'Mysuru', dist: 145, dur: '2h 45m' },
  { from: 'Bengaluru', to: 'Mangaluru', dist: 350, dur: '7h 15m' },
  { from: 'Bengaluru', to: 'Hyderabad', dist: 570, dur: '8h 30m' },
  { from: 'Bengaluru', to: 'Chennai', dist: 345, dur: '5h 45m' },
  { from: 'Bengaluru', to: 'Goa', dist: 560, dur: '10h 30m' },
  { from: 'Bengaluru', to: 'Mumbai', dist: 985, dur: '16h 00m' },
  { from: 'Bengaluru', to: 'Coimbatore', dist: 365, dur: '6h 30m' },
  { from: 'Bengaluru', to: 'Kochi', dist: 540, dur: '9h 30m' },
  { from: 'Bengaluru', to: 'Kalaburagi', dist: 620, dur: '10h 00m' },

  // 2. West & Central Corridors
  { from: 'Mumbai', to: 'Pune', dist: 152, dur: '3h 30m' },
  { from: 'Mumbai', to: 'Goa', dist: 590, dur: '11h 00m' },
  { from: 'Mumbai', to: 'Ahmedabad', dist: 525, dur: '8h 45m' },
  { from: 'Mumbai', to: 'Surat', dist: 280, dur: '5h 15m' },
  { from: 'Mumbai', to: 'Nashik', dist: 168, dur: '4h 00m' },
  { from: 'Mumbai', to: 'Indore', dist: 585, dur: '11h 30m' },
  { from: 'Pune', to: 'Nagpur', dist: 710, dur: '12h 00m' },
  { from: 'Pune', to: 'Goa', dist: 450, dur: '8h 30m' },
  { from: 'Pune', to: 'Hyderabad', dist: 560, dur: '9h 30m' },
  { from: 'Pune', to: 'Bengaluru', dist: 840, dur: '13h 30m' },
  { from: 'Ahmedabad', to: 'Surat', dist: 265, dur: '4h 30m' },
  { from: 'Ahmedabad', to: 'Vadodara', dist: 112, dur: '2h 00m' },

  // 3. North Corridors
  { from: 'Delhi', to: 'Jaipur', dist: 280, dur: '5h 00m' },
  { from: 'Delhi', to: 'Chandigarh', dist: 245, dur: '4h 30m' },
  { from: 'Delhi', to: 'Dehradun', dist: 255, dur: '5h 15m' },
  { from: 'Delhi', to: 'Lucknow', dist: 535, dur: '7h 30m' },
  { from: 'Delhi', to: 'Amritsar', dist: 450, dur: '8h 00m' },
  { from: 'Delhi', to: 'Manali', dist: 540, dur: '12h 00m' },
  { from: 'Chandigarh', to: 'Amritsar', dist: 230, dur: '4h 15m' },
  { from: 'Chandigarh', to: 'Jammu', dist: 345, dur: '6h 30m' },
  { from: 'Jaipur', to: 'Indore', dist: 610, dur: '10h 30m' },

  // 4. East & South-East Corridors
  { from: 'Hyderabad', to: 'Vijayawada', dist: 275, dur: '4h 45m' },
  { from: 'Hyderabad', to: 'Visakhapatnam', dist: 620, dur: '11h 00m' },
  { from: 'Chennai', to: 'Coimbatore', dist: 505, dur: '8h 30m' },
  { from: 'Chennai', to: 'Madurai', dist: 460, dur: '7h 45m' },
  { from: 'Kolkata', to: 'Bhubaneswar', dist: 440, dur: '7h 30m' },
  { from: 'Kolkata', to: 'Siliguri', dist: 575, dur: '11h 30m' },
  { from: 'Lucknow', to: 'Varanasi', dist: 315, dur: '5h 30m' },
  { from: 'Indore', to: 'Bhopal', dist: 195, dur: '3h 30m' },
  { from: 'Patna', to: 'Ranchi', dist: 330, dur: '6h 30m' },
  { from: 'Raipur', to: 'Nagpur', dist: 285, dur: '5h 15m' },
  { from: 'Guwahati', to: 'Shillong', dist: 100, dur: '3h 00m' }
];

// Generates 160-200 realistic bus services spanning both private and government operators
function generateIndiaWideBusFleet() {
  const buses = [];
  let idCounter = 100;

  CORRIDOR_SPECS.forEach((corridor) => {
    const { from, to, dist, dur } = corridor;
    const fromStops = CITY_STOPS[from] || [`${from} Central Stand`, `${from} Highway Bypass`];
    const toStops = CITY_STOPS[to] || [`${to} Main Bus Terminal`, `${to} Ring Road Stop`];

    // Determine relevant operators based on geography
    const eligibleOps = [];

    // State transport corporations based on state origins/destinations
    if (from === 'Bengaluru' || to === 'Bengaluru' || from === 'Mysuru' || from === 'Hubballi' || from === 'Mangaluru' || from === 'Belagavi') {
      eligibleOps.push(OPERATORS.find(o => o.name === 'KSRTC Karnataka'));
    }
    if (from === 'Mumbai' || to === 'Mumbai' || from === 'Pune' || to === 'Pune' || from === 'Nagpur' || to === 'Nagpur') {
      eligibleOps.push(OPERATORS.find(o => o.name === 'MSRTC'));
      eligibleOps.push(OPERATORS.find(o => o.name === 'Neeta Travels'));
      eligibleOps.push(OPERATORS.find(o => o.name === 'Prasanna Purple'));
    }
    if (from === 'Hyderabad' || to === 'Hyderabad') {
      eligibleOps.push(OPERATORS.find(o => o.name === 'TGSRTC'));
      eligibleOps.push(OPERATORS.find(o => o.name === 'Orange Tours and Travels'));
      eligibleOps.push(OPERATORS.find(o => o.name === 'Jabbar Travels'));
    }
    if (from === 'Vijayawada' || to === 'Vijayawada' || from === 'Visakhapatnam' || to === 'Visakhapatnam') {
      eligibleOps.push(OPERATORS.find(o => o.name === 'APSRTC'));
      eligibleOps.push(OPERATORS.find(o => o.name === 'Morning Star Travels'));
    }
    if (from === 'Chennai' || to === 'Chennai' || from === 'Coimbatore' || to === 'Coimbatore' || from === 'Madurai' || to === 'Madurai') {
      eligibleOps.push(OPERATORS.find(o => o.name === 'SETC'));
      eligibleOps.push(OPERATORS.find(o => o.name === 'KPN Travels'));
    }
    if (from === 'Delhi' || to === 'Delhi' || from === 'Jaipur' || to === 'Jaipur' || from === 'Chandigarh' || to === 'Chandigarh') {
      eligibleOps.push(OPERATORS.find(o => o.name === 'Zingbus'));
      eligibleOps.push(OPERATORS.find(o => o.name === 'IntrCity SmartBus'));
      eligibleOps.push(OPERATORS.find(o => o.name === 'NueGo'));
      if (to === 'Manali') eligibleOps.push(OPERATORS.find(o => o.name === 'HRTC'));
      if (to === 'Jaipur') eligibleOps.push(OPERATORS.find(o => o.name === 'RSRTC'));
      if (to === 'Lucknow') eligibleOps.push(OPERATORS.find(o => o.name === 'UPSRTC'));
    }
    if (from === 'Ahmedabad' || to === 'Ahmedabad' || from === 'Surat' || to === 'Surat') {
      eligibleOps.push(OPERATORS.find(o => o.name === 'GSRTC'));
    }
    if (from === 'Indore' || to === 'Indore' || from === 'Bhopal' || to === 'Bhopal') {
      eligibleOps.push(OPERATORS.find(o => o.name === 'Hans Travels'));
      eligibleOps.push(OPERATORS.find(o => o.name === 'Chartered Bus'));
    }
    if (from === 'Goa' || to === 'Goa') {
      eligibleOps.push(OPERATORS.find(o => o.name === 'Paulo Travels'));
      eligibleOps.push(OPERATORS.find(o => o.name === 'Sea Bird Tourist'));
    }

    // Always include national / multi-state flagships
    eligibleOps.push(OPERATORS.find(o => o.name === 'VRL Travels'));
    eligibleOps.push(OPERATORS.find(o => o.name === 'SRS Travels'));

    // Filter duplicates and undefined
    const uniqueOps = Array.from(new Set(eligibleOps.filter(Boolean)));

    // Generate 3 to 5 distinct services per corridor
    const serviceConfigs = [
      {
        dep: '21:00', arr: '06:00',
        bustype: 'Volvo 9600 Multi-Axle A/C Sleeper (2+1)',
        layout: 'volvo-42', format: 'sleeper', cat: 'ac', isVolvo: true, isPrimo: true,
        basePriceFactor: 2.1, washroom: true, badge: 'Luxury Volvo 9600'
      },
      {
        dep: '22:15', arr: '07:15',
        bustype: 'Scania Multi-Axle AC Sleeper (2+1)',
        layout: 'sleeper-36', format: 'sleeper', cat: 'ac', isVolvo: true, isPrimo: true,
        basePriceFactor: 1.9, washroom: false, badge: 'Primo Express'
      },
      {
        dep: '19:30', arr: '05:30',
        bustype: 'BharatBenz AC Sleeper (2+1)',
        layout: 'sleeper-36', format: 'sleeper', cat: 'ac', isVolvo: false, isPrimo: false,
        basePriceFactor: 1.6, washroom: false, badge: 'Value Sleeper'
      },
      {
        dep: '06:30', arr: '12:30',
        bustype: 'High-Tech AC Semi-Sleeper / Seater (2+2)',
        layout: 'semi-51', format: 'semi-sleeper', cat: 'ac', isVolvo: false, isPrimo: false,
        basePriceFactor: 1.1, washroom: false, badge: 'Day Express'
      },
      {
        dep: '08:00', arr: '14:30',
        bustype: 'NueGo Green Electric AC Seater (2+2)',
        layout: 'seater-40', format: 'seater', cat: 'ac', isVolvo: false, isPrimo: true,
        basePriceFactor: 1.25, washroom: false, electric: true, badge: '100% Electric EcoBus'
      }
    ];

    // Create 3 to 5 buses for this corridor
    const count = Math.min(uniqueOps.length, 4);
    for (let i = 0; i < count; i++) {
      idCounter++;
      const op = uniqueOps[i];
      const cfg = serviceConfigs[i % serviceConfigs.length];

      // Calculate realistic price in INR
      const pricePerKm = dist < 200 ? 2.5 : (dist < 500 ? 1.85 : 1.6);
      const computedFare = Math.round((dist * pricePerKm * cfg.basePriceFactor) / 10) * 10;
      const finalPrice = Math.max(350, Math.min(3200, computedFare));

      // Build boarding & dropping stops with realistic timings
      const boardingStops = fromStops.slice(0, 5).map((name, idx) => ({
        name,
        time: formatStopMinutes(cfg.dep, idx * 25),
        landmark: `Main Landmark Near ${name}`,
        date: 'Today'
      }));

      const droppingStops = toStops.slice(0, 5).map((name, idx) => ({
        name,
        time: formatStopMinutes(cfg.arr, idx * 25),
        landmark: `Highway Exit Point ${idx + 1}`,
        date: 'Tomorrow'
      }));

      buses.push({
        _id: `rb_bus_${idCounter}_${op.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        operatorname: op.name,
        busname: `${op.name} ${cfg.bustype.split(' ')[0]}`,
        bustype: cfg.bustype,
        operatorType: op.type,
        departure: from,
        arrival: to,
        busdeparturetime: cfg.dep,
        busarrivaltime: cfg.arr,
        duration: dur,
        seatprice: finalPrice,
        rating: +(op.rating - (i % 2 === 0 ? 0 : 0.1)).toFixed(1),
        totalratings: op.totalRatings + (i * 120),
        totalSeatsCapacity: cfg.layout === 'volvo-42' ? 42 : (cfg.layout === 'semi-51' ? 51 : 36),
        seatsRemaining: Math.floor(12 + Math.random() * 20),
        singleSeats: Math.floor(4 + Math.random() * 6),
        isVolvo: cfg.isVolvo,
        isPrimo: op.isPrimo || cfg.isPrimo,
        isFreeCancel: true,
        category: cfg.cat,
        busFormat: cfg.format,
        layoutType: cfg.layout,
        superBusBadge: op.type === 'government' ? op.badge : cfg.badge,
        livetracking: 1,
        reschedulable: 1,
        boarding_points: fromStops,
        dropping_points: toStops,
        boardingStops,
        droppingStops,
        amenities: pickAmenities(cfg.washroom, cfg.electric)
      });
    }
  });

  return buses;
}

// Helper to add minutes to HH:mm string
function formatStopMinutes(hhmm, addMinutes) {
  const parts = hhmm.split(':');
  let h = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10) + addMinutes;
  while (m >= 60) {
    m -= 60;
    h = (h + 1) % 24;
  }
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const padM = String(m).padStart(2, '0');
  return `${displayH}:${padM} ${period}`;
}

const ALL_BUSES_DATASET = generateIndiaWideBusFleet();

module.exports = {
  OPERATORS,
  CITY_STOPS,
  CORRIDOR_SPECS,
  ALL_BUSES_DATASET
};
