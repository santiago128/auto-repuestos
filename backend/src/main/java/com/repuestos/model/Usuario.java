package com.repuestos.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Data
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nombre;
    private String apellido;
    private String email;
    private String password;
    private String telefono;
    private String direccion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rol_id")
    private Rol rol;

    private Boolean activo = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
