import type { Product, Subcategory, Category, Supplier, ExternalUser, Lead, PipelineStage, PipelineLead, Subscription, ShopifyStore, CompetitorStore, FulfillmentOrder, SupportTicket, CourseChapter, CourseModule, Course, RevenueMetric, PlanTier, PipelineFunnelStage, LLCStatusEntry, StalledClient, ActivityFeedItem, ClientStatus, LLCStatus, Client, Batch, LLCStage, LLCApplication, MentorshipSession, OnboardingVideo, OnboardingModule, FeatureAccessKey, FeatureAccess, UserActivityLog, AdminNote, PaymentLinkHistory, UserCourseProgress, DetailedUser } from "@/types/sales";
export type { Product, Subcategory, Category, Supplier, ExternalUser, Lead, PipelineStage, PipelineLead, Subscription, ShopifyStore, CompetitorStore, FulfillmentOrder, SupportTicket, CourseChapter, CourseModule, Course, RevenueMetric, PlanTier, PipelineFunnelStage, LLCStatusEntry, StalledClient, ActivityFeedItem, ClientStatus, LLCStatus, Client, Batch, LLCStage, LLCApplication, MentorshipSession, OnboardingVideo, OnboardingModule, FeatureAccessKey, FeatureAccess, UserActivityLog, AdminNote, PaymentLinkHistory, UserCourseProgress, DetailedUser };


export const products: Product[] = [
  { id: "PRD-001", name: "Wireless Bluetooth Earbuds Pro", category: "Electronics", supplier: "ShenZhen Audio Co.", price: 29.99, comparePrice: 79.99, costPrice: 11.40, margin: 62, status: "active", image: "/3d-icons/headphones.webp", additionalImages: [], orders: 1842, revenue: 55231, rating: 4.6, source: "aliexpress", isTrending: true, isWinning: true, isLocked: false, description: "Premium wireless earbuds with noise cancellation and 24hr battery life.", sku: "WBE-PRO-001", weight: "45g", tags: ["wireless", "audio", "bestseller"] },
  { id: "PRD-002", name: "Smart Watch Fitness Tracker", category: "Electronics", supplier: "Dongguan Tech Ltd.", price: 34.99, comparePrice: 89.99, costPrice: 13.65, margin: 61, status: "active", image: "/3d-icons/watch.webp", additionalImages: [], orders: 1356, revenue: 47446, rating: 4.4, source: "cjdropshipping", isTrending: true, isWinning: false, isLocked: false, description: "Multi-sport fitness tracker with heart rate monitor and sleep tracking.", sku: "SWT-FIT-002", weight: "38g", tags: ["wearable", "fitness", "health"] },
  { id: "PRD-003", name: "LED Ring Light 10-inch", category: "Photography", supplier: "Yiwu Lighting Co.", price: 18.99, comparePrice: 49.99, costPrice: 7.22, margin: 62, status: "active", image: "/3d-icons/light.webp", additionalImages: [], orders: 2103, revenue: 39937, rating: 4.7, source: "aliexpress", isTrending: false, isWinning: true, isLocked: false, description: "Professional 10-inch ring light with adjustable brightness and tripod.", sku: "LRL-10I-003", weight: "320g", tags: ["photography", "lighting", "content"] },
  { id: "PRD-004", name: "Vitamin C Brightening Serum", category: "Beauty", supplier: "Guangzhou Beauty Lab", price: 12.49, comparePrice: 39.99, costPrice: 3.87, margin: 69, status: "active", image: "/3d-icons/bottle.webp", additionalImages: [], orders: 3210, revenue: 40093, rating: 4.8, source: "spocket", isTrending: true, isWinning: true, isLocked: false, description: "Concentrated vitamin C serum for brighter, more radiant skin.", sku: "VCB-SER-004", weight: "30ml", tags: ["skincare", "beauty", "bestseller"] },
  { id: "PRD-005", name: "Portable Mini Projector HD", category: "Electronics", supplier: "ShenZhen Display Tech", price: 89.99, comparePrice: 199.99, costPrice: 40.50, margin: 55, status: "active", image: "/3d-icons/projector.webp", additionalImages: [], orders: 567, revenue: 50997, rating: 4.3, source: "cjdropshipping", isTrending: false, isWinning: false, isLocked: false, description: "Compact HD projector with WiFi connectivity and built-in speaker.", sku: "PMP-HD-005", weight: "580g", tags: ["projector", "entertainment", "tech"] },
  { id: "PRD-006", name: "Sunset Lamp Projector", category: "Home & Living", supplier: "Yiwu Lighting Co.", price: 14.99, comparePrice: 34.99, costPrice: 6.45, margin: 57, status: "active", image: "/3d-icons/lamp.webp", additionalImages: [], orders: 4521, revenue: 67783, rating: 4.5, source: "aliexpress", isTrending: true, isWinning: true, isLocked: false, description: "Aesthetic sunset lamp projector for ambient room lighting.", sku: "SLP-AMB-006", weight: "210g", tags: ["home", "aesthetic", "tiktok"] },
  { id: "PRD-007", name: "Silicone Phone Case Matte", category: "Accessories", supplier: "Dongguan Cases Ltd.", price: 4.99, comparePrice: 19.99, costPrice: 1.25, margin: 75, status: "active", image: "/3d-icons/phone.webp", additionalImages: [], orders: 8902, revenue: 44422, rating: 4.2, source: "aliexpress", isTrending: false, isWinning: true, isLocked: false, description: "Premium matte silicone phone case with microfiber lining.", sku: "SPC-MAT-007", weight: "25g", tags: ["phone", "case", "accessories"] },
  { id: "PRD-008", name: "Insulated Water Bottle 750ml", category: "Sports", supplier: "Ningbo Hydra Co.", price: 15.99, comparePrice: 39.99, costPrice: 6.40, margin: 60, status: "active", image: "/3d-icons/bottle.webp", additionalImages: [], orders: 2847, revenue: 45511, rating: 4.6, source: "spocket", isTrending: false, isWinning: false, isLocked: false, description: "Double-wall vacuum insulated water bottle keeps drinks cold 24hrs.", sku: "IWB-750-008", weight: "350g", tags: ["hydration", "sports", "eco"] },
  { id: "PRD-009", name: "Posture Corrector Back Brace", category: "Health", supplier: "Guangzhou Wellness", price: 11.99, comparePrice: 29.99, costPrice: 4.80, margin: 60, status: "active", image: "/3d-icons/health.webp", additionalImages: [], orders: 1923, revenue: 23054, rating: 4.1, source: "cjdropshipping", isTrending: false, isWinning: false, isLocked: true, description: "Adjustable posture corrector for upper back pain relief.", sku: "PCB-BRC-009", weight: "120g", tags: ["health", "posture", "wellness"] },
  { id: "PRD-010", name: "Car Phone Mount Magnetic", category: "Accessories", supplier: "ShenZhen Auto Parts", price: 9.99, comparePrice: 24.99, costPrice: 4.00, margin: 60, status: "active", image: "/3d-icons/car.webp", additionalImages: [], orders: 3456, revenue: 34526, rating: 4.4, source: "aliexpress", isTrending: false, isWinning: false, isLocked: false, description: "Strong magnetic car phone mount with 360-degree rotation.", sku: "CPM-MAG-010", weight: "65g", tags: ["car", "mount", "accessories"] },
  { id: "PRD-011", name: "Yoga Mat Premium 6mm", category: "Sports", supplier: "Ningbo Hydra Co.", price: 22.99, comparePrice: 54.99, costPrice: 9.66, margin: 58, status: "active", image: "/3d-icons/yoga.webp", additionalImages: [], orders: 1245, revenue: 28623, rating: 4.7, source: "spocket", isTrending: false, isWinning: false, isLocked: false, description: "Non-slip premium yoga mat with alignment lines and carry strap.", sku: "YMP-6MM-011", weight: "1.2kg", tags: ["yoga", "fitness", "wellness"] },
  { id: "PRD-012", name: "Pet Grooming Glove", category: "Pets", supplier: "Yiwu Pet Supplies", price: 7.99, comparePrice: 19.99, costPrice: 3.20, margin: 60, status: "draft", image: "/3d-icons/pet.webp", additionalImages: [], orders: 0, revenue: 0, rating: 0, source: "aliexpress", isTrending: false, isWinning: false, isLocked: true, description: "Gentle deshedding glove for cats and dogs with silicone tips.", sku: "PGG-SIL-012", weight: "80g", tags: ["pets", "grooming"] },
  { id: "PRD-013", name: "Electric Scalp Massager", category: "Beauty", supplier: "Guangzhou Beauty Lab", price: 16.99, comparePrice: 44.99, costPrice: 6.46, margin: 62, status: "active", image: "/3d-icons/beauty.webp", additionalImages: [], orders: 1876, revenue: 31856, rating: 4.5, source: "cjdropshipping", isTrending: true, isWinning: false, isLocked: false, description: "Waterproof electric scalp massager with 4 massage heads.", sku: "ESM-ELE-013", weight: "150g", tags: ["beauty", "massage", "wellness"] },
  { id: "PRD-014", name: "Resistance Bands Set (5pc)", category: "Sports", supplier: "Ningbo Hydra Co.", price: 11.49, comparePrice: 29.99, costPrice: 4.37, margin: 62, status: "active", image: "/3d-icons/fitness.webp", additionalImages: [], orders: 2341, revenue: 26906, rating: 4.6, source: "aliexpress", isTrending: false, isWinning: false, isLocked: false, description: "Set of 5 resistance bands with varying resistance levels.", sku: "RBS-5PC-014", weight: "280g", tags: ["fitness", "bands", "workout"] },
  { id: "PRD-015", name: "Bamboo Wireless Charger", category: "Electronics", supplier: "ShenZhen Audio Co.", price: 19.99, comparePrice: 44.99, costPrice: 8.80, margin: 56, status: "draft", image: "/3d-icons/charger.webp", additionalImages: [], orders: 0, revenue: 0, rating: 0, source: "spocket", isTrending: false, isWinning: false, isLocked: true, description: "Eco-friendly bamboo wireless charger with fast charging support.", sku: "BWC-FAC-015", weight: "95g", tags: ["charging", "eco", "wireless"] },
  { id: "PRD-016", name: "Cloud Slides Cushion", category: "Fashion", supplier: "Dongguan Cases Ltd.", price: 13.99, comparePrice: 34.99, costPrice: 5.60, margin: 60, status: "active", image: "/3d-icons/shoes.webp", additionalImages: [], orders: 5678, revenue: 79437, rating: 4.3, source: "aliexpress", isTrending: true, isWinning: true, isLocked: false, description: "Ultra-soft cloud cushion slides for indoor and outdoor use.", sku: "CCS-SLD-016", weight: "200g", tags: ["footwear", "comfort", "tiktok"] },
  { id: "PRD-017", name: "Aroma Diffuser USB Mini", category: "Home & Living", supplier: "Yiwu Lighting Co.", price: 17.49, comparePrice: 42.99, costPrice: 7.17, margin: 59, status: "archived", image: "/3d-icons/diffuser.webp", additionalImages: [], orders: 890, revenue: 15566, rating: 3.9, source: "cjdropshipping", isTrending: false, isWinning: false, isLocked: false, description: "USB-powered mini aroma diffuser with LED mood lighting.", sku: "ADU-MIN-017", weight: "180g", tags: ["home", "aroma", "relaxation"] },
  { id: "PRD-018", name: "Travel Toiletry Bag Organizer", category: "Travel", supplier: "Yiwu Pet Supplies", price: 9.49, comparePrice: 24.99, costPrice: 3.61, margin: 62, status: "active", image: "/3d-icons/bag.webp", additionalImages: [], orders: 1543, revenue: 14633, rating: 4.4, source: "aliexpress", isTrending: false, isWinning: false, isLocked: false, description: "Waterproof travel toiletry bag with multiple compartments.", sku: "TTB-ORG-018", weight: "150g", tags: ["travel", "organizer", "bag"] },
];

export const categories: Category[] = [
  { id: "CAT-001", name: "Electronics", slug: "electronics", productCount: 5, status: "active", icon: "Cpu", trending: true },
  { id: "CAT-002", name: "Beauty", slug: "beauty", productCount: 3, status: "active", icon: "Sparkles", trending: true },
  { id: "CAT-003", name: "Sports", slug: "sports", productCount: 3, status: "active", icon: "Dumbbell" },
  { id: "CAT-004", name: "Home & Living", slug: "home-living", productCount: 2, status: "active", icon: "Home", trending: true },
  { id: "CAT-005", name: "Accessories", slug: "accessories", productCount: 2, status: "active", icon: "Watch" },
  { id: "CAT-006", name: "Photography", slug: "photography", productCount: 1, status: "active", icon: "Camera" },
  { id: "CAT-007", name: "Health", slug: "health", productCount: 1, status: "active", icon: "Heart" },
  { id: "CAT-008", name: "Fashion", slug: "fashion", productCount: 1, status: "active", icon: "Shirt" },
  { id: "CAT-009", name: "Pets", slug: "pets", productCount: 1, status: "active", icon: "PawPrint" },
  { id: "CAT-010", name: "Travel", slug: "travel", productCount: 1, status: "active", icon: "Plane" },
];

export const subcategories: Subcategory[] = [
  { id: "SUB-001", name: "Wireless Earbuds", categoryId: "CAT-001", keywords: ["bluetooth", "earphones", "tws"], productCount: 2 },
  { id: "SUB-002", name: "Smart Gadgets", categoryId: "CAT-001", keywords: ["smart", "iot", "wearable"], productCount: 1 },
  { id: "SUB-003", name: "Phone Accessories", categoryId: "CAT-001", keywords: ["case", "charger", "screen protector"], productCount: 1 },
  { id: "SUB-004", name: "LED Lights", categoryId: "CAT-001", keywords: ["rgb", "strip lights", "neon"], productCount: 1 },
  { id: "SUB-005", name: "Skincare", categoryId: "CAT-002", keywords: ["moisturizer", "serum", "cleanser"], productCount: 2 },
  { id: "SUB-006", name: "Makeup Tools", categoryId: "CAT-002", keywords: ["brushes", "sponge", "applicator"], productCount: 1 },
  { id: "SUB-007", name: "Fitness Equipment", categoryId: "CAT-003", keywords: ["resistance bands", "dumbbells", "yoga mat"], productCount: 2 },
  { id: "SUB-008", name: "Outdoor Gear", categoryId: "CAT-003", keywords: ["camping", "hiking", "backpack"], productCount: 1 },
  { id: "SUB-009", name: "Kitchen Gadgets", categoryId: "CAT-004", keywords: ["organizer", "utensils", "storage"], productCount: 1 },
  { id: "SUB-010", name: "Home Decor", categoryId: "CAT-004", keywords: ["wall art", "vase", "lamp"], productCount: 1 },
  { id: "SUB-011", name: "Watches", categoryId: "CAT-005", keywords: ["smartwatch", "analog", "digital"], productCount: 1 },
  { id: "SUB-012", name: "Jewelry", categoryId: "CAT-005", keywords: ["necklace", "bracelet", "ring"], productCount: 1 },
  { id: "SUB-013", name: "Camera Accessories", categoryId: "CAT-006", keywords: ["tripod", "lens", "filter"], productCount: 1 },
  { id: "SUB-014", name: "Supplements", categoryId: "CAT-007", keywords: ["vitamins", "protein", "wellness"], productCount: 1 },
  { id: "SUB-015", name: "Streetwear", categoryId: "CAT-008", keywords: ["hoodie", "sneakers", "caps"], productCount: 1 },
  { id: "SUB-016", name: "Pet Toys", categoryId: "CAT-009", keywords: ["chew toys", "balls", "interactive"], productCount: 1 },
  { id: "SUB-017", name: "Travel Bags", categoryId: "CAT-010", keywords: ["organizer", "packing cubes", "toiletry"], productCount: 1 },
];

