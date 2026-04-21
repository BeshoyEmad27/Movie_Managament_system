package com.example.movies.moviemanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.movies.moviemanagement.entity.movie;


public interface MovieRepository extends JpaRepository<movie, Long> {
    List<movie> findByUserId(Long userId);
}