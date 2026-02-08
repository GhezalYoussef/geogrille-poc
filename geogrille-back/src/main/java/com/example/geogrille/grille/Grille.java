package com.example.geogrille.grille;

import com.example.geogrille.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "grilles")
public class Grille {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  private String description;

  @Column(nullable = false)
  private double lat;

  @Column(nullable = false)
  private double lng;

  private Double pricePerDay;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_id", nullable = false)
  private User owner;

  @Column(nullable = false)
  private Instant createdAt = Instant.now();

  public Long getId() { return id; }
  public String getTitle() { return title; }
  public String getDescription() { return description; }
  public double getLat() { return lat; }
  public double getLng() { return lng; }
  public Double getPricePerDay() { return pricePerDay; }
  public User getOwner() { return owner; }
  public Instant getCreatedAt() { return createdAt; }

  public void setTitle(String title) { this.title = title; }
  public void setDescription(String description) { this.description = description; }
  public void setLat(double lat) { this.lat = lat; }
  public void setLng(double lng) { this.lng = lng; }
  public void setPricePerDay(Double pricePerDay) { this.pricePerDay = pricePerDay; }
  public void setOwner(User owner) { this.owner = owner; }
}
