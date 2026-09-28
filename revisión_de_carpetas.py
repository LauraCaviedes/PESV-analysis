import os
import pandas as pd

# Ruta de la carpeta que quieres revisar
carpeta = r"Archivos de Dario Rincon Jaramillo - Certificados diplomado"

datos = []

# Recorrer la carpeta y subcarpetas
for raiz, carpetas, archivos in os.walk(carpeta):
    for archivo in archivos:
        nombre, extension = os.path.splitext(archivo)

        datos.append({
            "Nombre_Archivo": nombre,
            "Extension": extension
        })

# Crear DataFrame
df = pd.DataFrame(datos)

# Guardar en Excel
archivo_excel = "listado_archivos_diplomados.xlsx"
df.to_excel(archivo_excel, index=False)

print(f"Archivo Excel generado: {archivo_excel}")