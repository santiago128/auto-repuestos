package com.repuestos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CarritoItemDTO {
    @NotNull
    private Integer repuestoId;
    @NotNull @Min(1)
    private Integer cantidad;
}
