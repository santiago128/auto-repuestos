-- ============================================================
-- SP: Toggle favorito (agregar o eliminar)
-- ============================================================
CREATE OR REPLACE FUNCTION sp_toggle_favorito(
    p_usuario_id  INTEGER,
    p_repuesto_id INTEGER
) RETURNS TABLE (r_accion VARCHAR)
AS $$
BEGIN
	/*--------------------------------------------------------------------------------------------------------------------------------------- 
* Nombre			: sp_toggle_favorito
* Desarrollado por	: <\A Santiago Barreiro A\> 
* Descripcion		: <\D Toggle favorito (agregar o eliminar) D\>
* Observaciones		: <\O  O\>
* Parametros		: <\P  p_usuario_id  INTEGER,
							p_repuesto_id INTEGER
							) RETURNS TABLE (r_accion VARCHAR) P\>
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
    IF EXISTS (SELECT 1 FROM favoritos WHERE usuario_id = p_usuario_id AND repuesto_id = p_repuesto_id) THEN
        DELETE FROM favoritos WHERE usuario_id = p_usuario_id AND repuesto_id = p_repuesto_id;
        RETURN QUERY SELECT 'ELIMINADO'::VARCHAR;
    ELSE
        INSERT INTO favoritos (usuario_id, repuesto_id) VALUES (p_usuario_id, p_repuesto_id);
        RETURN QUERY SELECT 'AGREGADO'::VARCHAR;
    END IF;
END;
$$ LANGUAGE plpgsql;