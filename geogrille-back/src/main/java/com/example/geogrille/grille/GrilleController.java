package com.example.geogrille.grille;

import com.example.geogrille.user.UserRepository;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grilles")
public class GrilleController {

  private final GrilleRepository grilleRepo;
  private final UserRepository userRepo;

  public GrilleController(GrilleRepository grilleRepo, UserRepository userRepo) {
    this.grilleRepo = grilleRepo;
    this.userRepo = userRepo;
  }

  public record CreateGrilleReq(
      @NotBlank String title,
      String description,
      @NotNull Double lat,
      @NotNull Double lng,
      Double pricePerDay
  ) {}

  public record GrilleRes(
      Long id, String title, String description,
      double lat, double lng, Double pricePerDay,
      String ownerEmail
  ) {
    static GrilleRes from(Grille g) {
      return new GrilleRes(
          g.getId(), g.getTitle(), g.getDescription(),
          g.getLat(), g.getLng(), g.getPricePerDay(),
          g.getOwner().getEmail()
      );
    }
  }

  @GetMapping
  public List<GrilleRes> list() {
    return grilleRepo.findAll().stream().map(GrilleRes::from).toList();
  }

  @GetMapping("/search")
  public List<GrilleRes> searchBbox(
      @RequestParam double minLat,
      @RequestParam double maxLat,
      @RequestParam double minLng,
      @RequestParam double maxLng
  ) {
    return grilleRepo.searchInBbox(minLat, maxLat, minLng, maxLng)
        .stream().map(GrilleRes::from).toList();
  }

  public record UpdateGrilleReq(String title, Double lat, Double lng, Double pricePerDay) {}

  @PostMapping
  @PreAuthorize("hasRole('PROPRIETAIRE')")
  public GrilleRes create(@RequestBody CreateGrilleReq req, Authentication auth) {
    var user = userRepo.findByEmail(auth.getName()).orElseThrow();

    var g = new Grille();
    g.setTitle(req.title());
    g.setDescription(req.description());
    g.setLat(req.lat());
    g.setLng(req.lng());
    g.setPricePerDay(req.pricePerDay());
    g.setOwner(user);

    return GrilleRes.from(grilleRepo.save(g));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('PROPRIETAIRE')")
  public GrilleRes update(@PathVariable Long id, @RequestBody UpdateGrilleReq req, Authentication auth) {
    var g = grilleRepo.findById(id).orElseThrow(() -> new RuntimeException("Grille not found"));
    if (!g.getOwner().getEmail().equals(auth.getName())) {
      throw new RuntimeException("Not your grille");
    }
    if (req.title() != null) g.setTitle(req.title());
    if (req.lat() != null) g.setLat(req.lat());
    if (req.lng() != null) g.setLng(req.lng());
    if (req.pricePerDay() != null) g.setPricePerDay(req.pricePerDay());
    return GrilleRes.from(grilleRepo.save(g));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('PROPRIETAIRE')")
  public void delete(@PathVariable Long id, Authentication auth) {
    var g = grilleRepo.findById(id).orElseThrow(() -> new RuntimeException("Grille not found"));
    if (!g.getOwner().getEmail().equals(auth.getName())) {
      throw new RuntimeException("Not your grille");
    }
    grilleRepo.delete(g);
  }
}