export const suppliers: Supplier[] = [
  { id: "SUP-001", name: "ShenZhen Audio Co.", country: "China", rating: 4.7, products: 342, avgShipping: 8, status: "verified" },
  { id: "SUP-002", name: "Dongguan Tech Ltd.", country: "China", rating: 4.5, products: 218, avgShipping: 10, status: "verified" },
  { id: "SUP-003", name: "Yiwu Lighting Co.", country: "China", rating: 4.6, products: 567, avgShipping: 7, status: "verified" },
  { id: "SUP-004", name: "Guangzhou Beauty Lab", country: "China", rating: 4.8, products: 189, avgShipping: 9, status: "verified" },
  { id: "SUP-005", name: "ShenZhen Display Tech", country: "China", rating: 4.3, products: 124, avgShipping: 12, status: "verified" },
  { id: "SUP-006", name: "Dongguan Cases Ltd.", country: "China", rating: 4.2, products: 890, avgShipping: 6, status: "verified" },
  { id: "SUP-007", name: "Ningbo Hydra Co.", country: "China", rating: 4.6, products: 156, avgShipping: 8, status: "verified" },
  { id: "SUP-008", name: "ShenZhen Auto Parts", country: "China", rating: 4.1, products: 432, avgShipping: 11, status: "pending" },
  { id: "SUP-009", name: "Yiwu Pet Supplies", country: "China", rating: 4.0, products: 298, avgShipping: 9, status: "verified" },
  { id: "SUP-010", name: "Guangzhou Wellness", country: "China", rating: 4.4, products: 167, avgShipping: 10, status: "verified" },
  { id: "SUP-011", name: "Istanbul Textiles", country: "Turkey", rating: 4.3, products: 89, avgShipping: 14, status: "pending" },
  { id: "SUP-012", name: "Mumbai Crafts Hub", country: "India", rating: 4.5, products: 234, avgShipping: 12, status: "verified" },
];

export const externalUsers: ExternalUser[] = [
  { id: "USR-001", name: "Sarah Chen", email: "sarah@ecomstore.com", plan: "pro", status: "active", signupDate: "2024-08-15", lastLogin: "2025-02-26", storesConnected: 3, productsImported: 145, revenue: 89400 },
  { id: "USR-002", name: "Marcus Rodriguez", email: "marcus@dropworld.io", plan: "enterprise", status: "active", signupDate: "2024-06-20", lastLogin: "2025-02-27", storesConnected: 5, productsImported: 312, revenue: 234500 },
  { id: "USR-003", name: "Priya Sharma", email: "priya@quickshop.in", plan: "starter", status: "active", signupDate: "2024-11-10", lastLogin: "2025-02-25", storesConnected: 1, productsImported: 28, revenue: 12300 },
  { id: "USR-004", name: "Jake Miller", email: "jake@trendyfinds.com", plan: "pro", status: "active", signupDate: "2024-09-05", lastLogin: "2025-02-27", storesConnected: 2, productsImported: 89, revenue: 67800 },
  { id: "USR-005", name: "Aisha Khan", email: "aisha@luxedrops.co", plan: "pro", status: "active", signupDate: "2024-10-18", lastLogin: "2025-02-24", storesConnected: 2, productsImported: 67, revenue: 45200 },
  { id: "USR-006", name: "Tom Bradley", email: "tom@gadgetguru.store", plan: "free", status: "trial", signupDate: "2025-02-10", lastLogin: "2025-02-26", storesConnected: 0, productsImported: 5, revenue: 0 },
  { id: "USR-007", name: "Lin Wei", email: "lin@megastore.cn", plan: "enterprise", status: "active", signupDate: "2024-04-12", lastLogin: "2025-02-27", storesConnected: 8, productsImported: 520, revenue: 456000 },
  { id: "USR-008", name: "Emma Wilson", email: "emma@beautybox.co.uk", plan: "starter", status: "active", signupDate: "2024-12-01", lastLogin: "2025-02-23", storesConnected: 1, productsImported: 34, revenue: 18900 },
  { id: "USR-009", name: "Diego Costa", email: "diego@shopbrasil.com.br", plan: "pro", status: "churned", signupDate: "2024-07-22", lastLogin: "2025-01-15", storesConnected: 1, productsImported: 42, revenue: 23100 },
  { id: "USR-010", name: "Yuki Tanaka", email: "yuki@tokyotrends.jp", plan: "starter", status: "active", signupDate: "2025-01-05", lastLogin: "2025-02-26", storesConnected: 1, productsImported: 19, revenue: 8700 },
  { id: "USR-011", name: "Olivia Brown", email: "olivia@homevibes.com", plan: "free", status: "trial", signupDate: "2025-02-18", lastLogin: "2025-02-25", storesConnected: 0, productsImported: 2, revenue: 0 },
  { id: "USR-012", name: "Raj Patel", email: "raj@fastship.in", plan: "pro", status: "active", signupDate: "2024-09-30", lastLogin: "2025-02-27", storesConnected: 3, productsImported: 156, revenue: 98700 },
  { id: "USR-013", name: "Sophie Dubois", email: "sophie@chicmarket.fr", plan: "starter", status: "churned", signupDate: "2024-10-05", lastLogin: "2025-01-28", storesConnected: 1, productsImported: 15, revenue: 5400 },
  { id: "USR-014", name: "Alex Turner", email: "alex@dropzone.com.au", plan: "enterprise", status: "active", signupDate: "2024-05-15", lastLogin: "2025-02-27", storesConnected: 6, productsImported: 410, revenue: 312000 },
  { id: "USR-015", name: "Fatima Al-Rashid", email: "fatima@gulfgoods.ae", plan: "pro", status: "active", signupDate: "2024-11-20", lastLogin: "2025-02-26", storesConnected: 2, productsImported: 78, revenue: 56300 },
];

export const leads: Lead[] = [
  { id: "LD-001", name: "Chris Johnson", email: "chris@bigretail.com", source: "website", status: "new", assignedTo: "Karan Gupta", createdDate: "2025-02-25", notes: "Interested in enterprise plan" },
  { id: "LD-002", name: "Anna Smith", email: "anna@fashionhub.co", source: "ad", status: "contacted", assignedTo: "Vikram Singh", createdDate: "2025-02-23", notes: "Saw Facebook ad, wants demo" },
  { id: "LD-003", name: "Mike Chen", email: "mike@techstartup.io", source: "organic", status: "qualified", assignedTo: "Karan Gupta", createdDate: "2025-02-20", notes: "Running 3 stores, needs automation" },
  { id: "LD-004", name: "Lisa Park", email: "lisa@seoulstyle.kr", source: "referral", status: "converted", assignedTo: "Vikram Singh", createdDate: "2025-02-15", notes: "Referred by Marcus Rodriguez" },
  { id: "LD-005", name: "David Brown", email: "david@gadgetworld.com", source: "website", status: "new", assignedTo: "Karan Gupta", createdDate: "2025-02-26", notes: "Submitted contact form" },
  { id: "LD-006", name: "Natasha Ivanova", email: "natasha@dropru.ru", source: "ad", status: "contacted", assignedTo: "Sneha Patel", createdDate: "2025-02-22", notes: "Google Ads click, booked call" },
  { id: "LD-007", name: "Carlos Mendez", email: "carlos@tiendamx.com", source: "organic", status: "lost", assignedTo: "Vikram Singh", createdDate: "2025-02-10", notes: "Budget constraints" },
  { id: "LD-008", name: "Samantha Lee", email: "sam@beautydrops.com", source: "referral", status: "qualified", assignedTo: "Sneha Patel", createdDate: "2025-02-18", notes: "Referred by Emma Wilson" },
  { id: "LD-009", name: "Omar Hassan", email: "omar@middleast.shop", source: "website", status: "new", assignedTo: "Karan Gupta", createdDate: "2025-02-27", notes: "Wants to expand to GCC market" },
  { id: "LD-010", name: "Jenny Nguyen", email: "jenny@vietshop.vn", source: "ad", status: "contacted", assignedTo: "Vikram Singh", createdDate: "2025-02-21", notes: "TikTok ad conversion" },
  { id: "LD-011", name: "Robert Taylor", email: "robert@homegoodsplus.com", source: "organic", status: "qualified", assignedTo: "Sneha Patel", createdDate: "2025-02-16", notes: "Looking for home niche products" },
  { id: "LD-012", name: "Ayumi Sato", email: "ayumi@kawaiishop.jp", source: "referral", status: "converted", assignedTo: "Karan Gupta", createdDate: "2025-02-12", notes: "Referred by Yuki Tanaka" },
  { id: "LD-013", name: "Peter Schmidt", email: "peter@eurodrop.de", source: "website", status: "new", assignedTo: "Vikram Singh", createdDate: "2025-02-26", notes: "German market expansion" },
  { id: "LD-014", name: "Maria Garcia", email: "maria@tiendaonline.es", source: "ad", status: "contacted", assignedTo: "Sneha Patel", createdDate: "2025-02-19", notes: "Instagram ad, interested in beauty" },
  { id: "LD-015", name: "Kevin O'Brien", email: "kevin@irishdrops.ie", source: "organic", status: "new", assignedTo: "Karan Gupta", createdDate: "2025-02-27", notes: "Found via blog post" },
];

export const pipelineStageConfig: Record<PipelineStage, { label: string; color: string }> = {
  new: { label: "New", color: "#6366f1" },
  contacted: { label: "Contacted", color: "#0ea5e9" },
  engaged: { label: "Engaged", color: "#8b5cf6" },
  qualified: { label: "Qualified", color: "#f59e0b" },
  demo_done: { label: "Demo Done", color: "#f97316" },
  negotiation: { label: "Negotiation", color: "#ec4899" },
  converted: { label: "Converted", color: "#22c55e" },
};

