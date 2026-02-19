package com.repuestos.controller;

import com.repuestos.dto.ApiResponse;
import com.repuestos.model.Modelo;
import com.repuestos.service.ModeloService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/modelos")
@RequiredArgsConstructor
public class ModeloController {

    private final ModeloService modeloService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Modelo>>> listar(
            @RequestParam(required = false) Integer marcaId) {
        List<Modelo> modelos = marcaId != null
                ? modeloService.listarPorMarca(marcaId)
                : modeloService.listar();
        return ResponseEntity.ok(ApiResponse.ok("Modelos obtenidos", modelos));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> registrar(@RequestBody Map<String, Object> body) {
        var data = modeloService.registrar(
                (String) body.get("nombre"),
                body.get("anioInicio") != null ? (Integer) body.get("anioInicio") : null,
                body.get("anioFin") != null ? (Integer) body.get("anioFin") : null,
                (Integer) body.get("marcaId"));
        return ResponseEntity.ok(ApiResponse.ok("Modelo registrado", data));
    }
}
