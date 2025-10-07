import { TOTP, Secret } from "../index"

/**
 * Ejemplo: Sincronización de tiempo para TOTP
 * 
 * Este ejemplo muestra cómo manejar la sincronización de tiempo en TOTP,
 * una característica importante para asegurar que los tokens generados
 * sean válidos en ambos extremos (cliente y servidor).
 */

async function runExample() {
  // Crear una instancia TOTP
  const totp = new TOTP({
    issuer: "SistemaDeTiempo",
    label: "usuario@ejemplo.com",
    algorithm: "SHA1",
    digits: 6,
    period: 30
  })

  console.log("Ejemplo de sincronización de tiempo TOTP:")
  console.log("========================================")

  // Mostrar el tiempo restante del token actual
  const remainingTime = totp.remaining()
  console.log(`Tiempo restante para el token actual: ${remainingTime} ms (${(remainingTime/1000).toFixed(1)} segundos)`)

  // Generar un token para el tiempo actual
  const currentToken = await totp.generate()
  console.log(`Token actual: ${currentToken}`)

  // Generar tokens para tiempos pasados y futuros
  const pastTimestamp = Date.now() - 60 * 1000 // Hace 1 minuto
  const futureTimestamp = Date.now() + 60 * 1000 // En 1 minuto
  
  const pastToken = await totp.generate({ timestamp: pastTimestamp })
  const futureToken = await totp.generate({ timestamp: futureTimestamp })
  
  console.log(`Token pasado (1 minuto): ${pastToken}`)
  console.log(`Token futuro (1 minuto): ${futureToken}`)

  // Validar tokens con ventana de tiempo
  console.log("\nValidación con ventana de tiempo:")
  console.log("---------------------------------")
  
  // Validar token actual con ventana de 1 (comprueba 3 tokens: anterior, actual, siguiente)
  const isValidWithWindow = await totp.validate({
    token: currentToken,
    window: 1
  })
  console.log(`Token actual válido con ventana de 1: ${isValidWithWindow ? 'Sí' : 'No'}`)

  // Simular un desfase de tiempo del cliente
  console.log("\nSimulando desfase de tiempo del cliente:")
  console.log("----------------------------------------")
  
  // Crear un nuevo TOTP con un secreto específico para pruebas consistentes
  const testSecret = new Secret({ 
    buffer: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
  })
  
  const serverTotp = new TOTP({
    issuer: "Servidor",
    label: "server@ejemplo.com",
    secret: testSecret,
    algorithm: "SHA1",
    digits: 6,
    period: 30
  })
  
  const clientTotp = new TOTP({
    issuer: "Cliente",
    label: "client@ejemplo.com",
    secret: testSecret, // Mismo secreto
    algorithm: "SHA1",
    digits: 6,
    period: 30
  })
  
  // Simular desfase de tiempo (cliente 90 segundos adelantado)
  const serverTime = Date.now()
  const clientTime = serverTime + 90 * 1000
  
  const serverToken = await serverTotp.generate({ timestamp: serverTime })
  const clientToken = await clientTotp.generate({ timestamp: clientTime })
  
  console.log(`Token del servidor (tiempo actual): ${serverToken}`)
  console.log(`Token del cliente (90s adelantado): ${clientToken}`)
  
  // Validar token del cliente en el servidor con ventana de tiempo
  // Tendremos que validar usando el tiempo del cliente como referencia
  const clientTokenValidInServer = await serverTotp.validate({
    token: clientToken,
    timestamp: clientTime, // Usar el tiempo del cliente
    window: 3 // Ventana de 3 períodos (90 segundos)
  })
  
  console.log(`Token del cliente válido en servidor: ${clientTokenValidInServer ? 'Sí' : 'No'}`)
  
  // Demostrar el efecto de diferentes ventanas
  console.log("\nEfecto de diferentes ventanas de validación:")
  console.log("-------------------------------------------")
  
  for (let windowSize = 0; windowSize <= 3; windowSize++) {
    const valid = await serverTotp.validate({
      token: clientToken,
      timestamp: clientTime,
      window: windowSize
    })
    console.log(`Ventana de ±${windowSize} períodos: ${valid ? 'Válido' : 'Inválido'}`)
  }
}

runExample().catch(console.error)