export const pipelineLeads: PipelineLead[] = [
  { id: "PL-001", name: "Arjun Mehta", email: "arjun@gmail.com", phone: "+91 98765 43210", source: "youtube", pipelineStage: "new", engagementLevel: "warm", engagementScore: 42, chaptersCompleted: 3, totalChapters: 12, daysInStage: 1, assignedTo: "Karan Gupta", createdDate: "2025-02-27", lastActivity: "2025-02-27", notes: "Watched 3 free videos, signed up same day", callLog: [], activitySummary: "Signed up via YouTube funnel, completed 3 chapters in day 1", plan: "free", city: "Mumbai", country: "India" },
  { id: "PL-002", name: "Ravi Kumar", email: "ravi.k@outlook.com", phone: "+91 87654 32109", source: "instagram", pipelineStage: "contacted", engagementLevel: "warm", engagementScore: 55, chaptersCompleted: 5, totalChapters: 12, daysInStage: 3, assignedTo: "Vikram Singh", createdDate: "2025-02-24", lastActivity: "2025-02-26", notes: "Responded to DM, interested in dropshipping", callLog: [{ date: "2025-02-25", summary: "Intro call - interested but wants to see results first", duration: "12 min" }], activitySummary: "Completed 5 chapters, replied to follow-up email", plan: "free", city: "Delhi", country: "India" },
  { id: "PL-003", name: "Sneha Reddy", email: "sneha.r@yahoo.com", phone: "+91 76543 21098", source: "referral", pipelineStage: "engaged", engagementLevel: "hot", engagementScore: 78, chaptersCompleted: 9, totalChapters: 12, daysInStage: 5, assignedTo: "Sneha Patel", createdDate: "2025-02-19", lastActivity: "2025-02-27", notes: "Referred by existing client Priya, very motivated", callLog: [{ date: "2025-02-20", summary: "Discovery call - wants to start ASAP", duration: "18 min" }, { date: "2025-02-24", summary: "Follow-up - ready to upgrade", duration: "8 min" }], activitySummary: "Completed 9/12 chapters, active daily, shared progress screenshots", plan: "free", city: "Hyderabad", country: "India" },
  { id: "PL-004", name: "Amit Patel", email: "amit.p@gmail.com", phone: "+91 65432 10987", source: "ad", pipelineStage: "qualified", engagementLevel: "hot", engagementScore: 85, chaptersCompleted: 12, totalChapters: 12, daysInStage: 2, assignedTo: "Karan Gupta", createdDate: "2025-02-14", lastActivity: "2025-02-27", notes: "Completed all free chapters, asked about pro plan pricing", callLog: [{ date: "2025-02-16", summary: "Qualified - has budget, ready to start", duration: "22 min" }, { date: "2025-02-20", summary: "Sent proposal, reviewing", duration: "15 min" }], activitySummary: "Finished all 12 chapters, attempted product research, hit paywall", plan: "free", city: "Ahmedabad", country: "India" },
  { id: "PL-005", name: "Deepak Sharma", email: "deepak.s@hotmail.com", phone: "+91 54321 09876", source: "youtube", pipelineStage: "demo_done", engagementLevel: "hot", engagementScore: 92, chaptersCompleted: 12, totalChapters: 12, daysInStage: 1, assignedTo: "Vikram Singh", createdDate: "2025-02-10", lastActivity: "2025-02-27", notes: "Demo went great, comparing with other platforms", callLog: [{ date: "2025-02-12", summary: "Initial call - very interested", duration: "20 min" }, { date: "2025-02-18", summary: "Demo session - loved the AI tools", duration: "45 min" }, { date: "2025-02-26", summary: "Follow-up - deciding this week", duration: "10 min" }], activitySummary: "Attended live demo, explored AI ad studio, asked about enterprise", plan: "free", city: "Jaipur", country: "India" },
  { id: "PL-006", name: "Priya Nair", email: "priya.n@gmail.com", phone: "+91 43210 98765", source: "referral", pipelineStage: "negotiation", engagementLevel: "hot", engagementScore: 95, chaptersCompleted: 12, totalChapters: 12, daysInStage: 4, assignedTo: "Karan Gupta", createdDate: "2025-02-05", lastActivity: "2025-02-27", notes: "Negotiating pro plan annual discount", callLog: [{ date: "2025-02-07", summary: "Intro - referred by Marcus", duration: "15 min" }, { date: "2025-02-14", summary: "Demo + pricing discussion", duration: "40 min" }, { date: "2025-02-22", summary: "Negotiation - wants 20% annual discount", duration: "25 min" }], activitySummary: "Completed all content, tried competitor tools, coming back to us", plan: "none", city: "Kochi", country: "India" },
  { id: "PL-007", name: "Vikash Gupta", email: "vikash.g@gmail.com", phone: "+91 32109 87654", source: "website", pipelineStage: "converted", engagementLevel: "hot", engagementScore: 100, chaptersCompleted: 12, totalChapters: 12, daysInStage: 0, assignedTo: "Sneha Patel", createdDate: "2025-02-01", lastActivity: "2025-02-27", notes: "Signed up for Pro annual plan", callLog: [{ date: "2025-02-03", summary: "Welcome call", duration: "10 min" }, { date: "2025-02-10", summary: "Onboarding session", duration: "30 min" }, { date: "2025-02-20", summary: "Check-in - loves the platform", duration: "12 min" }], activitySummary: "Converted to Pro plan, already set up Shopify store", plan: "pro", city: "Lucknow", country: "India" },
  { id: "PL-008", name: "Meera Joshi", email: "meera.j@outlook.com", phone: "+91 21098 76543", source: "instagram", pipelineStage: "new", engagementLevel: "cold", engagementScore: 15, chaptersCompleted: 1, totalChapters: 12, daysInStage: 2, assignedTo: "Vikram Singh", createdDate: "2025-02-25", lastActivity: "2025-02-25", notes: "Clicked link in bio, minimal engagement so far", callLog: [], activitySummary: "Signed up but only watched 1 video", plan: "free", city: "Pune", country: "India" },
  { id: "PL-009", name: "Karthik Rajan", email: "karthik.r@gmail.com", phone: "+91 10987 65432", source: "ad", pipelineStage: "contacted", engagementLevel: "cold", engagementScore: 28, chaptersCompleted: 2, totalChapters: 12, daysInStage: 6, assignedTo: "Karan Gupta", createdDate: "2025-02-21", lastActivity: "2025-02-23", notes: "Called once, said he'll think about it", callLog: [{ date: "2025-02-22", summary: "Cold call - not very interested, said busy", duration: "5 min" }], activitySummary: "Low engagement, opened 1 email out of 4 sent", plan: "free", city: "Chennai", country: "India" },
  { id: "PL-010", name: "Ananya Desai", email: "ananya.d@gmail.com", phone: "+91 09876 54321", source: "youtube", pipelineStage: "engaged", engagementLevel: "warm", engagementScore: 65, chaptersCompleted: 7, totalChapters: 12, daysInStage: 3, assignedTo: "Sneha Patel", createdDate: "2025-02-17", lastActivity: "2025-02-26", notes: "Actively going through content, asking questions in community", callLog: [{ date: "2025-02-19", summary: "Intro call - motivated, has some savings to invest", duration: "14 min" }], activitySummary: "7 chapters done, posted 3 community questions, opened all emails", plan: "free", city: "Bangalore", country: "India" },
  { id: "PL-011", name: "Rohit Verma", email: "rohit.v@yahoo.com", phone: "+91 98712 34567", source: "organic", pipelineStage: "qualified", engagementLevel: "warm", engagementScore: 72, chaptersCompleted: 10, totalChapters: 12, daysInStage: 7, assignedTo: "Vikram Singh", createdDate: "2025-02-12", lastActivity: "2025-02-25", notes: "Qualified but slow to decide, needs more convincing", callLog: [{ date: "2025-02-14", summary: "Discovery - interested but cautious", duration: "20 min" }, { date: "2025-02-20", summary: "Sent case studies, reviewing", duration: "10 min" }], activitySummary: "10 chapters done, downloaded case studies PDF", plan: "free", city: "Kolkata", country: "India" },
  { id: "PL-012", name: "Pooja Agarwal", email: "pooja.a@gmail.com", phone: "+91 87612 34567", source: "referral", pipelineStage: "demo_done", engagementLevel: "warm", engagementScore: 80, chaptersCompleted: 11, totalChapters: 12, daysInStage: 5, assignedTo: "Karan Gupta", createdDate: "2025-02-08", lastActivity: "2025-02-26", notes: "Demo done, comparing with Spocket", callLog: [{ date: "2025-02-10", summary: "Discovery call", duration: "15 min" }, { date: "2025-02-15", summary: "Platform demo", duration: "35 min" }, { date: "2025-02-22", summary: "Follow-up - still comparing", duration: "8 min" }], activitySummary: "Completed demo, explored competitor tools, engaged in community", plan: "free", city: "Noida", country: "India" },
  { id: "PL-013", name: "Siddharth Rao", email: "sid.rao@gmail.com", phone: "+91 76512 34567", source: "website", pipelineStage: "new", engagementLevel: "warm", engagementScore: 38, chaptersCompleted: 4, totalChapters: 12, daysInStage: 0, assignedTo: "Sneha Patel", createdDate: "2025-02-27", lastActivity: "2025-02-27", notes: "Just signed up today, completed 4 chapters already", callLog: [], activitySummary: "Fast starter - 4 chapters on day 1", plan: "free", city: "Goa", country: "India" },
  { id: "PL-014", name: "Nisha Kapoor", email: "nisha.k@hotmail.com", phone: "+91 65412 34567", source: "ad", pipelineStage: "negotiation", engagementLevel: "hot", engagementScore: 88, chaptersCompleted: 12, totalChapters: 12, daysInStage: 2, assignedTo: "Vikram Singh", createdDate: "2025-02-06", lastActivity: "2025-02-27", notes: "Wants starter plan but asking for extra features", callLog: [{ date: "2025-02-08", summary: "Intro call", duration: "12 min" }, { date: "2025-02-15", summary: "Demo session", duration: "40 min" }, { date: "2025-02-25", summary: "Price negotiation - close to closing", duration: "20 min" }], activitySummary: "All chapters done, attended 2 webinars, very active in community", plan: "none", city: "Chandigarh", country: "India" },
  { id: "PL-015", name: "Rahul Singh", email: "rahul.s@gmail.com", phone: "+91 54312 34567", source: "youtube", pipelineStage: "converted", engagementLevel: "hot", engagementScore: 100, chaptersCompleted: 12, totalChapters: 12, daysInStage: 0, assignedTo: "Karan Gupta", createdDate: "2025-01-28", lastActivity: "2025-02-27", notes: "Converted to Enterprise plan", callLog: [{ date: "2025-01-30", summary: "Welcome call", duration: "15 min" }, { date: "2025-02-05", summary: "Onboarding + setup", duration: "45 min" }, { date: "2025-02-15", summary: "1-month check-in - scaling fast", duration: "20 min" }], activitySummary: "Enterprise user, 3 stores connected, generating revenue", plan: "enterprise", city: "Delhi", country: "India" },
  { id: "PL-016", name: "Tanvi Bhatt", email: "tanvi.b@gmail.com", phone: "+91 43212 34567", source: "instagram", pipelineStage: "engaged", engagementLevel: "cold", engagementScore: 35, chaptersCompleted: 4, totalChapters: 12, daysInStage: 10, assignedTo: "Vikram Singh", createdDate: "2025-02-15", lastActivity: "2025-02-20", notes: "Was engaged but went silent last week", callLog: [{ date: "2025-02-17", summary: "Intro call - seemed interested", duration: "10 min" }], activitySummary: "Started strong but engagement dropped off", plan: "free", city: "Surat", country: "India" },
  { id: "PL-017", name: "Aditya Malhotra", email: "aditya.m@outlook.com", phone: "+91 32112 34567", source: "organic", pipelineStage: "contacted", engagementLevel: "warm", engagementScore: 48, chaptersCompleted: 6, totalChapters: 12, daysInStage: 2, assignedTo: "Sneha Patel", createdDate: "2025-02-22", lastActivity: "2025-02-26", notes: "Good potential, scheduled follow-up call", callLog: [{ date: "2025-02-24", summary: "First contact - interested in product research tools", duration: "14 min" }], activitySummary: "6 chapters done, exploring product catalog", plan: "free", city: "Indore", country: "India" },
  { id: "PL-018", name: "Kavya Iyer", email: "kavya.i@gmail.com", phone: "+91 21012 34567", source: "website", pipelineStage: "qualified", engagementLevel: "hot", engagementScore: 82, chaptersCompleted: 11, totalChapters: 12, daysInStage: 1, assignedTo: "Karan Gupta", createdDate: "2025-02-11", lastActivity: "2025-02-27", notes: "Ready for demo, very keen on AI tools", callLog: [{ date: "2025-02-13", summary: "Discovery call - excited about AI features", duration: "18 min" }, { date: "2025-02-22", summary: "Qualification call - budget approved", duration: "12 min" }], activitySummary: "11 chapters done, tried all free features, asking for demo", plan: "free", city: "Mysore", country: "India" },
];

export const subscriptions: Subscription[] = [
  { id: "SUB-001", userId: "USR-001", userName: "Sarah Chen", plan: "pro", status: "active", startDate: "2024-08-15", endDate: "2025-08-15", mrr: 79 },
  { id: "SUB-002", userId: "USR-002", userName: "Marcus Rodriguez", plan: "enterprise", status: "active", startDate: "2024-06-20", endDate: "2025-06-20", mrr: 199 },
  { id: "SUB-003", userId: "USR-003", userName: "Priya Sharma", plan: "starter", status: "active", startDate: "2024-11-10", endDate: "2025-11-10", mrr: 29 },
  { id: "SUB-004", userId: "USR-004", userName: "Jake Miller", plan: "pro", status: "active", startDate: "2024-09-05", endDate: "2025-09-05", mrr: 79 },
  { id: "SUB-005", userId: "USR-005", userName: "Aisha Khan", plan: "pro", status: "active", startDate: "2024-10-18", endDate: "2025-10-18", mrr: 79 },
  { id: "SUB-006", userId: "USR-006", userName: "Tom Bradley", plan: "free", status: "trialing", startDate: "2025-02-10", endDate: "2025-03-10", mrr: 0 },
  { id: "SUB-007", userId: "USR-007", userName: "Lin Wei", plan: "enterprise", status: "active", startDate: "2024-04-12", endDate: "2025-04-12", mrr: 199 },
  { id: "SUB-008", userId: "USR-008", userName: "Emma Wilson", plan: "starter", status: "active", startDate: "2024-12-01", endDate: "2025-12-01", mrr: 29 },
  { id: "SUB-009", userId: "USR-009", userName: "Diego Costa", plan: "pro", status: "canceled", startDate: "2024-07-22", endDate: "2025-01-22", mrr: 0 },
  { id: "SUB-010", userId: "USR-010", userName: "Yuki Tanaka", plan: "starter", status: "active", startDate: "2025-01-05", endDate: "2026-01-05", mrr: 29 },
  { id: "SUB-011", userId: "USR-011", userName: "Olivia Brown", plan: "free", status: "trialing", startDate: "2025-02-18", endDate: "2025-03-18", mrr: 0 },
  { id: "SUB-012", userId: "USR-012", userName: "Raj Patel", plan: "pro", status: "active", startDate: "2024-09-30", endDate: "2025-09-30", mrr: 79 },
  { id: "SUB-013", userId: "USR-013", userName: "Sophie Dubois", plan: "starter", status: "canceled", startDate: "2024-10-05", endDate: "2025-01-05", mrr: 0 },
  { id: "SUB-014", userId: "USR-014", userName: "Alex Turner", plan: "enterprise", status: "active", startDate: "2024-05-15", endDate: "2025-05-15", mrr: 199 },
  { id: "SUB-015", userId: "USR-015", userName: "Fatima Al-Rashid", plan: "pro", status: "active", startDate: "2024-11-20", endDate: "2025-11-20", mrr: 79 },
];

export const shopifyStores: ShopifyStore[] = [
  { id: "STO-001", name: "TrendyFinds Store", owner: "Jake Miller", domain: "trendyfinds.myshopify.com", status: "active", products: 89, orders: 1245, revenue: 67800, connectedDate: "2024-09-10" },
  { id: "STO-002", name: "LuxeDrops Official", owner: "Aisha Khan", domain: "luxedrops.myshopify.com", status: "active", products: 67, orders: 890, revenue: 45200, connectedDate: "2024-10-22" },
  { id: "STO-003", name: "Sarah's Beauty Box", owner: "Sarah Chen", domain: "sarahbeauty.myshopify.com", status: "active", products: 56, orders: 1567, revenue: 34200, connectedDate: "2024-08-20" },
  { id: "STO-004", name: "GadgetGuru Store", owner: "Tom Bradley", domain: "gadgetguru.myshopify.com", status: "paused", products: 5, orders: 0, revenue: 0, connectedDate: "2025-02-12" },
  { id: "STO-005", name: "MegaStore Global", owner: "Lin Wei", domain: "megastore-global.myshopify.com", status: "active", products: 234, orders: 5678, revenue: 189000, connectedDate: "2024-04-15" },
  { id: "STO-006", name: "DropZone AU", owner: "Alex Turner", domain: "dropzone-au.myshopify.com", status: "active", products: 178, orders: 3456, revenue: 134000, connectedDate: "2024-05-20" },
  { id: "STO-007", name: "FastShip India", owner: "Raj Patel", domain: "fastship-india.myshopify.com", status: "active", products: 120, orders: 2341, revenue: 78900, connectedDate: "2024-10-01" },
  { id: "STO-008", name: "Tokyo Trends", owner: "Yuki Tanaka", domain: "tokyotrends.myshopify.com", status: "active", products: 19, orders: 234, revenue: 8700, connectedDate: "2025-01-08" },
  { id: "STO-009", name: "Gulf Goods Premium", owner: "Fatima Al-Rashid", domain: "gulfgoods.myshopify.com", status: "active", products: 78, orders: 1123, revenue: 56300, connectedDate: "2024-11-25" },
  { id: "STO-010", name: "Chen's Second Store", owner: "Sarah Chen", domain: "chensdeals.myshopify.com", status: "active", products: 45, orders: 890, revenue: 28400, connectedDate: "2024-12-15" },
  { id: "STO-011", name: "Marcus Drop Empire", owner: "Marcus Rodriguez", domain: "marcusdrops.myshopify.com", status: "active", products: 156, orders: 4567, revenue: 156000, connectedDate: "2024-06-25" },
  { id: "STO-012", name: "HomeVibes Test", owner: "Olivia Brown", domain: "homevibes-test.myshopify.com", status: "disconnected", products: 2, orders: 0, revenue: 0, connectedDate: "2025-02-20" },
];

export const competitorStores: CompetitorStore[] = [
  { id: "CMP-001", name: "HyperSKU", domain: "hypersku.com", niche: "General Dropshipping", estimatedRevenue: 2400000, productCount: 12000, trafficRank: 45230 },
  { id: "CMP-002", name: "Sell The Trend", domain: "sellthetrend.com", niche: "Product Research", estimatedRevenue: 1800000, productCount: 8500, trafficRank: 32100 },
  { id: "CMP-003", name: "Dropship.io", domain: "dropship.io", niche: "Full Suite", estimatedRevenue: 3200000, productCount: 15000, trafficRank: 28900 },
  { id: "CMP-004", name: "AutoDS", domain: "autods.com", niche: "Automation", estimatedRevenue: 5600000, productCount: 25000, trafficRank: 18500 },
  { id: "CMP-005", name: "Spocket", domain: "spocket.co", niche: "US/EU Suppliers", estimatedRevenue: 4100000, productCount: 20000, trafficRank: 22300 },
  { id: "CMP-006", name: "Zendrop", domain: "zendrop.com", niche: "Fulfillment", estimatedRevenue: 2900000, productCount: 11000, trafficRank: 35600 },
  { id: "CMP-007", name: "DSers", domain: "dsers.com", niche: "AliExpress Integration", estimatedRevenue: 3800000, productCount: 30000, trafficRank: 15200 },
  { id: "CMP-008", name: "Oberlo Legacy", domain: "oberlo.com", niche: "Shopify Native", estimatedRevenue: 1200000, productCount: 5000, trafficRank: 52000 },
  { id: "CMP-009", name: "CJ Dropshipping", domain: "cjdropshipping.com", niche: "Sourcing + Fulfillment", estimatedRevenue: 8900000, productCount: 400000, trafficRank: 8900 },
  { id: "CMP-010", name: "Ecomhunt", domain: "ecomhunt.com", niche: "Winning Products", estimatedRevenue: 980000, productCount: 3200, trafficRank: 67000 },
];

