import { HOTP, Secret } from "../index"

/**
 * Ejemplo: Uso básico de HOTP
 *
 * Este ejemplo muestra cómo usar HOTP para generar y validar tokens.
 */

async function runExample() {
  // Crear una instancia HOTP básica
  const hotp = new HOTP({
    issuer: "MiApp",
    label: "usuario@ejemplo.com",
    counter: 1
  })

  // Generar un token
  const token = await hotp.generate()
  console.log("Token HOTP generado:", token)
  console.log("Nuevo valor del contador:", hotp.counter)

  // Generar otro token (incrementa el contador)
  const token2 = await hotp.generate()
  console.log("Segundo token HOTP generado:", token2)
  console.log("Nuevo valor del contador:", hotp.counter)

  // Validar un token
  const isValid = await hotp.validate({ token: "123456", counter: 3 })
  console.log("¿Token válido?", isValid)
}

runExample().catch(console.error)