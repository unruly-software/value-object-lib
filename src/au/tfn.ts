import { ValueObject } from '@unruly-software/value-object'
import z from 'zod'

const TFNSchema = (weights: number[], length: number) =>
  z
    .string({
      message: 'Invalid TFN format. Must be a text value.',
    })
    .trim()
    .transform((initial, ctx) => {
      let cleanValue: string = ''
      const digits: number[] = []

      for (const char of initial) {
        /** These characters are commonly paired with TFN's */
        if (char === '-' || char === ' ' || char === '.' || char === '\n') {
          continue
        }
        const number = parseInt(char, 10)
        if (Number.isNaN(number)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid TFN format. Must be a text value.',
          })
          return z.NEVER
        }
        cleanValue += char
        digits.push(number)
      }

      if (digits.length !== length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid TFN format. Must be ${length} digits long.`,
        })
        return z.NEVER
      }

      const checksum = digits.reduce((sum, number, index) => {
        const weightedNumber = number * weights[index]
        return sum + weightedNumber
      }, 0)

      if (checksum == 0 || checksum % 11 != 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid TFN checksum.',
        })
        return z.NEVER
      }

      return cleanValue
    })

export class IndividualTFN extends ValueObject.define({
  id: '@unruly-software/value-object-lib/IndividualTFN',
  schema: () => TFNSchema([1, 4, 3, 7, 5, 8, 6, 9, 10], 9),
}) {
  static fake() {
    return IndividualTFN.fromJSON('459599230')
  }
}

export class BusinessTFN extends ValueObject.define({
  id: '@unruly-software/value-object-lib/BusinessTFN',
  schema: () => TFNSchema([10, 7, 8, 4, 6, 3, 5, 1, 0], 8),
}) {
  static fake(): BusinessTFN {
    return new BusinessTFN('12345678')
  }
}

export class AnyTFN extends ValueObject.define({
  id: '@unruly-software/value-object-lib/AnyTFN',
  schema: () =>
    z.union([
      IndividualTFN.schema().transform((tfn) => tfn.props),
      BusinessTFN.schema().transform((tfn) => tfn.props),
    ]),
}) {
  getType(): 'IndividualTFN' | 'BusinessTFN' {
    if (this.props.length === 9) {
      return 'IndividualTFN'
    }
    if (this.props.length === 8) {
      return 'BusinessTFN'
    }
    throw new Error('Unexpected Error: Invalid validated TFN length')
  }
}
