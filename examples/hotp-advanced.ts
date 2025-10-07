import { HOTP, Secret } from "../index"

/**
 * Ejemplo: Opciones avanzadas de HOTP
 *
 * Este ejemplo muestra cómo usar opciones avanzadas de HOTP.
 */

async function runExample() {
  // Crear una instancia HOTP con opciones avanzadas
  const hotp = new HOTP({
    issuer: "MiApp",
    label: "usuario@ejemplo.com",
    algorithm: "SHA512", // SHA1, SHA256, SHA512
    digits: 8, // Número de dígitos (por defecto 6)
    counter: 10 // Valor inicial del contador
  })

  console.log("Contador inicial:", hotp.counter)

  // Generar varios tokens secuencialmente
  for (let i = 0; i < 5; i++) {
    const token = await hotp.generate()
    console.log(`Token ${i + 1}: ${token} (contador: ${hotp.counter})`)
  }

  // Validar un token con ventana (comprueba alrededor del contador especificado)
  const tokenToValidate = "42596816"
  const delta = await hotp.validate({
    token: tokenToValidate,
    counter: 12,
    window: 3 // Comprueba el token para contadores 9, 10, 11, 12, 13, 14, 15
  })

  if (delta !== null) {
    console.log(`Token válido. Contador desfasado por: ${delta}`)
  } else {
    console.log("Token no válido")
  }
}

runExample().catch(console.error)