import type { CollectionConfig } from 'payload'
import { ARTICLE_ACCESS_LEVELS, slugify } from '@claudim/core'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'accessLevel', 'publishedAt'],
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        description: 'Gerado automaticamente a partir do título.',
      },
    },
    {
      name: 'dek',
      type: 'textarea',
      admin: {
        description: 'Linha de apoio abaixo do título, no topo da matéria.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Chamada curta usada nos cards e em compartilhamentos.',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'authors',
      type: 'relationship',
      relationTo: 'authors',
      hasMany: true,
      required: true,
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
    },
    {
      name: 'accessLevel',
      type: 'select',
      required: true,
      defaultValue: 'public',
      options: ARTICLE_ACCESS_LEVELS.map((level) => ({ label: level, value: level })),
      admin: {
        description: '"members" mostra só um teaser + CTA de assinatura (sem login de leitor no MVP).',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Elegível para a faixa de capa da home.',
      },
    },
    {
      name: 'featuredOrder',
      type: 'number',
      min: 1,
      max: 3,
      admin: {
        description: 'Ordem no carrossel da capa: 1, 2 ou 3.',
        condition: (_, siblingData) => Boolean(siblingData?.featured),
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.title) {
          data.slug = slugify(data.title)
        }
        return data
      },
    ],
  },
}
