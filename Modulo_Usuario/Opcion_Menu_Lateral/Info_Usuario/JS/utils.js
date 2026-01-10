/**
 * utils.js - Funciones utilitarias del Portal de Usuario
 */

/**
 * Convierte un valor a texto seguro para UI
 * Evita mostrar [object Object] y maneja null/undefined
 * @param {*} valor - valor a convertir
 * @param {string} fallback - texto por defecto si el valor es inválido
 * @returns {string}
 */
export function safeTextNodo(valor, fallback = "") {
    if (valor === null || valor === undefined) return fallback;
    if (typeof valor === "object") return fallback;
    return String(valor);
}

/**
 * Obtiene el nodo activo desde sessionStorage de forma segura
 * @returns {Object} nodo o {}
 */
export function getNodoActivo() {
    try {
        const raw = sessionStorage.getItem('nodo_activo');
        if (!raw || raw === "undefined") return {};
        return JSON.parse(raw);
    } catch (e) {
        console.error("Error leyendo nodo_activo:", e);
        return {};
    }
}

/**
 * Genera iniciales a partir de nombres y apellidos o usuario
 * @param {string} nombre
 * @param {string} apellido
 * @param {string} usuario
 * @returns {string} iniciales en mayúscula
 */
export function generarIniciales(nombre, apellido, usuario) {
    nombre = safeTextNodo(nombre).trim();
    apellido = safeTextNodo(apellido).trim();
    usuario = safeTextNodo(usuario).trim();

    if (nombre) return (nombre.charAt(0) + (apellido ? apellido.charAt(0) : "")).toUpperCase();
    if (usuario) return usuario.substring(0, 2).toUpperCase();
    return "??";
}
