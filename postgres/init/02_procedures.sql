-- ============================================================
-- PROCEDIMIENTOS ALMACENADOS
-- Plataforma de Repuestos de Vehículos
-- ============================================================

-- ============================================================
-- SP: Registrar Repuesto
-- ============================================================
CREATE OR REPLACE FUNCTION sp_registrar_repuesto(
    p_codigo       VARCHAR(50),
    p_nombre       VARCHAR(200),
    p_descripcion  TEXT,
    p_precio       DECIMAL(10, 2),
    p_stock        INTEGER,
    p_marca_id     INTEGER,
    p_modelo_id    INTEGER,
    p_categoria_id INTEGER,
    p_imagen_url   VARCHAR(500)
) RETURNS TABLE
          (
              r_id      INTEGER,
              r_codigo  VARCHAR,
              r_nombre  VARCHAR,
              r_mensaje VARCHAR
          )
AS
$$
DECLARE
    v_id INTEGER;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM marcas WHERE id = p_marca_id AND activo = TRUE) THEN
        RAISE EXCEPTION 'La marca con ID % no existe o está inactiva', p_marca_id;
    END IF;

    IF p_modelo_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM modelos WHERE id = p_modelo_id AND marca_id = p_marca_id AND activo = TRUE
    ) THEN
        RAISE EXCEPTION 'El modelo ID % no pertenece a la marca ID %', p_modelo_id, p_marca_id;
    END IF;

    INSERT INTO repuestos (codigo, nombre, descripcion, precio, stock, marca_id, modelo_id, categoria_id, imagen_url)
    VALUES (p_codigo, p_nombre, p_descripcion, p_precio, p_stock, p_marca_id, p_modelo_id, p_categoria_id,
            p_imagen_url)
    RETURNING repuestos.id INTO v_id;

    RETURN QUERY SELECT v_id, p_codigo, p_nombre, 'Repuesto registrado exitosamente'::VARCHAR;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'El código de repuesto "%" ya existe', p_codigo;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SP: Modificar Repuesto
-- ============================================================
CREATE OR REPLACE FUNCTION sp_modificar_repuesto(
    p_id           INTEGER,
    p_nombre       VARCHAR(200),
    p_descripcion  TEXT,
    p_precio       DECIMAL(10, 2),
    p_stock        INTEGER,
    p_marca_id     INTEGER,
    p_modelo_id    INTEGER,
    p_categoria_id INTEGER,
    p_imagen_url   VARCHAR(500)
) RETURNS TABLE
          (
              r_mensaje VARCHAR
          )
AS
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM repuestos WHERE id = p_id AND activo = TRUE) THEN
        RAISE EXCEPTION 'Repuesto ID % no encontrado o inactivo', p_id;
    END IF;

    UPDATE repuestos
    SET nombre       = p_nombre,
        descripcion  = p_descripcion,
        precio       = p_precio,
        stock        = p_stock,
        marca_id     = p_marca_id,
        modelo_id    = p_modelo_id,
        categoria_id = p_categoria_id,
        imagen_url   = p_imagen_url,
        updated_at   = NOW()
    WHERE id = p_id;

    RETURN QUERY SELECT 'Repuesto actualizado exitosamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SP: Eliminar Repuesto (eliminación lógica)
-- ============================================================
CREATE OR REPLACE FUNCTION sp_eliminar_repuesto(p_id INTEGER)
    RETURNS TABLE
            (
                r_mensaje VARCHAR
            )
AS
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM repuestos WHERE id = p_id AND activo = TRUE) THEN
        RAISE EXCEPTION 'Repuesto ID % no encontrado o ya eliminado', p_id;
    END IF;

    UPDATE repuestos
    SET activo     = FALSE,
        updated_at = NOW()
    WHERE id = p_id;

    RETURN QUERY SELECT 'Repuesto eliminado exitosamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

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

