const express = require('express');
const router = express.Router();

const SAMPLE_BUSES = [
  {
    _id: 'rb_vrl_9600',
    busName: 'VRL Travels',
    busType: 'Volvo 9600 Multi-Axle A/C Sleeper (2+1)',
    price: 2100,
    departureTime: '18:00',
    arrivalTime: '11:00',
    duration: '17h 00m',
    rating: 4.8,
    reviewsCount: 1420,
    seatsAvailable: 11,
    tag: 'Business Class'
  },
  {
    _id: 'rb_tranzindia',
    busName: 'Tranzindia Travels',
    busType: 'VE A/C Sleeper (2+1)',
    price: 1999,
    departureTime: '23:00',
    arrivalTime: '15:15',
    duration: '16h 15m',
    rating: 4.4,
    reviewsCount: 380,
    seatsAvailable: 24,
    tag: 'Primo'
  },
  {
    _id: 'rb_abt_express',
    busName: 'ABT Express',
    busType: 'A/C Sleeper (2+1)',
    price: 1749,
    departureTime: '22:30',
    arrivalTime: '11:00',
    duration: '12h 30m',
    rating: 4.5,
    reviewsCount: 229,
    seatsAvailable: 23,
    tag: 'FlexiTicket'
  },
  {
    _id: 'rb_orange_tours',
    busName: 'Orange Tours and Travels',
    busType: 'Volvo Multi-Axle B11R Sleeper',
    price: 2226,
    departureTime: '19:45',
    arrivalTime: '08:30',
    duration: '12h 45m',
    rating: 4.9,
    reviewsCount: 940,
    seatsAvailable: 8,
    tag: 'Live Tracking'
  }
];

router.get('/api/buses', (req, res) => {
  res.json({ buses: SAMPLE_BUSES });
});

router.get('/api/operators', (req, res) => {
  res.json([
    { name: 'VRL Travels', rating: 4.8, count: 240 },
    { name: 'Orange Tours and Travels', rating: 4.9, count: 180 },
    { name: 'SRS Travels', rating: 4.2, count: 150 },
    { name: 'KSRTC Airavat', rating: 4.7, count: 310 }
  ]);
});

module.exports = router;
