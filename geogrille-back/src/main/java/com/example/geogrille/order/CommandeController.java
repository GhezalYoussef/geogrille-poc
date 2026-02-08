package com.example.geogrille.order;

import com.example.geogrille.grille.GrilleRepository;
import com.example.geogrille.user.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class CommandeController {

  private final CommandeRepository commandeRepo;
  private final GrilleRepository grilleRepo;
  private final UserRepository userRepo;

  public CommandeController(CommandeRepository commandeRepo, GrilleRepository grilleRepo, UserRepository userRepo) {
    this.commandeRepo = commandeRepo;
    this.grilleRepo = grilleRepo;
    this.userRepo = userRepo;
  }

  public record CreateOrderReq(Long grilleId) {}

  public record OrderRes(Long id, String grilleTitle, Double priceSnapshot, String orderDate) {
    static OrderRes from(Commande c) {
      return new OrderRes(
          c.getId(),
          c.getGrille().getTitle(),
          c.getPriceSnapshot(),
          c.getOrderDate().toString()
      );
    }
  }

  @PostMapping
  @PreAuthorize("hasRole('CHERCHEUR')")
  public OrderRes create(@RequestBody CreateOrderReq req, Authentication auth) {
    var grille = grilleRepo.findById(req.grilleId())
        .orElseThrow(() -> new RuntimeException("Grille not found"));
    var chercheur = userRepo.findByEmail(auth.getName()).orElseThrow();

    var commande = new Commande();
    commande.setGrille(grille);
    commande.setChercheur(chercheur);
    commande.setPriceSnapshot(grille.getPricePerDay());

    return OrderRes.from(commandeRepo.save(commande));
  }

  @GetMapping("/me")
  @PreAuthorize("hasRole('CHERCHEUR')")
  public List<OrderRes> myOrders(Authentication auth) {
    return commandeRepo.findByChercheurEmailOrderByOrderDateDesc(auth.getName())
        .stream().map(OrderRes::from).toList();
  }
}
