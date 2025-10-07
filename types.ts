import { Secret } from "./secret"

// Interfaces for configuration options
export interface HOTPConfig {
  secret: Secret
  algorithm?: string
  digits?: number
  counter?: number
}

export interface HOTPValidateConfig extends Omit<HOTPConfig, "secret"> {
  token: string
  secret: Secret
  window?: number
}

export interface HOTPOptions {
  issuer?: string
  label?: string
  issuerInLabel?: boolean
  secret?: Secret | string
  algorithm?: string
  digits?: number
  counter?: number
}

// Interfaces for TOTP configuration options
export interface TOTPGenerateConfig {
  secret: Secret
  algorithm?: string
  digits?: number
  period?: number
  timestamp?: number
}

export interface TOTPValidateConfig extends Omit<TOTPGenerateConfig, "secret"> {
  token: string
  secret: Secret
  window?: number
}

export interface TOTPOptions {
  issuer?: string
  label?: string
  issuerInLabel?: boolean
  secret?: Secret | string
  algorithm?: string
  digits?: number
  period?: number
}

export interface CounterConfig {
  period?: number
  timestamp?: number
}

export type HashAlgorithm =
  | "SHA1"
  | "SHA224"
  | "SHA256"
  | "SHA384"
  | "SHA512"
  | "SHA3-224"
  | "SHA3-256"
  | "SHA3-384"
  | "SHA3-512"
