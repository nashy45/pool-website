// Global state
let cart = [];
let businessSettings = {};
let currentReservationType = 'pool_table';
let currentLanguage = 'en';

const translations = {
  en: {
    toggleNavigation: 'Toggle navigation',
    switchTheme: 'Switch to {theme} mode',
    lightMode: 'Light',
    darkMode: 'Dark',
    selectLanguage: 'Select language',
    home: 'Home',
    menu: 'Menu',
    reservations: 'Reservations',
    contact: 'Contact',
    tagline: 'Play • Eat • Drink • Relax',
    viewMenu: 'View Menu',
    orderNow: 'Order Now',
    makeReservation: 'Make a Reservation',
    heroLocation: 'Bonabéri, Douala • Behind Ancien Sonel',
    pauseVideo: 'Pause background video',
    barSnacks: 'Bar & Snacks',
    premiumDrinksSnacks: 'Premium drinks and delicious snacks',
    restaurant: 'Restaurant',
    freshMeals: 'Fresh meals and local cuisine',
    poolSnooker: 'Pool/Snooker',
    professionalTables: 'Professional pool tables',
    meals: 'Meals',
    snacks: 'Snacks',
    drinks: 'Drinks',
    premiumSelection: 'Our Premium Selection',
    menuSubtitle: 'Finest Spirits, Champagnes & Cocktails',
    orderingFor: 'You are ordering for',
    loadingMenu: 'Loading menu...',
    menuUpdating: 'Menu is being updated. Please check back soon!',
    menuLoadError: 'Error loading menu. Please refresh the page.',
    daysPerWeek: '7 days a week',
    poolTable: 'Pool Table',
    diningTable: 'Dining Table',
    eventGroup: 'Event/Group',
    yourName: 'Your Name *',
    phoneNumber: 'Phone Number *',
    selectTableSpace: 'Select Table/Space *',
    choose: 'Choose...',
    date: 'Date *',
    startTime: 'Start Time *',
    durationMinutes: 'Duration (minutes) *',
    minutes30: '30 minutes',
    hour1: '1 hour',
    hours1Half: '1.5 hours',
    hours2: '2 hours',
    hours3: '3 hours',
    hours4: '4 hours',
    groupSize: 'Group Size *',
    specialRequests: 'Special Requests',
    submitReservation: 'Submit Reservation',
    findUs: 'Find Us',
    location: 'Location',
    businessLocationFallback: 'Bonabéri, Douala, behind Ancien Sonel',
    phone: 'Phone',
    openingHours: 'Opening Hours',
    opensAt: 'Opens at',
    copyright: '© 2026 Pool\'s Arena Club & Bar. All rights reserved.',
    yourOrder: 'Your Order',
    total: 'Total:',
    continueShopping: 'Continue Shopping',
    checkout: 'Checkout',
    completeOrder: 'Complete Your Order',
    paymentMethod: 'Payment Method *',
    selectPaymentMethod: 'Select payment method',
    mtnMoney: 'MTN Mobile Money',
    orangeMoney: 'Orange Money / Max it',
    specialInstructions: 'Special Instructions',
    totalAmount: 'Total Amount:',
    placeOrder: 'Place Order',
    success: '✓ Success!',
    close: 'Close',
    order: 'Order',
    reserve: 'Reserve',
    addToCart: '🛒 Add to Cart',
    soldOut: '❌ Sold Out',
    added: '✓ Added!',
    cartEmpty: 'Your cart is empty',
    noTablesAvailable: 'No tables available',
    capacity: 'Capacity',
    checkoutEmpty: 'Your cart is empty',
    orderPlaced: 'Order Placed Successfully!',
    paymentInstructions: 'Payment Instructions',
    enterAmount: 'Enter amount:',
    completePayment: 'Complete the payment',
    orderConfirmation: 'Your order will be confirmed once payment is received.',
    payAtVenue: 'Pay at Venue',
    payWhenReceived: 'Please pay {amount} FCFA when you receive your order.',
    showOrderNumber: 'Show your order number to the staff.',
    reservationSubmitted: 'Reservation Submitted!',
    contactToConfirm: 'We will contact you at {phone} to confirm your reservation.',
    noAvailability: 'Sorry, this time slot is not available. Please choose a different time.',
    orderFailed: 'Failed to place order',
    orderFailedRetry: 'Failed to place order. Please try again.',
    reservationFailed: 'Failed to create reservation',
    reservationFailedRetry: 'Failed to create reservation. Please try again.'
  },
  fr: {
    toggleNavigation: 'Afficher ou masquer la navigation',
    switchTheme: 'Passer en mode {theme}',
    lightMode: 'Clair',
    darkMode: 'Sombre',
    selectLanguage: 'Choisir la langue',
    home: 'Accueil',
    menu: 'Menu',
    reservations: 'Réservations',
    contact: 'Contact',
    tagline: 'Jouer • Manger • Boire • Se détendre',
    viewMenu: 'Voir le menu',
    orderNow: 'Commander',
    makeReservation: 'Faire une réservation',
    heroLocation: 'Bonabéri, Douala • Derrière Ancien Sonel',
    pauseVideo: 'Mettre la vidéo en pause',
    barSnacks: 'Bar et snacks',
    premiumDrinksSnacks: 'Boissons de qualité et délicieux snacks',
    restaurant: 'Restaurant',
    freshMeals: 'Plats frais et cuisine locale',
    poolSnooker: 'Billard',
    professionalTables: 'Tables de billard professionnelles',
    meals: 'Plats',
    snacks: 'Snacks',
    drinks: 'Boissons',
    premiumSelection: 'Notre sélection de qualité',
    menuSubtitle: 'Spiritueux, champagnes et cocktails de qualité',
    orderingFor: 'Votre commande est pour',
    loadingMenu: 'Chargement du menu...',
    menuUpdating: 'Le menu est en cours de mise à jour. Revenez bientôt !',
    menuLoadError: 'Erreur lors du chargement du menu. Veuillez actualiser la page.',
    daysPerWeek: '7 jours sur 7',
    poolTable: 'Table de billard',
    diningTable: 'Table de restaurant',
    eventGroup: 'Événement / Groupe',
    yourName: 'Votre nom *',
    phoneNumber: 'Numéro de téléphone *',
    selectTableSpace: 'Choisir une table/un espace *',
    choose: 'Choisir...',
    date: 'Date *',
    startTime: 'Heure de début *',
    durationMinutes: 'Durée (minutes) *',
    minutes30: '30 minutes',
    hour1: '1 heure',
    hours1Half: '1,5 heure',
    hours2: '2 heures',
    hours3: '3 heures',
    hours4: '4 heures',
    groupSize: 'Taille du groupe *',
    specialRequests: 'Demandes particulières',
    submitReservation: 'Envoyer la réservation',
    findUs: 'Nous trouver',
    location: 'Adresse',
    businessLocationFallback: 'Bonabéri, Douala, derrière Ancien Sonel',
    phone: 'Téléphone',
    openingHours: 'Heures d’ouverture',
    opensAt: 'Ouverture à',
    copyright: '© 2026 Pool\'s Arena Club & Bar. Tous droits réservés.',
    yourOrder: 'Votre commande',
    total: 'Total :',
    continueShopping: 'Continuer vos achats',
    checkout: 'Valider la commande',
    completeOrder: 'Finaliser votre commande',
    paymentMethod: 'Mode de paiement *',
    selectPaymentMethod: 'Choisir un mode de paiement',
    mtnMoney: 'MTN Mobile Money',
    orangeMoney: 'Orange Money / Max it',
    specialInstructions: 'Instructions particulières',
    totalAmount: 'Montant total :',
    placeOrder: 'Passer la commande',
    success: '✓ Réussite !',
    close: 'Fermer',
    order: 'Commander',
    reserve: 'Réserver',
    addToCart: '🛒 Ajouter au panier',
    soldOut: '❌ Épuisé',
    added: '✓ Ajouté !',
    cartEmpty: 'Votre panier est vide',
    noTablesAvailable: 'Aucune table disponible',
    capacity: 'Capacité',
    checkoutEmpty: 'Votre panier est vide',
    orderPlaced: 'Commande passée avec succès !',
    paymentInstructions: 'Instructions de paiement',
    enterAmount: 'Saisissez le montant :',
    completePayment: 'Finalisez le paiement',
    orderConfirmation: 'Votre commande sera confirmée après réception du paiement.',
    payAtVenue: 'Paiement sur place',
    payWhenReceived: 'Veuillez régler {amount} FCFA à la réception de votre commande.',
    showOrderNumber: 'Présentez votre numéro de commande au personnel.',
    reservationSubmitted: 'Réservation envoyée !',
    contactToConfirm: 'Nous vous contacterons au {phone} pour confirmer votre réservation.',
    noAvailability: 'Désolé, ce créneau est indisponible. Veuillez en choisir un autre.',
    orderFailed: 'Échec de la commande',
    orderFailedRetry: 'Échec de la commande. Veuillez réessayer.',
    reservationFailed: 'Échec de la réservation',
    reservationFailedRetry: 'Échec de la réservation. Veuillez réessayer.'
  }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initPreferences();
  loadBusinessInfo();
  loadMenu();
  initNavigation();
  initCart();
  initReservations();
  checkTableParam();
  initAnimations();
  initStickyNav();
});

