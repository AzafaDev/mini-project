import { prisma } from "../src/config/prisma";
import bcrypt from "bcrypt";
import { generateUniqueReferralCode } from "../src/utils/generateToken";

type TicketType = "GENERAL" | "VIP";

const getTicketType = (name: string): TicketType => {
  const lower = name.toLowerCase();
  if (lower.includes("vip") || lower.includes("architect") || lower.includes("vvip")) {
    return "VIP";
  }
  return "GENERAL";
};

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

const generateReferralCode = async (): Promise<string> => {
  return generateUniqueReferralCode();
};

const generateCouponCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const createUserCoupons = async (userId: string) => {
  const now = new Date();
  
  const coupons = [
    {
      code: `WELCOME-${generateCouponCode()}`,
      discountType: "PERCENTAGE" as const,
      discountValue: 15,
      startDate: now,
      endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      code: `SPECIAL-${generateCouponCode()}`,
      discountType: "FIXED" as const,
      discountValue: 50000,
      startDate: now,
      endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
    },
    {
      code: `VIP-${generateCouponCode()}`,
      discountType: "PERCENTAGE" as const,
      discountValue: 25,
      startDate: now,
      endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    },
  ];

  return Promise.all(
    coupons.map(coupon => 
      prisma.coupon.create({
        data: {
          ...coupon,
          userId,
          isActive: true,
        }
      })
    )
  );
};

const organizerUsers = [
  { email: "organizer1@eventry.com", fullName: "Aditya Pratama", phone: "081234567890" },
  { email: "organizer2@eventry.com", fullName: "Siti Maryam", phone: "081234567891" },
  { email: "organizer3@eventry.com", fullName: "Budi Santoso", phone: "081234567892" },
];

const customerUsers = [
  { email: "customer1@test.com", fullName: "Andi Supriyadi", phone: "082111111111", points: 2500 },
  { email: "customer2@test.com", fullName: "Dewi Lestari", phone: "082111111112", points: 1800 },
  { email: "customer3@test.com", fullName: "Agus Setiawan", phone: "082111111113", points: 3200 },
  { email: "customer4@test.com", fullName: "Sri Handayani", phone: "082111111114", points: 950 },
  { email: "customer5@test.com", fullName: "Hendra Kusuma", phone: "082111111115", points: 4100 },
];

// PAST EVENTS - events that already ended (before April 11, 2026)
const pastEvents = [
  {
    name: "Jakarta Music Festival 2025",
    description:
      "Annual music festival featuring local and international artists - PAST EVENT",
    category: "Music",
    location: "Jakarta",
    price: 500000,
    totalSeats: 5000,
    startDate: "2025-06-15",
    endDate: "2025-06-17",
    tickets: [
      { name: "VIP", price: 1500000, quantity: 500 },
      { name: "Regular", price: 500000, quantity: 3000 },
    ],
  },
  {
    name: "Tech Conference 2025",
    description:
      "Annual technology conference with industry leaders - PAST EVENT",
    category: "Conference",
    location: "Jakarta",
    price: 1000000,
    totalSeats: 1000,
    startDate: "2025-10-01",
    endDate: "2025-10-03",
    tickets: [
      { name: "VIP", price: 2000000, quantity: 100 },
      { name: "Regular", price: 1000000, quantity: 900 },
    ],
  },
  {
    name: "React Workshop March 2026",
    description: "Learn React fundamentals from scratch - ALREADY ENDED",
    category: "Workshop",
    location: "Jakarta",
    price: 0,
    totalSeats: 50,
    startDate: "2026-03-10",
    endDate: "2026-03-11",
    tickets: [{ name: "Free Pass", price: 0, quantity: 50 }],
  },
  {
    name: "Jazz Night February",
    description: "Romantic jazz evening with live performances - PAST",
    category: "Music",
    location: "Bali",
    price: 350000,
    totalSeats: 300,
    startDate: "2026-02-15",
    endDate: "2026-02-15",
    tickets: [
      { name: "Premium", price: 700000, quantity: 50 },
      { name: "Regular", price: 350000, quantity: 250 },
    ],
  },
  {
    name: "Startup Seminar January",
    description: "Learn from successful startup founders - ALREADY ENDED",
    category: "Seminar",
    location: "Bandung",
    price: 0,
    totalSeats: 300,
    startDate: "2026-01-25",
    endDate: "2026-01-25",
    tickets: [{ name: "Free Pass", price: 0, quantity: 300 }],
  },
];

