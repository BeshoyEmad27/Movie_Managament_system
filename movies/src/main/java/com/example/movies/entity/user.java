package com.example.movies.entity;
import java.util.List;

public class user {
    public user() {
    }
    private int id;
    private String name;
    private String email;
    private String password;
    private List<favourite> favourites;
    private List<review> reviews;

    // Getters and Setters
    public int getId() {
        return id;
    }
    public void setId(int id) {
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
    public List<favourite> getFavourites() {
        return favourites;
    }
    public void setFavourites(List<favourite> favourites) {
        this.favourites = favourites;
    }
    public List<review> getReviews() {
        return reviews;
    }
    public void setReviews(List<review> reviews) {
        this.reviews = reviews;
    }

}