function translate(key, values = {}) {
  const phrase = translations[currentLanguage][key] || translations.en[key] || key;
  return phrase.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
}

function initPreferences() {
  const savedLanguage = localStorage.getItem('siteLanguage');
  const savedTheme = localStorage.getItem('siteTheme');
  currentLanguage = savedLanguage === 'fr' ? 'fr' : 'en';
  document.documentElement.dataset.theme = savedTheme === 'light' ? 'light' : 'dark';

  const languageSelect = document.getElementById('languageSelect');
  languageSelect.value = currentLanguage;
  languageSelect.addEventListener('change', () => {
    currentLanguage = languageSelect.value === 'fr' ? 'fr' : 'en';
    localStorage.setItem('siteLanguage', currentLanguage);
    applyLanguage();
  });

  document.getElementById('themeToggle').addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('siteTheme', theme);
    updateThemeControl();
  });

  applyLanguage();
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = translate(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
    element.setAttribute('aria-label', translate(element.dataset.i18nAriaLabel));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    element.setAttribute('title', translate(element.dataset.i18nTitle));
  });
  renderBusinessLocation();
  renderOpeningHours();
  updateThemeControl();
  updateCartUI();
}

function updateThemeControl() {
  const isLight = document.documentElement.dataset.theme === 'light';
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.querySelector('[aria-hidden="true"]').textContent = isLight ? '☾' : '☀';
  themeToggle.querySelector('.theme-toggle-label').textContent =
    translate(isLight ? 'darkMode' : 'lightMode');
  themeToggle.setAttribute('aria-label', translate('switchTheme', {
    theme: translate(isLight ? 'darkMode' : 'lightMode').toLowerCase()
  }));
}

