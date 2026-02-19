import { db } from './db';
import { 
  offices, users, services, leads, tasks, templates, 
  hrEmployees, events, eventAttendees, travelPackages, 
  travelBookings, venueComparisons, assets, jobOpenings, 
  jobPortals, hrTemplates, channels 
} from '@shared/schema';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../attached_assets/seed-important_1769273087838.json'), 'utf-8')
);

async function clearTables() {
  console.log('Clearing existing data...');
  await db.execute(sql`DELETE FROM event_attendees`);
  await db.execute(sql`DELETE FROM travel_bookings`);
  await db.execute(sql`DELETE FROM venue_comparisons`);
  await db.execute(sql`DELETE FROM tasks`);
  await db.execute(sql`DELETE FROM leads`);
  await db.execute(sql`DELETE FROM hr_employees`);
  await db.execute(sql`DELETE FROM events`);
  await db.execute(sql`DELETE FROM travel_packages`);
  await db.execute(sql`DELETE FROM assets`);
  await db.execute(sql`DELETE FROM job_openings`);
  await db.execute(sql`DELETE FROM job_portals`);
  await db.execute(sql`DELETE FROM hr_templates`);
  await db.execute(sql`DELETE FROM channels`);
  await db.execute(sql`DELETE FROM templates`);
  await db.execute(sql`DELETE FROM services`);
  await db.execute(sql`DELETE FROM users`);
  await db.execute(sql`DELETE FROM offices`);
  console.log('Tables cleared');
}

