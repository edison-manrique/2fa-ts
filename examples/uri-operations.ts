import { TOTP, HOTP, URI } from "../index"

/**
 * Ejemplo: Operaciones con URI
 *
 * Este ejemplo muestra cómo generar y parsear URIs compatibles con Google Authenticator.
 */

async function runExample() {
  // Crear una instancia TOTP
  const totp = new TOTP({
    issuer: "MiApp",
    label: "usuario@ejemplo.com",
    algorithm: "SHA1",
    digits: 6,
    period: 30
  })

  // Generar URI para TOTP
  const totpUri = totp.toString()
  console.log("URI TOTP:", totpUri)

  // Crear una instancia HOTP
  const hotp = new HOTP({
    issuer: "MiApp",
    label: "usuario@ejemplo.com",
    algorithm: "SHA1",
    digits: 6,
    counter: 1
  })

  // Generar URI para HOTP
  const hotpUri = hotp.toString()
  console.log("URI HOTP:", hotpUri)

  // Parsear URI TOTP
  try {
    const parsedTotp = URI.parse(totpUri)
    console.log("\nTOTP parseado:")
    console.log("- Emisor:", parsedTotp.issuer)
    console.log("- Etiqueta:", parsedTotp.label)
    console.log("- Algoritmo:", parsedTotp.algorithm)
    console.log("- Dígitos:", parsedTotp.digits)
    if (parsedTotp instanceof TOTP) {
      console.log("- Período:", parsedTotp.period)
    }

    // Generar un token con el objeto parseado
    const tokenFromParsed = await parsedTotp.generate()
    console.log("- Token generado:", tokenFromParsed)
  } catch (error) {
    console.error("Error al parsear URI TOTP:", error)
  }

  // Parsear URI HOTP
  try {
    const parsedHotp = URI.parse(hotpUri)
    console.log("\nHOTP parseado:")
    console.log("- Emisor:", parsedHotp.issuer)
    console.log("- Etiqueta:", parsedHotp.label)
    console.log("- Algoritmo:", parsedHotp.algorithm)
    console.log("- Dígitos:", parsedHotp.digits)
    console.log("- Contador:", parsedHotp.counter)

    // Generar un token con el objeto parseado
    const tokenFromParsed = await parsedHotp.generate()
    console.log("- Token generado:", tokenFromParsed)
  } catch (error) {
    console.error("Error al parsear URI HOTP:", error)
  }
}

runExample().catch(console.error)
