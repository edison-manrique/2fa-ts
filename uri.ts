import { HOTP } from './hotp';
import { TOTP } from './totp';
import { Secret, base32Decode } from './secret';
import { HOTPOptions, TOTPOptions } from './types';

/**
 * Expresión regular para la URI de la clave (otpauth://TYPE/[ISSUER:]LABEL?PARAMETERS).
 */
const OTPURI_REGEX = /^otpauth:\/\/([ht]otp)\/(.+)\?([A-Z0-9.~_-]+=[^?&]*(?:&[A-Z0-9.~_-]+=[^?&]*)*)$/i;
const SECRET_REGEX = /^[2-7A-Z]+=*$/i;
const INTEGER_REGEX = /^[+-]?\d+$/;
const POSITIVE_INTEGER_REGEX = /^\+?[1-9]\d*$/;

/**
 * Conversión de objetos/cadenas HOTP/TOTP.
 * 
 * Esta clase maneja la conversión entre objetos HOTP/TOTP y URIs compatibles
 * con Google Authenticator según el formato Key URI.
 * 
 * @see [Formato de URI de clave](https://github.com/google/google-authenticator/wiki/Key-Uri-Format)
 * 
 * @example
 * ```typescript
 * // Parsear una URI
 * const totp = URI.parse('otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example');
 * 
 * // Convertir un objeto a URI
 * const totp = new TOTP({ issuer: "Example", label: "alice@google.com" });
 * const uri = URI.stringify(totp);
 * ```
 */
export class URI {
  /**
   * Analiza una URI de clave de Google Authenticator y devuelve un objeto HOTP/TOTP.
   * 
   * Este método toma una URI compatible con Google Authenticator y la convierte
   * en una instancia de HOTP o TOTP según el tipo especificado en la URI.
   * 
   * @param uri - URI de clave de Google Authenticator
   * @returns Objeto HOTP o TOTP
   * @throws {URIError} Si el formato de URI es inválido
   * @throws {TypeError} Si algún parámetro es inválido o faltante
   * 
   * @example
   * ```typescript
   * // Parsear una URI TOTP
   * const totp = URI.parse('otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example');
   * 
   * // Parsear una URI HOTP
   * const hotp = URI.parse('otpauth://hotp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&counter=1&issuer=Example');
   * ```
   */
  static parse(uri: string): HOTP | TOTP {
    const uriGroups = uri.match(OTPURI_REGEX);
    if (!Array.isArray(uriGroups)) {
      throw new URIError("Formato de URI inválido");
    }

    const [, uriType, rawLabel, rawParams] = uriGroups;

    const uriParams = rawParams.split("&").reduce((acc, cur) => {
      const [key, value] = cur.split(/=(.*)/, 2).map(decodeURIComponent);
      acc[key.toLowerCase()] = value;
      return acc;
    }, {} as Record<string, string>);

    const config: any = {};
    let OTPClass: typeof HOTP | typeof TOTP;

    if (uriType.toLowerCase() === "hotp") {
      OTPClass = HOTP;
      if (typeof uriParams.counter !== "undefined" && INTEGER_REGEX.test(uriParams.counter)) {
        config.counter = parseInt(uriParams.counter, 10);
      } else {
        throw new TypeError("Parámetro 'counter' faltante o inválido");
      }
    } else if (uriType.toLowerCase() === "totp") {
      OTPClass = TOTP;
      if (typeof uriParams.period !== "undefined") {
        if (POSITIVE_INTEGER_REGEX.test(uriParams.period)) {
          config.period = parseInt(uriParams.period, 10);
        } else {
          throw new TypeError("Parámetro 'period' inválido");
        }
      }
    } else {
      throw new TypeError("Tipo de OTP desconocido");
    }

    const labelParts = decodeURIComponent(rawLabel).split(/:/);
    if (uriParams.issuer) {
      config.issuer = uriParams.issuer;
    }

    if (labelParts.length === 2) {
      const [issuerFromLabel, label] = labelParts.map((s) => s.trim());
      config.label = label;
      if (!config.issuer) {
        config.issuer = issuerFromLabel;
      }
    } else {
      config.label = labelParts[0].trim();
      if (config.issuer) {
        config.issuerInLabel = false;
      }
    }

    if (typeof uriParams.secret !== "undefined" && SECRET_REGEX.test(uriParams.secret)) {
      config.secret = new Secret({ buffer: base32Decode(uriParams.secret) });
    } else {
      throw new TypeError("Parámetro 'secret' faltante o inválido");
    }

    if (typeof uriParams.algorithm !== "undefined") {
      config.algorithm = uriParams.algorithm;
    }

    if (typeof uriParams.digits !== "undefined") {
      if (POSITIVE_INTEGER_REGEX.test(uriParams.digits)) {
        config.digits = parseInt(uriParams.digits, 10);
      } else {
        throw new TypeError("Parámetro 'digits' inválido");
      }
    }

    return new OTPClass(config);
  }

  /**
   * Convierte un objeto HOTP/TOTP a una URI de clave de Google Authenticator.
   * 
   * Este método toma una instancia de HOTP o TOTP y la convierte en una URI
   * compatible con Google Authenticator.
   * 
   * @param otp - Objeto HOTP o TOTP
   * @returns URI de clave de Google Authenticator
   * @throws {TypeError} Si el objeto no es una instancia válida de HOTP o TOTP
   * 
   * @example
   * ```typescript
   * const totp = new TOTP({ issuer: "Example", label: "alice@google.com" });
   * const uri = URI.stringify(totp);
   * console.log(uri);
   * // "otpauth://totp/Example:alice@google.com?secret=...&issuer=Example&algorithm=SHA1&digits=6&period=30"
   * ```
   */
  static stringify(otp: HOTP | TOTP): string {
    if (otp instanceof HOTP || otp instanceof TOTP) {
      return otp.toString();
    }
    throw new TypeError("Objeto 'HOTP/TOTP' inválido");
  }
}