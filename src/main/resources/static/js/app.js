/**
 * CineVault - App State & Shared Utilities
 * /static/js/app.js
 *
 * Central state store, router, toast, and shared helpers.
 * Loaded before all page-specific scripts.
 */

// ======================================================
// GLOBAL STATE
// ======================================================
const State = (() => {
  let _state = {
    currentUser: null,       // { id, username, email, role }
    currentPage: 'browse',   // 'browse' | 'favourites' | 'admin'
    adminTab:    'overview', // 'overview' | 'movies' | 'users' | 'reviews'
    favourites:  new Set(),  // Set of movieIds
    movies:      [],         // cached movie list
    filterGenre: 'All',
    searchQuery: '',
    detailMovieId: null,
  };

  const listeners = {};

  function get(key)        { return _state[key]; }
  function set(key, val)   { _state[key] = val; _emit(key, val); }
  function on(key, fn)     { (listeners[key] = listeners[key] || []).push(fn); }
  function _emit(key, val) { (listeners[key] || []).forEach(fn => fn(val)); }

  return { get, set, on };
})();


// ======================================================
// ROUTER  — simple hash-based page switcher
// ======================================================
const Router = (() => {
  const routes = {};

  function register(name, initFn) { routes[name] = initFn; }

  function navigate(page, params = {}) {
    // ---- AUTHENTICATION CHECK FOR ADMIN ----
    if (page === 'admin') {
      const user = State.get('currentUser');
      if (!user) {
        Toast.show('🔐 Please log in to access admin panel');
        navigate('browse');
        return;
      }
      if (user.role !== 'ADMIN') {
        Toast.show('🚫 Admin access only');
        navigate('browse');
        return;
      }
    }

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show target
    const el = document.getElementById(`page-${page}`);
    if (el) el.classList.add('active');

    // Update nav
    document.querySelectorAll('.navbar__nav-btn').forEach(b => b.classList.remove('active'));
    const navBtn = document.querySelector(`[data-page="${page}"]`);
    if (navBtn) navBtn.classList.add('active');

    // Close detail panel
    DetailPanel.close();

    // Run init for that page
    if (routes[page]) routes[page](params);

    State.set('currentPage', page);
    window.location.hash = `#${page}`;
  }

  function init() {
    // Read hash on load
    let hash = window.location.hash.replace('#', '') || 'browse';
    
    // Check if user is trying to access admin without authorization
    if (hash === 'admin') {
      const user = State.get('currentUser');
      if (!user || user.role !== 'ADMIN') {
        hash = 'browse';
        window.location.hash = '#browse';
      }
    }
    
    navigate(hash);
    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '') || 'browse';
      navigate(h);
    });
  }

  return { register, navigate, init };
})();


// ======================================================
// TOAST
// ======================================================
const Toast = (() => {
  let timer;
  function show(msg, duration = 3000) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove('show'), duration);
  }
  return { show };
})();


// ======================================================
// MODAL
// ======================================================
const Modal = (() => {
  function open(html) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = html;
    overlay.classList.add('open');
  }

  function close() {
    document.getElementById('modal-overlay').classList.remove('open');
  }

  function init() {
    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target === document.getElementById('modal-overlay')) close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  return { open, close, init };
})();


// ======================================================
// DETAIL PANEL
// ======================================================
const DetailPanel = (() => {
  function open(html) {
    document.getElementById('detail-panel-body').innerHTML = html;
    document.getElementById('detail-panel').classList.add('open');
  }
  function close() {
    document.getElementById('detail-panel').classList.remove('open');
  }
  function init() {
    document.getElementById('detail-panel-close').addEventListener('click', close);
  }
  return { open, close, init };
})();


// ======================================================
// HELPERS
// ======================================================
const Helpers = (() => {

  function starsHtml(rating, max = 5) {
    let html = '';
    for (let i = 1; i <= max; i++) {
      html += `<span class="stars-input__star${i <= rating ? ' selected' : ''}" data-val="${i}">★</span>`;
    }
    return html;
  }

  function starDisplay(rating) {
    const full  = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }

  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function truncate(str, n) {
    return str && str.length > n ? str.slice(0, n) + '…' : str;
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  function movieCardHtml(movie, isFav = false) {
    return `
      <div class="movie-card" data-id="${movie.id}" onclick="BrowsePage.openDetail(${movie.id})">
        <div class="movie-card__poster">
          ${movie.posterUrl
            ? `<img src="${movie.posterUrl}" alt="${movie.title}" loading="lazy"/>`
            : `<span>${movie.emoji || '🎬'}</span>`}
          <button
            class="movie-card__fav-btn ${isFav ? 'active' : ''}"
            onclick="FavouritesManager.toggle(event, ${movie.id})"
            title="${isFav ? 'Remove from favourites' : 'Add to favourites'}"
          >${isFav ? '❤️' : '🤍'}</button>
        </div>
        <div class="movie-card__info">
          <div class="movie-card__title">${movie.title}</div>
          <div class="movie-card__meta">
            <span class="movie-card__rating">★ ${movie.rating}</span>
            <span>${movie.year}</span>
            <span class="badge badge-genre">${movie.genre}</span>
          </div>
        </div>
      </div>`;
  }

  function renderMovieGrid(containerId, movieList) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!movieList || !movieList.length) {
      el.innerHTML = '';
      return;
    }
    const favs = State.get('favourites');
    el.innerHTML = movieList.map(m => movieCardHtml(m, favs.has(m.id))).join('');
  }

  return { starsHtml, starDisplay, formatDate, truncate, debounce, movieCardHtml, renderMovieGrid };
})();


