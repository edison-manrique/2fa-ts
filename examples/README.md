# Ejemplos de uso de la biblioteca 2FA

Esta carpeta contiene ejemplos prácticos de cómo utilizar la biblioteca modular 2FA.

## Ejemplos disponibles

1. [generate-secret.ts](./generate-secret.ts) - Generación de secretos
2. [totp-basic.ts](./totp-basic.ts) - Uso básico de TOTP
3. [hotp-basic.ts](./hotp-basic.ts) - Uso básico de HOTP
4. [totp-advanced.ts](./totp-advanced.ts) - Opciones avanzadas de TOTP
5. [hotp-advanced.ts](./hotp-advanced.ts) - Opciones avanzadas de HOTP
6. [uri-operations.ts](./uri-operations.ts) - Operaciones con URI
7. [totp-custom-secret.ts](./totp-custom-secret.ts) - TOTP con secretos personalizados
8. [hotp-custom-secret.ts](./hotp-custom-secret.ts) - HOTP con secretos personalizados
9. [qr-code-generation.ts](./qr-code-generation.ts) - Generación de códigos QR 2FA
10. [totp-time-sync.ts](./totp-time-sync.ts) - Sincronización de tiempo TOTP
11. [hotp-counter-sync.ts](./hotp-counter-sync.ts) - Sincronización de contador HOTP

## Requisitos previos

Asegúrate de tener instaladas las dependencias necesarias:

```bash
npm install
```

## Ejecutar los ejemplos

```bash
# Generar secreto
npm run generate-secret

# Uso básico de TOTP
npm run totp-basic

# Uso básico de HOTP
npm run hotp-basic

# Opciones avanzadas de TOTP
npm run totp-advanced

# Opciones avanzadas de HOTP
npm run hotp-advanced

# Operaciones con URI
npm run uri-operations

# TOTP con secreto personalizado
npm run totp-custom-secret

# HOTP con secreto personalizado
npm run hotp-custom-secret

# Generación de código QR 2FA
npm run qr-code-generation

# Sincronización de tiempo TOTP
npm run totp-time-sync

# Sincronización de contador HOTP
npm run hotp-counter-sync
```

También se puede ejecutar directamente con ts-node:

```bash
bun run generate-secret.ts
```

## Descripción de los ejemplos

### Generación de secretos ([generate-secret.ts](./generate-secret.ts))

Muestra cómo crear secretos de diferentes maneras:
- Generación aleatoria
- Longitud personalizada
- Generación desde un buffer existente

### Uso básico de TOTP ([totp-basic.ts](./totp-basic.ts))

Demuestra el uso básico de TOTP:
- Crear una instancia
- Generar tokens
- Verificar tokens
- Obtener información adicional

### Uso básico de HOTP ([hotp-basic.ts](./hotp-basic.ts))

Demuestra el uso básico de HOTP:
- Crear una instancia
- Generar tokens (incrementando automáticamente el contador)
- Verificar tokens

### Opciones avanzadas de TOTP ([totp-advanced.ts](./totp-advanced.ts))

Muestra opciones avanzadas de TOTP:
- Diferentes algoritmos (SHA256, SHA512)
- Número de dígitos personalizado
- Período personalizado
- Validación con ventana de tiempo
- Generación en un momento específico

### Opciones avanzadas de HOTP ([hotp-advanced.ts](./hotp-advanced.ts))

Muestra opciones avanzadas de HOTP:
- Diferentes algoritmos (SHA256, SHA512)
- Número de dígitos personalizado
- Validación con ventana de contador

### Operaciones con URI ([uri-operations.ts](./uri-operations.ts))

Demuestra cómo manejar URI compatibles con Google Authenticator:
- Generar URI para TOTP y HOTP
- Parsear URI existentes
- Usar objetos parseados para generar tokens

### TOTP con secretos personalizados ([totp-custom-secret.ts](./totp-custom-secret.ts))

Muestra cómo usar TOTP con secretos personalizados:
- Crear secretos desde bytes específicos
- Usar secretos personalizados en instancias TOTP
- Generar y verificar tokens con estos secretos

### HOTP con secretos personalizados ([hotp-custom-secret.ts](./hotp-custom-secret.ts))

Muestra cómo usar HOTP con secretos personalizados:
- Crear secretos desde bytes específicos
- Usar secretos personalizados en instancias HOTP
- Generar y verificar tokens con estos secretos

### Generación de códigos QR 2FA ([qr-code-generation.ts](./qr-code-generation.ts))

Demuestra cómo generar URI compatibles con Google Authenticator que se pueden convertir en códigos QR:
- Generar URI para que las aplicaciones de autenticación lo escaneen
- Comparar diferentes configuraciones de TOTP
- Mostrar cómo integrar con bibliotecas de generación de códigos QR

### Sincronización de tiempo TOTP ([totp-time-sync.ts](./totp-time-sync.ts))

Muestra cómo manejar la sincronización de tiempo en TOTP:
- Generar tokens en un momento específico
- Verificar tokens usando ventanas de tiempo
- Manejar desviaciones de tiempo entre cliente y servidor
- Demostrar efectos de diferentes tamaños de ventana

### Sincronización de contador HOTP ([hotp-counter-sync.ts](./hotp-counter-sync.ts))

Muestra cómo manejar la sincronización de contador en HOTP:
- Generar secuencias de tokens
- Manejar desincronización entre cliente y servidor
- Usar ventanas para resincronizar contadores
- Demostrar efectos de diferentes tamaños de ventana