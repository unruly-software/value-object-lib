import {describe, it, expect, expectTypeOf} from 'vitest'
import {ABN, ACN, AnyTFN, BSB, BusinessTFN, IndividualTFN} from '../src/au'
import z from 'zod'
import {ValueObject} from '@unruly-software/value-object'

const testValueObject = <T extends ValueObject.ValueObjectConstructor<string, any>>(ctor: T, tests: {
  invalid: unknown[]
  valid: [input: Parameters<T['fromJSON']>[0], output: InstanceType<T>['props']][]
}) => {
  describe(ctor[ValueObject.ValueObjectIdSymbol], () => {
    tests.invalid.forEach((input) => {
      it(`should reject invalid input: ${JSON.stringify(input)}`, () => {
        /** Very specifically using .safeParse to ensure zod schemas do not
         * throw outside of where expected */
        const parsed = ctor.schema().safeParse(input)

        expect(parsed.success).toBe(false)
        expect(parsed.error).toMatchSnapshot()
        expect(() => ctor.fromJSON(input)).toThrowError()
      })
    })

    tests.valid.forEach(([input, output]) => {
      it(`should accept valid input: ${JSON.stringify(input)}`, () => {
        const parsed = ctor.schema().safeParse(input)

        if (!parsed.success) {
          throw parsed.error
        }
        expect(parsed.data.props).toEqual(output)

        const instance = ctor.fromJSON(input)
        expect(instance.props).toEqual(output)
      })
    })
  })

}

describe('Australian Value Objects', () => {
  testValueObject(BSB, {
    valid: [['123 456', '123456'], ['123 - 457', '123457'], ['\n123\n456\n', '123456']],
    invalid: ['123', '123456789', 'no numbers', '1234567', '123-45a', '123-4567', '123-456-789', '123 and 456'],
  })

  testValueObject(ABN, {
    valid: [
      [
        '51 824 753 556',
        '51824753556',
      ],
      [
        '51-824-753-556',
        '51824753556',
      ],
      [
        '51 824 753 556',
        '51824753556',
      ],
      [
        ' 11 223 491 505 ',
        '11223491505',
      ],
      [
        '91 834 387 136',
        '91834387136',
      ],
      [
        ' 78 247 283 315',
        '78247283315',
      ],
    ],

    invalid: [
      'Hello world',
      '12345678912',
      'c26177aa-5b00-4808-b81a-34057bfc189e',
      '11834387136',
      '00000000000',
      '99999999999',
      'My ABN is 91 834 387 136'
    ]
  })

  testValueObject(ACN, {
    invalid: [
      'my acn is 000 000 019',
      'Hello world',
      '12345678912',
      'c26177aa-5b00-4808-b81a-34057bfc189e',
      '51 824 753 556',
      '51-824-753-556',
      '000 250 001',
      '000 500 004',
      '000 750 006',
      '001 000 003',
      '001 250 008',
      '001 500 002',
      '001 749 199',
    ],
    valid: [
      ['000 000 019', '000000019'],
      ['000-000-019', '000000019'],
      [' 000 000 019', '000000019'],
      ['000 250 000', '000250000'],
      ['000 500 005', '000500005'],
      ['000 750 005', '000750005'],
      ['001 000 004', '001000004'],
      ['001 250 004', '001250004'],
      ['001 500 009', '001500009'],
      ['001 749 999', '001749999'],
      ['001 999 999', '001999999'],
      ['002 249 998', '002249998'],
      ['002 499 998', '002499998'],
      ['002 749 993', '002749993'],
      ['002 999 993', '002999993'],
      ['003 249 992', '003249992'],
      ['003 499 992', '003499992'],
      ['003 749 988', '003749988'],
      ['003 999 988', '003999988'],
      ['004 249 987', '004249987'],
      ['004 499 987', '004499987'],
      ['004 749 982', '004749982'],
      ['004 999 982', '004999982'],
      ['005 249 981', '005249981'],
      ['005 499 981', '005499981'],
      ['005 749 986', '005749986'],
      ['005 999 977', '005999977'],
      ['006 249 976', '006249976'],
      ['006 499 976', '006499976'],
      ['006 749 980', '006749980'],
      ['006 999 980', '006999980'],
      ['007 249 989', '007249989'],
      ['007 499 989', '007499989'],
      ['007 749 975', '007749975'],
      ['007 999 975', '007999975'],
      ['008 249 974', '008249974'],
      ['008 499 974', '008499974'],
      ['008 749 979', '008749979'],
      ['008 999 979', '008999979'],
      ['009 249 969', '009249969'],
      ['009 499 969', '009499969'],
      ['009 749 964', '009749964'],
      ['009 999 964', '009999964'],
      ['010 249 966', '010249966'],
      ['010 499 966', '010499966'],
      ['010 749 961', '010749961'],
      ['\n010 749 961\n', '010749961'],
      ['010-749-961', '010749961'],
    ]
  })

  const individualTFNs: [string, string][] = [
    ['\n865414088\n', '865414088'],
    ['459-599-230', '459599230'],
    ['1124-740-82', '112474082'],
    ['565.051.603', '565051603'],
    ['907 974 668', '907974668'],
  ]

  const businessTFNs: [string, string][] = [
    ['81 854 402', '81854402',],
    ['37 118 629', '37118629',],
    ['37 118 660', '37118660',],
    ['37 118 705', '37118705',],
    ['38 593 474', '38593474',],
    ['38 593 519', '38593519',],
    ['85 655 734', '85655734',],
    ['85 655 797', '85655797',],
    ['85 655 810', '85655810',],
    ['37 118 655', '37118655'],
  ]

  const sharedTFNCases = [
    'not a number',
    'ooooooooo',
    '123456789',
    '37 118 656',
    'Longform prose is not expected to be valid',
  ]

  testValueObject(IndividualTFN, {
    invalid: [
      ...businessTFNs.map(([input]) => input),
      ...sharedTFNCases,
    ],
    valid: individualTFNs,
  })

  testValueObject(BusinessTFN, {
    invalid: [
      ...individualTFNs.map(([input]) => input),
      ...sharedTFNCases,
    ],
    valid: businessTFNs,
  })

  testValueObject(AnyTFN, {
    invalid: [
      ...sharedTFNCases,
    ],
    valid: [
      ...individualTFNs,
      ...businessTFNs,
    ],
  })
})
