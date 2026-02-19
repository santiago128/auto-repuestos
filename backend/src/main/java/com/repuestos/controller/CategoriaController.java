package com.repuestos.controller;

import com.repuestos.dto.ApiResponse;
import com.repuestos.model.Categoria;
import com.repuestos.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Categoria>>> listar() {
        return ResponseEntity.ok(ApiResponse.ok("Categorias obtenidas", categoriaService.listar()));
    }
}
