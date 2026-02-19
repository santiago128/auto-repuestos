package com.repuestos.controller;

import com.repuestos.dto.ApiResponse;
import com.repuestos.model.Marca;
import com.repuestos.service.MarcaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marcas")
@RequiredArgsConstructor
public class MarcaController {

    private final MarcaService marcaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Marca>>> listar() {
        return ResponseEntity.ok(ApiResponse.ok("Marcas obtenidas", marcaService.listar()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> registrar(@RequestBody Map<String, String> body) {
        var data = marcaService.registrar(body.get("nombre"), body.get("paisOrigen"));
        return ResponseEntity.ok(ApiResponse.ok("Marca registrada", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> modificar(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String msg = marcaService.modificar(id, body.get("nombre"), body.get("paisOrigen"));
        return ResponseEntity.ok(ApiResponse.ok(msg, null));
    }
}
