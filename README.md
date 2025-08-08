# Portafolio macroz_16 (Next.js + Tailwind)

- Barra superior **negra**, página **blanca**.
- **Inicio** con foto de portada y botón **Ver galería**.
- **Galería masonry** (fluye según tamaño real).
- **Panel de administración oculto** (clic en el icono de la **cámara**).
  - Subir/pegar/arrastrar fotos **solo** en admin.
  - Destacar, renombrar, descripción, reordenar, borrar.
- **Vistas totales** del sitio (API `/api/views`):
  - Usa **Vercel KV** si configuras las variables.
  - Si no, muestra un contador demo en memoria.

## Requisitos
- Node 18+

## Arranque local
```bash
npm i
npm run dev
```
Abre http://localhost:3000

### Admin
Haz clic en la **cámara** (arriba izq.).
La contraseña se toma de `NEXT_PUBLIC_ADMIN_PASSWORD` en `.env.local`.
Si no existe, usa `macroz16`.

Crea `.env.local`:
```
NEXT_PUBLIC_ADMIN_PASSWORD=pon-aqui-tu-contraseña
# Opcional (Vercel KV)
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

## Despliegue en Vercel
1. Sube este repo a GitHub.
2. En Vercel → **New Project** → Importa el repo.
3. En **Environment Variables** añade:
   - `NEXT_PUBLIC_ADMIN_PASSWORD` (cámbiala).
   - `KV_REST_API_URL` y `KV_REST_API_TOKEN` si usas KV.
4. Deploy. Listo.

## Comandos Git (guía rápida)
```bash
git init
git add -A
git commit -m "Initial commit: macroz_16 portfolio"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/macroz-portfolio.git
git push -u origin main
```