export const fulfillmentOrders: FulfillmentOrder[] = [
  { id: "FUL-001", orderId: "ORD-4521", store: "TrendyFinds Store", product: "Wireless Bluetooth Earbuds Pro", status: "shipped", trackingNumber: "SF1234567890", supplier: "ShenZhen Audio Co.", createdDate: "2025-02-22" },
  { id: "FUL-002", orderId: "ORD-4522", store: "LuxeDrops Official", product: "Vitamin C Brightening Serum", status: "delivered", trackingNumber: "YT9876543210", supplier: "Guangzhou Beauty Lab", createdDate: "2025-02-20" },
  { id: "FUL-003", orderId: "ORD-4523", store: "MegaStore Global", product: "LED Ring Light 10-inch", status: "processing", trackingNumber: "", supplier: "Yiwu Lighting Co.", createdDate: "2025-02-25" },
  { id: "FUL-004", orderId: "ORD-4524", store: "DropZone AU", product: "Smart Watch Fitness Tracker", status: "pending", trackingNumber: "", supplier: "Dongguan Tech Ltd.", createdDate: "2025-02-26" },
  { id: "FUL-005", orderId: "ORD-4525", store: "FastShip India", product: "Sunset Lamp Projector", status: "shipped", trackingNumber: "EMS2345678901", supplier: "Yiwu Lighting Co.", createdDate: "2025-02-23" },
  { id: "FUL-006", orderId: "ORD-4526", store: "Sarah's Beauty Box", product: "Electric Scalp Massager", status: "delivered", trackingNumber: "DHL3456789012", supplier: "Guangzhou Beauty Lab", createdDate: "2025-02-18" },
  { id: "FUL-007", orderId: "ORD-4527", store: "Marcus Drop Empire", product: "Silicone Phone Case Matte", status: "shipped", trackingNumber: "UPS4567890123", supplier: "Dongguan Cases Ltd.", createdDate: "2025-02-24" },
  { id: "FUL-008", orderId: "ORD-4528", store: "Gulf Goods Premium", product: "Insulated Water Bottle 750ml", status: "processing", trackingNumber: "", supplier: "Ningbo Hydra Co.", createdDate: "2025-02-26" },
  { id: "FUL-009", orderId: "ORD-4529", store: "Tokyo Trends", product: "Cloud Slides Cushion", status: "pending", trackingNumber: "", supplier: "Dongguan Cases Ltd.", createdDate: "2025-02-27" },
  { id: "FUL-010", orderId: "ORD-4530", store: "TrendyFinds Store", product: "Car Phone Mount Magnetic", status: "delivered", trackingNumber: "SF5678901234", supplier: "ShenZhen Auto Parts", createdDate: "2025-02-19" },
  { id: "FUL-011", orderId: "ORD-4531", store: "MegaStore Global", product: "Yoga Mat Premium 6mm", status: "shipped", trackingNumber: "YT6789012345", supplier: "Ningbo Hydra Co.", createdDate: "2025-02-24" },
  { id: "FUL-012", orderId: "ORD-4532", store: "DropZone AU", product: "Resistance Bands Set (5pc)", status: "processing", trackingNumber: "", supplier: "Ningbo Hydra Co.", createdDate: "2025-02-26" },
  { id: "FUL-013", orderId: "ORD-4533", store: "Chen's Second Store", product: "Posture Corrector Back Brace", status: "pending", trackingNumber: "", supplier: "Guangzhou Wellness", createdDate: "2025-02-27" },
  { id: "FUL-014", orderId: "ORD-4534", store: "FastShip India", product: "Travel Toiletry Bag Organizer", status: "shipped", trackingNumber: "EMS7890123456", supplier: "Yiwu Pet Supplies", createdDate: "2025-02-23" },
  { id: "FUL-015", orderId: "ORD-4535", store: "Marcus Drop Empire", product: "Portable Mini Projector HD", status: "delivered", trackingNumber: "DHL8901234567", supplier: "ShenZhen Display Tech", createdDate: "2025-02-17" },
];

export const supportTickets: SupportTicket[] = [
  { id: "TKT-001", subject: "Cannot connect Shopify store", user: "Tom Bradley", priority: "high", status: "open", category: "technical", createdDate: "2025-02-26", assignedTo: "Support Team A" },
  { id: "TKT-002", subject: "Billing charge incorrect", user: "Diego Costa", priority: "urgent", status: "in-progress", category: "billing", createdDate: "2025-02-25", assignedTo: "Support Team B" },
  { id: "TKT-003", subject: "Product import stuck at 50%", user: "Priya Sharma", priority: "medium", status: "open", category: "technical", createdDate: "2025-02-26", assignedTo: "Support Team A" },
  { id: "TKT-004", subject: "How to cancel subscription?", user: "Sophie Dubois", priority: "low", status: "resolved", category: "account", createdDate: "2025-02-22", assignedTo: "Support Team B" },
  { id: "TKT-005", subject: "AI Ad Studio not generating images", user: "Sarah Chen", priority: "high", status: "in-progress", category: "product", createdDate: "2025-02-25", assignedTo: "Support Team A" },
  { id: "TKT-006", subject: "Tracking numbers not syncing", user: "Jake Miller", priority: "medium", status: "open", category: "technical", createdDate: "2025-02-27", assignedTo: "Support Team A" },
  { id: "TKT-007", subject: "Enterprise plan feature access", user: "Lin Wei", priority: "low", status: "resolved", category: "account", createdDate: "2025-02-20", assignedTo: "Support Team B" },
  { id: "TKT-008", subject: "Refund request for last month", user: "Diego Costa", priority: "urgent", status: "open", category: "billing", createdDate: "2025-02-27", assignedTo: "Support Team B" },
  { id: "TKT-009", subject: "Competitor spy tool inaccurate data", user: "Marcus Rodriguez", priority: "medium", status: "in-progress", category: "product", createdDate: "2025-02-24", assignedTo: "Support Team A" },
  { id: "TKT-010", subject: "Cannot access learning hub videos", user: "Emma Wilson", priority: "low", status: "open", category: "technical", createdDate: "2025-02-26", assignedTo: "Support Team A" },
  { id: "TKT-011", subject: "Bulk import CSV format error", user: "Alex Turner", priority: "high", status: "open", category: "technical", createdDate: "2025-02-27", assignedTo: "Support Team A" },
  { id: "TKT-012", subject: "Payment method update failed", user: "Fatima Al-Rashid", priority: "medium", status: "resolved", category: "billing", createdDate: "2025-02-21", assignedTo: "Support Team B" },
];

