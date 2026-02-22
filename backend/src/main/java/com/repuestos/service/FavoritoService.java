package com.repuestos.service;

import com.repuestos.model.Favorito;
import com.repuestos.model.Repuesto;
import com.repuestos.model.Usuario;
import com.repuestos.repository.FavoritoRepository;
import com.repuestos.repository.RepuestoRepository;
import com.repuestos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final RepuestoRepository repuestoRepository;

    @Transactional
    public Map<String, Object> toggleFavorito(String email, Integer repuestoId) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String accion;
        if (favoritoRepository.existsByUsuarioIdAndRepuestoId(usuario.getId(), repuestoId)) {
            favoritoRepository.deleteByUsuarioIdAndRepuestoId(usuario.getId(), repuestoId);
            accion = "ELIMINADO";
        } else {
            Repuesto repuesto = repuestoRepository.findById(repuestoId)
                    .orElseThrow(() -> new RuntimeException("Repuesto no encontrado"));
            Favorito favorito = new Favorito();
            favorito.setUsuario(usuario);
            favorito.setRepuesto(repuesto);
            favoritoRepository.save(favorito);
            accion = "AGREGADO";
        }

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
