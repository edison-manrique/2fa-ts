import { Secret, base32Decode } from "./secret"
import { HOTP } from "./hotp"
import { TOTPOptions, TOTPGenerateConfig, TOTPValidateConfig, CounterConfig, HashAlgorithm } from "./types"

/**
 * Canoniza el nombre de un algoritmo de hash.
 * @param algorithm Nombre del algoritmo de hash.
 * @returns Nombre canonizado del algoritmo de hash.
 */
const canonicalizeAlgorithm = (algorithm: string): HashAlgorithm => {
  const upperAlgorithm = algorithm.toUpperCase()
  if (upperAlgorithm.startsWith("SHA3-")) {
    if (["SHA3-224", "SHA3-256", "SHA3-384", "SHA3-512"].includes(upperAlgorithm)) {
      return upperAlgorithm as HashAlgorithm
    }
  } else {
    const simpleAlgorithm = upperAlgorithm.replace(/-/, "")
    if (simpleAlgorithm === "SHA1") return "SHA1"
    if (simpleAlgorithm === "SHA224") return "SHA224"
    if (simpleAlgorithm === "SHA256") return "SHA256"
    if (simpleAlgorithm === "SHA384") return "SHA384"
    if (simpleAlgorithm === "SHA512") return "SHA512"
  }
  throw new TypeError(`Algoritmo de hash desconocido: ${algorithm}`)
}

/**
 * TOTP: Time-Based One-Time Password Algorithm.
 * 
 * Implementación del algoritmo TOTP (Time-based One-Time Password) según RFC 6238.
 * Genera contraseñas de un solo uso basadas en el tiempo y una clave secreta.
 * 
 * TOTP es una extensión de HOTP que reemplaza el contador simple con un valor
 * derivado del tiempo actual, permitiendo la sincronización automática entre
 * cliente y servidor.
 * 
 * @example
 * ```typescript
 * // Crear una instancia básica de TOTP
 * const totp = new TOTP({
 *   issuer: "MiAplicación",
 *   label: "usuario@ejemplo.com"
 * });
 * 
 * // Generar un token
 * const token = await totp.generate();
 * 
 * // Validar un token
 * const isValid = await totp.validate({ token });
 * ```
 * 
 * @see [RFC 6238](https://tools.ietf.org/html/rfc6238)
 */
export class TOTP {
  public issuer: string
  public label: string
  public issuerInLabel: boolean
  public secret: Secret
  public algorithm: HashAlgorithm
  public digits: number
  public period: number

  /**
   * Valores por defecto para la configuración de TOTP.
   * 
   * @property issuer - Emisor por defecto (vacío)
   * @property label - Etiqueta por defecto ("OTPAuth")
   * @property issuerInLabel - Incluir emisor en la etiqueta (true)
   * @property algorithm - Algoritmo por defecto ("SHA1")
   * @property digits - Número de dígitos por defecto (6)
   * @property period - Período de tiempo en segundos (30)
   * @property window - Tamaño de ventana por defecto para validación (1)
   */
  static get defaults() {
    return {
      issuer: "",
      label: "OTPAuth",
      issuerInLabel: true,
      algorithm: "SHA1" as HashAlgorithm,
      digits: 6,
      period: 30,
      window: 1
    }
  }

  /**
   * Crea una instancia de TOTP.
   * 
   * @param options - Opciones de configuración
   * @param options.issuer - Nombre del emisor (por ejemplo, "Google")
   * @param options.label - Etiqueta (por ejemplo, "usuario@ejemplo.com")
   * @param options.issuerInLabel - Incluir emisor en la etiqueta
   * @param options.secret - Secreto compartido
   * @param options.algorithm - Algoritmo hash ("SHA1", "SHA256", "SHA512")
   * @param options.digits - Número de dígitos en el token (por defecto 6)
   * @param options.period - Período de tiempo en segundos (por defecto 30)
   * 
   * @example
   * ```typescript
   * // Configuración básica
   * const totp = new TOTP({
   *   issuer: "MiApp",
   *   label: "usuario@ejemplo.com"
   * });
   * 
   * // Configuración avanzada
   * const totpAdvanced = new TOTP({
   *   issuer: "MiApp",
   *   label: "usuario@ejemplo.com",
   *   algorithm: "SHA256",
   *   digits: 8,
   *   period: 60
   * });
   * ```
   */
  constructor({
    issuer = TOTP.defaults.issuer,
    label = TOTP.defaults.label,
    issuerInLabel = TOTP.defaults.issuerInLabel,
    secret = new Secret(),
    algorithm = TOTP.defaults.algorithm,
    digits = TOTP.defaults.digits,
    period = TOTP.defaults.period
  }: TOTPOptions = {}) {
    this.issuer = issuer
    this.label = label
    this.issuerInLabel = issuerInLabel
    this.secret = typeof secret === "string" ? new Secret({ buffer: base32Decode(secret) }) : secret
    this.algorithm = canonicalizeAlgorithm(algorithm)
    this.digits = digits
    this.period = period
  }

