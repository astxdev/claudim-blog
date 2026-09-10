/**
 * @file get-payload-client.ts
 * @description Instância cacheada do Payload Local API para uso nas páginas do frontend
 * Camada: web
 */
import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'

let cached: Promise<Payload> | null = null

/**
 * @returns instância do Payload, reaproveitada entre chamadas no mesmo processo
 */
export function getPayloadClient(): Promise<Payload> {
  if (!cached) {
    cached = getPayload({ config: configPromise })
  }
  return cached
}