// Initialize scroll animations
function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.service-card').forEach(card => {
    observer.observe(card);
  });
}

// Sticky navbar shrink on scroll
function initStickyNav() {
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
}

// Check if table parameter is in URL (QR code scan)
function checkTableParam() {
  const urlParams = new URLSearchParams(window.location.search);
  const tableId = urlParams.get('table');
  
  if (tableId) {
    localStorage.setItem('selectedTable', tableId);
    
    // Show table notification
    const notification = document.getElementById('tableNotification');
    const tableNameDisplay = document.getElementById('tableNameDisplay');
    
    // Fetch table info
    fetch(`/api/resources?type=pool_table`)
      .then(res => res.json())
      .then(resources => {
        const table = resources.find(r => r.id == tableId);
        if (table) {
          tableNameDisplay.textContent = table.name;
          notification.style.display = 'block';
        }
      });
    
    // Scroll to menu
    setTimeout(() => {
      document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    }, 500);
  }
}

// Load business information
async function loadBusinessInfo() {
  try {
    const response = await fetch('/api/business-info');
    businessSettings = await response.json();
    
    // Update contact info
    renderBusinessLocation();
    document.getElementById('businessPhone').textContent = businessSettings.phone;
    document.getElementById('businessPhone').href = `tel:${businessSettings.phone}`;
    
    renderOpeningHours();
  } catch (error) {
    console.error('Error loading business info:', error);
  }
}

function renderBusinessLocation() {
  const location = businessSettings.location;
  if (!location) return;
  const normalizedLocation = location.trim().toLowerCase();
  const englishDefault = 'bonabéri, douala, behind ancien sonel';
  document.getElementById('businessLocation').textContent =
    currentLanguage === 'fr' && normalizedLocation === englishDefault
      ? 'Bonabéri, Douala, derrière Ancien Sonel'
      : location;
}

function renderOpeningHours() {
  const [hours, minutes] = (businessSettings.opening_time || '18:30').split(':');
  const time = new Date();
  time.setHours(parseInt(hours), parseInt(minutes));
  document.getElementById('openingTime').textContent = time.toLocaleTimeString(
    currentLanguage === 'fr' ? 'fr-FR' : 'en-US',
    { hour: 'numeric', minute: '2-digit' }
  );

  const days = businessSettings.opening_days ? businessSettings.opening_days.split(',') : [];
  if (days.length === 0 || days.length === 7) {
    document.getElementById('openingDays').textContent = translate('daysPerWeek');
  } else {
    const frenchDays = {
      Monday: 'lundi',
      Tuesday: 'mardi',
      Wednesday: 'mercredi',
      Thursday: 'jeudi',
      Friday: 'vendredi',
      Saturday: 'samedi',
      Sunday: 'dimanche'
    };
    document.getElementById('openingDays').textContent = days
      .map(day => currentLanguage === 'fr' ? frenchDays[day.trim()] || day : day)
      .join(', ');
  }
}

// Load menu
async function loadMenu() {
  const menuContainer = document.getElementById('menuContainer');
  
  try {
    const response = await fetch('/api/menu');
    const menu = await response.json();
    
    if (menu.length === 0 || menu.every(cat => cat.items.length === 0)) {
      menuContainer.innerHTML = `
        <div class="menu-loading">
          <p>${translate('menuUpdating')}</p>
        </div>
      `;
      return;
    }
    
    const menuHTML = menu.map(category => {
      if (category.items.length === 0) return '';
      
      return `
        <div class="menu-category">
          <h3>${translateCategory(category.name)}</h3>
          <div class="menu-items">
            ${category.items.map(item => `
              <div class="menu-item">
                <div class="menu-item-image">
                  ${item.image_url 
                    ? `<img src="${item.image_url}" alt="${item.name}">`
                    : `<span>${getCategoryEmoji(category.name)}</span>`
                  }
                </div>
                <div class="menu-item-content">
                  <div class="menu-item-header">
                    <div class="menu-item-name">${item.name}</div>
                    <div class="menu-item-price">${item.price.toLocaleString()} FCFA</div>
                  </div>
                  ${item.description ? `<div class="menu-item-description">${item.description}</div>` : ''}
                  <button 
                    class="add-to-cart-btn" 
                    data-i18n="${item.is_available ? 'addToCart' : 'soldOut'}"
                    onclick="addToCart(${item.id}, '${item.name}', ${item.price})"
                    ${!item.is_available ? 'disabled' : ''}
                  >
                    ${item.is_available ? translate('addToCart') : translate('soldOut')}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
    
    menuContainer.innerHTML = `<div class="menu-categories">${menuHTML}</div>`;
  } catch (error) {
    console.error('Error loading menu:', error);
    menuContainer.innerHTML = `
      <div class="menu-loading">
        <p>${translate('menuLoadError')}</p>
      </div>
    `;
  }
}

function translateCategory(name) {
  const categoryKeys = { Meals: 'meals', Snacks: 'snacks', Drinks: 'drinks' };
  return categoryKeys[name] ? translate(categoryKeys[name]) : name;
}

function getCategoryEmoji(category) {
  // Return SVG icons instead of emojis
  const icons = {
    'Meals': '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5"><circle cx="12" cy="8" r="7"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>',
    'Snacks': '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
    'Drinks': '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>'
  };
  return icons[category] || icons['Meals'];
}

// Navigation
function initNavigation() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          navMenu.classList.remove('active');
          
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  });
  
  // Scroll spy
  window.addEventListener('scroll', () => {
    let current = '';
    document.querySelectorAll('section').forEach(section => {
      const sectionTop = section.offsetTop;
      if (pageYOffset >= sectionTop - 100) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// Cart functionality
function initCart() {
  const cartIcon = document.getElementById('cartIcon');
  const cartIconMobile = document.getElementById('cartIconMobile');
  const cartModal = document.getElementById('cartModal');
  const closeCart = document.getElementById('closeCart');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  cartIcon.addEventListener('click', openCart);
  if (cartIconMobile) cartIconMobile.addEventListener('click', openCart);
  closeCart.addEventListener('click', closeCartModal);
  closeCartBtn.addEventListener('click', closeCartModal);
  checkoutBtn.addEventListener('click', openCheckout);
  
  // Load cart from localStorage
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartUI();
  }
}

function addToCart(id, name, price) {
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  
  saveCart();
  updateCartUI();
  
  // Visual feedback with animation
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = translate('added');
  btn.style.background = 'var(--success)';
  btn.disabled = true;
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
    btn.disabled = false;
  }, 1200);
}

function updateCartQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter(item => item.id !== id);
    }
    saveCart();
    updateCartUI();
  }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
  const cartCount = document.getElementById('cartCount');
  const cartCountMobile = document.getElementById('cartCountMobile');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  if (cartCountMobile) cartCountMobile.textContent = totalItems;
  
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  
  if (cart.length === 0) {
      cartItems.innerHTML = `<p style="text-align: center; color: var(--cream-dark);">${translate('cartEmpty')}</p>`;
    cartTotal.textContent = '0 FCFA';
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price.toLocaleString()} FCFA</div>
      </div>
      <div class="cart-item-controls">
        <button class="cart-qty-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
        <span class="cart-qty">${item.quantity}</span>
        <button class="cart-qty-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
  
  cartTotal.textContent = `${total.toLocaleString()} FCFA`;
}

