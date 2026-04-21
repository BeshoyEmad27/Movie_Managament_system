/**
 * CineVault - Favourites Page
 * /static/js/favourites.js
 *
 * Renders the current user's favourite movies.
 * Spring Boot: GET /api/favourites
 */

const FavouritesPage = (() => {

  async function init() {
    const container = document.getElementById('fav-grid');
    const empty     = document.getElementById('fav-empty');
    const countEl   = document.getElementById('fav-count');

    // GET /api/favourites — returns list of Movie objects
    // const data = await API.favourites.getAll();
    // const favMovies = data?.content || data || [];

    // Derive from cached state + movie list (mock approach)
    const allMovies = State.get('movies') || [];
    const favIds    = State.get('favourites');
    const favMovies = allMovies.filter(m => favIds.has(m.id));

    countEl.textContent = `${favMovies.length} movie${favMovies.length !== 1 ? 's' : ''}`;

    if (!favMovies.length) {
      container.style.display = 'none';
      empty.style.display     = 'block';
      return;
    }

    container.style.display = 'grid';
    empty.style.display     = 'none';
    Helpers.renderMovieGrid('fav-grid', favMovies);
  }

  // Re-render when favourites change
  State.on('favourites', () => {
    if (State.get('currentPage') === 'favourites') init();
  });

  Router.register('favourites', init);

  return { init };
})();