export const courses: Course[] = [
  {
    id: "CRS-001", title: "Dropshipping Fundamentals", category: "Getting Started", lessons: 12, enrolled: 2456, completionRate: 78, status: "published", instructor: "Lakshay Takkar",
    modules: [
      { id: "MOD-001", title: "Introduction to Dropshipping", description: "Learn the basics of the dropshipping business model", isPreview: true, chapters: [
        { id: "CH-001", title: "What is Dropshipping?", contentType: "video", videoUrl: "https://example.com/v1", duration: "18m", isPreview: true },
        { id: "CH-002", title: "How the Supply Chain Works", contentType: "video", videoUrl: "https://example.com/v2", duration: "22m", isPreview: false },
        { id: "CH-003", title: "Quiz: Dropshipping Basics", contentType: "quiz", duration: "15m", isPreview: false },
      ]},
      { id: "MOD-002", title: "Niche Selection & Market Research", description: "Find profitable niches and validate product ideas", isPreview: false, chapters: [
        { id: "CH-004", title: "How to Pick a Niche", contentType: "video", videoUrl: "https://example.com/v3", duration: "25m", isPreview: false },
        { id: "CH-005", title: "Market Research Guide", contentType: "text", duration: "12m", isPreview: false },
        { id: "CH-006", title: "Validating Product Ideas", contentType: "video", videoUrl: "https://example.com/v4", duration: "20m", isPreview: false },
      ]},
      { id: "MOD-003", title: "Setting Up Your Store", description: "Step-by-step Shopify store setup", isPreview: false, chapters: [
        { id: "CH-007", title: "Shopify Account Setup", contentType: "video", videoUrl: "https://example.com/v5", duration: "15m", isPreview: false },
        { id: "CH-008", title: "Theme Customization", contentType: "video", videoUrl: "https://example.com/v6", duration: "28m", isPreview: false },
        { id: "CH-009", title: "Adding Products", contentType: "video", videoUrl: "https://example.com/v7", duration: "18m", isPreview: false },
        { id: "CH-010", title: "Store Setup Checklist", contentType: "text", duration: "8m", isPreview: false },
        { id: "CH-011", title: "Payment & Shipping Config", contentType: "video", videoUrl: "https://example.com/v8", duration: "22m", isPreview: false },
        { id: "CH-012", title: "Final Quiz", contentType: "quiz", duration: "20m", isPreview: false },
      ]},
    ],
  },
  {
    id: "CRS-002", title: "Finding Winning Products", category: "Product Research", lessons: 8, enrolled: 1890, completionRate: 65, status: "published", instructor: "Lakshay Takkar",
    modules: [
      { id: "MOD-004", title: "Product Research Foundations", description: "Core concepts of product research", isPreview: true, chapters: [
        { id: "CH-013", title: "What Makes a Winning Product?", contentType: "video", videoUrl: "https://example.com/v9", duration: "20m", isPreview: true },
        { id: "CH-014", title: "Criteria Checklist", contentType: "text", duration: "10m", isPreview: true },
      ]},
      { id: "MOD-005", title: "Research Tools & Methods", description: "Use tools to find trending products", isPreview: false, chapters: [
        { id: "CH-015", title: "Using AliExpress for Research", contentType: "video", videoUrl: "https://example.com/v10", duration: "25m", isPreview: false },
        { id: "CH-016", title: "TikTok & Instagram Spy", contentType: "video", videoUrl: "https://example.com/v11", duration: "22m", isPreview: false },
        { id: "CH-017", title: "Competitor Analysis", contentType: "video", videoUrl: "https://example.com/v12", duration: "18m", isPreview: false },
        { id: "CH-018", title: "Product Research Quiz", contentType: "quiz", duration: "15m", isPreview: false },
      ]},
      { id: "MOD-006", title: "Validating & Testing", description: "Test products before scaling", isPreview: false, chapters: [
        { id: "CH-019", title: "Minimum Viable Testing", contentType: "video", videoUrl: "https://example.com/v13", duration: "20m", isPreview: false },
        { id: "CH-020", title: "Reading the Data", contentType: "text", duration: "12m", isPreview: false },
      ]},
    ],
  },
  {
    id: "CRS-003", title: "Facebook Ads Mastery", category: "Marketing", lessons: 15, enrolled: 1234, completionRate: 52, status: "published", instructor: "Vikram Singh",
    modules: [
      { id: "MOD-007", title: "Facebook Ads Basics", description: "Getting started with Facebook advertising", isPreview: true, chapters: [
        { id: "CH-021", title: "Setting Up Business Manager", contentType: "video", videoUrl: "https://example.com/v14", duration: "15m", isPreview: true },
        { id: "CH-022", title: "Understanding Ad Structure", contentType: "video", videoUrl: "https://example.com/v15", duration: "20m", isPreview: false },
        { id: "CH-023", title: "Pixel Installation Guide", contentType: "text", duration: "10m", isPreview: false },
      ]},
      { id: "MOD-008", title: "Campaign Strategy", description: "Build effective ad campaigns", isPreview: false, chapters: [
        { id: "CH-024", title: "Campaign Objectives Explained", contentType: "video", videoUrl: "https://example.com/v16", duration: "18m", isPreview: false },
        { id: "CH-025", title: "Audience Targeting Deep Dive", contentType: "video", videoUrl: "https://example.com/v17", duration: "28m", isPreview: false },
        { id: "CH-026", title: "Budgeting & Bidding", contentType: "video", videoUrl: "https://example.com/v18", duration: "22m", isPreview: false },
        { id: "CH-027", title: "Strategy Quiz", contentType: "quiz", duration: "15m", isPreview: false },
      ]},
      { id: "MOD-009", title: "Creative & Copy", description: "Create high-converting ads", isPreview: false, chapters: [
        { id: "CH-028", title: "Writing Ad Copy That Converts", contentType: "video", videoUrl: "https://example.com/v19", duration: "25m", isPreview: false },
        { id: "CH-029", title: "Video Ad Creation", contentType: "video", videoUrl: "https://example.com/v20", duration: "30m", isPreview: false },
        { id: "CH-030", title: "A/B Testing Framework", contentType: "text", duration: "12m", isPreview: false },
      ]},
      { id: "MOD-010", title: "Scaling & Optimization", description: "Scale winning campaigns profitably", isPreview: false, chapters: [
        { id: "CH-031", title: "When to Scale", contentType: "video", videoUrl: "https://example.com/v21", duration: "18m", isPreview: false },
        { id: "CH-032", title: "Horizontal vs Vertical Scaling", contentType: "video", videoUrl: "https://example.com/v22", duration: "22m", isPreview: false },
        { id: "CH-033", title: "CBO vs ABO Strategy", contentType: "video", videoUrl: "https://example.com/v23", duration: "20m", isPreview: false },
        { id: "CH-034", title: "Retargeting Mastery", contentType: "video", videoUrl: "https://example.com/v24", duration: "24m", isPreview: false },
        { id: "CH-035", title: "Final Assessment", contentType: "quiz", duration: "20m", isPreview: false },
      ]},
    ],
  },
  {
    id: "CRS-004", title: "Shopify Store Setup A-Z", category: "Store Building", lessons: 10, enrolled: 3120, completionRate: 84, status: "published", instructor: "Karan Gupta",
    modules: [
      { id: "MOD-011", title: "Store Foundation", description: "Set up your Shopify account and basics", isPreview: true, chapters: [
        { id: "CH-036", title: "Creating Your Shopify Account", contentType: "video", videoUrl: "https://example.com/v25", duration: "12m", isPreview: true },
        { id: "CH-037", title: "Choosing the Right Plan", contentType: "text", duration: "8m", isPreview: true },
        { id: "CH-038", title: "Store Settings Walkthrough", contentType: "video", videoUrl: "https://example.com/v26", duration: "20m", isPreview: false },
      ]},
      { id: "MOD-012", title: "Design & Branding", description: "Make your store look professional", isPreview: false, chapters: [
        { id: "CH-039", title: "Selecting a Theme", contentType: "video", videoUrl: "https://example.com/v27", duration: "18m", isPreview: false },
        { id: "CH-040", title: "Logo & Brand Colors", contentType: "video", videoUrl: "https://example.com/v28", duration: "15m", isPreview: false },
        { id: "CH-041", title: "Homepage Design Tips", contentType: "text", duration: "10m", isPreview: false },
        { id: "CH-042", title: "Product Page Optimization", contentType: "video", videoUrl: "https://example.com/v29", duration: "25m", isPreview: false },
      ]},
      { id: "MOD-013", title: "Launch Checklist", description: "Everything to check before going live", isPreview: false, chapters: [
        { id: "CH-043", title: "Payment Gateway Setup", contentType: "video", videoUrl: "https://example.com/v30", duration: "14m", isPreview: false },
        { id: "CH-044", title: "Shipping Configuration", contentType: "video", videoUrl: "https://example.com/v31", duration: "16m", isPreview: false },
        { id: "CH-045", title: "Launch Quiz", contentType: "quiz", duration: "12m", isPreview: false },
      ]},
    ],
  },
  {
    id: "CRS-005", title: "TikTok Ads for Ecommerce", category: "Marketing", lessons: 9, enrolled: 987, completionRate: 45, status: "published", instructor: "Sneha Patel",
    modules: [
      { id: "MOD-014", title: "TikTok Ads Setup", description: "Get started with TikTok advertising", isPreview: true, chapters: [
        { id: "CH-046", title: "Creating TikTok Business Account", contentType: "video", videoUrl: "https://example.com/v32", duration: "14m", isPreview: true },
        { id: "CH-047", title: "TikTok Pixel Setup", contentType: "video", videoUrl: "https://example.com/v33", duration: "18m", isPreview: false },
      ]},
      { id: "MOD-015", title: "Creating TikTok-Style Ads", description: "Native-looking ads that convert", isPreview: false, chapters: [
        { id: "CH-048", title: "UGC-Style Content", contentType: "video", videoUrl: "https://example.com/v34", duration: "22m", isPreview: false },
        { id: "CH-049", title: "Hook Frameworks", contentType: "text", duration: "10m", isPreview: false },
        { id: "CH-050", title: "Video Editing for TikTok", contentType: "video", videoUrl: "https://example.com/v35", duration: "28m", isPreview: false },
        { id: "CH-051", title: "TikTok Ad Quiz", contentType: "quiz", duration: "12m", isPreview: false },
      ]},
      { id: "MOD-016", title: "Scaling on TikTok", description: "Scale your winning TikTok campaigns", isPreview: false, chapters: [
        { id: "CH-052", title: "Smart Performance Campaigns", contentType: "video", videoUrl: "https://example.com/v36", duration: "20m", isPreview: false },
        { id: "CH-053", title: "Budget Scaling Framework", contentType: "video", videoUrl: "https://example.com/v37", duration: "18m", isPreview: false },
        { id: "CH-054", title: "Analytics & Optimization", contentType: "video", videoUrl: "https://example.com/v38", duration: "24m", isPreview: false },
      ]},
    ],
  },
  {
    id: "CRS-006", title: "Supplier Negotiation Tactics", category: "Operations", lessons: 6, enrolled: 654, completionRate: 71, status: "published", instructor: "Lakshay Takkar",
    modules: [
      { id: "MOD-017", title: "Finding Quality Suppliers", description: "Source reliable suppliers", isPreview: true, chapters: [
        { id: "CH-055", title: "Supplier Sourcing Platforms", contentType: "video", videoUrl: "https://example.com/v39", duration: "20m", isPreview: true },
        { id: "CH-056", title: "Vetting Suppliers Checklist", contentType: "text", duration: "10m", isPreview: false },
      ]},
      { id: "MOD-018", title: "Negotiation Strategies", description: "Get the best terms from suppliers", isPreview: false, chapters: [
        { id: "CH-057", title: "Price Negotiation Tactics", contentType: "video", videoUrl: "https://example.com/v40", duration: "25m", isPreview: false },
        { id: "CH-058", title: "MOQ & Shipping Terms", contentType: "video", videoUrl: "https://example.com/v41", duration: "18m", isPreview: false },
        { id: "CH-059", title: "Building Long-Term Relationships", contentType: "video", videoUrl: "https://example.com/v42", duration: "22m", isPreview: false },
        { id: "CH-060", title: "Negotiation Quiz", contentType: "quiz", duration: "15m", isPreview: false },
      ]},
    ],
  },
  {
    id: "CRS-007", title: "AI-Powered Product Photography", category: "AI Tools", lessons: 7, enrolled: 876, completionRate: 59, status: "published", instructor: "Vikram Singh",
    modules: [
      { id: "MOD-019", title: "AI Photography Basics", description: "Introduction to AI image tools", isPreview: true, chapters: [
        { id: "CH-061", title: "AI Image Generation Overview", contentType: "video", videoUrl: "https://example.com/v43", duration: "16m", isPreview: true },
        { id: "CH-062", title: "Prompt Engineering for Products", contentType: "video", videoUrl: "https://example.com/v44", duration: "22m", isPreview: false },
      ]},
      { id: "MOD-020", title: "Advanced Techniques", description: "Master AI product photography", isPreview: false, chapters: [
        { id: "CH-063", title: "Background Removal & Replacement", contentType: "video", videoUrl: "https://example.com/v45", duration: "20m", isPreview: false },
        { id: "CH-064", title: "Lifestyle Scene Generation", contentType: "video", videoUrl: "https://example.com/v46", duration: "25m", isPreview: false },
        { id: "CH-065", title: "Batch Processing Workflow", contentType: "text", duration: "12m", isPreview: false },
        { id: "CH-066", title: "Quality Comparison Guide", contentType: "video", videoUrl: "https://example.com/v47", duration: "18m", isPreview: false },
        { id: "CH-067", title: "AI Photo Quiz", contentType: "quiz", duration: "10m", isPreview: false },
      ]},
    ],
  },
  {
    id: "CRS-008", title: "Scaling to $10K/Month", category: "Growth", lessons: 11, enrolled: 1567, completionRate: 38, status: "published", instructor: "Lakshay Takkar",
    modules: [
      { id: "MOD-021", title: "Growth Foundations", description: "Prepare your business for scaling", isPreview: true, chapters: [
        { id: "CH-068", title: "When to Start Scaling", contentType: "video", videoUrl: "https://example.com/v48", duration: "18m", isPreview: true },
        { id: "CH-069", title: "Metrics That Matter", contentType: "text", duration: "10m", isPreview: false },
        { id: "CH-070", title: "Revenue vs Profit Mindset", contentType: "video", videoUrl: "https://example.com/v49", duration: "20m", isPreview: false },
      ]},
      { id: "MOD-022", title: "Multi-Channel Strategy", description: "Diversify your traffic sources", isPreview: false, chapters: [
        { id: "CH-071", title: "Google Ads for Scaling", contentType: "video", videoUrl: "https://example.com/v50", duration: "25m", isPreview: false },
        { id: "CH-072", title: "Email Marketing Funnels", contentType: "video", videoUrl: "https://example.com/v51", duration: "22m", isPreview: false },
        { id: "CH-073", title: "Influencer Partnerships", contentType: "video", videoUrl: "https://example.com/v52", duration: "20m", isPreview: false },
        { id: "CH-074", title: "Multi-Channel Quiz", contentType: "quiz", duration: "15m", isPreview: false },
      ]},
      { id: "MOD-023", title: "Operations at Scale", description: "Manage growing operations efficiently", isPreview: false, chapters: [
        { id: "CH-075", title: "Hiring VAs & Team Building", contentType: "video", videoUrl: "https://example.com/v53", duration: "22m", isPreview: false },
        { id: "CH-076", title: "Automation Tools Overview", contentType: "text", duration: "12m", isPreview: false },
        { id: "CH-077", title: "Customer Service at Scale", contentType: "video", videoUrl: "https://example.com/v54", duration: "18m", isPreview: false },
        { id: "CH-078", title: "Final Growth Assessment", contentType: "quiz", duration: "20m", isPreview: false },
      ]},
    ],
  },
  {
    id: "CRS-009", title: "Google Ads for Dropshipping", category: "Marketing", lessons: 13, enrolled: 432, completionRate: 28, status: "draft", instructor: "Karan Gupta",
    modules: [
      { id: "MOD-024", title: "Google Ads Fundamentals", description: "Getting started with Google advertising", isPreview: true, chapters: [
        { id: "CH-079", title: "Google Ads Account Setup", contentType: "video", videoUrl: "https://example.com/v55", duration: "15m", isPreview: true },
        { id: "CH-080", title: "Campaign Types Explained", contentType: "video", videoUrl: "https://example.com/v56", duration: "20m", isPreview: false },
        { id: "CH-081", title: "Keyword Research Basics", contentType: "text", duration: "12m", isPreview: false },
      ]},
      { id: "MOD-025", title: "Shopping Campaigns", description: "Set up Google Shopping for dropshipping", isPreview: false, chapters: [
        { id: "CH-082", title: "Merchant Center Setup", contentType: "video", videoUrl: "https://example.com/v57", duration: "22m", isPreview: false },
        { id: "CH-083", title: "Product Feed Optimization", contentType: "video", videoUrl: "https://example.com/v58", duration: "25m", isPreview: false },
        { id: "CH-084", title: "Smart Shopping vs Standard", contentType: "video", videoUrl: "https://example.com/v59", duration: "18m", isPreview: false },
      ]},
      { id: "MOD-026", title: "Performance Max", description: "Master PMax campaigns", isPreview: false, chapters: [
        { id: "CH-085", title: "PMax Campaign Setup", contentType: "video", videoUrl: "https://example.com/v60", duration: "20m", isPreview: false },
        { id: "CH-086", title: "Asset Groups Strategy", contentType: "video", videoUrl: "https://example.com/v61", duration: "22m", isPreview: false },
        { id: "CH-087", title: "Audience Signals", contentType: "text", duration: "10m", isPreview: false },
        { id: "CH-088", title: "Budget Allocation", contentType: "video", videoUrl: "https://example.com/v62", duration: "16m", isPreview: false },
      ]},
      { id: "MOD-027", title: "Analytics & Optimization", description: "Read data and optimize campaigns", isPreview: false, chapters: [
        { id: "CH-089", title: "Conversion Tracking", contentType: "video", videoUrl: "https://example.com/v63", duration: "18m", isPreview: false },
        { id: "CH-090", title: "Google Analytics Integration", contentType: "video", videoUrl: "https://example.com/v64", duration: "22m", isPreview: false },
        { id: "CH-091", title: "Google Ads Quiz", contentType: "quiz", duration: "20m", isPreview: false },
      ]},
    ],
  },
  {
    id: "CRS-010", title: "Advanced Fulfillment Strategies", category: "Operations", lessons: 8, enrolled: 0, completionRate: 0, status: "draft", instructor: "Sneha Patel",
    modules: [
      { id: "MOD-028", title: "Fulfillment Models", description: "Understanding different fulfillment approaches", isPreview: true, chapters: [
        { id: "CH-092", title: "Dropshipping vs 3PL vs Hybrid", contentType: "video", videoUrl: "https://example.com/v65", duration: "20m", isPreview: true },
        { id: "CH-093", title: "Cost Comparison Framework", contentType: "text", duration: "12m", isPreview: false },
      ]},
      { id: "MOD-029", title: "Speed Optimization", description: "Reduce shipping times dramatically", isPreview: false, chapters: [
        { id: "CH-094", title: "US Warehouse Sourcing", contentType: "video", videoUrl: "https://example.com/v66", duration: "22m", isPreview: false },
        { id: "CH-095", title: "Agent vs Direct Supplier", contentType: "video", videoUrl: "https://example.com/v67", duration: "18m", isPreview: false },
        { id: "CH-096", title: "Tracking & Communication", contentType: "video", videoUrl: "https://example.com/v68", duration: "15m", isPreview: false },
      ]},
      { id: "MOD-030", title: "Returns & Quality Control", description: "Handle returns and maintain quality", isPreview: false, chapters: [
        { id: "CH-097", title: "Return Policy Design", contentType: "text", duration: "10m", isPreview: false },
        { id: "CH-098", title: "Quality Inspection Process", contentType: "video", videoUrl: "https://example.com/v69", duration: "20m", isPreview: false },
        { id: "CH-099", title: "Fulfillment Quiz", contentType: "quiz", duration: "15m", isPreview: false },
      ]},
    ],
  },
];

export const revenueMetrics: RevenueMetric[] = [
  { month: "Sep", mrr: 8900, newSubscriptions: 45, churn: 8, revenue: 8900 },
  { month: "Oct", mrr: 10200, newSubscriptions: 52, churn: 11, revenue: 10200 },
  { month: "Nov", mrr: 11800, newSubscriptions: 61, churn: 9, revenue: 11800 },
  { month: "Dec", mrr: 12500, newSubscriptions: 48, churn: 14, revenue: 12500 },
  { month: "Jan", mrr: 13900, newSubscriptions: 67, churn: 12, revenue: 13900 },
  { month: "Feb", mrr: 15200, newSubscriptions: 73, churn: 10, revenue: 15200 },
];

export const planTiers: PlanTier[] = [
  { id: "PLN-001", name: "Free", price: 0, features: ["5 product imports", "Basic research", "Community access"], userCount: 4520, revenue: 0 },
  { id: "PLN-002", name: "Starter", price: 29, features: ["50 product imports", "Advanced research", "1 store connection", "Email support", "Basic analytics"], userCount: 1890, revenue: 54810 },
  { id: "PLN-003", name: "Pro", price: 79, features: ["Unlimited imports", "AI Ad Studio", "3 store connections", "Priority support", "Competitor spy", "Advanced analytics"], userCount: 2340, revenue: 184860 },
  { id: "PLN-004", name: "Enterprise", price: 199, features: ["Everything in Pro", "Unlimited stores", "Dedicated account manager", "Custom integrations", "API access", "White-label options"], userCount: 156, revenue: 31044 },
];

export const pipelineFunnel: PipelineFunnelStage[] = [
  { stage: "signup", label: "Signed Up", count: 1248, color: "#6366f1" },
  { stage: "engaged", label: "Engaged", count: 843, color: "#8b5cf6" },
  { stage: "trial", label: "Trial Started", count: 512, color: "#a855f7" },
  { stage: "paying", label: "Paying", count: 287, color: "#10b981" },
  { stage: "churned", label: "Churned", count: 64, color: "#ef4444" },
];

export const llcStatusBreakdown: LLCStatusEntry[] = [
  { stage: "pending", label: "Pending", count: 18, color: "#94a3b8" },
  { stage: "filed", label: "Filed", count: 24, color: "#6366f1" },
  { stage: "ein_applied", label: "EIN Applied", count: 15, color: "#8b5cf6" },
  { stage: "boi_filed", label: "BOI Filed", count: 12, color: "#a855f7" },
  { stage: "bank_setup", label: "Bank Setup", count: 9, color: "#0ea5e9" },
  { stage: "stripe_setup", label: "Stripe Setup", count: 7, color: "#f59e0b" },
  { stage: "complete", label: "Complete", count: 42, color: "#10b981" },
];

export const stalledClients: StalledClient[] = [
  { id: "SC-001", name: "Diego Costa", email: "diego@shopbrasil.com.br", batch: "Batch 12", lastActive: "2025-02-14", daysSinceActivity: 13, llcStage: "EIN Applied", progress: 35 },
  { id: "SC-002", name: "Sophie Dubois", email: "sophie@chicmarket.fr", batch: "Batch 10", lastActive: "2025-02-16", daysSinceActivity: 11, llcStage: "Filed", progress: 20 },
  { id: "SC-003", name: "Tom Bradley", email: "tom@gadgetguru.store", batch: "Batch 14", lastActive: "2025-02-18", daysSinceActivity: 9, llcStage: "Pending", progress: 5 },
  { id: "SC-004", name: "Olivia Brown", email: "olivia@homevibes.com", batch: "Batch 14", lastActive: "2025-02-19", daysSinceActivity: 8, llcStage: "Pending", progress: 8 },
  { id: "SC-005", name: "Emma Wilson", email: "emma@beautybox.co.uk", batch: "Batch 13", lastActive: "2025-02-17", daysSinceActivity: 10, llcStage: "Bank Setup", progress: 62 },
];

