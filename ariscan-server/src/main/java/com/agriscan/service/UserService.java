package com.agriscan.service;

import com.agriscan.dto.request.UpdateProfileRequest;
import com.agriscan.dto.response.UserDTO;
import com.agriscan.entity.User;
import com.agriscan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDTO getProfile() {
        return toDTO(getLoggedInUser());
    }

    public UserDTO updateProfile(UpdateProfileRequest request) {
        User user = getLoggedInUser();

        if (request.getName()     != null) user.setName(request.getName());
        if (request.getPhone()    != null) user.setPhone(request.getPhone());
        if (request.getRegion()   != null) user.setRegion(request.getRegion());
        if (request.getState()    != null) user.setState(request.getState());
        if (request.getFarmSize() != null) user.setFarmSize(request.getFarmSize());
        if (request.getCrops()    != null) user.setCrops(request.getCrops());
        if (request.getLanguage() != null) user.setLanguage(request.getLanguage());

        return toDTO(userRepository.save(user));
    }

    public void changePassword(String oldPassword, String newPassword) {
        User user = getLoggedInUser();

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        if (newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserDTO toDTO(User u) {
        UserDTO dto = new UserDTO();
        dto.setId(u.getId());
        dto.setName(u.getName());
        dto.setEmail(u.getEmail());
        dto.setPhone(u.getPhone());
        dto.setRegion(u.getRegion());
        dto.setState(u.getState());
        dto.setFarmSize(u.getFarmSize());
        dto.setCrops(u.getCrops());
        dto.setLanguage(u.getLanguage());
        dto.setRole(u.getRole() != null ? u.getRole().name() : "FARMER");
        dto.setCreatedAt(u.getCreatedAt());
        return dto;
    }
}