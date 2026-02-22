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
	/*--------------------------------------------------------------------------------------------------------------------------------------- 
* Nombre			: sp_registrar_marca
* Desarrollado por	: <\A Santiago Barreiro A\> 
* Descripcion		: <\D Registrar Marca D\>
* Observaciones		: <\O  O\>
* Parametros		: <\P  p_nombre      VARCHAR(100),
						p_pais_origen VARCHAR(100)
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
    INSERT INTO marcas (nombre, pais_origen)
    VALUES (p_nombre, p_pais_origen)
    RETURNING marcas.id INTO v_id;

    RETURN QUERY SELECT v_id, p_nombre, 'Marca registrada exitosamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql;