package com.repuestos.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class RepuestoRequest {
    @NotBlank
    private String codigo;
    @NotBlank
    private String nombre;
    private String descripcion;
    @NotNull @DecimalMin("0.01")
    private BigDecimal precio;
    @NotNull @Min(0)
    private Integer stock;
    @NotNull
    private Integer marcaId;
    private Integer modeloId;
    private Integer categoriaId;
    private String imagenUrl;
}
