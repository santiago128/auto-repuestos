package com.repuestos.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "facturas")
@Data
public class Factura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "numero_factura")
    private String numeroFactura;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private LocalDateTime fecha;
    private BigDecimal subtotal;
    private BigDecimal iva;
    private BigDecimal total;
    private String estado;

    @Column(name = "direccion_envio")
    private String direccionEnvio;

    private String observaciones;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "factura", fetch = FetchType.EAGER)
    private List<DetalleFactura> detalles;
}
