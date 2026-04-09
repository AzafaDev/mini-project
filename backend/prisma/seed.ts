import { prisma } from "../src/config/prisma";

const categories = ["Music", "Workshop", "Sports", "Seminar", "Entertainment", "Conference"];

const locations = ["Jakarta", "Bandung", "Surabaya", "Bali", "Yogyakarta", "Medan"];

const events = [
  // Music (5 events)
  {
    name: "Jakarta Music Festival 2026",
    description: "Annual music festival featuring local and international artists",
    category: "Music",
    location: "Jakarta",
    price: 500000,
    totalSeats: 5000,
    startDate: "2026-06-15",
    endDate: "2026-06-17",
    tickets: [
      { name: "VIP", price: 1500000, quantity: 500 },
      { name: "Regular", price: 500000, quantity: 3000 },
      { name: "Early Bird", price: 350000, quantity: 1500 },
    ],
  },
  {
    name: "Indie Band Night",
    description: "Showcase of emerging indie bands from across Indonesia",
    category: "Music",
    location: "Bandung",
    price: 150000,
    totalSeats: 500,
    startDate: "2026-05-20",
    endDate: "2026-05-20",
    tickets: [
      { name: "VIP", price: 300000, quantity: 50 },
      { name: "Regular", price: 150000, quantity: 450 },
    ],
  },
  {
    name: "Jazz Under the Stars",
    description: "Romantic jazz evening with live performances",
    category: "Music",
    location: "Bali",
    price: 350000,
    totalSeats: 300,
    startDate: "2026-07-10",
    endDate: "2026-07-10",
    tickets: [
      { name: "Premium", price: 700000, quantity: 50 },
      { name: "Regular", price: 350000, quantity: 250 },
    ],
  },
  {
    name: "EDM Beach Party",
    description: "Electronic dance music party at the beach",
    category: "Music",
    location: "Bali",
    price: 400000,
    totalSeats: 3000,
    startDate: "2026-08-25",
    endDate: "2026-08-26",
    tickets: [
      { name: "VIP", price: 1000000, quantity: 300 },
      { name: "Regular", price: 400000, quantity: 2700 },
    ],
  },
  {
    name: "Dangdut Festival",
    description: "Traditional and modern dangdut music celebration",
    category: "Music",
    location: "Surabaya",
    price: 100000,
    totalSeats: 2000,
    startDate: "2026-09-05",
    endDate: "2026-09-05",
    tickets: [
      { name: "VVIP", price: 250000, quantity: 200 },
      { name: "Regular", price: 100000, quantity: 1800 },
    ],
  },
  // Workshop (5 events)
  {
    name: "React Workshop for Beginners",
    description: "Learn React fundamentals from scratch",
    category: "Workshop",
    location: "Jakarta",
    price: 0,
    totalSeats: 50,
    startDate: "2026-05-10",
    endDate: "2026-05-11",
    tickets: [
      { name: "Free Pass", price: 0, quantity: 50 },
    ],
  },
  {
    name: "UI/UX Design Masterclass",
    description: "Master UI/UX design principles with hands-on projects",
    category: "Workshop",
    location: "Bandung",
    price: 250000,
    totalSeats: 40,
    startDate: "2026-06-01",
    endDate: "2026-06-02",
    tickets: [
      { name: "Premium", price: 500000, quantity: 10 },
      { name: "Regular", price: 250000, quantity: 30 },
    ],
  },
  {
    name: "Python Data Science Bootcamp",
    description: "Intensive data science workshop with Python",
    category: "Workshop",
    location: "Yogyakarta",
    price: 300000,
    totalSeats: 60,
    startDate: "2026-07-15",
    endDate: "2026-07-17",
    tickets: [
      { name: "VIP", price: 600000, quantity: 10 },
      { name: "Regular", price: 300000, quantity: 50 },
    ],
  },
  {
    name: "Digital Marketing Workshop",
    description: "Learn SEO, social media marketing, and content strategy",
    category: "Workshop",
    location: "Surabaya",
    price: 150000,
    totalSeats: 100,
    startDate: "2026-08-10",
    endDate: "2026-08-10",
    tickets: [
      { name: "Regular", price: 150000, quantity: 100 },
    ],
  },
  {
    name: "Mobile App Development Workshop",
    description: "Build your first mobile app with Flutter",
    category: "Workshop",
    location: "Medan",
    price: 200000,
    totalSeats: 45,
    startDate: "2026-09-20",
    endDate: "2026-09-21",
    tickets: [
      { name: "Premium", price: 400000, quantity: 10 },
      { name: "Regular", price: 200000, quantity: 35 },
    ],
  },
  // Sports (5 events)
  {
    name: "Jakarta Marathon 2026",
    description: "Annual marathon through the streets of Jakarta",
    category: "Sports",
    location: "Jakarta",
    price: 250000,
    totalSeats: 10000,
    startDate: "2026-10-15",
    endDate: "2026-10-15",
    tickets: [
      { name: "Full Marathon", price: 500000, quantity: 2000 },
      { name: "Half Marathon", price: 300000, quantity: 3000 },
      { name: "Fun Run 5K", price: 150000, quantity: 5000 },
    ],
  },
  {
    name: "Badminton Tournament",
    description: "Open badminton tournament for all skill levels",
    category: "Sports",
    location: "Surabaya",
    price: 100000,
    totalSeats: 200,
    startDate: "2026-06-20",
    endDate: "2026-06-21",
    tickets: [
      { name: "Player", price: 200000, quantity: 100 },
      { name: "Spectator", price: 50000, quantity: 100 },
    ],
  },
  {
    name: "Bali Surf Competition",
    description: "Professional surfing competition at Kuta Beach",
    category: "Sports",
    location: "Bali",
    price: 150000,
    totalSeats: 1000,
    startDate: "2026-07-25",
    endDate: "2026-07-27",
    tickets: [
      { name: "VIP", price: 400000, quantity: 100 },
      { name: "Regular", price: 150000, quantity: 900 },
    ],
  },
  {
    name: "Yoga Retreat Weekend",
    description: "Relaxing yoga retreat in the mountains",
    category: "Sports",
    location: "Yogyakarta",
    price: 350000,
    totalSeats: 80,
    startDate: "2026-08-15",
    endDate: "2026-08-16",
    tickets: [
      { name: "Premium", price: 700000, quantity: 20 },
      { name: "Regular", price: 350000, quantity: 60 },
    ],
  },
  {
    name: "Futsal Championship",
    description: "Inter-city futsal championship",
    category: "Sports",
    location: "Medan",
    price: 200000,
    totalSeats: 500,
    startDate: "2026-09-10",
    endDate: "2026-09-12",
    tickets: [
      { name: "Team Registration", price: 1000000, quantity: 50 },
      { name: "Spectator", price: 50000, quantity: 450 },
    ],
  },
  // Seminar (5 events)
  {
    name: "Tech Startup Seminar",
    description: "Learn from successful startup founders",
    category: "Seminar",
    location: "Jakarta",
    price: 0,
    totalSeats: 300,
    startDate: "2026-05-25",
    endDate: "2026-05-25",
    tickets: [
      { name: "Free Pass", price: 0, quantity: 300 },
    ],
  },
  {
    name: "Financial Planning Seminar",
    description: "Smart financial planning for millennials",
    category: "Seminar",
    location: "Bandung",
    price: 100000,
    totalSeats: 150,
    startDate: "2026-06-10",
    endDate: "2026-06-10",
    tickets: [
      { name: "Regular", price: 100000, quantity: 150 },
    ],
  },
  {
    name: "AI in Business Seminar",
    description: "How AI is transforming the business landscape",
    category: "Seminar",
    location: "Surabaya",
    price: 200000,
    totalSeats: 200,
    startDate: "2026-07-20",
    endDate: "2026-07-20",
    tickets: [
      { name: "VIP", price: 500000, quantity: 30 },
      { name: "Regular", price: 200000, quantity: 170 },
    ],
  },
  {
    name: "Education Innovation Seminar",
    description: "Future of education in the digital age",
    category: "Seminar",
    location: "Yogyakarta",
    price: 75000,
    totalSeats: 250,
    startDate: "2026-08-05",
    endDate: "2026-08-05",
    tickets: [
      { name: "Regular", price: 75000, quantity: 250 },
    ],
  },
  {
    name: "Health & Wellness Seminar",
    description: "Holistic approach to health and wellness",
    category: "Seminar",
    location: "Medan",
    price: 150000,
    totalSeats: 180,
    startDate: "2026-09-15",
    endDate: "2026-09-15",
    tickets: [
      { name: "Premium", price: 300000, quantity: 30 },
      { name: "Regular", price: 150000, quantity: 150 },
    ],
  },
  // Entertainment (5 events)
  {
    name: "Comedy Night Special",
    description: "Stand-up comedy show with top comedians",
    category: "Entertainment",
    location: "Jakarta",
    price: 150000,
    totalSeats: 400,
    startDate: "2026-05-30",
    endDate: "2026-05-30",
    tickets: [
      { name: "Front Row", price: 300000, quantity: 50 },
      { name: "Regular", price: 150000, quantity: 350 },
    ],
  },
  {
    name: "Art Exhibition: Modern Indonesia",
    description: "Contemporary art exhibition featuring Indonesian artists",
    category: "Entertainment",
    location: "Bali",
    price: 50000,
    totalSeats: 1000,
    startDate: "2026-06-15",
    endDate: "2026-06-30",
    tickets: [
      { name: "Regular", price: 50000, quantity: 1000 },
    ],
  },
  {
    name: "Theater: Romeo & Juliet",
    description: "Classic Shakespeare play with Indonesian twist",
    category: "Entertainment",
    location: "Bandung",
    price: 200000,
    totalSeats: 300,
    startDate: "2026-07-05",
    endDate: "2026-07-07",
    tickets: [
      { name: "VIP", price: 400000, quantity: 50 },
      { name: "Regular", price: 200000, quantity: 250 },
    ],
  },
  {
    name: "Film Festival Indonesia",
    description: "Showcasing the best of Indonesian cinema",
    category: "Entertainment",
    location: "Yogyakarta",
    price: 75000,
    totalSeats: 500,
    startDate: "2026-08-20",
    endDate: "2026-08-25",
    tickets: [
      { name: "Day Pass", price: 75000, quantity: 300 },
      { name: "Full Festival Pass", price: 350000, quantity: 200 },
    ],
  },
  {
    name: "Magic Show Extravaganza",
    description: "Mind-blowing magic show with international magicians",
    category: "Entertainment",
    location: "Surabaya",
    price: 250000,
    totalSeats: 600,
    startDate: "2026-09-25",
    endDate: "2026-09-25",
    tickets: [
      { name: "VIP", price: 500000, quantity: 100 },
      { name: "Regular", price: 250000, quantity: 500 },
    ],
  },
  // Conference (5 events)
  {
    name: "Tech Conference 2026",
    description: "Annual technology conference with industry leaders",
    category: "Conference",
    location: "Jakarta",
    price: 1000000,
    totalSeats: 1000,
    startDate: "2026-10-01",
    endDate: "2026-10-03",
    tickets: [
      { name: "VIP", price: 2000000, quantity: 100 },
      { name: "Regular", price: 1000000, quantity: 900 },
    ],
  },
  {
    name: "Business Innovation Forum",
    description: "Forum for business leaders and innovators",
    category: "Conference",
    location: "Bandung",
    price: 500000,
    totalSeats: 400,
    startDate: "2026-07-10",
    endDate: "2026-07-11",
    tickets: [
      { name: "Executive", price: 1000000, quantity: 50 },
      { name: "Regular", price: 500000, quantity: 350 },
    ],
  },
  {
    name: "Digital Transformation Summit",
    description: "Summit on digital transformation strategies",
    category: "Conference",
    location: "Surabaya",
    price: 750000,
    totalSeats: 500,
    startDate: "2026-08-15",
    endDate: "2026-08-16",
    tickets: [
      { name: "Premium", price: 1500000, quantity: 50 },
      { name: "Regular", price: 750000, quantity: 450 },
    ],
  },
  {
    name: "Startup Founders Summit",
    description: "Networking and learning for startup founders",
    category: "Conference",
    location: "Bali",
    price: 600000,
    totalSeats: 300,
    startDate: "2026-09-05",
    endDate: "2026-09-06",
    tickets: [
      { name: "Founder Pass", price: 1200000, quantity: 50 },
      { name: "Regular", price: 600000, quantity: 250 },
    ],
  },
  {
    name: "E-Commerce Conference",
    description: "Conference on e-commerce trends and strategies",
    category: "Conference",
    location: "Medan",
    price: 400000,
    totalSeats: 350,
    startDate: "2026-10-20",
    endDate: "2026-10-21",
    tickets: [
      { name: "VIP", price: 800000, quantity: 50 },
      { name: "Regular", price: 400000, quantity: 300 },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Find or create an organizer user
  let organizer = await prisma.user.findFirst({
    where: { role: "ORGANIZER" },
  });

  if (!organizer) {
    organizer = await prisma.user.create({
      data: {
        email: "organizer@eventry.com",
        password: "$2b$10$rH9v3q8Z5qK5qK5qK5qK5.qK5qK5qK5qK5qK5qK5qK5qK5qK5qK5q",
        fullName: "Event Organizer",
        role: "ORGANIZER",
        isVerified: true,
      },
    });
    console.log("✅ Created organizer user:", organizer.email);
  }

  // Create events
  for (const eventData of events) {
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);

    const event = await prisma.event.create({
      data: {
        name: eventData.name,
        description: eventData.description,
        category: eventData.category,
        location: eventData.location,
        price: eventData.price,
        totalSeats: eventData.totalSeats,
        availableSeats: eventData.totalSeats,
        startDate,
        endDate,
        imageUrl: `https://picsum.photos/seed/${eventData.name.replace(/\s/g, "")}/800/400`,
        organizerId: organizer.id,
      },
    });

    console.log(`✅ Created event: ${event.name}`);

    // Create tickets for the event
    for (const ticketData of eventData.tickets) {
      await prisma.ticket.create({
        data: {
          eventId: event.id,
          name: ticketData.name,
          price: ticketData.price,
          quantity: ticketData.quantity,
          available: ticketData.quantity,
        },
      });
    }
  }

  console.log("\n🎉 Seeding completed!");
  console.log(`📊 Total events created: ${events.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });