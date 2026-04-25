package com.example.movies.moviemanagement.service.impl;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.movies.moviemanagement.dto.MovieDto;
import com.example.movies.moviemanagement.entity.movie;
import com.example.movies.moviemanagement.exception.DuplicateMovieException;
import com.example.movies.moviemanagement.exception.InvalidMovieDataException;
import com.example.movies.moviemanagement.exception.MovieNotFoundException;
import com.example.movies.moviemanagement.mapper.MovieMapper;
import com.example.movies.moviemanagement.repository.MovieRepository;
import com.example.movies.moviemanagement.service.MovieService;


@Service
@Transactional
public class MovieServiceImpl implements MovieService {

    private static final Logger logger = Logger.getLogger(MovieServiceImpl.class.getName());

    private final MovieRepository movieRepository;
    private final MovieMapper movieMapper;

    public MovieServiceImpl(MovieRepository movieRepository, MovieMapper movieMapper) {
        this.movieRepository = movieRepository;
        this.movieMapper = movieMapper;
    }
    // READ operations
    @Override
    @Transactional(readOnly = true)
    public List<MovieDto> getAllMovies() {
        logger.info("Fetching all movies (unpaged)");
        List<MovieDto> movies = movieRepository.findAll()
                .stream()
                .map(movieMapper::toDTO)
                .toList();
        logger.log(Level.INFO, "Returned {0} movie(s)", movies.size());
        return movies;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MovieDto> getAllMovies(Pageable pageable) {
        logger.log(Level.INFO, "Fetching movies — page {0}, size {1}",
                new Object[]{pageable.getPageNumber(), pageable.getPageSize()});
        return movieRepository.findAll(pageable)
                .map(movieMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public MovieDto getMovieById(Long id) {
        logger.log(Level.INFO, "Fetching movie with id {0}", id);
        return movieMapper.toDTO(findMovieOrThrow(id));
    }
    // WRITE operations
 @Override
    public MovieDto createMovie(MovieDto movieDto) {
        validateMoviePayload(movieDto);
        String normalizedTitle = normalize(movieDto.title());

        // Duplicate-title guard
        movieRepository.findByTitle(normalizedTitle).ifPresent(existing -> {
            throw new DuplicateMovieException(
                    "Movie already exists with title: " + movieDto.title());
        });

        movie entity = buildEntityFromDto(movieDto, normalizedTitle);
        movie saved = movieRepository.save(entity);
        logger.log(Level.INFO, "Created movie id={0}, title=\"{1}\"",
                new Object[]{saved.getId(), saved.getTitle()});
        return movieMapper.toDTO(saved);
    }

    @Override
    public MovieDto updateMovie(Long id, MovieDto movieDto) {
        validateMoviePayload(movieDto);
        movie existingMovie = findMovieOrThrow(id);
        String normalizedTitle = normalize(movieDto.title());

        // Duplicate-title guard (excluding the current movie)
        movieRepository.findByTitle(normalizedTitle)
                .filter(found -> !found.getId().equals(id))
                .ifPresent(found -> {
                    throw new DuplicateMovieException(
                            "Movie already exists with title: " + movieDto.title());
                });

        applyDtoToEntity(movieDto, existingMovie, normalizedTitle);
        movie saved = movieRepository.save(existingMovie);
        logger.log(Level.INFO, "Updated movie id={0}, title=\"{1}\"",
                new Object[]{saved.getId(), saved.getTitle()});
        return movieMapper.toDTO(saved);
    }

@Override
    public void deleteMovie(Long id) {
        if (!movieRepository.existsById(id)) {
            throw new MovieNotFoundException("Movie not found with id: " + id);
        }
        movieRepository.deleteById(id);
        logger.log(Level.INFO, "Deleted movie id={0}", id);
    }

    // search
    @Override
    @Transactional(readOnly = true)
    public Page<MovieDto> searchMovies(String title, String genre,
                                       Double minRating, Double maxRating,
                                       Pageable pageable) {
        logger.log(Level.INFO,
                "Searching movies — title=\"{0}\", genre=\"{1}\", minRating={2}, maxRating={3}",
                new Object[]{title, genre, minRating, maxRating});

        Page<MovieDto> results = movieRepository
                .searchByFilters(title, genre, pageable)
                .map(movieMapper::toDTO);

        logger.log(Level.INFO, "Search returned {0} result(s) (page {1} of {2})",
                new Object[]{results.getNumberOfElements(),
                        results.getNumber(), results.getTotalPages()});
        return results;
    }

    private movie findMovieOrThrow(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new MovieNotFoundException(
                        "Movie not found with id: " + id));
    }

    
     //Service level validation 
     
    private void validateMoviePayload(MovieDto movieDto) {
        if (movieDto == null) {
            throw new InvalidMovieDataException("Movie data must not be null");
        }
        if (isBlank(movieDto.title())) {
            throw new InvalidMovieDataException("Movie title must not be blank");
        }
        if (isBlank(movieDto.genre())) {
            throw new InvalidMovieDataException("Movie genre must not be blank");
        }
    }

     //build a new entity from the dto with applying normalization
  
    private movie buildEntityFromDto(MovieDto dto, String normalizedTitle) {
        movie entity = movieMapper.toEntity(dto);
        entity.setTitle(normalizedTitle);
        entity.setGenre(normalize(dto.genre()));
        if (dto.description() != null) {
            entity.setDescription(dto.description().trim());
        }
        if (dto.releaseDate() != null) {
            entity.setReleaseDate(dto.releaseDate().trim());
        }
        return entity;
    }

 
     // applies dto values to an existing entity for an update
   
    private void applyDtoToEntity(MovieDto dto, movie entity, String normalizedTitle) {
        entity.setTitle(normalizedTitle);
        entity.setGenre(normalize(dto.genre()));
        entity.setDescription(dto.description() != null ? dto.description().trim() : null);
        entity.setReleaseDate(dto.releaseDate() != null ? dto.releaseDate().trim() : null);
    }

  
     // trims and returns the value or  null if blank
        
    private String normalize(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
