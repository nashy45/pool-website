// Global state
let token = localStorage.getItem('staffToken');
let currentPage = 'overview';
let currentOrderFilter = 'all';
let galleryMediaItems = [];

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
  document.querySelectorAll('#ordersPage [data-order-filter]').forEach(button => {
    button.classList.toggle('active', button.dataset.orderFilter === currentOrderFilter);
  });
  
  try {
    const query = currentOrderFilter === 'all'
      ? ''
      : `?status=${encodeURIComponent(currentOrderFilter)}`;
    const response = await apiRequest(`/api/staff/orders${query}`);
    if (!response.ok) throw new Error('Failed to load orders');
    const orders = await response.json();
    
    if (orders.length === 0) {
      const emptyMessage = currentOrderFilter === 'all'
        ? 'No orders yet'
        : `No ${currentOrderFilter} orders`;
      container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📦</div><p>${emptyMessage}</p></div>`;
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
    const response = await apiRequest(`/api/staff/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update order status');
    await loadOrders();
    if (currentPage === 'overview') loadOverviewData();
  } catch (error) {
    console.error('Error updating order:', error);
    alert(error.message || 'Failed to update order status');
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
    formData.append('is_hidden', item.is_hidden ? '1' : '0');
    
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

async function editMenuItem(id) {
  try {
    const [itemsResponse, categoriesResponse] = await Promise.all([
      apiRequest('/api/staff/menu'),
      apiRequest('/api/staff/menu-categories')
    ]);

    if (!itemsResponse.ok || !categoriesResponse.ok) {
      throw new Error('Failed to load menu item details');
    }

    const [items, categories] = await Promise.all([
      itemsResponse.json(),
      categoriesResponse.json()
    ]);
    const item = items.find(menuItem => Number(menuItem.id) === Number(id));

    if (!item) {
      alert('Menu item not found. Refresh the menu and try again.');
      return;
    }

    window.menuCategories = categories;
    const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
    const modal = document.getElementById('modalContainer');
    modal.innerHTML = `
      <div class="modal-overlay" onclick="closeModal()">
        <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 500px; width: 100%;">
          <h2 style="color: var(--cream); margin-bottom: 1.5rem;">Edit Menu Item</h2>
          <form id="editMenuItemForm">
            <div style="margin-bottom: 1rem;">
              <label for="editMenuItemName" style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Name *</label>
              <input id="editMenuItemName" type="text" name="name" value="${escapeHTML(item.name)}" required style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
            </div>
            <div style="margin-bottom: 1rem;">
              <label for="editMenuItemCategory" style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Category *</label>
              <select id="editMenuItemCategory" name="category_id" required style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
                ${categories.map(category => `
                  <option value="${category.id}" ${Number(category.id) === Number(item.category_id) ? 'selected' : ''}>${escapeHTML(category.name)}</option>
                `).join('')}
              </select>
            </div>
            <div style="margin-bottom: 1rem;">
              <label for="editMenuItemPrice" style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Price (FCFA) *</label>
              <input id="editMenuItemPrice" type="number" name="price" value="${escapeHTML(item.price)}" required min="0" step="1" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
            </div>
            <div style="margin-bottom: 1rem;">
              <label for="editMenuItemDescription" style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Description</label>
              <textarea id="editMenuItemDescription" name="description" rows="3" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream); resize: vertical;">${escapeHTML(item.description)}</textarea>
            </div>
            <div style="margin-bottom: 1rem; color: var(--cream);">
              <label><input type="checkbox" name="is_available" ${item.is_available ? 'checked' : ''}> Available for order</label>
            </div>
            <div style="margin-bottom: 1rem; color: var(--cream);">
              <label><input type="checkbox" name="is_hidden" ${item.is_hidden ? 'checked' : ''}> Hide from customer menu</label>
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label for="editMenuItemImage" style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-size: 0.875rem;">Change Image</label>
              <input id="editMenuItemImage" type="file" name="image" accept="image/*" style="width: 100%; padding: 0.75rem; background: var(--charcoal-900); border: 1px solid rgba(201, 169, 97, 0.2); border-radius: 6px; color: var(--cream);">
              ${item.image_url ? `<small style="display: block; color: var(--cream-dark); margin-top: 0.5rem;">Current image will be kept unless you choose a replacement.</small><img src="${escapeHTML(item.image_url)}" alt="Current ${escapeHTML(item.name)}" style="width: 100%; max-height: 140px; object-fit: cover; margin-top: 0.5rem; border-radius: 6px;">` : ''}
            </div>
            <div style="display: flex; gap: 0.75rem;">
              <button type="submit" class="btn-primary" style="flex: 1;">Save Changes</button>
              <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
    modal.style.display = 'block';

    document.getElementById('editMenuItemForm').addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      formData.set('is_available', form.elements.is_available.checked ? '1' : '0');
      formData.set('is_hidden', form.elements.is_hidden.checked ? '1' : '0');
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;

      try {
        const response = await fetch(`/api/staff/menu/${id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Failed to update menu item');
        }

        closeModal();
        await loadMenu();
        loadOverviewData();
        alert('Menu item updated successfully!');
      } catch (error) {
        console.error('Error updating menu item:', error);
        alert(error.message || 'Failed to update menu item');
        submitButton.disabled = false;
      }
    });
  } catch (error) {
    console.error('Error loading menu item for editing:', error);
    alert(error.message || 'Failed to open menu item for editing');
  }
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
      <button class="btn-secondary" onclick="printTableQRCodes()">
        Print QR Codes / Save as PDF
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
    if (!response.ok) throw new Error('Failed to load tables and resources');
    const resources = await response.json();
    window.tableResources = resources;
    
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
    const container = document.getElementById('tablesContainer');
    if (container) container.innerHTML = '<div class="empty-state"><p>Error loading tables</p></div>';
  }
}

