/**
 * CineVault - Browse Page
 * /static/js/browse.js
 *
 * Handles: movie grid, search, genre filter, detail slide panel, reviews
 */

const BrowsePage = (() => {

  // ---- Mock data (replace with real API calls) ----
  const MOCK_MOVIES = [
    { id:1,  title:'Dune: Part Two',     genre:'Sci-Fi',    year:2024, rating:8.5, emoji:'🏜️', director:'Denis Villeneuve', duration:'2h 46m', description:'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.' },
    { id:2,  title:'Oppenheimer',         genre:'Drama',     year:2023, rating:8.9, emoji:'💥', director:'Christopher Nolan', duration:'3h 0m',  description:'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during WWII.' },
    { id:3,  title:'The Batman',          genre:'Action',    year:2022, rating:7.8, emoji:'🦇', director:'Matt Reeves',        duration:'2h 56m', description:'When the Riddler targets Gotham\'s elite, Batman must unmask the killer and expose corruption while fighting his own dark nature.' },
    { id:4,  title:'Hereditary',          genre:'Horror',    year:2018, rating:7.3, emoji:'👁️', director:'Ari Aster',          duration:'2h 7m',  description:'A grieving family discovers dark secrets about their ancestry and becomes haunted by a sinister force.' },
    { id:5,  title:'Everything Everywhere All at Once', genre:'Sci-Fi', year:2022, rating:7.8, emoji:'🌀', director:'Daniel Kwan', duration:'2h 19m', description:'A multiverse-hopping laundromat owner discovers she must connect with parallel versions of herself to save the multiverse.' },
    { id:6,  title:'Spider-Man: No Way Home', genre:'Action', year:2021, rating:8.2, emoji:'🕷️', director:'Jon Watts',       duration:'2h 28m', description:'Peter Parker asks Doctor Strange to help the world forget he is Spider-Man, but the spell goes wrong.' },
    { id:7,  title:'Triangle of Sadness', genre:'Comedy',    year:2022, rating:7.3, emoji:'🛥️', director:'Ruben Östlund',    duration:'2h 29m', description:'A celebrity couple gets stuck on a luxury cruise with a crew of decidedly varied characters.' },
    { id:8,  title:'Poor Things',         genre:'Drama',     year:2023, rating:7.9, emoji:'⚗️', director:'Yorgos Lanthimos', duration:'2h 21m', description:'The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life.' },
    { id:9,  title:'M3GAN',               genre:'Horror',    year:2022, rating:6.3, emoji:'🤖', director:'Gerard Johnstone', duration:'1h 42m', description:'A lifelike doll becomes dangerously overprotective of the child she was designed to befriend.' },
    { id:10, title:'Bullet Train',        genre:'Thriller',  year:2022, rating:7.3, emoji:'🚄', director:'David Leitch',      duration:'2h 6m',  description:'Five assassins aboard a fast moving bullet train find out their missions have something in common.' },
    { id:11, title:'Turning Red',         genre:'Animation', year:2022, rating:7.0, emoji:'🐼', director:'Domee Shi',         duration:'1h 40m', description:'A 13-year-old girl discovers she turns into a giant red panda whenever she gets too excited.' },
    { id:12, title:'Tár',                 genre:'Drama',     year:2022, rating:7.5, emoji:'🎻', director:'Todd Field',        duration:'2h 38m', description:'Set in the international world of classical music, the film centers on Lydia Tár, a renowned conductor.' },
  ];

  const MOCK_REVIEWS = {
    1: [{ id:1, user:'Sarah Chen', rating:5, text:'A breathtaking visual epic. Villeneuve at his finest.', date:'2024-07-14' }],
    2: [{ id:2, user:'John Doe',   rating:5, text:'A masterpiece of modern cinema. Cillian Murphy is outstanding.', date:'2024-07-10' },
        { id:3, user:'Mike J.',    rating:4, text:'Long but worth every minute. The science scenes are riveting.', date:'2024-07-08' }],
    3: [{ id:4, user:'Emma W.',    rating:4, text:'Dark, atmospheric, and genuinely tense. Best Batman since Nolan.', date:'2024-07-01' }],
  };

  let allMovies = [];
  let selectedStars = 0;

  // ---- Init ----
  async function init() {
    _bindSearch();
    _bindFilters();

    // Load movies from Spring Boot: GET /api/movies
    // const data = await API.movies.getAll();
    // allMovies = data?.content || data || [];
    allMovies = MOCK_MOVIES; // using mock while backend not connected
    State.set('movies', allMovies);

    _renderGrid();
  }

  // ---- Render grid filtered by current state ----
  function _renderGrid() {
    const genre = State.get('filterGenre');
    const query = State.get('searchQuery').toLowerCase().trim();
    let list = allMovies;

    if (genre !== 'All')   list = list.filter(m => m.genre === genre);
    if (query)             list = list.filter(m =>
      m.title.toLowerCase().includes(query) ||
      m.director.toLowerCase().includes(query) ||
      m.genre.toLowerCase().includes(query)
    );

    const container = document.getElementById('browse-grid');
    if (!list.length) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <span class="empty-state__icon">🎞️</span>
          <p class="empty-state__title">No movies found</p>
          <p class="empty-state__sub">Try a different search or filter</p>
        </div>`;
      return;
    }
    Helpers.renderMovieGrid('browse-grid', list);
  }

  // ---- Search ----
  function _bindSearch() {
    const input    = document.getElementById('search-input');
    const dropdown = document.getElementById('search-dropdown');

    const handleInput = Helpers.debounce((val) => {
      State.set('searchQuery', val);
      _renderGrid();
      _renderDropdown(val, dropdown);
    }, 200);

    input.addEventListener('input', e => handleInput(e.target.value));
    input.addEventListener('keydown', e => { if (e.key === 'Escape') { input.value=''; State.set('searchQuery',''); _renderGrid(); dropdown.classList.remove('open'); } });
    document.addEventListener('click', e => { if (!e.target.closest('#search-bar')) dropdown.classList.remove('open'); });
  }

  function _renderDropdown(query, dropdown) {
    if (!query.trim()) { dropdown.classList.remove('open'); return; }
    const matches = allMovies.filter(m => m.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
    if (!matches.length) { dropdown.classList.remove('open'); return; }
    dropdown.innerHTML = matches.map(m => `
      <div class="search-result-item" onclick="BrowsePage.openDetail(${m.id}); document.getElementById('search-dropdown').classList.remove('open');">
        <span class="search-result-item__emoji">${m.emoji || '🎬'}</span>
        <div>
          <div class="search-result-item__title">${m.title}</div>
          <div class="search-result-item__sub">${m.genre} · ${m.year} · ★ ${m.rating}</div>
        </div>
      </div>`).join('');
    dropdown.classList.add('open');
  }

  // ---- Genre Filter Chips ----
  function _bindFilters() {
    document.querySelectorAll('#genre-chips .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#genre-chips .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        State.set('filterGenre', chip.dataset.genre);
        _renderGrid();
      });
    });
  }

  // ---- Detail Panel ----
  async function openDetail(movieId) {
    const movie = allMovies.find(m => m.id === movieId);
    if (!movie) return;

    // Fetch reviews: GET /api/reviews/movie/{movieId}
    // const reviewData = await API.reviews.getByMovie(movieId);
    const reviewList = MOCK_REVIEWS[movieId] || [];

    const isFav = State.get('favourites').has(movieId);

    DetailPanel.open(_detailHtml(movie, isFav, reviewList));
    selectedStars = 0;
    _bindStarInput();
    _bindReviewSubmit(movieId);
  }

  function _detailHtml(movie, isFav, reviewList) {
    return `
      <div class="detail-panel__poster">
        ${movie.posterUrl ? `<img src="${movie.posterUrl}" alt="${movie.title}"/>` : movie.emoji || '🎬'}
      </div>
      <h2 class="detail-panel__title">${movie.title}</h2>
      <div class="detail-panel__meta">
        <span>★ ${movie.rating}</span>
        <span>${movie.year}</span>
        <span>${movie.duration}</span>
        <span class="badge badge-genre">${movie.genre}</span>
        <span style="color:var(--text3);">Dir. ${movie.director}</span>
      </div>
      <p class="detail-panel__desc">${movie.description}</p>
      <div class="detail-panel__actions">
        <button class="btn btn-${isFav ? 'danger' : 'primary'}" id="detail-fav-btn"
          onclick="FavouritesManager.toggle(event, ${movie.id}); BrowsePage.openDetail(${movie.id})">
          ${isFav ? '💔 Remove Favourite' : '❤️ Add to Favourites'}
        </button>
        <button class="btn btn-ghost" onclick="Toast.show('🔗 Copied link to clipboard')">Share</button>
      </div>

      <h3 class="reviews-section-title">Write a Review</h3>
      <div class="review-form">
        <label class="review-form__label">Your Rating</label>
        <div class="stars-input" id="detail-stars">
          ${[1,2,3,4,5].map(n => `<span class="stars-input__star" data-val="${n}">★</span>`).join('')}
        </div>
        <textarea class="review-form__textarea" id="review-text" placeholder="Share your thoughts about ${movie.title}..."></textarea>
        <button class="btn btn-primary" style="margin-top:10px;width:100%;" id="review-submit-btn">
          Submit Review
        </button>
      </div>

      <h3 class="reviews-section-title">${reviewList.length} Review${reviewList.length !== 1 ? 's' : ''}</h3>
      ${reviewList.length
        ? reviewList.map(r => `
          <div class="review-card">
            <div class="review-card__header">
              <span class="review-card__user">${r.user}</span>
              <span class="review-card__stars">${Helpers.starDisplay(r.rating)}</span>
            </div>
            <p class="review-card__text">${r.text}</p>
            <p class="review-card__date">${Helpers.formatDate(r.date)}</p>
          </div>`).join('')
        : '<p style="font-size:13px;color:var(--text3);">No reviews yet — be the first!</p>'
      }`;
  }

  function _bindStarInput() {
    document.querySelectorAll('#detail-stars .stars-input__star').forEach(star => {
      star.addEventListener('click', () => {
        selectedStars = parseInt(star.dataset.val);
        document.querySelectorAll('#detail-stars .stars-input__star').forEach((s, i) => {
          s.classList.toggle('selected', i < selectedStars);
        });
      });
    });
  }

  function _bindReviewSubmit(movieId) {
    document.getElementById('review-submit-btn')?.addEventListener('click', async () => {
      const text = document.getElementById('review-text')?.value.trim();
      if (!selectedStars) { Toast.show('⚠️ Please select a star rating'); return; }
      if (!text)          { Toast.show('⚠️ Please write your review'); return; }

      // POST /api/reviews/{movieId}
      // const res = await API.reviews.create(movieId, { rating: selectedStars, text });
      Toast.show('✅ Review submitted — POST /api/reviews/' + movieId);
      document.getElementById('review-text').value = '';
      selectedStars = 0;
      document.querySelectorAll('#detail-stars .stars-input__star').forEach(s => s.classList.remove('selected'));
    });
  }

  // Register with router
  Router.register('browse', init);

  return { init, openDetail };
})();
