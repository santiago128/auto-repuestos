package com.repuestos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CambiarPasswordRequest {
    @NotBlank
    private String passwordActual;
    @NotBlank
    @Size(min = 6)
    private String nuevaPassword;
}
