import type { CollectionConfig } from 'payload'
import { INTEREST_AREAS } from '@claudim/core'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'key', 'slug'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'key',
      type: 'select',
      required: true,
      unique: true,
      options: INTEREST_AREAS.map((area) => ({ label: area, value: area })),
      admin: {
        description: 'Pilar editorial fixo — precisa bater com InterestArea em @claudim/core.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Segmento da URL, em português (ex: tecnologia).',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'accentColor',
      type: 'text',
      admin: {
        description: 'Hex usado no badge da categoria (ex: #E8792B).',
      },
    },
  ],
}
