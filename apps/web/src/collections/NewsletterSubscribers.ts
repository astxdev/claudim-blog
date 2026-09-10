import type { CollectionConfig } from 'payload'
import { ValidationError } from 'payload'
import {
  INTEREST_AREAS,
  createSubscriberRegisteredEvent,
  describeSubscriberValidationError,
  isInterestArea,
  validateSubscriberInput,
} from '@claudim/core'
import { handleSubscriberRegistered } from '@claudim/infra'

export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'interests', 'subscribedAt'],
  },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'interests',
      type: 'select',
      hasMany: true,
      required: true,
      options: INTEREST_AREAS.map((area) => ({ label: area, value: area })),
    },
    {
      name: 'source',
      type: 'text',
      defaultValue: 'website',
    },
    {
      name: 'subscribedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation !== 'create' || !data) {
          return data
        }

        const result = validateSubscriberInput({
          name: data.name,
          email: data.email,
          interests: data.interests,
        })

        if (!result.ok) {
          throw new ValidationError({
            collection: 'newsletter-subscribers',
            errors: result.errors.map((error) => ({
              path: error.field,
              message: describeSubscriberValidationError(error),
            })),
          })
        }

        data.name = result.value.name
        data.email = result.value.email
        data.interests = result.value.interests

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        if (operation !== 'create') return

        await handleSubscriberRegistered(
          createSubscriberRegisteredEvent({
            name: doc.name,
            email: doc.email,
            interests: (Array.isArray(doc.interests) ? doc.interests : []).filter(isInterestArea),
          }),
        )
      },
    ],
  },
}
