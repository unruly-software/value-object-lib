import { ValueObject } from '@unruly-software/value-object'
import z from 'zod'

const WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]

export class ABN extends ValueObject.define({
  id: '@unruly-software/value-object-lib/ABN',
  schema: () =>
    z
      .string({
        message: 'Invalid ABN. Must be a text value.',
      })
      .trim()
      .transform((initial, ctx) => {
        let cleanValue: string = ''
        const digits: number[] = []

        for (const char of initial) {
          if (char === '-' || char === ' ') {
            continue
          }
          const number = parseInt(char, 10)
          if (Number.isNaN(number)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Invalid ABN. Must be a text value.',
            })
            return z.NEVER
          }
          cleanValue += char
          digits.push(number)
        }

        if (digits.length !== 11) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid ABN format. Must be 11 digits long.',
          })
          return z.NEVER
        }

        digits[0] -= 1
        const checksum = digits.reduce((sum, number, index) => {
          const weightedNumber = number * WEIGHTS[index]
          return sum + weightedNumber
        }, 0)

        if (checksum % 89 !== 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid ABN checksum.',
          })
          return z.NEVER
        }

        return cleanValue
      }),
}) {
  static fakeInstance() {
    return ABN.fromJSON('76 861 743 447')
  }

  /**
   * Australian ABNs are typically formatted as "xx xxx xxx xxx" when
   * displayed.
   */
  toStandardFormat() {
    const parts = this.props.split('')
    return [
      parts.splice(0, 2).join(''),
      parts.splice(0, 3).join(''),
      parts.splice(0, 3).join(''),
      parts.splice(0, 3).join(''),
    ].join(' ')
  }
}
