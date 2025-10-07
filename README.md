# Librería 2FA

Una librería modular de autenticación de dos factores que implementa los algoritmos HOTP (HMAC-based One-Time Password) y TOTP (Time-based One-Time Password) basados en RFC 4226 y RFC 6238 respectivamente.

## Características

- 🔐 Implementación HOTP (HMAC-based One-Time Password)
- 🕒 Implementación TOTP (Time-based One-Time Password)
- 🔗 Análisis y generación de URI para compatibilidad con Google Authenticator
- 🔤 Codificación/decodificación Base32
- 📦 Diseño modular para fácil integración

## Instalación

```bash
npm install @blockchain/2fa
```

## Documentación

Para la documentación completa de todos los componentes, consulta:
- [Documentación Completa](./DOCUMENTATION.md)
- [Referencia de API](./DOCUMENTATION.md#referencia-de-api)
- [Ejemplos de Uso](./DOCUMENTATION.md#ejemplos-de-uso)

## Uso

### TOTP (Time-based One-Time Password)

```typescript
import { TOTP } from '@blockchain/2fa';

// Crear una nueva instancia TOTP
const totp = new TOTP({
  issuer: 'MiApp',
  label: 'usuario@ejemplo.com',
  algorithm: 'SHA1',
  digits: 6,
  period: 30
});

// Generar un token
const token = await totp.generate();

// Validar un token
const isValid = await totp.validate({ token });
```

### HOTP (HMAC-based One-Time Password)

```typescript
import { HOTP } from '@blockchain/2fa';

// Crear una nueva instancia HOTP
const hotp = new HOTP({
  issuer: 'MiApp',
  label: 'usuario@ejemplo.com',
  algorithm: 'SHA1',
  digits: 6,
  counter: 0
});

// Generar un token
const token = await hotp.generate();

// Validar un token
const isValid = await hotp.validate({ token });
```

### Análisis de URI

```typescript
import { URI } from '@blockchain/2fa';

// Analizar una URI de Google Authenticator
const otp = URI.parse('otpauth://totp/MiApp:usuario@ejemplo.com?secret=JBSWY3DPEHPK3PXP&issuer=MiApp');

// Generar una URI desde una instancia OTP
const uri = URI.stringify(otp);
```

## Ejemplos

Ejemplos detallados se pueden encontrar en el directorio [examples](./examples):

1. [generate-secret.ts](./examples/generate-secret.ts) - Generación de secretos
2. [hotp-basic.ts](./examples/hotp-basic.ts) - Uso básico de HOTP
3. [hotp-advanced.ts](./examples/hotp-advanced.ts) - Uso avanzado de HOTP
4. [hotp-custom-secret.ts](./examples/hotp-custom-secret.ts) - HOTP con secretos personalizados
5. [hotp-counter-sync.ts](./examples/hotp-counter-sync.ts) - Sincronización de contador HOTP
6. [totp-basic.ts](./examples/totp-basic.ts) - Uso básico de TOTP
7. [totp-advanced.ts](./examples/totp-advanced.ts) - Uso avanzado de TOTP
8. [totp-custom-secret.ts](./examples/totp-custom-secret.ts) - TOTP con secretos personalizados
9. [totp-time-sync.ts](./examples/totp-time-sync.ts) - Sincronización de tiempo TOTP
10. [uri-operations.ts](./examples/uri-operations.ts) - Operaciones con URI
11. [qr-code-generation.ts](./examples/qr-code-generation.ts) - Generación de códigos QR

Ejecutar ejemplos con:
```bash
npx ts-node examples/totp-basic.ts
```

## API

### TOTP

- `new TOTP(options)` - Crear una nueva instancia TOTP
- `totp.generate([timestamp])` - Generar un token
- `totp.validate({ token, timestamp, window })` - Validar un token
- `totp.toString()` - Generar una URI de Google Authenticator

### HOTP

- `new HOTP(options)` - Crear una nueva instancia HOTP
- `hotp.generate([counter])` - Generar un token
- `hotp.validate({ token, counter, window })` - Validar un token
- `hotp.toString()` - Generar una URI de Google Authenticator

### URI

- `URI.parse(uri)` - Analizar una URI de Google Authenticator
- `URI.stringify(otp)` - Generar una URI desde una instancia OTP

## Licencia

MIT