import { Secret, base32Decode } from "./secret"
import { HOTPOptions, HOTPConfig, HOTPValidateConfig } from "./types"
import { hmacDigest } from "./hmac"

/**
 * Convierte un entero a un Uint8Array.
 * @param num Entero.
 * @returns Uint8Array.
 */
const uintDecode = (num: number): Uint8Array => {
  const buf = new ArrayBuffer(8)
  const arr = new Uint8Array(buf)
  let acc = num
  for (let i = 7; i >= 0; i--) {
    if (acc === 0) break
    arr[i] = acc & 255
    acc -= arr[i]
    acc /= 256
  }
  return arr
}

/** 
 * Compara si a es igual a b, a prueba de ataques de temporización.
 * @param a Primera cadena.
 * @param b Segunda cadena.
 * @returns true si las cadenas son iguales, false en caso contrario.
 */
const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    throw new TypeError("Las cadenas de entrada deben tener la misma longitud")
  }
  let out = 0
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return out === 0
}

/**
 * HOTP: An HMAC-based One-time Password Algorithm.
 * 
 * Implementación del algoritmo HOTP (HMAC-based One-Time Password) según RFC 4226.
 * Genera contraseñas de un solo uso basadas en un contador y una clave secreta.
 * 
 * @example
 * ```typescript
 * // Crear una instancia básica de HOTP
 * const hotp = new HOTP({
 *   issuer: "MiAplicación",
 *   label: "usuario@ejemplo.com"
 * });
 * 
 * // Generar un token
 * const token = await hotp.generate();
 * 
 * // Validar un token
 * const isValid = await hotp.validate({ token, counter: 1 });
 * ```
 * 
 * @see [RFC 4226](https://tools.ietf.org/html/rfc4226)
 */
export class HOTP {
  public issuer: string
  public label: string
  public issuerInLabel: boolean
  public secret: Secret
  public algorithm: string
  public digits: number
  public counter: number

  /**
   * Valores por defecto para la configuración de HOTP.
   * 
   * @property issuer - Emisor por defecto (vacío)
   * @property label - Etiqueta por defecto ("OTPAuth")
   * @property issuerInLabel - Incluir emisor en la etiqueta (true)
   * @property algorithm - Algoritmo por defecto ("SHA1")
   * @property digits - Número de dígitos por defecto (6)
   * @property counter - Valor inicial del contador (0)
   * @property window - Tamaño de ventana por defecto para validación (1)
   */
  static get defaults() {
    return {
      issuer: "",
      label: "OTPAuth",
      issuerInLabel: true,
      algorithm: "SHA1",
      digits: 6,
      counter: 0,
      window: 1
    }
  }

  /**
   * Crea una instancia de HOTP.
   * 
   * @param options - Opciones de configuración
   * @param options.issuer - Nombre del emisor (por ejemplo, "Google")
   * @param options.label - Etiqueta (por ejemplo, "usuario@ejemplo.com")
   * @param options.issuerInLabel - Incluir emisor en la etiqueta
   * @param options.secret - Secreto compartido
   * @param options.algorithm - Algoritmo hash ("SHA1", "SHA256", "SHA512")
   * @param options.digits - Número de dígitos en el token (por defecto 6)
   * @param options.counter - Valor inicial del contador (por defecto 0)
   * 
   * @example
   * ```typescript
   * // Configuración básica
   * const hotp = new HOTP({
   *   issuer: "MiApp",
   *   label: "usuario@ejemplo.com"
   * });
   * 
   * // Configuración avanzada
   * const hotpAdvanced = new HOTP({
   *   issuer: "MiApp",
   *   label: "usuario@ejemplo.com",
   *   algorithm: "SHA256",
   *   digits: 8,
   *   counter: 10
   * });
   * ```
   */
  constructor({
    issuer = HOTP.defaults.issuer,
    label = HOTP.defaults.label,
    issuerInLabel = HOTP.defaults.issuerInLabel,
    secret = new Secret(),
    algorithm = HOTP.defaults.algorithm,
    digits = HOTP.defaults.digits,
    counter = HOTP.defaults.counter
  }: HOTPOptions = {}) {
    this.issuer = issuer
    this.label = label
    this.issuerInLabel = issuerInLabel
    this.secret = typeof secret === "string" ? new Secret({ buffer: base32Decode(secret) }) : secret
    this.algorithm = algorithm.toUpperCase()
    this.digits = digits
    this.counter = counter
  }

  /**
   * Genera un token HOTP.
   * 
   * Este método estático genera un token HOTP basado en los parámetros proporcionados.
   * 
   * @param config - Configuración para la generación
   * @param config.secret - Secreto compartido
   * @param config.algorithm - Algoritmo hash
   * @param config.digits - Número de dígitos en el token
   * @param config.counter - Valor del contador
   * @returns Token HOTP generado
   * 
   * @example
   * ```typescript
   * const secret = new Secret();
   * const token = await HOTP.generate({
   *   secret: secret,
   *   algorithm: "SHA1",
   *   digits: 6,
   *   counter: 1
   * });
   * ```
   */
  static async generate({
    secret,
    algorithm = HOTP.defaults.algorithm,
    digits = HOTP.defaults.digits,
    counter = HOTP.defaults.counter
  }: HOTPConfig): Promise<string> {
    const digest = await hmacDigest(algorithm, secret.bytes, uintDecode(counter))
    const offset = digest[digest.byteLength - 1] & 15
    const otp =
      (((digest[offset] & 127) << 24) |
        ((digest[offset + 1] & 255) << 16) |
        ((digest[offset + 2] & 255) << 8) |
        (digest[offset + 3] & 255)) %
      10 ** digits
    return otp.toString().padStart(digits, "0")
  }

