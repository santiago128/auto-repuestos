package com.repuestos.repository;

import com.repuestos.model.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FavoritoRepository extends JpaRepository<Favorito, Integer> {
    List<Favorito> findByUsuarioId(Integer usuarioId);

    boolean existsByUsuarioIdAndRepuestoId(Integer usuarioId, Integer repuestoId);

    @Query("SELECT f.repuesto.id FROM Favorito f WHERE f.usuario.id = :usuarioId")
    List<Integer> findRepuestoIdsByUsuarioId(@Param("usuarioId") Integer usuarioId);
}
