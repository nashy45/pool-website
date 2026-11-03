// Global state
let cart = [];
let businessSettings = {};
let currentReservationType = 'pool_table';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadBusinessInfo();
  loadMenu();
  initNavigation();
  initCart();
  initReservations();
  checkTableParam();
  initAnimations();
  initStickyNav();
});

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
    document.getElementById('businessLocation').textContent = businessSettings.location;
    document.getElementById('businessPhone').textContent = businessSettings.phone;
    document.getElementById('businessPhone').href = `tel:${businessSettings.phone}`;
    
    if (businessSettings.opening_time) {
      const [hours, minutes] = businessSettings.opening_time.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes));
      document.getElementById('openingTime').textContent = time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    }
    
    if (businessSettings.opening_days) {
      const days = businessSettings.opening_days.split(',');
      if (days.length === 7) {
        document.getElementById('openingDays').textContent = '7 days a week';
      } else {
        document.getElementById('openingDays').textContent = days.join(', ');
      }
    }
  } catch (error) {
    console.error('Error loading business info:', error);
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
          <p>Menu is being updated. Please check back soon!</p>
        </div>
      `;
      return;
    }
    
    const menuHTML = menu.map(category => {
      if (category.items.length === 0) return '';
      
      return `
        <div class="menu-category">
          <h3>${category.name}</h3>
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
                    onclick="addToCart(${item.id}, '${item.name}', ${item.price})"
                    ${!item.is_available ? 'disabled' : ''}
                  >
                    ${item.is_available ? '🛒 Add to Cart' : '❌ Sold Out'}
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
        <p>Error loading menu. Please refresh the page.</p>
      </div>
    `;
  }
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
  btn.textContent = '✓ Added!';
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
    cartItems.innerHTML = '<p style="text-align: center; color: var(--light-gray);">Your cart is empty</p>';
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
    alert('Your cart is empty');
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
      alert(result.error || 'Failed to place order');
    }
  } catch (error) {
    console.error('Error placing order:', error);
    alert('Failed to place order. Please try again.');
  }
});

function showSuccessMessage(result, paymentMethod) {
  let message = `
    <div class="success-icon">✓</div>
    <h3>Order Placed Successfully!</h3>
    <div class="order-number">Order #${result.order_number}</div>
    <p>Total: ${result.total_amount.toLocaleString()} FCFA</p>
  `;
  
  if (paymentMethod === 'mtn_momo' && result.merchant_code) {
    message += `
      <div class="payment-instructions">
        <h4>Payment Instructions - MTN Mobile Money</h4>
        <p>1. Dial *126# on your MTN phone</p>
        <p>2. Select "Send Money"</p>
        <p>3. Enter merchant code:</p>
        <div class="merchant-code">${result.merchant_code}</div>
        <p>4. Enter amount: ${result.total_amount} FCFA</p>
        <p>5. Complete the payment</p>
        <p><small>Your order will be confirmed once payment is received.</small></p>
      </div>
    `;
  } else if (paymentMethod === 'orange_money' && result.merchant_code) {
    message += `
      <div class="payment-instructions">
        <h4>Payment Instructions - Orange Money / Max it</h4>
        <p>1. Dial #150# on your Orange phone</p>
        <p>2. Select "Transfer Money"</p>
        <p>3. Enter merchant code:</p>
        <div class="merchant-code">${result.merchant_code}</div>
        <p>4. Enter amount: ${result.total_amount} FCFA</p>
        <p>5. Complete the payment</p>
        <p><small>Your order will be confirmed once payment is received.</small></p>
      </div>
    `;
  } else if (paymentMethod === 'pay_at_venue') {
    message += `
      <div class="payment-instructions">
        <h4>Pay at Venue</h4>
        <p>Please pay ${result.total_amount.toLocaleString()} FCFA when you receive your order.</p>
        <p>Show your order number to the staff.</p>
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
      select.innerHTML = '<option value="">No tables available</option>';
      return;
    }
    
    select.innerHTML = '<option value="">Choose...</option>' + 
      resources.map(r => `<option value="${r.id}">${r.name} (Capacity: ${r.capacity})</option>`).join('');
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
      alert('Sorry, this time slot is not available. Please choose a different time.');
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
        <h3>Reservation Submitted!</h3>
        <div class="order-number">${result.reservation_number}</div>
        <p>${result.message}</p>
        <p>We will contact you at ${data.customer_phone} to confirm your reservation.</p>
      `;
      document.getElementById('successModal').classList.add('active');
      e.target.reset();
      
      // Reset date to today
      const today = new Date().toISOString().split('T')[0];
      document.querySelector('input[name="date"]').value = today;
    } else {
      alert(result.error || 'Failed to create reservation');
    }
  } catch (error) {
    console.error('Error creating reservation:', error);
    alert('Failed to create reservation. Please try again.');
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
