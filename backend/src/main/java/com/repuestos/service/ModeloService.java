package com.repuestos.service;

import com.repuestos.model.Modelo;
import com.repuestos.repository.ModeloRepository;
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
public class ModeloService {

    private final ModeloRepository modeloRepository;

    @PersistenceContext
    private EntityManager em;

    public List<Modelo> listar() {
        return modeloRepository.findByActivoTrue();
    }

    public List<Modelo> listarPorMarca(Integer marcaId) {
        return modeloRepository.findByMarcaIdAndActivoTrue(marcaId);
    }

    @Transactional
    public Map<String, Object> registrar(String nombre, Integer anioInicio, Integer anioFin, Integer marcaId) {
        Object[] result = (Object[]) em.createNativeQuery(
                "SELECT * FROM sp_registrar_modelo(:nombre, :anioInicio, :anioFin, :marcaId)")
                .setParameter("nombre", nombre)
                .setParameter("anioInicio", anioInicio)
                .setParameter("anioFin", anioFin)
                .setParameter("marcaId", marcaId)
                .getSingleResult();

        Map<String, Object> response = new HashMap<>();
        response.put("id", result[0]);
        response.put("nombre", result[1]);
        response.put("mensaje", result[2]);
        return response;
    }
}
