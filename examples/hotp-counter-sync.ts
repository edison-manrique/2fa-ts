import { HOTP, Secret } from "../index"

/**
 * Ejemplo: Sincronización de contador para HOTP
 * 
 * Este ejemplo muestra cómo manejar la sincronización de contador en HOTP,
 * que es crucial para mantener la sincronización entre cliente y servidor.
 */

async function runExample() {
  // Crear una instancia HOTP con un secreto específico
  const secret = new Secret({ 
    buffer: new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
  })
  
  const hotp = new HOTP({
    issuer: "SistemaContador",
    label: "usuario@ejemplo.com",
    secret: secret,
    algorithm: "SHA256",
    digits: 6,
    counter: 1
  })

  console.log("Ejemplo de sincronización de contador HOTP:")
  console.log("==========================================")
  console.log(`Contador inicial: ${hotp.counter}`)

  // Generar una secuencia de tokens
  console.log("\nGenerando secuencia de tokens:")
  const tokens: string[] = []
  for (let i = 0; i < 5; i++) {
    const token = await hotp.generate()
    tokens.push(token)
    console.log(`Contador ${hotp.counter}: ${token}`)
  }

  // Simular desincronización (cliente y servidor no tienen el mismo contador)
  console.log("\nSimulando desincronización de contador:")
  console.log("--------------------------------------")
  
  // Restablecer el contador del cliente a un valor anterior
  const clientHotp = new HOTP({
    issuer: "Cliente",
    label: "client@ejemplo.com",
    secret: secret,
    algorithm: "SHA256",
    digits: 6,
    counter: 3 // Cliente está 2 pasos atrás
  })
  
  const serverHotp = new HOTP({
    issuer: "Servidor",
    label: "server@ejemplo.com",
    secret: secret,
    algorithm: "SHA256",
    digits: 6,
    counter: 5 // Servidor está en el contador 5
  })
  
  console.log(`Contador del cliente: ${clientHotp.counter}`)
  console.log(`Contador del servidor: ${serverHotp.counter}`)
  
  // Cliente genera un nuevo token
  const clientToken = await clientHotp.generate()
  console.log(`\nToken generado por el cliente (contador ${clientHotp.counter}): ${clientToken}`)
  
  // Servidor intenta validar el token con su contador actual
  const isValidNoWindow = await serverHotp.validate({
    token: clientToken,
    counter: serverHotp.counter
  })
  console.log(`Validación sin ventana: ${isValidNoWindow !== null ? 'Válido' : 'Inválido'}`)
  
  // Servidor intenta validar con ventana (busca en contadores anteriores)
  const isValidWithWindow = await serverHotp.validate({
    token: clientToken,
    counter: serverHotp.counter,
    window: 5 // Busca en 5 contadores anteriores
  })
  
  if (isValidWithWindow !== null) {
    console.log(`Validación con ventana: Válido (desfase de contador: ${isValidWithWindow})`)
  } else {
    console.log(`Validación con ventana: Inválido`)
  }
  
  // Demostrar resincronización
  console.log("\nResincronización de contador:")
  console.log("-----------------------------")
  
  // Generar varios tokens del cliente para que el servidor pueda resincronizar
  const syncTokens: {counter: number, token: string}[] = []
  const originalClientCounter = clientHotp.counter
  
  for (let i = 0; i < 5; i++) {
    const token = await clientHotp.generate()
    syncTokens.push({ counter: clientHotp.counter, token })
  }
  
  console.log("Tokens enviados por el cliente para resincronización:")
  syncTokens.forEach(item => {
    console.log(`  Contador ${item.counter}: ${item.token}`)
  })
  
  // Servidor intenta validar cada token para encontrar el desfase correcto
  let resynchronized = false
  for (const item of syncTokens) {
    const delta = await serverHotp.validate({
      token: item.token,
      counter: serverHotp.counter,
      window: 10
    })
    
    if (delta !== null) {
      console.log(`\nResincronización exitosa usando token del contador ${item.counter}`)
      console.log(`Desfase detectado: ${delta}`)
      console.log(`Nuevo contador del servidor: ${serverHotp.counter + delta}`)
      resynchronized = true
      break
    }
  }
  
  if (!resynchronized) {
    console.log("No se pudo resincronizar con los tokens proporcionados")
  }
  
  // Demostrar el efecto de diferentes tamaños de ventana
  console.log("\nEfecto de diferentes tamaños de ventana:")
  console.log("---------------------------------------")
  
  // Crear un HOTP con contador conocido
  const testHotp = new HOTP({
    issuer: "Test",
    label: "test@ejemplo.com",
    secret: secret,
    algorithm: "SHA256",
    digits: 6,
    counter: 10
  })
  
  const testToken = await testHotp.generate() // Contador ahora es 11
  console.log(`Token de prueba generado con contador 11: ${testToken}`)
  
  // Probar validación con diferentes ventanas
  for (let windowSize = 0; windowSize <= 3; windowSize++) {
    const validatorHotp = new HOTP({
      issuer: "Validator",
      label: "validator@ejemplo.com",
      secret: secret,
      algorithm: "SHA256",
      digits: 6,
      counter: 8 // 3 pasos atrás
    })
    
    const result = await validatorHotp.validate({
      token: testToken,
      counter: validatorHotp.counter,
      window: windowSize
    })
    
    console.log(`Ventana de ±${windowSize}: ${result !== null ? `Válido (desfase: ${result})` : 'Inválido'}`)
  }
}

runExample().catch(console.error)