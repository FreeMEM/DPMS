# Migración WUHU → DPMS

Guía para migrar datos históricos desde el sistema WUHU (PHP/MySQL) a DPMS (Django/PostgreSQL).

## Requisitos Previos

1. **Dump SQL de WUHU**: Archivo `.sql` exportado de la base de datos MySQL de WUHU
2. **Directorio de producciones**: Carpeta `posadas_productions/` con:
   - `entries_private/` - Archivos de las producciones
   - `screenshots/` - Capturas de pantalla (opcional)
3. **Docker corriendo**: `docker compose -f local.yml up -d`

## Estructura de Datos en WUHU

### Tablas Principales
| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios registrados |
| `compos` | Competiciones (Demo, Music, Graphics, etc.) |
| `compoentries` | Producciones subidas |
| `votes_range` | Votos (escala 0-10) |
| `votekeys` | Códigos de votación |

### Estructura de Archivos
```
posadas_productions/
├── entries_private/
│   ├── tracked_music/
│   │   ├── 001/          # playingorder
│   │   │   └── archivo.zip
│   │   └── 002/
│   ├── ocs_demo/
│   └── ...
└── screenshots/
    ├── 106.jpeg          # entry_id.ext
    └── ...
```

## Uso del Comando

### Sintaxis

```bash
docker compose -f local.yml exec backend_party python manage.py migrate_wuhu_data [opciones]
```

### Opciones

| Opción | Descripción | Default |
|--------|-------------|---------|
| `--sql-file PATH` | Ruta al dump SQL de WUHU | `~/Projects/wuhu-posadas/wuhu_25012026.sql` |
| `--productions-dir PATH` | Directorio de producciones | `~/Projects/wuhu-posadas/www/posadas_productions/` |
| `--clear` | Limpiar datos existentes antes de migrar | No |
| `--dry-run` | Mostrar lo que se haría sin ejecutar | No |
| `--skip-files` | No copiar archivos físicos | No |
| `--skip-votes` | No migrar votos | No |

### Ejemplos

```bash
# 1. Dry run (ver qué se haría sin ejecutar cambios)
docker compose -f local.yml exec backend_party python manage.py migrate_wuhu_data \
  --sql-file=/wuhu/wuhu_25012026.sql \
  --productions-dir=/wuhu/www/posadas_productions/ \
  --dry-run

# 2. Migración completa con limpieza previa
docker compose -f local.yml exec backend_party python manage.py migrate_wuhu_data \
  --sql-file=/wuhu/wuhu_25012026.sql \
  --productions-dir=/wuhu/www/posadas_productions/ \
  --clear

# 3. Solo migrar metadata (sin archivos físicos)
docker compose -f local.yml exec backend_party python manage.py migrate_wuhu_data \
  --sql-file=/wuhu/wuhu_25012026.sql \
  --productions-dir=/wuhu/www/posadas_productions/ \
  --skip-files
```

## Acceso a Archivos desde Docker

Si los archivos de WUHU están fuera del directorio del proyecto, necesitas montar un volumen adicional temporalmente:

1. Editar `local.yml`:
```yaml
services:
    backend_party:
        volumes:
            - .:/app
            - /ruta/a/wuhu-posadas:/wuhu  # Añadir esta línea
```

2. Reiniciar el contenedor:
```bash
docker compose -f local.yml up -d backend_party
```

3. Ejecutar la migración usando las rutas dentro del contenedor:
```bash
docker compose -f local.yml exec backend_party python manage.py migrate_wuhu_data \
  --sql-file=/wuhu/wuhu_25012026.sql \
  --productions-dir=/wuhu/www/posadas_productions/
```

4. Quitar el volumen temporal después de la migración.

## Mapeo de Datos

### Usuarios
| WUHU | DPMS |
|------|------|
| `users.username` | `User.username` |
| `users.password` | Nueva password `posadas2025` |
| `users.nickname` | `Profile.nickname` |
| `users.group` | `Profile.group` |
| `users.regtime` | `User.created` |
| `users.visible` | `Profile.visit_listing` |

**Notas sobre usuarios:**
- Email generado: `{username}@wuhu.posadas.local`
- `is_verified=False` para forzar verificación
- Password temporal: `posadas2025`
- Si el username ya existe, se añade sufijo `_wuhu{id}`

### Competiciones
| WUHU | DPMS |
|------|------|
| `compos.name` | `Compo.name` |
| `compos.start` | `HasCompo.start` |
| `compos.showauthor` | `HasCompo.show_authors_on_slide` |
| `compos.dirname` | Usado para localizar archivos |

