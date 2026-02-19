package com.repuestos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class FacturaRequest {
    @NotEmpty
    @Valid
    private List<CarritoItemDTO> items;
    private String direccionEnvio;
    private String observaciones;
}