// UPCOMING EVENTS - events in the future
const upcomingEvents = [
   {
     name: "Jakarta Music Festival 2026",
     description:
       "Annual music festival featuring local and international artists",
     category: "Music",
     location: "Jakarta",
     price: 500000,
     totalSeats: 5000,
     startDate: "2026-06-15",
     endDate: "2026-06-17",
     tickets: [
       { name: "VIP", price: 1500000, quantity: 500 },
       { name: "Regular", price: 500000, quantity: 4500 },
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
  {
    name: "React Workshop for Beginners",
    description: "Learn React fundamentals from scratch",
    category: "Workshop",
    location: "Jakarta",
    price: 0,
    totalSeats: 50,
    startDate: "2026-05-10",
    endDate: "2026-05-11",
    tickets: [{ name: "Free Pass", price: 0, quantity: 50 }],
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
    tickets: [{ name: "Regular", price: 150000, quantity: 100 }],
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
       { name: "Half Marathon", price: 300000, quantity: 8000 },
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
  {
    name: "Tech Startup Seminar",
    description: "Learn from successful startup founders",
    category: "Seminar",
    location: "Jakarta",
    price: 0,
    totalSeats: 300,
    startDate: "2026-05-25",
    endDate: "2026-05-25",
    tickets: [{ name: "Free Pass", price: 0, quantity: 300 }],
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
    tickets: [{ name: "Regular", price: 100000, quantity: 150 }],
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
    tickets: [{ name: "Regular", price: 75000, quantity: 250 }],
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
    tickets: [{ name: "Regular", price: 50000, quantity: 1000 }],
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

  const hashedPassword = await hashPassword("12345678");

  const organizers = await Promise.all(
    organizerUsers.map(async (org, idx) => {
      const referralCode = await generateReferralCode();
      return prisma.user.upsert({
        where: { email: org.email },
        update: {},
        create: {
          email: org.email,
          password: hashedPassword,
          fullName: org.fullName,
          phoneNumber: org.phone,
          profilePicture: `https://picsum.photos/seed/organizer${idx}/200/200`,
          role: "ORGANIZER",
          isVerified: true,
          referralCode,
        },
      });
    }),
  );
  console.log(`✅ Created ${organizers.length} organizer users`);

  // Buat customer users terlebih dahulu
  const customers: any[] = [];
  for (let idx = 0; idx < customerUsers.length; idx++) {
    const cust = customerUsers[idx];
    const referralCode = await generateReferralCode();
    const referredBy = idx > 0 ? customers[idx - 1]?.referralCode : null;
    
    const user = await prisma.user.upsert({
      where: { email: cust.email },
      update: {},
      create: {
        email: cust.email,
        password: hashedPassword,
        fullName: cust.fullName,
        phoneNumber: cust.phone,
        profilePicture: `https://picsum.photos/seed/customer${idx}/200/200`,
        points: cust.points,
        role: "CUSTOMER",
        isVerified: true,
        referralCode,
        referredBy,
      },
    });
    
    customers.push(user);
    
    // Buat kupon untuk setiap customer
    await createUserCoupons(user.id);
    
    // Buat riwayat poin untuk user yang memiliki poin awal
    if (cust.points > 0) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 3);
      
      await prisma.pointTransaction.create({
        data: {
          userId: user.id,
          amount: cust.points,
          reason: "Initial points on registration",
          expiresAt,
        },
      });
    }
  }
  console.log(`✅ Created ${customers.length} customer users`);

  // Clear existing events to avoid duplicates
  console.log("🗑️ Clearing existing events...");
  await prisma.ticket.deleteMany({ where: {} });
  await prisma.transaction.deleteMany({ where: {} });
  await prisma.review.deleteMany({ where: {} });
  await prisma.event.deleteMany({ where: {} });

  // Create past events first
  console.log("\n📅 Creating PAST events...");
  const createdPastEvents = [];
  for (let i = 0; i < pastEvents.length; i++) {
    const eventData = pastEvents[i];
    const organizerIndex = i % organizers.length;
    const organizer = organizers[organizerIndex];
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);
    const calculatedTotal = eventData.tickets.reduce((sum, t) => sum + t.quantity, 0);

    const event = await prisma.event.create({
      data: {
        name: eventData.name,
        description: eventData.description,
        category: eventData.category,
        location: eventData.location,
        price: eventData.price,
        totalSeats: calculatedTotal,
        availableSeats: calculatedTotal,
        startDate,
        endDate,
        imageUrl: `https://picsum.photos/seed/${eventData.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}/800/400`,
        organizerId: organizer.id,
      },
    });
    createdPastEvents.push(event);
    console.log(
      `✅ [PAST] Created: ${event.name} (${eventData.startDate} - ${eventData.endDate})`,
    );

    for (const ticketData of eventData.tickets) {
      const ticketType = getTicketType(ticketData.name);
      const ticket = await prisma.ticket.create({
        data: {
          eventId: event.id,
          type: ticketType,
          price: ticketData.price,
          quantity: ticketData.quantity,
          available: ticketData.quantity,
        },
      });
      console.log(`✅ Created ticket: ${ticket.type} - IDR ${ticket.price.toLocaleString("id-ID")}`);
    }
  }

  // Create upcoming events
  console.log("\n📅 Creating UPCOMING events...");
  for (let i = 0; i < upcomingEvents.length; i++) {
    const eventData = upcomingEvents[i];
    const organizerIndex = i % organizers.length;
    const organizer = organizers[organizerIndex];
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);
    const calculatedTotal = eventData.tickets.reduce((sum, t) => sum + t.quantity, 0);

    const event = await prisma.event.create({
      data: {
        name: eventData.name,
        description: eventData.description,
        category: eventData.category,
        location: eventData.location,
        price: eventData.price,
        totalSeats: calculatedTotal,
        availableSeats: calculatedTotal,
        startDate,
        endDate,
        imageUrl: `https://picsum.photos/seed/${eventData.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}/800/400`,
        organizerId: organizer.id,
      },
    });
    console.log(
      `✅ [UPCOMING] Created: ${event.name} (${eventData.startDate})`,
    );

   // Create tickets and vouchers for this event
   for (const ticketData of eventData.tickets) {
     const ticketType = getTicketType(ticketData.name);
     const ticket = await prisma.ticket.create({
       data: {
         eventId: event.id,
         type: ticketType,
         price: ticketData.price,
         quantity: ticketData.quantity,
         available: ticketData.quantity,
       },
     });
     console.log(`✅ Created ticket: ${ticket.type} - IDR ${ticket.price.toLocaleString("id-ID")}`);
   }

   // Create vouchers for this event
   const now = new Date();
   const eventVouchers = [
     {
       code: `EARLY-${generateCouponCode()}`,
       discountType: "PERCENTAGE" as const,
       discountValue: 20,
       startDate: now,
       endDate: new Date(event.startDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before event
       maxUsage: 50,
     },
     {
       code: `VIP-${generateCouponCode()}`,
       discountType: "FIXED" as const,
       discountValue: 100000,
       startDate: now,
       endDate: new Date(event.startDate.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day before event
       maxUsage: 20,
     },
     {
       code: `GROUP-${generateCouponCode()}`,
       discountType: "PERCENTAGE" as const,
       discountValue: 15,
       startDate: now,
       endDate: new Date(event.startDate.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days before event
       maxUsage: 30,
     },
   ];

   await Promise.all(
     eventVouchers.map(voucher =>
       prisma.voucher.create({
         data: {
           ...voucher,
           eventId: event.id,
           isActive: true,
         },
       })
     )
   );
   console.log(`✅ Created ${eventVouchers.length} vouchers for ${event.name}`);
 }

  // Create sample transactions for past events (customers who attended)
  console.log("\n🎫 Creating sample transactions (DONE status)...");
  const customer1 = customers[0];
  const customer2 = customers[1];

  for (const event of createdPastEvents) {
    // Customer 1 transaction
    const ticket = await prisma.ticket.findFirst({
      where: { eventId: event.id },
    });
    if (ticket) {
      const tx1 = await prisma.transaction.create({
        data: {
          userId: customer1.id,
          eventId: event.id,
          ticketId: ticket.id,
          quantity: 2,
          totalPrice: ticket.price * 2,
          discount: 0,
          pointsUsed: 0,
          finalPrice: ticket.price * 2,
          status: "DONE",
          paidAt: new Date(),
          expiresAt: new Date(),
        },
      });

      // Update available seats to reflect the transaction (sync with backend behavior)
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { available: { decrement: 2 } }
      });
      await prisma.event.update({
        where: { id: event.id },
        data: { availableSeats: { decrement: 2 } }
      });

      // Create review for this transaction
      await prisma.review.create({
        data: {
          userId: customer1.id,
          eventId: event.id,
          rating: Math.floor(Math.random() * 3) + 3, // Random rating 3-5
          comment: `Great event! Really enjoyed ${event.name}.`,
        },
      });

      console.log(
        `✅ Created DONE transaction for ${customer1.fullName} on ${event.name} with review`,
      );
    }
  }

  // Customer 2 transaction for first past event
  const firstPastEvent = createdPastEvents[0];
  const ticket2 = await prisma.ticket.findFirst({
    where: { eventId: firstPastEvent.id },
  });
  if (ticket2) {
    await prisma.transaction.create({
      data: {
        userId: customer2.id,
        eventId: firstPastEvent.id,
        ticketId: ticket2.id,
        quantity: 1,
        totalPrice: ticket2.price,
        discount: 0,
        pointsUsed: 0,
        finalPrice: ticket2.price,
        status: "DONE",
        paidAt: new Date(),
        expiresAt: new Date(),
      },
    });

    // Update available seats - CRITICAL FIX to sync with backend behavior
    await prisma.ticket.update({
      where: { id: ticket2.id },
      data: { available: { decrement: 1 } }
    });
    await prisma.event.update({
      where: { id: firstPastEvent.id },
      data: { availableSeats: { decrement: 1 } }
    });

    await prisma.review.create({
      data: {
        userId: customer2.id,
        eventId: firstPastEvent.id,
        rating: 5,
        comment: "Amazing experience! Will definitely attend again.",
      },
    });

    console.log(
      `✅ Created DONE transaction for ${customer2.fullName} on ${firstPastEvent.name} with review`,
    );
  }

  // Customer 3 transactions for some past events (ratings 2-4)
  const customer3 = customers[2];
  const customer3EventIndices = [1, 2, 3, 4]; // Tech Conference, React Workshop, Jazz Night, Startup Seminar
  const customer3Ratings = [4, 3, 2, 4];
  const customer3Comments = [
    "Good event but could be better organized.",
    "Learned a lot from this workshop!",
    "Nice music but the venue was too crowded.",
    "Very inspiring seminar, highly recommended!",
  ];

  for (let i = 0; i < customer3EventIndices.length; i++) {
    const eventIdx = customer3EventIndices[i];
    const pastEvent = createdPastEvents[eventIdx];
    const ticket3 = await prisma.ticket.findFirst({
      where: { eventId: pastEvent.id },
    });
    if (ticket3) {
      await prisma.transaction.create({
        data: {
          userId: customer3.id,
          eventId: pastEvent.id,
          ticketId: ticket3.id,
          quantity: 1,
          totalPrice: ticket3.price,
          discount: 0,
          pointsUsed: 0,
          finalPrice: ticket3.price,
          status: "DONE",
          paidAt: new Date(),
          expiresAt: new Date(),
        },
      });

      // Update available seats - CRITICAL FIX to sync with backend behavior
      await prisma.ticket.update({
        where: { id: ticket3.id },
        data: { available: { decrement: 1 } }
      });
      await prisma.event.update({
        where: { id: pastEvent.id },
        data: { availableSeats: { decrement: 1 } }
      });

      await prisma.review.create({
        data: {
          userId: customer3.id,
          eventId: pastEvent.id,
          rating: customer3Ratings[i],
          comment: customer3Comments[i],
        },
      });

      console.log(
        `✅ Created DONE transaction for ${customer3.fullName} on ${pastEvent.name} with review (rating: ${customer3Ratings[i]})`,
      );
    }
  }

  // Create additional varied transactions for testing (with discounts and points)
  console.log("\n🎫 Creating additional varied transactions (with discounts/points)...");
  
  // Transaction with voucher discount
  const voucherEvent = createdPastEvents[2]; // Jazz Night February
  const voucherTicket = await prisma.ticket.findFirst({
    where: { eventId: voucherEvent.id },
  });
  if (voucherTicket && customer1) {
    // Create a voucher first
    const testVoucher = await prisma.voucher.create({
      data: {
        code: "TEST-VOUCHER-01",
        discountType: "PERCENTAGE",
        discountValue: 20,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxUsage: 10,
        isActive: true,
        eventId: voucherEvent.id,
      },
    });

    const txWithVoucher = await prisma.transaction.create({
      data: {
        userId: customer1.id,
        eventId: voucherEvent.id,
        ticketId: voucherTicket.id,
        quantity: 2,
        totalPrice: voucherTicket.price * 2,
        discount: Math.floor((voucherTicket.price * 2 * 20) / 100), // 20% discount
        pointsUsed: 0,
        couponId: null,
        voucherId: testVoucher.id,
        finalPrice: Math.floor(voucherTicket.price * 2 * 0.8), // After 20% discount
        status: "DONE",
        paidAt: new Date(),
        expiresAt: new Date(),
      },
    });

    // Update available seats
    await prisma.ticket.update({
      where: { id: voucherTicket.id },
      data: { available: { decrement: 2 } }
    });
    await prisma.event.update({
      where: { id: voucherEvent.id },
      data: { availableSeats: { decrement: 2 } }
     });

     console.log(
       `✅ Created DONE transaction with voucher discount for ${customer1.fullName} on ${voucherEvent.name}`,
     );
   }

  // Transaction with points used
  const pointsEvent = createdPastEvents[1]; // Tech Conference 2025
  const pointsTicket = await prisma.ticket.findFirst({
    where: { eventId: pointsEvent.id },
  });
  if (pointsTicket && customer2) {
    const txWithPoints = await prisma.transaction.create({
      data: {
        userId: customer2.id,
        eventId: pointsEvent.id,
        ticketId: pointsTicket.id,
        quantity: 1,
        totalPrice: pointsTicket.price,
        discount: 0,
        pointsUsed: 500, // Use 500 points = Rp50,000 discount
        finalPrice: pointsTicket.price - 50000, // 500 × 100 = Rp50,000
        status: "DONE",
        paidAt: new Date(),
        expiresAt: new Date(),
      },
    });

    // Update available seats
    await prisma.ticket.update({
      where: { id: pointsTicket.id },
      data: { available: { decrement: 1 } }
    });
    await prisma.event.update({
      where: { id: pointsEvent.id },
      data: { availableSeats: { decrement: 1 } }
    });

    // Deduct points from user
    await prisma.user.update({
      where: { id: customer2.id },
      data: { points: { decrement: 500 } }
    });

    await prisma.review.create({
      data: {
        userId: customer2.id,
        eventId: pointsEvent.id,
        rating: 4,
        comment: "Used my points to save some money! Good event.",
      },
    });

    console.log(
      `✅ Created DONE transaction with points used for ${customer2.fullName} on ${pointsEvent.name}`,
    );
  }

  // Transaction with coupon
  const couponEvent = createdPastEvents[3]; // Startup Seminar January
  const couponTicket = await prisma.ticket.findFirst({
    where: { eventId: couponEvent.id },
  });
  if (couponTicket && customer3) {
    // Create a coupon first
    const testCoupon = await prisma.coupon.create({
      data: {
        code: "TEST-COUPON-01",
        discountType: "FIXED",
        discountValue: 50000,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        userId: customer3.id,
      },
    });

    const txWithCoupon = await prisma.transaction.create({
      data: {
        userId: customer3.id,
        eventId: couponEvent.id,
        ticketId: couponTicket.id,
        quantity: 1,
        totalPrice: couponTicket.price,
        discount: 50000, // Fixed discount
        pointsUsed: 0,
        couponId: testCoupon.id,
        voucherId: null,
        finalPrice: Math.max(0, couponTicket.price - 50000), // After coupon discount
        status: "DONE",
        paidAt: new Date(),
        expiresAt: new Date(),
      },
    });

    // Update available seats
    await prisma.ticket.update({
      where: { id: couponTicket.id },
      data: { available: { decrement: 1 } }
    });
    await prisma.event.update({
      where: { id: couponEvent.id },
      data: { availableSeats: { decrement: 1 } }
     });

     console.log(
       `✅ Created DONE transaction with coupon for ${customer3.fullName} on ${couponEvent.name}`,
     );
   }

  console.log("\n🎉 Seeding completed!");
  console.log(`\n📊 Summary:`);
  console.log(`   - ${organizers.length} Organizer users`);
  console.log(`   - ${customers.length} Customer users`);
  console.log(`   - ${customers.length * 3} Coupons created`);
  console.log(`   - ${pastEvents.length} PAST events (can write reviews)`);
  console.log(`   - ${upcomingEvents.length} UPCOMING events`);
  console.log(`   - Sample reviews created for past events`);
  console.log(`   - Vouchers created for upcoming events`);
  console.log(`   - Varied transactions (with discounts/points) for testing`);
  
  console.log(`\n📊 Organizer Login credentials:`);
  organizers.forEach((org, idx) => {
    console.log(`   ${idx + 1}. ${org.fullName} | ${org.email} | Password: 12345678`);
  });
  
  console.log(`\n📊 Customer Login credentials:`);
  customers.forEach((cust, idx) => {
    console.log(`   ${idx + 1}. ${cust.fullName} | ${cust.email} | Password: 12345678 | Poin: ${cust.points}`);
    if (cust.referredBy) {
      const referrer = customers.find(c => c.referralCode === cust.referredBy);
      if (referrer) {
        console.log(`      ↳ Direferensikan oleh: ${referrer.fullName}`);
      }
    }
  });
  
   console.log(`\n💡 To test reviews:`);
   console.log(`   1. Login sebagai Andi Supriyadi (customer1@test.com)`);
   console.log(`   2. Buka event lampau (misal: Jakarta Music Festival 2025)`);
   console.log(`   3. Lihat tombol "Write a Review" (sudah memiliki transaksi)`);
 }

 main()
   .catch((e) => {
     console.error(e);
     process.exit(1);
   })
   .finally(async () => {
     await prisma.$disconnect();
   });