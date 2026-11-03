// Global state
let token = localStorage.getItem('staffToken');
let currentPage = 'overview';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  if (!token) {
    window.location.href = '/staff/login';
    return;
  }
  
  initDashboard();
});

// Initialize dashboard
function initDashboard() {
  const username = localStorage.getItem('staffUser');
  document.getElementById('userName').textContent = username || 'Owner';
  
  // Set current date
  const dateEl = document.getElementById('currentDate');
  const today = new Date();
  dateEl.textContent = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Navigation
  document.querySelectorAll('.nav-item, .mobile-nav-btn').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      if (page) navigateTo(page);
    });
  });
  
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', logout);
  
  // Load initial data
  loadOverviewData();
  
  // Auto-refresh every 30 seconds
  setInterval(() => {
    if (currentPage === 'overview') loadOverviewData();
    else if (currentPage === 'orders') loadOrders();
    else if (currentPage === 'reservations') loadReservations();
  }, 30000);
}

function navigateTo(page) {
  currentPage = page;
  
  // Update navigation
  document.querySelectorAll('.nav-item, .mobile-nav-btn').forEach(item => {
    if (item.dataset.page === page) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Update pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });
  document.getElementById(`${page}Page`).classList.add('active');
  
  // Update title
  const titles = {
    overview: 'Overview',
    orders: 'Orders',
    reservations: 'Reservations',
    menu: 'Menu',
    tables: 'Tables & QR',
    media: 'Website Photos',
    settings: 'Settings'
  };
  document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
  
  // Load page data
  if (page === 'overview') loadOverviewData();
  else if (page === 'orders') loadOrders();
  else if (page === 'reservations') loadReservations();
  else if (page === 'menu') loadMenu();
  else if (page === 'tables') loadTables();
  else if (page === 'media') loadMedia();
  else if (page === 'settings') loadSettings();
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    window.location.href = '/staff/login';
  }
}

// API Helper
async function apiRequest(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    window.location.href = '/staff/login';
    throw new Error('Unauthorized');
  }
  
  return response;
}

// Overview Data
async function loadOverviewData() {
  try {
    // Load stats
    const statsResponse = await apiRequest('/api/staff/stats');
    const stats = await statsResponse.json();
    
    // Update stat cards with count-up animation
    animateValue('statTodayOrders', 0, stats.today_orders, 800);
    animateValue('statTodayRevenue', 0, stats.today_revenue, 800);
    animateValue('statPendingOrders', 0, stats.pending_orders, 800);
    animateValue('statPendingReservations', 0, stats.pending_reservations, 800);
    
    // Update badges
    document.getElementById('ordersBadge').textContent = stats.pending_orders;
    document.getElementById('reservationsBadge').textContent = stats.pending_reservations;
    
    // Load charts
    loadRevenueChart();
    loadTopItemsChart();
    
    // Load recent activity
    loadRecentOrders();
    loadUpcomingReservations();
    
  } catch (error) {
    console.error('Error loading overview:', error);
  }
}

function animateValue(elementId, start, end, duration) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    
    if (elementId.includes('Revenue')) {
      element.innerHTML = `${Math.round(current).toLocaleString()} <span class="currency">FCFA</span>`;
    } else {
      element.textContent = Math.round(current);
    }
  }, 16);
}

// Charts
async function loadRevenueChart() {
  try {
    const response = await apiRequest('/api/staff/analytics/revenue?period=7');
    const data = await response.json();
    
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // Format data for chart
    const labels = data.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    });
    const values = data.map(d => d.revenue);
    
    // Destroy existing chart if it exists
    if (window.revenueChartInstance) {
      window.revenueChartInstance.destroy();
    }
    
    window.revenueChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue (FCFA)',
          data: values,
          borderColor: '#c9a961',
          backgroundColor: 'rgba(201, 169, 97, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#c9a961',
          pointBorderColor: '#1a1a1a',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            titleColor: '#f5f3f0',
            bodyColor: '#c9a961',
            borderColor: '#c9a961',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return context.parsed.y.toLocaleString() + ' FCFA';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { 
              color: '#e8e6e3',
              callback: function(value) {
                return value.toLocaleString();
              }
            },
            grid: { color: 'rgba(201, 169, 97, 0.1)' }
          },
          x: {
            ticks: { color: '#e8e6e3' },
            grid: { color: 'rgba(201, 169, 97, 0.1)' }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error loading revenue chart:', error);
  }
}

