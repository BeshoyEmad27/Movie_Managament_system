package com.example.movies.moviemanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.movies.moviemanagement.entity.review;


public interface ReviewRepository extends JpaRepository<review, Long> {
    List<review> findByUserId(Long userId);
}