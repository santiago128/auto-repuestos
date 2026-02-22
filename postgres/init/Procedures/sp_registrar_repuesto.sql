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
	/*--------------------------------------------------------------------------------------------------------------------------------------- 
* Nombre			: sp_registrar_repuesto
* Desarrollado por	: <\A Santiago Barreiro A\> 
* Descripcion		: <\D Registrar Repuesto D\>
* Observaciones		: <\O  O\>
* Parametros		: <\P  p_codigo       VARCHAR(50),
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
								  ) P\>
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