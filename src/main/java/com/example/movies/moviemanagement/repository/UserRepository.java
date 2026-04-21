package com.example.movies.moviemanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.movies.moviemanagement.entity.user;
public interface UserRepository extends JpaRepository<user, Long> {
    List<user> findByName(String name);
    List<user> findByEmail(String email);
}
