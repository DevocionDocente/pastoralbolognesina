# Guía: base de datos de Pastoral Bolognesina (producción)

> Este archivo contiene una contraseña. No lo subas a GitHub ni lo compartas por chat.

## 1. Datos de acceso

| Qué | Valor |
| --- | --- |
| Servidor (VPS) | `132.148.79.114` |
| Usuario SSH | `pastoral` |
| Contraseña SSH (también la pide `sudo`) | `syB!ydFloHEWbw3p` |
| Contenedor de la base | `compose-navigate-optical-hard-drive-2j8wad-postgres-1` |
| Base de datos / usuario | `pastoral` / `pastoral` |
| Contraseña de la base | `POSTGRES_PASSWORD` en Dokploy → compose → Environment (solo hace falta para el túnel, sección 7) |

En el servidor también existe `dokploy-postgres.1....`: es la base interna de Dokploy. **No la toques.**

## 2. Conectarse

Desde PowerShell en tu PC:

```powershell
ssh pastoral@132.148.79.114
```

Ya dentro del servidor, abre la consola de PostgreSQL:

```bash
sudo docker exec -it compose-navigate-optical-hard-drive-2j8wad-postgres-1 psql -U pastoral -d pastoral
```

Cuando veas `pastoral=#` estás dentro. Para salir: `\q` (de psql) y luego `exit` (del servidor).

## 3. Comandos de psql

| Comando | Para qué |
| --- | --- |
| `\dt` | Lista las tablas |
| `\d activities` | Muestra las columnas de una tabla |
| `\x auto` | Muestra filas largas en vertical (útil con textos largos) |
| `\q` | Salir |
| `q` | Salir de una lista larga (cuando aparece `(END)` o `:`) |

Cada consulta SQL termina en `;`. Si te olvidas, psql espera más texto (`pastoral-#`): escribe `;` y Enter.

## 4. Tablas

**Actividades y archivos**

| Tabla | Qué guarda |
| --- | --- |
| `activities` | Cada actividad: nombre, año, fecha, publicada o no, resumen de IA, descripción pastoral, impacto en la convivencia, imagen de reflexión, estado del perfil (`pending`, `processing`, `ready`, `error`) y campos editados a mano (`manual_fields`) |
| `activity_series` | Actividades que se repiten cada año (Semana Santa, Santa Rosa de Lima…) |
| `media_items` | Archivos de cada actividad: foto, video, documento o YouTube, nombre original, tipo, estado del análisis |
| `media_analyses` | Lo que la IA entendió de cada archivo: descripción, etiquetas, transcripción, texto extraído |
| `media_chunks` | Fragmentos de texto con su vector (embedding) para la búsqueda inteligente |
| `virtues` | Catálogo de virtudes con su explicación e imagen |
| `activity_virtues` | Qué virtudes tiene cada actividad, con la explicación y la imagen propia de esa actividad |

**Usuarios y permisos**

| Tabla | Qué guarda |
| --- | --- |
| `users` | Usuarios: nombre, correo, rol y estado (`pending`, `active`, `revoked`) |
| `roles` / `role_permissions` | Roles y los permisos de cada rol |
| `user_permissions` | Permisos agregados o quitados a un usuario concreto |
| `access_history` | Historial de altas, bajas y cambios de permisos |
| `sessions`, `accounts`, `verifications` | Sesiones y contraseñas cifradas del login. No editar |

Otras tablas que verás con `\dt`: `__drizzle_migrations` (versiones de la base) y el esquema `pgboss` (cola de trabajos de la IA). No las modifiques.

## 5. Consultas útiles

