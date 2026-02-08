package com.example.geogrille.order;

import com.example.geogrille.grille.Grille;
import com.example.geogrille.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "commandes")
public class Commande {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "grille_id", nullable = false)
  private Grille grille;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "chercheur_id", nullable = false)
  private User chercheur;

  @Column(nullable = false)
  private Instant orderDate = Instant.now();

  private Double priceSnapshot;

  public Long getId() { return id; }
  public Grille getGrille() { return grille; }
  public User getChercheur() { return chercheur; }
  public Instant getOrderDate() { return orderDate; }
  public Double getPriceSnapshot() { return priceSnapshot; }

  public void setGrille(Grille grille) { this.grille = grille; }
  public void setChercheur(User chercheur) { this.chercheur = chercheur; }
  public void setOrderDate(Instant orderDate) { this.orderDate = orderDate; }
  public void setPriceSnapshot(Double priceSnapshot) { this.priceSnapshot = priceSnapshot; }
}
