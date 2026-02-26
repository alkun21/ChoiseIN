package edu.college.choisein3.service;

import edu.college.choisein3.model.User;
import edu.college.choisein3.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        log.debug("AuthService инициализирован");
    }

    public boolean registerUser(String name, String email, String password) {
        log.debug("Попытка регистрации пользователя: email={}", email);
        if (userRepository.findByEmail(email).isPresent()) {
            log.warn("Регистрация отклонена: email уже занят - {}", email);
            return false;
        }
        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .build();
        userRepository.save(user);
        log.info("Пользователь успешно зарегистрирован: email={}, name={}", email, name);
        return true;
    }

    public Optional<User> login(String email, String password) {
        log.debug("Попытка входа: email={}", email);
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            log.info("Успешный вход пользователя: email={}", email);
            return userOpt;
        }
        log.warn("Неудачная попытка входа: email={}", email);
        return Optional.empty();
    }

    public Optional<User> findUserByEmail(String email) {
        log.debug("Поиск пользователя по email: {}", email);
        return userRepository.findByEmail(email);
    }
}
