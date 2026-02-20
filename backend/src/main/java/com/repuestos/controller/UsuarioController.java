package com.repuestos.controller;

import com.repuestos.dto.ApiResponse;
import com.repuestos.dto.CambiarPasswordRequest;
import com.repuestos.dto.PerfilRequest;
import com.repuestos.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/perfil")
    public ResponseEntity<ApiResponse<Object>> getPerfil(@AuthenticationPrincipal UserDetails user) {
        var data = usuarioService.getPerfil(user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Perfil obtenido", data));
    }

    @PutMapping("/perfil")
    public ResponseEntity<ApiResponse<Object>> actualizarPerfil(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody PerfilRequest req) {
        var data = usuarioService.actualizarPerfil(user.getUsername(), req);
        return ResponseEntity.ok(ApiResponse.ok("Perfil actualizado", data));
    }

    @PutMapping("/cambiar-password")
    public ResponseEntity<ApiResponse<String>> cambiarPassword(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody CambiarPasswordRequest req) {
        String msg = usuarioService.cambiarPassword(user.getUsername(), req);
        return ResponseEntity.ok(ApiResponse.ok(msg, null));
    }
}
