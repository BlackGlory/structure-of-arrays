import { createDefaultValueOfStructure } from '@src/utils'
import { Structure, int8, boolean, string } from '@src/types'

test('createDefaultValueOfStructure', () => {
  const keys: string[] = ['integer', 'boolean', 'string']
  const structure: Structure = {
    integer: int8
  , boolean: boolean
  , string: string
  , other: int8
  }

  const result = createDefaultValueOfStructure(keys, structure)

  expect(result).toStrictEqual({
    integer: 0
  , boolean: false
  , string: ''
  })
})
