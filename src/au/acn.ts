import { ValueObject } from '@unruly-software/value-object'
import z from 'zod'

const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 1]

export class ACN extends ValueObject.define({
  id: '@unruly-software/value-object-lib/ACN',
  schema: () =>
    z
      .string({
        message: 'Invalid ACN. Must be a text value.',
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
              message: 'Invalid ACN. Must be a text value.',
            })
            return z.NEVER
          }
          cleanValue += char
          digits.push(number)
        }

        if (digits.length !== 9) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid ACN format. Must be 11 digits long.',
          })
          return z.NEVER
        }

        const first8Numbers = digits.slice(0, -1)
        const numbersSum = first8Numbers.reduce((sum, number, index) => {
          const weightedNumber = number * WEIGHTS[index]
          return sum + weightedNumber
        }, 0)
        const remainder = numbersSum % 10
        const complement = 10 - remainder
        const checkDigit = complement === 10 ? 0 : complement

        if (digits[8] !== checkDigit) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid ACN checksum.',
          })
          return z.NEVER
        }

        return cleanValue
      }),
}) {
  static fakeInstance() {
    return ACN.fromJSON('000 000 019')
  }

  /**
   * Australian ACNs are typically formatted as "xxx xxx xxx"
   * when displayed.
   */
  toStandardFormat() {
    const parts = this.props.split('')
    return [
      parts.splice(0, 3).join(''),
      parts.splice(0, 3).join(''),
      parts.splice(0, 3).join(''),
    ].join(' ')
  }
}
