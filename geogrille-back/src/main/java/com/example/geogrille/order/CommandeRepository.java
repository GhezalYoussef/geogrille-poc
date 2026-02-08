package com.example.geogrille.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommandeRepository extends JpaRepository<Commande, Long> {
  List<Commande> findByChercheurEmailOrderByOrderDateDesc(String email);
}
