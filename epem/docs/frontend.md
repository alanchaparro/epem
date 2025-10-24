# Frontend (Next.js)

- Directorio: `apps/web`
- Rewrites: las peticiones de datos usan el prefijo `/api/` y se proxean al gateway (4000).
- Estado de datos: React Query
- Validación: react-hook-form + zod
- Notificaciones: react-hot-toast

## Rutas
- `/login` — formulario de acceso (POST /auth/login)
- `/profile` — muestra datos del usuario autenticado (GET /users/me)
- `/patients` — lista/búsqueda + paginación
- `/patients/new` — alta con validaciones y toasts
- `/patients/:id` — edición con validaciones y toasts
- `/catalog` / `/catalog/new` / `/catalog/:id` — gestión de prestaciones
- `/insurers` — listado/alta de aseguradoras
- `/insurers/:id/coverage` — gestión de coberturas por aseguradora

## Ejemplo de fetch
```ts
import { apiFetch } from '@/lib/api';

const data = await apiFetch('/api/patients?q=perez&skip=0&take=20');
```

## Navegación / Logout
- Barra superior `EPEM` con enlaces a Pacientes/Perfil y botón de Salir.
- Logout llama `POST /auth/logout`, limpia `localStorage` y redirige a `/login`.

## Sesión y reintentos
- `apiFetch` refresca automáticamente el access token cuando recibe 401 ejecutando `POST /auth/refresh`, guarda el nuevo token en `localStorage` y reintenta una vez la petición original.
- Si el refresh falla, la llamada original devolverá el error y la UI debe manejar el caso (por ejemplo, redirigir a `/login`).

## Producción
- Define `API_GATEWAY_URL` en el entorno (por ejemplo, en `.env.prod`) para que las rutas `/auth/*`, `/users/*`, `/patients/*`, `/orders/*`, `/billing/*` y `/catalog/*` se reescriban correctamente hacia el API Gateway en producción (ver `apps/web/next.config.js`).
