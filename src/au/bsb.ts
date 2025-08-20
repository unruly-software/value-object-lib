import { ValueObject } from '@unruly-software/value-object'
import z from 'zod'

export class BSB extends ValueObject.define({
  id: '@unruly-software/value-object-lib/BSB',
  schema: () =>
    z
      .string()
      .trim()
      .transform((initial, ctx) => {
        const result = initial.replace(/[-\s]/g, '')

        const digits: number[] = []
        for (const char of result) {
          const number = parseInt(char, 10)
          if (Number.isNaN(number)) {
            ctx.addIssue({
              code: 'custom',
              message: 'Invalid BSB format. Must be only comprised of numbers.',
            })
            return z.NEVER
          }
          digits.push(number)
        }

        if (digits.length !== 6) {
          ctx.addIssue({
            code: 'custom',
            message: 'Invalid BSB format. Must be 6 digits long.',
          })
          return z.NEVER
        }

        return digits.join('')
      }),
}) {
  static fakeInstance() {
    return BSB.fromJSON('123-456')
  }
}
