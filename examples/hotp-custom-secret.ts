import { HOTP, Secret } from "../index"

/**
 * Ejemplo: Uso de HOTP con secretos personalizados
 *
 * Este ejemplo muestra cómo usar HOTP con secretos personalizados.
 */

async function runExample() {
  // Crear un secreto personalizado desde bytes específicos
  const secretBytes = new Uint8Array([0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a])
  const secretFromBytes = new Secret({ buffer: secretBytes })

  console.log("Secreto personalizado para HOTP:")
  console.log("- Base32:", secretFromBytes.base32)
  console.log("- Hexadecimal:", secretFromBytes.hex)

  // Crear una instancia HOTP con el secreto personalizado
  const hotp = new HOTP({
    issuer: "MiAppHOTPPersonalizada",
    label: "usuario@ejemplo.com",
    secret: secretFromBytes,
    algorithm: "SHA256",
    digits: 8,
    counter: 1
  })

  console.log("\nValor inicial del contador:", hotp.counter)

  // Generar varios tokens secuencialmente
  for (let i = 0; i < 3; i++) {
    const token = await hotp.generate()
    console.log(`Token ${i + 1}: ${token} (contador: ${hotp.counter})`)
  }

  // Validar un token con ventana
  // Para validar correctamente, necesitamos generar un token válido primero
  const validToken = await hotp.generate()
  console.log("\nToken generado para validación:", validToken)
  console.log("Nuevo valor del contador:", hotp.counter)
  
  // Ahora validamos usando el contador anterior (porque generate incrementó el contador)
  const isValid = await hotp.validate({
    token: validToken,
    counter: hotp.counter - 1, // Usamos el contador antes del último generate
    window: 1
  })
  
  console.log("¿Token válido?", isValid ? "Sí" : "No")

  if (isValid !== null) {
    console.log(`Token válido. Contador desfasado por: ${isValid}`)
  } else {
    console.log("Token no válido")
  }
}

runExample().catch(console.error)