```sql
-- Actividades por año
select name, year, published, profile_status from activities order by year desc, name;

-- Cuántas actividades hay por año
select year, count(*) from activities group by year order by year desc;

-- Archivos de una actividad
select m.original_name, m.kind, m.analysis_status
from media_items m join activities a on a.id = m.activity_id
where a.name ilike '%santa rosa%' order by a.year, m.position;

-- Archivos con error de análisis
select a.name, m.original_name, m.analysis_error
from media_items m join activities a on a.id = m.activity_id
where m.analysis_status = 'error';

-- Virtudes de cada actividad
select a.name, a.year, v.name as virtud
from activity_virtues av
join activities a on a.id = av.activity_id
join virtues v on v.id = av.virtue_id
order by a.year desc, a.name, av.position;

-- Usuarios y su rol
select u.name, u.email, u.status, r.name as rol
from users u left join roles r on r.id = u.role_id order by u.name;

-- Buscar una actividad por nombre (sin importar tildes ni mayúsculas)
select id, name, year from activities where unaccent(name) ilike unaccent('%oracion%');
```

## 6. Antes de modificar o borrar algo

La base de producción todavía no tiene backups automáticos. Antes de cambiar datos, sal de psql (`\q`) y saca una copia en el servidor:

```bash
cd ~
sudo docker exec compose-navigate-optical-hard-drive-2j8wad-postgres-1 pg_dump -U pastoral pastoral > backup-$(date +%F).sql
ls -lh backup-*.sql
```

Para bajar esa copia a tu PC (en PowerShell, no en el servidor):

```powershell
scp pastoral@132.148.79.114:~/backup-2026-11-11.sql .
```

Cambia la fecha por la del archivo que creaste.

Recomendaciones:

- Prueba los cambios dentro de una transacción. Si algo sale mal, `rollback;` lo deshace todo:
  ```sql
  begin;
  update activities set published = true where name = 'Ejemplo 2025';
  select name, published from activities where name = 'Ejemplo 2025';
  commit;   -- o rollback; si no es lo que esperabas
  ```
- Siempre pon `where` en un `update` o `delete`.
- Es mejor hacer los cambios desde el panel (https://pastoralbolognesina.com/dashboard): así se borran también los archivos en MinIO y se recalcula la IA. Si borras una actividad desde la base, sus fotos quedan huérfanas en el almacenamiento.

## 7. (Opcional) Conectarse con DBeaver o pgAdmin desde tu PC

1. En el servidor, saca la IP interna del contenedor (cambia si el contenedor se reinicia):
   ```bash
   sudo docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' compose-navigate-optical-hard-drive-2j8wad-postgres-1
   ```
2. En tu PC (PowerShell), abre el túnel y deja la ventana abierta:
   ```powershell
   ssh -N -L 5433:<IP>:5432 pastoral@132.148.79.114
   ```
3. En DBeaver o pgAdmin: host `localhost`, puerto `5433`, base `pastoral`, usuario `pastoral`, contraseña `POSTGRES_PASSWORD` (sección 1).

No abras el puerto 5432 a internet en Dokploy: el túnel es suficiente y más seguro.

## 8. Problemas comunes

| Mensaje | Solución |
| --- | --- |
| `Permission denied` al hacer `ssh` | Revisa usuario (`pastoral`) y contraseña |
| `permission denied ... docker.sock` | Te faltó `sudo` delante de `docker` |
| `No such container` | Ejecuta `sudo docker ps --format "{{.Names}}"` y usa el nombre que termine en `-postgres-1` |
| psql no responde tras una consulta | Te faltó el `;` al final |
| Una lista no termina | Pulsa `q` |
IR A LA BASE DE DATOS
-> Abrir el DBeader
-> Vamos al ícono del enchufe
-> PosgreSQL ( le doy clic)
->url y pongo
-> jdbc:postgresql://132.148.79.114:54320/pastoral?user=pastoral&password=e1979601cf2310c1a7a044d315cf765d&sslmode=disable
-> Probar conexión
-> Aceptar y luego finalizar
-> Ir a dar clip a la imagen de la parte izquierda de la base de datos
-> dar clic a postgres 4
-> Clic a Base de datos
->Clic a base de datos de la ventana que abre
-> Clic a la iamgen de base de datos pastoral
-> clic public
DIAGRAMA D ELAS tablas
Seguir los procesos anteriores
-> clic por el centro d ela pantalla que está al costado de Propiedades, está el botó Diagrama