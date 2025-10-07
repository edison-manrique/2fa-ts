import { TOTP, Secret } from "../index"

/**
 * Ejemplo: Uso básico de TOTP
 *
 * Este ejemplo muestra cómo usar TOTP para generar y validar tokens.
 */

async function runExample() {
  // Crear una instancia TOTP básica
  const totp = new TOTP({
    issuer: "MiApp",
    label: "usuario@ejemplo.com"
  })

  // Generar un token
  const token = await totp.generate()
  console.log("Token TOTP generado:", token)

  // Validar el token
  const isValid = await totp.validate({ token })
  console.log("¿Token válido?", isValid)

  // Mostrar información adicional
  console.log("Secreto base32:", totp.secret.base32)
  console.log("Tiempo restante (ms):", totp.remaining())
  console.log("Contador actual:", totp.counter())
}

runExample().catch(console.error)
