-- ============================================================
-- NUEVAS FUNCIONALIDADES: Tablas y Stored Procedures
-- ============================================================

-- ============================================================
-- TABLA: Tokens de recuperación de contraseña
-- ============================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         SERIAL PRIMARY KEY,
    usuario_id INTEGER      NOT NULL REFERENCES usuarios(id),
    token      VARCHAR(255) UNIQUE NOT NULL,
    expira_en  TIMESTAMP    NOT NULL,
    usado      BOOLEAN      DEFAULT FALSE,
    created_at TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- TABLA: Favoritos (usuario ↔ repuesto, sin duplicados)
-- ============================================================
CREATE TABLE IF NOT EXISTS favoritos (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER   NOT NULL REFERENCES usuarios(id),
    repuesto_id INTEGER   NOT NULL REFERENCES repuestos(id),
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario_id, repuesto_id)
);

-- ============================================================
-- SP: Cambiar estado de factura
-- ============================================================
CREATE OR REPLACE FUNCTION sp_cambiar_estado_factura(
    p_factura_id  INTEGER,
    p_nuevo_estado VARCHAR(20)
) RETURNS TABLE (r_mensaje VARCHAR)
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM facturas WHERE id = p_factura_id) THEN
        RAISE EXCEPTION 'Factura ID % no encontrada', p_factura_id;
    END IF;

    IF p_nuevo_estado NOT IN ('PAGADA', 'EN_PROCESO', 'ENVIADO', 'ENTREGADO', 'CANCELADO') THEN
        RAISE EXCEPTION 'Estado "%" no válido. Estados permitidos: PAGADA, EN_PROCESO, ENVIADO, ENTREGADO, CANCELADO', p_nuevo_estado;
    END IF;

    UPDATE facturas SET estado = p_nuevo_estado WHERE id = p_factura_id;

    RETURN QUERY SELECT ('Estado actualizado a ' || p_nuevo_estado)::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SP: Toggle favorito (agregar o eliminar)
-- ============================================================
CREATE OR REPLACE FUNCTION sp_toggle_favorito(
    p_usuario_id  INTEGER,
    p_repuesto_id INTEGER
) RETURNS TABLE (r_accion VARCHAR)
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM favoritos WHERE usuario_id = p_usuario_id AND repuesto_id = p_repuesto_id) THEN
        DELETE FROM favoritos WHERE usuario_id = p_usuario_id AND repuesto_id = p_repuesto_id;
        RETURN QUERY SELECT 'ELIMINADO'::VARCHAR;
    ELSE
        INSERT INTO favoritos (usuario_id, repuesto_id) VALUES (p_usuario_id, p_repuesto_id);
        RETURN QUERY SELECT 'AGREGADO'::VARCHAR;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SP: Búsqueda de repuestos con paginación
-- ============================================================
CREATE OR REPLACE FUNCTION sp_buscar_repuestos_paginado(
    p_marca_id     INTEGER,
    p_modelo_id    INTEGER,
    p_categoria_id INTEGER,
    p_nombre       VARCHAR,
    p_limit        INTEGER DEFAULT 12,
    p_offset       INTEGER DEFAULT 0
) RETURNS TABLE (
    r_id           INTEGER,
    r_codigo       VARCHAR,
    r_nombre       VARCHAR,
    r_descripcion  TEXT,
    r_precio       DECIMAL,
    r_stock        INTEGER,
    r_marca_id     INTEGER,
    r_modelo_id    INTEGER,
    r_categoria_id INTEGER,
    r_imagen_url   VARCHAR,
    r_activo       BOOLEAN,
    r_total        BIGINT
)
AS $$
BEGIN
    RETURN QUERY
        SELECT
            r.id,
            r.codigo,
            r.nombre,
            r.descripcion,
            r.precio,
            r.stock,
            r.marca_id,
            r.modelo_id,
            r.categoria_id,
            r.imagen_url,
            r.activo,
            COUNT(*) OVER() AS total
        FROM repuestos r
        WHERE r.activo = TRUE
          AND (p_marca_id IS NULL OR r.marca_id = p_marca_id)
          AND (p_modelo_id IS NULL OR r.modelo_id = p_modelo_id)
          AND (p_categoria_id IS NULL OR r.categoria_id = p_categoria_id)
          AND (p_nombre IS NULL OR LOWER(r.nombre) LIKE LOWER('%' || p_nombre || '%'))
        ORDER BY r.nombre
        LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
