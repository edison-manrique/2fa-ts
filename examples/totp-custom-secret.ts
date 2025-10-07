import { TOTP, Secret } from "../index"

/**
 * Ejemplo: Uso de TOTP con secretos personalizados
 *
 * Este ejemplo muestra cómo usar TOTP con secretos personalizados.
 */

async function runExample() {
  // Crear un secreto personalizado desde una cadena base32
  const customBase32Secret = "JBSWY3DPEHPK3PXP"
  const secretFromBase32 = Secret.fromBase32(customBase32Secret)
  
  // Alternativa: crear un secreto desde bytes específicos
  const secretBytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x21, 0xde, 0xad, 0xbe, 0xef])
  const secretFromBytes = new Secret({ buffer: secretBytes })

  console.log("Secreto personalizado desde bytes:")
  console.log("- Base32:", secretFromBytes.base32)
  console.log("- Hexadecimal:", secretFromBytes.hex)

  console.log("\nSecreto personalizado desde string:")
  console.log("- Base32:", secretFromBase32.base32)
  console.log("- Hexadecimal:", secretFromBase32.hex)

  // Crear una instancia TOTP con el secreto personalizado
  const totp = new TOTP({
    issuer: "MiAppPersonalizada",
    label: "usuario@ejemplo.com",
    secret: secretFromBytes,
    algorithm: "SHA1",
    digits: 6,
    period: 30
  })

  // Generar un token con el secreto personalizado
  const token = await totp.generate()
  console.log("\nToken TOTP generado con secreto personalizado:", token)

  // Validar el token
  const isValid = await totp.validate({ token })
  console.log("¿Token válido?", isValid)

  // Mostrar información adicional
  console.log("\nInformación del TOTP:")
  console.log("- Secreto base32:", totp.secret.base32)
  console.log("- Tiempo restante (ms):", totp.remaining())
  console.log("- Contador actual:", totp.counter())
}

runExample().catch(console.error)