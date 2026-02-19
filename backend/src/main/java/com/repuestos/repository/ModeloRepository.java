package com.repuestos.repository;

import com.repuestos.model.Modelo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ModeloRepository extends JpaRepository<Modelo, Integer> {
    List<Modelo> findByActivoTrue();
    List<Modelo> findByMarcaIdAndActivoTrue(Integer marcaId);
}