  /**
   * Genera un token HOTP usando la configuración de la instancia.
   * 
   * Este método genera un token HOTP usando los parámetros de la instancia actual.
   * Incrementa automáticamente el contador después de generar el token.
   * 
   * @param options - Opciones para la generación
   * @param options.counter - Valor del contador (por defecto el contador actual, e incrementa)
   * @returns Token HOTP generado
   * 
   * @example
   * ```typescript
   * const hotp = new HOTP({ issuer: "MiApp", label: "usuario@ejemplo.com" });
   * const token1 = await hotp.generate(); // Usa counter = 0, luego incrementa a 1
   * const token2 = await hotp.generate(); // Usa counter = 1, luego incrementa a 2
   * ```
   */
  async generate({ counter = this.counter++ }: { counter?: number } = {}): Promise<string> {
    return HOTP.generate({
      secret: this.secret,
      algorithm: this.algorithm,
      digits: this.digits,
      counter
    })
  }

  /**
   * Valida un token HOTP.
   * 
   * Este método estático valida un token HOTP comparándolo con tokens generados
   * usando diferentes valores de contador dentro de una ventana especificada.
   * 
   * @param config - Configuración para la validación
   * @param config.token - Token a validar
   * @param config.secret - Secreto compartido
   * @param config.algorithm - Algoritmo hash
   * @param config.digits - Número de dígitos en el token
   * @param config.counter - Valor del contador
   * @param config.window - Tamaño de la ventana de validación
   * @returns Desplazamiento del contador si es válido, null si no es válido
   * 
   * @example
   * ```typescript
   * const secret = new Secret();
   * const result = await HOTP.validate({
   *   token: "123456",
   *   secret: secret,
   *   algorithm: "SHA1",
   *   digits: 6,
   *   counter: 1,
   *   window: 1
   * });
   * 
   * if (result !== null) {
   *   console.log(`Token válido. Desplazamiento: ${result}`);
   * } else {
   *   console.log("Token no válido");
   * }
   * ```
   */
  static async validate({
    token,
    secret,
    algorithm,
    digits = HOTP.defaults.digits,
    counter = HOTP.defaults.counter,
    window = HOTP.defaults.window
  }: HOTPValidateConfig): Promise<number | null> {
    if (token.length !== digits) return null

    let delta = null
    for (let i = counter - window; i <= counter + window; ++i) {
      const generatedToken = await HOTP.generate({ secret, algorithm, digits, counter: i })
      if (timingSafeEqual(token, generatedToken)) {
        delta = i - counter
      }
    }
    return delta
  }

  /**
   * Valida un token HOTP usando la configuración de la instancia.
   * 
   * Este método valida un token HOTP usando los parámetros de la instancia actual.
   * 
   * @param options - Opciones para la validación
   * @param options.token - Token a validar
   * @param options.counter - Valor del contador (por defecto el contador actual)
   * @param options.window - Tamaño de la ventana de validación
   * @returns Desplazamiento del contador si es válido, null si no es válido
   * 
   * @example
   * ```typescript
   * const hotp = new HOTP({ issuer: "MiApp", label: "usuario@ejemplo.com" });
   * const result = await hotp.validate({
   *   token: "123456",
   *   counter: 1,
   *   window: 1
   * });
   * ```
   */
  async validate({
    token,
    counter = this.counter,
    window
  }: {
    token: string
    counter?: number
    window?: number
  }): Promise<number | null> {
    return HOTP.validate({
      token,
      secret: this.secret,
      algorithm: this.algorithm,
      digits: this.digits,
      counter,
      window
    })
  }

  /** 
   * Devuelve una URI de clave de Google Authenticator.
   * 
   * Genera una URI compatible con Google Authenticator que puede ser usada
   * para configurar la autenticación de dos factores en aplicaciones compatibles.
   * 
   * @returns URI otpauth para HOTP
   * 
   * @example
   * ```typescript
   * const hotp = new HOTP({ issuer: "MiApp", label: "usuario@ejemplo.com" });
   * const uri = hotp.toString();
   * console.log(uri); 
   * // "otpauth://hotp/MiApp:usuario%40ejemplo.com?secret=...&algorithm=SHA1&digits=6&counter=0&issuer=MiApp"
   * ```
   */
  toString(): string {
    const e = encodeURIComponent
    const label = `${
      this.issuer.length > 0 && this.issuerInLabel ? `${e(this.issuer)}:${e(this.label)}` : e(this.label)
    }`
    const params = new URLSearchParams({
      secret: this.secret.base32,
      algorithm: this.algorithm,
      digits: String(this.digits),
      counter: String(this.counter)
    })
    if (this.issuer.length > 0) {
      params.set("issuer", this.issuer)
    }
    return `otpauth://hotp/${label}?${params.toString()}`
  }
}