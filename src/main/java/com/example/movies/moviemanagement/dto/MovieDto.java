package com.example.movies.moviemanagement.dto;

public record MovieDto(Long id, String title, String description, String releaseDate, String genre) {

    public MovieDto {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("title must not be blank");
        }
        if (title.length() > 100) {
            throw new IllegalArgumentException("title must be at most 100 characters");
        }
        if (description != null && description.length() > 500) {
            throw new IllegalArgumentException("description must be at most 500 characters");
        }
        if (releaseDate != null && releaseDate.length() > 20) {
            throw new IllegalArgumentException("releaseDate must be at most 20 characters");
        }
        if (genre == null || genre.isBlank()) {
            throw new IllegalArgumentException("genre must not be blank");
        }
        if (genre.length() > 10) {
            throw new IllegalArgumentException("genre must be at most 10 characters");
        }
     }
}