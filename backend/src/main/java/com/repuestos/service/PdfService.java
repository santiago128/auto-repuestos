package com.repuestos.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.repuestos.model.DetalleFactura;
import com.repuestos.model.Factura;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    // ── Paleta ────────────────────────────────────────────────────────────────
    private static final Color NAVY       = new Color(15,  28,  62);
    private static final Color NAVY_MID   = new Color(26,  47,  94);
    private static final Color BLUE_LIGHT = new Color(239, 246, 255);
    private static final Color AMBER      = new Color(245, 158,  11);
    private static final Color AMBER_DARK = new Color(217, 119,   6);
    private static final Color GRAY_LIGHT = new Color(248, 250, 252);
    private static final Color GRAY_MID   = new Color(226, 232, 240);
    private static final Color TEXT_1     = new Color(15,  23,  42);
    private static final Color TEXT_2     = new Color(71,  85, 105);
    private static final Color TEXT_3     = new Color(148, 163, 184);
    private static final Color SUCCESS    = new Color(5,  150, 105);

    // ── Fuentes ───────────────────────────────────────────────────────────────
    private static final Font F_LOGO      = new Font(Font.HELVETICA, 22, Font.BOLD,   Color.WHITE);
    private static final Font F_BRAND     = new Font(Font.HELVETICA, 17, Font.BOLD,   Color.WHITE);
    private static final Font F_TAGLINE   = new Font(Font.HELVETICA,  8, Font.NORMAL, TEXT_3);
    private static final Font F_INV_LABEL = new Font(Font.HELVETICA,  8, Font.BOLD,   TEXT_3);
    private static final Font F_INV_VAL   = new Font(Font.HELVETICA, 10, Font.BOLD,   Color.WHITE);
    private static final Font F_SEC_TITLE = new Font(Font.HELVETICA,  9, Font.BOLD,   NAVY_MID);
    private static final Font F_BODY      = new Font(Font.HELVETICA,  9, Font.NORMAL, TEXT_2);
    private static final Font F_BODY_BOLD = new Font(Font.HELVETICA,  9, Font.BOLD,   TEXT_1);
    private static final Font F_TH        = new Font(Font.HELVETICA,  9, Font.BOLD,   Color.WHITE);
    private static final Font F_TD        = new Font(Font.HELVETICA,  9, Font.NORMAL, TEXT_1);
    private static final Font F_TOTAL_LBL = new Font(Font.HELVETICA, 10, Font.BOLD,   NAVY_MID);
    private static final Font F_TOTAL_VAL = new Font(Font.HELVETICA, 12, Font.BOLD,   NAVY);
    private static final Font F_FOOTER    = new Font(Font.HELVETICA,  8, Font.ITALIC, TEXT_3);

    private static final DateTimeFormatter DT_FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // ─────────────────────────────────────────────────────────────────────────
    public byte[] generarFacturaPdf(Factura factura) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 40, 40, 40, 50);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            // 1. Cabecera con logo + nombre empresa + nº factura
            doc.add(buildHeader(factura));
            // 2. Barra ámbar decorativa
            doc.add(buildAmberBar());
            doc.add(Chunk.NEWLINE);
            // 3. Información de factura y cliente (dos columnas)
            doc.add(buildInfoSection(factura));
            doc.add(Chunk.NEWLINE);
            // 4. Tabla de productos
            doc.add(buildSectionTitle("Detalle de Productos"));
            doc.add(buildProductTable(factura));
            doc.add(Chunk.NEWLINE);
            // 5. Totales
            doc.add(buildTotals(factura));
            doc.add(Chunk.NEWLINE);
            // 6. Pie
            doc.add(buildFooter());

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el PDF de la factura", e);
        }
    }

    // ── CABECERA ─────────────────────────────────────────────────────────────
    private PdfPTable buildHeader(Factura factura) throws DocumentException {
        PdfPTable t = new PdfPTable(new float[]{1.1f, 2.8f, 2.5f});
        t.setWidthPercentage(100);
        t.setSpacingAfter(0);

        // Celda logo: fondo ámbar, iniciales "AR" en navy
        PdfPCell logo = new PdfPCell();
        logo.setBackgroundColor(AMBER);
        logo.setBorder(Rectangle.NO_BORDER);
        logo.setPadding(12);
        logo.setVerticalAlignment(Element.ALIGN_MIDDLE);
        Paragraph ar = new Paragraph("AR", F_LOGO);
        ar.setAlignment(Element.ALIGN_CENTER);
        logo.addElement(ar);
        Paragraph subAr = new Paragraph("AutoRepuestos", new Font(Font.HELVETICA, 5, Font.BOLD, NAVY));
        subAr.setAlignment(Element.ALIGN_CENTER);
        logo.addElement(subAr);
        t.addCell(logo);

        // Celda nombre empresa + tagline
        PdfPCell brand = new PdfPCell();
        brand.setBackgroundColor(NAVY);
        brand.setBorder(Rectangle.NO_BORDER);
        brand.setPaddingLeft(14);
        brand.setPaddingTop(12);
        brand.setPaddingBottom(10);
        brand.setVerticalAlignment(Element.ALIGN_MIDDLE);
        Paragraph company = new Paragraph("AutoRepuestos", F_BRAND);
        company.setSpacingAfter(3);
        brand.addElement(company);
        brand.addElement(new Paragraph("Tu tienda de repuestos automotrices de confianza", F_TAGLINE));
        brand.addElement(new Paragraph("contacto@autorepuestos.com  |  www.autorepuestos.com", F_TAGLINE));
        t.addCell(brand);

        // Celda número de factura (derecha)
        PdfPCell invoiceRef = new PdfPCell();
        invoiceRef.setBackgroundColor(NAVY_MID);
        invoiceRef.setBorder(Rectangle.NO_BORDER);
        invoiceRef.setPadding(12);
        invoiceRef.setVerticalAlignment(Element.ALIGN_MIDDLE);
        invoiceRef.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph facLabel = new Paragraph("FACTURA ELECTRÓNICA", F_INV_LABEL);
        facLabel.setAlignment(Element.ALIGN_RIGHT);
        invoiceRef.addElement(facLabel);

        Paragraph numPar = new Paragraph(
                factura.getNumeroFactura() != null ? factura.getNumeroFactura() : "-", F_INV_VAL);
        numPar.setAlignment(Element.ALIGN_RIGHT);
        invoiceRef.addElement(numPar);

        if (factura.getFecha() != null) {
            Paragraph fechaLabel = new Paragraph("Fecha emision:", F_INV_LABEL);
            fechaLabel.setAlignment(Element.ALIGN_RIGHT);
            fechaLabel.setSpacingBefore(6);
            invoiceRef.addElement(fechaLabel);
            Paragraph fechaVal = new Paragraph(factura.getFecha().format(DT_FMT),
                    new Font(Font.HELVETICA, 9, Font.NORMAL, Color.WHITE));
            fechaVal.setAlignment(Element.ALIGN_RIGHT);
            invoiceRef.addElement(fechaVal);
        }

        String estado = factura.getEstado() != null ? factura.getEstado().replace("_", " ") : "-";
        Paragraph estadoPar = new Paragraph("[ " + estado + " ]",
                new Font(Font.HELVETICA, 8, Font.BOLD, AMBER));
        estadoPar.setAlignment(Element.ALIGN_RIGHT);
        estadoPar.setSpacingBefore(6);
        invoiceRef.addElement(estadoPar);

        t.addCell(invoiceRef);
        return t;
    }

    // ── BARRA ÁMBAR ──────────────────────────────────────────────────────────
    private PdfPTable buildAmberBar() throws DocumentException {
        PdfPTable bar = new PdfPTable(1);
        bar.setWidthPercentage(100);
        bar.setSpacingAfter(0);
        PdfPCell c = new PdfPCell(new Phrase(""));
        c.setBackgroundColor(AMBER);
        c.setBorder(Rectangle.NO_BORDER);
        c.setFixedHeight(4f);
        bar.addCell(c);
        return bar;
    }

    // ── SECCIÓN INFO FACTURA + CLIENTE ────────────────────────────────────────
    private PdfPTable buildInfoSection(Factura factura) throws DocumentException {
        PdfPTable outer = new PdfPTable(new float[]{1f, 1f});
        outer.setWidthPercentage(100);
        outer.setSpacingBefore(4);

        // -- Columna izquierda: datos de la factura --
        PdfPTable leftBox = buildBox("Información de Factura");
        addBoxRow(leftBox, "Número de factura:", factura.getNumeroFactura());
        if (factura.getFecha() != null)
            addBoxRow(leftBox, "Fecha:", factura.getFecha().format(DT_FMT));
        addBoxRow(leftBox, "Estado:",
                factura.getEstado() != null ? factura.getEstado().replace("_", " ") : "-");
        if (factura.getDireccionEnvio() != null && !factura.getDireccionEnvio().isBlank())
            addBoxRow(leftBox, "Dirección de envío:", factura.getDireccionEnvio());

        PdfPCell leftCell = new PdfPCell(leftBox);
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.setPaddingRight(8);
        outer.addCell(leftCell);

        // -- Columna derecha: datos del cliente --
        PdfPTable rightBox = buildBox("Datos del Cliente");
        if (factura.getUsuario() != null) {
            addBoxRow(rightBox, "Nombre:",
                    factura.getUsuario().getNombre() + " " + factura.getUsuario().getApellido());
            addBoxRow(rightBox, "Correo:", factura.getUsuario().getEmail());
        }

        PdfPCell rightCell = new PdfPCell(rightBox);
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setPaddingLeft(8);
        outer.addCell(rightCell);

        return outer;
    }

    /** Crea un box (tabla interior) con fila de título */
    private PdfPTable buildBox(String title) throws DocumentException {
        PdfPTable t = new PdfPTable(new float[]{1.4f, 2f});
        t.setWidthPercentage(100);

        // Fila título (colspan 2)
        PdfPCell titleCell = new PdfPCell(new Phrase(title, F_SEC_TITLE));
        titleCell.setColspan(2);
        titleCell.setBackgroundColor(GRAY_MID);
        titleCell.setBorderColor(GRAY_MID);
        titleCell.setBorderWidth(.5f);
        titleCell.setPadding(7);
        t.addCell(titleCell);
        return t;
    }

    /** Añade una fila label-valor al box */
    private void addBoxRow(PdfPTable box, String label, String value) {
        PdfPCell lbl = new PdfPCell(new Phrase(label, F_BODY_BOLD));
        lbl.setBackgroundColor(BLUE_LIGHT);
        lbl.setBorderColor(GRAY_MID);
        lbl.setBorderWidth(.5f);
        lbl.setPadding(6);
        box.addCell(lbl);

        PdfPCell val = new PdfPCell(new Phrase(value != null ? value : "-", F_BODY));
        val.setBackgroundColor(Color.WHITE);
        val.setBorderColor(GRAY_MID);
        val.setBorderWidth(.5f);
        val.setPadding(6);
        box.addCell(val);
    }

    // ── TÍTULO DE SECCIÓN ─────────────────────────────────────────────────────
    private Paragraph buildSectionTitle(String text) {
        Paragraph p = new Paragraph(text, new Font(Font.HELVETICA, 10, Font.BOLD, NAVY_MID));
        p.setSpacingBefore(4);
        p.setSpacingAfter(5);
        return p;
    }

    // ── TABLA DE PRODUCTOS ────────────────────────────────────────────────────
    private PdfPTable buildProductTable(Factura factura) throws DocumentException {
        PdfPTable t = new PdfPTable(new float[]{4f, 1.2f, 1.8f, 1.8f});
        t.setWidthPercentage(100);

        addTh(t, "Producto / Descripción", Element.ALIGN_LEFT);
        addTh(t, "Cant.",    Element.ALIGN_CENTER);
        addTh(t, "Precio Unit.", Element.ALIGN_RIGHT);
        addTh(t, "Subtotal", Element.ALIGN_RIGHT);

        if (factura.getDetalles() != null) {
            boolean alt = false;
            for (DetalleFactura det : factura.getDetalles()) {
                Color rowBg = alt ? GRAY_LIGHT : Color.WHITE;
                String nombre = (det.getRepuesto() != null) ? det.getRepuesto().getNombre() : "-";
                addTd(t, nombre, rowBg, Element.ALIGN_LEFT);
                addTd(t, String.valueOf(det.getCantidad()), rowBg, Element.ALIGN_CENTER);
                addTd(t, String.format("$%.2f", det.getPrecioUnitario()), rowBg, Element.ALIGN_RIGHT);
                // Subtotal en negrita
                PdfPCell subCell = new PdfPCell(
                        new Phrase(String.format("$%.2f", det.getSubtotal()),
                                new Font(Font.HELVETICA, 9, Font.BOLD, TEXT_1)));
                subCell.setBackgroundColor(rowBg);
                subCell.setPadding(7);
                subCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                subCell.setBorderColor(GRAY_MID);
                subCell.setBorderWidth(.5f);
                t.addCell(subCell);
                alt = !alt;
            }
        }
        return t;
    }

    private void addTh(PdfPTable t, String text, int align) {
        PdfPCell c = new PdfPCell(new Phrase(text, F_TH));
        c.setBackgroundColor(NAVY_MID);
        c.setPadding(9);
        c.setHorizontalAlignment(align);
        c.setBorder(Rectangle.NO_BORDER);
        t.addCell(c);
    }

    private void addTd(PdfPTable t, String text, Color bg, int align) {
        PdfPCell c = new PdfPCell(new Phrase(text, F_TD));
        c.setBackgroundColor(bg);
        c.setPadding(7);
        c.setHorizontalAlignment(align);
        c.setBorderColor(GRAY_MID);
        c.setBorderWidth(.5f);
        t.addCell(c);
    }

    // ── BLOQUE DE TOTALES ─────────────────────────────────────────────────────
    private PdfPTable buildTotals(Factura factura) throws DocumentException {
        // Tabla de 2 columnas: vacío a la izquierda, totales a la derecha
        PdfPTable outer = new PdfPTable(new float[]{1f, 1f});
        outer.setWidthPercentage(100);

        PdfPCell empty = new PdfPCell(new Phrase(""));
        empty.setBorder(Rectangle.NO_BORDER);
        outer.addCell(empty);

        PdfPTable inner = new PdfPTable(new float[]{1.6f, 1f});
        inner.setWidthPercentage(100);

        addTotalRow(inner, "Subtotal:", String.format("$%.2f", factura.getSubtotal()), GRAY_LIGHT);
        addTotalRow(inner, "IVA (12%):", String.format("$%.2f", factura.getIva()), GRAY_LIGHT);

        // Separador dorado
        PdfPCell sep = new PdfPCell(new Phrase(""));
        sep.setBackgroundColor(AMBER);
        sep.setBorder(Rectangle.NO_BORDER);
        sep.setFixedHeight(3f);
        sep.setColspan(2);
        inner.addCell(sep);

        // Fila TOTAL (resaltada)
        PdfPCell totalLbl = new PdfPCell(new Phrase("TOTAL:", F_TOTAL_LBL));
        totalLbl.setBackgroundColor(BLUE_LIGHT);
        totalLbl.setBorderColor(NAVY_MID);
        totalLbl.setBorderWidth(1f);
        totalLbl.setPadding(10);
        totalLbl.setVerticalAlignment(Element.ALIGN_MIDDLE);
        inner.addCell(totalLbl);

        PdfPCell totalVal = new PdfPCell(
                new Phrase(String.format("$%.2f", factura.getTotal()), F_TOTAL_VAL));
        totalVal.setBackgroundColor(BLUE_LIGHT);
        totalVal.setBorderColor(NAVY_MID);
        totalVal.setBorderWidth(1f);
        totalVal.setPadding(10);
        totalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalVal.setVerticalAlignment(Element.ALIGN_MIDDLE);
        inner.addCell(totalVal);

        PdfPCell totalesCell = new PdfPCell(inner);
        totalesCell.setBorder(Rectangle.NO_BORDER);
        outer.addCell(totalesCell);

        return outer;
    }

    private void addTotalRow(PdfPTable t, String label, String value, Color bg) {
        PdfPCell lbl = new PdfPCell(new Phrase(label, F_BODY_BOLD));
        lbl.setBackgroundColor(bg);
        lbl.setBorderColor(GRAY_MID);
        lbl.setBorderWidth(.5f);
        lbl.setPadding(7);
        t.addCell(lbl);

        PdfPCell val = new PdfPCell(new Phrase(value, F_BODY));
        val.setBackgroundColor(bg);
        val.setBorderColor(GRAY_MID);
        val.setBorderWidth(.5f);
        val.setPadding(7);
        val.setHorizontalAlignment(Element.ALIGN_RIGHT);
        t.addCell(val);
    }

    // ── PIE DE PÁGINA ─────────────────────────────────────────────────────────
    private PdfPTable buildFooter() throws DocumentException {
        PdfPTable t = new PdfPTable(1);
        t.setWidthPercentage(100);
        t.setSpacingBefore(18);

        // Línea navy
        PdfPCell line = new PdfPCell(new Phrase(""));
        line.setBackgroundColor(NAVY);
        line.setBorder(Rectangle.NO_BORDER);
        line.setFixedHeight(2f);
        t.addCell(line);

        // Cuerpo del pie
        PdfPCell foot = new PdfPCell();
        foot.setBackgroundColor(GRAY_LIGHT);
        foot.setBorder(Rectangle.NO_BORDER);
        foot.setPadding(12);

        Paragraph thanks = new Paragraph(
                "¡Gracias por su compra en AutoRepuestos!", F_FOOTER);
        thanks.setAlignment(Element.ALIGN_CENTER);
        foot.addElement(thanks);

        Paragraph contact = new Paragraph(
                "Consultas: contacto@autorepuestos.com  |  Este documento es su comprobante oficial.",
                F_FOOTER);
        contact.setAlignment(Element.ALIGN_CENTER);
        foot.addElement(contact);

        t.addCell(foot);
        return t;
    }
}
