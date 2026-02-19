package com.repuestos.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "categorias")
@Data
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nombre;
    private String descripcion;
    private Boolean activo = true;
}
