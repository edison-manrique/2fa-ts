/**
 * Implementación de funciones HMAC para la librería 2FA
 * 
 * Este módulo proporciona una implementación de funciones HMAC necesarias
 * para los algoritmos HOTP y TOTP. Soporta SHA-1, SHA-256 y SHA-512,
 * y funciona tanto en navegadores modernos como en Node.js.
 */

// For the browser/DOM environment
declare global {
  interface Window {
    crypto: Crypto
  }
}

// Browser/Deno/WebWorker support
const webCrypto: Crypto | undefined =
  typeof window !== "undefined" && window.crypto
    ? window.crypto
    : typeof globalThis !== "undefined" && (globalThis as any).crypto
    ? (globalThis as any).crypto
    : undefined

// Node.js support
let nodeCrypto: any
try {
  nodeCrypto = typeof require !== "undefined" ? require("node:crypto") : undefined
} catch (e) {
  nodeCrypto = undefined
}

/**
 * Convierte una cadena a bytes usando la codificación UTF8.
 * @param str - Cadena a convertir
 * @returns Uint8Array con los bytes UTF-8
 */
function utf8ToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

/**
 * Normaliza una cadena o un Uint8Array a un Uint8Array.
 * @param data - Datos a normalizar
 * @returns Uint8Array normalizado
 */
function toBytes(data: string | Uint8Array): Uint8Array {
  if (typeof data === "string") return utf8ToBytes(data)
  return data
}

/**
 * Realiza una operación XOR entre dos Uint8Array.
 * @param a - Primer array
 * @param b - Segundo array
 * @returns Resultado de la operación XOR
 */
function xorArrays(a: Uint8Array, b: Uint8Array): Uint8Array {
  const length = Math.min(a.length, b.length)
  const result = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    result[i] = a[i] ^ b[i]
  }
  return result
}

/**
 * Implementación simple de SHA-1 (solo para demostración, no para uso en producción)
 * En un entorno real, se recomienda usar la implementación nativa del navegador o Node.js
 * 
 * @param message - Mensaje a hashear
 * @returns Hash SHA-1 del mensaje
 * @throws {Error} Si no hay implementación disponible
 */
async function sha1(message: Uint8Array): Promise<Uint8Array> {
  // Try to use Web Crypto API first
  if (webCrypto && webCrypto.subtle) {
    try {
      const hashBuffer = await webCrypto.subtle.digest("SHA-1", new Uint8Array(message).buffer)
      return new Uint8Array(hashBuffer)
    } catch (e) {
      // Fall through to node implementation
    }
  }

  // Try to use Node.js crypto
  if (nodeCrypto) {
    try {
      const hash = nodeCrypto.createHash("sha1")
      hash.update(message)
      return new Uint8Array(hash.digest())
    } catch (e) {
      // Fall through to simple implementation
    }
  }

  // Simple SHA-1 implementation (for demonstration only)
  throw new Error("SHA-1 implementation not available")
}

/**
 * Implementación simple de SHA-256
 * 
 * @param message - Mensaje a hashear
 * @returns Hash SHA-256 del mensaje
 * @throws {Error} Si no hay implementación disponible
 */
async function sha256(message: Uint8Array): Promise<Uint8Array> {
  // Try to use Web Crypto API first
  if (webCrypto && webCrypto.subtle) {
    try {
      const hashBuffer = await webCrypto.subtle.digest("SHA-256", new Uint8Array(message).buffer)
      return new Uint8Array(hashBuffer)
    } catch (e) {
      // Fall through to node implementation
    }
  }

  // Try to use Node.js crypto
  if (nodeCrypto) {
    try {
      const hash = nodeCrypto.createHash("sha256")
      hash.update(message)
      return new Uint8Array(hash.digest())
    } catch (e) {
      // Fall through to error
    }
  }

  throw new Error("SHA-256 implementation not available")
}

