"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Instagram, Camera, Trash2, Github, Image as ImageIcon,
  Star, StarOff, LogOut, ArrowUp, ArrowDown, Edit3
} from "lucide-react";

const STORAGE_KEY = "macroz_16_gallery_v3";
const ADMIN_SESSION_KEY = "macroz_16_admin";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "macroz16";

const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function Page() {
  const [route, setRoute] = useState("home"); // home | gallery | admin
  const [images, setImages] = useState([]);
  const [dense, setDense] = useState(4);
  const [isAdmin, setIsAdmin] = useState(false);
  const [query, setQuery] = useState("");
  const [views, setViews] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setImages(JSON.parse(raw));
      setIsAdmin(localStorage.getItem(ADMIN_SESSION_KEY) === "1");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    } catch {}
  }, [images]);

  useEffect(() => {
    fetch("/api/views", { method: "POST" })
      .then(r => r.json())
      .then(d => setViews(d?.total ?? null))
      .catch(() => setViews(null));
  }, []);

  const addFiles = useCallback(async (files) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const payload = [];
    for (const file of arr) {
      const src = await readFileAsDataURL(file);
      const dims = await new Promise((res) => {
        const img = new Image();
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
        img.src = src;
      });
      payload.push({
        id: crypto.randomUUID(),
        src,
        name: file.name,
        addedAt: Date.now(),
        featured: false,
        caption: "",
        ...dims,
      });
    }
    setImages((prev) => [...payload, ...prev]);
  }, []);

  useEffect(() => {
    if (!(isAdmin && route === "admin")) return;
    const onPaste = async (e) => {
      const files = [];
      for (const item of e.clipboardData?.items || []) {
        if (item.type.startsWith("image/")) files.push(item.getAsFile());
      }
      if (files.length) await addFiles(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addFiles, isAdmin, route]);

  const clearAll = () => {
    if (confirm("¿Eliminar todas las fotos de este navegador?")) {
      setImages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const removeOne = (id) => setImages((prev) => prev.filter((p) => p.id !== id));
  const toggleFeatured = (id) =>
    setImages((prev) => prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)));
  const renameOne = (id) => {
    const name = prompt("Nuevo nombre (visual)");
    if (!name) return;
    setImages((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };
  const captionOne = (id) => {
    const caption = prompt("Descripción de la foto");
    setImages((prev) => prev.map((p) => (p.id === id ? { ...p, caption: caption ?? p.caption } : p)));
  };
  const move = (id, dir) => {
    setImages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const target = dir === "up" ? Math.max(0, idx - 1) : Math.min(prev.length - 1, idx + 1);
      const [item] = next.splice(idx, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const columnsClass = {
    2: "columns-1 sm:columns-2",
    3: "columns-1 sm:columns-2 md:columns-3",
    4: "columns-1 sm:columns-2 md:columns-3 lg:columns-4",
    5: "columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5",
    6: "columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6",
  }[dense] || "columns-1 sm:columns-2 md:columns-3";

  const galleryList = [...images]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.addedAt - a.addedAt)
    .filter((p) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return p.name?.toLowerCase().includes(q) || p.caption?.toLowerCase().includes(q);
    });

  const heroSrc = images.find((i) => i.featured)?.src || images[0]?.src || "";

  const login = async () => {
    const pass = (prompt("Contraseña de administrador") || "").trim();
    if (pass === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_SESSION_KEY, "1");
      setIsAdmin(true);
      setRoute("admin");
    } else {
      alert("Contraseña incorrecta");
    }
  };
  const logout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdmin(false);
    setRoute("home");
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/75">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => (isAdmin ? setRoute("admin") : login())} className="text-white" aria-label="Panel" title=" ">
              <Camera className="h-6 w-6" />
            </button>
            <button onClick={() => setRoute("home")} className="text-white font-bold tracking-wide">
              macroz_16
            </button>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-neutral-200 md:flex">
            <button onClick={() => setRoute("home")} className="hover:text-white">Inicio</button>
            <button onClick={() => setRoute("gallery")} className="hover:text-white">Galería</button>
            <a href="#contacto" className="hover:text-white">Contacto</a>
            <a className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-white hover:border-white/40"
               href="https://instagram.com/macroz_16" target="_blank" rel="noreferrer">
              <Instagram className="h-4 w-4" /> @macroz_16
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black shadow hover:shadow-md">
                <LogOut className="h-4 w-4" /> Salir
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                   onChange={(e) => addFiles(e.target.files)} />
          </div>
        </div>
      </header>

      {route === "home" && (
        <section className="relative h-[68vh] w-full overflow-hidden">
          {heroSrc ? (
            <img src={heroSrc} alt="Portada" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-200 to-white" />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-start justify-center px-4 text-white">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold md:text-5xl">
              Portafolio de macroz_16
            </motion.h1>
            <p className="mt-3 max-w-xl text-white/80">
              Fotografía con carácter — una galería viva que se adapta al tamaño de cada imagen.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setRoute("gallery")} className="rounded-xl bg-white px-5 py-2 font-medium text-black shadow">
                Ver galería
              </button>
              {views !== null && (
                <span className="rounded-xl border border-white/60 px-4 py-2 text-white/90 text-sm">
                  {Number(views).toLocaleString()} vistas
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {route === "gallery" && (
        <main className="mx-auto max-w-7xl px-4 pb-16">
          <div className="my-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Galería</h1>
            <div className="flex items-center gap-3 text-sm">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o descripción"
                     className="w-64 rounded-md border border-neutral-300 bg-white px-2 py-1" />
              <label className="flex items-center gap-2">
                <span className="text-neutral-600">Rejilla</span>
                <select value={dense} onChange={(e) => setDense(Number(e.target.value))}
                        className="rounded-md border border-neutral-300 bg-white px-2 py-1">
                  <option value={2}>Cómoda</option>
                  <option value={3}>Acogedora</option>
                  <option value={4}>Compacta</option>
                  <option value={5}>Densa</option>
                  <option value={6}>Ultra</option>
                </select>
              </label>
            </div>
          </div>

          {galleryList.length === 0 ? (
            <div className="rounded-2xl border p-10 text-center text-neutral-600">
              No hay fotos aún. Entra al panel (clic en la cámara) para subir.
            </div>
          ) : (
            <div className={`${columnsClass} gap-4`}>
              <AnimatePresence>
                {galleryList.map((img) => (
                  <motion.figure key={img.id} layout
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                    className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
                  >
                    <img src={img.src} alt={img.name || "Foto"} className="block h-auto w-full object-cover" loading="lazy" />
                    {(img.caption || img.featured) && (
                      <div className="flex items-center justify-between px-3 py-2 text-xs text-neutral-700">
                        <span className="truncate" title={img.caption}>{img.caption || ""}</span>
                        {img.featured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-black px-2 py-0.5 text-[10px] font-medium text-white">
                            <Star className="h-3 w-3" /> Destacada
                          </span>
                        )}
                      </div>
                    )}
                  </motion.figure>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      )}

      {route === "admin" && (
        <section className="mx-auto max-w-7xl px-4 py-10">
          {!isAdmin ? (
            <div className="mx-auto max-w-sm rounded-2xl border p-6 shadow-sm text-center">
              <h1 className="text-xl font-semibold">Panel privado</h1>
              <p className="mt-1 text-sm text-neutral-600">
                Para entrar, haz clic de nuevo en la <b>cámara</b> y escribe tu contraseña.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h1 className="text-2xl font-semibold">Administración</h1>
                  <p className="text-sm text-neutral-600">
                    Vistas totales:{" "}
                    <span className="font-semibold">
                      {views !== null ? Number(views).toLocaleString() : "—"}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white shadow hover:shadow-md">
                    <Upload className="h-4 w-4" /> Añadir fotos
                  </button>
                  <button onClick={() => setRoute("gallery")} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">
                    Ver galería
                  </button>
                </div>
              </div>

              <div onDragOver={(e) => e.preventDefault()}
                   onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                   className="rounded-xl border-2 border-dashed p-6 text-center">
                Arrastra y suelta fotos aquí o usa “Añadir fotos”.
                <div className="mt-2 text-xs text-neutral-500">También puedes pegar (Ctrl/Cmd+V).</div>
              </div>

              <div className="overflow-hidden rounded-2xl border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-neutral-600">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Miniatura</th>
                      <th className="p-2">Nombre</th>
                      <th className="p-2">Tamaño</th>
                      <th className="p-2">Descripción</th>
                      <th className="p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {images.map((img, i) => (
                      <tr key={img.id} className="border-t align-middle">
                        <td className="p-2 text-neutral-500">{i + 1}</td>
                        <td className="p-2"><img src={img.src} alt="thumb" className="h-14 w-20 rounded object-cover" /></td>
                        <td className="p-2">
                          <div className="max-w-[22ch] truncate" title={img.name}>{img.name}</div>
                          <div className="text-[11px] text-neutral-500">{new Date(img.addedAt).toLocaleString()}</div>
                        </td>
                        <td className="p-2 text-neutral-600">{img.w}×{img.h}px</td>
                        <td className="p-2 max-w-[24ch] truncate" title={img.caption || "—"}>{img.caption || "—"}</td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-1">
                            <button onClick={() => move(img.id, "up")} className="rounded border px-2 py-1 text-xs hover:bg-neutral-50" title="Subir">
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => move(img.id, "down")} className="rounded border px-2 py-1 text-xs hover:bg-neutral-50" title="Bajar">
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => renameOne(img.id)} className="rounded border px-2 py-1 text-xs hover:bg-neutral-50" title="Renombrar">
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => captionOne(img.id)} className="rounded border px-2 py-1 text-xs hover:bg-neutral-50" title="Editar descripción">
                              <span className="text-[10px]">Desc</span>
                            </button>
                            <button onClick={() => toggleFeatured(img.id)} className="rounded border px-2 py-1 text-xs hover:bg-neutral-50" title="Destacar">
                              {img.featured ? <Star className="h-3.5 w-3.5" /> : <StarOff className="h-3.5 w-3.5" />}
                            </button>
                            <button onClick={() => removeOne(img.id)} className="rounded border px-2 py-1 text-xs text-red-600 hover:bg-red-50" title="Eliminar">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {images.length > 0 && (
                <div className="flex justify-end">
                  <button onClick={clearAll} className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50">
                    Vaciar todo
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <footer id="contacto" className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Contacto</h2>
            <p className="mt-1 max-w-xl text-sm text-neutral-600">
              Escríbeme por Instagram <a className="underline" href="https://instagram.com/macroz_16" target="_blank" rel="noreferrer">@macroz_16</a>.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50" href="https://instagram.com/macroz_16" target="_blank" rel="noreferrer">
              <Instagram className="h-4 w-4" /> Instagram
            </a>
            <a className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50" href="https://github.com/" target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" /> GitHub
            </a>
          </div>
        </div>
        <div className="bg-black py-3 text-center text-xs text-white/70">© {new Date().getFullYear()} macroz_16 — Portafolio</div>
      </footer>
    </div>
  );
}
