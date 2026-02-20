package com.repuestos.service;

import com.repuestos.config.JwtUtil;
import com.repuestos.dto.LoginRequest;
import com.repuestos.dto.RegisterRequest;
import com.repuestos.model.PasswordResetToken;
import com.repuestos.model.Usuario;
import com.repuestos.repository.PasswordResetTokenRepository;
import com.repuestos.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    @PersistenceContext
    private EntityManager em;

    public Map<String, Object> login(LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(req.getEmail());
        Usuario usuario = usuarioRepository.findByEmail(req.getEmail()).orElseThrow();

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("rol", usuario.getRol().getNombre());
        extraClaims.put("nombre", usuario.getNombre() + " " + usuario.getApellido());
        extraClaims.put("id", usuario.getId());

        String token = jwtUtil.generateToken(userDetails, extraClaims);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("email", usuario.getEmail());
        response.put("nombre", usuario.getNombre());
        response.put("apellido", usuario.getApellido());
        response.put("rol", usuario.getRol().getNombre());
        response.put("id", usuario.getId());
        return response;
    }

    @Transactional
    public Map<String, Object> register(RegisterRequest req) {
        String hashedPassword = passwordEncoder.encode(req.getPassword());

        @SuppressWarnings("unchecked")
        var result = (Object[]) em.createNativeQuery(
                "SELECT * FROM sp_registrar_usuario(:nombre, :apellido, :email, :password, :telefono, :direccion)")
                .setParameter("nombre", req.getNombre())
                .setParameter("apellido", req.getApellido())
                .setParameter("email", req.getEmail())
                .setParameter("password", hashedPassword)
                .setParameter("telefono", req.getTelefono())
                .setParameter("direccion", req.getDireccion())
                .getSingleResult();

        Map<String, Object> response = new HashMap<>();
        response.put("id", result[0]);
        response.put("email", result[1]);
        response.put("mensaje", result[2]);
        return response;
    }

    @Transactional
    public String solicitarReset(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No existe una cuenta con ese correo"));

        tokenRepository.deleteByUsuarioId(usuario.getId());

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUsuario(usuario);
        resetToken.setToken(token);
        resetToken.setExpiraEn(LocalDateTime.now().plusHours(1));
        tokenRepository.save(resetToken);

        emailService.enviarResetPassword(usuario.getEmail(), token);
        return "Se ha enviado un enlace de recuperación a tu correo";
    }

    @Transactional
    public String resetPassword(String token, String nuevaPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido o no encontrado"));

        if (resetToken.getUsado()) {
            throw new RuntimeException("Este enlace ya fue utilizado");
        }
        if (resetToken.getExpiraEn().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El enlace de recuperación ha expirado");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);

        resetToken.setUsado(true);
        tokenRepository.save(resetToken);

        return "Contraseña actualizada exitosamente";
    }
}
