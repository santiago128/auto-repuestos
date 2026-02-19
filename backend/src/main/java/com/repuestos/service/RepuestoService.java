package com.repuestos.service;

import com.repuestos.dto.RepuestoRequest;
import com.repuestos.model.Repuesto;
import com.repuestos.repository.RepuestoRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RepuestoService {

    private final RepuestoRepository repuestoRepository;

    @PersistenceContext
    private EntityManager em;

    public List<Repuesto> listar() {
        return repuestoRepository.findByActivoTrue();
    }

    public List<Repuesto> buscar(Integer marcaId, Integer modeloId, Integer categoriaId, String nombre) {
        return repuestoRepository.buscarConFiltros(marcaId, modeloId, categoriaId, nombre);
    }

    public Repuesto obtenerPorId(Integer id) {
        return repuestoRepository.findById(id)
                .filter(r -> r.getActivo())
                .orElseThrow(() -> new RuntimeException("Repuesto no encontrado"));
    }

    @Transactional
    public Map<String, Object> registrar(RepuestoRequest req) {
        @SuppressWarnings("unchecked")
        Object[] result = (Object[]) em.createNativeQuery(
                "SELECT * FROM sp_registrar_repuesto(:codigo, :nombre, :descripcion, " +
                ":precio, :stock, :marcaId, :modeloId, :categoriaId, :imagenUrl)")
                .setParameter("codigo", req.getCodigo())
                .setParameter("nombre", req.getNombre())
                .setParameter("descripcion", req.getDescripcion())
                .setParameter("precio", req.getPrecio())
                .setParameter("stock", req.getStock())
                .setParameter("marcaId", req.getMarcaId())
                .setParameter("modeloId", req.getModeloId())
                .setParameter("categoriaId", req.getCategoriaId())
                .setParameter("imagenUrl", req.getImagenUrl())
                .getSingleResult();

        Map<String, Object> response = new HashMap<>();
        response.put("id", result[0]);
        response.put("codigo", result[1]);
        response.put("nombre", result[2]);
        response.put("mensaje", result[3]);
        return response;
    }

    @Transactional
    public String modificar(Integer id, RepuestoRequest req) {
        return (String) em.createNativeQuery(
                "SELECT * FROM sp_modificar_repuesto(:id, :nombre, :descripcion, " +
                ":precio, :stock, :marcaId, :modeloId, :categoriaId, :imagenUrl)")
                .setParameter("id", id)
                .setParameter("nombre", req.getNombre())
                .setParameter("descripcion", req.getDescripcion())
                .setParameter("precio", req.getPrecio())
                .setParameter("stock", req.getStock())
                .setParameter("marcaId", req.getMarcaId())
                .setParameter("modeloId", req.getModeloId())
                .setParameter("categoriaId", req.getCategoriaId())
                .setParameter("imagenUrl", req.getImagenUrl())
                .getSingleResult();
    }

    @Transactional
    public String eliminar(Integer id) {
        return (String) em.createNativeQuery(
                "SELECT * FROM sp_eliminar_repuesto(:id)")
                .setParameter("id", id)
                .getSingleResult();
    }
}
