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
	/*--------------------------------------------------------------------------------------------------------------------------------------- 
* Nombre			: sp_buscar_repuestos_paginado
* Desarrollado por	: <\A Santiago Barreiro A\> 
* Descripcion		: <\D Sp que realiza la busqueda de repuestos D\>
* Observaciones		: <\O  O\>
* Parametros		: <\P p_marca_id     INTEGER,
						  p_modelo_id    INTEGER,
						  p_categoria_id INTEGER,
						  p_nombre       VARCHAR,
						  p_limit        INTEGER DEFAULT 12,
						  p_offset       INTEGER DEFAULT 0 P\>
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