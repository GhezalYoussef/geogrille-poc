package com.example.geogrille.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends GenericFilterBean {

  private final JwtService jwtService;

  public JwtAuthFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
      throws IOException, ServletException {

    HttpServletRequest request = (HttpServletRequest) req;
    String header = request.getHeader("Authorization");

    if (header != null && header.startsWith("Bearer ")) {
      String token = header.substring(7);
      try {
        Claims claims = jwtService.parse(token).getBody();
        String email = claims.getSubject();

        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) claims.getOrDefault("roles", List.of("USER"));

        var auth = new UsernamePasswordAuthenticationToken(
            email,
            null,
            roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)).toList()
        );

        SecurityContextHolder.getContext().setAuthentication(auth);
      } catch (Exception ignored) {
        SecurityContextHolder.clearContext();
      }
    }

    chain.doFilter(req, res);
  }
}
