// Global state
let token = localStorage.getItem('adminToken');
let currentPage = 'overview';
let currentOrderFilter = 'all';
let currentReservationFilter = 'all';
let allOrders = [];
let allReservations = [];
let menuCategories = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    showDashboard();
  } else {
    showLogin();
  }
});

// Authentication
function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('dashboardScreen').style.display = 'none';
}

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboardScreen').style.display = 'flex';
  initDashboard();
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.get('username'),
        password: formData.get('password')
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      token = data.token;
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', data.user.username);
      showDashboard();
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please try again.');
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  if (confirm('Are you sure you want to logout?')) {
    token = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    showLogin();
  }
});

// Dashboard initialization
function initDashboard() {
  const username = localStorage.getItem('adminUser');
  document.getElementById('userName').textContent = username || 'Owner';
  
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateTo(page);
    });
  });
  
  // Load initial data
  loadStats();
  loadOrders();
  loadReservations();
  
  // Auto-refresh every 30 seconds
  setInterval(() => {
    loadStats();
    if (currentPage === 'orders') loadOrders();
    if (currentPage === 'reservations') loadReservations();
  }, 30000);
}

function navigateTo(page) {
  currentPage = page;
  
  // Update navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) {
      item.classList.add('active');
    }
  });
  
  // Update pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });
  document.getElementById(`${page}Page`).classList.add('active');
  
  // Update title
  const titles = {
    overview: 'Dashboard Overview',
    orders: 'Orders Management',
    reservations: 'Reservations Management',
    menu: 'Menu Management',
    tables: 'Tables & Resources',
    settings: 'Business Settings',
    account: 'Account Settings'
  };
  document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
  
  // Load page data
  if (page === 'menu') loadMenu();
  if (page === 'tables') loadTables();
  if (page === 'settings') loadSettings();
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
    alert('Session expired. Please login again.');
    token = null;
    localStorage.removeItem('adminToken');
    showLogin();
    throw new Error('Unauthorized');
  }
  
  return response;
}

