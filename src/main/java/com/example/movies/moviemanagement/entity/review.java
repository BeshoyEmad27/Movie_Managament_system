package com.example.movies.moviemanagement.entity;

public class review {
    public review() {
        // TODO Auto-generated method stub`
    }

    private int id;
    private String content;
    private int rating;
    private user user;
    private movie movie;
    // Getters and Setters
    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public String getContent() {
        return content;
    }
    public void setContent(String content) {
        this.content = content;
    }
    public int getRating() {
        return rating;
    }
    public void setRating(int rating) {
        this.rating = rating;
    }
    public user getUser() {
        return user;
    }
    public void setUser(user user) {
        this.user = user;
    }
    public movie getMovie() {
        return movie;
    }
    public void setMovie(movie movie) {
        this.movie = movie;
    }




}