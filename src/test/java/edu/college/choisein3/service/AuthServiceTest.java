package edu.college.choisein3.service;

import edu.college.choisein3.model.User;
import edu.college.choisein3.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Тесты AuthService")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthService authService;

    private static final String TEST_EMAIL = "user@test.com";
    private static final String TEST_NAME = "Test User";
    private static final String TEST_PASSWORD = "password123";

    @Test
    @DisplayName("Регистрация нового пользователя — успех")
    void registerUser_success() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        boolean result = authService.registerUser(TEST_NAME, TEST_EMAIL, TEST_PASSWORD);

        assertThat(result).isTrue();
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertThat(saved.getEmail()).isEqualTo(TEST_EMAIL);
        assertThat(saved.getName()).isEqualTo(TEST_NAME);
        assertThat(saved.getPassword()).isNotEqualTo(TEST_PASSWORD); // пароль захеширован
        assertThat(new BCryptPasswordEncoder().matches(TEST_PASSWORD, saved.getPassword())).isTrue();
    }

    @Test
    @DisplayName("Регистрация — email уже занят")
    void registerUser_emailAlreadyExists() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(new User()));

        boolean result = authService.registerUser(TEST_NAME, TEST_EMAIL, TEST_PASSWORD);

        assertThat(result).isFalse();
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Вход — успех при верном пароле")
    void login_success() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        User user = User.builder()
                .id(1L)
                .name(TEST_NAME)
                .email(TEST_EMAIL)
                .password(encoder.encode(TEST_PASSWORD))
                .build();
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(user));

        Optional<User> result = authService.login(TEST_EMAIL, TEST_PASSWORD);

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo(TEST_EMAIL);
    }

    @Test
    @DisplayName("Вход — неверный пароль")
    void login_wrongPassword() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        User user = User.builder()
                .id(1L)
                .email(TEST_EMAIL)
                .password(encoder.encode(TEST_PASSWORD))
                .build();
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(user));

        Optional<User> result = authService.login(TEST_EMAIL, "wrongpassword");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Вход — пользователь не найден")
    void login_userNotFound() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());

        Optional<User> result = authService.login(TEST_EMAIL, TEST_PASSWORD);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Поиск пользователя по email")
    void findUserByEmail() {
        User user = User.builder().id(1L).email(TEST_EMAIL).build();
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(user));

        Optional<User> result = authService.findUserByEmail(TEST_EMAIL);

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo(TEST_EMAIL);
    }
}
