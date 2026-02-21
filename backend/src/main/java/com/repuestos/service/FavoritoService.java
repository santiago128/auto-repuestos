package com.repuestos.service;

import com.repuestos.model.Repuesto;
import com.repuestos.model.Usuario;
import com.repuestos.repository.FavoritoRepository;
import com.repuestos.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Map<String, Object> toggleFavorito(String email, Integer repuestoId) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Object raw = em.createNativeQuery(
                "SELECT * FROM sp_toggle_favorito(:usuarioId, :repuestoId)")
                .setParameter("usuarioId", usuario.getId())
                .setParameter("repuestoId", repuestoId)
                .getSingleResult();
        String accion = (raw instanceof Object[]) ? ((Object[]) raw)[0].toString() : raw.toString();

        Map<String, Object> resp = new HashMap<>();
        resp.put("accion", accion);
        resp.put("repuestoId", repuestoId);
        return resp;
    }

    public List<Repuesto> obtenerFavoritos(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return favoritoRepository.findByUsuarioId(usuario.getId()).stream()
                .map(f -> f.getRepuesto())
                .collect(Collectors.toList());
    }

    public boolean esFavorito(String email, Integer repuestoId) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return favoritoRepository.existsByUsuarioIdAndRepuestoId(usuario.getId(), repuestoId);
    }

    public List<Integer> obtenerIdsFavoritos(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return favoritoRepository.findRepuestoIdsByUsuarioId(usuario.getId());
    }
}
