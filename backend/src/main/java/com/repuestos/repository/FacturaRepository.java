package com.repuestos.repository;

import com.repuestos.model.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FacturaRepository extends JpaRepository<Factura, Integer> {
    List<Factura> findByUsuarioIdOrderByFechaDesc(Integer usuarioId);
}
