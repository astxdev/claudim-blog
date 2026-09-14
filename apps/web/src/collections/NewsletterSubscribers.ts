import type { CollectionConfig } from 'payload'
import { ValidationError } from 'payload'
import {
  INTEREST_AREAS,
  createSubscriberRegisteredEvent,
  describeSubscriberValidationError,
  validateSubscriberInput,
} from '@claudim/core'
import { handleSubscriberRegistered } from '@claudim/infra'

export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'subscribedAt'],
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
      required: false,
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
      required: false,
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
          email: data.email,
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

        data.email = result.value.email

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        if (operation !== 'create') return

        await handleSubscriberRegistered(
          createSubscriberRegisteredEvent({
            email: doc.email,
          }),
        )
      },
    ],
  },
}
