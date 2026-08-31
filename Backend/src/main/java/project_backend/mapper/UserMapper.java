package project_backend.mapper;

import org.springframework.stereotype.Component;
import project_backend.model.dto.response.UserResponse;
import project_backend.model.entity.Role;
import project_backend.model.entity.User;

import java.util.stream.Collectors;

@Component
public class UserMapper {
    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatar(user.getAvatar())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .build();
    }
}
