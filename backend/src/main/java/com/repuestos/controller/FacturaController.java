package com.repuestos.controller;

import com.repuestos.dto.ApiResponse;
import com.repuestos.dto.FacturaRequest;
import com.repuestos.model.Factura;
import com.repuestos.service.FacturaService;
import com.repuestos.service.PdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/facturas")
@RequiredArgsConstructor
public class FacturaController {

    private final FacturaService facturaService;
    private final PdfService pdfService;

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

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> descargarPdf(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails user) {
        boolean esAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Factura factura = facturaService.obtenerFacturaPdf(id, user.getUsername(), esAdmin);
        byte[] pdf = pdfService.generarFacturaPdf(factura);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"factura-" + factura.getNumeroFactura() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<String>> cambiarEstado(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String estado = body.get("estado");
        String msg = facturaService.cambiarEstado(id, estado);
        return ResponseEntity.ok(ApiResponse.ok(msg, null));
    }

    @GetMapping("/admin/todas")
    public ResponseEntity<ApiResponse<List<Factura>>> todasLasFacturas() {
        var facturas = facturaService.obtenerTodas();
        return ResponseEntity.ok(ApiResponse.ok("Facturas obtenidas", facturas));
    }
}
