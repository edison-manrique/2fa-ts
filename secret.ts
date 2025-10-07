/**
 * Devuelve bytes aleatorios.
 * @param size Tamaño.
 * @returns Bytes aleatorios.
 */
const randomBytes = (size: number): Uint8Array => {
  if (globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(new Uint8Array(size))
  } else {
    throw new Error("API de criptografía no disponible")
  }
}

/** Alfabeto base32 de RFC 4648 sin relleno. */
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

/** 
 * Convierte una cadena base32 a un Uint8Array (RFC 4648).
 * @param str Cadena en formato base32
 * @returns Uint8Array con los bytes decodificados
 */
const base32Decode = (str: string): Uint8Array => {
  str = str.replace(/ /g, "").toUpperCase()
  let end = str.length
  while (str[end - 1] === "=") --end
  str = str.substring(0, end)

  const buf = new ArrayBuffer(((str.length * 5) / 8) | 0)
  const arr = new Uint8Array(buf)
  let bits = 0
  let value = 0
  let index = 0
  for (let i = 0; i < str.length; i++) {
    const idx = ALPHABET.indexOf(str[i])
    if (idx === -1) throw new TypeError(`Carácter inválido encontrado: ${str[i]}`)
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bits -= 8
      arr[index++] = value >>> bits
    }
  }
  return arr
}

/** 
 * Convierte un Uint8Array a una cadena base32 (RFC 4648).
 * @param arr Uint8Array a codificar
 * @returns Cadena en formato base32
 */
const base32Encode = (arr: Uint8Array): string => {
  let bits = 0
  let value = 0
  let str = ""
  for (let i = 0; i < arr.length; i++) {
    value = (value << 8) | arr[i]
    bits += 8
    while (bits >= 5) {
      str += ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) {
    str += ALPHABET[(value << (5 - bits)) & 31]
  }
  return str
}

// Lookup table precomputada para convertir bytes a representación hexadecimal
const HEX_LUT = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"))

/** 
 * Convierte un Uint8Array a una cadena hexadecimal usando manipulación eficiente de bytes.
 * @param bytes Uint8Array a convertir
 * @returns Representación hexadecimal como cadena
 */
const bytesToHex = (bytes: Uint8Array): string => {
  const hex = new Array(bytes.length * 2)
  for (let i = 0; i < bytes.length; i++) {
    hex[i * 2] = HEX_LUT[bytes[i] >>> 4]
    hex[i * 2 + 1] = HEX_LUT[bytes[i] & 0x0f]
  }
  return hex.join("")
}

/**
 * Clave secreta OTP.
 * 
 * Esta clase representa una clave secreta utilizada en los algoritmos HOTP y TOTP.
 * Proporciona métodos para generar secretos aleatorios, crear secretos desde datos
 * existentes y convertir entre diferentes representaciones (bytes, base32, hexadecimal).
 * 
 * @example
 * ```typescript
 * // Generar un secreto aleatorio
 * const secret = new Secret();
 * 
 * // Crear un secreto desde una cadena base32
 * const secretFromBase32 = Secret.fromBase32("JBSWY3DPEHPK3PXP");
 * 
 * // Acceder a diferentes representaciones
 * console.log(secret.base32); // Representación base32
 * console.log(secret.hex);    // Representación hexadecimal
 * ```
 */
export class Secret {
  public readonly bytes: Uint8Array

  /**
   * Crea un objeto de clave secreta.
   * 
   * @param options - Opciones para crear el secreto
   * @param options.buffer - Bytes existentes para usar como secreto
   * @param options.size - Tamaño del secreto en bytes (por defecto 20)
   * 
   * @example
   * ```typescript
   * // Generar un secreto aleatorio de 20 bytes (por defecto)
   * const secret1 = new Secret();
   * 
   * // Generar un secreto aleatorio de 32 bytes
   * const secret2 = new Secret({ size: 32 });
   * 
   * // Crear un secreto desde bytes existentes
   * const bytes = new Uint8Array([1, 2, 3, 4, 5]);
   * const secret3 = new Secret({ buffer: bytes });
   * ```
   */
  constructor({ buffer, size = 20 }: { buffer?: Uint8Array; size?: number } = {}) {
    this.bytes = typeof buffer === "undefined" ? randomBytes(size) : new Uint8Array(buffer)
    Object.defineProperty(this, "bytes", {
      enumerable: true,
      writable: false,
      configurable: false,
      value: this.bytes
    })
  }

  /** 
   * Representación en cadena base32 de la clave secreta.
   * 
   * Esta propiedad devuelve la representación base32 del secreto, que es
   * el formato estándar utilizado por las aplicaciones de autenticación.
   * El valor se calcula una sola vez y se almacena en caché.
   * 
   * @returns Cadena en formato base32
   */
  get base32(): string {
    const value = base32Encode(this.bytes)
    Object.defineProperty(this, "base32", { value, enumerable: true, writable: false, configurable: false })
    return value
  }

  /** 
   * Representación hexadecimal de la clave secreta.
   * 
   * Esta propiedad devuelve la representación hexadecimal del secreto.
   * El valor se calcula una sola vez y se almacena en caché.
   * 
   * @returns Cadena en formato hexadecimal
   */
  get hex(): string {
    const value = bytesToHex(this.bytes)
    Object.defineProperty(this, "hex", { value, enumerable: true, writable: false, configurable: false })
    return value
  }

  /**
   * Crea una instancia de Secret desde una cadena en formato base32.
   * 
   * Este método estático permite crear un objeto Secret a partir de una
   * cadena codificada en base32, que es el formato comúnmente utilizado
   * en aplicaciones de autenticación de dos factores.
   * 
   * @param base32Str - Cadena en formato base32
   * @returns Nueva instancia de Secret
   * 
   * @example
   * ```typescript
   * const secret = Secret.fromBase32("JBSWY3DPEHPK3PXP");
   * console.log(secret.base32); // "JBSWY3DPEHPK3PXP"
   * ```
   */
  static fromBase32(base32Str: string): Secret {
    const bytes = base32Decode(base32Str)
    return new Secret({ buffer: bytes })
  }
}

export { base32Decode, base32Encode, bytesToHex }