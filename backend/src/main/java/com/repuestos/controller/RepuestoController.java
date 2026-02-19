package com.repuestos.controller;

import com.repuestos.dto.ApiResponse;
import com.repuestos.dto.RepuestoRequest;
import com.repuestos.model.Repuesto;
import com.repuestos.service.RepuestoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repuestos")
@RequiredArgsConstructor
public class RepuestoController {

    private final RepuestoService repuestoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Repuesto>>> listar(
            @RequestParam(required = false) Integer marcaId,
            @RequestParam(required = false) Integer modeloId,
            @RequestParam(required = false) Integer categoriaId,
            @RequestParam(required = false) String nombre) {

        List<Repuesto> repuestos = (marcaId != null || modeloId != null || categoriaId != null || nombre != null)
                ? repuestoService.buscar(marcaId, modeloId, categoriaId, nombre)
                : repuestoService.listar();

        return ResponseEntity.ok(ApiResponse.ok("Repuestos obtenidos", repuestos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Repuesto>> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok("Repuesto obtenido", repuestoService.obtenerPorId(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> registrar(@Valid @RequestBody RepuestoRequest req) {
        var data = repuestoService.registrar(req);
        return ResponseEntity.ok(ApiResponse.ok("Repuesto registrado", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> modificar(
            @PathVariable Integer id,
            @Valid @RequestBody RepuestoRequest req) {
        String mensaje = repuestoService.modificar(id, req);
        return ResponseEntity.ok(ApiResponse.ok(mensaje, null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> eliminar(@PathVariable Integer id) {
        String mensaje = repuestoService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok(mensaje, null));
    }
}