  /**
   * Calcula el contador, es decir, el número de periodos desde la época Unix.
   * 
   * Este método calcula el valor del contador basado en el tiempo actual o
   * un timestamp especificado, dividiendo por el período de tiempo.
   * 
   * @param options - Opciones para el cálculo
   * @param options.period - Período de tiempo en segundos
   * @param options.timestamp - Timestamp en milisegundos (por defecto Date.now())
   * @returns Valor del contador
   * 
   * @example
   * ```typescript
   * // Contador actual con período por defecto (30 segundos)
   * const counter = TOTP.counter();
   * 
   * // Contador con período personalizado
   * const counterCustom = TOTP.counter({ period: 60 });
   * 
   * // Contador para un momento específico
   * const counterSpecific = TOTP.counter({ 
   *   period: 30, 
   *   timestamp: Date.now() - 5 * 60 * 1000 // Hace 5 minutos
   * });
   * ```
   */
  static counter({ period = TOTP.defaults.period, timestamp = Date.now() }: CounterConfig = {}): number {
    return Math.floor(timestamp / 1000 / period)
  }

  /**
   * Calcula el contador para la instancia actual.
   * 
   * Este método calcula el valor del contador basado en la configuración
   * de período de la instancia y el tiempo actual o especificado.
   * 
   * @param options - Opciones para el cálculo
   * @param options.timestamp - Timestamp en milisegundos (por defecto Date.now())
   * @returns Valor del contador
   */
  counter({ timestamp = Date.now() }: { timestamp?: number } = {}): number {
    return TOTP.counter({ period: this.period, timestamp })
  }

  /**
   * Calcula el tiempo restante en milisegundos hasta la generación del siguiente token.
   * 
   * Este método calcula cuánto tiempo queda en el período actual antes de que
   * se genere el siguiente token TOTP.
   * 
   * @param options - Opciones para el cálculo
   * @param options.period - Período de tiempo en segundos
   * @param options.timestamp - Timestamp en milisegundos (por defecto Date.now())
   * @returns Tiempo restante en milisegundos
   * 
   * @example
   * ```typescript
   * // Tiempo restante con período por defecto
   * const remaining = TOTP.remaining();
   * 
   * // Tiempo restante con período personalizado
   * const remainingCustom = TOTP.remaining({ period: 60 });
   * ```
   */
  static remaining({ period = TOTP.defaults.period, timestamp = Date.now() }: CounterConfig = {}): number {
    return period * 1000 - (timestamp % (period * 1000))
  }

  /**
   * Calcula el tiempo restante para la instancia actual.
   * 
   * Este método calcula cuánto tiempo queda en el período actual antes de que
   * se genere el siguiente token TOTP, basado en la configuración de período
   * de la instancia.
   * 
   * @param options - Opciones para el cálculo
   * @param options.timestamp - Timestamp en milisegundos (por defecto Date.now())
   * @returns Tiempo restante en milisegundos
   */
  remaining({ timestamp = Date.now() }: { timestamp?: number } = {}): number {
    return TOTP.remaining({ period: this.period, timestamp })
  }

  /**
   * Genera un token TOTP.
   * 
   * Este método estático genera un token TOTP basado en los parámetros proporcionados.
   * 
   * @param config - Configuración para la generación
   * @param config.secret - Secreto compartido
   * @param config.algorithm - Algoritmo hash
   * @param config.digits - Número de dígitos en el token
   * @param config.period - Período de tiempo en segundos
   * @param config.timestamp - Timestamp en milisegundos (por defecto Date.now())
   * @returns Token TOTP generado
   * 
   * @example
   * ```typescript
   * const secret = new Secret();
   * const token = await TOTP.generate({
   *   secret: secret,
   *   algorithm: "SHA1",
   *   digits: 6,
   *   period: 30
   * });
   * ```
   */
  static async generate({
    secret,
    algorithm,
    digits,
    period = TOTP.defaults.period,
    timestamp = Date.now()
  }: TOTPGenerateConfig): Promise<string> {
    return HOTP.generate({
      secret,
      algorithm,
      digits,
      counter: TOTP.counter({ period, timestamp })
    })
  }

  /**
   * Genera un token TOTP usando la configuración de la instancia.
   * 
   * Este método genera un token TOTP usando los parámetros de la instancia actual.
   * 
   * @param options - Opciones para la generación
   * @param options.timestamp - Timestamp en milisegundos (por defecto Date.now())
   * @returns Token TOTP generado
   * 
   * @example
   * ```typescript
   * const totp = new TOTP({ issuer: "MiApp", label: "usuario@ejemplo.com" });
   * const token = await totp.generate();
   * 
   * // Generar token para un momento específico
   * const pastToken = await totp.generate({ 
   *   timestamp: Date.now() - 5 * 60 * 1000 // Hace 5 minutos
   * });
   * ```
   */
  async generate({ timestamp = Date.now() }: { timestamp?: number } = {}): Promise<string> {
    return TOTP.generate({
      secret: this.secret,
      algorithm: this.algorithm,
      digits: this.digits,
      period: this.period,
      timestamp
    })
  }

  /**
   * Valida un token TOTP.
   * 
   * Este método estático valida un token TOTP comparándolo con tokens generados
   * usando diferentes valores de tiempo dentro de una ventana especificada.
   * 
   * @param config - Configuración para la validación
   * @param config.token - Token a validar
   * @param config.secret - Secreto compartido
   * @param config.algorithm - Algoritmo hash
   * @param config.digits - Número de dígitos en el token
   * @param config.period - Período de tiempo en segundos
   * @param config.timestamp - Timestamp en milisegundos (por defecto Date.now())
   * @param config.window - Tamaño de la ventana de validación
   * @returns Desplazamiento del contador si es válido, null si no es válido
   * 
   * @example
   * ```typescript
   * const secret = new Secret();
   * const result = await TOTP.validate({
   *   token: "123456",
   *   secret: secret,
   *   algorithm: "SHA1",
   *   digits: 6,
   *   period: 30,
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
    digits,
    period = TOTP.defaults.period,
    timestamp = Date.now(),
    window
  }: TOTPValidateConfig): Promise<number | null> {
    return HOTP.validate({
      token,
      secret,
      algorithm,
      digits,
      counter: TOTP.counter({ period, timestamp }),
      window
    })
  }

  /**
   * Valida un token TOTP usando la configuración de la instancia.
   * 
   * Este método valida un token TOTP usando los parámetros de la instancia actual.
   * 
   * @param options - Opciones para la validación
   * @param options.token - Token a validar
   * @param options.timestamp - Timestamp en milisegundos (por defecto Date.now())
   * @param options.window - Tamaño de la ventana de validación
   * @returns Desplazamiento del contador si es válido, null si no es válido
   * 
   * @example
   * ```typescript
   * const totp = new TOTP({ issuer: "MiApp", label: "usuario@ejemplo.com" });
   * const result = await totp.validate({
   *   token: "123456",
   *   window: 1
   * });
   * ```
   */
  async validate({
    token,
    timestamp,
    window
  }: {
    token: string
    timestamp?: number
    window?: number
  }): Promise<number | null> {
    return TOTP.validate({
      token,
      secret: this.secret,
      algorithm: this.algorithm,
      digits: this.digits,
      period: this.period,
      timestamp,
      window
    })
  }

  /**
   * Devuelve una URI de clave de Google Authenticator.
   * 
   * Genera una URI compatible con Google Authenticator que puede ser usada
   * para configurar la autenticación de dos factores en aplicaciones compatibles.
   * 
   * @returns URI otpauth para TOTP
   * 
   * @example
   * ```typescript
   * const totp = new TOTP({ issuer: "MiApp", label: "usuario@ejemplo.com" });
   * const uri = totp.toString();
   * console.log(uri); 
   * // "otpauth://totp/MiApp:usuario%40ejemplo.com?secret=...&algorithm=SHA1&digits=6&period=30&issuer=MiApp"
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
      period: String(this.period)
    })
    if (this.issuer.length > 0) {
      params.set("issuer", this.issuer)
    }
    return `otpauth://totp/${label}?${params.toString()}`
  }
}