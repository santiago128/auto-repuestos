package com.repuestos.service;

import com.repuestos.dto.CambiarPasswordRequest;
import com.repuestos.dto.PerfilRequest;
import com.repuestos.model.Usuario;
import com.repuestos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public Map<String, Object> getPerfil(String email) {
        Usuario u = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Map<String, Object> perfil = new HashMap<>();
        perfil.put("id", u.getId());
        perfil.put("nombre", u.getNombre());
        perfil.put("apellido", u.getApellido());
        perfil.put("email", u.getEmail());
        perfil.put("telefono", u.getTelefono());
        perfil.put("direccion", u.getDireccion());
        perfil.put("rol", u.getRol().getNombre());
        return perfil;
    }

    @Transactional
    public Map<String, Object> actualizarPerfil(String email, PerfilRequest req) {
        Usuario u = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        u.setNombre(req.getNombre());
        u.setApellido(req.getApellido());
        u.setTelefono(req.getTelefono());
        u.setDireccion(req.getDireccion());
        usuarioRepository.save(u);
        Map<String, Object> resp = new HashMap<>();
        resp.put("mensaje", "Perfil actualizado exitosamente");
        resp.put("nombre", u.getNombre());
        resp.put("apellido", u.getApellido());
        return resp;
    }

    @Transactional
    public String cambiarPassword(String email, CambiarPasswordRequest req) {
        Usuario u = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (!passwordEncoder.matches(req.getPasswordActual(), u.getPassword())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }
        u.setPassword(passwordEncoder.encode(req.getNuevaPassword()));
        usuarioRepository.save(u);
        return "Contraseña actualizada exitosamente";
    }
}
