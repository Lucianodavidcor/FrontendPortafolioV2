const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tu-dominio.com/api/v1';

interface FetchOptions extends RequestInit {
  token?: string;
}

/**
 * Cliente base para realizar peticiones a la API.
 * Centraliza la configuración de headers, tokens y manejo de errores.
 */
export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...restOptions } = options;

  const headers = new Headers(customHeaders);
  headers.set('Content-Type', 'application/json');

  // Si pasamos un token (para las rutas privadas), lo inyectamos aquí
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers,
    ...restOptions,
  });

  // Intentamos parsear el JSON de respuesta
  const data = await response.json().catch(() => null);

  // Manejo de errores basado en la nota de tu backend (Ej. código 400 Bad Request)
  if (!response.ok) {
    const errorMessage = data?.error?.message || `Error HTTP: ${response.status}`;
    throw new Error(errorMessage);
  }

  // Si el backend devuelve un 204 No Content (como en los DELETE), data será null
  return data as T;
}