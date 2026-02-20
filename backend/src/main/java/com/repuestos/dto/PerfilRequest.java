package com.repuestos.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PerfilRequest {
    @NotBlank
    private String nombre;
    @NotBlank
    private String apellido;
    private String telefono;
    private String direccion;
}
