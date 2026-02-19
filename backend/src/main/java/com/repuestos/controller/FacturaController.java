package com.repuestos.controller;

import com.repuestos.dto.ApiResponse;
import com.repuestos.dto.FacturaRequest;
import com.repuestos.model.Factura;
import com.repuestos.service.FacturaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facturas")
@RequiredArgsConstructor
public class FacturaController {

    private final FacturaService facturaService;

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> crear(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody FacturaRequest req) {
        var data = facturaService.crearFactura(user.getUsername(), req);
        return ResponseEntity.ok(ApiResponse.ok("Factura creada exitosamente", data));
    }

    @GetMapping("/mis-facturas")
    public ResponseEntity<ApiResponse<List<Factura>>> misFacturas(
            @AuthenticationPrincipal UserDetails user) {
        var facturas = facturaService.misFacturas(user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Facturas obtenidas", facturas));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Factura>> obtener(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails user) {
        var factura = facturaService.obtenerFactura(id, user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Factura obtenida", factura));
    }
}
