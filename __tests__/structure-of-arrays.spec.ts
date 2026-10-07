import { test, expect } from 'vitest'
import { StructureOfArrays } from '@src/structure-of-arrays.js'

test('StructureOfArrays', () => {
  const soa = new StructureOfArrays({
    structure: {
      foo: Float32Array
    , bar: Float64Array
    }
  , length: 100
  })

  expect(soa.length).toBe(100)
  const { foo, bar } = soa.arrays
  expect(foo).toBeInstanceOf(Float32Array)
  expect(foo.length).toBe(100)
  expect(bar).toBeInstanceOf(Float64Array)
  expect(bar.length).toBe(100)
})
