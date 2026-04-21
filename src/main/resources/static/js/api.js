/**
 * CineVault - API Service Layer
 * Spring Boot Base URL: /static/js/api.js
 *
 * All HTTP calls to the Spring Boot REST backend are centralised here.
 * Change BASE_URL to match your Spring Boot server host/port.
 */

const API = (() => {

  const BASE_URL = 'http://localhost:8080/api';

  // ---- Auth token helper ---- //
  const getToken = () => localStorage.getItem('cinevault_token');
  const setToken = (t) => localStorage.setItem('cinevault_token', t);
  const clearToken = () => localStorage.removeItem('cinevault_token');

  // ---- Base fetch wrapper ---- //
  async function request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    try {
      const res = await fetch(`${BASE_URL}${path}`, opts);
      if (res.status === 204) return null;          // No content
      if (res.status === 401) {
        clearToken();
        Toast.show('⚠️ Session expired — please log in again');
        return null;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      return data;
    } catch (err) {
      console.error(`[API] ${method} ${path}:`, err.message);
      Toast.show(`❌ ${err.message}`);
      return null;
    }
  }

  const get    = (path)         => request('GET',    path);
  const post   = (path, body)   => request('POST',   path, body);
  const put    = (path, body)   => request('PUT',    path, body);
  const del    = (path)         => request('DELETE', path);
  const patch  = (path, body)   => request('PATCH',  path, body);

  // ======================================================
  // AUTH  —  POST /api/auth/...
  // ======================================================
  const auth = {
    /**
     * POST /api/auth/login
     * body: { username, password }
     * returns: { token, user: { id, username, email, role } }
     */
    login:    (credentials) => post('/auth/login', credentials),

    /**
     * POST /api/auth/register
     * body: { username, email, password }
     */
    register: (data)        => post('/auth/register', data),

    /**
     * GET /api/auth/me
     * returns: { id, username, email, role, favouriteCount }
     */
    me:       ()            => get('/auth/me'),

    /** POST /api/auth/logout */
    logout:   ()            => post('/auth/logout'),
  };

  // ======================================================
  // MOVIES  —  /api/movies
  // ======================================================
  const movies = {
    /**
     * GET /api/movies?page=0&size=20&sort=rating,desc
     * Optional query params: title, genre, year, minRating, maxRating
     */
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return get(`/movies${qs ? '?' + qs : ''}`);
    },

    /**
     * GET /api/movies/{id}
     */
    getById: (id) => get(`/movies/${id}`),

    /**
     * GET /api/movies/search?title=...
     */
    search: (title) => get(`/movies/search?title=${encodeURIComponent(title)}`),

    /**
     * GET /api/movies/genres
     * returns: ["Action","Drama","Sci-Fi",...]
     */
    getGenres: () => get('/movies/genres'),

    /**
     * POST /api/movies  — ADMIN ONLY
     * body: { title, genre, year, rating, duration, director, description, posterUrl }
     */
    create: (data) => post('/movies', data),

    /**
     * PUT /api/movies/{id}  — ADMIN ONLY
     */
    update: (id, data) => put(`/movies/${id}`, data),

    /**
     * DELETE /api/movies/{id}  — ADMIN ONLY
     */
    delete: (id) => del(`/movies/${id}`),
  };

  // ======================================================
  // FAVOURITES  —  /api/favourites
  // ======================================================
  const favourites = {
    /**
     * GET /api/favourites
     * returns: [Movie, ...]
     */
    getAll: () => get('/favourites'),

    /**
     * POST /api/favourites/{movieId}
     */
    add: (movieId) => post(`/favourites/${movieId}`),

    /**
     * DELETE /api/favourites/{movieId}
     */
    remove: (movieId) => del(`/favourites/${movieId}`),

    /**
     * GET /api/favourites/{movieId}/check
     * returns: { isFavourite: true|false }
     */
    check: (movieId) => get(`/favourites/${movieId}/check`),
  };

  // ======================================================
  // REVIEWS  —  /api/reviews
  // ======================================================
  const reviews = {
    /**
     * GET /api/reviews/movie/{movieId}
     * returns: [{ id, user, rating, text, date, status }, ...]
     */
    getByMovie: (movieId) => get(`/reviews/movie/${movieId}`),

    /**
     * GET /api/reviews/user/{userId}  — ADMIN or own user
     */
    getByUser: (userId) => get(`/reviews/user/${userId}`),

    /**
     * GET /api/reviews  — ADMIN ONLY, all reviews
     */
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return get(`/reviews${qs ? '?' + qs : ''}`);
    },

    /**
     * POST /api/reviews/{movieId}
     * body: { rating: 1-5, text }
     */
    create: (movieId, data) => post(`/reviews/${movieId}`, data),

    /**
     * PUT /api/reviews/{reviewId}
     * body: { rating, text }
     */
    update: (reviewId, data) => put(`/reviews/${reviewId}`, data),

    /**
     * DELETE /api/reviews/{reviewId}  — ADMIN or review author
     */
    delete: (reviewId) => del(`/reviews/${reviewId}`),

    /**
     * PATCH /api/reviews/{reviewId}/status  — ADMIN ONLY
     * body: { status: "approved"|"rejected" }
     */
    updateStatus: (reviewId, status) => patch(`/reviews/${reviewId}/status`, { status }),
  };

  // ======================================================
  // USERS  —  /api/users  (ADMIN ONLY)
  // ======================================================
  const users = {
    /**
     * GET /api/users?page=0&size=20
     */
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return get(`/users${qs ? '?' + qs : ''}`);
    },

    /**
     * GET /api/users/{id}
     */
    getById: (id) => get(`/users/${id}`),

    /**
     * POST /api/users
     * body: { username, email, password, role }
     */
    create: (data) => post('/users', data),

    /**
     * PUT /api/users/{id}
     * body: { username, email, role, status }
     */
    update: (id, data) => put(`/users/${id}`, data),

    /**
     * DELETE /api/users/{id}
     */
    delete: (id) => del(`/users/${id}`),

    /**
     * PATCH /api/users/{id}/status
     * body: { status: "active"|"inactive" }
     */
    updateStatus: (id, status) => patch(`/users/${id}/status`, { status }),
  };

  // ======================================================
  // ADMIN STATS  —  /api/admin
  // ======================================================
  const admin = {
    /**
     * GET /api/admin/stats
     * returns: { totalMovies, totalUsers, totalReviews, avgRating }
     */
    getStats: () => get('/admin/stats'),

    /**
     * GET /api/admin/activity
     * returns: [{ type, message, timestamp }, ...]
     */
    getActivity: () => get('/admin/activity'),
  };

  // Public API
  return { BASE_URL, getToken, setToken, clearToken, auth, movies, favourites, reviews, users, admin };

})();