function openCart() {
  updateCartUI();
  document.getElementById('cartModal').classList.add('active');
}

function closeCartModal() {
  document.getElementById('cartModal').classList.remove('active');
}

function openCheckout() {
  if (cart.length === 0) {
    alert(translate('checkoutEmpty'));
    return;
  }
  
  closeCartModal();
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  document.getElementById('checkoutTotal').textContent = `${total.toLocaleString()} FCFA`;
  
  document.getElementById('checkoutModal').classList.add('active');
}

// Checkout
document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {
    customer_name: formData.get('customer_name'),
    customer_phone: formData.get('customer_phone'),
    payment_method: formData.get('payment_method'),
    notes: formData.get('notes'),
    items: cart.map(item => ({
      menu_item_id: item.id,
      quantity: item.quantity
    }))
  };
  
  // Add table ID if from QR code
  const tableId = localStorage.getItem('selectedTable');
  if (tableId) {
    data.table_id = parseInt(tableId);
  }
  
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Clear cart
      cart = [];
      saveCart();
      updateCartUI();
      
      // Close checkout modal
      document.getElementById('checkoutModal').classList.remove('active');
      
      // Show success message
      showSuccessMessage(result, data.payment_method);
      
      // Clear selected table
      localStorage.removeItem('selectedTable');
    } else {
      alert(result.error || translate('orderFailed'));
    }
  } catch (error) {
    console.error('Error placing order:', error);
    alert(translate('orderFailedRetry'));
  }
});

function showSuccessMessage(result, paymentMethod) {
  let message = `
    <div class="success-icon">✓</div>
    <h3>${translate('orderPlaced')}</h3>
    <div class="order-number">Order #${result.order_number}</div>
    <p>${translate('total')} ${result.total_amount.toLocaleString()} FCFA</p>
  `;
  
  if (paymentMethod === 'mtn_momo' && result.merchant_code) {
    message += `
      <div class="payment-instructions">
        <h4>${translate('paymentInstructions')} - MTN Mobile Money</h4>
        <p>1. ${currentLanguage === 'fr' ? 'Composez *126# sur votre téléphone MTN' : 'Dial *126# on your MTN phone'}</p>
        <p>2. ${currentLanguage === 'fr' ? 'Choisissez « Envoyer de l’argent »' : 'Select "Send Money"'}</p>
        <p>3. ${currentLanguage === 'fr' ? 'Saisissez le code marchand :' : 'Enter merchant code:'}</p>
        <div class="merchant-code">${result.merchant_code}</div>
        <p>4. ${translate('enterAmount')} ${result.total_amount} FCFA</p>
        <p>5. ${translate('completePayment')}</p>
        <p><small>${translate('orderConfirmation')}</small></p>
      </div>
    `;
  } else if (paymentMethod === 'orange_money' && result.merchant_code) {
    message += `
      <div class="payment-instructions">
        <h4>${translate('paymentInstructions')} - Orange Money / Max it</h4>
        <p>1. ${currentLanguage === 'fr' ? 'Composez #150# sur votre téléphone Orange' : 'Dial #150# on your Orange phone'}</p>
        <p>2. ${currentLanguage === 'fr' ? 'Choisissez « Transférer de l’argent »' : 'Select "Transfer Money"'}</p>
        <p>3. ${currentLanguage === 'fr' ? 'Saisissez le code marchand :' : 'Enter merchant code:'}</p>
        <div class="merchant-code">${result.merchant_code}</div>
        <p>4. ${translate('enterAmount')} ${result.total_amount} FCFA</p>
        <p>5. ${translate('completePayment')}</p>
        <p><small>${translate('orderConfirmation')}</small></p>
      </div>
    `;
  } else if (paymentMethod === 'pay_at_venue') {
    message += `
      <div class="payment-instructions">
        <h4>${translate('payAtVenue')}</h4>
        <p>${translate('payWhenReceived', { amount: result.total_amount.toLocaleString() })}</p>
        <p>${translate('showOrderNumber')}</p>
      </div>
    `;
  }
  
  document.getElementById('successMessage').innerHTML = message;
  document.getElementById('successModal').classList.add('active');
}

