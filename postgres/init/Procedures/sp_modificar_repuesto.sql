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
	/*--------------------------------------------------------------------------------------------------------------------------------------- 
* Nombre			: sp_modificar_repuesto
* Desarrollado por	: <\A Santiago Barreiro A\> 
* Descripcion		: <\D Modificar Repuesto D\>
* Observaciones		: <\O  O\>
* Parametros		: <\P p_id           INTEGER,
						  p_nombre       VARCHAR(200),
						  p_descripcion  TEXT,
						  p_precio       DECIMAL(10, 2),
						  p_stock        INTEGER,
						  p_marca_id     INTEGER,
						  p_modelo_id    INTEGER,
						  p_categoria_id INTEGER,
						  p_imagen_url   VARCHAR(500) P\>
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