async function seedOffices() {
  console.log('Seeding offices...');
  for (const office of seedData.offices) {
    await db.insert(offices).values({
      id: office.id,
      name: office.name,
      address: office.address,
      city: office.city,
      createdAt: new Date(office.created_at),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedData.offices.length} offices`);
}

async function seedUsers() {
  console.log('Seeding users...');
  for (const user of seedData.users) {
    await db.insert(users).values({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      officeId: user.office_id,
      salary: user.salary,
      createdAt: new Date(user.created_at),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedData.users.length} users`);
}

async function seedServices() {
  console.log('Seeding services...');
  for (const service of seedData.services) {
    await db.insert(services).values({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      category: service.category,
      isActive: service.is_active,
      createdAt: new Date(service.created_at),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedData.services.length} services`);
}

async function seedLeads() {
  console.log('Seeding leads...');
  for (const lead of seedData.leads) {
    await db.insert(leads).values({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      service: lead.service || 'General',
      value: lead.value || 0,
      stage: lead.stage || 'new',
      source: lead.source,
      address: lead.address,
      avatar: lead.avatar,
      rating: lead.rating,
      tags: lead.tags,
      temperature: lead.temperature,
      nextFollowUp: lead.next_follow_up ? new Date(lead.next_follow_up) : null,
      wonAmount: lead.won_amount,
      wonDate: lead.won_date ? new Date(lead.won_date) : null,
      lostReason: lead.lost_reason,
      lastConnected: lead.last_connected,
      assignedTo: lead.assigned_to,
      createdAt: new Date(lead.created_at),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedData.leads.length} leads`);
}

async function seedTasks() {
  console.log('Seeding tasks...');
  for (const task of seedData.tasks) {
    await db.insert(tasks).values({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date ? new Date(task.due_date) : null,
      assignedTo: task.assigned_to,
      createdBy: task.created_by,
      leadId: task.lead_id,
      createdAt: new Date(task.created_at),
      updatedAt: task.updated_at ? new Date(task.updated_at) : null,
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedData.tasks.length} tasks`);
}

async function seedTemplates() {
  console.log('Seeding templates...');
  for (const template of seedData.templates) {
    await db.insert(templates).values({
      id: template.id,
      title: template.title || template.name || 'Untitled',
      type: template.type,
      subject: template.subject,
      content: template.content,
      category: template.category,
      createdAt: new Date(template.created_at),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedData.templates.length} templates`);
}

async function seedHrEmployees() {
  console.log('Seeding HR employees...');
  for (const emp of seedData.hr_employees) {
    await db.insert(hrEmployees).values({
      id: emp.id,
      name: emp.name,
      fatherName: emp.father_name,
      relation: emp.relation,
      dateOfBirth: emp.date_of_birth ? new Date(emp.date_of_birth) : null,
      phone: emp.phone,
      email: emp.email,
      aadharAddress: emp.aadhar_address,
      role: emp.role,
      employmentType: emp.employment_type,
      officeUnit: emp.office_unit,
      department: emp.department,
      dateOfJoining: emp.date_of_joining ? new Date(emp.date_of_joining) : null,
      salary: emp.salary,
      pfEnabled: emp.pf_enabled,
      esicEnabled: emp.esic_enabled,
      panCard: emp.pan_card,
      bankName: emp.bank_name,
      accountNumber: emp.account_number,
      ifscCode: emp.ifsc_code,
      bankVerificationStatus: emp.bank_verification_status,
      profilePicture: emp.profile_picture,
      status: emp.status,
      linkedUserId: emp.linked_user_id,
      isSalesTeam: emp.is_sales_team,
      createdAt: emp.created_at ? new Date(emp.created_at) : new Date(),
      updatedAt: emp.updated_at ? new Date(emp.updated_at) : new Date(),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedData.hr_employees.length} HR employees`);
}

async function seedEvents() {
  console.log('Seeding events...');
  for (const event of seedData.events) {
    await db.insert(events).values({
      id: event.id,
      name: event.name,
      type: event.type || 'ibs',
      city: event.city || 'TBD',
      venue: event.venue,
      venueAddress: event.venue_address,
      date: event.date ? new Date(event.date) : new Date(),
      endDate: event.end_date ? new Date(event.end_date) : null,
      capacity: event.capacity || 0,
      description: event.description,
      status: event.status || 'planning',
      ticketPrice: event.ticket_price,
      hiTeaTime: event.hi_tea_time,
      lunchTime: event.lunch_time,
      slotDuration: event.slot_duration,
      createdAt: new Date(event.created_at),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedData.events.length} events`);
}

async function seedEventAttendees() {
  console.log('Seeding event attendees...');
  let count = 0;
  for (const attendee of seedData.event_attendees) {
    try {
      await db.insert(eventAttendees).values({
        id: attendee.id,
        eventId: attendee.event_id,
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
        designation: attendee.designation,
        company: attendee.company,
        tshirtSize: attendee.tshirt_size,
        dietaryPreference: attendee.dietary_preference,
        passportNumber: attendee.passport_number,
        passportExpiry: attendee.passport_expiry ? new Date(attendee.passport_expiry) : null,
        flightBooked: attendee.flight_booked,
        hotelBooked: attendee.hotel_booked,
        transferBooked: attendee.transfer_booked,
        paymentStatus: attendee.payment_status,
        roomType: attendee.room_type,
        notes: attendee.notes,
        createdAt: new Date(attendee.created_at),
      }).onConflictDoNothing();
      count++;
    } catch (e) {
      console.error(`Failed to insert attendee ${attendee.id}:`, e);
    }
  }
  console.log(`Seeded ${count} event attendees`);
}

async function seedTravelPackages() {
  console.log('Seeding travel packages...');
  for (const pkg of seedData.travel_packages) {
    await db.insert(travelPackages).values({
      id: pkg.id,
      title: pkg.title || 'Travel Package',
      slug: pkg.slug || pkg.id,
      destination: pkg.destination || 'TBD',
      duration: pkg.duration || '1 Day',
      days: pkg.days || 1,
      nights: pkg.nights || 0,
      price: pkg.price || 0,
      originalPrice: pkg.original_price,
      image: pkg.image || '/assets/images/travel/default.png',
      gallery: pkg.gallery,
      category: pkg.category || 'general',
      shortDescription: pkg.short_description || '',
      description: pkg.description || '',
      highlights: pkg.highlights,
      inclusions: pkg.inclusions,
      exclusions: pkg.exclusions,
      itinerary: pkg.itinerary,
      accommodation: pkg.accommodation,
      meals: pkg.meals,
      transportation: pkg.transportation,
      groupSize: pkg.group_size,
      ageRange: pkg.age_range,
      startDate: pkg.start_date ? new Date(pkg.start_date) : null,
      endDate: pkg.end_date ? new Date(pkg.end_date) : null,
      isFeatured: pkg.is_featured ?? false,
      isActive: pkg.is_active ?? true,
      displayOrder: pkg.display_order,
      createdAt: new Date(pkg.created_at),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedData.travel_packages.length} travel packages`);
}

async function seedTravelBookings() {
  console.log('Seeding travel bookings...');
  for (const booking of seedData.travel_bookings) {
    await db.insert(travelBookings).values({
      id: booking.id,
      packageId: booking.package_id,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      customerPhone: booking.customer_phone,
      numberOfTravelers: booking.number_of_travelers || 1,
      amount: booking.amount || 0,
      currency: booking.currency || 'INR',
      razorpayOrderId: booking.razorpay_order_id,
      razorpayPaymentId: booking.razorpay_payment_id,
      razorpaySignature: booking.razorpay_signature,
      status: booking.status || 'pending',
      notes: booking.notes,
      travelDate: booking.travel_date ? new Date(booking.travel_date) : null,
      createdAt: new Date(booking.created_at),
      updatedAt: booking.updated_at ? new Date(booking.updated_at) : new Date(),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedData.travel_bookings.length} travel bookings`);
}

async function seedVenueComparisons() {
  console.log('Seeding venue comparisons...');
  for (const venue of seedData.venue_comparisons) {
    await db.insert(venueComparisons).values({
      id: venue.id,
      city: venue.city || 'TBD',
      category: venue.category || 'General',
      name: venue.name || 'Unknown Venue',
      airportDistance: venue.airport_distance,
      location: venue.location,
      hallImageUrl: venue.hall_image_url,
      outerImageUrl: venue.outer_image_url,
      contactPhone: venue.contact_phone,
      email: venue.email,
      pocContactPerson: venue.poc_contact_person,
      firstContactMade: venue.first_contact_made ?? false,
      quotation: venue.quotation,
      stage: venue.stage || 'pending',
      notes: venue.notes,
      eventId: venue.event_id,
      paymentStatus: venue.payment_status,
      paymentAmount: venue.payment_amount,
      bookingDates: venue.booking_dates,
      createdAt: new Date(venue.created_at),
      updatedAt: venue.updated_at ? new Date(venue.updated_at) : new Date(),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedData.venue_comparisons.length} venue comparisons`);
}

async function seedAssets() {
  console.log('Seeding assets...');
  for (const asset of seedData.assets) {
    await db.insert(assets).values({
      id: asset.id,
      name: asset.name,
      category: asset.category || 'General',
      serialNumber: asset.serial_number,
      brand: asset.brand,
      model: asset.model,
      purchaseDate: asset.purchase_date ? new Date(asset.purchase_date) : null,
      purchasePrice: asset.purchase_price,
      warrantyExpiry: asset.warranty_expiry ? new Date(asset.warranty_expiry) : null,
      status: asset.status || 'available',
      currentAssigneeId: asset.current_assignee_id,
      location: asset.location,
      notes: asset.notes,
      createdAt: new Date(asset.created_at),
      updatedAt: asset.updated_at ? new Date(asset.updated_at) : new Date(),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedData.assets.length} assets`);
}

async function seedJobOpenings() {
  console.log('Seeding job openings...');
  for (const job of seedData.job_openings) {
    await db.insert(jobOpenings).values({
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      employmentType: job.employment_type,
      experienceLevel: job.experience_level,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      status: job.status,
      postedDate: job.posted_date ? new Date(job.posted_date) : null,
      closingDate: job.closing_date ? new Date(job.closing_date) : null,
      createdAt: new Date(job.created_at),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedData.job_openings.length} job openings`);
}

async function seedJobPortals() {
  console.log('Seeding job portals...');
  for (const portal of seedData.job_portals) {
    await db.insert(jobPortals).values({
      id: portal.id,
      name: portal.name,
      url: portal.url || 'https://example.com',
      logo: portal.logo,
      userId: portal.user_id,
      password: portal.password,
      notes: portal.notes,
      isActive: portal.is_active ?? true,
      lastAccessed: portal.last_accessed ? new Date(portal.last_accessed) : null,
      createdAt: new Date(portal.created_at),
      updatedAt: portal.updated_at ? new Date(portal.updated_at) : new Date(),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedData.job_portals.length} job portals`);
}

async function seedHrTemplates() {
  console.log('Seeding HR templates...');
  for (const template of seedData.hr_templates) {
    await db.insert(hrTemplates).values({
      id: template.id,
      name: template.name,
      category: template.category || 'general',
      type: template.type,
      subject: template.subject,
      content: template.content,
      placeholders: template.placeholders,
      isActive: template.is_active ?? true,
      usageCount: template.usage_count,
      createdBy: template.created_by,
      createdAt: new Date(template.created_at),
      updatedAt: template.updated_at ? new Date(template.updated_at) : new Date(),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedData.hr_templates.length} HR templates`);
}

async function seedChannels() {
  console.log('Seeding channels...');
  for (const channel of seedData.channels) {
    await db.insert(channels).values({
      id: channel.id,
      name: channel.name,
      description: channel.description,
      teamId: channel.team_id,
      createdBy: channel.created_by,
      createdAt: new Date(channel.created_at),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${seedData.channels.length} channels`);
}

async function main() {
  console.log('Starting seed process...');
  
  try {
    await clearTables();
    
    await seedOffices();
    await seedUsers();
    await seedServices();
    await seedLeads();
    await seedTasks();
    await seedTemplates();
    await seedHrEmployees();
    await seedEvents();
    await seedEventAttendees();
    await seedTravelPackages();
    await seedTravelBookings();
    await seedVenueComparisons();
    await seedAssets();
    await seedJobOpenings();
    await seedJobPortals();
    await seedHrTemplates();
    await seedChannels();
    
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  }
  
  process.exit(0);
}

main();
