-- ============================================================
-- SP: Registrar Usuario
-- ============================================================
CREATE OR REPLACE FUNCTION sp_registrar_usuario(
    p_nombre    VARCHAR(100),
    p_apellido  VARCHAR(100),
    p_email     VARCHAR(150),
    p_password  VARCHAR(255),
    p_telefono  VARCHAR(20),
    p_direccion TEXT
) RETURNS TABLE
          (
              r_id      INTEGER,
              r_email   VARCHAR,
              r_mensaje VARCHAR
          )
AS
$$
DECLARE
    v_id INTEGER;
BEGIN
	/*--------------------------------------------------------------------------------------------------------------------------------------- 
* Nombre			: sp_registrar_usuario
* Desarrollado por	: <\A Santiago Barreiro A\> 
* Descripcion		: <\D Registrar Usuario D\>
* Observaciones		: <\O  O\>
* Parametros		: <\P  p_nombre    VARCHAR(100),
							p_apellido  VARCHAR(100),
							p_email     VARCHAR(150),
							p_password  VARCHAR(255),
							p_telefono  VARCHAR(20),
							p_direccion TEXT
						) RETURNS TABLE
								  (
									  r_id      INTEGER,
									  r_email   VARCHAR,
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
    IF EXISTS (SELECT 1 FROM usuarios WHERE email = p_email) THEN
        RAISE EXCEPTION 'El correo "%" ya está registrado', p_email;
    END IF;

    INSERT INTO usuarios (nombre, apellido, email, password, telefono, direccion, rol_id)
    VALUES (p_nombre, p_apellido, p_email, p_password, p_telefono, p_direccion, 2)
    RETURNING usuarios.id INTO v_id;

    RETURN QUERY SELECT v_id, p_email, 'Usuario registrado exitosamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql;