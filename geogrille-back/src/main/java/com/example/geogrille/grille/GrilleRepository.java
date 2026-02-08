package com.example.geogrille.grille;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GrilleRepository extends JpaRepository<Grille, Long> {

  @Query("""
    select g from Grille g
    where g.lat between :minLat and :maxLat
      and g.lng between :minLng and :maxLng
  """)
  List<Grille> searchInBbox(
      @Param("minLat") double minLat,
      @Param("maxLat") double maxLat,
      @Param("minLng") double minLng,
      @Param("maxLng") double maxLng
  );
}
