package com.example.movies.moviemanagement.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.movies.moviemanagement.dto.MovieDto;

public interface MovieService {

    
      //Return every movie in the catalogue as list
    List<MovieDto> getAllMovies();

    Page<MovieDto> getAllMovies(Pageable pageable);


    MovieDto getMovieById(Long id);

    
      //Creates a new movie after validating the payload and checking
     //for duplicate titles

    MovieDto createMovie(MovieDto movieDto);

    
     // Replaces all fields of an existing movie

    MovieDto updateMovie(Long id, MovieDto movieDto);

    
     ///Deletes a movie by its id
     
void deleteMovie(Long id);
 // Searches movies by optional filters with pagination
 Page<MovieDto> searchMovies(String title, String genre,
                                Double minRating, Double maxRating,
                                Pageable pageable);
}