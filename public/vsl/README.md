# Carpeta del video VSL

Coloca aquí el video y su poster:

- `vsl.mp4` — video principal (H.264/AAC, 1080p, idealmente < 60 MB)
- `poster.jpg` — imagen de portada (1920×1080)

Luego define en `.env.local`:

```
VITE_VSL_VIDEO_URL=/vsl/vsl.mp4
VITE_VSL_POSTER_URL=/vsl/poster.jpg
```

Mientras no existan, la landing muestra un placeholder de marca.
