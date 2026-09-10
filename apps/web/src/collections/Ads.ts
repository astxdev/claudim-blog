import type { CollectionConfig } from 'payload'

export const AD_SLOTS = ['top-banner', 'homepage-after-hero', 'section-sidebar', 'article-inline'] as const

export const Ads: CollectionConfig = {
  slug: 'ads',
  admin: {
    useAsTitle: 'advertiser',
    defaultColumns: ['advertiser', 'slot', 'active'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'advertiser',
      type: 'text',
      required: true,
    },
    {
      name: 'slot',
      type: 'select',
      required: true,
      options: AD_SLOTS.map((slot) => ({ label: slot, value: slot })),
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'startDate',
      type: 'date',
    },
    {
      name: 'endDate',
      type: 'date',
    },
  ],
}
