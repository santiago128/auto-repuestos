-- ============================================================
-- SP: Obtener facturas de un usuario
-- ============================================================
CREATE OR REPLACE FUNCTION sp_obtener_facturas_usuario(p_usuario_id INTEGER)
    RETURNS TABLE
            (
                r_id              INTEGER,
                r_numero_factura  VARCHAR,
                r_fecha           TIMESTAMP,
                r_subtotal        DECIMAL,
                r_iva             DECIMAL,
                r_total           DECIMAL,
                r_estado          VARCHAR,
                r_direccion_envio TEXT
            )
AS
$$
BEGIN
	/*--------------------------------------------------------------------------------------------------------------------------------------- 
* Nombre			: sp_obtener_facturas_usuario
* Desarrollado por	: <\A Santiago Barreiro A\> 
* Descripcion		: <\D Obtener facturas de un usuario D\>
* Observaciones		: <\O  O\>
* Parametros		: <\P TABLE
            (
                r_id              INTEGER,
                r_numero_factura  VARCHAR,
                r_fecha           TIMESTAMP,
                r_subtotal        DECIMAL,
                r_iva             DECIMAL,
                r_total           DECIMAL,
                r_estado          VARCHAR,
                r_direccion_envio TEXT
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
    RETURN QUERY
        SELECT f.id,
               f.numero_factura,
               f.fecha,
               f.subtotal,
               f.iva,
               f.total,
               f.estado::VARCHAR,
               f.direccion_envio
        FROM facturas f
        WHERE f.usuario_id = p_usuario_id
        ORDER BY f.fecha DESC;
END;
$$ LANGUAGE plpgsql;
