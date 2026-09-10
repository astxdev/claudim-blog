/**
 * @file lexical.ts
 * @description Monta o JSON mínimo do editor Lexical a partir de parágrafos de texto puro
 *
 * Responsabilidade: só existe para o script de seed conseguir escrever no
 * campo `body` (richText) sem precisar do editor visual do admin.
 * Camada: web (script de desenvolvimento)
 */
import type { Article } from '@/payload-types'

function paragraph(text: string) {
  return {
    type: 'paragraph',
    version: 1,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'text',
        version: 1,
        text,
        format: 0,
        detail: 0,
        mode: 'normal',
        style: '',
      },
    ],
  }
}

export function buildRichText(paragraphs: string[]): Article['body'] {
  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: paragraphs.map(paragraph),
    },
  }
}
