package com.repuestos.repository;

import com.repuestos.model.Repuesto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RepuestoRepository extends JpaRepository<Repuesto, Integer> {
    List<Repuesto> findByActivoTrue();

    @Query(value = "SELECT r.* FROM repuestos r WHERE r.activo = true " +
           "AND (CAST(:marcaId AS INTEGER) IS NULL OR r.marca_id = CAST(:marcaId AS INTEGER)) " +
           "AND (CAST(:modeloId AS INTEGER) IS NULL OR r.modelo_id = CAST(:modeloId AS INTEGER)) " +
           "AND (CAST(:categoriaId AS INTEGER) IS NULL OR r.categoria_id = CAST(:categoriaId AS INTEGER)) " +
           "AND (CAST(:nombre AS VARCHAR) IS NULL OR LOWER(r.nombre) LIKE LOWER(CONCAT('%', CAST(:nombre AS VARCHAR), '%')))",
           nativeQuery = true)
    List<Repuesto> buscarConFiltros(
            @Param("marcaId") Integer marcaId,
            @Param("modeloId") Integer modeloId,
            @Param("categoriaId") Integer categoriaId,
            @Param("nombre") String nombre);
}