export const recentActivityFeed: ActivityFeedItem[] = [
  { id: "ACT-001", type: "signup", user: "Peter Schmidt", description: "signed up for a free account", timestamp: "2025-02-27T14:32:00Z" },
  { id: "ACT-002", type: "payment", user: "Sarah Chen", description: "renewed Pro plan ($79/mo)", timestamp: "2025-02-27T13:15:00Z", meta: "$79.00" },
  { id: "ACT-003", type: "llc_update", user: "Raj Patel", description: "LLC moved to Bank Setup stage", timestamp: "2025-02-27T12:45:00Z", meta: "Bank Setup" },
  { id: "ACT-004", type: "course_complete", user: "Yuki Tanaka", description: "completed 'Shopify Store Setup A-Z'", timestamp: "2025-02-27T11:20:00Z" },
  { id: "ACT-005", type: "ticket", user: "Alex Turner", description: "opened ticket: Bulk import CSV format error", timestamp: "2025-02-27T10:58:00Z", meta: "High" },
  { id: "ACT-006", type: "store_connect", user: "Fatima Al-Rashid", description: "connected new Shopify store 'Gulf Goods Premium'", timestamp: "2025-02-27T10:30:00Z" },
  { id: "ACT-007", type: "login", user: "Marcus Rodriguez", description: "logged in from New York, US", timestamp: "2025-02-27T09:45:00Z" },
  { id: "ACT-008", type: "payment", user: "Lin Wei", description: "upgraded to Enterprise plan ($199/mo)", timestamp: "2025-02-27T09:12:00Z", meta: "$199.00" },
  { id: "ACT-009", type: "llc_update", user: "Jake Miller", description: "LLC moved to EIN Applied stage", timestamp: "2025-02-27T08:30:00Z", meta: "EIN Applied" },
  { id: "ACT-010", type: "signup", user: "Kevin O'Brien", description: "signed up via blog referral", timestamp: "2025-02-27T07:55:00Z" },
  { id: "ACT-011", type: "course_complete", user: "Aisha Khan", description: "completed 'Finding Winning Products'", timestamp: "2025-02-26T22:10:00Z" },
  { id: "ACT-012", type: "ticket", user: "Tom Bradley", description: "opened ticket: Cannot connect Shopify store", timestamp: "2025-02-26T21:30:00Z", meta: "High" },
  { id: "ACT-013", type: "store_connect", user: "Priya Sharma", description: "connected first Shopify store", timestamp: "2025-02-26T20:15:00Z" },
  { id: "ACT-014", type: "payment", user: "Jake Miller", description: "paid Pro plan renewal ($79/mo)", timestamp: "2025-02-26T18:45:00Z", meta: "$79.00" },
  { id: "ACT-015", type: "llc_update", user: "Sarah Chen", description: "LLC marked Complete", timestamp: "2025-02-26T17:20:00Z", meta: "Complete" },
];

export const batches: Batch[] = [
  { id: "BAT-001", name: "Alpha Cohort", startDate: "2024-09-01", memberCount: 8, status: "completed" },
  { id: "BAT-002", name: "Beta Cohort", startDate: "2024-11-15", memberCount: 6, status: "completed" },
  { id: "BAT-003", name: "Gamma Cohort", startDate: "2025-01-10", memberCount: 7, status: "active" },
  { id: "BAT-004", name: "Delta Cohort", startDate: "2025-02-01", memberCount: 5, status: "active" },
  { id: "BAT-005", name: "Epsilon Cohort", startDate: "2025-03-01", memberCount: 4, status: "active" },
];

export const clients: Client[] = [
  { id: "CLI-001", name: "Sarah Chen", email: "sarah@ecomstore.com", phone: "+1 (415) 555-0101", batchId: "BAT-001", batchName: "Alpha Cohort", weekNumber: 24, progress: 95, llcStatus: "complete", status: "graduated", lastActive: "2025-02-27", plan: "pro", joinDate: "2024-08-15" },
  { id: "CLI-002", name: "Marcus Rodriguez", email: "marcus@dropworld.io", phone: "+1 (305) 555-0202", batchId: "BAT-001", batchName: "Alpha Cohort", weekNumber: 24, progress: 100, llcStatus: "complete", status: "graduated", lastActive: "2025-02-27", plan: "enterprise", joinDate: "2024-06-20" },
  { id: "CLI-003", name: "Priya Sharma", email: "priya@quickshop.in", phone: "+91 98765 43210", batchId: "BAT-002", batchName: "Beta Cohort", weekNumber: 16, progress: 72, llcStatus: "stripe_setup", status: "active", lastActive: "2025-02-25", plan: "starter", joinDate: "2024-11-10" },
  { id: "CLI-004", name: "Jake Miller", email: "jake@trendyfinds.com", phone: "+1 (212) 555-0404", batchId: "BAT-002", batchName: "Beta Cohort", weekNumber: 16, progress: 68, llcStatus: "bank_setup", status: "active", lastActive: "2025-02-27", plan: "pro", joinDate: "2024-09-05" },
  { id: "CLI-005", name: "Aisha Khan", email: "aisha@luxedrops.co", phone: "+971 50 555 0505", batchId: "BAT-003", batchName: "Gamma Cohort", weekNumber: 8, progress: 45, llcStatus: "boi_filed", status: "active", lastActive: "2025-02-24", plan: "pro", joinDate: "2024-10-18" },
  { id: "CLI-006", name: "Tom Bradley", email: "tom@gadgetguru.store", phone: "+1 (646) 555-0606", batchId: "BAT-003", batchName: "Gamma Cohort", weekNumber: 8, progress: 30, llcStatus: "ein_applied", status: "stalled", lastActive: "2025-02-15", plan: "free", joinDate: "2025-02-10" },
  { id: "CLI-007", name: "Lin Wei", email: "lin@megastore.cn", phone: "+86 138 0000 7777", batchId: "BAT-001", batchName: "Alpha Cohort", weekNumber: 24, progress: 100, llcStatus: "complete", status: "graduated", lastActive: "2025-02-27", plan: "enterprise", joinDate: "2024-04-12" },
  { id: "CLI-008", name: "Emma Wilson", email: "emma@beautybox.co.uk", phone: "+44 7700 900808", batchId: "BAT-003", batchName: "Gamma Cohort", weekNumber: 8, progress: 40, llcStatus: "filed", status: "stalled", lastActive: "2025-02-12", plan: "starter", joinDate: "2024-12-01" },
  { id: "CLI-009", name: "Raj Patel", email: "raj@fastship.in", phone: "+91 99887 76655", batchId: "BAT-002", batchName: "Beta Cohort", weekNumber: 16, progress: 82, llcStatus: "stripe_setup", status: "active", lastActive: "2025-02-27", plan: "pro", joinDate: "2024-09-30" },
  { id: "CLI-010", name: "Yuki Tanaka", email: "yuki@tokyotrends.jp", phone: "+81 90 1234 5678", batchId: "BAT-004", batchName: "Delta Cohort", weekNumber: 4, progress: 22, llcStatus: "pending", status: "active", lastActive: "2025-02-26", plan: "starter", joinDate: "2025-01-05" },
  { id: "CLI-011", name: "Olivia Brown", email: "olivia@homevibes.com", phone: "+1 (503) 555-1111", batchId: "BAT-004", batchName: "Delta Cohort", weekNumber: 4, progress: 15, llcStatus: "pending", status: "stalled", lastActive: "2025-02-10", plan: "free", joinDate: "2025-02-18" },
  { id: "CLI-012", name: "Alex Turner", email: "alex@dropzone.com.au", phone: "+61 4 1234 5678", batchId: "BAT-001", batchName: "Alpha Cohort", weekNumber: 24, progress: 98, llcStatus: "complete", status: "graduated", lastActive: "2025-02-27", plan: "enterprise", joinDate: "2024-05-15" },
  { id: "CLI-013", name: "Fatima Al-Rashid", email: "fatima@gulfgoods.ae", phone: "+971 55 555 1313", batchId: "BAT-003", batchName: "Gamma Cohort", weekNumber: 8, progress: 55, llcStatus: "ein_applied", status: "active", lastActive: "2025-02-26", plan: "pro", joinDate: "2024-11-20" },
  { id: "CLI-014", name: "Diego Costa", email: "diego@shopbrasil.com.br", phone: "+55 11 98765 4321", batchId: "BAT-002", batchName: "Beta Cohort", weekNumber: 16, progress: 35, llcStatus: "filed", status: "paused", lastActive: "2025-01-15", plan: "pro", joinDate: "2024-07-22" },
  { id: "CLI-015", name: "Kevin O'Brien", email: "kevin@irishdrops.ie", phone: "+353 87 123 4567", batchId: "BAT-005", batchName: "Epsilon Cohort", weekNumber: 1, progress: 5, llcStatus: "pending", status: "active", lastActive: "2025-02-27", plan: "starter", joinDate: "2025-03-01" },
  { id: "CLI-016", name: "Samantha Lee", email: "sam@beautydrops.com", phone: "+1 (310) 555-1616", batchId: "BAT-004", batchName: "Delta Cohort", weekNumber: 4, progress: 28, llcStatus: "filed", status: "active", lastActive: "2025-02-25", plan: "pro", joinDate: "2025-02-01" },
  { id: "CLI-017", name: "Peter Schmidt", email: "peter@eurodrop.de", phone: "+49 170 1234567", batchId: "BAT-005", batchName: "Epsilon Cohort", weekNumber: 1, progress: 8, llcStatus: "pending", status: "active", lastActive: "2025-02-26", plan: "starter", joinDate: "2025-03-01" },
  { id: "CLI-018", name: "Maria Garcia", email: "maria@tiendaonline.es", phone: "+34 612 345 678", batchId: "BAT-005", batchName: "Epsilon Cohort", weekNumber: 1, progress: 10, llcStatus: "pending", status: "active", lastActive: "2025-02-27", plan: "pro", joinDate: "2025-03-01" },
];

export const LLC_STAGES: { key: LLCStage; label: string; color: string; bg: string }[] = [
  { key: "pending", label: "Pending", color: "#64748b", bg: "#f1f5f9" },
  { key: "filed", label: "Filed", color: "#0284c7", bg: "#e0f2fe" },
  { key: "ein_applied", label: "EIN Applied", color: "#7c3aed", bg: "#ede9fe" },
  { key: "boi_filed", label: "BOI Filed", color: "#d97706", bg: "#fef3c7" },
  { key: "bank_setup", label: "Bank Setup", color: "#ea580c", bg: "#ffedd5" },
  { key: "stripe_setup", label: "Stripe Setup", color: "#0891b2", bg: "#cffafe" },
  { key: "complete", label: "Complete", color: "#059669", bg: "#d1fae5" },
];

export const LLC_WHATSAPP_TEMPLATES: Record<LLCStage, string> = {
  pending: "Hi {name}, your LLC application has been received. We'll begin processing shortly. Stay tuned!",
  filed: "Hi {name}, great news! Your LLC ({llcName}) has been filed in {state}. We're now moving to the EIN application stage.",
  ein_applied: "Hi {name}, your EIN application for {llcName} has been submitted. This typically takes 3-5 business days. We'll update you once it's approved.",
  boi_filed: "Hi {name}, your BOI (Beneficial Ownership Information) report for {llcName} has been filed with FinCEN. Moving to bank setup next!",
  bank_setup: "Hi {name}, time to set up your business bank account for {llcName}. Please check your email for the setup instructions.",
  stripe_setup: "Hi {name}, your bank is all set! Now we're connecting Stripe for {llcName}. You'll be ready to accept payments soon!",
  complete: "Hi {name}, congratulations! Your LLC ({llcName}) is fully set up - LLC filed, EIN received, BOI filed, bank ready, and Stripe connected. You're good to go!",
};

