#!/bin/bash
set -e

echo ">>> Ejecutando Schema..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
     -f /docker-entrypoint-initdb.d/Schema/01_schema.sql

echo ">>> Ejecutando Stored Procedures..."
for f in $(ls /docker-entrypoint-initdb.d/Procedures/*.sql | sort); do
    echo "    -> $f"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$f"
done

echo ">>> Inicialización completada."
