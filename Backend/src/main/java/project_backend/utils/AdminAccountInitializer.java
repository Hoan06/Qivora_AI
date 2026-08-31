package project_backend.utils;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import project_backend.model.entity.Role;
import project_backend.model.entity.User;
import project_backend.repository.RoleRepository;
import project_backend.repository.UserRepository;

import java.util.HashSet;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class AdminAccountInitializer {
    private static final String ADMIN_ROLE = "ADMIN";
    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD = "admin123";
    private static final String ADMIN_EMAIL = "admin@qivora.local";
    private static final String ADMIN_FULL_NAME = "Administrator";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public ApplicationRunner initDefaultAdminAccount() {
        return args -> createAdminIfMissing();
    }

    @Transactional
    public void createAdminIfMissing() {
        if (userRepository.countDistinctByRoles_Name(ADMIN_ROLE) > 0) {
            return;
        }

        Role adminRole = roleRepository.findByName(ADMIN_ROLE)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ADMIN_ROLE).build()));

        User admin = userRepository.findByUsername(ADMIN_USERNAME)
                .map(existingUser -> prepareExistingUserAsAdmin(existingUser, adminRole))
                .orElseGet(() -> buildDefaultAdmin(adminRole));

        userRepository.save(admin);
    }

    private User prepareExistingUserAsAdmin(User user, Role adminRole) {
        Set<Role> roles = user.getRoles() == null ? new HashSet<>() : new HashSet<>(user.getRoles());
        roles.add(adminRole);

        user.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
        user.setIsActive(true);
        user.setRoles(roles);

        if (user.getFullName() == null || user.getFullName().isBlank()) {
            user.setFullName(ADMIN_FULL_NAME);
        }

        return user;
    }

    private User buildDefaultAdmin(Role adminRole) {
        return User.builder()
                .username(ADMIN_USERNAME)
                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                .email(ADMIN_EMAIL)
                .fullName(ADMIN_FULL_NAME)
                .isActive(true)
                .roles(Set.of(adminRole))
                .build();
    }
}