export const llcApplications: LLCApplication[] = [
  { id: "LLC-001", clientName: "Sarah Chen", clientEmail: "sarah@ecomstore.com", phone: "+1-555-0101", stage: "complete", llcName: "Chen Ecommerce LLC", state: "Wyoming", appliedDate: "2024-11-15", lastUpdated: "2025-01-20", daysInStage: 0, milestones: { pending: "2024-11-15", filed: "2024-11-22", ein_applied: "2024-12-01", boi_filed: "2024-12-10", bank_setup: "2024-12-20", stripe_setup: "2025-01-05", complete: "2025-01-20" }, notes: "Completed smoothly", assignedTo: "Karan Gupta" },
  { id: "LLC-002", clientName: "Marcus Rodriguez", clientEmail: "marcus@dropworld.io", phone: "+1-555-0102", stage: "complete", llcName: "DropWorld Ventures LLC", state: "Delaware", appliedDate: "2024-10-01", lastUpdated: "2024-12-15", daysInStage: 0, milestones: { pending: "2024-10-01", filed: "2024-10-08", ein_applied: "2024-10-18", boi_filed: "2024-10-28", bank_setup: "2024-11-10", stripe_setup: "2024-12-01", complete: "2024-12-15" }, notes: "Enterprise client, fast-tracked", assignedTo: "Vikram Singh" },
  { id: "LLC-003", clientName: "Jake Miller", clientEmail: "jake@trendyfinds.com", phone: "+1-555-0103", stage: "stripe_setup", llcName: "TrendyFinds Inc LLC", state: "Wyoming", appliedDate: "2025-01-10", lastUpdated: "2025-02-18", daysInStage: 9, milestones: { pending: "2025-01-10", filed: "2025-01-17", ein_applied: "2025-01-25", boi_filed: "2025-02-02", bank_setup: "2025-02-10", stripe_setup: "2025-02-18" }, notes: "Waiting for Stripe verification docs", assignedTo: "Karan Gupta" },
  { id: "LLC-004", clientName: "Aisha Khan", clientEmail: "aisha@luxedrops.co", phone: "+1-555-0104", stage: "bank_setup", llcName: "LuxeDrops Trading LLC", state: "Florida", appliedDate: "2025-01-20", lastUpdated: "2025-02-15", daysInStage: 12, milestones: { pending: "2025-01-20", filed: "2025-01-28", ein_applied: "2025-02-03", boi_filed: "2025-02-08", bank_setup: "2025-02-15" }, notes: "Bank requires additional address verification", assignedTo: "Sneha Patel" },
  { id: "LLC-005", clientName: "Raj Patel", clientEmail: "raj@fastship.in", phone: "+91-9876-5432", stage: "boi_filed", llcName: "FastShip Global LLC", state: "Wyoming", appliedDate: "2025-02-01", lastUpdated: "2025-02-20", daysInStage: 7, milestones: { pending: "2025-02-01", filed: "2025-02-07", ein_applied: "2025-02-13", boi_filed: "2025-02-20" }, notes: "International client, extra docs needed", assignedTo: "Vikram Singh" },
  { id: "LLC-006", clientName: "Emma Wilson", clientEmail: "emma@beautybox.co.uk", phone: "+44-7700-9001", stage: "ein_applied", llcName: "BeautyBox USA LLC", state: "Delaware", appliedDate: "2025-02-10", lastUpdated: "2025-02-22", daysInStage: 5, milestones: { pending: "2025-02-10", filed: "2025-02-15", ein_applied: "2025-02-22" }, notes: "UK-based client, needs ITIN first", assignedTo: "Karan Gupta" },
  { id: "LLC-007", clientName: "Lin Wei", clientEmail: "lin@megastore.cn", phone: "+86-138-0001", stage: "complete", llcName: "MegaStore US LLC", state: "Nevada", appliedDate: "2024-09-15", lastUpdated: "2024-11-28", daysInStage: 0, milestones: { pending: "2024-09-15", filed: "2024-09-22", ein_applied: "2024-10-01", boi_filed: "2024-10-12", bank_setup: "2024-10-25", stripe_setup: "2024-11-10", complete: "2024-11-28" }, notes: "Enterprise priority", assignedTo: "Vikram Singh" },
  { id: "LLC-008", clientName: "Fatima Al-Rashid", clientEmail: "fatima@gulfgoods.ae", phone: "+971-50-1234", stage: "filed", llcName: "Gulf Goods America LLC", state: "Wyoming", appliedDate: "2025-02-20", lastUpdated: "2025-02-25", daysInStage: 2, milestones: { pending: "2025-02-20", filed: "2025-02-25" }, notes: "New application, docs verified", assignedTo: "Sneha Patel" },
  { id: "LLC-009", clientName: "Alex Turner", clientEmail: "alex@dropzone.com.au", phone: "+61-4-1234-5678", stage: "stripe_setup", llcName: "DropZone Americas LLC", state: "Delaware", appliedDate: "2025-01-05", lastUpdated: "2025-02-12", daysInStage: 15, milestones: { pending: "2025-01-05", filed: "2025-01-12", ein_applied: "2025-01-20", boi_filed: "2025-01-28", bank_setup: "2025-02-05", stripe_setup: "2025-02-12" }, notes: "Stuck - Stripe needs additional verification for AU resident", assignedTo: "Karan Gupta" },
  { id: "LLC-010", clientName: "Priya Sharma", clientEmail: "priya@quickshop.in", phone: "+91-9123-4567", stage: "pending", llcName: "QuickShop US LLC", state: "Wyoming", appliedDate: "2025-02-26", lastUpdated: "2025-02-26", daysInStage: 1, milestones: { pending: "2025-02-26" }, notes: "Just submitted application, collecting documents", assignedTo: "Vikram Singh" },
  { id: "LLC-011", clientName: "Yuki Tanaka", clientEmail: "yuki@tokyotrends.jp", phone: "+81-90-1234-5678", stage: "pending", llcName: "Tokyo Trends USA LLC", state: "Florida", appliedDate: "2025-02-27", lastUpdated: "2025-02-27", daysInStage: 0, milestones: { pending: "2025-02-27" }, notes: "New application received today", assignedTo: "Sneha Patel" },
  { id: "LLC-012", clientName: "Tom Bradley", clientEmail: "tom@gadgetguru.store", phone: "+1-555-0112", stage: "ein_applied", llcName: "GadgetGuru Commerce LLC", state: "Wyoming", appliedDate: "2025-02-05", lastUpdated: "2025-02-16", daysInStage: 11, milestones: { pending: "2025-02-05", filed: "2025-02-10", ein_applied: "2025-02-16" }, notes: "EIN taking longer than usual, follow up with IRS", assignedTo: "Karan Gupta" },
  { id: "LLC-013", clientName: "Olivia Brown", clientEmail: "olivia@homevibes.com", phone: "+1-555-0113", stage: "filed", llcName: "HomeVibes Commerce LLC", state: "Delaware", appliedDate: "2025-02-22", lastUpdated: "2025-02-25", daysInStage: 2, milestones: { pending: "2025-02-22", filed: "2025-02-25" }, notes: "Filing confirmed, waiting for state approval", assignedTo: "Vikram Singh" },
  { id: "LLC-014", clientName: "Diego Costa", clientEmail: "diego@shopbrasil.com.br", phone: "+55-11-9876-5432", stage: "bank_setup", llcName: "ShopBrasil USA LLC", state: "Wyoming", appliedDate: "2024-12-15", lastUpdated: "2025-02-01", daysInStage: 26, milestones: { pending: "2024-12-15", filed: "2024-12-22", ein_applied: "2025-01-05", boi_filed: "2025-01-15", bank_setup: "2025-02-01" }, notes: "Stuck at bank - needs US address verification, client unresponsive", assignedTo: "Sneha Patel" },
];

export const mentorshipSessions: MentorshipSession[] = [
  { id: "MS-001", title: "Building Your First Shopify Store", url: "https://zoom.us/rec/share/abc123", category: "Store Setup", duration: "45 min", sessionDate: "2025-02-20", published: true, order: 1 },
  { id: "MS-002", title: "Product Research Masterclass", url: "https://zoom.us/rec/share/def456", category: "Product Research", duration: "60 min", sessionDate: "2025-02-18", published: true, order: 2 },
  { id: "MS-003", title: "Facebook Ads for Beginners", url: "https://zoom.us/rec/share/ghi789", category: "Marketing", duration: "55 min", sessionDate: "2025-02-15", published: true, order: 3 },
  { id: "MS-004", title: "Scaling with TikTok Ads", url: "https://zoom.us/rec/share/jkl012", category: "Marketing", duration: "50 min", sessionDate: "2025-02-13", published: true, order: 4 },
  { id: "MS-005", title: "Supplier Negotiation Live Demo", url: "https://zoom.us/rec/share/mno345", category: "Operations", duration: "40 min", sessionDate: "2025-02-10", published: true, order: 5 },
  { id: "MS-006", title: "LLC Formation Walkthrough", url: "https://zoom.us/rec/share/pqr678", category: "LLC & Legal", duration: "35 min", sessionDate: "2025-02-08", published: true, order: 6 },
  { id: "MS-007", title: "AI Product Photography Tutorial", url: "https://zoom.us/rec/share/stu901", category: "AI Tools", duration: "30 min", sessionDate: "2025-02-05", published: true, order: 7 },
  { id: "MS-008", title: "Monthly Q&A - February 2025", url: "https://zoom.us/rec/share/vwx234", category: "Q&A", duration: "90 min", sessionDate: "2025-02-01", published: true, order: 8 },
  { id: "MS-009", title: "Advanced Google Ads Strategy", url: "https://zoom.us/rec/share/yza567", category: "Marketing", duration: "65 min", sessionDate: "2025-01-28", published: true, order: 9 },
  { id: "MS-010", title: "EIN & BOI Filing Deep Dive", url: "https://zoom.us/rec/share/bcd890", category: "LLC & Legal", duration: "40 min", sessionDate: "2025-01-25", published: true, order: 10 },
  { id: "MS-011", title: "Finding Winning Products with AI", url: "https://zoom.us/rec/share/efg123", category: "AI Tools", duration: "50 min", sessionDate: "2025-01-22", published: false, order: 11 },
  { id: "MS-012", title: "Fulfillment & Shipping Optimization", url: "https://zoom.us/rec/share/hij456", category: "Operations", duration: "45 min", sessionDate: "2025-01-18", published: true, order: 12 },
  { id: "MS-013", title: "Store Setup: Theme Customization", url: "https://zoom.us/rec/share/klm789", category: "Store Setup", duration: "55 min", sessionDate: "2025-01-15", published: true, order: 13 },
  { id: "MS-014", title: "Monthly Q&A - January 2025", url: "https://zoom.us/rec/share/nop012", category: "Q&A", duration: "85 min", sessionDate: "2025-01-01", published: true, order: 14 },
  { id: "MS-015", title: "Competitor Analysis Workshop", url: "https://zoom.us/rec/share/qrs345", category: "Product Research", duration: "50 min", sessionDate: "2024-12-20", published: false, order: 15 },
];

export const onboardingModules: OnboardingModule[] = [
  {
    id: "MOD-001",
    title: "Introduction to Dropshipping",
    description: "Learn the fundamentals of dropshipping and how to get started with your first store.",
    status: "published",
    order: 1,
    videos: [
      { id: "VID-001", title: "What is Dropshipping?", description: "A beginner-friendly overview of the dropshipping business model.", videoUrl: "https://example.com/videos/what-is-dropshipping", thumbnailUrl: "/3d-icons/dashboard.webp", duration: "8:24", order: 1 },
      { id: "VID-002", title: "Why Start in 2025?", description: "Key trends and opportunities making dropshipping viable today.", videoUrl: "https://example.com/videos/why-start-2025", thumbnailUrl: "/3d-icons/dashboard.webp", duration: "6:15", order: 2 },
      { id: "VID-003", title: "Common Myths Debunked", description: "Clearing up misconceptions about dropshipping profitability.", videoUrl: "https://example.com/videos/myths-debunked", thumbnailUrl: "/3d-icons/dashboard.webp", duration: "10:02", order: 3 },
    ],
  },
  {
    id: "MOD-002",
    title: "Finding Winning Products",
    description: "Strategies for identifying high-demand, high-margin products to sell.",
    status: "published",
    order: 2,
    videos: [
      { id: "VID-004", title: "Product Research Basics", description: "Tools and methods for effective product research.", videoUrl: "https://example.com/videos/product-research", thumbnailUrl: "/3d-icons/candidates.webp", duration: "12:30", order: 1 },
      { id: "VID-005", title: "Using AliExpress for Research", description: "How to find trending products on AliExpress.", videoUrl: "https://example.com/videos/aliexpress-research", thumbnailUrl: "/3d-icons/candidates.webp", duration: "9:45", order: 2 },
      { id: "VID-006", title: "Spy Tools & Competitor Analysis", description: "Use spy tools to see what top sellers are doing.", videoUrl: "https://example.com/videos/spy-tools", thumbnailUrl: "/3d-icons/candidates.webp", duration: "14:18", order: 3 },
      { id: "VID-007", title: "Validating Product Demand", description: "How to confirm market demand before listing.", videoUrl: "https://example.com/videos/validate-demand", thumbnailUrl: "/3d-icons/candidates.webp", duration: "7:55", order: 4 },
    ],
  },
  {
    id: "MOD-003",
    title: "Setting Up Your Shopify Store",
    description: "Step-by-step guide to building a professional Shopify store from scratch.",
    status: "published",
    order: 3,
    videos: [
      { id: "VID-008", title: "Shopify Account Setup", description: "Creating and configuring your Shopify account.", videoUrl: "https://example.com/videos/shopify-setup", thumbnailUrl: "/3d-icons/departments.webp", duration: "11:20", order: 1 },
      { id: "VID-009", title: "Theme Selection & Customization", description: "Choosing the right theme and customizing it for conversions.", videoUrl: "https://example.com/videos/theme-customization", thumbnailUrl: "/3d-icons/departments.webp", duration: "15:45", order: 2 },
      { id: "VID-010", title: "Adding Products to Your Store", description: "How to import and list products properly.", videoUrl: "https://example.com/videos/adding-products", thumbnailUrl: "/3d-icons/departments.webp", duration: "8:30", order: 3 },
    ],
  },
  {
    id: "MOD-004",
    title: "Facebook & Instagram Ads",
    description: "Master paid advertising to drive targeted traffic to your store.",
    status: "published",
    order: 4,
    videos: [
      { id: "VID-011", title: "Ad Account Setup", description: "Setting up Facebook Business Manager and Ad accounts.", videoUrl: "https://example.com/videos/ad-account-setup", thumbnailUrl: "/3d-icons/job-postings.webp", duration: "9:10", order: 1 },
      { id: "VID-012", title: "Creating Your First Campaign", description: "Step-by-step guide to launching your first ad.", videoUrl: "https://example.com/videos/first-campaign", thumbnailUrl: "/3d-icons/job-postings.webp", duration: "18:22", order: 2 },
      { id: "VID-013", title: "Ad Creative That Converts", description: "Designing images and videos that drive sales.", videoUrl: "https://example.com/videos/ad-creative", thumbnailUrl: "/3d-icons/job-postings.webp", duration: "13:05", order: 3 },
      { id: "VID-014", title: "Scaling Winning Ads", description: "How to scale profitable campaigns without losing ROI.", videoUrl: "https://example.com/videos/scaling-ads", thumbnailUrl: "/3d-icons/job-postings.webp", duration: "16:40", order: 4 },
      { id: "VID-015", title: "Retargeting Strategies", description: "Re-engage visitors who did not purchase.", videoUrl: "https://example.com/videos/retargeting", thumbnailUrl: "/3d-icons/job-postings.webp", duration: "11:15", order: 5 },
    ],
  },
  {
    id: "MOD-005",
    title: "Order Fulfillment & Shipping",
    description: "Managing orders, shipping logistics, and customer expectations.",
    status: "draft",
    order: 5,
    videos: [
      { id: "VID-016", title: "Understanding Shipping Times", description: "Setting realistic expectations for delivery.", videoUrl: "https://example.com/videos/shipping-times", thumbnailUrl: "/3d-icons/documents.webp", duration: "7:30", order: 1 },
      { id: "VID-017", title: "Automating Order Fulfillment", description: "Tools to automate the fulfillment process.", videoUrl: "https://example.com/videos/auto-fulfillment", thumbnailUrl: "/3d-icons/documents.webp", duration: "10:55", order: 2 },
    ],
  },
  {
    id: "MOD-006",
    title: "LLC Formation & US Business Setup",
    description: "How to register a US LLC and set up banking as an international seller.",
    status: "published",
    order: 6,
    videos: [
      { id: "VID-018", title: "Why You Need a US LLC", description: "Benefits of having a US entity for your business.", videoUrl: "https://example.com/videos/why-us-llc", thumbnailUrl: "/3d-icons/employees.webp", duration: "8:00", order: 1 },
      { id: "VID-019", title: "Filing Your LLC Step by Step", description: "Complete walkthrough of the LLC filing process.", videoUrl: "https://example.com/videos/file-llc", thumbnailUrl: "/3d-icons/employees.webp", duration: "14:20", order: 2 },
      { id: "VID-020", title: "Getting Your EIN", description: "Applying for an Employer Identification Number.", videoUrl: "https://example.com/videos/get-ein", thumbnailUrl: "/3d-icons/employees.webp", duration: "6:45", order: 3 },
      { id: "VID-021", title: "Setting Up US Bank Account", description: "Options for opening a US bank account remotely.", videoUrl: "https://example.com/videos/us-bank", thumbnailUrl: "/3d-icons/employees.webp", duration: "11:30", order: 4 },
    ],
  },
];