-- ============================================================
-- SP: Registrar Usuario
-- ============================================================
CREATE OR REPLACE FUNCTION sp_registrar_usuario(
    p_nombre    VARCHAR(100),
    p_apellido  VARCHAR(100),
    p_email     VARCHAR(150),
    p_password  VARCHAR(255),
    p_telefono  VARCHAR(20),
    p_direccion TEXT
) RETURNS TABLE
          (
              r_id      INTEGER,
              r_email   VARCHAR,
              r_mensaje VARCHAR
          )
AS
$$
DECLARE
    v_id INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM usuarios WHERE email = p_email) THEN
        RAISE EXCEPTION 'El correo "%" ya está registrado', p_email;
    END IF;

    INSERT INTO usuarios (nombre, apellido, email, password, telefono, direccion, rol_id)
    VALUES (p_nombre, p_apellido, p_email, p_password, p_telefono, p_direccion, 2)
    RETURNING usuarios.id INTO v_id;

    RETURN QUERY SELECT v_id, p_email, 'Usuario registrado exitosamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SP: Registrar Marca
-- ============================================================
CREATE OR REPLACE FUNCTION sp_registrar_marca(
    p_nombre      VARCHAR(100),
    p_pais_origen VARCHAR(100)
) RETURNS TABLE
          (
              r_id      INTEGER,
              r_nombre  VARCHAR,
              r_mensaje VARCHAR
          )
AS
$$
DECLARE
    v_id INTEGER;
BEGIN
    INSERT INTO marcas (nombre, pais_origen)
    VALUES (p_nombre, p_pais_origen)
    RETURNING marcas.id INTO v_id;

    RETURN QUERY SELECT v_id, p_nombre, 'Marca registrada exitosamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SP: Modificar Marca
-- ============================================================
CREATE OR REPLACE FUNCTION sp_modificar_marca(
    p_id          INTEGER,
    p_nombre      VARCHAR(100),
    p_pais_origen VARCHAR(100)
) RETURNS TABLE
          (
              r_mensaje VARCHAR
          )
AS
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM marcas WHERE id = p_id AND activo = TRUE) THEN
        RAISE EXCEPTION 'Marca ID % no encontrada', p_id;
    END IF;

    UPDATE marcas SET nombre = p_nombre, pais_origen = p_pais_origen WHERE id = p_id;

    RETURN QUERY SELECT 'Marca actualizada exitosamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SP: Registrar Modelo
-- ============================================================
CREATE OR REPLACE FUNCTION sp_registrar_modelo(
    p_nombre      VARCHAR(100),
    p_anio_inicio INTEGER,
    p_anio_fin    INTEGER,
    p_marca_id    INTEGER
) RETURNS TABLE
          (
              r_id      INTEGER,
              r_nombre  VARCHAR,
              r_mensaje VARCHAR
          )
AS
$$
DECLARE
    v_id INTEGER;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM marcas WHERE id = p_marca_id AND activo = TRUE) THEN
        RAISE EXCEPTION 'Marca ID % no encontrada', p_marca_id;
    END IF;

    INSERT INTO modelos (nombre, anio_inicio, anio_fin, marca_id)
    VALUES (p_nombre, p_anio_inicio, p_anio_fin, p_marca_id)
    RETURNING modelos.id INTO v_id;

    RETURN QUERY SELECT v_id, p_nombre, 'Modelo registrado exitosamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SP: Obtener facturas de un usuario
-- ============================================================
CREATE OR REPLACE FUNCTION sp_obtener_facturas_usuario(p_usuario_id INTEGER)
    RETURNS TABLE
            (
                r_id              INTEGER,
                r_numero_factura  VARCHAR,
                r_fecha           TIMESTAMP,
                r_subtotal        DECIMAL,
                r_iva             DECIMAL,
                r_total           DECIMAL,
                r_estado          VARCHAR,
                r_direccion_envio TEXT
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT f.id,
               f.numero_factura,
               f.fecha,
               f.subtotal,
               f.iva,
               f.total,
               f.estado::VARCHAR,
               f.direccion_envio
        FROM facturas f
        WHERE f.usuario_id = p_usuario_id
        ORDER BY f.fecha DESC;
END;
$$ LANGUAGE plpgsql;
