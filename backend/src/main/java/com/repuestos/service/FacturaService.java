package com.repuestos.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.repuestos.dto.CarritoItemDTO;
import com.repuestos.dto.FacturaRequest;
import com.repuestos.model.Factura;
import com.repuestos.model.Usuario;
import com.repuestos.repository.FacturaRepository;
import com.repuestos.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FacturaService {

    private final FacturaRepository facturaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Map<String, Object> crearFactura(String email, FacturaRequest req) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Construir JSON para el stored procedure
        List<Map<String, Object>> items = req.getItems().stream()
                .map(item -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("repuesto_id", item.getRepuestoId());
                    m.put("cantidad", item.getCantidad());
                    return m;
                }).toList();

        String itemsJson;
        try {
            itemsJson = objectMapper.writeValueAsString(items);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al procesar items del carrito");
        }

        Object[] result = (Object[]) em.createNativeQuery(
                "SELECT * FROM sp_crear_factura(:usuarioId, :direccion, :observaciones, CAST(:items AS jsonb))")
                .setParameter("usuarioId", usuario.getId())
                .setParameter("direccion", req.getDireccionEnvio())
                .setParameter("observaciones", req.getObservaciones())
                .setParameter("items", itemsJson)
                .getSingleResult();

        Integer facturaId    = (Integer) result[0];
        String  numeroFac    = (String)  result[1];
        BigDecimal subtotal  = (BigDecimal) result[2];
        BigDecimal iva       = (BigDecimal) result[3];
        BigDecimal total     = (BigDecimal) result[4];
        String  mensaje      = (String)  result[5];

        // Enviar correo de confirmación
        Factura factura = facturaRepository.findById(facturaId).orElse(null);
        emailService.enviarConfirmacionCompra(usuario, factura, numeroFac, subtotal, iva, total);

        Map<String, Object> response = new HashMap<>();
        response.put("facturaId", facturaId);
        response.put("numeroFactura", numeroFac);
        response.put("subtotal", subtotal);
        response.put("iva", iva);
        response.put("total", total);
        response.put("mensaje", mensaje);
        return response;
    }

    public List<Factura> misFacturas(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return facturaRepository.findByUsuarioIdOrderByFechaDesc(usuario.getId());
    }

    public Factura obtenerFactura(Integer id, String email) {
        Factura factura = facturaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada"));
        if (!factura.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No autorizado para ver esta factura");
        }
        return factura;
    }
}
