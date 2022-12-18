import { StructureOfArrays } from '@src/structure-of-arrays/structure-of-arrays'
import { int8, string, boolean } from '@src/types'
import { toArray } from 'iterable-operator'
import { getError } from 'return-style'

describe('StructureOfArrays', () => {
  describe('create', () => {
    test('non-empty structure', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })

      expect(soa).toBeInstanceOf(StructureOfArrays)
      expect(soa.length).toBe(0)
      expect(soa.size).toBe(0)
    })

    test('empty structure', () => {
      const err = getError(() => new StructureOfArrays({}))

      expect(err).toBeInstanceOf(Error)
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

  test('keys', () => {
    const soa = new StructureOfArrays({
      integer: int8
    , boolean: boolean
    , string: string
    })

    const result = soa.keys

    expect(result).toStrictEqual(['integer', 'boolean', 'string'])
  })

  describe('indexes', () => {
    test('SoA is empty', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })

      const iter = soa.indexes()
      const result = toArray(iter)

      expect(result).toStrictEqual([])
    })

    test('SoA has deleted items', () => {
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
      const result = toArray(iter)

      expect(result).toStrictEqual([1])
    })

    test('SoA is non-empty', () => {
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
      const result = toArray(iter)

      expect(result).toStrictEqual([0, 1])
    })
  })

  describe('has', () => {
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

      const result = soa.has(0)

      expect(result).toBe(true)
    })

    describe('index does not exist', () => {
      test('index has been deleted', () => {
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

      test('index is out of bounds', () => {
        const soa = new StructureOfArrays({
          integer: int8
        , boolean: boolean
        , string: string
        })

        const result = soa.has(0)

        expect(result).toBe(false)
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

  describe('upsert', () => {
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

      soa.upsert(0, {
        integer: 1
      , boolean: true
      , string: 'string'
      })

      expect(soa.length).toBe(1)
      expect(soa.size).toBe(1)
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

      soa.upsert(1, {
        integer: 1
      , boolean: true
      , string: 'string'
      })

      expect(soa.length).toBe(2)
      expect(soa.size).toBe(1)
      expect(soa.has(0)).toBe(false)
      expect(soa.get(1, 'integer')).toBe(1)
      expect(soa.get(1, 'boolean')).toBe(true)
      expect(soa.get(1, 'string')).toBe('string')
    })
  })

  describe('addWithDefaultValues', () => {
    test('SoA is empty', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })

      const result = soa.addWithDefaultValues(2)

      expect(result).toStrictEqual([0, 1])
      expect(soa.length).toBe(2)
      expect(soa.size).toBe(2)
      expect(soa.get(0, 'integer')).toBe(0)
      expect(soa.get(0, 'boolean')).toBe(false)
      expect(soa.get(0, 'string')).toBe('')
      expect(soa.get(1, 'integer')).toBe(0)
      expect(soa.get(1, 'boolean')).toBe(false)
      expect(soa.get(1, 'string')).toBe('')
    })

    test('SoA has deleted items', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })
      soa.add(
        {
          integer: 0
        , boolean: true
        , string: 'string'
        }
      , {
          integer: 1
        , boolean: true
        , string: 'string'
        }
      )
      soa.delete(0)

      const result = soa.addWithDefaultValues(2)

      expect(result).toStrictEqual([0, 2])
      expect(soa.length).toBe(3)
      expect(soa.size).toBe(3)
      expect(soa.get(0, 'integer')).toBe(0)
      expect(soa.get(0, 'boolean')).toBe(false)
      expect(soa.get(0, 'string')).toBe('')
      expect(soa.get(1, 'integer')).toBe(1)
      expect(soa.get(1, 'boolean')).toBe(true)
      expect(soa.get(1, 'string')).toBe('string')
      expect(soa.get(2, 'integer')).toBe(0)
      expect(soa.get(2, 'boolean')).toBe(false)
      expect(soa.get(2, 'string')).toBe('')
    })
  })

  describe('add', () => {
    test('SoA is empty', () => {
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
      expect(soa.length).toBe(2)
      expect(soa.size).toBe(2)
      expect(soa.get(0, 'integer')).toBe(0)
      expect(soa.get(0, 'boolean')).toBe(false)
      expect(soa.get(0, 'string')).toBe('')
      expect(soa.get(1, 'integer')).toBe(1)
      expect(soa.get(1, 'boolean')).toBe(true)
      expect(soa.get(1, 'string')).toBe('string')
    })

    test('SoA has deleted items', () => {
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
      expect(soa.length).toBe(3)
      expect(soa.size).toBe(3)
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
  })

  describe('pushWithDefaultValues', () => {
    test('SoA is empty', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })

      const result = soa.pushWithDefaultValues(2)

      expect(result).toStrictEqual([0, 1])
      expect(soa.length).toBe(2)
      expect(soa.size).toBe(2)
      expect(soa.get(0, 'integer')).toBe(0)
      expect(soa.get(0, 'boolean')).toBe(false)
      expect(soa.get(0, 'string')).toBe('')
      expect(soa.get(1, 'integer')).toBe(0)
      expect(soa.get(1, 'boolean')).toBe(false)
      expect(soa.get(1, 'string')).toBe('')
    })

    test('SoA has deleted items', () => {
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

      const result = soa.pushWithDefaultValues(2)

      expect(result).toStrictEqual([2, 3])
      expect(soa.length).toBe(4)
      expect(soa.size).toBe(3)
      expect(soa.has(0)).toBe(false)
      expect(soa.get(1, 'integer')).toBe(1)
      expect(soa.get(1, 'boolean')).toBe(true)
      expect(soa.get(1, 'string')).toBe('string')
      expect(soa.get(2, 'integer')).toBe(0)
      expect(soa.get(2, 'boolean')).toBe(false)
      expect(soa.get(2, 'string')).toBe('')
      expect(soa.get(3, 'integer')).toBe(0)
      expect(soa.get(3, 'boolean')).toBe(false)
      expect(soa.get(3, 'string')).toBe('')
    })
  })

  describe('push', () => {
    test('SoA is empty', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })

      const result = soa.push(
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
      expect(soa.length).toBe(2)
      expect(soa.size).toBe(2)
      expect(soa.get(0, 'integer')).toBe(0)
      expect(soa.get(0, 'boolean')).toBe(false)
      expect(soa.get(0, 'string')).toBe('')
      expect(soa.get(1, 'integer')).toBe(1)
      expect(soa.get(1, 'boolean')).toBe(true)
      expect(soa.get(1, 'string')).toBe('string')
    })

    test('SoA has deleted items', () => {
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

      const result = soa.push(
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

      expect(result).toStrictEqual([2, 3])
      expect(soa.length).toBe(4)
      expect(soa.size).toBe(3)
      expect(soa.has(0)).toBe(false)
      expect(soa.get(1, 'integer')).toBe(1)
      expect(soa.get(1, 'boolean')).toBe(true)
      expect(soa.get(1, 'string')).toBe('string')
      expect(soa.get(2, 'integer')).toBe(2)
      expect(soa.get(2, 'boolean')).toBe(true)
      expect(soa.get(2, 'string')).toBe('string')
      expect(soa.get(3, 'integer')).toBe(3)
      expect(soa.get(3, 'boolean')).toBe(true)
      expect(soa.get(3, 'string')).toBe('string')
    })
  })

  describe('update', () => {
    test('index exists', () => {
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
          integer: 0
        , boolean: false
        , string: ''
        }
      )

      soa.update(0, 'integer', 1)
      soa.update(0, 'boolean', true)
      soa.update(0, 'string', 'string')

      expect(soa.size).toBe(2)
      expect(soa.get(0, 'integer')).toBe(1)
      expect(soa.get(0, 'boolean')).toBe(true)
      expect(soa.get(0, 'string')).toBe('string')
      expect(soa.get(1, 'integer')).toBe(0)
      expect(soa.get(1, 'boolean')).toBe(false)
      expect(soa.get(1, 'string')).toBe('')
    })

    test('index does not exist', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })

      const result1 = getError(() => soa.update(0, 'integer', 1))
      const result2 = getError(() => soa.update(0, 'boolean', true))
      const result3 = getError(() => soa.update(0, 'string', 'string'))

      expect(toArray(soa.indexes())).toStrictEqual([])
      expect(result1).toBeInstanceOf(RangeError)
      expect(result2).toBeInstanceOf(RangeError)
      expect(result3).toBeInstanceOf(RangeError)
      expect(soa.has(0)).toBe(false)
    })
  })

  describe('tryUpdate', () => {
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

      const result1 = soa.tryUpdate(0, 'integer', 1)
      const result2 = soa.tryUpdate(0, 'boolean', true)
      const result3 = soa.tryUpdate(0, 'string', 'string')

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

      const result1 = soa.tryUpdate(0, 'integer', 1)
      const result2 = soa.tryUpdate(0, 'boolean', true)
      const result3 = soa.tryUpdate(0, 'string', 'string')

      expect(toArray(soa.indexes())).toStrictEqual([])
      expect(result1).toBe(false)
      expect(result2).toBe(false)
      expect(result3).toBe(false)
      expect(soa.has(0)).toBe(false)
    })
  })

  describe('pop', () => {
    describe('exists', () => {
      test('trailing elements are not removed', () => {
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

        soa.pop()

        expect(toArray(soa.indexes())).toStrictEqual([])
        expect(soa.length).toBe(0)
        expect(soa.size).toBe(0)
        expect(soa.has(0)).toBe(false)
      })

      test('trailing elements are removed', () => {
        const soa = new StructureOfArrays({
          integer: int8
        })
        soa.add({ integer: 0 })
        soa.add({ integer: 1 })
        soa.add({ integer: 2 })
        soa.delete(1) // [0, empty, 2]

        soa.pop() // [0, empty] => [0]

        expect(toArray(soa.indexes())).toStrictEqual([0])
        expect(soa.length).toBe(1)
        expect(soa.size).toBe(1)
        expect(soa.has(0)).toBe(true)
        expect(soa.has(1)).toBe(false)
        expect(soa.has(2)).toBe(false)
      })
    })

    test('does not exist', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })

      soa.pop()

      expect(toArray(soa.indexes())).toStrictEqual([])
      expect(soa.length).toBe(0)
      expect(soa.size).toBe(0)
      expect(soa.has(0)).toBe(false)
    })
  })

  describe('delete', () => {
    describe('index exists', () => {
      describe('index is the last index', () => {
        test('trailing elements are not removed', () => {
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
          expect(soa.length).toBe(0)
          expect(soa.size).toBe(0)
          expect(soa.has(0)).toBe(false)
        })

        test('trailing elements are removed', () => {
          const soa = new StructureOfArrays({
            integer: int8
          })
          soa.add(
            { integer: 0 }
          , { integer: 1 }
          , { integer: 2 }
          )
          soa.delete(1) // [0, empty, 2]

          soa.delete(2) // [0, empty, empty] => [0]

          expect(toArray(soa.indexes())).toStrictEqual([0])
          expect(soa.length).toBe(1)
          expect(soa.size).toBe(1)
          expect(soa.has(0)).toBe(true)
          expect(soa.has(1)).toBe(false)
          expect(soa.has(2)).toBe(false)
        })
      })

      test('index isnt the last index', () => {
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
        soa.add({
          integer: 1
        , boolean: true
        , string: 'string'
        })

        soa.delete(0)

        expect(toArray(soa.indexes())).toStrictEqual([1])
        expect(soa.length).toBe(2)
        expect(soa.size).toBe(1)
        expect(soa.has(0)).toBe(false)
      })
    })

    test('index does not exist', () => {
      const soa = new StructureOfArrays({
        integer: int8
      , boolean: boolean
      , string: string
      })

      soa.delete(0)

      expect(toArray(soa.indexes())).toStrictEqual([])
      expect(soa.length).toBe(0)
      expect(soa.size).toBe(0)
      expect(soa.has(0)).toBe(false)
    })
  })
})
