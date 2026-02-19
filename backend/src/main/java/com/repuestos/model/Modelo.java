package com.repuestos.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "modelos")
@Data
public class Modelo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nombre;

    @Column(name = "anio_inicio")
    private Integer anioInicio;

    @Column(name = "anio_fin")
    private Integer anioFin;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "marca_id")
    private Marca marca;

    private Boolean activo = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
