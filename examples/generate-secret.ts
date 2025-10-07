import { Secret } from "../index"

/**
 * Ejemplo: Generación de secretos
 *
 * Este ejemplo muestra cómo generar secretos para usar en 2FA.
 */

// Generar un secreto aleatorio (por defecto 20 bytes)
const secret = new Secret()
console.log("Secreto base32:", secret.base32)
console.log("Secreto hexadecimal:", secret.hex)

// Generar un secreto con tamaño personalizado
const customSecret = new Secret({ size: 32 })
console.log("\nSecreto personalizado (32 bytes) base32:", customSecret.base32)

// Crear un secreto desde un buffer existente
const buffer = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
const secretFromBuffer = new Secret({ buffer })
console.log("\nSecreto desde buffer base32:", secretFromBuffer.base32)