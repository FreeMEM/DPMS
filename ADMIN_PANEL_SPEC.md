# Panel de Administración - Especificación Detallada

**Versión**: 1.0
**Fecha**: 2025-10-26
**Proyecto**: DPMS - Demo Party Management System

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Arquitectura del Panel](#2-arquitectura-del-panel)
3. [Módulos del Panel](#3-módulos-del-panel)
4. [Componentes Comunes](#4-componentes-comunes)
5. [Permisos y Seguridad](#5-permisos-y-seguridad)
6. [Plan de Implementación](#6-plan-de-implementación)

---

## 1. Visión General

El Panel de Administración es una sección dentro de la aplicación React (`/app/admin/*`) que permite a los administradores de DPMS gestionar todos los aspectos del sistema: ediciones, competiciones, producciones, usuarios, contenido y votaciones.

### 1.1 Requisitos de Acceso

- **Autenticación requerida**: Usuario debe estar logueado
- **Grupo requerido**: Usuario debe pertenecer al grupo "DPMS Admins"
- **Redirección**: Usuarios no autorizados son redirigidos al dashboard normal

### 1.2 URL Base

```
/app/admin/
```

### 1.3 Navegación

El panel de administración se integra en la MainBar existente con un menú desplegable que aparece solo para administradores.

---

## 2. Arquitectura del Panel

### 2.1 Estructura de Archivos

```
frontend/src/
├── components/
│   ├── admin/                         # Componentes de administración
│   │   ├── editions/
│   │   │   ├── EditionsTable.js       # Tabla de ediciones
│   │   │   ├── EditionForm.js         # Formulario crear/editar
│   │   │   ├── EditionDetail.js       # Vista detalle
│   │   │   └── HasCompoManager.js     # Gestión compos de edición
│   │   ├── compos/
│   │   │   ├── ComposTable.js
│   │   │   ├── CompoForm.js
│   │   │   └── CompoDetail.js
│   │   ├── productions/
│   │   │   ├── ProductionsTable.js
│   │   │   ├── ProductionDetail.js
│   │   │   └── ProductionFilters.js
│   │   ├── users/
│   │   │   ├── UsersTable.js
│   │   │   ├── UserDetail.js
│   │   │   └── UserStats.js
│   │   ├── voting/
│   │   │   ├── VotingConfig.js        # Configuración de votación
│   │   │   ├── VotingPeriodForm.js
│   │   │   ├── JuryManagement.js      # Gestión de jurados
│   │   │   ├── AttendeeVerification.js # Sistema de asistentes
│   │   │   └── ResultsDashboard.js
│   │   ├── content/
│   │   │   ├── NewsManager.js
│   │   │   ├── GalleryManager.js
│   │   │   └── SiteSettings.js
│   │   └── common/
│   │       ├── AdminLayout.js         # Layout común del panel
│   │       ├── DataTable.js           # Tabla reutilizable
│   │       ├── ConfirmDialog.js
│   │       ├── StatsCard.js
│   │       └── QuickActions.js
│   └── common/
│       └── AdminRoute.js              # HOC para proteger rutas admin
├── pages/
│   └── admin/
│       ├── AdminDashboard.js          # Dashboard principal
│       ├── EditionsPage.js
│       ├── ComposPage.js
│       ├── ProductionsPage.js
│       ├── UsersPage.js
│       ├── VotingPage.js
│       ├── NewsPage.js
│       ├── GalleryPage.js
│       └── SettingsPage.js
└── services/
    └── adminApi.js                    # Cliente API específico para admin
```

### 2.2 Rutas

```javascript
// routes.js - Rutas de administración
const adminRoutes = [
  {
    path: '/app/admin/dashboard',
    component: AdminDashboard,
    exact: true,
    title: 'Panel de Administración'
  },
  {
    path: '/app/admin/editions',
    component: EditionsPage,
    title: 'Gestión de Ediciones'
  },
  {
    path: '/app/admin/editions/:id',
    component: EditionDetail,
    title: 'Detalle de Edición'
  },
  {
    path: '/app/admin/compos',
    component: ComposPage,
    title: 'Gestión de Competiciones'
  },
  {
    path: '/app/admin/productions',
    component: ProductionsPage,
    title: 'Gestión de Producciones'
  },
  {
    path: '/app/admin/users',
    component: UsersPage,
    title: 'Gestión de Usuarios'
  },
  {
    path: '/app/admin/voting',
    component: VotingPage,
    title: 'Configuración de Votaciones'
  },
  {
    path: '/app/admin/news',
    component: NewsPage,
    title: 'Gestión de Noticias'
  },
  {
    path: '/app/admin/gallery',
    component: GalleryPage,
    title: 'Gestión de Galería'
  },
  {
    path: '/app/admin/settings',
    component: SettingsPage,
    title: 'Configuración del Sitio'
  }
];
```

---

## 3. Módulos del Panel

### 3.1 Dashboard Principal

**Ruta**: `/app/admin/dashboard`

**Objetivo**: Proporcionar una vista general del estado del sistema con métricas clave y accesos rápidos.

#### Contenido

1. **Estadísticas Generales** (Cards superiores):
   - Total de usuarios registrados
   - Usuarios verificados vs. no verificados
   - Total de producciones enviadas
   - Votos emitidos (si hay votación activa)

2. **Edición Activa** (Destacada):
   - Información de la edición actual
   - Estado: "Abierta para envíos" / "En votación" / "Finalizada"
   - Fechas importantes
   - Progreso de envíos por compo (gráfico de barras)

3. **Acciones Rápidas**:
   - Crear nueva edición
   - Crear competición
   - Ver producciones recientes
   - Gestionar usuarios

4. **Actividad Reciente**:
   - Últimas producciones enviadas
   - Últimos usuarios registrados
   - Últimas votaciones emitidas

5. **Alertas/Warnings**:
   - Usuarios no verificados
   - Producciones sin archivos
   - Períodos de votación a punto de cerrar
   - Compos sin producciones

#### Componentes

```javascript
// AdminDashboard.js
import StatsCard from '../components/admin/common/StatsCard';
import ActivityFeed from '../components/admin/common/ActivityFeed';
import QuickActions from '../components/admin/common/QuickActions';
import CompoProgress from '../components/admin/editions/CompoProgress';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [currentEdition, setCurrentEdition] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Panel de Administración
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Usuarios Registrados"
              value={stats.totalUsers}
              icon={<PeopleIcon />}
              color="primary"
            />
          </Grid>
          {/* ... más cards */}
        </Grid>

        {/* Current Edition */}
        {currentEdition && (
          <Card sx={{ mt: 3 }}>
            <CardHeader title={`Edición Activa: ${currentEdition.title}`} />
            <CardContent>
              <CompoProgress edition={currentEdition} />
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Activity */}
        <ActivityFeed activities={recentActivity} />
      </Box>
    </AdminLayout>
  );
};
```

---

### 3.2 Gestión de Ediciones

**Ruta**: `/app/admin/editions`

**Objetivo**: Administrar las ediciones de parties (eventos).

#### Funcionalidades

1. **Lista de Ediciones**:
   - Tabla con todas las ediciones
   - Columnas: Título, Fechas, Estado (Pública/Privada), Abierta a envíos, Acciones
   - Búsqueda por título
   - Filtros: Públicas, Próximas, Pasadas
   - Ordenación por fecha
   - Paginación

2. **Crear/Editar Edición**:
   - Formulario con campos:
     - Título (requerido)
     - Descripción (textarea)
     - Slug (auto-generado o manual)
     - Logo (upload imagen)
     - Banner (upload imagen)
     - Fecha inicio (date picker)
     - Fecha fin (date picker)
     - Ubicación (texto)
     - Estado público (checkbox)
     - Abierta a envíos (checkbox)
     - Abierta a actualizaciones (checkbox)
     - Edición destacada (checkbox)
   - Validación de fechas (fin >= inicio)
   - Preview del logo/banner

3. **Detalle de Edición**:
   - Información completa de la edición
   - **Gestión de Competiciones Asociadas** (HasCompo):
     - Tabla de compos de esta edición
     - Añadir compo existente a la edición
     - Configurar por compo:
       - Fecha de inicio de la compo
       - Abierta a envíos (checkbox)
       - Abierta a actualizaciones (checkbox)
       - Mostrar autores en slide (checkbox)
     - Quitar compo de la edición
   - **Producciones de la Edición**:
     - Lista de producciones enviadas
     - Filtrar por compo
     - Estadísticas: total por compo
   - **Configuración de Votación** (ver módulo 3.5)

4. **Eliminar Edición**:
   - Confirmación con advertencia
   - No permitir si tiene producciones asociadas

#### API Endpoints Necesarios

```
GET    /api/editions/                    # Listar ediciones
POST   /api/editions/                    # Crear edición
GET    /api/editions/{id}/               # Detalle edición
PUT    /api/editions/{id}/               # Actualizar edición
DELETE /api/editions/{id}/               # Eliminar edición
GET    /api/editions/{id}/compos/        # Compos de la edición (HasCompo)
POST   /api/editions/{id}/add_compo/     # Añadir compo a edición
DELETE /api/hascompos/{id}/              # Quitar compo de edición
PUT    /api/hascompos/{id}/              # Actualizar config HasCompo
GET    /api/editions/{id}/stats/         # Estadísticas de la edición
```

---

### 3.3 Gestión de Competiciones (Compos)

**Ruta**: `/app/admin/compos`

**Objetivo**: Administrar los tipos de competiciones (Demo, Graphics, Music, etc.).

#### Funcionalidades

1. **Lista de Competiciones**:
   - Tabla con todos los tipos de compos
   - Columnas: Nombre, Descripción, Orden, Icono, Acciones
   - Búsqueda por nombre
   - Ordenación por display_order
   - Arrastrar y soltar para reordenar

2. **Crear/Editar Compo**:
   - Nombre (requerido)
   - Descripción (textarea)
   - Reglas (rich text editor)
   - Icono (selector de iconos Material-UI)
   - Orden de visualización (número)

3. **Detalle de Compo**:
   - Información completa
   - **Ediciones que usan esta compo**:
     - Lista de ediciones asociadas
     - Link a configuración de HasCompo
   - **Producciones históricas**:
     - Total de producciones en esta compo a lo largo del tiempo
     - Agrupadas por edición

4. **Eliminar Compo**:
   - Confirmación
   - No permitir si está asociada a ediciones activas

#### API Endpoints Necesarios

```
GET    /api/compos/                      # Listar compos
POST   /api/compos/                      # Crear compo
GET    /api/compos/{id}/                 # Detalle compo
PUT    /api/compos/{id}/                 # Actualizar compo
DELETE /api/compos/{id}/                 # Eliminar compo
PATCH  /api/compos/reorder/              # Reordenar compos
GET    /api/compos/{id}/editions/        # Ediciones que usan esta compo
GET    /api/compos/{id}/stats/           # Estadísticas históricas
```

---

### 3.4 Gestión de Producciones

**Ruta**: `/app/admin/productions`

**Objetivo**: Ver y gestionar todas las producciones enviadas por usuarios.

#### Funcionalidades

1. **Lista de Producciones**:
   - Tabla con todas las producciones
   - Columnas: Título, Autor, Edición, Compo, Fecha envío, Archivos, Acciones
   - Filtros:
     - Por edición
     - Por compo
     - Por usuario
     - Con/sin archivos
     - Fecha de envío
   - Búsqueda por título o autor
   - Paginación
   - Exportar a CSV

2. **Detalle de Producción**:
   - Información completa
   - **Archivos asociados**:
     - Lista de archivos
     - Descargar archivo
     - Ver metadatos (tamaño, tipo, fecha)
   - **Información del usuario**:
     - Email, nickname, grupo
     - Link a perfil del usuario
     - Otras producciones del usuario
   - **Acciones de administrador**:
     - Editar producción
     - Eliminar producción
     - Aprobar/Rechazar (si se implementa moderación)

3. **Estadísticas**:
   - Total de producciones
   - Distribución por compo (gráfico)
   - Distribución por edición (gráfico)
   - Usuarios más activos
   - Tamaño total de archivos

#### API Endpoints Necesarios

```
GET    /api/productions/                 # Listar producciones (con filtros)
GET    /api/productions/{id}/            # Detalle producción
PUT    /api/productions/{id}/            # Actualizar producción (admin)
DELETE /api/productions/{id}/            # Eliminar producción
GET    /api/productions/stats/           # Estadísticas globales
GET    /api/productions/export/          # Exportar a CSV
```

---

### 3.5 Gestión de Votaciones

**Ruta**: `/app/admin/voting`

**Objetivo**: Configurar el sistema de votación para cada edición con modalidades flexibles.

#### Funcionalidades

1. **Configuración de Votación por Edición**:

   Para cada edición, el administrador puede configurar:

   ##### 1.1 Modalidad de Votación

   **Tipos de modalidad**:
   - **100% Votación Pública**: Todos los votos vienen de asistentes/usuarios
   - **100% Votación por Jurado**: Solo un jurado seleccionado vota
   - **Modalidad Mixta**: Combinación de votos públicos y jurado
     - Configurar porcentaje de peso: Ej: 70% público, 30% jurado
     - Los resultados finales se calculan con ponderación

   **Campos de configuración**:
   ```javascript
   {
     edition: Edition,
     voting_mode: 'public' | 'jury' | 'mixed',
     public_weight: 0-100,  // Solo si mode = 'mixed'
     jury_weight: 0-100,    // Solo si mode = 'mixed'
   }
   ```

   ##### 1.2 Control de Acceso a Votación

   **Mecanismos de verificación de asistentes**:

   a) **Votación Abierta por Tiempo**:
   - Cualquier usuario registrado puede votar
   - Solo durante un período de tiempo configurado
   - No requiere verificación física

   b) **Votación con Código de Asistencia**:
   - Se generan códigos únicos de un solo uso
   - Los organizadores entregan códigos a asistentes físicos
   - Usuario debe introducir código para activar su derecho a voto
   - Código válido solo para una edición específica
   - Tracking: quien usó qué código y cuándo

   c) **Verificación Manual por Administrador**:
   - Lista de usuarios en el sistema
   - Checkbox "Puede votar en [Edición]"
   - Administrador marca manualmente a asistentes verificados
   - Se puede hacer durante el evento

   d) **Sistema de Check-in Físico** (Futuro - Fase avanzada):
   - QR code único por usuario
   - App móvil o tablet en entrada del evento
   - Escaneo de QR = usuario verificado como asistente
   - Activación automática de derecho a voto

   **Campos de configuración**:
   ```javascript
   {
     edition: Edition,
     access_mode: 'open' | 'code' | 'manual' | 'checkin',

     // Si mode = 'open'
     voting_period_start: DateTime,
     voting_period_end: DateTime,

     // Si mode = 'code'
     codes_enabled: Boolean,
     codes_generated: Integer,  // Cuántos códigos se generaron

     // Si mode = 'manual' o 'checkin'
     verified_attendees: [User],
   }
   ```

2. **Gestión de Códigos de Asistencia**:

   **Funcionalidades**:
   - Generar lote de códigos (ej: 100 códigos)
   - Formato configurable: `PP25-XXXX-YYYY` (PP25 = Posadas Party 2025)
   - Ver lista de códigos:
     - Código | Estado (Usado/No usado) | Usado por | Fecha de uso
   - Exportar códigos a PDF/CSV para impresión
   - Invalidar código
   - Regenerar códigos no usados

   **Generación de códigos**:
   ```javascript
   // Backend: Generar códigos únicos
   function generateAttendanceCodes(edition, quantity, prefix = null) {
     const codes = [];
     const defaultPrefix = edition.slug.toUpperCase().substring(0, 4);

     for (let i = 0; i < quantity; i++) {
       const code = `${prefix || defaultPrefix}-${randomString(4)}-${randomString(4)}`;
       codes.push({
         code: code,
         edition: edition.id,
         is_used: false,
         used_by: null,
         used_at: null,
       });
     }

     return AttendanceCode.objects.bulk_create(codes);
   }
   ```

3. **Gestión de Jurado**:

   **Funcionalidades**:
   - Crear "Jurado" como rol/grupo especial
   - Asignar usuarios al jurado de una edición específica
   - Jurado puede votar en compos específicas o en todas
   - Ver estado de votación del jurado:
     - Jurado | Compos asignadas | Votos emitidos | Pendientes
   - Recordatorios a jurados que no han votado

   **Modelo de datos**:
   ```python
   class JuryMember(BaseModel):
       user = ForeignKey(User)
       edition = ForeignKey(Edition)
       compos = ManyToManyField(Compo, blank=True)  # Si vacío = todas
       notes = TextField(blank=True)  # Notas del admin sobre el jurado
   ```

4. **Períodos de Votación por Compo**:

   - Configurar período de votación diferente por competición
   - Fecha/hora de inicio
   - Fecha/hora de fin
   - Estado: Activo/Inactivo
   - Vista calendario con todos los períodos

5. **Dashboard de Votación en Tiempo Real**:

   **Métricas**:
   - Total de votos emitidos
   - Votos por compo (gráfico de barras)
   - Progreso: usuarios que han votado vs. usuarios elegibles
   - Si hay jurado: progreso del jurado
   - Timeline: votos por hora (gráfico de línea)

   **Tabla de resultados parciales** (oculta hasta cierre):
   - Por compo
   - Ranking provisional
   - Puntuación promedio
   - Número de votos recibidos
   - Opción de ocultar/mostrar según configuración

6. **Resultados Finales**:

   **Cálculo de resultados**:
   - Si modo público: promedio de puntuaciones
   - Si modo jurado: promedio de puntuaciones del jurado
   - Si modo mixto:
     ```
     final_score = (public_avg * public_weight/100) +
                   (jury_avg * jury_weight/100)
     ```

   **Exportación**:
   - Exportar resultados a PDF
   - Exportar a CSV
   - Generar informe detallado con estadísticas

   **Publicación**:
   - Botón "Publicar Resultados"
   - Una vez publicados, aparecen en:
     - Landing page pública
     - Sección de resultados en la app
     - StageRunner (pantalla de resultados)

#### Nuevos Modelos Backend Necesarios

```python
# backend/dpms/compos/models.py

class VotingConfiguration(BaseModel):
    """Configuración de votación para una edición"""
    edition = models.OneToOneField(
        Edition,
        on_delete=models.CASCADE,
        related_name='voting_config'
    )

    # Modalidad de votación
    VOTING_MODE_CHOICES = [
        ('public', 'Votación Pública 100%'),
        ('jury', 'Votación por Jurado 100%'),
        ('mixed', 'Modalidad Mixta'),
    ]
    voting_mode = models.CharField(
        max_length=10,
        choices=VOTING_MODE_CHOICES,
        default='public'
    )
    public_weight = models.PositiveIntegerField(
        default=100,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Peso de la votación pública (0-100%)"
    )
    jury_weight = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Peso de la votación del jurado (0-100%)"
    )

    # Control de acceso
    ACCESS_MODE_CHOICES = [
        ('open', 'Abierta por Tiempo'),
        ('code', 'Código de Asistencia'),
        ('manual', 'Verificación Manual'),
        ('checkin', 'Check-in Físico'),
    ]
    access_mode = models.CharField(
        max_length=10,
        choices=ACCESS_MODE_CHOICES,
        default='open'
    )

    # Configuración de resultados
    results_published = models.BooleanField(default=False)
    results_published_at = models.DateTimeField(null=True, blank=True)
    show_partial_results = models.BooleanField(
        default=False,
        help_text="Mostrar resultados parciales durante votación"
    )

    def clean(self):
        if self.voting_mode == 'mixed':
            if self.public_weight + self.jury_weight != 100:
                raise ValidationError(
                    "Los pesos deben sumar 100% en modo mixto"
                )

    def __str__(self):
        return f"Votación - {self.edition.title}"


class AttendanceCode(BaseModel):
    """Código de asistencia para verificar asistentes físicos"""
    code = models.CharField(max_length=50, unique=True)
    edition = models.ForeignKey(
        Edition,
        on_delete=models.CASCADE,
        related_name='attendance_codes'
    )
    is_used = models.BooleanField(default=False)
    used_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='used_codes'
    )
    used_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.edition.title}"


class AttendeeVerification(BaseModel):
    """Verificación manual de asistentes"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    edition = models.ForeignKey(Edition, on_delete=models.CASCADE)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='verifications_made'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_method = models.CharField(
        max_length=20,
        choices=[
            ('manual', 'Manual'),
            ('code', 'Código'),
            ('checkin', 'Check-in'),
        ],
        default='manual'
    )
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['user', 'edition']

    def __str__(self):
        return f"{self.user.email} - {self.edition.title}"


class JuryMember(BaseModel):
    """Miembro del jurado para una edición"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='jury_memberships'
    )
    edition = models.ForeignKey(
        Edition,
        on_delete=models.CASCADE,
        related_name='jury_members'
    )
    compos = models.ManyToManyField(
        Compo,
        blank=True,
        help_text="Compos en las que puede votar. Vacío = todas"
    )
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['user', 'edition']
        verbose_name = "Miembro del Jurado"
        verbose_name_plural = "Miembros del Jurado"

    def __str__(self):
        return f"{self.user.email} - Jurado {self.edition.title}"

    def can_vote_in_compo(self, compo):
        """Verifica si puede votar en una compo específica"""
        if not self.compos.exists():
            return True  # Puede votar en todas
        return self.compos.filter(id=compo.id).exists()
```

#### API Endpoints Necesarios

```
# Configuración de votación
GET    /api/voting-config/{edition_id}/           # Obtener config
PUT    /api/voting-config/{edition_id}/           # Actualizar config
POST   /api/voting-config/{edition_id}/publish/   # Publicar resultados

# Códigos de asistencia
POST   /api/attendance-codes/generate/            # Generar lote de códigos
GET    /api/attendance-codes/?edition={id}        # Listar códigos
POST   /api/attendance-codes/validate/            # Validar código (usuario)
DELETE /api/attendance-codes/{id}/                # Invalidar código
GET    /api/attendance-codes/export/?edition={id} # Exportar códigos

# Verificación de asistentes
GET    /api/attendee-verification/?edition={id}   # Listar verificaciones
POST   /api/attendee-verification/                # Verificar asistente
PUT    /api/attendee-verification/{id}/           # Actualizar verificación
GET    /api/attendee-verification/stats/          # Estadísticas

# Jurado
GET    /api/jury-members/?edition={id}            # Listar jurado
POST   /api/jury-members/                         # Añadir miembro al jurado
DELETE /api/jury-members/{id}/                    # Quitar del jurado
GET    /api/jury-members/{id}/voting-progress/    # Progreso de votación

# Resultados
GET    /api/voting-results/{edition_id}/          # Resultados finales
GET    /api/voting-results/{edition_id}/partial/  # Resultados parciales (admin)
GET    /api/voting-results/{edition_id}/export/   # Exportar resultados
GET    /api/voting-stats/{edition_id}/            # Estadísticas de votación
```

---

### 3.6 Gestión de Usuarios

**Ruta**: `/app/admin/users`

**Objetivo**: Administrar usuarios del sistema.

#### Funcionalidades

1. **Lista de Usuarios**:
   - Tabla con todos los usuarios
   - Columnas: Email, Nombre, Nickname, Grupo, Verificado, Fecha registro, Acciones
   - Filtros:
     - Por grupo (DPMS Admins, DPMS Users)
     - Verificados / No verificados
     - Activos / Inactivos
   - Búsqueda por email, nombre, nickname
   - Paginación

2. **Detalle de Usuario**:
   - Información completa del perfil
   - **Producciones del usuario**:
     - Lista de producciones enviadas
     - Estadísticas de participación
   - **Votos del usuario** (si es admin):
     - Historial de votos
     - Participación en votaciones
   - **Asignación de roles**:
     - Añadir/quitar de "DPMS Admins"
     - Añadir/quitar de jurado de ediciones
   - **Acciones**:
     - Activar/desactivar usuario
     - Verificar email manualmente
     - Resetear contraseña (enviar email)

3. **Estadísticas**:
   - Total de usuarios
   - Usuarios activos vs. inactivos
   - Verificados vs. no verificados
   - Usuarios con producciones
   - Gráfico de registros por mes

#### API Endpoints Necesarios

```
GET    /api/users/                       # Listar usuarios (admin)
GET    /api/users/{email}/               # Detalle usuario
PATCH  /api/users/{email}/toggle-admin/  # Añadir/quitar de admins
PATCH  /api/users/{email}/verify/        # Verificar manualmente
POST   /api/users/{email}/reset-password/ # Enviar reset password
GET    /api/users/stats/                 # Estadísticas
```

---

### 3.7 Gestión de Contenido (Landing Page)

**Rutas**: `/app/admin/news`, `/app/admin/gallery`, `/app/admin/settings`

**Objetivo**: Administrar contenido público de la landing page.

#### 3.7.1 Gestión de Noticias

**Funcionalidades**:
- CRUD completo de noticias
- Editor rich text (TinyMCE o Draft.js)
- Upload de imagen destacada
- Publicar/despublicar
- Destacar en portada
- Categorías
- Vista previa antes de publicar
- Programar publicación (fecha futura)

#### 3.7.2 Gestión de Galería

**Funcionalidades**:
- Upload masivo de fotos (drag & drop)
- Asociar fotos a ediciones
- Editar metadatos: título, descripción, fotógrafo
- Reordenar fotos (drag & drop)
- Destacar fotos
- Generar thumbnails automáticamente
- Eliminar fotos

#### 3.7.3 Configuración del Sitio

**Funcionalidades**:
- Editar configuración general (SiteSettings)
- Información del evento
- Configurar próxima edición
- Ubicación y mapa
- Redes sociales
- Información de contacto
- Activar/desactivar secciones
- Configurar banners/anuncios
- Vista previa de la landing page

---

## 4. Componentes Comunes

### 4.1 AdminLayout

Layout base para todas las páginas de administración.

```javascript
// components/admin/common/AdminLayout.js
import { Box, Container, Breadcrumbs, Link } from '@mui/material';

const AdminLayout = ({ children, title, breadcrumbs = [] }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <MainBar value={0} panel="admin" />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: { sm: '64px' } }}>
        <Container maxWidth="xl">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <Breadcrumbs sx={{ mb: 2 }}>
              <Link href="/app/admin/dashboard">Admin</Link>
              {breadcrumbs.map((crumb, i) => (
                <Link key={i} href={crumb.href}>{crumb.label}</Link>
              ))}
            </Breadcrumbs>
          )}

          {/* Title */}
          {title && (
            <Typography variant="h4" gutterBottom>
              {title}
            </Typography>
          )}

          {/* Content */}
          {children}
        </Container>
      </Box>
    </Box>
  );
};
```

### 4.2 DataTable

Tabla reutilizable con búsqueda, filtros, ordenación y paginación.

```javascript
// components/admin/common/DataTable.js
import { DataGrid } from '@mui/x-data-grid';
import { Box, TextField, Button } from '@mui/material';

const DataTable = ({
  columns,
  rows,
  onSearch,
  onFilter,
  onRowClick,
  onAdd,
  addButtonLabel = 'Añadir',
  searchPlaceholder = 'Buscar...',
}) => {
  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
        />
        {onAdd && (
          <Button variant="contained" onClick={onAdd}>
            {addButtonLabel}
          </Button>
        )}
      </Box>

      {/* Table */}
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        onRowClick={onRowClick}
        autoHeight
      />
    </Box>
  );
};
```

### 4.3 StatsCard

Card para mostrar estadísticas.

```javascript
// components/admin/common/StatsCard.js
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatsCard = ({ title, value, icon, color = 'primary', subtitle }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="h4">{value}</Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
```

### 4.4 ConfirmDialog

Diálogo de confirmación para acciones destructivas.

```javascript
// components/admin/common/ConfirmDialog.js
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

---

## 5. Permisos y Seguridad

### 5.1 Verificación de Permisos

**Frontend**:
```javascript
// components/common/AdminRoute.js
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, groups, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/app/login" replace />;
  }

  if (!groups.includes('DPMS Admins')) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
