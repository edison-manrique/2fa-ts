import { TOTP, Secret } from "../index"

/**
 * Ejemplo: Generación de códigos QR para 2FA
 * 
 * Este ejemplo muestra cómo generar una URI compatible con Google Authenticator
 * que puede ser convertida en un código QR para escanear con aplicaciones de autenticación.
 * 
 * Nota: Este ejemplo solo genera la URI; la generación real del código QR requeriría
 * una biblioteca adicional como 'qrcode' o similar.
 */

async function runExample() {
  // Crear una instancia TOTP
  const totp = new TOTP({
    issuer: "MiAplicación",
    label: "usuario@miapp.com",
    algorithm: "SHA1",
    digits: 6,
    period: 30
  })

  // Generar URI para el código QR
  const otpauthUri = totp.toString()
  console.log("URI para código QR:")
  console.log(otpauthUri)
  console.log()

  // También podemos crear una instancia con un secreto personalizado
  const customSecret = new Secret({ size: 20 }) // Secreto de 20 bytes
  const customTotp = new TOTP({
    issuer: "MiAplicación",
    label: "usuario-personalizado@miapp.com",
    secret: customSecret,
    algorithm: "SHA512",
    digits: 8,
    period: 60
  })

  const customOtpauthUri = customTotp.toString()
  console.log("URI personalizada para código QR:")
  console.log(customOtpauthUri)
  console.log()

  // Mostrar información decodificada
  console.log("Información del primer TOTP:")
  console.log("- Issuer:", totp.issuer)
  console.log("- Label:", totp.label)
  console.log("- Algorithm:", totp.algorithm)
  console.log("- Digits:", totp.digits)
  console.log("- Period:", totp.period)
  console.log("- Secret (first 5 chars):", totp.secret.base32.substring(0, 5) + "...")
  console.log()

  console.log("Información del segundo TOTP (personalizado):")
  console.log("- Issuer:", customTotp.issuer)
  console.log("- Label:", customTotp.label)
  console.log("- Algorithm:", customTotp.algorithm)
  console.log("- Digits:", customTotp.digits)
  console.log("- Period:", customTotp.period)
  console.log("- Secret (first 5 chars):", customTotp.secret.base32.substring(0, 5) + "...")
  
  // Generar algunos tokens de ejemplo
  console.log("\nTokens generados:")
  console.log("Token estándar:", await totp.generate())
  console.log("Token personalizado:", await customTotp.generate())
}

runExample().catch(console.error)

/**
 * Nota sobre generación de códigos QR:
 * 
 * Para generar realmente un código QR a partir de estas URIs, podrías usar una biblioteca como:
 * 
 * ```bash
 * npm install qrcode
 * ```
 * 
 * Y luego en tu código:
 * 
 * ```typescript
 * import QRCode from 'qrcode'
 * 
 * // Generar código QR como data URL
 * const qrDataUrl = await QRCode.toDataURL(otpauthUri)
 * 
 * // O guardar como archivo
 * await QRCode.toFile('qr-code.png', otpauthUri)
 * ```
 * 
 * Esto permitiría a los usuarios escanear el código QR con su aplicación
 * de autenticación en lugar de ingresar manualmente el secreto.
 */