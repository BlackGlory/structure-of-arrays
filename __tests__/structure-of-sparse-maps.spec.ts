import { describe, test, expect } from 'vitest'
import { StructureOfSparseMaps } from '@src/structure-of-sparse-maps.js'

describe('StructureOfSparseMaps', () => {
  test('constructor', () => {
    const soa = new StructureOfSparseMaps({
      structure: {
        foo: Float32Array
      , bar: Float64Array
      }
    , keys: Uint8Array
    , capacity: 100
    })

    expect(soa.capacity).toBe(100)
    expect(soa.length).toBe(0)
    const { foo, bar } = soa.arrays
    expect(foo).toBeInstanceOf(Float32Array)
    expect(foo.length).toBe(100)
    expect(bar).toBeInstanceOf(Float64Array)
    expect(bar.length).toBe(100)
  })

  test('register', () => {
    const soa = new StructureOfSparseMaps({
      structure: {
        foo: Float32Array
      , bar: Float64Array
      }
    , keys: Uint8Array
    , capacity: 100
    })
    const key = 128

    soa.register(key)

    expect(soa.capacity).toBe(100)
    expect(soa.length).toBe(1)
    expect(soa.getIndexByKey(key)).toBe(0)
  })

  test('unregister', () => {
    const soa = new StructureOfSparseMaps({
      structure: {
        foo: Float32Array
      , bar: Float64Array
      }
    , keys: Uint8Array
    , capacity: 100
    })
    const key = 128
    soa.register(key)

    soa.unregister(key)

    expect(soa.capacity).toBe(100)
    expect(soa.length).toBe(0)
    expect(soa.getIndexByKey(key)).toBeUndefined()
  })

  describe('getIndexByKey', () => {
    test('key exists', () => {
      const soa = new StructureOfSparseMaps({
        structure: {
          foo: Float32Array
        , bar: Float64Array
        }
      , keys: Uint8Array
      , capacity: 100
      })
      const key = 128
      soa.register(key)

      const index = soa.getIndexByKey(key)

      expect(index).toBe(0)
    })

    test('key does not exist', () => {
      const soa = new StructureOfSparseMaps({
        structure: {
          foo: Float32Array
        , bar: Float64Array
        }
      , keys: Uint8Array
      , capacity: 100
      })
      const key = 128

      const index = soa.getIndexByKey(key)

      expect(index).toBeUndefined()
    })
  })
})
