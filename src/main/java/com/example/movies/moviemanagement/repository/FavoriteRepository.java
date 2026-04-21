package com.example.movies.moviemanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.movies.moviemanagement.entity.favorite;


public interface FavoriteRepository extends JpaRepository<favorite,Long> {
    List<favorite> findByUserId(Long userId);
}