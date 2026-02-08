package com.example.geogrille.user;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private String passwordHash;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
  @Column(name = "role")
  private Set<String> roles = new HashSet<>(Set.of("USER"));

  public User() {}

  public User(String email, String passwordHash) {
    this.email = email;
    this.passwordHash = passwordHash;
  }

  public User(String email, String passwordHash, String role) {
    this.email = email;
    this.passwordHash = passwordHash;
    this.roles = new HashSet<>(Set.of(role));
  }

  public Long getId() { return id; }
  public String getEmail() { return email; }
  public String getPasswordHash() { return passwordHash; }
  public Set<String> getRoles() { return roles; }

  public void setEmail(String email) { this.email = email; }
  public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
  public void setRoles(Set<String> roles) { this.roles = roles; }
}
