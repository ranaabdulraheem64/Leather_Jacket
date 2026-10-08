import { Product, Review } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'maverick-biker',
    name: 'The Maverick Biker Jacket',
    category: 'Biker Jackets',
    price: 24999,
    originalPrice: 34999,
    discount: 28,
    rating: 4.9,
    reviewsCount: 48,
    image: '/src/assets/images/product_leather_biker_jacket_1791463879810.jpg',
    images: [
      '/src/assets/images/product_leather_biker_jacket_1791463879810.jpg',
      '/src/assets/images/hero_leather_jacket_campaign_1791463841928.jpg'
    ],
    description: 'Engineered for the bold. Crafted from hand-selected full-grain cowhide leather, this classic biker jacket features heavy-duty asymmetrical metal zippers, an action back for riding comfort, and an adjustable waist belt. Over time, it conforms to your body, developing a personalized, high-character fit.',
    material: '100% Premium Full-Grain Cowhide Leather (1.2mm thickness)',
    specifications: 'Genuine YKK heavy-duty silver metal zippers; Dual quilted interior lining for breathability and warmth; 3 exterior zippered pockets; 2 deep interior stash pockets; Bi-swing action back for unrestricted arm movement; Zippered cuffs; Snap-down lapels.',
    care: 'Professional leather dry clean only. Protect from sustained water exposure. Hang on a wide, padded hanger to maintain shape.',
    colors: ['Obsidian Black', 'Charcoal Gray'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isNew: true,
    isSale: true
  },
  {
    id: 'heritage-bomber',
    name: 'The Heritage Suede Bomber',
    category: 'Bomber Jackets',
    price: 29999,
    originalPrice: 39999,
    discount: 25,
    rating: 4.8,
    reviewsCount: 32,
    image: '/src/assets/images/product_leather_bomber_jacket_1791463910508.jpg',
    images: [
      '/src/assets/images/product_leather_bomber_jacket_1791463910508.jpg'
    ],
    description: 'Refined everyday luxury. Made from ultra-soft, premium Italian calf suede, this bomber jacket features a sleek tailored silhouette, thick custom-knit ribbed collar, cuffs, and hem, and custom brass-finished zippers. An effortlessly stylish layer that bridges the gap between casual and formal wear.',
    material: '100% Premium Italian Calf Suede Leather with 100% Silk-Satin lining',
    specifications: 'Extra-soft handfeel suede; Heavy-ribbed anti-pilling wool trims; Reinforced pocket entries; Double-way brass main zipper; Inside zippered passport pocket; 2 magnetic-closure side pockets.',
    care: 'Specialist suede dry clean only. Treat with high-quality suede protective spray before wearing. Avoid rubbing or contact with liquid spills.',
    colors: ['Vintage Brown', 'Camel Tan'],
    sizes: ['S', 'M', 'L', 'XL'],
    isNew: true,
    isSale: false
  },
  {
    id: 'nomad-racer',
    name: 'The Nomad Vintage Racer',
    category: 'Vintage Jackets',
    price: 27499,
    originalPrice: 35999,
    discount: 23,
    rating: 4.7,
    reviewsCount: 54,
    image: '/src/assets/images/product_leather_vintage_jacket_1791463946167.jpg',
    images: [
      '/src/assets/images/product_leather_vintage_jacket_1791463946167.jpg'
    ],
    description: 'A jacket with a true story. Our signature hand-distressed, semi-aniline lambskin creates a unique, rich patina that beautifully accentuates the natural grain. Features a streamlined cafe racer band collar and zippered chest detailing.',
    material: '100% Hand-Finished Semi-Aniline Lambskin Leather',
    specifications: 'Authentic hand-distressed edges and seams; Soft-washed cotton canvas lining in the torso; Breathable satin sleeve lining; Solid brass vintage-finished hardware; 4 front zippered pockets; Snap-button tab throat latch.',
    care: 'Professional leather clean only. Rub with a leather conditioner every 12 months to nourish the hide and enhance the patina.',
    colors: ['Antique Tan', 'Tobacco Brown'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    isNew: false,
    isSale: true
  },
  {
    id: 'silhouette-rider',
    name: 'The Silhouette Tailored Women\'s Jacket',
    category: 'Women\'s Jackets',
    price: 22999,
    originalPrice: 29999,
    discount: 23,
    rating: 4.9,
    reviewsCount: 29,
    image: '/src/assets/images/product_leather_womens_jacket_1791463990835.jpg',
    images: [
      '/src/assets/images/product_leather_womens_jacket_1791463990835.jpg'
    ],
    description: 'Elegant lines meeting a bold spirit. Tailored precisely to flatter the silhouette, this butter-soft lambskin jacket features elegant asymmetric zippers, custom gold-plated hardware, and adjustable buckled side tabs for a customized waist fit.',
    material: '100% Super-Soft Napa Lambskin Leather',
    specifications: 'Symmetrical and asymmetrical zipper configuration; 18k gold-plated solid steel buckles and sliders; Smooth stretch-polyester lining; Dual side compression buckle tabs; Quilted shoulder padding panels.',
    care: 'Professional leather dry clean only. Store on a contoured luxury hanger. Keep away from intense damp environments.',
    colors: ['Classic Black', 'Espresso Dark'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: true,
    isSale: false
  },
  {
    id: 'aviator-shearling',
    name: 'The Arctic Aviator Shearling',
    category: 'Premium Collection',
    price: 39999,
    originalPrice: 49999,
    discount: 20,
    rating: 5.0,
    reviewsCount: 15,
    image: '/src/assets/images/product_leather_bomber_jacket_1791463910508.jpg', // high-quality placeholder reuse
    images: [
      '/src/assets/images/product_leather_bomber_jacket_1791463910508.jpg'
    ],
    description: 'The ultimate cold-weather statement. Engineered from heavy-weight merino sheepskin shearling with a cracked leather napa finish on the outer shell and plush, warm shearling fur on the inside. Built for lifelong comfort and unmatched winter protection.',
    material: '100% Genuine Merino Shearling Sheepskin (15mm fur height)',
    specifications: 'Cracked antique leather outer finish; Soft natural shearling inner wool; Double throat strap buckles; Heavy-duty YKK vintage steel zippers; Adjustable leather side tabs.',
    care: 'Professional leather and shearling clean only. Shake clean and air dry immediately if caught in rain. Do not store in a plastic garment bag.',
    colors: ['Dark Cocoa', 'Nordic Black'],
    sizes: ['M', 'L', 'XL'],
    isNew: true,
    isSale: false
  },
  {
    id: 'minimalist-racer',
    name: 'The Stealth Cafe Racer',
    category: 'New Arrivals',
    price: 25999,
    originalPrice: 32999,
    discount: 21,
    rating: 4.8,
    reviewsCount: 11,
    image: '/src/assets/images/product_leather_vintage_jacket_1791463946167.jpg', // high-quality placeholder reuse
    images: [
      '/src/assets/images/product_leather_vintage_jacket_1791463946167.jpg'
    ],
    description: 'Aerodynamic, minimalist sophistication. Crafted for those who appreciate pure, clean design. Stripped of loud hardware, it presents a sleek flat-panel chest, standard snap-collar band, and subtle hand-warmer slip pockets.',
    material: '100% Premium Matte Lambskin Leather',
    specifications: 'Premium matte finish; Invisible side-entry zippered hand pockets; Sleek internal wallet pocket; Gunmetal-finished minimalist hardware; Ultra-thin high-density thermal inner lining.',
    care: 'Professional leather dry clean only. Wipe clean with a soft, slightly damp cloth if needed.',
    colors: ['Obsidian Black', 'Cognac Tan'],
    sizes: ['S', 'M', 'L', 'XL'],
    isNew: true,
    isSale: true
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Zain Malik',
    rating: 5,
    comment: 'The grain on the Maverick Biker jacket is extraordinary. It has a heavy, satisfying weight but fits incredibly comfortably. The zippers glide smoothly. Absolute masterpiece!',
    verified: true,
    productName: 'The Maverick Biker Jacket'
  },
  {
    id: 'rev-2',
    author: 'Sarah Fatima',
    rating: 5,
    comment: 'The leather of the Silhouette jacket feels like butter. I was worried about the fit online, but the buckled tabs let me adjust it exactly to my waist. I get compliments every single time I wear it!',
    verified: true,
    productName: 'The Silhouette Tailored Women\'s Jacket'
  },
  {
    id: 'rev-3',
    author: 'Haris Ahmed',
    rating: 4,
    comment: 'Exceptional craftsmanship on the Heritage Suede Bomber. The silk-satin lining feels incredibly premium on the skin. Suede is deep in color and ultra soft. Delivery was fast too!',
    verified: true,
    productName: 'The Heritage Suede Bomber'
  },
  {
    id: 'rev-4',
    author: 'Kamran Shah',
    rating: 5,
    comment: 'The patina on the Nomad Vintage Racer is beautiful right out of the box. Its distressed details make it look like a vintage heirloom. Totally worth every single rupee.',
    verified: true,
    productName: 'The Nomad Vintage Racer'
  }
];
