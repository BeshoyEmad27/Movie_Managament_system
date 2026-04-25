package com.example.movies.moviemanagement.controller;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.movies.moviemanagement.dto.MovieDto;
import com.example.movies.moviemanagement.service.MovieService;

import jakarta.validation.Valid;

// Base URL: /api/v1/movies

@RestController
@RequestMapping("/api/v1/movies")
public class MovieController {

    private static final Logger logger = Logger.getLogger(MovieController.class.getName());

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }
    // GET /api/v1/movies/all
    // Returns all movies as a flat list (no pagination).

    @GetMapping("/all")
    public ResponseEntity<List<MovieDto>> getAllMovies() {
        logger.info("GET /api/v1/movies/all");
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    // GET /api/v1/movies?page=0&size=10&sort=title,asc
    // Returns movies with pagination support
    @GetMapping
    public ResponseEntity<Page<MovieDto>> getAllMoviesPaged(
            @PageableDefault(size = 10, sort = "title") Pageable pageable) {
        logger.log(Level.INFO, "GET /api/v1/movies — page={0}, size={1}",
                new Object[] { pageable.getPageNumber(), pageable.getPageSize() });
        return ResponseEntity.ok(movieService.getAllMovies(pageable));
    }
    // GET /api/v1/movies/{id}
    // Returns a single movie by its ID.

    @GetMapping("/{id}")
    public ResponseEntity<MovieDto> getMovieById(@PathVariable Long id) {
        logger.log(Level.INFO, "GET /api/v1/movies/{0}", id);
        return ResponseEntity.ok(movieService.getMovieById(id));
    }

    // POST /api/v1/movies// Creates a new movie
    // Returns 201 Created with the saved movie
    @PostMapping
    public ResponseEntity<MovieDto> createMovie(@RequestBody @Valid MovieDto movieDto) {
        logger.log(Level.INFO, "POST /api/v1/movies — title=\"{0}\"", movieDto.title());
        MovieDto created = movieService.createMovie(movieDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/v1/movies/{id}
    // Replaces a movie's data entirely Returns the updated movie
    // return 200 OK with the updated MovieDto, or 404 if not found
    @PutMapping("/{id}")
    public ResponseEntity<MovieDto> updateMovie(
            @PathVariable Long id,
            @RequestBody @Valid MovieDto movieDto) {
        logger.log(Level.INFO, "PUT /api/v1/movies/{0} — title=\"{1}\"",
                new Object[] { id, movieDto.title() });
        return ResponseEntity.ok(movieService.updateMovie(id, movieDto));
    }

    // DELETE /api/v1/movies/{id}
    // Deletes a movie by ID. Returns 204 No Content or 404 if not found
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long id) {
        logger.log(Level.INFO, "DELETE /api/v1/movies/{0}", id);
        movieService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/v1/movies/search?title=&genre=&minRating=&maxRating=
    // Searches movies by optional filters with pagination.
    @GetMapping("/search")
    public ResponseEntity<Page<MovieDto>> searchMovies(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Double maxRating,
            @PageableDefault(size = 10, sort = "title") Pageable pageable) {
        logger.log(Level.INFO,
                "GET /api/v1/movies/search — title=\"{0}\", genre=\"{1}\"",
                new Object[] { title, genre });
        return ResponseEntity.ok(
                movieService.searchMovies(title, genre, minRating, maxRating, pageable));
    }
}
