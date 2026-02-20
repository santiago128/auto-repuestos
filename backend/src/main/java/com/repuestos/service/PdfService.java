package com.repuestos.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.repuestos.model.DetalleFactura;
import com.repuestos.model.Factura;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    private static final Font FONT_TITLE = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(21, 101, 192));
    private static final Font FONT_HEADER = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
    private static final Font FONT_BODY = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.BLACK);
    private static final Font FONT_BOLD = new Font(Font.HELVETICA, 10, Font.BOLD, Color.BLACK);
    private static final Font FONT_TOTAL = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(21, 101, 192));

    public byte[] generarFacturaPdf(Factura factura) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 54, 36);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            // Cabecera
            Paragraph titulo = new Paragraph("AutoRepuestos", FONT_TITLE);
            titulo.setAlignment(Element.ALIGN_LEFT);
            doc.add(titulo);

            Paragraph subtitulo = new Paragraph("Factura de Compra", new Font(Font.HELVETICA, 12, Font.NORMAL, Color.GRAY));
            subtitulo.setSpacingAfter(10);
            doc.add(subtitulo);

            // Línea separadora
            doc.add(new Paragraph("_".repeat(80)));

            // Datos de la factura
            Paragraph datosFac = new Paragraph();
            datosFac.setSpacingBefore(10);
            datosFac.add(new Chunk("Nº Factura: ", FONT_BOLD));
            datosFac.add(new Chunk(factura.getNumeroFactura(), FONT_BODY));
            datosFac.add(Chunk.NEWLINE);
            if (factura.getFecha() != null) {
                datosFac.add(new Chunk("Fecha: ", FONT_BOLD));
                datosFac.add(new Chunk(factura.getFecha().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), FONT_BODY));
                datosFac.add(Chunk.NEWLINE);
            }
            datosFac.add(new Chunk("Cliente: ", FONT_BOLD));
            datosFac.add(new Chunk(factura.getUsuario().getNombre() + " " + factura.getUsuario().getApellido(), FONT_BODY));
            datosFac.add(Chunk.NEWLINE);
            datosFac.add(new Chunk("Email: ", FONT_BOLD));
            datosFac.add(new Chunk(factura.getUsuario().getEmail(), FONT_BODY));
            if (factura.getDireccionEnvio() != null && !factura.getDireccionEnvio().isEmpty()) {
                datosFac.add(Chunk.NEWLINE);
                datosFac.add(new Chunk("Dirección de envío: ", FONT_BOLD));
                datosFac.add(new Chunk(factura.getDireccionEnvio(), FONT_BODY));
            }
            datosFac.add(new Chunk("   Estado: ", FONT_BOLD));
            datosFac.add(new Chunk(factura.getEstado(), FONT_BODY));
            datosFac.setSpacingAfter(16);
            doc.add(datosFac);

            // Tabla de detalles
            PdfPTable tabla = new PdfPTable(new float[]{4, 1.5f, 2, 2});
            tabla.setWidthPercentage(100);
            tabla.setSpacingBefore(10);

            Color colorHeader = new Color(21, 101, 192);
            addHeaderCell(tabla, "Producto", colorHeader);
            addHeaderCell(tabla, "Cantidad", colorHeader);
            addHeaderCell(tabla, "Precio Unit.", colorHeader);
            addHeaderCell(tabla, "Subtotal", colorHeader);

            if (factura.getDetalles() != null) {
                boolean alternado = false;
                for (DetalleFactura det : factura.getDetalles()) {
                    Color bg = alternado ? new Color(240, 245, 255) : Color.WHITE;
                    addBodyCell(tabla, det.getRepuesto().getNombre(), bg, Element.ALIGN_LEFT);
                    addBodyCell(tabla, String.valueOf(det.getCantidad()), bg, Element.ALIGN_CENTER);
                    addBodyCell(tabla, String.format("$%.2f", det.getPrecioUnitario()), bg, Element.ALIGN_RIGHT);
                    addBodyCell(tabla, String.format("$%.2f", det.getSubtotal()), bg, Element.ALIGN_RIGHT);
                    alternado = !alternado;
                }
            }
            doc.add(tabla);

            // Totales
            Paragraph totales = new Paragraph();
            totales.setSpacingBefore(16);
            totales.setAlignment(Element.ALIGN_RIGHT);
            totales.add(new Chunk("Subtotal: $" + String.format("%.2f", factura.getSubtotal()) + "\n", FONT_BODY));
            totales.add(new Chunk("IVA (12%): $" + String.format("%.2f", factura.getIva()) + "\n", FONT_BODY));
            totales.add(new Chunk("TOTAL: $" + String.format("%.2f", factura.getTotal()), FONT_TOTAL));
            doc.add(totales);

            // Pie de página
            Paragraph pie = new Paragraph("\n¡Gracias por su compra!\nSi tiene consultas, contáctenos por correo.",
                    new Font(Font.HELVETICA, 9, Font.ITALIC, Color.GRAY));
            pie.setSpacingBefore(20);
            pie.setAlignment(Element.ALIGN_CENTER);
            doc.add(pie);

            doc.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error al generar el PDF de la factura", e);
        }
    }

    private void addHeaderCell(PdfPTable tabla, String texto, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, FONT_HEADER));
        cell.setBackgroundColor(bg);
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        tabla.addCell(cell);
    }

    private void addBodyCell(PdfPTable tabla, String texto, Color bg, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, FONT_BODY));
        cell.setBackgroundColor(bg);
        cell.setPadding(6);
        cell.setHorizontalAlignment(alignment);
        tabla.addCell(cell);
    }
}
