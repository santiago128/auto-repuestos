package com.repuestos.service;

import com.repuestos.model.Marca;
import com.repuestos.repository.MarcaRepository;
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
public class MarcaService {

    private final MarcaRepository marcaRepository;

    @PersistenceContext
    private EntityManager em;

    public List<Marca> listar() {
        return marcaRepository.findByActivoTrue();
    }

    @Transactional
    public Map<String, Object> registrar(String nombre, String paisOrigen) {
        Object[] result = (Object[]) em.createNativeQuery(
                "SELECT * FROM sp_registrar_marca(:nombre, :paisOrigen)")
                .setParameter("nombre", nombre)
                .setParameter("paisOrigen", paisOrigen)
                .getSingleResult();

        Map<String, Object> response = new HashMap<>();
        response.put("id", result[0]);
        response.put("nombre", result[1]);
        response.put("mensaje", result[2]);
        return response;
    }

    @Transactional
    public String modificar(Integer id, String nombre, String paisOrigen) {
        return (String) em.createNativeQuery(
                "SELECT * FROM sp_modificar_marca(:id, :nombre, :paisOrigen)")
                .setParameter("id", id)
                .setParameter("nombre", nombre)
                .setParameter("paisOrigen", paisOrigen)
                .getSingleResult();
    }
}
