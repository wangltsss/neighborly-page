package com.neighborly.models;

import java.util.List;

/**
 * User model representing a Neighborly user profile.
 */
public class User {
    private String userId;
    private String email;
    private String username;
    private String aboutMe;
    private List<String> joinedBuildings;
    private String createdTime;

    public User() {}

    public User(String userId, String email, String username, String aboutMe, List<String> joinedBuildings, String createdTime) {
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.aboutMe = aboutMe;
        this.joinedBuildings = joinedBuildings;
        this.createdTime = createdTime;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAboutMe() {
        return aboutMe;
    }

    public void setAboutMe(String aboutMe) {
        this.aboutMe = aboutMe;
    }

    public List<String> getJoinedBuildings() {
        return joinedBuildings;
    }

    public void setJoinedBuildings(List<String> joinedBuildings) {
        this.joinedBuildings = joinedBuildings;
    }

    public String getCreatedTime() {
        return createdTime;
    }

    public void setCreatedTime(String createdTime) {
        this.createdTime = createdTime;
    }
}
