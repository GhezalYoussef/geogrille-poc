package com.example.geogrille.auth;

import com.example.geogrille.security.JwtService;
import com.example.geogrille.user.User;
import com.example.geogrille.user.UserRepository;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final UserRepository userRepo;
  private final JwtService jwtService;
  private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

  public AuthController(UserRepository userRepo, JwtService jwtService) {
    this.userRepo = userRepo;
    this.jwtService = jwtService;
  }

  public record RegisterReq(@Email @NotBlank String email, @NotBlank String password, @NotBlank String role) {}
  public record LoginReq(@Email @NotBlank String email, @NotBlank String password) {}
  public record AuthRes(String token) {}

  @PostMapping("/register")
  public void register(@RequestBody RegisterReq req) {
    if (userRepo.existsByEmail(req.email())) {
      throw new RuntimeException("Email already used");
    }
    if (!req.role().equals("PROPRIETAIRE") && !req.role().equals("CHERCHEUR")) {
      throw new RuntimeException("Role must be PROPRIETAIRE or CHERCHEUR");
    }
    var user = new User(req.email(), encoder.encode(req.password()), req.role());
    userRepo.save(user);
  }

  @PostMapping("/login")
  public AuthRes login(@RequestBody LoginReq req) {
    var user = userRepo.findByEmail(req.email()).orElseThrow(() -> new RuntimeException("Bad credentials"));
    if (!encoder.matches(req.password(), user.getPasswordHash())) {
      throw new RuntimeException("Bad credentials");
    }

    String token = jwtService.generateToken(user.getEmail(), Map.of(
        "roles", List.copyOf(user.getRoles())
    ));
    return new AuthRes(token);
  }
}