function printTableQRCodes() {
  const resources = (window.tableResources || []).filter(
    resource => resource.is_active && resource.qr_code_url
  );

  if (resources.length === 0) {
    alert('There are no QR codes to print yet. Generate a QR code for an active table first.');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Allow pop-ups for this dashboard to print or save your QR codes as a PDF.');
    return;
  }

  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
  const cards = resources.map(resource => `
    <article class="qr-card">
      <h2>${escapeHTML(resource.name)}</h2>
      <img src="${escapeHTML(new URL(resource.qr_code_url, window.location.origin).href)}" alt="QR code for ${escapeHTML(resource.name)}">
      <p>Scan to view the menu and order at this table</p>
    </article>
  `).join('');

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Pool's Arena Table QR Codes</title>
      <style>
        @page { size: A4; margin: 14mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #202020; font: 14px Arial, sans-serif; }
        header { margin-bottom: 18px; text-align: center; }
        header h1 { margin: 0 0 5px; font-size: 22px; }
        header p { margin: 0; color: #555; }
        .qr-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12mm 10mm; }
        .qr-card { display: flex; min-height: 100mm; flex-direction: column; align-items: center; justify-content: center; padding: 8mm; border: 1px solid #bbb; border-radius: 4mm; text-align: center; break-inside: avoid; }
        .qr-card h2 { margin: 0 0 5mm; font-size: 20px; }
        .qr-card img { width: 58mm; height: 58mm; object-fit: contain; image-rendering: pixelated; }
        .qr-card p { margin: 5mm 0 0; font-size: 12px; }
        .print-error { padding: 16px; color: #a00; text-align: center; }
        @media screen {
          body { max-width: 210mm; margin: 20px auto; padding: 16px; }
          .qr-card { min-height: 110mm; }
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Pool's Arena Club &amp; Bar</h1>
        <p>Table QR codes · Scan to open the menu for your table</p>
      </header>
      <main class="qr-grid">${cards}</main>
      <script>
        const images = Array.from(document.images);
        Promise.all(images.map(image => image.decode().catch(() => null))).then(() => {
          const failed = images.filter(image => !image.naturalWidth);
          if (failed.length) {
            document.body.insertAdjacentHTML('afterbegin',
              '<p class="print-error">Some QR codes could not be loaded. Close this page and try again.</p>');
            return;
          }
          setTimeout(() => window.print(), 250);
        });
      <\/script>
    </body>
    </html>`);
  printWindow.document.close();
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
    <div class="media-management">
      <div class="media-intro">
        <div>
          <strong>📸 Website Photos &amp; Video</strong>
          <p>Manage the hero video, poster image, and gallery photos that appear on the customer-facing website. Upload professional photos of your venue, bar, and pool tables.</p>
        </div>
      </div>
      
      <!-- Hero Section Media -->
      <div class="data-card media-section-card">
        <h3>Hero Section</h3>
        <p class="media-section-description">The hero section is the first thing visitors see. Upload a poster image and optionally a short video (10-20 seconds) of your venue.</p>
        
        <div class="hero-media-grid">
          <div class="hero-media-slot">
            <h4>Hero Poster Image</h4>
            <div id="heroPosterPreview" class="hero-media-preview">
              <img src="/media/hero/poster-desktop.jpg" alt="Current hero poster" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <p id="heroPosterStatus" class="media-file-status">Using the default website image</p>
            <button class="btn-secondary media-upload-button" onclick="uploadHeroMedia('hero_poster')">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload New Poster
            </button>
          </div>
          
          <div class="hero-media-slot">
            <h4>Hero Video <span class="media-optional">Optional</span></h4>
            <div id="heroVideoPreview" class="hero-media-preview hero-video-preview">
              <div style="text-align: center; padding: 2rem; color: var(--cream-dark);">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem; opacity: 0.5;">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <p>No video uploaded yet</p>
                <p>Upload a 10-20 second MP4 video</p>
              </div>
            </div>
            <p id="heroVideoStatus" class="media-file-status">No custom video uploaded</p>
            <button class="btn-secondary media-upload-button" onclick="uploadHeroMedia('hero_video')">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload Video
            </button>
          </div>
        </div>
        
        <div class="media-tip">
          <strong style="color: var(--gold);">💡 Tips:</strong> Use high-quality photos (1920x1080 or larger). Keep videos under 20 seconds and 10MB. Videos show only on fast connections.
        </div>
      </div>
      
      <!-- Gallery Section -->
      <div class="data-card media-section-card">
        <div class="media-section-heading">
          <div>
            <h3>Gallery Photos</h3>
            <p class="media-section-description">Photos of your venue that visitors can browse</p>
          </div>
          <button class="btn-primary" onclick="uploadGalleryPhoto()">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Gallery Photo
          </button>
        </div>
        
        <div id="galleryMediaList" class="media-gallery-grid">
          <div class="loading"><div class="spinner"></div><p>Loading gallery...</p></div>
        </div>
      </div>
    </div>
  `;
  
  loadHeroMedia();
  loadGalleryMedia();
}

async function loadHeroMedia() {
  try {
    const [posterResponse, videoResponse] = await Promise.all([
      apiRequest('/api/staff/media?type=hero_poster'),
      apiRequest('/api/staff/media?type=hero_video')
    ]);
    if (!posterResponse.ok || !videoResponse.ok) {
      throw new Error('Failed to load homepage media');
    }

    const [posters, videos] = await Promise.all([
      posterResponse.json(),
      videoResponse.json()
    ]);
    const poster = posters[0];
    const video = videos[0];

    if (poster) {
      document.getElementById('heroPosterPreview').innerHTML =
        `<img src="${escapeMediaHTML(poster.file_path)}" alt="${escapeMediaHTML(poster.alt_text || 'Current hero poster')}">`;
      document.getElementById('heroPosterStatus').textContent =
        `Uploaded ${new Date(poster.created_at).toLocaleDateString()}`;
    }

    if (video) {
      document.getElementById('heroVideoPreview').innerHTML =
        `<video src="${escapeMediaHTML(video.file_path)}" controls preload="metadata" aria-label="Uploaded homepage background video"></video>`;
      document.getElementById('heroVideoStatus').textContent =
        `Uploaded ${new Date(video.created_at).toLocaleDateString()}`;
    }
  } catch (error) {
    console.error('Error loading homepage media:', error);
    const status = document.getElementById('heroPosterStatus');
    if (status) status.textContent = 'Could not load uploaded media. Refresh to try again.';
  }
}

async function loadGalleryMedia() {
  try {
    const response = await apiRequest('/api/staff/media?type=gallery');
    if (!response.ok) throw new Error('Failed to load gallery photos');
    const media = await response.json();
    galleryMediaItems = media;
    
    const container = document.getElementById('galleryMediaList');
    if (!container) return;
    
    if (media.length === 0) {
      container.innerHTML = '<div class="media-gallery-empty"><span aria-hidden="true">▧</span><strong>Your gallery is ready for its first photo</strong><p>Add photos of your venue, bar, food, or pool tables.</p></div>';
      return;
    }
    
    container.innerHTML = media.map(item => `
      <article class="media-gallery-item">
        <img src="${escapeMediaHTML(item.file_path)}" alt="${escapeMediaHTML(item.alt_text || 'Gallery photo')}">
        <div class="media-gallery-item-content">
          <label for="media-alt-${item.id}">Photo description</label>
          <input
            id="media-alt-${item.id}"
            type="text"
            value="${escapeMediaHTML(item.alt_text || '')}"
            placeholder="Describe this photo"
            onchange="updateMediaAlt(${item.id}, this.value)">
          <button class="media-delete-button" onclick="deleteMedia(${item.id})">Delete photo</button>
        </div>
      </article>
    `).join('');
  } catch (error) {
    console.error('Error loading gallery:', error);
    const container = document.getElementById('galleryMediaList');
    if (container) {
      container.innerHTML = '<div class="media-gallery-empty"><strong>Could not load gallery photos</strong><p>Refresh the page to try again.</p></div>';
    }
  }
}

function escapeMediaHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
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
      
      alert(`${type === 'hero_video' ? 'Video' : 'Photo'} uploaded successfully!`);
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
    const item = galleryMediaItems.find(media => Number(media.id) === Number(id));
    if (!item) throw new Error('Gallery photo not found. Refresh the page and try again.');

    const response = await apiRequest(`/api/staff/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        alt_text: altText,
        caption: item.caption || '',
        display_order: item.display_order,
        is_active: item.is_active
      })
    });
    if (!response.ok) throw new Error('Failed to update photo description');
  } catch (error) {
    console.error('Error updating alt text:', error);
    alert(error.message || 'Failed to update photo description');
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
  const filters = ['all', 'new', 'preparing', 'ready', 'served'];
  if (!filters.includes(status)) return;
  currentOrderFilter = status;
  loadOrders();
}
