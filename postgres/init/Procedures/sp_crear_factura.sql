-- ============================================================
-- SP: Crear Factura (con validación de stock y cálculo de IVA)
-- ============================================================
CREATE OR REPLACE FUNCTION sp_crear_factura(
    p_usuario_id      INTEGER,
    p_direccion_envio TEXT,
    p_observaciones   TEXT,
    p_items           JSONB  -- Array: [{repuesto_id: n, cantidad: n}, ...]
) RETURNS TABLE
          (
              r_factura_id     INTEGER,
              r_numero_factura VARCHAR,
              r_subtotal       DECIMAL,
              r_iva            DECIMAL,
              r_total          DECIMAL,
              r_mensaje        VARCHAR
          )
AS
$$
DECLARE
    v_factura_id  INTEGER;
    v_numero      VARCHAR;
    v_subtotal    DECIMAL := 0;
    v_iva         DECIMAL := 0;
    v_total       DECIMAL := 0;
    v_item        JSONB;
    v_precio      DECIMAL;
    v_stock       INTEGER;
    v_cantidad    INTEGER;
    v_repuesto_id INTEGER;
    v_item_sub    DECIMAL;
BEGIN
	/*--------------------------------------------------------------------------------------------------------------------------------------- 
* Nombre			: sp_crear_factura
* Desarrollado por	: <\A Santiago Barreiro A\> 
* Descripcion		: <\D Crear Factura (con validación de stock y cálculo de IVA) D\>
* Observaciones		: <\O  O\>
* Parametros		: <\P p_usuario_id      INTEGER,
						  p_direccion_envio TEXT,
						  p_observaciones   TEXT,
						  p_items           JSONB P\>
* Fecha Creacion	: <\FC 2025/11/30 FC\>
*---------------------------------------------------------------------------------------------------------------------------------------   
* DATOS DE MODIFICACION  
*---------------------------------------------------------------------------------------------------------------------------------------  
* Modificado Por	: <\AM	AM\>
* Descripcion		: <\DM	DM\>
* Nuevos Parametros	: <\PM	PM\>
* Nuevas Variables	: <\VM	VM\>
* Fecha Modificacion: <\FM	FM\>   
*---------------------------------------------------------------------------------------------------------------------------------------*/ 	
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = p_usuario_id AND activo = TRUE) THEN
        RAISE EXCEPTION 'Usuario ID % no encontrado', p_usuario_id;
    END IF;

    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'El carrito no puede estar vacío';
    END IF;

    -- Primera pasada: validar stock y calcular totales
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
            v_repuesto_id := (v_item ->> 'repuesto_id')::INTEGER;
            v_cantidad := (v_item ->> 'cantidad')::INTEGER;

            IF v_cantidad <= 0 THEN
                RAISE EXCEPTION 'Cantidad inválida para repuesto ID %', v_repuesto_id;
            END IF;

            SELECT precio, stock
            INTO v_precio, v_stock
            FROM repuestos
            WHERE id = v_repuesto_id
              AND activo = TRUE;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Repuesto ID % no encontrado o inactivo', v_repuesto_id;
            END IF;

            IF v_stock < v_cantidad THEN
                RAISE EXCEPTION 'Stock insuficiente para repuesto ID %. Disponible: %, Solicitado: %',
                    v_repuesto_id, v_stock, v_cantidad;
            END IF;

            v_subtotal := v_subtotal + (v_precio * v_cantidad);
        END LOOP;

    v_iva := ROUND(v_subtotal * 0.12, 2);
    v_total := ROUND(v_subtotal + v_iva, 2);
    v_subtotal := ROUND(v_subtotal, 2);

    -- Generar número de factura
    v_numero := 'FAC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                LPAD(NEXTVAL('seq_factura')::TEXT, 6, '0');

    -- Insertar cabecera de factura
    INSERT INTO facturas (numero_factura, usuario_id, subtotal, iva, total, estado, direccion_envio, observaciones)
    VALUES (v_numero, p_usuario_id, v_subtotal, v_iva, v_total, 'PAGADA', p_direccion_envio, p_observaciones)
    RETURNING facturas.id INTO v_factura_id;

    -- Segunda pasada: insertar detalles y descontar stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
            v_repuesto_id := (v_item ->> 'repuesto_id')::INTEGER;
            v_cantidad := (v_item ->> 'cantidad')::INTEGER;

            SELECT precio INTO v_precio FROM repuestos WHERE id = v_repuesto_id;
            v_item_sub := ROUND(v_precio * v_cantidad, 2);

            INSERT INTO detalle_factura (factura_id, repuesto_id, cantidad, precio_unitario, subtotal)
            VALUES (v_factura_id, v_repuesto_id, v_cantidad, v_precio, v_item_sub);

            UPDATE repuestos
            SET stock      = stock - v_cantidad,
                updated_at = NOW()
            WHERE id = v_repuesto_id;
        END LOOP;

    RETURN QUERY SELECT v_factura_id, v_numero, v_subtotal, v_iva, v_total,
                        'Factura creada exitosamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql;