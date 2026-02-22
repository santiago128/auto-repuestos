-- ============================================================
-- SP: Cambiar estado de factura
-- ============================================================
CREATE OR REPLACE FUNCTION sp_cambiar_estado_factura(
    p_factura_id  INTEGER,
    p_nuevo_estado VARCHAR(20)
) RETURNS TABLE (r_mensaje VARCHAR)
AS $$
BEGIN
	/*--------------------------------------------------------------------------------------------------------------------------------------- 
* Nombre			: sp_cambiar_estado_factura
* Desarrollado por	: <\A Santiago Barreiro A\> 
* Descripcion		: <\D Sp que cambia el estado a una factura D\>
* Observaciones		: <\O  O\>
* Parametros		: <\P p_factura_id  INTEGER,
						  p_nuevo_estado VARCHAR(20) P\>
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



