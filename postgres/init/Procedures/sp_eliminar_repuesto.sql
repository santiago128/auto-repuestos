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
	/*--------------------------------------------------------------------------------------------------------------------------------------- 
* Nombre			: sp_eliminar_repuesto
* Desarrollado por	: <\A Santiago Barreiro A\> 
* Descripcion		: <\D Sp que realiza la eliminación logica de un repuesto D\>
* Observaciones		: <\O  O\>
* Parametros		: <\P  P\>
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
        RAISE EXCEPTION 'Repuesto ID % no encontrado o ya eliminado', p_id;
    END IF;

    UPDATE repuestos
    SET activo     = FALSE,
        updated_at = NOW()
    WHERE id = p_id;

    RETURN QUERY SELECT 'Repuesto eliminado exitosamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql;