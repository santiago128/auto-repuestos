package com.repuestos.service;

import com.repuestos.model.DetalleFactura;
import com.repuestos.model.Factura;
import com.repuestos.model.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Async
    public void enviarResetPassword(String email, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Recuperación de contraseña - AutoRepuestos");
            String link = "http://localhost:4200/reset-password?token=" + token;
            String html = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;color:#333'>" +
                    "<div style='max-width:500px;margin:0 auto;padding:20px'>" +
                    "<h2 style='color:#1565C0'>Recuperar contraseña</h2>" +
                    "<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>" +
                    "<p>Haz clic en el siguiente botón para crear una nueva contraseña. " +
                    "Este enlace es válido por <strong>1 hora</strong>.</p>" +
                    "<div style='text-align:center;margin:24px 0'>" +
                    "<a href='" + link + "' style='background:#1565C0;color:#fff;padding:12px 28px;" +
                    "border-radius:6px;text-decoration:none;font-weight:bold;font-size:1em'>" +
                    "Restablecer contraseña</a></div>" +
                    "<p style='color:#888;font-size:.85em'>Si no solicitaste este cambio, ignora este correo.</p>" +
                    "</div></body></html>";
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Correo de reset enviado a {}", email);
        } catch (MessagingException e) {
            log.error("Error al enviar correo de reset a {}: {}", email, e.getMessage());
        }
    }

    @Async
    public void enviarConfirmacionCompra(Usuario usuario, Factura factura,
                                          String numeroFactura, BigDecimal subtotal,
                                          BigDecimal iva, BigDecimal total) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(usuario.getEmail());
            helper.setSubject("Confirmación de Compra - " + numeroFactura);
            helper.setText(buildEmailHtml(usuario, factura, numeroFactura, subtotal, iva, total), true);

            mailSender.send(message);
            log.info("Correo de confirmación enviado a {}", usuario.getEmail());
        } catch (MessagingException e) {
            log.error("Error al enviar correo a {}: {}", usuario.getEmail(), e.getMessage());
        }
    }

    private String buildEmailHtml(Usuario usuario, Factura factura,
                                   String numeroFactura, BigDecimal subtotal,
                                   BigDecimal iva, BigDecimal total) {
        StringBuilder detalles = new StringBuilder();
        if (factura != null && factura.getDetalles() != null) {
            for (DetalleFactura det : factura.getDetalles()) {
                detalles.append(String.format(
                    "<tr>" +
                    "<td style='padding:8px;border:1px solid #ddd'>%s</td>" +
                    "<td style='padding:8px;border:1px solid #ddd;text-align:center'>%d</td>" +
                    "<td style='padding:8px;border:1px solid #ddd;text-align:right'>$%.2f</td>" +
                    "<td style='padding:8px;border:1px solid #ddd;text-align:right'>$%.2f</td>" +
                    "</tr>",
                    det.getRepuesto().getNombre(),
                    det.getCantidad(),
                    det.getPrecioUnitario(),
                    det.getSubtotal()
                ));
            }
        }

        return "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;color:#333'>" +
               "<div style='max-width:600px;margin:0 auto;padding:20px'>" +
               "<h2 style='color:#1565C0'>¡Gracias por tu compra, " + usuario.getNombre() + "!</h2>" +
               "<p>Tu pedido ha sido procesado exitosamente.</p>" +
               "<hr style='border-color:#eee'/>" +
               "<h3>Detalle de Factura: <span style='color:#1565C0'>" + numeroFactura + "</span></h3>" +
               "<table style='width:100%;border-collapse:collapse;margin-top:10px'>" +
               "<thead><tr style='background:#1565C0;color:#fff'>" +
               "<th style='padding:10px;text-align:left'>Repuesto</th>" +
               "<th style='padding:10px'>Cantidad</th>" +
               "<th style='padding:10px;text-align:right'>Precio Unit.</th>" +
               "<th style='padding:10px;text-align:right'>Subtotal</th>" +
               "</tr></thead><tbody>" + detalles +
               "</tbody></table>" +
               "<div style='margin-top:15px;text-align:right'>" +
               "<p>Subtotal: <strong>$" + String.format("%.2f", subtotal) + "</strong></p>" +
               "<p>IVA (12%): <strong>$" + String.format("%.2f", iva) + "</strong></p>" +
               "<p style='font-size:1.2em;color:#1565C0'>TOTAL: <strong>$" + String.format("%.2f", total) + "</strong></p>" +
               "</div>" +
               "<hr style='border-color:#eee'/>" +
               "<p style='color:#888;font-size:0.85em'>Si tienes alguna duda, contáctanos respondiendo este correo.</p>" +
               "</div></body></html>";
    }
}
