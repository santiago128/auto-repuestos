package com.repuestos.service;

import com.repuestos.model.Categoria;
import com.repuestos.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;

    public List<Categoria> listar() {
        return categoriaRepository.findByActivoTrue();
    }
}
