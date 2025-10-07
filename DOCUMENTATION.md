# Librería 2FA - Documentación Completa

Una librería modular de autenticación de dos factores que implementa los algoritmos HOTP (HMAC-based One-Time Password) y TOTP (Time-based One-Time Password) basados en RFC 4226 y RFC 6238 respectivamente.

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Instalación](#instalación)
3. [Componentes Principales](#componentes-principales)
   - [Secret](#secret)
   - [HOTP](#hotp)
   - [TOTP](#totp)
   - [URI](#uri)
   - [HMAC](#hmac)
4. [Referencia de API](#referencia-de-api)
5. [Ejemplos de Uso](#ejemplos-de-uso)
6. [Consideraciones de Seguridad](#consideraciones-de-seguridad)
7. [Licencia](#licencia)

## Visión General

Esta librería proporciona una implementación completa de mecanismos de autenticación de dos factores:
- HOTP (HMAC-based One-Time Password) - RFC 4226
- TOTP (Time-based One-Time Password) - RFC 6238

La implementación es modular, permitiéndote usar cada componente de forma independiente o conjunta. Soporta varios algoritmos hash, configuraciones personalizadas, y es compatible con Google Authenticator y otras aplicaciones 2FA estándar.

## Instalación

```bash
npm install @blockchain/2fa
```

O si estás trabajando directamente con el código fuente:

```bash
cd my-blockchain/core/crypto/2fa_prev
npm install
```

## Componentes Principales

### Secret

La clase [Secret](#secret) representa un secreto criptográfico utilizado en la generación OTP. Proporciona métodos para crear secretos desde varias fuentes y convertirlos a diferentes formatos.

#### Características
- Generar secretos aleatorios
- Crear secretos desde arrays de bytes existentes
- Convertir secretos a representaciones Base32 y hexadecimal
- Crear secretos desde cadenas Base32

#### Constructor
```typescript
new Secret({ buffer, size = 20 }: { buffer?: Uint8Array; size?: number })
```

Parámetros:
- `buffer` (opcional): Array de bytes existente para usar como secreto
- `size` (opcional): Tamaño del secreto en bytes (por defecto: 20)

#### Propiedades
- `bytes`: La representación en bytes crudos del secreto (solo lectura)

#### Métodos
- `base32`: Getter que devuelve la representación Base32 del secreto
- `hex`: Getter que devuelve la representación hexadecimal del secreto
- `static fromBase32(base32Str: string)`: Crea una instancia de Secret desde una cadena Base32

#### Ejemplo
```typescript
// Generar un secreto aleatorio
const secret = new Secret();

// Crear un secreto con tamaño personalizado
const largeSecret = new Secret({ size: 32 });

// Crear un secreto desde bytes existentes
const bytes = new Uint8Array([1, 2, 3, 4, 5]);
const secretFromBytes = new Secret({ buffer: bytes });

// Crear un secreto desde una cadena Base32
const secretFromBase32 = Secret.fromBase32("JBSWY3DPEHPK3PXP");
```

### HOTP

La clase [HOTP](#hotp) implementa el algoritmo HMAC-based One-Time Password según se define en RFC 4226. HOTP genera contraseñas de un solo uso basadas en un valor de contador.

#### Características
- Generar tokens HOTP basados en un contador
- Validar tokens HOTP con sincronización de contador
- Soporte para diferentes algoritmos hash (SHA-1, SHA-256, SHA-512)
- Longitud de token configurable
- Compatibilidad con URI de Google Authenticator

#### Constructor
```typescript
new HOTP({
  issuer = "",
  label = "OTPAuth",
  issuerInLabel = true,
  secret = new Secret(),
  algorithm = "SHA1",
  digits = 6,
  counter = 0
}: HOTPOptions)
```

Parámetros:
- `issuer` (opcional): El nombre del servicio/proveedor
- `label` (opcional): El nombre de la cuenta (por defecto: "OTPAuth")
- `issuerInLabel` (opcional): Si incluir el emisor en la etiqueta (por defecto: true)
- `secret` (opcional): La clave secreta (por defecto: nuevo Secret aleatorio)
- `algorithm` (opcional): Algoritmo hash (por defecto: "SHA1")
- `digits` (opcional): Número de dígitos en el token (por defecto: 6)
- `counter` (opcional): Valor inicial del contador (por defecto: 0)

#### Propiedades
- `issuer`: El nombre del servicio/proveedor
- `label`: El nombre de la cuenta
- `issuerInLabel`: Si el emisor está incluido en la etiqueta
- `secret`: La clave secreta
- `algorithm`: Algoritmo hash usado
- `digits`: Número de dígitos en los tokens
- `counter`: Valor actual del contador

#### Métodos
- `static async generate(config: HOTPConfig)`: Genera un token HOTP
- `async generate({ counter } = {})`: Genera un token HOTP con el contador actual o especificado
- `static async validate(config: HOTPValidateConfig)`: Valida un token HOTP
- `async validate({ token, counter, window })`: Valida un token HOTP
- `toString()`: Devuelve una URI compatible con Google Authenticator

#### Ejemplo
```typescript
// Crear una instancia básica de HOTP
const hotp = new HOTP({
  issuer: "MiApp",
  label: "user@example.com"
});

// Generar un token
const token = await hotp.generate();

// Validar un token
const isValid = await hotp.validate({ token, counter: 1 });
```

### TOTP

La clase [TOTP](#totp) implementa el algoritmo Time-based One-Time Password según se define en RFC 6238. TOTP genera contraseñas de un solo uso basadas en la hora actual.

#### Características
- Generar tokens TOTP basados en la hora actual
- Validar tokens TOTP con sincronización de ventana de tiempo
- Soporte para diferentes algoritmos hash (SHA-1, SHA-256, SHA-512)
- Longitud de token y período de tiempo configurables
- Compatibilidad con URI de Google Authenticator

#### Constructor
```typescript
new TOTP({
  issuer = "",
  label = "OTPAuth",
  issuerInLabel = true,
  secret = new Secret(),
  algorithm = "SHA1",
  digits = 6,
  period = 30
}: TOTPOptions)
```

Parámetros:
- `issuer` (opcional): El nombre del servicio/proveedor
- `label` (opcional): El nombre de la cuenta (por defecto: "OTPAuth")
- `issuerInLabel` (opcional): Si incluir el emisor en la etiqueta (por defecto: true)
- `secret` (opcional): La clave secreta (por defecto: nuevo Secret aleatorio)
- `algorithm` (opcional): Algoritmo hash (por defecto: "SHA1")
- `digits` (opcional): Número de dígitos en el token (por defecto: 6)
- `period` (opcional): Período de tiempo en segundos (por defecto: 30)

#### Propiedades
- `issuer`: El nombre del servicio/proveedor
- `label`: El nombre de la cuenta
- `issuerInLabel`: Si el emisor está incluido en la etiqueta
- `secret`: La clave secreta
- `algorithm`: Algoritmo hash usado
- `digits`: Número de dígitos en los tokens
- `period`: Período de tiempo en segundos

#### Métodos
- `static counter({ period, timestamp })`: Calcula el contador basado en el tiempo
- `counter({ timestamp })`: Calcula el contador basado en el tiempo
- `static remaining({ period, timestamp })`: Calcula el tiempo restante para el token actual
- `remaining({ timestamp })`: Calcula el tiempo restante para el token actual
- `static async generate(config: TOTPGenerateConfig)`: Genera un token TOTP
- `async generate({ timestamp } = {})`: Genera un token TOTP para la hora actual o especificada
- `static async validate(config: TOTPValidateConfig)`: Valida un token TOTP
- `async validate({ token, timestamp, window })`: Valida un token TOTP
- `toString()`: Devuelve una URI compatible con Google Authenticator

#### Ejemplo
```typescript
// Crear una instancia básica de TOTP
const totp = new TOTP({
  issuer: "MiApp",
  label: "user@example.com"
});

// Generar un token
const token = await totp.generate();

// Validar un token
const isValid = await totp.validate({ token });

// Obtener el tiempo restante para el token actual
const remaining = totp.remaining();
```

### URI

La clase [URI](#uri) maneja el análisis y generación de URIs compatibles con Google Authenticator.

#### Características
- Analizar URIs de Google Authenticator para crear instancias HOTP/TOTP
- Generar URIs desde instancias HOTP/TOTP
- Soporte para todos los parámetros estándar de URI

#### Métodos
- `static parse(uri: string)`: Analiza una URI de Google Authenticator
- `static stringify(otp: HOTP | TOTP)`: Convierte una instancia OTP a URI

#### Ejemplo
```typescript
// Analizar una URI
const totp = URI.parse('otpauth://totp/MyApp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=MyApp');

// Generar una URI
const uri = URI.stringify(totp);
```

### HMAC

El módulo HMAC proporciona funciones criptográficas para generar resúmenes HMAC usados en algoritmos OTP.

#### Características
- Soporte para algoritmos SHA-1, SHA-256 y SHA-512
- Compatibilidad multiplataforma (navegador y Node.js)
- Implementación según RFC 2104

#### Métodos
- `async hmacDigest(algorithm: string, key: Uint8Array, message: Uint8Array)`: Genera un resumen HMAC

## Referencia de API

### API de Secret

#### Constructor
```typescript
new Secret({ buffer?: Uint8Array; size?: number })
```

#### Propiedades
- `bytes: Uint8Array` (solo lectura)

#### Getters
- `base32: string`
- `hex: string`

#### Métodos Estáticos
- `fromBase32(base32Str: string): Secret`

### API de HOTP

#### Constructor
```typescript
new HOTP(options?: HOTPOptions)
```

#### Propiedades
- `issuer: string`
- `label: string`
- `issuerInLabel: boolean`
- `secret: Secret`
- `algorithm: string`
- `digits: number`
- `counter: number`

#### Propiedades Estáticas
- `defaults`: Valores de configuración por defecto

#### Métodos
- `static async generate(config: HOTPConfig): string`
- `async generate({ counter }?): Promise<string>`
- `static async validate(config: HOTPValidateConfig): Promise<number | null>`
- `async validate({ token, counter, window }?): Promise<number | null>`
- `toString(): string`

### API de TOTP

#### Constructor
```typescript
new TOTP(options?: TOTPOptions)
```

#### Propiedades
- `issuer: string`
- `label: string`
- `issuerInLabel: boolean`
- `secret: Secret`
- `algorithm: HashAlgorithm`
- `digits: number`
- `period: number`

#### Propiedades Estáticas
- `defaults`: Valores de configuración por defecto

#### Métodos
- `static counter({ period, timestamp }?): number`
- `counter({ timestamp }?): number`
- `static remaining({ period, timestamp }?): number`
- `remaining({ timestamp }?): number`
- `static async generate(config: TOTPGenerateConfig): Promise<string>`
- `async generate({ timestamp }?): Promise<string>`
- `static async validate(config: TOTPValidateConfig): Promise<number | null>`
- `async validate({ token, timestamp, window }?): Promise<number | null>`
- `toString(): string`

### API de URI

#### Métodos
- `static parse(uri: string): HOTP | TOTP`
- `static stringify(otp: HOTP | TOTP): string`

## Ejemplos de Uso

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
bun run examples/totp-basic.ts
```

## Consideraciones de Seguridad

1. **Almacenamiento de Secretos**: Almacena secretos de forma segura y nunca los expongas en código del lado del cliente
2. **Transmisión**: Siempre transmite tokens a través de canales seguros (HTTPS)
3. **Ventanas de Validación**: Usa tamaños de ventana apropiados para la validación para equilibrar seguridad y usabilidad
4. **Sincronización de Reloj**: Para TOTP, asegura una sincronización de tiempo adecuada entre cliente y servidor
5. **Sincronización de Contador**: Para HOTP, implementa mecanismos adecuados de sincronización de contador
6. **Selección de Algoritmo**: Prefiere SHA-256 o SHA-512 sobre SHA-1 para mejor seguridad
7. **Longitud de Token**: Usa al menos 6 dígitos, preferiblemente 8 dígitos para mejor seguridad

## Licencia

Esta librería 2FA está licenciada bajo la Licencia MIT. Ver el archivo [LICENSE](./LICENSE) para más información.