async function loadTopItemsChart() {
  try {
    const response = await apiRequest('/api/staff/analytics/top-items?limit=5');
    const data = await response.json();
    
    const ctx = document.getElementById('topItemsChart');
    if (!ctx) return;
    
    // Format data for chart
    const labels = data.map(d => d.name);
    const values = data.map(d => d.total_sold);
    
    if (window.topItemsChartInstance) {
      window.topItemsChartInstance.destroy();
    }
    
    window.topItemsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Items Sold',
          data: values,
          backgroundColor: '#c9a961',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            titleColor: '#f5f3f0',
            bodyColor: '#c9a961',
            borderColor: '#c9a961',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return context.parsed.x + ' sold';
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { 
              color: '#e8e6e3',
              stepSize: 1
            },
            grid: { color: 'rgba(201, 169, 97, 0.1)' }
          },
          y: {
            ticks: { 
              color: '#e8e6e3',
              font: {
                size: 11
              }
            },
            grid: { display: false }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error loading top items chart:', error);
  }
}

// Recent Orders
async function loadRecentOrders() {
  try {
    const response = await apiRequest('/api/staff/orders?status=new');
    const orders = await response.json();
    
    // Take only first 5
    const recentOrders = orders.slice(0, 5);
    
    const container = document.getElementById('recentOrdersList');
    if (!container) return;
    
    if (recentOrders.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No recent orders</p></div>';
      return;
    }
    
    container.innerHTML = recentOrders.map(order => `
      <div class="activity-item">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <strong style="color: var(--cream);">${order.order_number}</strong>
          <span style="color: var(--gold); font-weight: 600;">${order.total_amount.toLocaleString()} FCFA</span>
        </div>
        <div style="font-size: 0.875rem; color: var(--cream-dark);">
          ${order.customer_name} • ${new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading recent orders:', error);
  }
}

// Upcoming Reservations
async function loadUpcomingReservations() {
  try {
    const response = await apiRequest('/api/staff/reservations?status=pending');
    const reservations = await response.json();
    
    // Take only first 5
    const upcomingReservations = reservations.slice(0, 5);
    
    const container = document.getElementById('upcomingReservationsList');
    if (!container) return;
    
    if (upcomingReservations.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No upcoming reservations</p></div>';
      return;
    }
    
    container.innerHTML = upcomingReservations.map(res => `
      <div class="activity-item">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <strong style="color: var(--cream);">${res.resource_name}</strong>
          <span style="color: var(--gold);">${new Date(res.date).toLocaleDateString()}</span>
        </div>
        <div style="font-size: 0.875rem; color: var(--cream-dark);">
          ${res.customer_name} • ${res.start_time} - ${res.end_time}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading reservations:', error);
  }
}

// Orders (reuse existing logic but update API endpoints)
async function loadOrders() {
  const container = document.getElementById('ordersContainer');
  if (!container) return;
  
  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading orders...</p></div>';
  
  try {
    const response = await apiRequest('/api/staff/orders');
    const orders = await response.json();
    
    if (orders.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📦</div><p>No orders yet</p></div>';
      return;
    }
    
    // Render orders (simplified for now)
    container.innerHTML = orders.map(order => `
      <div class="data-card" style="background: var(--charcoal-800); border: 1px solid rgba(201, 169, 97, 0.1); border-radius: 8px; padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
          <div>
            <strong style="color: var(--cream); font-size: 1.125rem;">${order.order_number}</strong>
            <div style="font-size: 0.875rem; color: var(--cream-dark); margin-top: 0.25rem;">
              ${order.customer_name} • ${order.customer_phone}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="color: var(--gold); font-weight: 700; font-size: 1.25rem;">${order.total_amount.toLocaleString()} FCFA</div>
            <div style="font-size: 0.875rem; color: var(--cream-dark);">${new Date(order.created_at).toLocaleTimeString()}</div>
          </div>
        </div>
        <div style="margin-bottom: 1rem;">
          ${order.items.map(item => `<div style="color: var(--cream-dark); font-size: 0.875rem;">${item.quantity}x ${item.menu_item_name}</div>`).join('')}
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="tab-btn" style="padding: 0.375rem 0.75rem; font-size: 0.8125rem;" onclick="updateOrderStatus(${order.id}, 'preparing')">Mark Preparing</button>
          <button class="tab-btn" style="padding: 0.375rem 0.75rem; font-size: 0.8125rem;" onclick="updateOrderStatus(${order.id}, 'ready')">Mark Ready</button>
          <button class="tab-btn" style="padding: 0.375rem 0.75rem; font-size: 0.8125rem;" onclick="updateOrderStatus(${order.id}, 'served')">Mark Served</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading orders:', error);
    container.innerHTML = '<div class="empty-state"><p>Error loading orders</p></div>';
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    await apiRequest(`/api/staff/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    loadOrders();
    if (currentPage === 'overview') loadOverviewData();
  } catch (error) {
    console.error('Error updating order:', error);
    alert('Failed to update order status');
  }
}

// Reservations Page
async function loadReservations() {
  const page = document.getElementById('reservationsPage');
  page.innerHTML = `
    <div class="page-header">
      <div class="filter-tabs">
        <button class="tab-btn active" onclick="filterReservations('all')">All</button>
        <button class="tab-btn" onclick="filterReservations('pending')">Pending</button>
        <button class="tab-btn" onclick="filterReservations('confirmed')">Confirmed</button>
        <button class="tab-btn" onclick="filterReservations('cancelled')">Cancelled</button>
      </div>
      <button class="btn-secondary" onclick="loadReservations()">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
        Refresh
      </button>
    </div>
    <div id="reservationsContainer" class="data-container">
      <div class="loading"><div class="spinner"></div><p>Loading reservations...</p></div>
    </div>
  `;
  
  try {
    const response = await apiRequest('/api/staff/reservations');
    const reservations = await response.json();
    
    const container = document.getElementById('reservationsContainer');
    
    if (reservations.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No reservations found</p></div>';
      return;
    }
    
    container.innerHTML = reservations.map(res => `
      <div class="data-card" style="background: var(--charcoal-800); border: 1px solid rgba(201, 169, 97, 0.1); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <strong style="color: var(--cream); font-size: 1.125rem;">${res.reservation_number}</strong>
            <div style="font-size: 0.875rem; color: var(--cream-dark); margin-top: 0.25rem;">
              ${res.customer_name} • ${res.customer_phone}
            </div>
          </div>
          <span class="status-badge status-${res.status}">${res.status}</span>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 6px;">
          <div>
            <div style="font-size: 0.75rem; color: var(--cream-dark); text-transform: uppercase; margin-bottom: 0.25rem;">Resource</div>
            <div style="color: var(--gold); font-weight: 600;">${res.resource_name}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--cream-dark); text-transform: uppercase; margin-bottom: 0.25rem;">Date</div>
            <div style="color: var(--cream);">${new Date(res.date).toLocaleDateString()}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--cream-dark); text-transform: uppercase; margin-bottom: 0.25rem;">Time</div>
            <div style="color: var(--cream);">${res.start_time} - ${res.end_time}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--cream-dark); text-transform: uppercase; margin-bottom: 0.25rem;">Group Size</div>
            <div style="color: var(--cream);">${res.group_size} people</div>
          </div>
        </div>
        
        ${res.notes ? `<div style="margin-bottom: 1rem; padding: 0.75rem; background: rgba(0,0,0,0.2); border-radius: 6px; font-size: 0.875rem; color: var(--cream-dark);">${res.notes}</div>` : ''}
        
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${res.status === 'pending' ? `
            <button class="tab-btn" style="padding: 0.5rem 1rem; background: var(--gold); color: var(--charcoal-900);" onclick="updateReservationStatus(${res.id}, 'confirmed')">Confirm</button>
            <button class="tab-btn" style="padding: 0.5rem 1rem;" onclick="updateReservationStatus(${res.id}, 'cancelled')">Cancel</button>
          ` : ''}
          <button class="tab-btn" style="padding: 0.5rem 1rem;" onclick="deleteReservation(${res.id})">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading reservations:', error);
  }
}

function filterReservations(status) {
  document.querySelectorAll('#reservationsPage .tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  // Reload with filter - simplified for now
  loadReservations();
}

async function updateReservationStatus(id, status) {
  try {
    await apiRequest(`/api/staff/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    loadReservations();
    if (currentPage === 'overview') loadOverviewData();
  } catch (error) {
    console.error('Error updating reservation:', error);
    alert('Failed to update reservation');
  }
}

async function deleteReservation(id) {
  if (!confirm('Are you sure you want to delete this reservation?')) return;
  
  try {
    await apiRequest(`/api/staff/reservations/${id}`, { method: 'DELETE' });
    loadReservations();
  } catch (error) {
    console.error('Error deleting reservation:', error);
    alert('Failed to delete reservation');
  }
}

// Menu Page
async function loadMenu() {
  const page = document.getElementById('menuPage');
  page.innerHTML = `
    <div class="page-header">
      <button class="btn-primary" onclick="showAddMenuItemModal()">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Menu Item
      </button>
      <button class="btn-secondary" onclick="loadMenu()">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
        Refresh
      </button>
    </div>
    <div id="menuContainer" class="data-container">
      <div class="loading"><div class="spinner"></div><p>Loading menu...</p></div>
    </div>
  `;
  
  try {
    const [itemsResponse, categoriesResponse] = await Promise.all([
      apiRequest('/api/staff/menu'),
      apiRequest('/api/staff/menu-categories')
    ]);
    
    const items = await itemsResponse.json();
    const categories = await categoriesResponse.json();
    window.menuCategories = categories; // Store for modal
    
    const container = document.getElementById('menuContainer');
    
    if (items.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No menu items yet. Add your first item!</p></div>';
      return;
    }
    
    // Group by category
    const grouped = categories.map(cat => ({
      ...cat,
      items: items.filter(item => item.category_id === cat.id)
    }));
    
    container.innerHTML = grouped.map(cat => `
      <div style="margin-bottom: 2rem;">
        <h3 style="color: var(--gold); margin-bottom: 1rem; font-size: 1.25rem; text-transform: uppercase; letter-spacing: 0.05em;">${cat.name}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
          ${cat.items.map(item => `
            <div class="data-card" style="background: var(--charcoal-800); border: 1px solid rgba(201, 169, 97, 0.1); border-radius: 8px; overflow: hidden;">
              ${item.image_url ? `
                <img src="${item.image_url}" alt="${item.name}" style="width: 100%; height: 160px; object-fit: cover;">
              ` : `
                <div style="width: 100%; height: 160px; background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.05)); display: flex; align-items: center; justify-content: center;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5" opacity="0.5"><circle cx="12" cy="8" r="7"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>
                </div>
              `}
              <div style="padding: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                  <strong style="color: var(--cream); font-size: 1rem;">${item.name}</strong>
                  <span style="color: var(--gold); font-weight: 700;">${item.price.toLocaleString()} FCFA</span>
                </div>
                ${item.description ? `<p style="font-size: 0.875rem; color: var(--cream-dark); margin-bottom: 0.75rem; line-height: 1.4;">${item.description}</p>` : ''}
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
                  <span class="status-badge ${item.is_available ? 'status-confirmed' : 'status-cancelled'}" style="font-size: 0.75rem;">
                    ${item.is_available ? 'Available' : 'Unavailable'}
                  </span>
                  ${item.is_hidden ? '<span class="status-badge status-cancelled" style="font-size: 0.75rem;">Hidden</span>' : ''}
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  <button class="tab-btn" style="flex: 1; padding: 0.5rem; font-size: 0.8125rem;" onclick="editMenuItem(${item.id})">Edit</button>
                  <button class="tab-btn" style="padding: 0.5rem; font-size: 0.8125rem;" onclick="toggleMenuItemAvailability(${item.id}, ${!item.is_available})">${item.is_available ? 'Disable' : 'Enable'}</button>
                  <button class="tab-btn" style="padding: 0.5rem; font-size: 0.8125rem; color: #ff6b6b;" onclick="deleteMenuItem(${item.id})">Delete</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading menu:', error);
  }
}

function showAddMenuItemModal() {
  const modal = document.getElementById('modalContainer');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 500px;">
        <h2 style="color: var(--cream); margin-bottom: 1.5rem;">Add Menu Item</h2>
        <form id="addMenuItemForm" onsubmit="submitMenuItemForm(event)">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Name *</label>
            <input type="text" name="name" required style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Category *</label>
            <select name="category_id" required style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
              ${window.menuCategories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Price (FCFA) *</label>
            <input type="number" name="price" required min="0" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Description</label>
            <textarea name="description" rows="3" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream); resize: vertical;"></textarea>
          </div>
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Image</label>
            <input type="file" name="image" accept="image/*" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <button type="submit" class="btn-primary" style="flex: 1;">Add Item</button>
            <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;
  modal.style.display = 'block';
}

async function submitMenuItemForm(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  
  try {
    const response = await fetch('/api/staff/menu', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to add item');
    
    closeModal();
    loadMenu();
    alert('Menu item added successfully!');
  } catch (error) {
    console.error('Error adding menu item:', error);
    alert('Failed to add menu item');
  }
}

async function toggleMenuItemAvailability(id, isAvailable) {
  try {
    // Get current item data
    const response = await apiRequest('/api/staff/menu');
    const items = await response.json();
    const item = items.find(i => i.id === id);
    
    const formData = new FormData();
    formData.append('name', item.name);
    formData.append('description', item.description || '');
    formData.append('price', item.price);
    formData.append('category_id', item.category_id);
    formData.append('is_available', isAvailable ? '1' : '0');
    formData.append('is_hidden', item.is_hidden);
    
    await fetch(`/api/staff/menu/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    loadMenu();
  } catch (error) {
    console.error('Error updating menu item:', error);
    alert('Failed to update item');
  }
}

async function deleteMenuItem(id) {
  if (!confirm('Are you sure you want to delete this menu item?')) return;
  
  try {
    await apiRequest(`/api/staff/menu/${id}`, { method: 'DELETE' });
    loadMenu();
  } catch (error) {
    console.error('Error deleting menu item:', error);
    alert('Failed to delete item');
  }
}

function editMenuItem(id) {
  // TODO: Implement edit modal
  alert('Edit functionality coming soon!');
}

// Tables Page
async function loadTables() {
  const page = document.getElementById('tablesPage');
  page.innerHTML = `
    <div class="page-header">
      <button class="btn-primary" onclick="showAddTableModal()">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Table/Resource
      </button>
      <button class="btn-secondary" onclick="loadTables()">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
        Refresh
      </button>
    </div>
    <div id="tablesContainer" class="data-container">
      <div class="loading"><div class="spinner"></div><p>Loading tables...</p></div>
    </div>
  `;
  
  try {
    const response = await apiRequest('/api/staff/resources');
    const resources = await response.json();
    
    const container = document.getElementById('tablesContainer');
    
    if (resources.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No tables/resources yet. Add your first one!</p></div>';
      return;
    }
    
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
        ${resources.map(resource => `
          <div class="data-card" style="background: var(--charcoal-800); border: 1px solid rgba(201, 169, 97, 0.1); border-radius: 8px; padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
              <div>
                <strong style="color: var(--cream); font-size: 1.125rem;">${resource.name}</strong>
                <div style="font-size: 0.875rem; color: var(--cream-dark); margin-top: 0.25rem; text-transform: capitalize;">
                  ${resource.type} • Capacity: ${resource.capacity}
                </div>
              </div>
              <span class="status-badge ${resource.is_active ? 'status-confirmed' : 'status-cancelled'}">
                ${resource.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            ${resource.qr_code_url ? `
              <div style="text-align: center; padding: 1rem; background: white; border-radius: 6px; margin-bottom: 1rem;">
                <img src="${resource.qr_code_url}" alt="QR Code" style="max-width: 150px; height: auto;">
                <div style="margin-top: 0.5rem;">
                  <a href="${resource.qr_code_url}" download class="tab-btn" style="display: inline-block; padding: 0.375rem 0.75rem; font-size: 0.8125rem;">Download QR</a>
                </div>
              </div>
            ` : ''}
            
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${!resource.qr_code_url ? `
                <button class="tab-btn" style="flex: 1; padding: 0.5rem;" onclick="generateQRCode(${resource.id})">Generate QR Code</button>
              ` : ''}
              <button class="tab-btn" style="padding: 0.5rem;" onclick="toggleResourceStatus(${resource.id}, ${!resource.is_active})">${resource.is_active ? 'Deactivate' : 'Activate'}</button>
              <button class="tab-btn" style="padding: 0.5rem; color: #ff6b6b;" onclick="deleteResource(${resource.id})">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Error loading tables:', error);
  }
}

function showAddTableModal() {
  const modal = document.getElementById('modalContainer');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 400px;">
        <h2 style="color: var(--cream); margin-bottom: 1.5rem;">Add Table/Resource</h2>
        <form id="addTableForm" onsubmit="submitTableForm(event)">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Name *</label>
            <input type="text" name="name" required placeholder="e.g., Table 1, Pool Table A" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Type *</label>
            <select name="type" required style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
              <option value="table">Table</option>
              <option value="pool_table">Pool Table</option>
              <option value="room">Private Room</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Capacity *</label>
            <input type="number" name="capacity" required min="1" value="4" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <button type="submit" class="btn-primary" style="flex: 1;">Add Resource</button>
            <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;
  modal.style.display = 'block';
}

async function submitTableForm(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  try {
    await apiRequest('/api/staff/resources', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    closeModal();
    loadTables();
    alert('Resource added successfully!');
  } catch (error) {
    console.error('Error adding resource:', error);
    alert('Failed to add resource');
  }
}

async function generateQRCode(id) {
  try {
    await apiRequest(`/api/staff/resources/${id}/generate-qr`, { method: 'POST' });
    loadTables();
    alert('QR Code generated successfully!');
  } catch (error) {
    console.error('Error generating QR code:', error);
    alert('Failed to generate QR code');
  }
}

async function toggleResourceStatus(id, isActive) {
  try {
    const response = await apiRequest('/api/staff/resources');
    const resources = await response.json();
    const resource = resources.find(r => r.id === id);
    
    await apiRequest(`/api/staff/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: resource.name,
        type: resource.type,
        capacity: resource.capacity,
        is_active: isActive ? 1 : 0
      })
    });
    
    loadTables();
  } catch (error) {
    console.error('Error updating resource:', error);
    alert('Failed to update resource');
  }
}

async function deleteResource(id) {
  if (!confirm('Are you sure you want to delete this resource? This will also delete its QR code.')) return;
  
  try {
    await apiRequest(`/api/staff/resources/${id}`, { method: 'DELETE' });
    loadTables();
  } catch (error) {
    console.error('Error deleting resource:', error);
    alert('Failed to delete resource');
  }
}

// Media Management Page
async function loadMedia() {
  const page = document.getElementById('mediaPage');
  page.innerHTML = `
    <div style="max-width: 1200px;">
      <div class="page-header" style="margin-bottom: var(--space-xl);">
        <div style="background: rgba(201, 169, 97, 0.1); padding: var(--space-md); border-radius: var(--radius-md); border-left: 3px solid var(--gold); margin-bottom: var(--space-lg);">
          <strong style="color: var(--gold);">📸 Website Photos & Video</strong>
          <p style="margin-top: 0.5rem; color: var(--cream-dark); font-size: 0.9rem;">Manage the hero video, poster image, and gallery photos that appear on the customer-facing website. Upload professional photos of your venue, bar, and pool tables.</p>
        </div>
      </div>
      
      <!-- Hero Section Media -->
      <div class="data-card" style="background: var(--charcoal-800); border: 1px solid rgba(201, 169, 97, 0.1); border-radius: 8px; padding: 2rem; margin-bottom: 1.5rem;">
        <h3 style="color: var(--gold); margin-bottom: 1rem; font-size: 1.25rem;">Hero Section</h3>
        <p style="color: var(--cream-dark); margin-bottom: 1.5rem; font-size: 0.9rem;">The hero section is the first thing visitors see. Upload a poster image and optionally a short video (10-20 seconds) of your venue.</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
          <div>
            <h4 style="color: var(--cream); margin-bottom: 0.75rem;">Hero Poster Image</h4>
            <div id="heroPosterPreview" style="aspect-ratio: 16/9; background: var(--charcoal-900); border-radius: 6px; overflow: hidden; margin-bottom: 0.75rem;">
              <img src="/media/hero/poster-desktop.jpg" alt="Current hero poster" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <button class="btn-secondary" onclick="uploadHeroMedia('hero_poster')" style="width: 100%;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload New Poster
            </button>
          </div>
          
          <div>
            <h4 style="color: var(--cream); margin-bottom: 0.75rem;">Hero Video (Optional)</h4>
            <div style="aspect-ratio: 16/9; background: var(--charcoal-900); border-radius: 6px; overflow: hidden; margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: center;">
              <div style="text-align: center; padding: 2rem; color: var(--cream-dark);">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem; opacity: 0.5;">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <p style="font-size: 0.875rem;">No video uploaded yet</p>
                <p style="font-size: 0.75rem; margin-top: 0.5rem;">Upload a 10-20 second MP4 video</p>
              </div>
            </div>
            <button class="btn-secondary" onclick="uploadHeroMedia('hero_video')" style="width: 100%;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload Video
            </button>
          </div>
        </div>
        
        <div style="padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 6px; font-size: 0.85rem; color: var(--cream-dark);">
          <strong style="color: var(--gold);">💡 Tips:</strong> Use high-quality photos (1920x1080 or larger). Keep videos under 20 seconds and 10MB. Videos show only on fast connections.
        </div>
      </div>
      
      <!-- Gallery Section -->
      <div class="data-card" style="background: var(--charcoal-800); border: 1px solid rgba(201, 169, 97, 0.1); border-radius: 8px; padding: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div>
            <h3 style="color: var(--gold); margin-bottom: 0.25rem; font-size: 1.25rem;">Gallery Photos</h3>
            <p style="color: var(--cream-dark); font-size: 0.9rem;">Photos of your venue that visitors can browse</p>
          </div>
          <button class="btn-primary" onclick="uploadGalleryPhoto()">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Photo
          </button>
        </div>
        
        <div id="galleryMediaList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
          <div class="loading"><div class="spinner"></div><p>Loading gallery...</p></div>
        </div>
      </div>
    </div>
  `;
  
  // Load gallery photos
  loadGalleryMedia();
}

async function loadGalleryMedia() {
  try {
    const response = await apiRequest('/api/staff/media?type=gallery');
    const media = await response.json();
    
    const container = document.getElementById('galleryMediaList');
    if (!container) return;
    
    if (media.length === 0) {
      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--cream-dark);"><p>No gallery photos yet. Add your first photo!</p></div>';
      return;
    }
    
    container.innerHTML = media.map(item => `
      <div class="data-card" style="background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.1); border-radius: 8px; overflow: hidden;">
        <img src="${item.file_path}" alt="${item.alt_text || 'Gallery photo'}" style="width: 100%; aspect-ratio: 4/3; object-fit: cover;">
        <div style="padding: 0.75rem;">
          <input 
            type="text" 
            value="${item.alt_text || ''}" 
            placeholder="Photo description (for accessibility)"
            onblur="updateMediaAlt(${item.id}, this.value)"
            style="width: 100%; padding: 0.5rem; background: var(--charcoal-800); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 4px; color: var(--cream); font-size: 0.8125rem; margin-bottom: 0.5rem;">
          <div style="display: flex; gap: 0.5rem;">
            <button class="tab-btn" style="flex: 1; padding: 0.375rem; font-size: 0.75rem;" onclick="deleteMedia(${item.id})">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading gallery:', error);
  }
}

function uploadHeroMedia(type) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = type === 'hero_video' ? 'video/mp4,video/webm' : 'image/jpeg,image/jpg,image/png,image/webp';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size
    const maxSize = type === 'hero_video' ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for video, 5MB for image
    if (file.size > maxSize) {
      alert(`File too large! Max size: ${maxSize / 1024 / 1024}MB`);
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('alt_text', type === 'hero_poster' ? "Pool's Arena Club & Bar interior" : 'Hero video');
    
    try {
      const response = await fetch('/api/staff/media', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      alert(`${type === 'hero_video' ? 'Video' : 'Photo'} uploaded successfully! Refresh to see changes.`);
      loadMedia();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
  };
  
  input.click();
}

function uploadGalleryPhoto() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo too large! Max size: 5MB');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'gallery');
    formData.append('alt_text', "Pool's Arena venue photo");
    
    try {
      const response = await fetch('/api/staff/media', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      alert('Photo uploaded successfully!');
      loadGalleryMedia();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
  };
  
  input.click();
}

async function updateMediaAlt(id, altText) {
  try {
    await apiRequest(`/api/staff/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ alt_text: altText })
    });
  } catch (error) {
    console.error('Error updating alt text:', error);
  }
}

async function deleteMedia(id) {
  if (!confirm('Delete this photo? This cannot be undone.')) return;
  
  try {
    await apiRequest(`/api/staff/media/${id}`, { method: 'DELETE' });
    loadGalleryMedia();
  } catch (error) {
    console.error('Error deleting media:', error);
    alert('Failed to delete photo');
  }
}

// Settings Page
async function loadSettings() {
  const page = document.getElementById('settingsPage');
  page.innerHTML = `
    <div style="max-width: 800px;">
      <div class="loading"><div class="spinner"></div><p>Loading settings...</p></div>
    </div>
  `;
  
  try {
    const response = await apiRequest('/api/staff/settings');
    const settings = await response.json();
    
    page.innerHTML = `
      <div style="max-width: 800px;">
        <div class="data-card" style="background: var(--charcoal-800); border: 1px solid rgba(201, 169, 97, 0.1); border-radius: 8px; padding: 2rem; margin-bottom: 1.5rem;">
          <h3 style="color: var(--gold); margin-bottom: 1.5rem; font-size: 1.25rem;">Business Information</h3>
          <form id="businessSettingsForm" onsubmit="submitBusinessSettings(event)">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Business Name</label>
                <input type="text" name="business_name" value="${settings.business_name || ''}" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
              </div>
              <div>
                <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Phone</label>
                <input type="tel" name="phone" value="${settings.phone || ''}" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
              </div>
            </div>
            <div style="margin-bottom: 1rem;">
              <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Location</label>
              <input type="text" name="location" value="${settings.location || ''}" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Opening Time</label>
                <input type="time" name="opening_time" value="${settings.opening_time || ''}" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
              </div>
              <div>
                <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Closing Time</label>
                <input type="time" name="closing_time" value="${settings.closing_time || ''}" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
              </div>
              <div>
                <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Opening Days</label>
                <input type="text" name="opening_days" value="${settings.opening_days || ''}" placeholder="Mon-Sun" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
              </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
              <div>
                <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">MTN Mobile Money Code</label>
                <input type="text" name="mtn_merchant_code" value="${settings.mtn_merchant_code || ''}" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
              </div>
              <div>
                <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Orange Money Code</label>
                <input type="text" name="orange_merchant_code" value="${settings.orange_merchant_code || ''}" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
              </div>
            </div>
            <button type="submit" class="btn-primary">Save Settings</button>
          </form>
        </div>
        
        <div class="data-card" style="background: var(--charcoal-800); border: 1px solid rgba(201, 169, 97, 0.1); border-radius: 8px; padding: 2rem;">
          <h3 style="color: var(--gold); margin-bottom: 1.5rem; font-size: 1.25rem;">Change Password</h3>
          <form id="changePasswordForm" onsubmit="submitChangePassword(event)">
            <div style="margin-bottom: 1rem;">
              <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Current Password</label>
              <input type="password" name="current_password" required style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
            </div>
            <div style="margin-bottom: 1rem;">
              <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">New Password</label>
              <input type="password" name="new_password" required minlength="6" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Confirm New Password</label>
              <input type="password" name="confirm_password" required minlength="6" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
            </div>
            <button type="submit" class="btn-primary">Change Password</button>
          </form>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function submitBusinessSettings(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  try {
    await apiRequest('/api/staff/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    alert('Settings saved successfully!');
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Failed to save settings');
  }
}

async function submitChangePassword(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  
  if (formData.get('new_password') !== formData.get('confirm_password')) {
    alert('New passwords do not match!');
    return;
  }
  
  try {
    await apiRequest('/api/staff/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: formData.get('current_password'),
        new_password: formData.get('new_password')
      })
    });
    
    form.reset();
    alert('Password changed successfully!');
  } catch (error) {
    console.error('Error changing password:', error);
    alert('Failed to change password. Check your current password.');
  }
}

function closeModal() {
  document.getElementById('modalContainer').style.display = 'none';
  document.getElementById('modalContainer').innerHTML = '';
}

function filterOrders(status) {
  console.log('Filter orders:', status);
  document.querySelectorAll('#ordersPage .tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  loadOrders();
}
