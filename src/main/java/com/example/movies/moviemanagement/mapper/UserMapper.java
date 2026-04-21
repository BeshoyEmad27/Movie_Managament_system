package com.example.movies.moviemanagement.mapper;
import org.springframework.stereotype.Component;

import com.example.movies.moviemanagement.dto.UserDTO;
import com.example.movies.moviemanagement.entity.user;


@Component
public class UserMapper {
    public UserDTO toDTO(user user) {
        return new UserDTO(user.getId(), user.getName(), user.getEmail());
    }

    public user toEntity(UserDTO dto) {
        user user = new user();
        user.setName(dto.name());
        user.setEmail(dto.email());
        return user;
    }
}
