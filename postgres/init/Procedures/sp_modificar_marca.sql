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
	/*--------------------------------------------------------------------------------------------------------------------------------------- 
* Nombre			: sp_modificar_marca
* Desarrollado por	: <\A Santiago Barreiro A\> 
* Descripcion		: <\D Sp que modifica la marca D\>
* Observaciones		: <\O  O\>
* Parametros		: <\P p_id          INTEGER,
						  p_nombre      VARCHAR(100),
						  p_pais_origen VARCHAR(100) P\>
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
    IF NOT EXISTS (SELECT 1 FROM marcas WHERE id = p_id AND activo = TRUE) THEN
        RAISE EXCEPTION 'Marca ID % no encontrada', p_id;
    END IF;

    UPDATE marcas SET nombre = p_nombre, pais_origen = p_pais_origen WHERE id = p_id;

    RETURN QUERY SELECT 'Marca actualizada exitosamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql;