package com.repuestos.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "repuestos")
@Data
public class Repuesto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String codigo;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer stock;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "marca_id")
    private Marca marca;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "modelo_id")
    private Modelo modelo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Column(name = "imagen_url")
    private String imagenUrl;

    private Boolean activo = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
