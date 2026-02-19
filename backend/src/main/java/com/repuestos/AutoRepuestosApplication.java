package com.repuestos;

import com.repuestos.model.Rol;
import com.repuestos.model.Usuario;
import com.repuestos.repository.RolRepository;
import com.repuestos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@RequiredArgsConstructor
public class AutoRepuestosApplication implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public static void main(String[] args) {
        SpringApplication.run(AutoRepuestosApplication.class, args);
    }

    @Override
    public void run(String... args) {
        // Crear usuario administrador por defecto si no existe
        if (usuarioRepository.findByEmail("admin@repuestos.com").isEmpty()) {
            Rol adminRol = rolRepository.findByNombre("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Rol ADMIN no encontrado en BD"));

            Usuario admin = new Usuario();
            admin.setNombre("Administrador");
            admin.setApellido("Sistema");
            admin.setEmail("admin@repuestos.com");
            admin.setPassword(passwordEncoder.encode("Admin123!"));
            admin.setRol(adminRol);
            admin.setActivo(true);
            usuarioRepository.save(admin);

            System.out.println("=== Usuario admin creado: admin@repuestos.com / Admin123! ===");
        }
    }
}
