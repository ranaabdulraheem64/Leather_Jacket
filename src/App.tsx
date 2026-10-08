import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  Menu, 
  X, 
  Star, 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Minus, 
  Check, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  MessageSquare, 
  MapPin, 
  Mail, 
  Phone, 
  ChevronDown, 
  ChevronRight, 
  Filter, 
  History, 
  HelpCircle, 
  Sun, 
  Moon, 
  ExternalLink,
  Award,
  Sparkles
} from 'lucide-react';
import { PRODUCTS, REVIEWS } from './data/products';
import { BRAND_CONFIG } from './config';
import { Product, CartItem, CustomerInfo, Order, Review } from './types';

// Utility helper to safely interact with LocalStorage
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

export default function App() {
  // Global & Navigation States
  const [view, setView] = useState<'home' | 'shop' | 'wishlist' | 'cart' | 'checkout' | 'about' | 'contact' | 'order-history' | 'faq' | 'product-detail'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('maverick-biker');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('leather-jack-theme', 'dark');

  // Interactive local storage states
  const [cart, setCart] = useLocalStorage<CartItem[]>('leather-jack-cart', []);
  const [wishlist, setWishlist] = useLocalStorage<string[]>('leather-jack-wishlist', []);
  const [recentlyViewed, setRecentlyViewed] = useLocalStorage<string[]>('leather-jack-recently-viewed', []);
  const [orders, setOrders] = useLocalStorage<Order[]>('leather-jack-orders', []);

  // Shop filter and sort states
  const [filters, setFilters] = useState({
    category: 'All',
    minPrice: 0,
    maxPrice: 50000,
    size: 'All',
    color: 'All',
  });
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // PDP local interactive state (selected options for current product)
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specifications' | 'care'>('details');

  // Checkout info form state
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    area: '',
    city: '',
    postalCode: '',
    notes: ''
  });
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'success'>('form');
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscountPercentage, setAppliedDiscountPercentage] = useState(0);
  const [promoError, setPromoError] = useState('');

  // Floating notifications/toast state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' }[]>([]);

  // DOM Refs for scroll and animations
  const productSectionRef = useRef<HTMLDivElement>(null);

  // Apply theme class to document body
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  // Show dynamic toast helper
  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Recently viewed effect when viewing a product
  useEffect(() => {
    if (view === 'product-detail' && selectedProductId) {
      setRecentlyViewed((prev) => {
        const filtered = prev.filter((id) => id !== selectedProductId);
        return [selectedProductId, ...filtered].slice(0, 5); // Limit to 5 items
      });
    }
  }, [view, selectedProductId]);

  // Cart operations
  const addToCart = (product: Product, size: string, color: string, qty: number = 1) => {
    if (!size) {
      triggerToast('Please select a size', 'info');
      return;
    }
    const chosenColor = color || product.colors[0];
    const itemId = `${product.id}-${size}-${chosenColor.replace(/\s+/g, '-').toLowerCase()}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        triggerToast(`Updated quantity of ${product.name} (${size}) in cart`);
        return prev.map((item) => 
          item.id === itemId ? { ...item, quantity: item.quantity + qty } : item
        );
      } else {
        triggerToast(`Added ${product.name} to cart`);
        return [
          ...prev,
          {
            id: itemId,
            productId: product.id,
            name: product.name,
            image: product.image,
            price: product.price,
            size,
            color: chosenColor,
            quantity: qty
          }
        ];
      }
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      });
    });
  };

  const removeFromCart = (id: string, name: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    triggerToast(`Removed ${name} from cart`, 'info');
  };

  // Wishlist operations
  const toggleWishlist = (id: string, name: string) => {
    setWishlist((prev) => {
      if (prev.includes(id)) {
        triggerToast(`Removed ${name} from wishlist`, 'info');
        return prev.filter((item) => item !== id);
      } else {
        triggerToast(`Added ${name} to wishlist`);
        return [...prev, id];
      }
    });
  };

  // Apply promo code helper
  const applyPromoCode = () => {
    if (promoCode.trim().toUpperCase() === BRAND_CONFIG.defaultPromoCode.code) {
      setAppliedDiscountPercentage(BRAND_CONFIG.defaultPromoCode.discountPercentage);
      setPromoError('');
      triggerToast(`Promo code BOLD10 applied! 10% discount dynamic.`);
    } else {
      setPromoError('Invalid coupon code.');
      setAppliedDiscountPercentage(0);
    }
  };

  // Calculation helpers
  const getSubtotal = () => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const getShipping = (subtotal: number) => {
    if (subtotal === 0) return 0;
    return subtotal >= BRAND_CONFIG.freeShippingThreshold ? 0 : BRAND_CONFIG.shippingCost;
  };
  const getDiscount = (subtotal: number) => Math.round(subtotal * (appliedDiscountPercentage / 100));
  const getTotal = () => {
    const subtotal = getSubtotal();
    const shipping = getShipping(subtotal);
    const discount = getDiscount(subtotal);
    return subtotal + shipping - discount;
  };

  // Generate URL Encoded WhatsApp checkout order message
  const triggerWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address || !customerInfo.city || !customerInfo.area) {
      triggerToast('Please fill out all required fields.', 'info');
      return;
    }

    const subtotal = getSubtotal();
    const shipping = getShipping(subtotal);
    const discount = getDiscount(subtotal);
    const total = getTotal();

    // 1. Build structured clean text order details message
    let orderItemsText = '';
    cart.forEach((item, index) => {
      orderItemsText += `${index + 1}. ${item.name}\n   Size: ${item.size}\n   Color: ${item.color}\n   Qty: ${item.quantity}\n   Price: Rs. ${item.price.toLocaleString()}\n\n`;
    });

    const boldCodeText = appliedDiscountPercentage > 0 ? `Discount (${BRAND_CONFIG.defaultPromoCode.code}): Rs. ${discount.toLocaleString()}` : 'Discount: Rs. 0';

    const rawMessage = `Hello ${BRAND_CONFIG.name}! 👋

I would like to place an order.

🛍️ ORDER DETAILS

${orderItemsText}------------------------

Subtotal: Rs. ${subtotal.toLocaleString()}
Shipping: Rs. ${shipping === 0 ? 'FREE' : `${shipping.toLocaleString()}`}
${boldCodeText}

TOTAL: Rs. ${total.toLocaleString()}

👤 CUSTOMER DETAILS

Name: ${customerInfo.name}
WhatsApp: ${customerInfo.phone}
${customerInfo.email ? `Email: ${customerInfo.email}\n` : ''}
📍 DELIVERY ADDRESS

Street Address: ${customerInfo.address}
Area: ${customerInfo.area}
City: ${customerInfo.city}
Postal Code: ${customerInfo.postalCode}

📝 Notes:
${customerInfo.notes || 'None'}

Thank you!
${BRAND_CONFIG.name}`;

    // Clean phone number from non-digits for wa.me API (leave only numbers)
    const cleanNumber = BRAND_CONFIG.whatsappNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(rawMessage);
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

    // 2. Persist to local Order History as a mock order
    const newOrder: Order = {
      id: `LJ-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      items: [...cart],
      subtotal,
      shipping,
      discount,
      total,
      customerName: customerInfo.name,
      status: 'Pending Verification'
    };

    setOrders((prev) => [newOrder, ...prev]);
    
    // Clear cart upon checkout initiation
    setCart([]);
    setCheckoutStep('success');

    // 3. Open WhatsApp link (supports mobile app redirection automatically)
    window.open(waUrl, '_blank');
  };

  // Nav categories triggers
  const selectCategory = (category: string) => {
    setFilters((prev) => ({ ...prev, category }));
    setView('shop');
    setMobileMenuOpen(false);
  };

  // Direct PDP WhatsApp checkout bypass (Single Product Instant Checkout)
  const triggerSingleProductWhatsApp = (product: Product, size: string, color: string) => {
    if (!size) {
      triggerToast('Please select a size first.', 'info');
      return;
    }
    const chosenColor = color || product.colors[0];
    
    // Auto populate cart with this item, then redirect straight to checkout view!
    const itemId = `${product.id}-${size}-${chosenColor.replace(/\s+/g, '-').toLowerCase()}`;
    const singleCartItem: CartItem = {
      id: itemId,
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      size,
      color: chosenColor,
      quantity: 1
    };
    
    setCart([singleCartItem]);
    setView('checkout');
    triggerToast(`Initiating direct order for ${product.name}`);
  };

  // Filter & Search Logic
  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = filters.category === 'All' || p.category === filters.category;
    const matchesPrice = p.price >= filters.minPrice && p.price <= filters.maxPrice;
    const matchesSize = filters.size === 'All' || p.sizes.includes(filters.size);
    const matchesColor = filters.color === 'All' || p.colors.some(c => c.toLowerCase().includes(filters.color.toLowerCase()));
    
    return matchesSearch && matchesCategory && matchesPrice && matchesSize && matchesColor;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return 0; // Default Featured
  });

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-stone-950 text-stone-100' : 'bg-stone-50 text-stone-900'} font-sans relative`}>
      
      {/* Dynamic Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`px-4 py-3 rounded-lg shadow-xl text-xs font-semibold tracking-wide border transition-all duration-300 translate-y-0 opacity-100 flex items-center gap-2 ${
              theme === 'dark' 
                ? 'bg-stone-900 border-stone-800 text-gold-100' 
                : 'bg-white border-stone-200 text-stone-900'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse"></div>
            {t.message}
          </div>
        ))}
      </div>

      {/* FIXED BANNER CAP (Max height compliant with top bar contract) */}
      <div className="bg-stone-900 dark:bg-black text-gold-100 text-[10px] sm:text-xs font-medium py-1.5 px-4 text-center tracking-widest uppercase flex items-center justify-center gap-1.5 border-b border-stone-800 shrink-0 z-50 relative">
        <span>🍂 Luxury Craftsmanship</span>
        <span aria-hidden="true">·</span>
        <span>Free Express Shipping above Rs. 50,000</span>
        <span aria-hidden="true">·</span>
        <button 
          onClick={() => { setPromoCode('BOLD10'); applyPromoCode(); }}
          className="underline hover:text-white cursor-pointer transition-colors"
        >
          Use Code: BOLD10 (10% Off)
        </button>
      </div>

      {/* STICKY HEADER (Compliance: single row 3-zone contract, aggregate height <= 15% viewport) */}
      <header className="sticky top-0 z-40 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-900 transition-colors h-16 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          
          {/* ZONE 1: BRAND LOGO (Single Wordmark, Serif Display Face) */}
          <div className="flex items-center">
            <button 
              onClick={() => setView('home')} 
              className="text-xl sm:text-2xl font-bold tracking-widest font-display text-stone-900 dark:text-stone-50 hover:opacity-90 transition-opacity cursor-pointer uppercase whitespace-nowrap"
            >
              Leather Jack
            </button>
          </div>

          {/* ZONE 2: NAVIGATION LINKS (4-6 Clean typography items) */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold tracking-widest uppercase text-stone-600 dark:text-stone-300">
            <button onClick={() => setView('home')} className={`hover:text-gold-500 transition-colors cursor-pointer ${view === 'home' ? 'text-gold-500 border-b border-gold-500/30 pb-1' : ''}`}>Home</button>
            <button onClick={() => { setFilters(f => ({ ...f, category: 'All' })); setView('shop'); }} className={`hover:text-gold-500 transition-colors cursor-pointer ${view === 'shop' ? 'text-gold-500 border-b border-gold-500/30 pb-1' : ''}`}>Shop</button>
            <button onClick={() => selectCategory('Biker Jackets')} className="hover:text-gold-500 transition-colors cursor-pointer">Collections</button>
            <button onClick={() => setView('about')} className={`hover:text-gold-500 transition-colors cursor-pointer ${view === 'about' ? 'text-gold-500 border-b border-gold-500/30 pb-1' : ''}`}>About</button>
            <button onClick={() => setView('faq')} className={`hover:text-gold-500 transition-colors cursor-pointer ${view === 'faq' ? 'text-gold-500 border-b border-gold-500/30 pb-1' : ''}`}>FAQ</button>
            <button onClick={() => setView('contact')} className={`hover:text-gold-500 transition-colors cursor-pointer ${view === 'contact' ? 'text-gold-500 border-b border-gold-500/30 pb-1' : ''}`}>Contact</button>
          </nav>

          {/* ZONE 3: PRIMARY ACTIONS */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Search Input Toggle */}
            <div className="relative">
              {searchOpen && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-1 flex items-center gap-2 w-48 sm:w-64 transition-all z-50">
                  <input
                    type="text"
                    placeholder="Search premium leather..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (view !== 'shop') setView('shop');
                    }}
                    className="bg-transparent text-xs outline-none w-full text-stone-900 dark:text-stone-50"
                    autoFocus
                  />
                  <button onClick={() => { setSearchQuery(''); setSearchOpen(false); }} className="p-0.5">
                    <X className="w-3 h-3 text-stone-400" />
                  </button>
                </div>
              )}
              <button 
                onClick={() => setSearchOpen(!searchOpen)} 
                className="p-2 text-stone-700 dark:text-stone-300 hover:text-gold-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Search Catalog"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-stone-700 dark:text-stone-300 hover:text-gold-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist Icon with count badge */}
            <button 
              onClick={() => setView('wishlist')} 
              className="p-2 text-stone-700 dark:text-stone-300 hover:text-gold-500 transition-colors relative min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-gold-500 text-stone-950 text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-stone-50 dark:border-stone-950 font-mono">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Icon with count badge */}
            <button 
              onClick={() => setView('cart')} 
              className="p-2 text-stone-700 dark:text-stone-300 hover:text-gold-500 transition-colors relative min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 bg-stone-900 dark:bg-gold-500 text-gold-100 dark:text-stone-950 text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-stone-50 dark:border-stone-950 font-mono">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Order History link */}
            <button 
              onClick={() => setView('order-history')} 
              className="p-2 text-stone-700 dark:text-stone-300 hover:text-gold-500 transition-colors hidden sm:flex min-w-[44px] min-h-[44px] items-center justify-center"
              title="Order History"
            >
              <History className="w-5 h-5" />
            </button>

            {/* Mobile menu hamburger toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="lg:hidden p-2 text-stone-700 dark:text-stone-300 hover:text-gold-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle Mobile Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE MENU NAV DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop mask */}
          <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"></div>
          
          {/* Drawer container */}
          <div className="relative flex flex-col w-full max-w-xs h-full bg-stone-900 text-stone-100 shadow-2xl p-6 transition-transform duration-300 translate-x-0 z-50">
            <div className="flex items-center justify-between pb-6 border-b border-stone-800">
              <span className="text-lg font-bold tracking-widest font-display text-gold-100 uppercase">Leather Jack</span>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-2 text-stone-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-5 py-8 text-sm font-semibold tracking-widest uppercase">
              <button onClick={() => { setView('home'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-gold-500 transition-colors">Home</button>
              <button onClick={() => { setFilters(f => ({ ...f, category: 'All' })); setView('shop'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-gold-500 transition-colors">Shop All Jackets</button>
              
              <div className="border-t border-stone-800 my-2 pt-4">
                <span className="text-[10px] text-stone-500 tracking-widest block mb-3 uppercase">Featured Collections</span>
                <button onClick={() => selectCategory('Biker Jackets')} className="text-left py-2 pl-3 text-stone-300 hover:text-gold-500 transition-colors block">Biker Jackets</button>
                <button onClick={() => selectCategory('Bomber Jackets')} className="text-left py-2 pl-3 text-stone-300 hover:text-gold-500 transition-colors block">Bomber Jackets</button>
                <button onClick={() => selectCategory('Vintage Jackets')} className="text-left py-2 pl-3 text-stone-300 hover:text-gold-500 transition-colors block">Vintage Jackets</button>
                <button onClick={() => selectCategory('Women\'s Jackets')} className="text-left py-2 pl-3 text-stone-300 hover:text-gold-500 transition-colors block">Women's Jackets</button>
              </div>

              <div className="border-t border-stone-800 my-2 pt-4">
                <button onClick={() => { setView('about'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-gold-500 transition-colors block w-full">About Our Craft</button>
                <button onClick={() => { setView('order-history'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-gold-500 transition-colors block w-full">Track Orders</button>
                <button onClick={() => { setView('faq'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-gold-500 transition-colors block w-full">FAQ & Sizing</button>
                <button onClick={() => { setView('contact'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-gold-500 transition-colors block w-full">Contact Support</button>
              </div>
            </nav>

            <div className="mt-auto border-t border-stone-800 pt-6">
              <a 
                href={`https://wa.me/${BRAND_CONFIG.whatsappNumber.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors text-center"
              >
                <Phone className="w-4 h-4 fill-white text-emerald-600" />
                Chat with Concierge
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTROLLER */}
      <main className="pb-20">
        
        {/* VIEW 1: HOME PAGE */}
        {view === 'home' && (
          <div>
            
            {/* HERO SECTION (Cinematic, full width background with proper overlay & typography constraints) */}
            <section className="relative h-[85vh] md:h-[90vh] bg-stone-900 flex items-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img 
                  src="/src/assets/images/hero_leather_jacket_campaign_1791463841928.jpg" 
                  alt="Leather Jack Campaign Studio" 
                  className="w-full h-full object-cover object-center opacity-70 transform scale-105 transition-transform duration-[10s]"
                  referrerPolicy="no-referrer"
                />
                {/* Precise high-end visual gradient overlay scrim */}
                <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/60 to-transparent"></div>
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl text-stone-50">
                  <span className="text-xs sm:text-sm font-bold tracking-widest text-gold-500 uppercase block mb-3 font-mono">
                    Premium Leather Autumn Campaign
                  </span>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-display mb-6 text-wrap-balance leading-none">
                    Built for the Bold.
                  </h1>
                  <p className="text-stone-300 text-sm sm:text-base md:text-lg mb-8 leading-relaxed max-w-xl">
                    Premium leather jackets crafted for timeless style, confidence, and everyday adventure. Engineered to endure. Tailored to perfection.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => { setFilters(f => ({ ...f, category: 'All' })); setView('shop'); }}
                      className="px-8 py-4 bg-gold-500 text-stone-950 font-bold text-xs tracking-widest uppercase rounded-md hover:bg-gold-600 transition-all shadow-lg shadow-gold-500/10 active:scale-[0.98] cursor-pointer"
                    >
                      Shop Collection
                    </button>
                    <button 
                      onClick={() => setView('about')}
                      className="px-8 py-4 bg-transparent border border-stone-400 text-white font-bold text-xs tracking-widest uppercase rounded-md hover:bg-stone-50/10 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Explore Our Story
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* TRUST MARKERS PROOF & ADJACENCY */}
            <section className="py-8 bg-stone-900 text-stone-300 border-y border-stone-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="p-2">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-gold-500">100%</span>
                    <p className="text-[10px] tracking-widest uppercase text-stone-400 mt-1">Full-Grain Cowhide</p>
                  </div>
                  <div className="p-2">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-gold-500">YKK</span>
                    <p className="text-[10px] tracking-widest uppercase text-stone-400 mt-1">Heavy Metal Hardware</p>
                  </div>
                  <div className="p-2">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-gold-500">10-Year</span>
                    <p className="text-[10px] tracking-widest uppercase text-stone-400 mt-1">Material Guarantee</p>
                  </div>
                  <div className="p-2">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-gold-500">4.9★</span>
                    <p className="text-[10px] tracking-widest uppercase text-stone-400 mt-1">From 1,200+ Bold Riders</p>
                  </div>
                </div>
              </div>
            </section>

            {/* CATEGORY SWIPE TILES */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-gold-500 block mb-2 font-mono">Curated Silhouettes</span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display text-stone-900 dark:text-stone-100">
                    Browse Categories
                  </h2>
                </div>
                <button 
                  onClick={() => { setFilters(f => ({ ...f, category: 'All' })); setView('shop'); }}
                  className="text-xs font-bold uppercase tracking-widest text-gold-500 hover:text-gold-600 transition-colors cursor-pointer flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Responsive Category Grid: horizontal scroll on mobile, 4-col grid on larger viewports */}
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin lg:grid lg:grid-cols-4 lg:gap-6 snap-x">
                {[
                  { name: 'Biker Jackets', desc: 'Asymmetric bold designs with rich metal zippers', img: '/src/assets/images/product_leather_biker_jacket_1791463879810.jpg' },
                  { name: 'Bomber Jackets', desc: 'Premium luxury suedes and thick clean rib trims', img: '/src/assets/images/product_leather_bomber_jacket_1791463910508.jpg' },
                  { name: 'Vintage Jackets', desc: 'Hand-distressed semi-anilines with rare live patinas', img: '/src/assets/images/product_leather_vintage_jacket_1791463946167.jpg' },
                  { name: 'Women\'s Jackets', desc: 'Slim-cut, gold zippers, buttery lambskins', img: '/src/assets/images/product_leather_womens_jacket_1791463990835.jpg' },
                ].map((cat, i) => (
                  <div 
                    key={i}
                    onClick={() => selectCategory(cat.name)}
                    className="group relative h-72 min-w-[260px] sm:min-w-[300px] lg:min-w-0 rounded-lg overflow-hidden cursor-pointer snap-start flex-shrink-0 bg-stone-900"
                  >
                    <img 
                      src={cat.img} 
                      alt={cat.name} 
                      className="w-full h-full object-cover object-center opacity-65 group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent"></div>
                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <h3 className="text-lg font-bold font-display tracking-wide mb-1 text-gold-100">{cat.name}</h3>
                      <p className="text-[11px] text-stone-300 font-sans tracking-normal opacity-90 line-clamp-2 leading-snug">{cat.desc}</p>
                      <span className="inline-block mt-3 text-[10px] font-bold tracking-widest uppercase border-b border-gold-500/40 text-gold-500 group-hover:text-white transition-colors">
                        Explore Silhouette
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FEATURED PRODUCTS */}
            <section className="py-16 bg-stone-100 dark:bg-stone-900/50 transition-colors px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <span className="text-xs font-bold uppercase tracking-widest text-gold-500 block mb-2 font-mono">Precision Crafted</span>
                  <h2 className="text-3xl font-bold font-display tracking-tight text-stone-900 dark:text-stone-100 text-wrap-balance">
                    Signature Jackets
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 max-w-md mx-auto">
                    Invest in a lifetime piece. Individually built by hand from full-grain materials and heavy metal.
                  </p>
                </div>

                {/* Grid: Comfortable 2-column on mobile, 3/4-col on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {PRODUCTS.slice(0, 4).map((product) => {
                    const inWishlist = wishlist.includes(product.id);
                    return (
                      <div 
                        key={product.id}
                        className="group relative bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                      >
                        {/* Photo Display Frame (takes ~70% of card) */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 cursor-pointer" onClick={() => { setSelectedProductId(product.id); setView('product-detail'); }}>
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          
                          {/* Minimalist unboxed metadata label triggers (NO PILLS policy compliant) */}
                          <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
                            {product.isNew && (
                              <span className="bg-stone-950 text-gold-100 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm">
                                NEW
                              </span>
                            )}
                            {product.isSale && (
                              <span className="bg-gold-500 text-stone-950 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm">
                                OFF -{product.discount}%
                              </span>
                            )}
                          </div>

                          {/* Quick Wishlist Control */}
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              toggleWishlist(product.id, product.name); 
                            }}
                            className="absolute top-3 right-3 bg-white/90 dark:bg-stone-950/90 text-stone-800 dark:text-stone-200 p-2 rounded-full shadow-md hover:bg-stone-900 hover:text-white dark:hover:bg-gold-500 dark:hover:text-stone-950 transition-colors cursor-pointer z-20 min-w-[36px] min-h-[36px] flex items-center justify-center"
                            aria-label={`Wishlist ${product.name}`}
                          >
                            <Heart className={`w-4.5 h-4.5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                          </button>
                        </div>

                        {/* Title & Price Metadata Details */}
                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <div className="mb-2">
                            <span className="text-[10px] uppercase tracking-wider text-gold-500 font-mono font-semibold block mb-1">
                              {product.category}
                            </span>
                            <h3 
                              onClick={() => { setSelectedProductId(product.id); setView('product-detail'); }}
                              className="text-xs sm:text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-50 hover:text-gold-500 transition-colors line-clamp-1 cursor-pointer leading-tight"
                            >
                              {product.name}
                            </h3>
                          </div>

                          <div className="mt-auto">
                            {/* Star Rating Info */}
                            <div className="flex items-center gap-1 text-gold-500 text-[11px] mb-2 font-semibold">
                              <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                              <span className="font-mono">{product.rating}</span>
                              <span className="text-stone-400">({product.reviewsCount})</span>
                            </div>

                            {/* Pricing - tabular figures */}
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs sm:text-sm font-bold font-mono text-stone-900 dark:text-stone-100">
                                Rs. {product.price.toLocaleString()}
                              </span>
                              <span className="text-[11px] font-mono text-stone-400 line-through">
                                Rs. {product.originalPrice.toLocaleString()}
                              </span>
                            </div>

                            {/* Action Row */}
                            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex gap-1.5">
                              <button 
                                onClick={() => { setSelectedProductId(product.id); setView('product-detail'); }}
                                className="w-1/2 py-2 border border-stone-200 dark:border-stone-800 text-[10px] uppercase font-bold tracking-widest text-stone-700 dark:text-stone-300 rounded hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-95 transition-all cursor-pointer"
                              >
                                View Specs
                              </button>
                              <button 
                                onClick={() => addToCart(product, product.sizes[1] || 'M', product.colors[0], 1)}
                                className="w-1/2 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-950 text-[10px] uppercase font-bold tracking-widest rounded hover:bg-gold-500 dark:hover:bg-gold-500 hover:text-stone-950 dark:hover:text-stone-950 active:scale-95 transition-all cursor-pointer"
                              >
                                Quick Add
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* BRAND STORY / CRAFTSMANSHIP SECTION */}
            <section className="py-20 bg-stone-950 text-white relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Text details */}
                  <div className="lg:col-span-7">
                    <span className="text-xs font-bold uppercase tracking-widest text-gold-500 block mb-3 font-mono">The Art of Leathercraft</span>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-display mb-6 text-wrap-balance text-gold-100">
                      Crafting Armor for the Modern Rebel
                    </h2>
                    
                    <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6">
                      At Leather Jack, we believe a jacket is more than a piece of clothing — it is a tangible statement of confidence, personal history, and independent spirit.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                      <div className="border-l border-gold-500/40 pl-4">
                        <h3 className="font-bold text-xs tracking-widest uppercase text-gold-100 mb-2">Sustainably Sourced Hides</h3>
                        <p className="text-xs text-stone-400 leading-relaxed">
                          We use only high-grade full-grain cowhides and thick lambskins sourced ethically from certified tanneries committed to water reduction.
                        </p>
                      </div>
                      <div className="border-l border-gold-500/40 pl-4">
                        <h3 className="font-bold text-xs tracking-widest uppercase text-gold-100 mb-2">Constructed for a Lifetime</h3>
                        <p className="text-xs text-stone-400 leading-relaxed">
                          Sewn with ultra-strong bonded nylon threads, heavy metal studs, and genuine YKK locks. This is an heirloom item built to survive anything.
                        </p>
                      </div>
                    </div>

                    <div className="mt-8">
                      <button 
                        onClick={() => setView('about')}
                        className="text-xs font-bold uppercase tracking-widest text-gold-500 hover:text-white transition-colors cursor-pointer border-b border-gold-500 pb-1"
                      >
                        Read the Leather Jack Philosophy →
                      </button>
                    </div>
                  </div>

                  {/* Aesthetic image showcase */}
                  <div className="lg:col-span-5 relative">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden border border-stone-800 bg-stone-900 shadow-2xl">
                      <img 
                        src="/src/assets/images/product_leather_womens_jacket_1791463990835.jpg" 
                        alt="High-end tailoring leather craft" 
                        className="w-full h-full object-cover object-center opacity-80"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* CUSTOMER VERIFIED TESTIMONIALS */}
            <section className="py-16 bg-stone-100 dark:bg-stone-900/20 transition-colors px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <span className="text-xs font-bold uppercase tracking-widest text-gold-500 block mb-2 font-mono">The Bold Speak</span>
                  <h2 className="text-3xl font-bold font-display tracking-tight text-stone-900 dark:text-stone-100">
                    Verified Customer Reviews
                  </h2>
                </div>

                {/* Swipeable Testimonial List */}
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin md:grid md:grid-cols-3 md:gap-6">
                  {REVIEWS.map((rev) => (
                    <div 
                      key={rev.id}
                      className="min-w-[280px] sm:min-w-[320px] md:min-w-0 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60 p-6 rounded-xl flex flex-col justify-between shadow-sm"
                    >
                      <div>
                        <div className="flex gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-gold-500 text-gold-500' : 'text-stone-200'}`} />
                          ))}
                        </div>
                        <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed italic mb-4">
                          "{rev.comment}"
                        </p>
                      </div>
                      <div className="border-t border-stone-100 dark:border-stone-800 pt-4 mt-4 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">{rev.author}</span>
                          <span className="text-[10px] text-stone-400 font-semibold block">{rev.productName}</span>
                        </div>
                        {rev.verified && (
                          <span className="text-[9px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1 font-mono">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified Rider
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* NEWSLETTER */}
            <section className="py-20 bg-stone-900 text-stone-50 text-center relative px-4 overflow-hidden border-t border-stone-800">
              <div className="max-w-xl mx-auto relative z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-500 block mb-3 font-mono">Join the Guild</span>
                <h2 className="text-3xl font-bold font-display text-white mb-4">
                  The Leather Jack Club
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 mb-8 leading-relaxed">
                  Join for exclusive early access to limited edition jacket releases, bespoke styling advice, and premium leather care guides.
                </p>
                <form 
                  onSubmit={(e) => { e.preventDefault(); triggerToast('Welcome to the Leather Jack Club! check email for discount.'); }}
                  className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
                >
                  <input 
                    type="email" 
                    placeholder="Enter your premium email" 
                    required
                    className="flex-grow px-4 py-3 text-xs bg-stone-950 border border-stone-800 rounded outline-none text-white focus:border-gold-500 transition-colors"
                  />
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs uppercase tracking-widest rounded transition-all cursor-pointer"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </section>

          </div>
        )}

        {/* VIEW 2: SHOP CATALOG PAGE */}
        {view === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Header Title */}
            <div className="mb-8 border-b border-stone-200 dark:border-stone-900 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold-500 block mb-1 font-mono">All Silhouettes</span>
                <h1 className="text-3xl font-bold font-display tracking-tight text-stone-900 dark:text-stone-100">
                  Leather Jack Catalog
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Showing {filteredProducts.length} premium designs
                </p>
              </div>

              {/* Filtering / Sorting options on desktop */}
              <div className="flex items-center gap-2 self-start md:self-end">
                <button 
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 min-h-[44px]"
                >
                  <Filter className="w-4 h-4" /> Filters
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono hidden sm:inline">Sort:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-3 py-2 rounded text-xs outline-none font-semibold text-stone-800 dark:text-stone-200 min-h-[44px]"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">New Arrivals</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Main Shop Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* DESKTOP FILTER SIDEBAR */}
              <aside className="hidden lg:block space-y-6 self-start sticky top-24">
                <div className="border-b border-stone-200 dark:border-stone-900 pb-4">
                  <h3 className="font-bold text-xs tracking-widest uppercase text-stone-900 dark:text-stone-100">Category</h3>
                  <div className="mt-3 flex flex-col gap-1 text-xs">
                    {['All', 'Biker Jackets', 'Bomber Jackets', 'Vintage Jackets', 'Women\'s Jackets', 'Premium Collection', 'New Arrivals'].map((cat) => (
                      <button 
                        key={cat} 
                        onClick={() => setFilters({ ...filters, category: cat })}
                        className={`text-left py-1.5 hover:text-gold-500 transition-colors ${filters.category === cat ? 'text-gold-500 font-bold' : 'text-stone-500 dark:text-stone-400'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-b border-stone-200 dark:border-stone-900 pb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xs tracking-widest uppercase text-stone-900 dark:text-stone-100">Max Price</h3>
                    <span className="text-[11px] font-mono font-bold text-gold-500">Rs. {filters.maxPrice.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="15000" 
                    max="50000" 
                    step="1000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                    className="w-full mt-3 accent-gold-500"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
                    <span>Rs. 15,000</span>
                    <span>Rs. 50,000</span>
                  </div>
                </div>

                <div className="border-b border-stone-200 dark:border-stone-900 pb-4">
                  <h3 className="font-bold text-xs tracking-widest uppercase text-stone-900 dark:text-stone-100">Size</h3>
                  <div className="mt-3 grid grid-cols-5 gap-1 text-xs">
                    {['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                      <button 
                        key={sz} 
                        onClick={() => setFilters({ ...filters, size: sz })}
                        className={`py-2 border text-center font-mono rounded ${
                          filters.size === sz 
                            ? 'bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 border-transparent font-bold' 
                            : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                        } hover:border-gold-500/50 transition-colors cursor-pointer`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear all filter option */}
                <button 
                  onClick={() => {
                    setFilters({ category: 'All', minPrice: 0, maxPrice: 50000, size: 'All', color: 'All' });
                    setSearchQuery('');
                  }}
                  className="w-full py-2 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold uppercase tracking-widest rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
                </button>
              </aside>

              {/* PRODUCT LIST GRID COMPONENT */}
              <div className="lg:col-span-3">
                
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-24 border border-stone-200 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-900/40 p-8 max-w-md mx-auto">
                    <Search className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
                    <h3 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100 mb-2">No Jackets Found</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
                      We couldn't find any premium jackets matching your specific filters or search keywords. Try clearing filters to explore.
                    </p>
                    <button 
                      onClick={() => {
                        setFilters({ category: 'All', minPrice: 0, maxPrice: 50000, size: 'All', color: 'All' });
                        setSearchQuery('');
                      }}
                      className="px-6 py-3 bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 text-xs font-bold uppercase tracking-widest rounded hover:bg-gold-500 dark:hover:bg-gold-500 hover:text-stone-950 dark:hover:text-stone-950 transition-all cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {filteredProducts.map((product) => {
                      const inWishlist = wishlist.includes(product.id);
                      return (
                        <div 
                          key={product.id}
                          className="group bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 cursor-pointer" onClick={() => { setSelectedProductId(product.id); setView('product-detail'); }}>
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            
                            <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
                              {product.isNew && (
                                <span className="bg-stone-950 text-gold-100 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm">
                                  NEW
                                </span>
                              )}
                              {product.isSale && (
                                <span className="bg-gold-500 text-stone-950 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm">
                                  -{product.discount}%
                                </span>
                              )}
                            </div>

                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                toggleWishlist(product.id, product.name); 
                              }}
                              className="absolute top-3 right-3 bg-white/90 dark:bg-stone-950/90 text-stone-800 dark:text-stone-200 p-2 rounded-full shadow-md hover:bg-stone-900 hover:text-white dark:hover:bg-gold-500 dark:hover:text-stone-950 transition-colors cursor-pointer z-20 min-w-[36px] min-h-[36px] flex items-center justify-center"
                              aria-label={`Wishlist ${product.name}`}
                            >
                              <Heart className={`w-4.5 h-4.5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>
                          </div>

                          <div className="p-4 flex-grow flex flex-col justify-between">
                            <div className="mb-2">
                              <span className="text-[10px] uppercase tracking-wider text-gold-500 font-mono font-semibold block mb-1">
                                {product.category}
                              </span>
                              <h3 
                                onClick={() => { setSelectedProductId(product.id); setView('product-detail'); }}
                                className="text-xs sm:text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-50 hover:text-gold-500 transition-colors line-clamp-1 cursor-pointer"
                              >
                                {product.name}
                              </h3>
                            </div>

                            <div className="mt-auto">
                              <div className="flex items-center gap-1 text-gold-500 text-[11px] mb-2 font-semibold">
                                <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                                <span className="font-mono">{product.rating}</span>
                                <span className="text-stone-400">({product.reviewsCount})</span>
                              </div>

                              <div className="flex items-baseline gap-2">
                                <span className="text-xs sm:text-sm font-bold font-mono text-stone-900 dark:text-stone-100">
                                  Rs. {product.price.toLocaleString()}
                                </span>
                                <span className="text-[11px] font-mono text-stone-400 line-through">
                                  Rs. {product.originalPrice.toLocaleString()}
                                </span>
                              </div>

                              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex gap-1.5">
                                <button 
                                  onClick={() => { setSelectedProductId(product.id); setView('product-detail'); }}
                                  className="w-1/2 py-2 border border-stone-200 dark:border-stone-800 text-[10px] uppercase font-bold tracking-widest text-stone-700 dark:text-stone-300 rounded hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-95 transition-all cursor-pointer"
                                >
                                  Specs
                                </button>
                                <button 
                                  onClick={() => addToCart(product, product.sizes[1] || 'M', product.colors[0], 1)}
                                  className="w-1/2 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-950 text-[10px] uppercase font-bold tracking-widest rounded hover:bg-gold-500 dark:hover:bg-gold-500 hover:text-stone-950 dark:hover:text-stone-950 active:scale-95 transition-all cursor-pointer"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* VIEW 3: PRODUCT DETAIL PAGE (PDP) */}
        {view === 'product-detail' && (() => {
          const product = PRODUCTS.find((p) => p.id === selectedProductId) || PRODUCTS[0];
          const isWishlisted = wishlist.includes(product.id);
          const currentPrice = product.price;
          const initialColor = selectedColor || product.colors[0];
          
          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              
              {/* Back breadcrumb navigation */}
              <div className="mb-6">
                <button 
                  onClick={() => setView('shop')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 dark:hover:text-stone-50 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Catalog
                </button>
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                
                {/* LEFT COLUMN: SWIPEABLE IMAGES GALLERY (Takes 6 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Primary Large Image Frame */}
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 dark:border-stone-900 relative shadow-md">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Corner badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
                      {product.isNew && <span className="bg-stone-950 text-gold-100 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm">NEW SPEC</span>}
                      {product.isSale && <span className="bg-gold-500 text-stone-950 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm">-{product.discount}% INTRO</span>}
                    </div>
                  </div>

                  {/* Multi-angle thumb scroller */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex gap-3">
                      {product.images.map((imgUrl, idx) => (
                        <div 
                          key={idx}
                          className="w-24 h-18 rounded-lg overflow-hidden border-2 border-gold-500/80 bg-stone-900 cursor-pointer"
                        >
                          <img src={imgUrl} alt={`${product.name} view ${idx}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: STABLE CONTIGUOUS PURCHASE MODULE (Takes 5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gold-500 font-mono">
                      {product.category}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display text-stone-900 dark:text-stone-100 mt-1 mb-2">
                      {product.name}
                    </h1>

                    {/* Star feedback reviews */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex gap-0.5 text-gold-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
                        ))}
                      </div>
                      <span className="font-mono font-bold text-stone-900 dark:text-stone-50">{product.rating}</span>
                      <span className="text-stone-400">({product.reviewsCount} Verified Riders)</span>
                    </div>
                  </div>

                  {/* Dynamic Pricing Layout */}
                  <div className="p-4 bg-stone-100 dark:bg-stone-900 rounded-xl border border-stone-200/55 dark:border-stone-800/55">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-50">
                        Rs. {currentPrice.toLocaleString()}
                      </span>
                      <span className="text-sm font-mono text-stone-400 line-through">
                        Rs. {product.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-gold-500 tracking-wider">
                        (You Save Rs. {(product.originalPrice - currentPrice).toLocaleString()})
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-gold-500 animate-bounce" />
                      <span>Complimentary shipping applied to this premium jacket order.</span>
                    </div>
                  </div>

                  {/* Color variant selectors */}
                  <div>
                    <span className="text-[11px] uppercase tracking-widest font-bold text-stone-400 block mb-2 font-mono">
                      Selected Color: {initialColor}
                    </span>
                    <div className="flex gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                            initialColor === color
                              ? 'bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 border-transparent shadow'
                              : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-gold-500/40'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sizing Grid with stock status warnings */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] uppercase tracking-widest font-bold text-stone-400 font-mono">
                        Select Sizing: {selectedSize}
                      </span>
                      <button 
                        onClick={() => setView('faq')}
                        className="text-[11px] font-bold uppercase text-gold-500 hover:underline tracking-wide"
                      >
                        Sizing Guide
                      </button>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`py-3 text-xs font-bold font-mono rounded-lg border transition-all ${
                            selectedSize === sz
                              ? 'bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 border-transparent shadow-md'
                              : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-gold-500'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity and Controls Wrapper */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-lg">
                      <button 
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="px-3 py-2 text-stone-500 hover:text-stone-950 dark:hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 font-mono font-bold text-sm text-stone-800 dark:text-stone-100">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(q => q + 1)}
                        className="px-3 py-2 text-stone-500 hover:text-stone-950 dark:hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button 
                      onClick={() => toggleWishlist(product.id, product.name)}
                      className="px-4 py-3 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-900 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer flex-shrink-0"
                      title="Wishlist"
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500 border-none' : ''}`} />
                    </button>
                  </div>

                  {/* CALL TO ACTIONS */}
                  <div className="space-y-3 pt-2">
                    
                    {/* Add to Standard Local Bag */}
                    <button 
                      onClick={() => addToCart(product, selectedSize, initialColor, quantity)}
                      className="w-full h-12 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-50 dark:text-stone-950 text-xs font-bold uppercase tracking-widest rounded-lg transition-transform active:scale-[0.98] cursor-pointer min-h-[48px]"
                    >
                      Add to Custom Leather Bag
                    </button>

                    {/* Direct High-Converting Checkout via WhatsApp Button */}
                    <button 
                      onClick={() => triggerSingleProductWhatsApp(product, selectedSize, initialColor)}
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] animate-pulse-gold cursor-pointer min-h-[48px]"
                    >
                      <Phone className="w-4.5 h-4.5 fill-white text-emerald-600" />
                      Order on WhatsApp (Instant COD)
                    </button>
                  </div>

                  {/* Tabbed accordion specification data */}
                  <div className="border-t border-stone-200 dark:border-stone-800 pt-6">
                    <div className="flex gap-4 border-b border-stone-200 dark:border-stone-800 pb-2 mb-4 text-xs font-bold uppercase tracking-widest">
                      {['details', 'specifications', 'care'].map((tb) => (
                        <button
                          key={tb}
                          onClick={() => setActiveTab(tb as any)}
                          className={`pb-2 hover:text-gold-500 transition-colors ${activeTab === tb ? 'text-gold-500 border-b-2 border-gold-500' : 'text-stone-400'}`}
                        >
                          {tb}
                        </button>
                      ))}
                    </div>

                    <div className="text-xs leading-relaxed text-stone-600 dark:text-stone-400 font-sans">
                      {activeTab === 'details' && (
                        <div className="space-y-3">
                          <p>{product.description}</p>
                          <p className="font-bold text-stone-900 dark:text-stone-200">Material Composition: <span className="font-normal text-stone-600 dark:text-stone-400">{product.material}</span></p>
                        </div>
                      )}
                      {activeTab === 'specifications' && (
                        <ul className="list-disc pl-4 space-y-1">
                          {product.specifications.split(';').map((s, idx) => (
                            <li key={idx}>{s.trim()}</li>
                          ))}
                        </ul>
                      )}
                      {activeTab === 'care' && (
                        <p className="italic">{product.care}</p>
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* Related/Recently Viewed Products block */}
              {recentlyViewed.filter(id => id !== product.id).length > 0 && (
                <div className="border-t border-stone-200 dark:border-stone-900 pt-16 mt-16">
                  <h3 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100 mb-6">
                    Your Recently Viewed Jackets
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recentlyViewed
                      .filter(id => id !== product.id)
                      .slice(0, 4)
                      .map(id => PRODUCTS.find(p => p.id === id))
                      .filter((p): p is Product => !!p)
                      .map(p => (
                        <div 
                          key={p.id}
                          onClick={() => { setSelectedProductId(p.id); setQuantity(1); }}
                          className="border border-stone-200 dark:border-stone-800 rounded-xl p-3 bg-white dark:bg-stone-900 cursor-pointer flex items-center gap-3 hover:shadow-md transition-shadow"
                        >
                          <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg" />
                          <div>
                            <span className="text-[11px] font-bold text-stone-900 dark:text-stone-100 line-clamp-1">{p.name}</span>
                            <span className="text-[10px] text-stone-400 font-mono">Rs. {p.price.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </div>
          );
        })()}

        {/* VIEW 4: WISHLIST VIEW */}
        {view === 'wishlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 border-b border-stone-200 dark:border-stone-900 pb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-500 block mb-1 font-mono">My Vault</span>
              <h1 className="text-3xl font-bold font-display tracking-tight text-stone-900 dark:text-stone-100">
                Premium Wishlist
              </h1>
            </div>

            {wishlist.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md mx-auto p-8">
                <Heart className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100 mb-2">Wishlist is Empty</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
                  You haven't locked any premium jackets in your wishlist vault yet. Add designs to track them here.
                </p>
                <button 
                  onClick={() => setView('shop')}
                  className="px-6 py-3 bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-950 text-xs font-bold uppercase tracking-widest rounded hover:bg-gold-500 dark:hover:bg-gold-500 hover:text-stone-950 transition-all cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlist.map((id) => {
                  const product = PRODUCTS.find((p) => p.id === id);
                  if (!product) return null;
                  return (
                    <div 
                      key={product.id}
                      className="group bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 cursor-pointer" onClick={() => { setSelectedProductId(product.id); setView('product-detail'); }}>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                        />
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            toggleWishlist(product.id, product.name); 
                          }}
                          className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors z-20 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-gold-500 font-mono font-semibold block mb-1">
                            {product.category}
                          </span>
                          <h3 
                            onClick={() => { setSelectedProductId(product.id); setView('product-detail'); }}
                            className="text-xs sm:text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-50 hover:text-gold-500 transition-colors line-clamp-1 cursor-pointer"
                          >
                            {product.name}
                          </h3>
                        </div>

                        <div className="mt-4">
                          <span className="text-xs sm:text-sm font-bold font-mono text-stone-900 dark:text-stone-100 block mb-4">
                            Rs. {product.price.toLocaleString()}
                          </span>

                          <button 
                            onClick={() => {
                              addToCart(product, product.sizes[1] || 'M', product.colors[0], 1);
                              toggleWishlist(product.id, product.name);
                            }}
                            className="w-full py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-gold-500 dark:hover:bg-gold-500 hover:text-stone-950 dark:hover:text-stone-950 text-stone-50 dark:text-stone-950 text-[10px] uppercase font-bold tracking-widest rounded transition-all cursor-pointer"
                          >
                            Move to Bag
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: CART DETAIL PAGE */}
        {view === 'cart' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 border-b border-stone-200 dark:border-stone-900 pb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-500 block mb-1 font-mono">My Selection</span>
              <h1 className="text-3xl font-bold font-display tracking-tight text-stone-900 dark:text-stone-100">
                Shopping Bag
              </h1>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md mx-auto p-8">
                <ShoppingBag className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100 mb-2">Your Bag is Empty</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
                  You haven't selected any premium leather apparel yet. Browse our collections and pack your bag.
                </p>
                <button 
                  onClick={() => setView('shop')}
                  className="px-6 py-3 bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-950 text-xs font-bold uppercase tracking-widest rounded hover:bg-gold-500 dark:hover:bg-gold-500 hover:text-stone-950 transition-all cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* CART ITEMS LIST */}
                <div className="lg:col-span-8 space-y-4">
                  {cart.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60 rounded-xl p-4 flex gap-4 items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        {/* Image */}
                        <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden bg-stone-100 border border-stone-100 dark:border-stone-800">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover object-center" />
                        </div>

                        {/* Text labels */}
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 leading-tight">
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-stone-400 mt-1 font-mono uppercase">
                            <span>Size: {item.size}</span>
                            <span>·</span>
                            <span>Color: {item.color}</span>
                          </div>
                          <span className="text-xs font-bold font-mono text-stone-900 dark:text-stone-50 block mt-1.5">
                            Rs. {item.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Steppers & Delete actions */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-lg bg-stone-50 dark:bg-stone-950">
                          <button 
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="px-2 py-1 text-stone-500 hover:text-stone-950 dark:hover:text-white min-w-[36px] min-h-[36px] flex items-center justify-center"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 font-mono font-bold text-xs text-stone-800 dark:text-stone-100">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="px-2 py-1 text-stone-500 hover:text-stone-950 dark:hover:text-white min-w-[36px] min-h-[36px] flex items-center justify-center"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button 
                          onClick={() => removeFromCart(item.id, item.name)}
                          className="text-stone-400 hover:text-red-500 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                          title="Delete Item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* SUMMARY ORDER DETAILS AND CHECKOUT REDIRECT */}
                <div className="lg:col-span-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-6">
                  <h3 className="font-bold text-sm tracking-widest uppercase text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-3">
                    Bag Summary
                  </h3>

                  {/* Calculations - tabular numbers */}
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between text-stone-500 dark:text-stone-400">
                      <span>Bag Subtotal</span>
                      <span className="font-mono text-stone-800 dark:text-stone-200">Rs. {getSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-stone-500 dark:text-stone-400">
                      <span>Shipping Fee</span>
                      <span className="font-mono text-stone-800 dark:text-stone-200">
                        {getShipping(getSubtotal()) === 0 ? 'FREE' : `Rs. ${getShipping(getSubtotal()).toLocaleString()}`}
                      </span>
                    </div>

                    {appliedDiscountPercentage > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Guild Discount (10% Off)</span>
                        <span className="font-mono">-Rs. {getDiscount(getSubtotal()).toLocaleString()}</span>
                      </div>
                    )}

                    <div className="border-t border-stone-100 dark:border-stone-800 pt-3 flex justify-between font-bold text-stone-900 dark:text-stone-50 text-sm">
                      <span>Total Amount</span>
                      <span className="font-mono text-gold-500">Rs. {getTotal().toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Promo Coupons Entry */}
                  <div className="pt-2">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Promo Code" 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-grow px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded outline-none uppercase text-stone-900 dark:text-white"
                      />
                      <button 
                        onClick={applyPromoCode}
                        className="px-4 py-2 bg-stone-900 dark:bg-stone-100 hover:bg-gold-500 hover:text-stone-950 text-stone-50 dark:text-stone-950 text-xs font-bold uppercase tracking-wider rounded transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && <p className="text-[10px] text-red-500 mt-1 font-semibold">{promoError}</p>}
                    {appliedDiscountPercentage > 0 && <p className="text-[10px] text-emerald-500 mt-1 font-semibold">BOLD10 Applied successfully!</p>}
                  </div>

                  {/* Main Proceed Checkout CTA */}
                  <button 
                    onClick={() => setView('checkout')}
                    className="w-full h-12 bg-stone-900 dark:bg-stone-50 text-stone-100 dark:text-stone-950 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-gold-500 dark:hover:bg-gold-500 hover:text-stone-950 dark:hover:text-stone-950 transition-all cursor-pointer min-h-[48px]"
                  >
                    Proceed to Delivery Options
                  </button>
                  
                  <div className="text-center pt-2">
                    <button 
                      onClick={() => setView('shop')}
                      className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 text-[11px] font-semibold underline uppercase tracking-wider"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* VIEW 6: CHECKOUT & WHATSAPP GENERATION PAGE */}
        {view === 'checkout' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 border-b border-stone-200 dark:border-stone-900 pb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-500 block mb-1 font-mono">Direct COD Verification</span>
              <h1 className="text-3xl font-bold font-display tracking-tight text-stone-900 dark:text-stone-100">
                WhatsApp Premium Checkout
              </h1>
            </div>

            {checkoutStep === 'form' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                
                {/* LEFT: CUSTOMER DETAILS FORM */}
                <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                  <h2 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-3 mb-6">
                    Customer & Shipping Details
                  </h2>

                  <form onSubmit={triggerWhatsAppCheckout} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 block mb-1">Full Name *</label>
                        <input 
                          type="text" 
                          required
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                          placeholder="Your Name"
                          className="w-full px-4 py-3 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded outline-none focus:border-gold-500 text-stone-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 block mb-1">WhatsApp Mobile *</label>
                        <input 
                          type="tel" 
                          required
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                          placeholder="03XXXXXXXXX"
                          className="w-full px-4 py-3 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded outline-none focus:border-gold-500 text-stone-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 block mb-1">Email Address (Optional)</label>
                      <input 
                        type="email" 
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        placeholder="rider@example.com"
                        className="w-full px-4 py-3 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded outline-none focus:border-gold-500 text-stone-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 block mb-1">Street Address / House *</label>
                      <input 
                        type="text" 
                        required
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                        placeholder="House #, Street name, Sector/Block"
                        className="w-full px-4 py-3 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded outline-none focus:border-gold-500 text-stone-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 block mb-1">Area / Locality *</label>
                        <input 
                          type="text" 
                          required
                          value={customerInfo.area}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, area: e.target.value })}
                          placeholder="DHA / Gulberg"
                          className="w-full px-4 py-3 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded outline-none focus:border-gold-500 text-stone-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 block mb-1">City *</label>
                        <input 
                          type="text" 
                          required
                          value={customerInfo.city}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                          placeholder="Lahore / Karachi"
                          className="w-full px-4 py-3 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded outline-none focus:border-gold-500 text-stone-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 block mb-1">Postal Code *</label>
                        <input 
                          type="text" 
                          required
                          value={customerInfo.postalCode}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, postalCode: e.target.value })}
                          placeholder="54000"
                          className="w-full px-4 py-3 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded outline-none focus:border-gold-500 text-stone-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 block mb-1">Delivery Instructions / Notes (Optional)</label>
                      <textarea 
                        rows={3}
                        value={customerInfo.notes}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                        placeholder="Please call before delivery or any specific instructions."
                        className="w-full px-4 py-3 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded outline-none focus:border-gold-500 text-stone-900 dark:text-white"
                      />
                    </div>

                    <div className="pt-4 flex flex-col gap-2">
                      <button 
                        type="submit"
                        className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer min-h-[48px]"
                      >
                        <Phone className="w-5 h-5 fill-white text-emerald-600" />
                        Send Order to WhatsApp (Initiate Delivery)
                      </button>
                      <span className="text-[10px] text-stone-400 text-center block leading-relaxed mt-1">
                        🔒 No pre-payment required. This launches a secure chat containing your compiled item specifications and address. Final verification is handled manually.
                      </span>
                    </div>
                  </form>
                </div>

                {/* RIGHT: ORDER SUMMARY DETAIL BOX */}
                <div className="lg:col-span-5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gold-500 border-b border-stone-200 dark:border-stone-800 pb-3">
                    Your Premium Selection
                  </h2>

                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center justify-between py-1">
                        <div className="flex gap-3 items-center">
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                          <div>
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1">{item.name}</span>
                            <span className="text-[10px] text-stone-400 font-mono">Size: {item.size} · {item.color} · Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold font-mono text-stone-800 dark:text-stone-200">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-stone-200 dark:border-stone-800 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-stone-500">
                      <span>Subtotal</span>
                      <span className="font-mono">Rs. {getSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>Shipping Cost</span>
                      <span className="font-mono">{getShipping(getSubtotal()) === 0 ? 'FREE' : `Rs. ${getShipping(getSubtotal()).toLocaleString()}`}</span>
                    </div>
                    {appliedDiscountPercentage > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Coupon Discount</span>
                        <span className="font-mono">-Rs. {getDiscount(getSubtotal()).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-stone-200 dark:border-stone-800 pt-2 flex justify-between text-sm font-bold text-stone-900 dark:text-stone-50">
                      <span>Total Invoice</span>
                      <span className="font-mono text-gold-500">Rs. {getTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              // SUCCESS CONGRETULATION PAGE
              <div className="max-w-xl mx-auto text-center py-16 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-8">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
                <h2 className="text-2xl font-bold font-display text-stone-900 dark:text-stone-50 mb-3 text-wrap-balance">
                  Your Order Details are Ready in WhatsApp!
                </h2>
                <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm mb-8 leading-relaxed">
                  We have loaded your customized jacket specifications, sizing values, and home address details directly into WhatsApp click-to-chat. 
                  <strong className="block text-gold-500 mt-2 font-mono uppercase tracking-wide">Please press "Send" in WhatsApp to dispatch and verify your COD delivery.</strong>
                </p>

                <div className="bg-stone-50 dark:bg-stone-950 rounded-xl p-4 text-left border border-stone-100 dark:border-stone-900 mb-8 space-y-1.5">
                  <span className="text-[10px] text-stone-400 font-bold block uppercase font-mono">Next Steps to Complete Order:</span>
                  <p className="text-xs text-stone-500 leading-relaxed">1. If WhatsApp didn't open automatically, look at the active window popup.</p>
                  <p className="text-xs text-stone-500 leading-relaxed">2. Send the pre-formatted text message to our business agent.</p>
                  <p className="text-xs text-stone-500 leading-relaxed">3. Our customer care will reply to confirm size verification and dispatch timing.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => { setCheckoutStep('form'); setView('home'); }}
                    className="w-full sm:w-1/2 py-3 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-950 text-xs font-bold uppercase tracking-widest rounded hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    Return Home
                  </button>
                  <button 
                    onClick={() => setView('order-history')}
                    className="w-full sm:w-1/2 py-3 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold uppercase tracking-widest rounded hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors cursor-pointer"
                  >
                    View Order History
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 7: ABOUT PAGE */}
        {view === 'about' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-500 block mb-2 font-mono">The Manifesto</span>
              <h1 className="text-4xl font-bold font-display text-stone-900 dark:text-stone-100 text-wrap-balance mb-4">
                The Leather Jack Story
              </h1>
              <p className="text-xs sm:text-sm text-stone-500">
                Crafting luxury leather shields designed to defy age, wear, and changing trends.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                <p>
                  Leather Jack was founded in the pursuit of the ultimate jacket: an armor of absolute premium quality, tailored to sit like a second skin, carrying a bold design attitude without being noisy.
                </p>
                <p>
                  Every skin is individually picked from ethical local farms. We hand-inspect for grain density, pore structure, and thickness consistency. We prioritize vegetable-tanned cowhide, butter-soft lambskins, and premium sateen suede to ensure maximum tactile pleasure and lifelong flexibility.
                </p>
                
                <div className="border-l-2 border-gold-500 pl-4 py-1 italic text-stone-900 dark:text-stone-100 font-display text-base">
                  "We do not create temporary fashion. We construct generational pieces that capture your adventures, creases, and memories."
                </div>

                <p>
                  Today, we serve a global community of riders, artists, and modern rebels who appreciate raw details, precise cuts, and unmatched longevity. By using WhatsApp direct verification, we bypass bloated shipping agents and expensive payment processing delays, bringing craftsmanship to your doorstep at a highly optimized value.
                </p>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-xl border border-stone-200 dark:border-stone-900 bg-stone-900">
                <img 
                  src="/src/assets/images/hero_leather_jacket_campaign_1791463841928.jpg" 
                  alt="High fashion leather manufacturing" 
                  className="w-full aspect-[4/3] object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 8: CONTACT PAGE */}
        {view === 'contact' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-500 block mb-2 font-mono">Rider Concierge</span>
              <h1 className="text-4xl font-bold font-display text-stone-900 dark:text-stone-100 mb-4">
                Get in Touch
              </h1>
              <p className="text-xs sm:text-sm text-stone-500">
                Have questions about fit, sleeve length, or customized leather variants? Speak directly with us.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* CONTACT DETAILS CARDS */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60 rounded-xl p-6 space-y-6">
                  
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-stone-100 dark:bg-stone-950 text-gold-500 rounded-lg">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">WhatsApp Call & Chat</span>
                      <p className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-50 mt-1">{BRAND_CONFIG.whatsappNumber}</p>
                      <a 
                        href={`https://wa.me/${BRAND_CONFIG.whatsappNumber.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-gold-500 hover:underline font-bold mt-1 inline-block"
                      >
                        Launch Live Chat Support →
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-stone-100 dark:bg-stone-950 text-gold-500 rounded-lg">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Concierge Email</span>
                      <p className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-50 mt-1">{BRAND_CONFIG.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-stone-100 dark:bg-stone-950 text-gold-500 rounded-lg">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Atelier Address</span>
                      <p className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-50 mt-1 leading-snug">{BRAND_CONFIG.address}</p>
                    </div>
                  </div>

                </div>

                {/* DIRECT CHAT QUICK SHORTCUT */}
                <a 
                  href={`https://wa.me/${BRAND_CONFIG.whatsappNumber.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Phone className="w-4.5 h-4.5 fill-white text-emerald-600" />
                  Chat instantly on WhatsApp
                </a>

              </div>

              {/* OFFLINE ENQUIRY CONCIERGE FORM */}
              <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                <h2 className="text-lg font-bold font-display text-stone-900 dark:text-stone-50 border-b border-stone-100 dark:border-stone-800 pb-3 mb-6">
                  Online Enquiry Form
                </h2>

                <form onSubmit={(e) => { e.preventDefault(); triggerToast('Message dispatched! Our concierge team will reach back shortly.'); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Your Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Rider Name"
                        className="w-full px-4 py-3 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded outline-none focus:border-gold-500 text-stone-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Email / WhatsApp</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Email or Phone Number"
                        className="w-full px-4 py-3 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded outline-none focus:border-gold-500 text-stone-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Subject</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Size Consultation / Custon Fitting / Order Issue"
                      className="w-full px-4 py-3 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded outline-none focus:border-gold-500 text-stone-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Message Detail</label>
                    <textarea 
                      rows={5} 
                      required 
                      placeholder="Explain your queries..."
                      className="w-full px-4 py-3 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded outline-none focus:border-gold-500 text-stone-900 dark:text-white"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-stone-900 dark:bg-stone-100 hover:bg-gold-500 text-stone-50 dark:text-stone-950 hover:text-stone-950 text-xs font-bold uppercase tracking-widest rounded transition-all cursor-pointer min-h-[44px]"
                  >
                    Send Concierge Ticket
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 9: ORDER HISTORY PAGE */}
        {view === 'order-history' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 border-b border-stone-200 dark:border-stone-900 pb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-500 block mb-1 font-mono">Mock Tracking</span>
              <h1 className="text-3xl font-bold font-display tracking-tight text-stone-900 dark:text-stone-100">
                Local Order Vault
              </h1>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md mx-auto p-8">
                <History className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100 mb-2">No Orders Located</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
                  You haven't initiated any WhatsApp orders during this browser session. Secure some leather pieces first!
                </p>
                <button 
                  onClick={() => setView('shop')}
                  className="px-6 py-3 bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-950 text-xs font-bold uppercase tracking-widest rounded hover:bg-gold-500 dark:hover:bg-gold-500 hover:text-stone-950 transition-all cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                {orders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-4">
                      <div>
                        <span className="text-[10px] text-stone-400 tracking-wider block font-mono">Invoice reference</span>
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-50">{order.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 tracking-wider block font-mono">Transaction Date</span>
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{order.date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 tracking-wider block font-mono">Verification Status</span>
                        <span className="text-xs font-bold tracking-wide uppercase px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-950 text-gold-500 font-mono border border-gold-500/35">
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                            <div>
                              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-none">{item.name}</span>
                              <span className="text-[10px] text-stone-400 block font-mono mt-1">Size: {item.size} · Color: {item.color} · Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-stone-100 dark:border-stone-800 pt-4 flex flex-wrap justify-between items-center text-xs gap-3">
                      <div className="text-stone-400">
                        Recipient: <strong className="text-stone-700 dark:text-stone-200 font-bold">{order.customerName}</strong>
                      </div>
                      <div className="font-bold text-stone-900 dark:text-stone-50 text-sm">
                        Total Invoice: <span className="font-mono text-gold-500">Rs. {order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 10: FAQ PAGE */}
        {view === 'faq' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-500 block mb-2 font-mono">Anatomy of Fit</span>
              <h1 className="text-4xl font-bold font-display text-stone-900 dark:text-stone-100 mb-4">
                FAQ & Sizing Matrix
              </h1>
              <p className="text-xs sm:text-sm text-stone-500">
                Care instructions, checkout details, and absolute guide to perfect sleeve fitting.
              </p>
            </div>

            {/* SIZING TABLE CARD */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-md mb-12 overflow-x-auto">
              <h2 className="text-sm font-bold uppercase tracking-widest text-stone-900 dark:text-stone-100 mb-4 font-mono">
                Men's Sizing Matrix (Inches)
              </h2>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 font-bold uppercase tracking-wide">
                    <th className="py-2.5">Size</th>
                    <th className="py-2.5">Chest Fitting</th>
                    <th className="py-2.5">Shoulder Width</th>
                    <th className="py-2.5">Sleeve length</th>
                    <th className="py-2.5">Waist Sweep</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300 font-mono">
                  <tr>
                    <td className="py-3 font-bold text-stone-900 dark:text-stone-100">XS</td>
                    <td className="py-3">34 - 36</td>
                    <td className="py-3">17.0</td>
                    <td className="py-3">24.5</td>
                    <td className="py-3">33</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-stone-900 dark:text-stone-100">S</td>
                    <td className="py-3">36 - 38</td>
                    <td className="py-3">17.5</td>
                    <td className="py-3">25.0</td>
                    <td className="py-3">35</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-stone-900 dark:text-stone-100">M</td>
                    <td className="py-3">38 - 40</td>
                    <td className="py-3">18.0</td>
                    <td className="py-3">25.5</td>
                    <td className="py-3">37</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-stone-900 dark:text-stone-100">L</td>
                    <td className="py-3">40 - 42</td>
                    <td className="py-3">18.5</td>
                    <td className="py-3">26.0</td>
                    <td className="py-3">39</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-stone-900 dark:text-stone-100">XL</td>
                    <td className="py-3">42 - 44</td>
                    <td className="py-3">19.0</td>
                    <td className="py-3">26.5</td>
                    <td className="py-3">41</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-stone-900 dark:text-stone-100">XXL</td>
                    <td className="py-3">44 - 46</td>
                    <td className="py-3">19.5</td>
                    <td className="py-3">27.0</td>
                    <td className="py-3">43</td>
                  </tr>
                </tbody>
              </table>
              <span className="text-[10px] text-stone-400 italic block mt-4 font-sans">
                💡 Tip: If you plan on wearing heavy hoodies or knit sweaters underneath, we suggest sizing up exactly 1 step.
              </span>
            </div>

            {/* Q&A Accordion Block */}
            <div className="space-y-4">
              {[
                { q: 'How does checkout via WhatsApp work?', a: 'Once you complete your address fields in the form, a pre-encoded text invoice listing your specifications is formatted and passed to WhatsApp click-to-chat. Simply send that message to our Atelier number, and our concierge will process size verification and shipment. No card entries are required on this website.' },
                { q: 'What materials do you use?', a: 'We construct exclusively using grade-A materials: thick 1.2mm full-grain cowhide for heavy-weight biker armor, super-soft Napa lambskin for tailored lightweight fits, and premium sateen suede from Italy.' },
                { q: 'Can I return or exchange my jacket?', a: 'Absolutely. We offer a 14-day premium return/exchange window on unworn jackets. Simply message our WhatsApp concierge, and we will arrange a return courier pickup from your location.' },
                { q: 'Where do you dispatch from?', a: 'All items are custom crafted and shipped from Lahore, Pakistan, utilizing local premium raw hide tanneries famous worldwide for high-end fashion outerwear.' }
              ].map((qa, idx) => (
                <div key={idx} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 space-y-2">
                  <h3 className="font-bold text-xs sm:text-sm tracking-wide text-stone-900 dark:text-stone-100 font-sans flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-gold-500 shrink-0" />
                    {qa.q}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed pl-6 font-sans">
                    {qa.a}
                  </p>
                </div>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-stone-950 text-stone-400 text-xs py-16 border-t border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 mb-12">
            
            <div className="col-span-2 md:col-span-4 space-y-4">
              <span className="text-lg font-bold font-display tracking-widest text-stone-100 uppercase">Leather Jack</span>
              <p className="text-stone-500 text-[11px] leading-relaxed max-w-sm">
                Built for the bold. Modern luxury outerwear crafted by hand from the finest hides. Tailored to survive lifetimes.
              </p>
              <div className="pt-2">
                <span className="text-[10px] text-stone-500 block uppercase tracking-wider mb-2 font-mono">Connect with Atelier</span>
                <p className="text-stone-300 font-semibold">{BRAND_CONFIG.phone}</p>
                <p className="text-stone-500">{BRAND_CONFIG.email}</p>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-3">
              <span className="font-bold text-stone-100 uppercase text-[10px] tracking-wider block font-mono">Catalog</span>
              <div className="flex flex-col gap-2 text-[11px]">
                <button onClick={() => { setFilters(f => ({ ...f, category: 'All' })); setView('shop'); }} className="text-left hover:text-white transition-colors cursor-pointer">All Jackets</button>
                <button onClick={() => selectCategory('Biker Jackets')} className="text-left hover:text-white transition-colors cursor-pointer">Biker Jackets</button>
                <button onClick={() => selectCategory('Bomber Jackets')} className="text-left hover:text-white transition-colors cursor-pointer">Bomber Jackets</button>
                <button onClick={() => selectCategory('Vintage Jackets')} className="text-left hover:text-white transition-colors cursor-pointer">Vintage Distressed</button>
                <button onClick={() => selectCategory('Women\'s Jackets')} className="text-left hover:text-white transition-colors cursor-pointer">Women's Silhouettes</button>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-3">
              <span className="font-bold text-stone-100 uppercase text-[10px] tracking-wider block font-mono">Customer Care</span>
              <div className="flex flex-col gap-2 text-[11px]">
                <button onClick={() => setView('contact')} className="text-left hover:text-white transition-colors cursor-pointer">Contact Support</button>
                <button onClick={() => setView('faq')} className="text-left hover:text-white transition-colors cursor-pointer">Sizing Matrices</button>
                <button onClick={() => setView('order-history')} className="text-left hover:text-white transition-colors cursor-pointer">Track Deliveries</button>
                <a href={`https://wa.me/${BRAND_CONFIG.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">WhatsApp Concierge</a>
              </div>
            </div>

            <div className="col-span-2 md:col-span-4 space-y-3">
              <span className="font-bold text-stone-100 uppercase text-[10px] tracking-wider block font-mono">Our Heritage</span>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Handcrafted at our specialized atelier in Lahore, Pakistan. Combining centuries of master leather tanning heritage with sleek high-fashion cuts.
              </p>
              <div className="flex gap-4 pt-2 text-stone-500">
                <span className="hover:text-white transition-colors cursor-pointer uppercase text-[10px] tracking-widest font-bold">Instagram</span>
                <span className="hover:text-white transition-colors cursor-pointer uppercase text-[10px] tracking-widest font-bold">TikTok</span>
                <span className="hover:text-white transition-colors cursor-pointer uppercase text-[10px] tracking-widest font-bold">Facebook</span>
              </div>
            </div>

          </div>

          <div className="border-t border-stone-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-stone-600 font-mono">
            <span>© {new Date().getFullYear()} Leather Jack Atelier. All Rights Reserved.</span>
            <div className="flex gap-4">
              <span className="hover:text-stone-400 cursor-pointer">Privacy Policy</span>
              <span>·</span>
              <span className="hover:text-stone-400 cursor-pointer">Terms & Conditions</span>
              <span>·</span>
              <span className="hover:text-stone-400 cursor-pointer">Atelier Terms</span>
            </div>
          </div>
        </div>
      </footer>

      {/* FLOATING WHATSAPP FLOATER WIDGET (compliance pattern) */}
      <a 
        href={`https://wa.me/${BRAND_CONFIG.whatsappNumber.replace(/\D/g, '')}`} 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-45 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-2xl flex items-center justify-center hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer border border-emerald-500 animate-pulse-gold min-w-[52px] min-h-[52px]"
        aria-label="Chat with Concierge"
        title="Chat with Concierge"
      >
        <Phone className="w-6.5 h-6.5 fill-white text-emerald-600" />
      </a>

    </div>
  );
}
