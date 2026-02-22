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
	/*--------------------------------------------------------------------------------------------------------------------------------------- 
* Nombre			: sp_registrar_modelo
* Desarrollado por	: <\A Santiago Barreiro A\> 
* Descripcion		: <\D Registrar Modelo D\>
* Observaciones		: <\O  O\>
* Parametros		: <\P  p_nombre      VARCHAR(100),
							p_anio_inicio INTEGER,
							p_anio_fin    INTEGER,
							p_marca_id    INTEGER
						) RETURNS TABLE
								  (
									  r_id      INTEGER,
									  r_nombre  VARCHAR,
									  r_mensaje VARCHAR
								  )
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
        RAISE EXCEPTION 'Marca ID % no encontrada', p_marca_id;
    END IF;

    INSERT INTO modelos (nombre, anio_inicio, anio_fin, marca_id)
    VALUES (p_nombre, p_anio_inicio, p_anio_fin, p_marca_id)
    RETURNING modelos.id INTO v_id;

    RETURN QUERY SELECT v_id, p_nombre, 'Modelo registrado exitosamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql;