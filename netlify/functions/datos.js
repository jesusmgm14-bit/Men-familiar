import { getStore } from "@netlify/blobs";

// Almacén compartido único para toda la app: todos los dispositivos que
// visiten el mismo sitio leen y escriben aquí, así que los datos se comparten.
const NOMBRE_ALMACEN = "planificador-comidas";

export default async (req) => {
  const store = getStore(NOMBRE_ALMACEN);

  const cabeceras = { "Content-Type": "application/json" };

  if (req.method === "GET") {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    if (!key) {
      return new Response(JSON.stringify({ error: "Falta el parámetro 'key'" }), { status: 400, headers: cabeceras });
    }
    const valor = await store.get(key);
    return new Response(JSON.stringify({ key, value: valor ?? null }), { status: 200, headers: cabeceras });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch (_) {
      return new Response(JSON.stringify({ error: "JSON inválido" }), { status: 400, headers: cabeceras });
    }
    const { key, value } = body || {};
    if (!key) {
      return new Response(JSON.stringify({ error: "Falta 'key'" }), { status: 400, headers: cabeceras });
    }
    await store.set(key, typeof value === "string" ? value : JSON.stringify(value));
    return new Response(JSON.stringify({ ok: true, key }), { status: 200, headers: cabeceras });
  }

  return new Response(JSON.stringify({ error: "Método no permitido" }), { status: 405, headers: cabeceras });
};

// Esto hace que la función responda en /api/datos en vez de la ruta larga por defecto
export const config = { path: "/api/datos" };
