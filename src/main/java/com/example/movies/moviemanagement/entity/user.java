package com.example.movies.moviemanagement.entity;
import java.util.List;


public class user {
    public user() {
    }
  
    private Long id;
    private String name;
    private String email;
    private String password;
    private List<favorite> favourites;
    private List<review> reviews;

    // Getters and Setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public List<favorite> getFavourites() {
        return favourites;
    }
    public void setFavourites(List<favorite> favourites) {
        this.favourites = favourites;
    }
    public List<review> getReviews() {
        return reviews;
    }
    public void setReviews(List<review> reviews) {
        this.reviews = reviews;
    }

}