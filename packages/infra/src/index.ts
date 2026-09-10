/**
 * @file index.ts
 * @description Ponto único de entrada do pacote @claudim/infra
 *
 * Responsabilidade: reexportar os adapters que implementam, com efeitos
 * colaterais reais (I/O, rede, log), os contratos definidos em @claudim/core
 * Camada: infra
 */
export * from "./newsletter/index"
