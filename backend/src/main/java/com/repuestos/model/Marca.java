package com.repuestos.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "marcas")
@Data
public class Marca {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nombre;

    @Column(name = "pais_origen")
    private String paisOrigen;

    private Boolean activo = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
