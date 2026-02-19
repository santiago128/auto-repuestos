package com.repuestos.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_factura")
@Data
public class DetalleFactura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "factura_id")
    private Factura factura;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "repuesto_id")
    private Repuesto repuesto;

    private Integer cantidad;

    @Column(name = "precio_unitario")
    private BigDecimal precioUnitario;

    private BigDecimal subtotal;
}
