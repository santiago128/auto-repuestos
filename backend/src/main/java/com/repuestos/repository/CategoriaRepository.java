package com.repuestos.repository;

import com.repuestos.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
    List<Categoria> findByActivoTrue();
}
