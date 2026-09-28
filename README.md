# Trazo CV

App de escritorio (Electron + React + TypeScript + Tailwind v4 + Framer Motion) para crear un CV distinto para cada oferta.

## Uso

```bash
npm install
npm run dev     # desarrollo con recarga en caliente
npm start       # compila y abre la app
npm run dist    # genera el instalador de Windows en release/
```

## Crear el instalador

```bash
npm run dist            # release/TrazoCV-Setup-<versión>.exe  (instalador)
npm run dist:portable   # release/TrazoCV-Portable-<versión>.exe (sin instalar)
```

- El instalador está en español, deja elegir la carpeta y crea accesos directos en el escritorio y el menú Inicio.
- Al desinstalar no se borran los CV guardados.
- El ícono sale de `build/icon.png` (1024×1024).
- Para publicar una versión nueva, sube `"version"` en `package.json` antes de compilar.
### Publicar una versión (automático)

1. Sube `"version"` en `package.json` (p. ej. `1.2.0`) y haz commit.
2. Crea y sube la etiqueta: `git tag v1.2.0 && git push origin main --tags`.
3. GitHub Actions ([.github/workflows/release.yml](.github/workflows/release.yml)) compila el instalador y el portable en Windows y los adjunta a la Release `v1.2.0`.

Para recompilar una versión ya publicada: pestaña **Actions → Release Windows → Run workflow** e indica la etiqueta.

- El .exe no está firmado digitalmente: Windows SmartScreen mostrará «Windows protegió su PC» → «Más información» → «Ejecutar de todas formas». Para quitar ese aviso hace falta un certificado de firma de código.

1. **Mis datos**: nombre, profesión, correo, teléfono, ubicación y enlaces (LinkedIn, GitHub, portafolio…). Se escriben una sola vez y se reutilizan en todos los CV.
2. **Nuevo CV**: indica tu situación (opcional) y la app te recomienda un formato:
   | Formato | Para quién |
   |---|---|
   | Cronológico | Experiencia continua en el mismo campo |
   | Funcional | Cambio de carrera, huecos laborales |
   | Mixto (cronológico-funcional) | Experiencia variada con logros destacables |
   | Harvard | Estudiantes, recién egresados, consultoría/finanzas; una página |
   | Cambridge | Reino Unido, Europa, academia |
   | Primer empleo | Poca o ninguna experiencia |
   | En blanco | Tú decides todo |
3. Empieza **con las secciones sugeridas vacías** (cada una con consejos) o **totalmente desde cero**.
4. En el editor: añade, quita, oculta, renombra y reordena secciones; elige qué datos de contacto mostrar; cambia diseño (Clásico, Harvard, Cambridge, Moderno), color, tipografía y densidad. Se guarda solo.
5. **Exportar PDF** genera un A4 con enlaces clicables. La vista previa marca dónde caerán los saltos de página.

Los datos se guardan en `%APPDATA%/generador-cv/datos-cv.json`.

## Estructura

```
electron/main.cjs      ventana, guardado en JSON, exportación a PDF
electron/preload.cjs   puente seguro window.api
src/templates.ts       tipos de CV, secciones sugeridas y consejos
src/cv/CvDocument.tsx  renderizado del CV (4 diseños) + cv.css (A4 / impresión)
src/screens/           Inicio, Mis datos, Asistente, Editor
```

> Si `npm run dev` abre Node en vez de la ventana, la variable `ELECTRON_RUN_AS_NODE` está definida en tu terminal; bórrala (`Remove-Item Env:ELECTRON_RUN_AS_NODE`).
