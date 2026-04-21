package com.example.movies.moviemanagement.mapper;
import org.springframework.stereotype.Component;

import com.example.movies.moviemanagement.dto.MovieDto;
import com.example.movies.moviemanagement.entity.movie;


@Component
public class MovieMapper {
    public MovieDto toDTO(movie movie) {
        return new MovieDto(movie.getId(), movie.getTitle(), movie.getDescription(),movie.getReleaseDate(), movie.getGenre());
    }

    public movie toEntity(MovieDto dto) {
        movie movie = new movie();
        movie.setTitle(dto.title());
        movie.setDescription(dto.description());
        movie.setReleaseDate(dto.releaseDate());
        movie.setGenre(dto.genre());
        return movie;
    }
}