/**
 * Implementación simple de SHA-512
 * 
 * @param message - Mensaje a hashear
 * @returns Hash SHA-512 del mensaje
 * @throws {Error} Si no hay implementación disponible
 */
async function sha512(message: Uint8Array): Promise<Uint8Array> {
  // Try to use Web Crypto API first
  if (webCrypto && webCrypto.subtle) {
    try {
      const hashBuffer = await webCrypto.subtle.digest("SHA-512", new Uint8Array(message).buffer)
      return new Uint8Array(hashBuffer)
    } catch (e) {
      // Fall through to node implementation
    }
  }

  // Try to use Node.js crypto
  if (nodeCrypto) {
    try {
      const hash = nodeCrypto.createHash("sha512")
      hash.update(message)
      return new Uint8Array(hash.digest())
    } catch (e) {
      // Fall through to error
    }
  }

  throw new Error("SHA-512 implementation not available")
}

/**
 * Función para obtener la función hash adecuada según el algoritmo
 * 
 * @param algorithm - Nombre del algoritmo ("SHA1", "SHA256", "SHA512")
 * @returns Función hash correspondiente
 * @throws {Error} Si el algoritmo no está soportado
 */
function getHashFunction(algorithm: string): (message: Uint8Array) => Promise<Uint8Array> {
  switch (algorithm.toLowerCase()) {
    case "sha1":
      return sha1
    case "sha256":
      return sha256
    case "sha512":
      return sha512
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`)
  }
}

/**
 * Implementación de HMAC según RFC 2104
 * 
 * Esta función implementa el algoritmo HMAC necesario para HOTP y TOTP.
 * Utiliza las implementaciones nativas de criptografía del entorno cuando
 * están disponibles (navegador o Node.js), y recurre a implementaciones
 * personalizadas si es necesario.
 * 
 * @param algorithm - Algoritmo hash a usar ("SHA1", "SHA256", "SHA512")
 * @param key - Clave para el HMAC
 * @param message - Mensaje a procesar
 * @returns Digest HMAC del mensaje
 * 
 * @example
 * ```typescript
 * const key = new TextEncoder().encode("clave_secreta");
 * const message = new TextEncoder().encode("mensaje");
 * const digest = await hmacDigest("SHA1", key, message);
 * ```
 * 
 * @see [RFC 2104](https://tools.ietf.org/html/rfc2104)
 */
export async function hmacDigest(algorithm: string, key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const hashFunc = getHashFunction(algorithm)

  // Supongamos un tamaño de bloque de 64 bytes (para SHA-1, SHA-256)
  // y 128 bytes para SHA-512
  const blockSize = algorithm.toLowerCase() === "sha512" ? 128 : 64

  // Si la clave es más larga que el tamaño de bloque, la hasheamos
  if (key.length > blockSize) {
    key = await hashFunc(key)
  }

  // Rellenamos la clave con ceros hasta el tamaño de bloque
  if (key.length < blockSize) {
    const newKey = new Uint8Array(blockSize)
    newKey.set(key)
    key = newKey
  }

  // Creamos los paddings internos y externos
  const innerPadding = new Uint8Array(blockSize)
  const outerPadding = new Uint8Array(blockSize)

  for (let i = 0; i < blockSize; i++) {
    innerPadding[i] = key[i] ^ 0x36
    outerPadding[i] = key[i] ^ 0x5c
  }

  // Concatenamos el padding interno con el mensaje y lo hasheamos
  const innerMessage = new Uint8Array(innerPadding.length + message.length)
  innerMessage.set(innerPadding)
  innerMessage.set(message, innerPadding.length)
  const innerHash = await hashFunc(innerMessage)

  // Concatenamos el padding externo con el hash interno y lo hasheamos
  const outerMessage = new Uint8Array(outerPadding.length + innerHash.length)
  outerMessage.set(outerPadding)
  outerMessage.set(innerHash, outerPadding.length)

  return await hashFunc(outerMessage)
}