# Conecta Conceptos

Miniaplicación web para una dinámica presencial de asociación conceptual con **factor sorpresa**, diseñada para ejecutarse desde un subdominio en un servidor PHP.

## Flujo

1. El participante escanea el QR de la pantalla.
2. Escribe únicamente su primer nombre.
3. Elige una tarjeta boca abajo.
4. Descubre un concepto y una pista.
5. Busca a la persona cuyo concepto complementa el suyo.
6. El facilitador pulsa **Revelar conexiones**.
7. La pantalla muestra las conexiones y recién entonces revela que esas parejas serán las comunidades de aprendizaje.

## Rutas

- `/` — experiencia del participante.
- `/pantalla.php` — pantalla de proyección.
- `/facilitador/` — panel privado del facilitador.

## Requisitos

- PHP 8.0+.
- Extensión JSON de PHP.
- Permiso de escritura en `storage/`.
- HTTPS recomendado.
- Navegador moderno con WebGL para la capa 3D.
- No requiere MySQL, Node, npm ni proceso de build.

La interfaz utiliza Three.js desde CDN para los fondos y conexiones 3D. Si Three.js no puede cargarse, la experiencia mantiene un diseño 2D funcional como respaldo.

## Instalación en el servidor

```bash
git clone https://github.com/JorgeTonos28/conecta-conceptos.git
cd conecta-conceptos
cp .env.example .env
```

Edita `.env`:

```env
ADMIN_PASSWORD=una-clave-larga-y-privada
APP_URL=https://comunidades.caonalabs.com
```

Después garantiza que PHP pueda escribir en `storage/`:

```bash
chmod 775 storage
```

Si tu servidor usa un usuario web específico, ajusta propietario/grupo según tu hosting.

### Apache

El repositorio incluye `.htaccess` para proteger `.env` y el directorio `storage/`. El servidor debe permitir `AllowOverride`.

### Nginx

Añade reglas equivalentes para impedir acceso web a `.env`, `includes/` y `storage/`.

## Acceso del facilitador

Abre:

```
https://comunidades.caonalabs.com/facilitador/
```

Usa la contraseña configurada en `.env`.

Desde el panel puedes:

- definir 2, 4, 6, 8 o 10 participantes;
- marcar y desmarcar los pares conceptuales sin que el refresco en vivo revierta tu selección;
- usar **Sugerir pares** para obtener una selección rápida;
- restaurar la configuración activa;
- aplicar una configuración nueva sólo cuando estés listo;
- ver participantes registrados;
- ocultar o mostrar conceptos únicamente en tu panel;
- eliminar una entrada accidental;
- abrir la pantalla de proyección;
- revelar las conexiones;
- reiniciar para volver a ensayar.

La cantidad de participantes debe ser par porque cada comunidad nace de un par conceptual.

## Conceptos incluidos

- Datos ↔ Validación
- Ficha ↔ Registro
- Macro ↔ Automatización
- Formulario ↔ Captura
- Lista ↔ Desplegable

Cada pareja tiene un nombre que sólo se muestra en la revelación final.

## Persistencia

El estado se guarda en un archivo JSON con bloqueo de archivo (`flock`) para evitar asignaciones duplicadas cuando varias personas interactúan a la vez.

El archivo de estado NO se versiona en Git.

## Diseño y animación

La experiencia incorpora:

- tarjetas con profundidad y animación 3D;
- fondos WebGL con Three.js;
- partículas, nodos y planos flotantes;
- animación de convergencia al revelar conexiones;
- parallax suave según el movimiento del puntero;
- transiciones escalonadas;
- soporte de `prefers-reduced-motion`;
- fallback visual si WebGL o Three.js no están disponibles.

## QR

La pantalla de proyección genera la imagen QR mediante el servicio público de QRServer. Si el QR no carga, la URL de acceso siempre queda visible y puede escribirse manualmente.

## Seguridad

- Nunca subas `.env` al repositorio.
- Utiliza HTTPS.
- Usa una contraseña de facilitador exclusiva para esta herramienta.
- Los participantes sólo suministran su primer nombre.
- El panel utiliza sesión PHP y token CSRF para acciones administrativas.
- El estado se puede reiniciar al terminar la clase para borrar los nombres capturados.

## Ensayo recomendado

Antes de la práctica:

1. Abre `/pantalla.php` en la computadora que proyectarás.
2. Abre `/facilitador/` en otra pestaña.
3. Selecciona 6 participantes y tres pares.
4. Pulsa **Aplicar configuración e iniciar**.
5. Prueba el flujo desde varios teléfonos.
6. Verifica las tarjetas, pistas y persistencia al recargar.
7. Ejecuta **Revelar conexiones**.
8. Reinicia y deja la experiencia limpia para la clase.
