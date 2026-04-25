package com.example.movies.moviemanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.movies.moviemanagement.entity.movie;


public interface MovieRepository extends JpaRepository<movie, Long> {

    /**
     * Finds a movie by its exact title.
     * Used for duplicate-title checking during create / update
    */
    Optional<movie> findByTitle(String title);

    /**
      Checks whether a movie with the given title exists
      excludingthe movie with the specified id
  */
    boolean existsByTitleAndIdNot(String title, Long id);

    /**
     * Finds all movies favorited by a specific user
    */
    @Query("SELECT f.movie FROM favorite f WHERE f.user.id = :userId")
    List<movie> findByUserId(@Param("userId") Long userId);

    /**
     * DB-level search with optional title (case-insensitive)and/or
     * genre (case-insensitive) filter
*/
    @Query("""
            SELECT m FROM movie m
            WHERE (:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%')))
              AND (:genre IS NULL OR LOWER(m.genre) = LOWER(:genre))
            """)
    Page<movie> searchByFilters(
            @Param("title") String title,
            @Param("genre") String genre,
            Pageable pageable);

    
     //Counts movies that match the given genre 
    
    @Query("SELECT COUNT(m) FROM movie m WHERE LOWER(m.genre) = LOWER(:genre)")
    long countByGenreIgnoreCase(@Param("genre") String genre);
}