// Stats
async function loadStats() {
  try {
    const response = await apiRequest('/api/admin/stats');
    const stats = await response.json();
    
    document.getElementById('statPendingOrders').textContent = stats.pending_orders;
    document.getElementById('statPendingReservations').textContent = stats.pending_reservations;
    document.getElementById('statMenuItems').textContent = stats.menu_items;
    document.getElementById('statTables').textContent = stats.active_tables;
    document.getElementById('statTodayOrders').textContent = stats.today_orders;
    document.getElementById('statTodayRevenue').textContent = (stats.today_revenue || 0).toLocaleString();
    
    document.getElementById('ordersBadge').textContent = stats.pending_orders;
    document.getElementById('reservationsBadge').textContent = stats.pending_reservations;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Orders
async function loadOrders() {
  const container = document.getElementById('ordersContainer');
  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading orders...</p></div>';
  
  try {
    const response = await apiRequest('/api/admin/orders');
    allOrders = await response.json();
    
    filterOrders(currentOrderFilter);
  } catch (error) {
    console.error('Error loading orders:', error);
    container.innerHTML = '<div class="empty-state"><p>Error loading orders</p></div>';
  }
}

function filterOrders(filter) {
  currentOrderFilter = filter;
  
  // Update tab buttons
  document.querySelectorAll('#ordersPage .tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event?.target?.classList.add('active');
  
  const container = document.getElementById('ordersContainer');
  let orders = allOrders;
  
  if (filter !== 'all') {
    orders = allOrders.filter(o => o.status === filter);
  }
  
  if (orders.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📦</div><p>No orders found</p></div>';
    return;
  }
  
  container.innerHTML = orders.map(order => `
    <div class="data-card">
      <div class="data-card-header">
        <div>
          <div class="data-card-title">Order #${order.order_number}</div>
          <div class="data-card-meta">
            ${new Date(order.created_at).toLocaleString()} • 
            ${order.customer_name} • ${order.customer_phone}
            ${order.table_name ? ` • Table: ${order.table_name}` : ''}
          </div>
        </div>
        <div>
          <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span>
          <span class="status-badge ${order.payment_status === 'paid' ? 'status-paid' : 'status-unpaid'}">
            ${order.payment_status === 'paid' ? '✓ PAID' : 'UNPAID'}
          </span>
        </div>
      </div>
      <div class="data-card-body">
        <strong>Items:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
          ${order.items.map(item => `
            <li>${item.quantity}x ${item.menu_item_name} - ${item.subtotal.toLocaleString()} FCFA</li>
          `).join('')}
        </ul>
        <strong>Total: ${order.total_amount.toLocaleString()} FCFA</strong><br>
        <strong>Payment: ${formatPaymentMethod(order.payment_method)}</strong>
        ${order.notes ? `<br><strong>Notes:</strong> ${order.notes}` : ''}
      </div>
      <div class="data-card-footer">
        <select onchange="updateOrderStatus(${order.id}, this.value)" class="btn btn-sm" style="width: auto;">
          <option value="">Change Status...</option>
          <option value="new">New</option>
          <option value="accepted">Accepted</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="served">Served</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button class="btn btn-sm ${order.payment_status === 'paid' ? 'btn-secondary' : 'btn-success'}" 
                onclick="togglePaymentStatus(${order.id}, '${order.payment_status}')">
          ${order.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
        </button>
      </div>
    </div>
  `).join('');
}

function formatPaymentMethod(method) {
  const methods = {
    mtn_momo: 'MTN Mobile Money',
    orange_money: 'Orange Money',
    pay_at_venue: 'Pay at Venue'
  };
  return methods[method] || method;
}

async function updateOrderStatus(orderId, status) {
  if (!status) return;
  
  try {
    const response = await apiRequest(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    
    if (response.ok) {
      loadOrders();
      loadStats();
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to update status');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    alert('Failed to update order status');
  }
}

async function togglePaymentStatus(orderId, currentStatus) {
  const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
  
  try {
    const response = await apiRequest(`/api/admin/orders/${orderId}/payment-status`, {
      method: 'PATCH',
      body: JSON.stringify({ payment_status: newStatus })
    });
    
    if (response.ok) {
      loadOrders();
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to update payment status');
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    alert('Failed to update payment status');
  }
}

// Reservations
async function loadReservations() {
  const container = document.getElementById('reservationsContainer');
  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading reservations...</p></div>';
  
  try {
    const response = await apiRequest('/api/admin/reservations');
    allReservations = await response.json();
    
    filterReservations(currentReservationFilter);
  } catch (error) {
    console.error('Error loading reservations:', error);
    container.innerHTML = '<div class="empty-state"><p>Error loading reservations</p></div>';
  }
}

function filterReservations(filter) {
  currentReservationFilter = filter;
  
  // Update tab buttons
  document.querySelectorAll('#reservationsPage .tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event?.target?.classList.add('active');
  
  const container = document.getElementById('reservationsContainer');
  let reservations = allReservations;
  
  if (filter !== 'all') {
    reservations = allReservations.filter(r => r.status === filter);
  }
  
  if (reservations.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><p>No reservations found</p></div>';
    return;
  }
  
  container.innerHTML = reservations.map(res => `
    <div class="data-card">
      <div class="data-card-header">
        <div>
          <div class="data-card-title">Reservation #${res.reservation_number}</div>
          <div class="data-card-meta">
            ${res.customer_name} • ${res.customer_phone}
          </div>
        </div>
        <span class="status-badge status-${res.status}">${res.status.toUpperCase()}</span>
      </div>
      <div class="data-card-body">
        <strong>Resource:</strong> ${res.resource_name} (${formatResourceType(res.resource_type)})<br>
        <strong>Date:</strong> ${new Date(res.date).toLocaleDateString()}<br>
        <strong>Time:</strong> ${res.start_time} - ${res.end_time} (${res.duration} minutes)<br>
        <strong>Group Size:</strong> ${res.group_size} people<br>
        ${res.notes ? `<strong>Notes:</strong> ${res.notes}<br>` : ''}
        <small style="color: var(--light-gray);">Created: ${new Date(res.created_at).toLocaleString()}</small>
      </div>
      <div class="data-card-footer">
        ${res.status === 'pending' ? `
          <button class="btn btn-sm btn-success" onclick="updateReservationStatus(${res.id}, 'confirmed')">Confirm</button>
          <button class="btn btn-sm btn-danger" onclick="updateReservationStatus(${res.id}, 'declined')">Decline</button>
        ` : ''}
        ${res.status === 'confirmed' ? `
          <button class="btn btn-sm btn-warning" onclick="updateReservationStatus(${res.id}, 'cancelled')">Cancel</button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function formatResourceType(type) {
  const types = {
    pool_table: 'Pool Table',
    dining_table: 'Dining Table',
    event_space: 'Event Space'
  };
  return types[type] || type;
}

async function updateReservationStatus(reservationId, status) {
  if (!confirm(`Are you sure you want to ${status} this reservation?`)) return;
  
  try {
    const response = await apiRequest(`/api/admin/reservations/${reservationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    
    if (response.ok) {
      loadReservations();
      loadStats();
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to update status');
    }
  } catch (error) {
    console.error('Error updating reservation status:', error);
    alert('Failed to update reservation status');
  }
}

// Menu Management
async function loadMenu() {
  const container = document.getElementById('menuContainer');
  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading menu...</p></div>';
  
  try {
    const [itemsResponse, categoriesResponse] = await Promise.all([
      apiRequest('/api/admin/menu'),
      apiRequest('/api/admin/menu-categories')
    ]);
    
    const items = await itemsResponse.json();
    menuCategories = await categoriesResponse.json();
    
    if (items.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🍽️</div><p>No menu items yet. Add your first item!</p></div>';
      return;
    }
    
    container.innerHTML = `<div class="menu-items-grid">${items.map(item => `
      <div class="menu-item-card">
        <div class="menu-item-image">
          ${item.image_url 
            ? `<img src="${item.image_url}" alt="${item.name}">`
            : `<span>🍴</span>`
          }
        </div>
        <div class="menu-item-content">
          <div class="menu-item-header">
            <div class="menu-item-name">${item.name}</div>
            <div class="menu-item-price">${item.price.toLocaleString()} FCFA</div>
          </div>
          <div class="menu-item-category">${item.category_name}</div>
          ${item.description ? `<p style="color: var(--light-gray); font-size: 0.9rem;">${item.description}</p>` : ''}
          <div style="margin-top: 0.5rem;">
            <span class="status-badge ${item.is_available ? 'status-confirmed' : 'status-cancelled'}">
              ${item.is_available ? 'Available' : 'Sold Out'}
            </span>
            ${item.is_hidden ? '<span class="status-badge status-cancelled">Hidden</span>' : ''}
          </div>
          <div class="menu-item-actions">
            <button class="btn btn-sm btn-primary" onclick="editMenuItem(${item.id})">Edit</button>
            <button class="btn btn-sm ${item.is_available ? 'btn-warning' : 'btn-success'}" 
                    onclick="toggleMenuItemAvailability(${item.id}, ${item.is_available})">
              ${item.is_available ? 'Mark Sold Out' : 'Mark Available'}
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteMenuItem(${item.id})">Delete</button>
          </div>
        </div>
      </div>
    `).join('')}</div>`;
  } catch (error) {
    console.error('Error loading menu:', error);
    container.innerHTML = '<div class="empty-state"><p>Error loading menu</p></div>';
  }
}

function showAddMenuItem() {
  showModal('Add Menu Item', `
    <form id="addMenuItemForm">
      <div class="form-group">
        <label>Item Name *</label>
        <input type="text" name="name" required>
      </div>
      <div class="form-group">
        <label>Category *</label>
        <select name="category_id" required>
          ${menuCategories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Price (FCFA) *</label>
        <input type="number" name="price" min="0" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea name="description" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>Image</label>
        <input type="file" name="image" accept="image/*">
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add Item</button>
      </div>
    </form>
  `);
  
  document.getElementById('addMenuItemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (response.ok) {
        closeModal();
        loadMenu();
        loadStats();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add menu item');
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Failed to add menu item');
    }
  });
}

async function editMenuItem(id) {
  try {
    const response = await apiRequest('/api/admin/menu');
    const items = await response.json();
    const item = items.find(i => i.id === id);
    
    if (!item) return;
    
    showModal('Edit Menu Item', `
      <form id="editMenuItemForm">
        <div class="form-group">
          <label>Item Name *</label>
          <input type="text" name="name" value="${item.name}" required>
        </div>
        <div class="form-group">
          <label>Category *</label>
          <select name="category_id" required>
            ${menuCategories.map(cat => `
              <option value="${cat.id}" ${cat.id === item.category_id ? 'selected' : ''}>${cat.name}</option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Price (FCFA) *</label>
          <input type="number" name="price" value="${item.price}" min="0" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea name="description" rows="3">${item.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" name="is_available" ${item.is_available ? 'checked' : ''}>
            Available for order
          </label>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" name="is_hidden" ${item.is_hidden ? 'checked' : ''}>
            Hidden from menu
          </label>
        </div>
        <div class="form-group">
          <label>Change Image</label>
          <input type="file" name="image" accept="image/*">
          ${item.image_url ? `<small>Current image will be replaced if you upload a new one</small>` : ''}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Update Item</button>
        </div>
      </form>
    `);
    
    document.getElementById('editMenuItemForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      formData.append('is_available', e.target.is_available.checked ? '1' : '0');
      formData.append('is_hidden', e.target.is_hidden.checked ? '1' : '0');
      
      try {
        const response = await fetch(`/api/admin/menu/${id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        
        if (response.ok) {
          closeModal();
          loadMenu();
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to update menu item');
        }
      } catch (error) {
        console.error('Error updating menu item:', error);
        alert('Failed to update menu item');
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

async function toggleMenuItemAvailability(id, currentStatus) {
  try {
    const formData = new FormData();
    formData.append('is_available', currentStatus ? '0' : '1');
    
    // Need to get the item first to send all required fields
    const response = await apiRequest('/api/admin/menu');
    const items = await response.json();
    const item = items.find(i => i.id === id);
    
    if (!item) return;
    
    formData.append('name', item.name);
    formData.append('price', item.price);
    formData.append('category_id', item.category_id);
    formData.append('description', item.description || '');
    
    const updateResponse = await fetch(`/api/admin/menu/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    if (updateResponse.ok) {
      loadMenu();
    }
  } catch (error) {
    console.error('Error toggling availability:', error);
  }
}

async function deleteMenuItem(id) {
  if (!confirm('Are you sure you want to delete this menu item? This cannot be undone.')) return;
  
  try {
    const response = await apiRequest(`/api/admin/menu/${id}`, { method: 'DELETE' });
    
    if (response.ok) {
      loadMenu();
      loadStats();
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to delete menu item');
    }
  } catch (error) {
    console.error('Error deleting menu item:', error);
    alert('Failed to delete menu item');
  }
}

// Tables Management
async function loadTables() {
  const container = document.getElementById('tablesContainer');
  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading tables...</p></div>';
  
  try {
    const response = await apiRequest('/api/admin/resources');
    const tables = await response.json();
    
    if (tables.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎱</div><p>No tables yet. Add your first table!</p></div>';
      return;
    }
    
    container.innerHTML = `<div class="tables-grid">${tables.map(table => `
      <div class="table-card">
        <div class="table-card-header">
          <div class="table-name">${table.name}</div>
          <span class="status-badge ${table.is_active ? 'status-confirmed' : 'status-cancelled'}">
            ${table.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div class="table-type">${formatResourceType(table.type)}</div>
        <div class="table-capacity">Capacity: ${table.capacity}</div>
        ${table.qr_code_url ? `
          <img src="${table.qr_code_url}" alt="QR Code" class="qr-code-preview">
          <a href="${table.qr_code_url}" download="table-${table.id}-qr.png" class="btn btn-sm btn-secondary btn-block">Download QR Code</a>
        ` : ''}
        <div class="table-actions">
          ${!table.qr_code_url ? `
            <button class="btn btn-sm btn-primary" onclick="generateQRCode(${table.id})">Generate QR Code</button>
          ` : ''}
          <button class="btn btn-sm btn-info" onclick="editTable(${table.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteTable(${table.id})">Delete</button>
        </div>
      </div>
    `).join('')}</div>`;
  } catch (error) {
    console.error('Error loading tables:', error);
    container.innerHTML = '<div class="empty-state"><p>Error loading tables</p></div>';
  }
}

function showAddTable() {
  showModal('Add Table/Resource', `
    <form id="addTableForm">
      <div class="form-group">
        <label>Name *</label>
        <input type="text" name="name" placeholder="e.g., Pool Table 1, Table A" required>
      </div>
      <div class="form-group">
        <label>Type *</label>
        <select name="type" required>
          <option value="pool_table">Pool Table</option>
          <option value="dining_table">Dining Table</option>
          <option value="event_space">Event Space</option>
        </select>
      </div>
      <div class="form-group">
        <label>Capacity *</label>
        <input type="number" name="capacity" min="1" value="2" required>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add Table</button>
      </div>
    </form>
  `);
  
  document.getElementById('addTableForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await apiRequest('/api/admin/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          type: formData.get('type'),
          capacity: parseInt(formData.get('capacity'))
        })
      });
      
      if (response.ok) {
        closeModal();
        loadTables();
        loadStats();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add table');
      }
    } catch (error) {
      console.error('Error adding table:', error);
      alert('Failed to add table');
    }
  });
}

async function editTable(id) {
  try {
    const response = await apiRequest('/api/admin/resources');
    const tables = await response.json();
    const table = tables.find(t => t.id === id);
    
    if (!table) return;
    
    showModal('Edit Table/Resource', `
      <form id="editTableForm">
        <div class="form-group">
          <label>Name *</label>
          <input type="text" name="name" value="${table.name}" required>
        </div>
        <div class="form-group">
          <label>Type *</label>
          <select name="type" required>
            <option value="pool_table" ${table.type === 'pool_table' ? 'selected' : ''}>Pool Table</option>
            <option value="dining_table" ${table.type === 'dining_table' ? 'selected' : ''}>Dining Table</option>
            <option value="event_space" ${table.type === 'event_space' ? 'selected' : ''}>Event Space</option>
          </select>
        </div>
        <div class="form-group">
          <label>Capacity *</label>
          <input type="number" name="capacity" value="${table.capacity}" min="1" required>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" name="is_active" ${table.is_active ? 'checked' : ''}>
            Active
          </label>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Update Table</button>
        </div>
      </form>
    `);
    
    document.getElementById('editTableForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      try {
        const response = await apiRequest(`/api/admin/resources/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: formData.get('name'),
            type: formData.get('type'),
            capacity: parseInt(formData.get('capacity')),
            is_active: e.target.is_active.checked
          })
        });
        
        if (response.ok) {
          closeModal();
          loadTables();
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to update table');
        }
      } catch (error) {
        console.error('Error updating table:', error);
        alert('Failed to update table');
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

async function generateQRCode(id) {
  try {
    const response = await apiRequest(`/api/admin/resources/${id}/generate-qr`, {
      method: 'POST'
    });
    
    if (response.ok) {
      alert('QR code generated successfully!');
      loadTables();
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to generate QR code');
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    alert('Failed to generate QR code');
  }
}

async function deleteTable(id) {
  if (!confirm('Are you sure you want to delete this table? This will also delete its QR code and cancel any future reservations.')) return;
  
  try {
    const response = await apiRequest(`/api/admin/resources/${id}`, { method: 'DELETE' });
    
    if (response.ok) {
      loadTables();
      loadStats();
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to delete table');
    }
  } catch (error) {
    console.error('Error deleting table:', error);
    alert('Failed to delete table');
  }
}

// Settings
async function loadSettings() {
  try {
    const response = await apiRequest('/api/admin/settings');
    const settings = await response.json();
    
    const form = document.getElementById('settingsForm');
    form.business_name.value = settings.business_name || '';
    form.phone.value = settings.phone || '';
    form.location.value = settings.location || '';
    form.opening_time.value = settings.opening_time || '';
    form.closing_time.value = settings.closing_time || '';
    form.mtn_merchant_code.value = settings.mtn_merchant_code || '';
    form.orange_merchant_code.value = settings.orange_merchant_code || '';
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  try {
    const response = await apiRequest('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({
        business_name: formData.get('business_name'),
        phone: formData.get('phone'),
        location: formData.get('location'),
        opening_time: formData.get('opening_time'),
        closing_time: formData.get('closing_time'),
        opening_days: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
        mtn_merchant_code: formData.get('mtn_merchant_code'),
        orange_merchant_code: formData.get('orange_merchant_code')
      })
    });
    
    if (response.ok) {
      alert('Settings saved successfully!');
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to save settings');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Failed to save settings');
  }
});

// Account
document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  const newPassword = formData.get('new_password');
  const confirmPassword = formData.get('confirm_password');
  
  if (newPassword !== confirmPassword) {
    alert('New passwords do not match');
    return;
  }
  
  try {
    const response = await apiRequest('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: formData.get('current_password'),
        new_password: newPassword
      })
    });
    
    if (response.ok) {
      alert('Password changed successfully!');
      e.target.reset();
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to change password');
    }
  } catch (error) {
    console.error('Error changing password:', error);
    alert('Failed to change password');
  }
});

// Modal Helper
function showModal(title, content) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'dynamicModal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
    </div>
  `;
  
  document.getElementById('modalContainer').innerHTML = '';
  document.getElementById('modalContainer').appendChild(modal);
}

function closeModal() {
  const modal = document.getElementById('dynamicModal');
  if (modal) modal.remove();
}

// Close modal on outside click
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    closeModal();
  }
});