// Close modals
document.getElementById('closeCheckout').addEventListener('click', () => {
  document.getElementById('checkoutModal').classList.remove('active');
});

document.getElementById('closeSuccess').addEventListener('click', () => {
  document.getElementById('successModal').classList.remove('active');
});

document.getElementById('closeSuccessBtn').addEventListener('click', () => {
  document.getElementById('successModal').classList.remove('active');
});

// Reservations
function initReservations() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentReservationType = tab.dataset.type;
      loadResources(currentReservationType);
    });
  });
  
  loadResources(currentReservationType);
  
  // Set min date to today
  const dateInput = document.querySelector('input[name="date"]');
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  dateInput.value = today;
  
  document.getElementById('reservationForm').addEventListener('submit', handleReservationSubmit);
}

async function loadResources(type) {
  try {
    const response = await fetch(`/api/resources?type=${type}`);
    const resources = await response.json();
    
    const select = document.getElementById('resourceSelect');
    
    if (resources.length === 0) {
      select.innerHTML = `<option value="">${translate('noTablesAvailable')}</option>`;
      return;
    }
    
    select.innerHTML = `<option value="">${translate('choose')}</option>` +
      resources.map(r => `<option value="${r.id}">${r.name} (${translate('capacity')}: ${r.capacity})</option>`).join('');
  } catch (error) {
    console.error('Error loading resources:', error);
  }
}

async function handleReservationSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {
    customer_name: formData.get('customer_name'),
    customer_phone: formData.get('customer_phone'),
    resource_id: parseInt(formData.get('resource_id')),
    date: formData.get('date'),
    start_time: formData.get('start_time'),
    duration: parseInt(formData.get('duration')),
    group_size: parseInt(formData.get('group_size')),
    notes: formData.get('notes')
  };
  
  try {
    // Check availability first
    const availResponse = await fetch('/api/reservations/check-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource_id: data.resource_id,
        date: data.date,
        start_time: data.start_time,
        end_time: calculateEndTime(data.start_time, data.duration)
      })
    });
    
    const availResult = await availResponse.json();
    
    if (!availResult.available) {
      alert(translate('noAvailability'));
      return;
    }
    
    // Create reservation
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      document.getElementById('successMessage').innerHTML = `
        <div class="success-icon">✓</div>
        <h3>${translate('reservationSubmitted')}</h3>
        <div class="order-number">${result.reservation_number}</div>
        <p>${result.message}</p>
        <p>${translate('contactToConfirm', { phone: data.customer_phone })}</p>
      `;
      document.getElementById('successModal').classList.add('active');
      e.target.reset();
      
      // Reset date to today
      const today = new Date().toISOString().split('T')[0];
      document.querySelector('input[name="date"]').value = today;
    } else {
      alert(result.error || translate('reservationFailed'));
    }
  } catch (error) {
    console.error('Error creating reservation:', error);
    alert(translate('reservationFailedRetry'));
  }
}

function calculateEndTime(startTime, duration) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + duration;
  const endHours = Math.floor(endMinutes / 60) % 24;
  const endMins = endMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});