// ======================================================
// FAVOURITES MANAGER
// ======================================================
const FavouritesManager = (() => {

  async function toggle(event, movieId) {
    event.stopPropagation();
    const favs = State.get('favourites');
    if (favs.has(movieId)) {
      await API.favourites.remove(movieId);
      favs.delete(movieId);
      Toast.show('💔 Removed from favourites');
    } else {
      await API.favourites.add(movieId);
      favs.add(movieId);
      Toast.show('❤️ Added to favourites');
    }
    State.set('favourites', favs);
    _refreshAllFavButtons(movieId);
  }

  function _refreshAllFavButtons(movieId) {
    const favs = State.get('favourites');
    document.querySelectorAll(`.movie-card[data-id="${movieId}"] .movie-card__fav-btn`).forEach(btn => {
      const isFav = favs.has(movieId);
      btn.classList.toggle('active', isFav);
      btn.textContent = isFav ? '❤️' : '🤍';
    });
  }

  async function loadFavourites() {
    const data = await API.favourites.getAll();
    if (data) {
      const ids = new Set((data.content || data).map(m => m.id));
      State.set('favourites', ids);
    }
  }

  return { toggle, loadFavourites };
})();


// ======================================================
// BOOTSTRAP
// ======================================================
document.addEventListener('DOMContentLoaded', async () => {
  Modal.init();
  DetailPanel.init();

  // Wire nav buttons
  document.querySelectorAll('.navbar__nav-btn').forEach(btn => {
    btn.addEventListener('click', () => Router.navigate(btn.dataset.page));
  });

  // ---- USER DROPDOWN & LOGOUT ----
  const navbarUser = document.querySelector('.navbar__user');
  const navbarDropdown = document.getElementById('navbar-dropdown');
  const logoutBtn = document.getElementById('logout-btn');
  
  // Toggle dropdown on user profile click
  if (navbarUser) {
    navbarUser.addEventListener('click', (e) => {
      if (e.target === logoutBtn || logoutBtn.contains(e.target)) return; // Don't toggle if clicking logout
      if (navbarDropdown) {
        navbarDropdown.style.display = navbarDropdown.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

  // Logout button click
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      // Call logout API
      await API.auth.logout();
      
      // Clear token and state
      API.clearToken();
      State.set('currentUser', null);
      State.set('favourites', new Set());
      
      // Hide dropdown
      if (navbarDropdown) navbarDropdown.style.display = 'none';
      
      // Reset navbar
      document.getElementById('navbar-username').textContent = 'Guest';
      
      // Hide admin button
      const adminBtn = document.querySelector('[data-page="admin"]');
      if (adminBtn) {
        adminBtn.style.display = 'none';
        adminBtn.disabled = true;
      }
      
      Toast.show('👋 Logged out successfully');
      Router.navigate('browse');
    });
  }

  // Try loading current user (if logged in)
  const token = API.getToken();
  if (token) {
    const user = await API.auth.me();
    if (user) {
      State.set('currentUser', user);
      document.getElementById('navbar-username').textContent = user.username;
      await FavouritesManager.loadFavourites();
      
      // ---- ADMIN BUTTON VISIBILITY ----
      const adminBtn = document.querySelector('[data-page="admin"]');
      if (adminBtn) {
        if (user.role === 'ADMIN') {
          adminBtn.style.display = 'inline-block';
          adminBtn.style.opacity = '1';
          adminBtn.disabled = false;
        } else {
          adminBtn.style.display = 'none';
          adminBtn.disabled = true;
        }
      }
    }
  } else {
    // No token - hide admin button
    const adminBtn = document.querySelector('[data-page="admin"]');
    if (adminBtn) {
      adminBtn.style.display = 'none';
      adminBtn.disabled = true;
    }
    // Hide dropdown if not logged in
    if (navbarDropdown) {
      navbarDropdown.style.display = 'none';
    }
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (navbarDropdown && !navbarUser.contains(e.target)) {
      navbarDropdown.style.display = 'none';
    }
  });

  // Init router (reads hash, calls page init)
  Router.init();
});
