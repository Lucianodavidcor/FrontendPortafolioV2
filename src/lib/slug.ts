/**
 * Genera un slug URL-amigable a partir de un título de proyecto.
 *
 * Ej: "API RESTful para E-commerce" → "api-restful-para-e-commerce"
 *     "Portafolio WEB V2 (2024)"    → "portafolio-web-v2-2024"
 */
export function toSlug(title: string): string {
  return title
    .normalize('NFD')                        // Descompone caracteres acentuados (é → e + ́)
    .replace(/[\u0300-\u036f]/g, '')        // Elimina los diacríticos (acentos, tilde, etc.)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')          // Elimina todo excepto letras, números, espacios y guiones
    .trim()
    .replace(/[\s_]+/g, '-')               // Reemplaza espacios y guiones bajos por guión
    .replace(/-{2,}/g, '-');               // Colapsa múltiples guiones consecutivos en uno solo
}