export const detailedUsers: DetailedUser[] = [
  {
    id: "USR-001",
    name: "Sarah Chen",
    email: "sarah@ecomstore.com",
    phone: "+1 (415) 555-0101",
    plan: "pro",
    status: "active",
    role: "user",
    signupDate: "2024-08-15",
    lastLogin: "2025-02-27",
    batchName: "Alpha Cohort",
    weekNumber: 24,
    llcStatus: "complete",
    llcName: "Chen Ecommerce LLC",
    llcState: "Wyoming",
    shopifyConnected: true,
    shopifyDomain: "sarahbeauty.myshopify.com",
    pipelineStage: "converted",
    progress: 95,
    storesConnected: 3,
    productsImported: 145,
    revenue: 89400,
    city: "San Francisco",
    country: "United States",
    ein: "87-1234567",
    website: "https://sarahbeauty.com",
    instagram: "@sarahbeautystore",
    tiktok: "@sarahchen_drops",
    llcMilestones: { pending: "2024-11-15", filed: "2024-11-22", ein_applied: "2024-12-01", boi_filed: "2024-12-10", bank_setup: "2024-12-20", stripe_setup: "2025-01-05", complete: "2025-01-20" },
    courses: [
      { courseId: "CRS-001", courseTitle: "Dropshipping Fundamentals", totalModules: 12, completedModules: 12, progress: 100, lastAccessed: "2024-10-15", enrolled: "2024-08-20" },
      { courseId: "CRS-002", courseTitle: "Finding Winning Products", totalModules: 8, completedModules: 8, progress: 100, lastAccessed: "2024-11-20", enrolled: "2024-10-18" },
      { courseId: "CRS-004", courseTitle: "Shopify Store Setup A-Z", totalModules: 10, completedModules: 10, progress: 100, lastAccessed: "2024-09-30", enrolled: "2024-08-25" },
      { courseId: "CRS-008", courseTitle: "Scaling to $10K/Month", totalModules: 11, completedModules: 7, progress: 64, lastAccessed: "2025-02-25", enrolled: "2025-01-10" },
    ],
    featureAccess: [
      { key: "product_research", label: "Product Research", enabled: true, plan: "free" },
      { key: "ai_ad_studio", label: "AI Ad Studio", enabled: true, plan: "pro" },
      { key: "competitor_spy", label: "Competitor Spy", enabled: true, plan: "pro" },
      { key: "advanced_analytics", label: "Advanced Analytics", enabled: true, plan: "pro" },
      { key: "bulk_import", label: "Bulk Import", enabled: true, plan: "pro" },
      { key: "api_access", label: "API Access", enabled: false, plan: "enterprise" },
      { key: "white_label", label: "White Label", enabled: false, plan: "enterprise" },
      { key: "priority_support", label: "Priority Support", enabled: true, plan: "pro" },
      { key: "mentorship", label: "Mentorship Access", enabled: true, plan: "pro" },
      { key: "custom_integrations", label: "Custom Integrations", enabled: false, plan: "enterprise" },
    ],
    activityLog: [
      { id: "AL-001", type: "login", description: "Logged in from San Francisco, CA", timestamp: "2025-02-27T10:30:00Z" },
      { id: "AL-002", type: "product", description: "Imported 3 new products to store", timestamp: "2025-02-27T11:15:00Z" },
      { id: "AL-003", type: "course", description: "Completed module 7 of Scaling to $10K/Month", timestamp: "2025-02-25T14:20:00Z" },
      { id: "AL-004", type: "purchase", description: "Renewed Pro plan ($79/mo)", timestamp: "2025-02-20T09:00:00Z" },
      { id: "AL-005", type: "store", description: "Connected new store: chensdeals.myshopify.com", timestamp: "2025-02-15T16:45:00Z" },
      { id: "AL-006", type: "llc", description: "LLC marked Complete", timestamp: "2025-01-20T12:00:00Z" },
      { id: "AL-007", type: "support", description: "Opened ticket: AI Ad Studio not generating images", timestamp: "2025-02-25T08:30:00Z" },
      { id: "AL-008", type: "login", description: "Logged in from mobile device", timestamp: "2025-02-24T07:15:00Z" },
      { id: "AL-009", type: "product", description: "Updated pricing on 5 products", timestamp: "2025-02-23T13:40:00Z" },
      { id: "AL-010", type: "profile", description: "Updated business info and social links", timestamp: "2025-02-18T10:10:00Z" },
    ],
    adminNotes: [
      { id: "AN-001", author: "Karan Gupta", content: "High-value client. Potential for enterprise upgrade in Q3. Actively scaling her beauty niche stores.", createdAt: "2025-02-20T10:00:00Z" },
      { id: "AN-002", author: "Vikram Singh", content: "Sarah asked about bulk discount for importing 500+ products. Discuss with product team.", createdAt: "2025-02-15T14:30:00Z" },
    ],
    paymentLinks: [
      { id: "PYL-001", amount: 79, description: "Pro Plan Monthly - March 2025", status: "paid", sentAt: "2025-02-20T09:00:00Z", paidAt: "2025-02-20T09:05:00Z" },
      { id: "PYL-002", amount: 79, description: "Pro Plan Monthly - February 2025", status: "paid", sentAt: "2025-01-20T09:00:00Z", paidAt: "2025-01-20T10:15:00Z" },
      { id: "PYL-003", amount: 199, description: "LLC Formation Package", status: "paid", sentAt: "2024-11-12T11:00:00Z", paidAt: "2024-11-12T11:30:00Z" },
    ],
    supportTickets: [
      { id: "TKT-005", subject: "AI Ad Studio not generating images", status: "in-progress", createdDate: "2025-02-25" },
    ],
  },
  {
    id: "USR-004",
    name: "Jake Miller",
    email: "jake@trendyfinds.com",
    phone: "+1 (212) 555-0404",
    plan: "pro",
    status: "active",
    role: "user",
    signupDate: "2024-09-05",
    lastLogin: "2025-02-27",
    batchName: "Beta Cohort",
    weekNumber: 16,
    llcStatus: "bank_setup",
    llcName: "TrendyFinds Inc LLC",
    llcState: "Wyoming",
    shopifyConnected: true,
    shopifyDomain: "trendyfinds.myshopify.com",
    pipelineStage: "converted",
    progress: 68,
    storesConnected: 2,
    productsImported: 89,
    revenue: 67800,
    city: "New York",
    country: "United States",
    ein: "pending",
    website: "https://trendyfinds.com",
    instagram: "@trendyfinds",
    tiktok: "@trendyfinds_official",
    llcMilestones: { pending: "2025-01-10", filed: "2025-01-17", ein_applied: "2025-01-25", boi_filed: "2025-02-02", bank_setup: "2025-02-10" },
    courses: [
      { courseId: "CRS-001", courseTitle: "Dropshipping Fundamentals", totalModules: 12, completedModules: 12, progress: 100, lastAccessed: "2024-11-01", enrolled: "2024-09-10" },
      { courseId: "CRS-004", courseTitle: "Shopify Store Setup A-Z", totalModules: 10, completedModules: 10, progress: 100, lastAccessed: "2024-10-20", enrolled: "2024-09-15" },
      { courseId: "CRS-003", courseTitle: "Facebook Ads Mastery", totalModules: 15, completedModules: 8, progress: 53, lastAccessed: "2025-02-26", enrolled: "2025-01-05" },
      { courseId: "CRS-005", courseTitle: "TikTok Ads for Ecommerce", totalModules: 9, completedModules: 3, progress: 33, lastAccessed: "2025-02-20", enrolled: "2025-02-01" },
    ],
    featureAccess: [
      { key: "product_research", label: "Product Research", enabled: true, plan: "free" },
      { key: "ai_ad_studio", label: "AI Ad Studio", enabled: true, plan: "pro" },
      { key: "competitor_spy", label: "Competitor Spy", enabled: true, plan: "pro" },
      { key: "advanced_analytics", label: "Advanced Analytics", enabled: true, plan: "pro" },
      { key: "bulk_import", label: "Bulk Import", enabled: true, plan: "pro" },
      { key: "api_access", label: "API Access", enabled: false, plan: "enterprise" },
      { key: "white_label", label: "White Label", enabled: false, plan: "enterprise" },
      { key: "priority_support", label: "Priority Support", enabled: true, plan: "pro" },
      { key: "mentorship", label: "Mentorship Access", enabled: false, plan: "pro" },
      { key: "custom_integrations", label: "Custom Integrations", enabled: false, plan: "enterprise" },
    ],
    activityLog: [
      { id: "AL-101", type: "login", description: "Logged in from New York, NY", timestamp: "2025-02-27T08:20:00Z" },
      { id: "AL-102", type: "product", description: "Listed 5 new products from research tool", timestamp: "2025-02-27T09:45:00Z" },
      { id: "AL-103", type: "llc", description: "LLC moved to Bank Setup stage", timestamp: "2025-02-10T14:00:00Z" },
      { id: "AL-104", type: "course", description: "Started TikTok Ads for Ecommerce", timestamp: "2025-02-01T10:30:00Z" },
      { id: "AL-105", type: "support", description: "Opened ticket: Tracking numbers not syncing", timestamp: "2025-02-27T11:00:00Z" },
      { id: "AL-106", type: "purchase", description: "Paid Pro plan renewal ($79/mo)", timestamp: "2025-02-05T09:00:00Z" },
      { id: "AL-107", type: "store", description: "Updated store theme settings", timestamp: "2025-02-22T15:30:00Z" },
      { id: "AL-108", type: "login", description: "Logged in from iPad", timestamp: "2025-02-26T20:10:00Z" },
    ],
    adminNotes: [
      { id: "AN-101", author: "Karan Gupta", content: "Jake is progressing well but LLC bank setup is taking longer. Need to follow up with bank.", createdAt: "2025-02-20T11:00:00Z" },
      { id: "AN-102", author: "Sneha Patel", content: "Has potential for mentorship program. Discuss after LLC is complete.", createdAt: "2025-02-10T09:30:00Z" },
    ],
    paymentLinks: [
      { id: "PYL-101", amount: 79, description: "Pro Plan Monthly - March 2025", status: "sent", sentAt: "2025-02-25T09:00:00Z" },
      { id: "PYL-102", amount: 79, description: "Pro Plan Monthly - February 2025", status: "paid", sentAt: "2025-01-25T09:00:00Z", paidAt: "2025-01-25T10:00:00Z" },
      { id: "PYL-103", amount: 149, description: "LLC Formation Package", status: "paid", sentAt: "2025-01-08T11:00:00Z", paidAt: "2025-01-08T14:20:00Z" },
    ],
    supportTickets: [
      { id: "TKT-006", subject: "Tracking numbers not syncing", status: "open", createdDate: "2025-02-27" },
    ],
  },
  {
    id: "USR-006",
    name: "Tom Bradley",
    email: "tom@gadgetguru.store",
    phone: "+1 (646) 555-0606",
    plan: "free",
    status: "trial",
    role: "user",
    signupDate: "2025-02-10",
    lastLogin: "2025-02-26",
    batchName: "Gamma Cohort",
    weekNumber: 3,
    llcStatus: "ein_applied",
    llcName: "GadgetGuru Commerce LLC",
    llcState: "Wyoming",
    shopifyConnected: false,
    shopifyDomain: "",
    pipelineStage: "engaged",
    progress: 30,
    storesConnected: 0,
    productsImported: 5,
    revenue: 0,
    city: "Chicago",
    country: "United States",
    ein: "",
    website: "",
    instagram: "",
    tiktok: "",
    llcMilestones: { pending: "2025-02-05", filed: "2025-02-10", ein_applied: "2025-02-16" },
    courses: [
      { courseId: "CRS-001", courseTitle: "Dropshipping Fundamentals", totalModules: 12, completedModules: 4, progress: 33, lastAccessed: "2025-02-22", enrolled: "2025-02-10" },
      { courseId: "CRS-004", courseTitle: "Shopify Store Setup A-Z", totalModules: 10, completedModules: 1, progress: 10, lastAccessed: "2025-02-18", enrolled: "2025-02-15" },
    ],
    featureAccess: [
      { key: "product_research", label: "Product Research", enabled: true, plan: "free" },
      { key: "ai_ad_studio", label: "AI Ad Studio", enabled: false, plan: "pro" },
      { key: "competitor_spy", label: "Competitor Spy", enabled: false, plan: "pro" },
      { key: "advanced_analytics", label: "Advanced Analytics", enabled: false, plan: "pro" },
      { key: "bulk_import", label: "Bulk Import", enabled: false, plan: "pro" },
      { key: "api_access", label: "API Access", enabled: false, plan: "enterprise" },
      { key: "white_label", label: "White Label", enabled: false, plan: "enterprise" },
      { key: "priority_support", label: "Priority Support", enabled: false, plan: "pro" },
      { key: "mentorship", label: "Mentorship Access", enabled: false, plan: "pro" },
      { key: "custom_integrations", label: "Custom Integrations", enabled: false, plan: "enterprise" },
    ],
    activityLog: [
      { id: "AL-201", type: "login", description: "Logged in from Chicago, IL", timestamp: "2025-02-26T09:00:00Z" },
      { id: "AL-202", type: "course", description: "Completed module 4 of Dropshipping Fundamentals", timestamp: "2025-02-22T16:30:00Z" },
      { id: "AL-203", type: "support", description: "Opened ticket: Cannot connect Shopify store", timestamp: "2025-02-26T14:00:00Z" },
      { id: "AL-204", type: "product", description: "Browsed 12 products in research tool", timestamp: "2025-02-20T11:00:00Z" },
      { id: "AL-205", type: "profile", description: "Updated profile phone number", timestamp: "2025-02-15T10:00:00Z" },
    ],
    adminNotes: [
      { id: "AN-201", author: "Vikram Singh", content: "New trial user, struggling with Shopify connection. Needs hand-holding. Consider scheduling onboarding call.", createdAt: "2025-02-26T15:00:00Z" },
    ],
    paymentLinks: [
      { id: "PYL-201", amount: 29, description: "Starter Plan - First Month", status: "sent", sentAt: "2025-02-24T10:00:00Z" },
      { id: "PYL-202", amount: 149, description: "LLC Formation Package", status: "expired", sentAt: "2025-02-08T09:00:00Z" },
    ],
    supportTickets: [
      { id: "TKT-001", subject: "Cannot connect Shopify store", status: "open", createdDate: "2025-02-26" },
    ],
  },
];

export function getDetailedUser(id: string): DetailedUser | undefined {
  return detailedUsers.find((u) => u.id === id);
}

export const helpCenterArticles = [
  {
    category: "Getting Started",
    articles: [
      { title: "How to create your account", content: "Sign up at usdrop.ai with your email or Google account. Complete the onboarding questionnaire to personalize your experience." },
      { title: "Connecting your Shopify store", content: "Go to Settings > Integrations > Shopify. Click 'Connect Store' and authorize USDrop AI in your Shopify admin panel." },
      { title: "Importing your first product", content: "Browse the product catalog, click on a product you like, then click 'Import to Store'. Choose your store and customize the listing." },
    ],
  },
  {
    category: "Products & Research",
    articles: [
      { title: "Using the product research tool", content: "Navigate to Product Hunt to browse trending products. Filter by category, price range, and supplier. Use the AI score to identify winners." },
      { title: "Understanding product metrics", content: "Each product shows profit margin, order volume, supplier rating, and trend direction. Green arrows indicate rising demand." },
      { title: "Saving products to your library", content: "Click the bookmark icon on any product to save it to My Products. You can organize saved products into collections." },
    ],
  },
  {
    category: "Billing & Plans",
    articles: [
      { title: "Upgrading your plan", content: "Go to Settings > Subscription. Choose your new plan and confirm. The upgrade takes effect immediately with prorated billing." },
      { title: "Canceling your subscription", content: "Visit Settings > Subscription > Cancel Plan. Your access continues until the end of the current billing period." },
      { title: "Payment methods accepted", content: "We accept Visa, Mastercard, American Express, and PayPal. All payments are processed securely through Stripe." },
    ],
  },
  {
    category: "Technical Support",
    articles: [
      { title: "Troubleshooting store connection", content: "If your store won't connect, ensure you have admin access in Shopify. Try disconnecting and reconnecting. Clear your browser cache." },
      { title: "Product import errors", content: "Common import errors include image size limits (max 20MB) and description length (max 5000 chars). Check the error message for specifics." },
      { title: "Browser compatibility", content: "USDrop AI works best on Chrome, Firefox, Safari, and Edge. Ensure your browser is updated to the latest version." },
    ],
  },
];
