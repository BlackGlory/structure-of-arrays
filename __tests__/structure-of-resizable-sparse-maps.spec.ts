import { describe, test, expect } from 'vitest'
import { StructureOfResizableSparseMaps } from '@src/structure-of-resizable-sparse-maps.js'

describe('StructureOfResizableSparseMaps', () => {
  test('constructor', () => {
    const soa = new StructureOfResizableSparseMaps({
      structure: {
        foo: Float32Array
      , bar: Float64Array
      }
    , keys: Uint8Array
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

  test('register', () => {
    const soa = new StructureOfResizableSparseMaps({
      structure: {
        foo: Float32Array
      , bar: Float64Array
      }
    , keys: Uint8Array
    , maxCapacity: 100
    , initialCapacity: 1
    , growthFactor: 3
    })
    const { foo, bar } = soa.arrays
    const key1 = 128
    const key2 = 129

    soa.register(key1)
    soa.register(key2)

    expect(soa.maxCapacity).toBe(100)
    expect(soa.length).toBe(2)
    expect(soa.getIndexByKey(key1)).toBe(0)
    expect(soa.getIndexByKey(key2)).toBe(1)
    expect(foo).toBe(soa.arrays.foo)
    expect(bar).toBe(soa.arrays.bar)
    expect(foo.length).toBe(3)
    expect(foo.length).toBe(3)
  })

  test('unregister', () => {
    const soa = new StructureOfResizableSparseMaps({
      structure: {
        foo: Float32Array
      , bar: Float64Array
      }
    , keys: Uint8Array
    , maxCapacity: 100
    })
    const key = 128
    soa.register(key)

    soa.unregister(key)

    expect(soa.maxCapacity).toBe(100)
    expect(soa.length).toBe(0)
    expect(soa.getIndexByKey(key)).toBeUndefined()
  })

  describe('getIndexByKey', () => {
    test('key exists', () => {
      const soa = new StructureOfResizableSparseMaps({
        structure: {
          foo: Float32Array
        , bar: Float64Array
        }
      , keys: Uint8Array
      , maxCapacity: 100
      })
      const key = 128
      soa.register(key)

      const index = soa.getIndexByKey(key)

      expect(index).toBe(0)
    })

    test('key does not exist', () => {
      const soa = new StructureOfResizableSparseMaps({
        structure: {
          foo: Float32Array
        , bar: Float64Array
        }
      , keys: Uint8Array
      , maxCapacity: 100
      })
      const key = 128

      const index = soa.getIndexByKey(key)

      expect(index).toBeUndefined()
    })
  })
})