```

**Backend**:
```python
# backend/dpms/utils/permissions.py
from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    """
    Permite acceso solo a usuarios del grupo DPMS Admins
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.groups.filter(name='DPMS Admins').exists()
        )

class IsOwnerOrAdmin(BasePermission):
    """
    Permite acceso al propietario del objeto o a administradores
    """
    def has_object_permission(self, request, view, obj):
        # Admins pueden hacer todo
        if request.user.groups.filter(name='DPMS Admins').exists():
            return True

        # Propietario puede hacer CRUD de sus objetos
        return obj.uploaded_by == request.user
```

### 5.2 Logging de Acciones

Todas las acciones administrativas deben ser registradas:

```python
# backend/dpms/utils/audit.py
class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50)  # 'create', 'update', 'delete'
    model_name = models.CharField(max_length=50)
    object_id = models.PositiveIntegerField()
    changes = models.JSONField()
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action} - {self.model_name}#{self.object_id}"
```

---

## 6. Plan de Implementación

### Fase 1: Infraestructura Base (Semana 1)
- [ ] Crear AdminRoute HOC
- [ ] Crear AdminLayout
- [ ] Crear componentes comunes (DataTable, StatsCard, ConfirmDialog)
- [ ] Configurar rutas de administración
- [ ] Actualizar MainBar con menú de admin

### Fase 2: Dashboard y Ediciones (Semana 2)
- [ ] Implementar AdminDashboard
- [ ] Implementar EditionsPage (lista)
- [ ] Implementar EditionForm (crear/editar)
- [ ] Implementar EditionDetail con gestión de HasCompo
- [ ] API endpoints de ediciones

### Fase 3: Competiciones (Semana 3)
- [ ] Implementar ComposPage
- [ ] Implementar CompoForm
- [ ] Implementar CompoDetail
- [ ] API endpoints de compos
- [ ] Sistema de reordenamiento

### Fase 4: Producciones (Semana 4)
- [ ] Implementar ProductionsPage con filtros
- [ ] Implementar ProductionDetail (vista admin)
- [ ] Estadísticas y exportación
- [ ] API endpoints adicionales

### Fase 5: Usuarios (Semana 5)
- [ ] Implementar UsersPage
- [ ] Implementar UserDetail
- [ ] Gestión de roles
- [ ] Estadísticas de usuarios

### Fase 6: Sistema de Votación (Semanas 6-7)
- [ ] Implementar modelos backend (VotingConfiguration, etc.)
- [ ] Implementar VotingConfig component
- [ ] Sistema de códigos de asistencia
- [ ] Gestión de jurado
- [ ] Dashboard de votación en tiempo real
- [ ] Cálculo y publicación de resultados

### Fase 7: Contenido (Semana 8)
- [ ] Implementar NewsManager
- [ ] Implementar GalleryManager
- [ ] Implementar SiteSettings

### Fase 8: Testing y Refinamiento (Semana 9)
- [ ] Tests de componentes
- [ ] Tests de integración
- [ ] Refinamiento de UX
- [ ] Documentación

---

## Resumen

El Panel de Administración es un componente crítico de DPMS que permite gestionar todos los aspectos del sistema de manera centralizada. La implementación prioriza:

1. **Gestión de Ediciones y Competiciones**: Base del sistema
2. **Sistema de Votación Flexible**: Permitiendo múltiples modalidades y controles de acceso
3. **Gestión de Usuarios**: Control y estadísticas
4. **Contenido Público**: Noticias y galería para la landing page

El sistema de votación propuesto es especialmente robusto, permitiendo adaptarse a diferentes necesidades:
- Votación 100% pública
- Votación por jurado especializado
- Modalidades mixtas con ponderación configurable
- Control de acceso flexible (abierta, códigos, verificación manual, check-in)

Esta flexibilidad asegura que DPMS pueda adaptarse a las necesidades específicas de cada party y edición.
