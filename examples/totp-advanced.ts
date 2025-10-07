import { TOTP, Secret } from "../index"

/**
 * Ejemplo: Opciones avanzadas de TOTP
 *
 * Este ejemplo muestra cómo usar opciones avanzadas de TOTP.
 */

async function runExample() {
  // Crear una instancia TOTP con opciones avanzadas
  const totp = new TOTP({
    issuer: "MiApp",
    label: "usuario@ejemplo.com",
    algorithm: "SHA256", // SHA1, SHA256, SHA512
    digits: 8, // Número de dígitos (por defecto 6)
    period: 60 // Segundos por token (por defecto 30)
  })

  // Generar un token
  const token = await totp.generate()
  console.log("Token TOTP (8 dígitos, SHA256, 60 segundos):", token)

  // Validar con ventana de tiempo (para compensar el desfase horario)
  const isValid = await totp.validate({
    token,
    window: 2 // Comprueba el token actual y los 2 tokens anteriores y posteriores
  })
  console.log("¿Token válido con ventana de tiempo?", isValid)

  // Generar un token para un momento específico en el tiempo
  const timestamp = Date.now() - 5 * 60 * 1000 // Hace 5 minutos
  const pastToken = await totp.generate({ timestamp })
  console.log("Token para un momento específico:", pastToken)

  // Calcular el tiempo restante para el token actual
  const remainingTime = totp.remaining()
  console.log("Tiempo restante para el token actual (ms):", remainingTime)
}

runExample().catch(console.error)