### Producciones
| WUHU | DPMS |
|------|------|
| `compoentries.title` | `Production.title` |
| `compoentries.author` | `Production.authors` |
| `compoentries.comment` | `Production.description` |
| `compoentries.userid` | `Production.uploaded_by` |
| `compoentries.compoid` | `Production.compo` |
| `compoentries.filename` | `File.original_filename` |

### Votos
| WUHU | DPMS |
|------|------|
| `votes_range.userid` | `Vote.user` |
| `votes_range.vote` | `Vote.score` (normalizado: `max(1, valor)`) |
| `votes_range.votedate` | `Vote.created` |

### Votekeys
| WUHU | DPMS |
|------|------|
| `votekeys.votekey` | `AttendanceCode.code` |
| `votekeys.userid` | `AttendanceCode.used_by` (si > 0) |

## Proceso de Migración

El comando ejecuta los siguientes pasos en orden:

1. **Parsear dump SQL** - Extrae datos de las tablas usando regex
2. **Crear Edition** - "Posadas Party 2025" con metadata del dump
3. **Crear Compos** - 16 tipos de competición
4. **Crear HasCompos** - Vincular compos a la edición con horarios
5. **Migrar Usuarios** - Crear User + Profile por cada usuario
6. **Migrar Producciones** - Para cada compoentry:
   - Crear Production
   - Copiar archivos físicos a `MEDIA_ROOT/files/<edition>/<compo>/`
   - Crear File con nombre UUID
7. **Migrar Votos** - Convertir votes_range a Vote
8. **Migrar Votekeys** - Crear AttendanceCodes
9. **Crear VotingConfiguration** - Configurar votación pública

## Verificación Post-Migración

```bash
# Verificar datos en Django shell
docker compose -f local.yml exec backend_party python manage.py shell -c "
from dpms.compos.models import Edition, Production, Vote, AttendanceCode

ed = Edition.objects.get(title='Posadas Party 2025')
print(f'Producciones: {ed.productions.count()}')
print(f'Compos: {ed.compos.count()}')
print(f'Votos: {Vote.objects.filter(production__edition=ed).count()}')
print(f'Códigos: {AttendanceCode.objects.filter(edition=ed).count()}')
"

# Verificar archivos físicos
docker compose -f local.yml exec backend_party ls -la /app/backend/staticfiles/media/files/posadas-party-2025/
```

## Verificación en Frontend

1. Iniciar frontend: `cd frontend && yarn start`
2. Navegar a la lista de ediciones
3. Verificar "Posadas Party 2025" aparece
4. Verificar compos y producciones listadas
5. Verificar archivos descargables

## Verificación en Admin

1. Acceder a http://localhost:8000/admin/
2. Verificar Edition "Posadas Party 2025"
3. Verificar Productions con archivos asociados
4. Verificar Users migrados con perfiles

## Troubleshooting

### Error: "SQL file not found"
Verifica que la ruta al archivo SQL sea correcta y accesible desde el contenedor.

### Error: "duplicate key value violates unique constraint"
El comando maneja usernames duplicados automáticamente añadiendo sufijo `_wuhu{id}`. Si persiste, usa `--clear` para limpiar datos previos.

### Error: "Source directory not found"
Verifica que el `dirname` de la compo en WUHU coincida con el nombre del directorio en `entries_private/`.

### Archivos no copiados
- Verifica que el directorio de producciones esté montado en Docker
- Usa `--skip-files` si solo quieres migrar metadata
- Revisa los logs para ver qué archivos fallaron

## Rollback

Para deshacer la migración:

```bash
docker compose -f local.yml exec backend_party python manage.py shell -c "
from dpms.compos.models import Edition, Production, File, Vote, AttendanceCode, VotingConfiguration, VotingPeriod

ed = Edition.objects.filter(title='Posadas Party 2025').first()
if ed:
    Vote.objects.filter(production__edition=ed).delete()
    AttendanceCode.objects.filter(edition=ed).delete()
    VotingPeriod.objects.filter(edition=ed).delete()
    VotingConfiguration.objects.filter(edition=ed).delete()
    for p in Production.objects.filter(edition=ed):
        p.files.all().delete()
    Production.objects.filter(edition=ed).delete()
    ed.delete()
    print('Rollback completado')
"
```

## Migración Realizada: Posadas Party 2025

**Fecha**: 26 de enero de 2026

### Resultados
| Elemento | Cantidad |
|----------|----------|
| Edición | 1 |
| Compos | 16 |
| Usuarios nuevos | 71 |
| Producciones | 44 |
| Archivos | 49 |
| Votos | 44 |
| Códigos de Asistencia | 300 |

### Archivos Fuente
- SQL: `/home/freemem/Projects/wuhu-posadas/wuhu_25012026.sql`
- Producciones: `/home/freemem/Projects/wuhu-posadas/www/posadas_productions/`
