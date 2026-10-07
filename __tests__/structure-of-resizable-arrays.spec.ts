import { describe, test, expect } from 'vitest'
import { StructureOfResizableArrays } from '@src/structure-of-resizable-arrays.js'

describe('StructureOfResizableArrays', () => {
  test('constructor', () => {
    const soa = new StructureOfResizableArrays({
      structure: {
        foo: Float32Array
      , bar: Float64Array
      }
    , maxCapacity: 100
    , initialCapacity: 1
    , growthFactor: 2
    })

    expect(soa.maxCapacity).toBe(100)
    expect(soa.length).toBe(0)
    const { foo, bar } = soa.arrays
    expect(foo).toBeInstanceOf(Float32Array)
    expect(foo.length).toBe(1)
    expect(bar).toBeInstanceOf(Float64Array)
    expect(bar.length).toBe(1)
  })

  test('ensure', () => {
    const soa = new StructureOfResizableArrays({
      structure: {
        foo: Float32Array
      , bar: Float64Array
      }
    , maxCapacity: 100
    , initialCapacity: 1
    , growthFactor: 2
    })
    const { foo, bar } = soa.arrays

    soa.ensure(99)

    expect(soa.length).toBe(100)
    expect(foo).toBe(soa.arrays.foo)
    expect(bar).toBe(soa.arrays.bar)
    expect(foo.length).toBe(100)
    expect(bar.length).toBe(100)
  })
})
