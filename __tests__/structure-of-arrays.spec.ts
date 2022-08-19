import { StructureOfArrays } from '@src/structure-of-arrays'
import { int8, string, boolean } from '@src/types'
import { toArray } from 'iterable-operator'
import { getError } from 'return-style'
import '@blackglory/jest-matchers'

describe('StructureOfArrays', () => {
  describe('create', () => {
    test('non-empty structure', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })

      expect(soa).toBeInstanceOf(StructureOfArrays)
    })

    test('empty structure', () => {
      const soa = new StructureOfArrays({})

      expect(soa).toBeInstanceOf(StructureOfArrays)
    })
  })

  describe('arrays', () => {
    test('types', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })

      expect(soa.arrays.integer).toBeInstanceOf(Int8Array)
      expect(soa.arrays.boolean).toBeInstanceOf(Array)
      expect(soa.arrays.string).toBeInstanceOf(Array)
    })

    test('write', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })
      soa.add({
        integer: 0
      , boolean: false
      , string: ''
      })

      soa.arrays.integer[0] = 1
      soa.arrays.boolean[0] = true
      soa.arrays.string[0] = 'string'

      expect(soa.get(0, 'integer')).toBe(1)
      expect(soa.get(0, 'boolean')).toBe(true)
      expect(soa.get(0, 'string')).toBe('string')
    })

    test('read', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })
      const { arrays } = soa
      soa.add({
        integer: 1
      , boolean: true
      , string: 'string'
      })

      expect(arrays.integer[0]).toBe(1)
      expect(arrays.boolean[0]).toBe(true)
      expect(arrays.string[0]).toBe('string')
    })
  })

  describe('indexes', () => {
    describe('SOA is empty', () => {
      test('non-empty structure', () => {
        const soa = new StructureOfArrays({
          integer: int8
        , boolean: boolean
        , string: string
        })

        const iter = soa.indexes()
        const arr = toArray(iter)

        expect(iter).toBeIterable()
        expect(arr).toStrictEqual([])
      })

      test('empty structure', () => {
        const soa = new StructureOfArrays({})

        const iter = soa.indexes()
        const arr = toArray(iter)

        expect(iter).toBeIterable()
        expect(arr).toStrictEqual([])
      })
    })

    describe('SOA has deleted items', () => {
      test('non-empty structure', () => {
        const soa = new StructureOfArrays({
          integer: int8
        , boolean: boolean
        , string: string
        })
        soa.add(
          {
            integer: 0
          , boolean: false
          , string: ''
          }
        , {
            integer: 1
          , boolean: true
          , string: 'string'
          }
        )
        soa.delete(0)

        const iter = soa.indexes()
        const arr = toArray(iter)

        expect(iter).toBeIterable()
        expect(arr).toStrictEqual([1])
      })

      test('empty structure', () => {
        const soa = new StructureOfArrays({})
        soa.add({}, {})
        soa.delete(0)

        const iter = soa.indexes()
        const arr = toArray(iter)

        expect(iter).toBeIterable()
        expect(arr).toStrictEqual([1])
      })
    })

    describe('SOA is non-empty', () => {
      test('non-empty structure', () => {
        const soa = new StructureOfArrays({
          integer: int8
        , boolean: boolean
        , string: string
        })
        soa.add(
          {
            integer: 0
          , boolean: false
          , string: ''
          }
        , {
            integer: 1
          , boolean: true
          , string: 'string'
          }
        )

        const iter = soa.indexes()
        const arr = toArray(iter)

        expect(iter).toBeIterable()
        expect(arr).toStrictEqual([0, 1])
      })

      test('empty structure', () => {
        const soa = new StructureOfArrays({})
        soa.add({}, {})

        const iter = soa.indexes()
        const arr = toArray(iter)

        expect(iter).toBeIterable()
        expect(arr).toStrictEqual([0, 1])
      })
    })
  })

  describe('has', () => {
    describe('index exists', () => {
      test('non-empty structure', () => {
        const soa = new StructureOfArrays({
          integer: int8
        , boolean: boolean
        , string: string
        })
        soa.add({
          integer: 1
        , boolean: true
        , string: 'string'
        })

        const result = soa.has(0)

        expect(result).toBe(true)
      })

      test('empty structure', () => {
        const soa = new StructureOfArrays({})
        soa.add({})

        const result = soa.has(0)

        expect(result).toBe(true)
      })
    })

    describe('index does not exist', () => {
      describe('index has been deleted', () => {
        test('non-empty structure', () => {
          const soa = new StructureOfArrays({
            integer: int8
          , boolean: boolean
          , string: string
          })
          soa.add({
            integer: 1
          , boolean: true
          , string: 'string'
          })
          soa.delete(0)

          const result = soa.has(0)

          expect(result).toBe(false)
        })

        test('empty structure', () => {
          const soa = new StructureOfArrays({})
          soa.add({})
          soa.delete(0)

          const result = soa.has(0)

          expect(result).toBe(false)
        })
      })

      describe('index is out of bounds', () => {
        test('non-empty structure', () => {
          const soa = new StructureOfArrays({
            integer: int8
          , boolean: boolean
          , string: string
          })

          const result = soa.has(0)

          expect(result).toBe(false)
        })

        test('empty structure', () => {
          const soa = new StructureOfArrays({})

          const result = soa.has(0)

          expect(result).toBe(false)
        })
      })
    })
  })

  describe('get', () => {
    test('index exists', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })
      soa.add({
        integer: 1
      , boolean: true
      , string: 'string'
      })

      const result1 = soa.get(0, 'integer')
      const result2 = soa.get(0, 'boolean')
      const result3 = soa.get(0, 'string')

      expect(result1).toBe(1)
      expect(result2).toBe(true)
      expect(result3).toBe('string')
    })

    test('index does not exist', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })

      const err1 = getError(() => soa.get(0, 'integer'))
      const err2 = getError(() => soa.get(0, 'boolean'))
      const err3 = getError(() => soa.get(0, 'string'))

      expect(err1).toBeInstanceOf(RangeError)
      expect(err2).toBeInstanceOf(RangeError)
      expect(err3).toBeInstanceOf(RangeError)
    })
  })

  describe('tryGet', () => {
    test('index exists', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })
      soa.add({
        integer: 1
      , boolean: true
      , string: 'string'
      })

      const result1 = soa.tryGet(0, 'integer')
      const result2 = soa.tryGet(0, 'boolean')
      const result3 = soa.tryGet(0, 'string')

      expect(result1).toBe(1)
      expect(result2).toBe(true)
      expect(result3).toBe('string')
    })

    test('index does not exist', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })

      const result1 = soa.tryGet(0, 'integer')
      const result2 = soa.tryGet(0, 'boolean')
      const result3 = soa.tryGet(0, 'string')

      expect(result1).toBe(undefined)
      expect(result2).toBe(undefined)
      expect(result3).toBe(undefined)
    })
  })

  describe('add', () => {
    describe('SOA is empty', () => {
      test('non-empty structure', () => {
        const soa = new StructureOfArrays({
          integer: int8
        , boolean: boolean
        , string: string
        })

        const result = soa.add(
          {
            integer: 0
          , boolean: false
          , string: ''
          }
        , {
            integer: 1
          , boolean: true
          , string: 'string'
          }
        )

        expect(result).toStrictEqual([0, 1])
        expect(soa.get(0, 'integer')).toBe(0)
        expect(soa.get(0, 'boolean')).toBe(false)
        expect(soa.get(0, 'string')).toBe('')
        expect(soa.get(1, 'integer')).toBe(1)
        expect(soa.get(1, 'boolean')).toBe(true)
        expect(soa.get(1, 'string')).toBe('string')
      })

      test('empty structure', () => {
        const soa = new StructureOfArrays({})

        const result = soa.add({} , {})

        expect(result).toStrictEqual([0, 1])
        expect(soa.has(0)).toBe(true)
        expect(soa.has(1)).toBe(true)
      })
    })

    describe('SOA has deleted items', () => {
      test('non-empty structure', () => {
        const soa = new StructureOfArrays({
          integer: int8
        , boolean: boolean
        , string: string
        })
        soa.add(
          {
            integer: 0
          , boolean: false
          , string: ''
          }
        , {
            integer: 1
          , boolean: true
          , string: 'string'
          }
        )
        soa.delete(0)

        const result = soa.add(
          {
            integer: 2
          , boolean: true
          , string: 'string'
          }
        , {
            integer: 3
          , boolean: true
          , string: 'string'
          }
        )

        expect(result).toStrictEqual([0, 2])
        expect(soa.get(0, 'integer')).toBe(2)
        expect(soa.get(0, 'boolean')).toBe(true)
        expect(soa.get(0, 'string')).toBe('string')
        expect(soa.get(1, 'integer')).toBe(1)
        expect(soa.get(1, 'boolean')).toBe(true)
        expect(soa.get(1, 'string')).toBe('string')
        expect(soa.get(2, 'integer')).toBe(3)
        expect(soa.get(2, 'boolean')).toBe(true)
        expect(soa.get(2, 'string')).toBe('string')
      })

      test('empty structure', () => {
        const soa = new StructureOfArrays({})
        soa.add({}, {})
        soa.delete(0)

        const result = soa.add({}, {})

        expect(result).toStrictEqual([0, 2])
        expect(soa.has(0)).toBe(true)
        expect(soa.has(1)).toBe(true)
        expect(soa.has(2)).toBe(true)
      })
    })
  })

  describe('set', () => {
    test('index exists', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })
      soa.add({
        integer: 0
      , boolean: false
      , string: ''
      })

      soa.set(0, 'integer', 1)
      soa.set(0, 'boolean', true)
      soa.set(0, 'string', 'string')

      expect(soa.get(0, 'integer')).toBe(1)
      expect(soa.get(0, 'boolean')).toBe(true)
      expect(soa.get(0, 'string')).toBe('string')
    })

    test('index does not exist', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })

      const result1 = getError(() => soa.set(0, 'integer', 1))
      const result2 = getError(() => soa.set(0, 'boolean', true))
      const result3 = getError(() => soa.set(0, 'string', 'string'))

      expect(toArray(soa.indexes())).toStrictEqual([])
      expect(result1).toBeInstanceOf(RangeError)
      expect(result2).toBeInstanceOf(RangeError)
      expect(result3).toBeInstanceOf(RangeError)
      expect(soa.has(0)).toBe(false)
    })
  })

  describe('trySet', () => {
    test('index exists', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })
      soa.add({
        integer: 0
      , boolean: false
      , string: ''
      })

      const result1 = soa.trySet(0, 'integer', 1)
      const result2 = soa.trySet(0, 'boolean', true)
      const result3 = soa.trySet(0, 'string', 'string')

      expect(result1).toBe(true)
      expect(result2).toBe(true)
      expect(result3).toBe(true)
      expect(soa.get(0, 'integer')).toBe(1)
      expect(soa.get(0, 'boolean')).toBe(true)
      expect(soa.get(0, 'string')).toBe('string')
    })

    test('index does not exist', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })

      const result1 = soa.trySet(0, 'integer', 1)
      const result2 = soa.trySet(0, 'boolean', true)
      const result3 = soa.trySet(0, 'string', 'string')

      expect(toArray(soa.indexes())).toStrictEqual([])
      expect(result1).toBe(false)
      expect(result2).toBe(false)
      expect(result3).toBe(false)
      expect(soa.has(0)).toBe(false)
    })
  })

  describe('delete', () => {
    describe('index exists', () => {
      test('non-empty structure', () => {
        const soa = new StructureOfArrays({
          integer: int8
        , boolean: boolean
        , string: string
        })
        soa.add({
          integer: 0
        , boolean: false
        , string: ''
        })

        soa.delete(0)

        expect(toArray(soa.indexes())).toStrictEqual([])
        expect(soa.has(0)).toBe(false)
      })

      test('empty structure', () => {
        const soa = new StructureOfArrays({})
        soa.add({})

        soa.delete(0)

        expect(toArray(soa.indexes())).toStrictEqual([])
        expect(soa.has(0)).toBe(false)
      })
    })

    describe('index does not exist', () => {
      test('non-empty structure', () => {
        const soa = new StructureOfArrays({
          integer: int8
        , boolean: boolean
        , string: string
        })

        soa.delete(0)

        expect(toArray(soa.indexes())).toStrictEqual([])
        expect(soa.has(0)).toBe(false)
      })

      test('empty structure', () => {
        const soa = new StructureOfArrays({})

        soa.delete(0)

        expect(toArray(soa.indexes())).toStrictEqual([])
        expect(soa.has(0)).toBe(false)
      })
    })
  })
})
