// venues.js — Static data for BookVenue page
// initialVenues: default venues shown before any localStorage data
// packages: event packages with prices
// timeSlots: available booking time slots

export const initialVenues = [
  {
    id: 1,
    name: "Grand Wedding Palace",
    location: "Kathmandu",
    type: "Wedding Hall",
    price: 150000,
    description: "Luxurious wedding hall with capacity for 500 guests.",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "ABC Party Palace",
    location: "Pokhara",
    type: "Party Hall",
    price: 80000,
    description: "Modern party hall perfect for birthdays and celebrations.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Everest Seminar Hall",
    location: "Lalitpur",
    type: "Seminar Hall",
    price: 50000,
    description: "Professional seminar hall with AV equipment for 150 guests.",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Himalayan Banquet Hall",
    location: "Bhaktapur",
    type: "Banquet Hall",
    price: 120000,
    description: "Elegant banquet hall with mountain views for 300 guests.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
  },
];

export const packages = [
  { id: "basic",    name: "Basic Package",    price: 20000 },
  { id: "standard", name: "Standard Package", price: 50000 },
  { id: "premium",  name: "Premium Package",  price: 100000 },
  { id: "luxury",   name: "Luxury Package",   price: 200000 },
];

export const timeSlots = [
  { id: "morning",   label: "Morning   (6:00 AM – 12:00 PM)" },
  { id: "afternoon", label: "Afternoon (12:00 PM – 5:00 PM)" },
  { id: "evening",   label: "Evening   (5:00 PM – 9:00 PM)"  },
  { id: "fullday",   label: "Full Day  (6:00 AM – 9:00 PM)"  },
];
