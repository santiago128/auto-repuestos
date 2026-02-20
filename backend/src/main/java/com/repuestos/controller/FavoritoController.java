package com.repuestos.controller;

import com.repuestos.dto.ApiResponse;
import com.repuestos.model.Repuesto;
import com.repuestos.service.FavoritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favoritos")
@RequiredArgsConstructor
public class FavoritoController {

    private final FavoritoService favoritoService;

    @PostMapping("/{repuestoId}")
    public ResponseEntity<ApiResponse<Object>> toggle(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Integer repuestoId) {
        var data = favoritoService.toggleFavorito(user.getUsername(), repuestoId);
        return ResponseEntity.ok(ApiResponse.ok("Favorito actualizado", data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Repuesto>>> getFavoritos(
            @AuthenticationPrincipal UserDetails user) {
        var favoritos = favoritoService.obtenerFavoritos(user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Favoritos obtenidos", favoritos));
    }

    @GetMapping("/ids")
    public ResponseEntity<ApiResponse<List<Integer>>> getIdsFavoritos(
            @AuthenticationPrincipal UserDetails user) {
        var ids = favoritoService.obtenerIdsFavoritos(user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("IDs de favoritos", ids));
    }
}
