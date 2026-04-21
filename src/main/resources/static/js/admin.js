/**
 * CineVault - Admin Panel
 * /static/js/admin.js
 *
 * Handles: stats dashboard, movies CRUD, users CRUD, reviews moderation
 * All actions map to Spring Boot REST endpoints.
 */

const AdminPage = (() => {

  // ---- Mock data ----
  const MOCK_MOVIES = [
    { id:1, title:'Dune: Part Two', genre:'Sci-Fi', year:2024, rating:8.5, emoji:'🏜️', director:'Denis Villeneuve', duration:'2h 46m', description:'Paul Atreides unites with Chani and the Fremen while seeking revenge.' },
    { id:2, title:'Oppenheimer',    genre:'Drama',  year:2023, rating:8.9, emoji:'💥', director:'Christopher Nolan', duration:'3h 0m',  description:'The story of J. Robert Oppenheimer and the atomic bomb.' },
    { id:3, title:'The Batman',     genre:'Action', year:2022, rating:7.8, emoji:'🦇', director:'Matt Reeves',  duration:'2h 56m', description:'When the Riddler targets Gotham\'s elite.' },
    { id:4, title:'Poor Things',    genre:'Drama',  year:2023, rating:7.9, emoji:'⚗️', director:'Yorgos Lanthimos', duration:'2h 21m', description:'The fantastical evolution of Bella Baxter.' },
    { id:5, title:'Hereditary',     genre:'Horror', year:2018, rating:7.3, emoji:'👁️', director:'Ari Aster', duration:'2h 7m', description:'A grieving family discovers dark secrets.' },
  ];

  const MOCK_USERS = [
    { id:1, username:'john_doe',   email:'john@example.com',   role:'USER',  status:'active',   joinedAt:'2024-01-15', favouriteCount:12 },
    { id:2, username:'sarah_chen', email:'sarah@example.com',  role:'ADMIN', status:'active',   joinedAt:'2023-11-02', favouriteCount:34 },
    { id:3, username:'mike_j',     email:'mike@example.com',   role:'USER',  status:'active',   joinedAt:'2024-03-22', favouriteCount:7  },
    { id:4, username:'emma_w',     email:'emma@example.com',   role:'USER',  status:'inactive', joinedAt:'2023-08-18', favouriteCount:21 },
    { id:5, username:'carlos_r',   email:'carlos@example.com', role:'USER',  status:'active',   joinedAt:'2024-05-10', favouriteCount:3  },
  ];

  const MOCK_REVIEWS = [
    { id:1, username:'john_doe',   movieTitle:'Oppenheimer',  rating:5, text:'Masterpiece of cinema.',           createdAt:'2024-07-14', status:'approved' },
    { id:2, username:'sarah_chen', movieTitle:'Dune: Part Two', rating:5, text:'Visually stunning epic.',        createdAt:'2024-07-10', status:'approved' },
    { id:3, username:'mike_j',     movieTitle:'The Batman',   rating:4, text:'Great atmosphere and performances.', createdAt:'2024-07-08', status:'approved' },
    { id:4, username:'emma_w',     movieTitle:'Hereditary',   rating:3, text:'Scary but predictable in places.', createdAt:'2024-07-05', status:'pending'  },
    { id:5, username:'carlos_r',   movieTitle:'Poor Things',  rating:4, text:'Wonderfully bizarre.',             createdAt:'2024-07-01', status:'approved' },
  ];

  const ACTIVITY = [
    { icon:'🎬', text:'New movie <strong>Alien: Romulus</strong> added by admin', time:'2 min ago'  },
    { icon:'👤', text:'User <strong>Emma Wilson</strong> registered',             time:'15 min ago' },
    { icon:'⭐', text:'New review on <strong>Oppenheimer</strong> (★★★★★)',       time:'1 hr ago'   },
    { icon:'❤️', text:'<strong>Carlos R.</strong> added 3 favourites',            time:'2 hrs ago'  },
    { icon:'🗑️', text:'Review deleted (policy violation)',                        time:'5 hrs ago'  },
  ];

  // ---- Init ----
  async function init() {
    // ---- AUTHORIZATION CHECK ----
    const user = State.get('currentUser');
    if (!user) {
      Toast.show('🔐 You must be logged in to access admin panel');
      Router.navigate('browse');
      return;
    }
    if (user.role !== 'ADMIN') {
      Toast.show('🚫 Admin access denied');
      Router.navigate('browse');
      return;
    }
    
    _bindSidebarNav();
    _showTab(State.get('adminTab') || 'overview');
  }

  // ---- Sidebar navigation ----
  function _bindSidebarNav() {
    document.querySelectorAll('.admin-nav-item').forEach(btn => {
      btn.addEventListener('click', () => _showTab(btn.dataset.tab));
    });
  }

  function _showTab(tab) {
    State.set('adminTab', tab);
    document.querySelectorAll('.admin-tab-page').forEach(p => p.style.display = 'none');
    const el = document.getElementById(`admin-tab-${tab}`);
    if (el) el.style.display = 'block';
    document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));

    if (tab === 'overview') _renderOverview();
    if (tab === 'movies')   _renderMoviesTable();
    if (tab === 'users')    _renderUsersTable();
    if (tab === 'reviews')  _renderReviewsTable();
  }

  // ======================================================
  // OVERVIEW
  // ======================================================
  async function _renderOverview() {
    // GET /api/admin/stats
    // const stats = await API.admin.getStats();
    const stats = { totalMovies: 248, totalUsers: 1842, totalReviews: 9214, avgRating: 7.8 };
    document.getElementById('stat-movies').textContent  = stats.totalMovies.toLocaleString();
    document.getElementById('stat-users').textContent   = stats.totalUsers.toLocaleString();
    document.getElementById('stat-reviews').textContent = stats.totalReviews.toLocaleString();
    document.getElementById('stat-rating').textContent  = stats.avgRating.toFixed(1);

    // Activity feed
    document.getElementById('activity-feed').innerHTML = ACTIVITY.map(a => `
      <div class="activity-item">
        <span class="activity-item__icon">${a.icon}</span>
        <span class="activity-item__text">${a.text}</span>
        <span class="activity-item__time">${a.time}</span>
      </div>`).join('');
  }

  // ======================================================
  // MOVIES TABLE
  // ======================================================
  async function _renderMoviesTable() {
    // GET /api/movies
    // const data = await API.movies.getAll();
    // const movies = data?.content || data || [];
    const movies = MOCK_MOVIES;

    document.getElementById('movies-table-body').innerHTML = movies.map(m => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.6rem;">${m.emoji || '🎬'}</span>
            <div>
              <div style="font-weight:600;">${m.title}</div>
              <div style="font-size:12px;color:var(--text3);">Dir. ${m.director}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-genre">${m.genre}</span></td>
        <td>${m.year}</td>
        <td><span style="color:var(--accent);font-weight:700;">★ ${m.rating}</span></td>
        <td>${m.duration}</td>
        <td>
          <div class="table-actions">
            <button class="btn-icon" onclick="AdminPage.editMovieModal(${m.id})">✏️ Edit</button>
            <button class="btn-icon del" onclick="AdminPage.deleteMovieModal(${m.id}, '${m.title.replace(/'/g,"\\'")}')">🗑️ Delete</button>
          </div>
        </td>
      </tr>`).join('');
  }

  function addMovieModal() {
    Modal.open(`
      <h2 class="modal__title">Add New Movie</h2>
      <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="m-title" placeholder="Movie title"/></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Genre</label>
          <select class="form-input" id="m-genre">
            <option>Action</option><option>Drama</option><option>Sci-Fi</option>
            <option>Horror</option><option>Comedy</option><option>Thriller</option><option>Animation</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Year</label><input class="form-input" id="m-year" type="number" placeholder="2024"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Rating (0–10)</label><input class="form-input" id="m-rating" type="number" step="0.1" min="0" max="10" placeholder="8.5"/></div>
        <div class="form-group"><label class="form-label">Duration</label><input class="form-input" id="m-duration" placeholder="2h 30m"/></div>
      </div>
      <div class="form-group"><label class="form-label">Director</label><input class="form-input" id="m-director" placeholder="Director name"/></div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-input" id="m-desc" rows="3" placeholder="Movie synopsis..."></textarea></div>
      <div class="form-group"><label class="form-label">Poster URL</label><input class="form-input" id="m-poster" placeholder="https://..."/><p class="form-hint">Spring Boot: store via POST /api/movies then serve from /api/movies/{id}/poster</p></div>
      <div class="modal__actions">
        <button class="btn btn-ghost" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="AdminPage._submitNewMovie()">Create Movie</button>
      </div>`);
  }

  async function _submitNewMovie() {
    const body = {
      title:       document.getElementById('m-title').value.trim(),
      genre:       document.getElementById('m-genre').value,
      year:        parseInt(document.getElementById('m-year').value),
      rating:      parseFloat(document.getElementById('m-rating').value),
      duration:    document.getElementById('m-duration').value.trim(),
      director:    document.getElementById('m-director').value.trim(),
      description: document.getElementById('m-desc').value.trim(),
      posterUrl:   document.getElementById('m-poster').value.trim(),
    };
    if (!body.title) { Toast.show('⚠️ Title is required'); return; }
    // await API.movies.create(body);
    Toast.show('✅ Movie created — POST /api/movies');
    Modal.close();
    _renderMoviesTable();
  }

  function editMovieModal(movieId) {
    const m = MOCK_MOVIES.find(x => x.id === movieId);
    if (!m) return;
    Modal.open(`
      <h2 class="modal__title">Edit Movie</h2>
      <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="m-title" value="${m.title}"/></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Genre</label>
          <select class="form-input" id="m-genre">
            ${['Action','Drama','Sci-Fi','Horror','Comedy','Thriller','Animation'].map(g => `<option ${g===m.genre?'selected':''}>${g}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Year</label><input class="form-input" id="m-year" type="number" value="${m.year}"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Rating</label><input class="form-input" id="m-rating" type="number" step="0.1" value="${m.rating}"/></div>
        <div class="form-group"><label class="form-label">Duration</label><input class="form-input" id="m-duration" value="${m.duration}"/></div>
      </div>
      <div class="form-group"><label class="form-label">Director</label><input class="form-input" id="m-director" value="${m.director}"/></div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-input" id="m-desc" rows="3">${m.description}</textarea></div>
      <div class="modal__actions">
        <button class="btn btn-ghost" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="AdminPage._submitEditMovie(${movieId})">Save Changes</button>
      </div>`);
  }

  async function _submitEditMovie(movieId) {
    const body = {
      title:       document.getElementById('m-title').value.trim(),
      genre:       document.getElementById('m-genre').value,
      year:        parseInt(document.getElementById('m-year').value),
      rating:      parseFloat(document.getElementById('m-rating').value),
      duration:    document.getElementById('m-duration').value.trim(),
      director:    document.getElementById('m-director').value.trim(),
      description: document.getElementById('m-desc').value.trim(),
    };
    // await API.movies.update(movieId, body);
    Toast.show(`✅ Movie updated — PUT /api/movies/${movieId}`);
    Modal.close();
    _renderMoviesTable();
  }

  function deleteMovieModal(movieId, title) {
    Modal.open(`
      <h2 class="modal__title" style="color:var(--red);">Delete Movie</h2>
      <p style="color:var(--text2);font-size:14px;line-height:1.7;margin-bottom:1.5rem;">
        Are you sure you want to delete <strong style="color:var(--text);">${title}</strong>?
        This will also remove all associated reviews and user favourites. This action cannot be undone.
      </p>
      <p class="form-hint" style="margin-bottom:1.5rem;">API: DELETE /api/movies/${movieId}</p>
      <div class="modal__actions">
        <button class="btn btn-ghost" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-danger" onclick="AdminPage._confirmDeleteMovie(${movieId})">Delete Movie</button>
      </div>`);
  }

  async function _confirmDeleteMovie(movieId) {
    // await API.movies.delete(movieId);
    Toast.show(`🗑️ Movie deleted — DELETE /api/movies/${movieId}`);
    Modal.close();
    _renderMoviesTable();
  }

  // ======================================================
  // USERS TABLE
  // ======================================================
  async function _renderUsersTable() {
    // GET /api/users
    // const data = await API.users.getAll();
    // const users = data?.content || data || [];
    const users = MOCK_USERS;

    document.getElementById('users-table-body').innerHTML = users.map(u => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:34px;height:34px;border-radius:50%;background:var(--surface3);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--accent);flex-shrink:0;">
              ${u.username.slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style="font-weight:600;">${u.username}</div>
              <div style="font-size:12px;color:var(--text3);">${u.email}</div>
            </div>
          </div>
        </td>
        <td><span class="badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-active'}">${u.role}</span></td>
        <td><span class="badge ${u.status === 'active' ? 'badge-active' : 'badge-inactive'}">${u.status}</span></td>
        <td style="color:var(--text2);font-size:13px;">${Helpers.formatDate(u.joinedAt)}</td>
        <td style="color:var(--text2);">❤️ ${u.favouriteCount}</td>
        <td>
          <div class="table-actions">
            <button class="btn-icon" onclick="AdminPage.editUserModal(${u.id})">✏️ Edit</button>
            <button class="btn-icon del" onclick="AdminPage.deleteUserModal(${u.id}, '${u.username}')">🗑️ Delete</button>
          </div>
        </td>
      </tr>`).join('');
  }

  function addUserModal() {
    Modal.open(`
      <h2 class="modal__title">Add New User</h2>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Username</label><input class="form-input" id="u-username" placeholder="johndoe"/></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="u-email" type="email" placeholder="user@example.com"/></div>
      </div>
      <div class="form-group"><label class="form-label">Password</label><input class="form-input" id="u-password" type="password" placeholder="••••••••"/></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Role</label>
          <select class="form-input" id="u-role"><option>USER</option><option>ADMIN</option></select>
        </div>
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-input" id="u-status"><option>active</option><option>inactive</option></select>
        </div>
      </div>
      <div class="modal__actions">
        <button class="btn btn-ghost" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="AdminPage._submitNewUser()">Create User</button>
      </div>`);
  }

  async function _submitNewUser() {
    const body = {
      username: document.getElementById('u-username').value.trim(),
      email:    document.getElementById('u-email').value.trim(),
      password: document.getElementById('u-password').value,
      role:     document.getElementById('u-role').value,
      status:   document.getElementById('u-status').value,
    };
    if (!body.username || !body.email) { Toast.show('⚠️ Username and email are required'); return; }
    // await API.users.create(body);
    Toast.show('✅ User created — POST /api/users');
    Modal.close();
    _renderUsersTable();
  }

  function editUserModal(userId) {
    const u = MOCK_USERS.find(x => x.id === userId);
    if (!u) return;
    Modal.open(`
      <h2 class="modal__title">Edit User</h2>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Username</label><input class="form-input" id="u-username" value="${u.username}"/></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="u-email" value="${u.email}"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Role</label>
          <select class="form-input" id="u-role">
            <option ${u.role==='USER'?'selected':''}>USER</option>
            <option ${u.role==='ADMIN'?'selected':''}>ADMIN</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-input" id="u-status">
            <option ${u.status==='active'?'selected':''}>active</option>
            <option ${u.status==='inactive'?'selected':''}>inactive</option>
          </select>
        </div>
      </div>
      <div class="modal__actions">
        <button class="btn btn-ghost" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="AdminPage._submitEditUser(${userId})">Save Changes</button>
      </div>`);
  }

  async function _submitEditUser(userId) {
    const body = {
      username: document.getElementById('u-username').value.trim(),
      email:    document.getElementById('u-email').value.trim(),
      role:     document.getElementById('u-role').value,
      status:   document.getElementById('u-status').value,
    };
    // await API.users.update(userId, body);
    Toast.show(`✅ User updated — PUT /api/users/${userId}`);
    Modal.close();
    _renderUsersTable();
  }

  function deleteUserModal(userId, username) {
    Modal.open(`
      <h2 class="modal__title" style="color:var(--red);">Delete User</h2>
      <p style="color:var(--text2);font-size:14px;line-height:1.7;margin-bottom:1.5rem;">
        Are you sure you want to delete user <strong style="color:var(--text);">${username}</strong>?
        All their reviews and favourites will also be removed.
      </p>
      <p class="form-hint" style="margin-bottom:1.5rem;">API: DELETE /api/users/${userId}</p>
      <div class="modal__actions">
        <button class="btn btn-ghost" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-danger" onclick="AdminPage._confirmDeleteUser(${userId})">Delete User</button>
      </div>`);
  }

  async function _confirmDeleteUser(userId) {
    // await API.users.delete(userId);
    Toast.show(`🗑️ User deleted — DELETE /api/users/${userId}`);
    Modal.close();
    _renderUsersTable();
  }

  // ======================================================
  // REVIEWS TABLE
  // ======================================================
  async function _renderReviewsTable() {
    // GET /api/reviews
    // const data = await API.reviews.getAll();
    // const reviews = data?.content || data || [];
    const reviews = MOCK_REVIEWS;

    document.getElementById('reviews-table-body').innerHTML = reviews.map(r => `
      <tr>
        <td style="font-weight:600;">${r.username}</td>
        <td style="color:var(--text2);">${r.movieTitle}</td>
        <td style="color:var(--accent);font-weight:700;">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</td>
        <td style="max-width:220px;color:var(--text2);font-size:13px;">${Helpers.truncate(r.text, 60)}</td>
        <td style="color:var(--text3);font-size:12px;">${Helpers.formatDate(r.createdAt)}</td>
        <td><span class="badge ${r.status==='approved'?'badge-active':r.status==='pending'?'badge-pending':'badge-inactive'}">${r.status}</span></td>
        <td>
          <div class="table-actions">
            ${r.status === 'pending' ? `<button class="btn-icon" onclick="AdminPage.approveReview(${r.id})">✅ Approve</button>` : ''}
            <button class="btn-icon del" onclick="AdminPage.deleteReviewModal(${r.id})">🗑️</button>
          </div>
        </td>
      </tr>`).join('');
  }

  async function approveReview(reviewId) {
    // await API.reviews.updateStatus(reviewId, 'approved');
    Toast.show(`✅ Review approved — PATCH /api/reviews/${reviewId}/status`);
    _renderReviewsTable();
  }

  function deleteReviewModal(reviewId) {
    Modal.open(`
      <h2 class="modal__title" style="color:var(--red);">Delete Review</h2>
      <p style="color:var(--text2);font-size:14px;line-height:1.7;margin-bottom:1.5rem;">
        Are you sure you want to permanently delete this review?
      </p>
      <p class="form-hint" style="margin-bottom:1.5rem;">API: DELETE /api/reviews/${reviewId}</p>
      <div class="modal__actions">
        <button class="btn btn-ghost" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-danger" onclick="AdminPage._confirmDeleteReview(${reviewId})">Delete Review</button>
      </div>`);
  }

  async function _confirmDeleteReview(reviewId) {
    // await API.reviews.delete(reviewId);
    Toast.show(`🗑️ Review deleted — DELETE /api/reviews/${reviewId}`);
    Modal.close();
    _renderReviewsTable();
  }

  Router.register('admin', init);

  return {
    init,
    addMovieModal, editMovieModal, deleteMovieModal,
    _submitNewMovie, _submitEditMovie, _confirmDeleteMovie,
    addUserModal, editUserModal, deleteUserModal,
    _submitNewUser, _submitEditUser, _confirmDeleteUser,
    approveReview, deleteReviewModal, _confirmDeleteReview,
  };
})();
