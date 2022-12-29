import { go } from '@blackglory/go'
import { StructureOfArrays, StructureOfSparseMaps, uint16, uint32 } from '..'
import { Benchmark } from 'extra-benchmark'

const benchmark = new Benchmark('SoA', {
  warms: 1000
, runs: 1000
})

go(async () => {
  benchmark.addCase('StructureOfArrays#has', () => {
    const soa = new StructureOfArrays({
      foo: uint16
    , bar: uint32
    })
    for (let i = 0; i < 10000; i += 2) {
      soa.upsert(i, {
        foo: i
      , bar: i
      })
    }

    return () => {
      for (let i = 0; i < 10000; i++) {
        soa.has(i)
      }
    }
  })

  benchmark.addCase('StructureOfSparseMaps#has', () => {
    const soa = new StructureOfSparseMaps({
      foo: uint16
    , bar: uint32
    })
    for (let i = 0; i < 10000; i += 2) {
      soa.upsert(i, {
        foo: i
      , bar: i
      })
    }

    return () => {
      for (let i = 0; i < 10000; i++) {
        soa.has(i)
      }
    }
  })

  benchmark.addCase('StructureOfArrays#get', () => {
    const soa = new StructureOfArrays({
      foo: uint16
    , bar: uint32
    })
    for (let i = 0; i < 10000; i++) {
      soa.upsert(i, {
        foo: i
      , bar: i
      })
    }

    return () => {
      for (let i = 0; i < 10000; i++) {
        soa.get(i, 'foo')
        soa.get(i, 'bar')
      }
    }
  })

  benchmark.addCase('StructureOfSparseMap#get', () => {
    const soa = new StructureOfSparseMaps({
      foo: uint16
    , bar: uint32
    })
    for (let i = 0; i < 10000; i++) {
      soa.upsert(i, {
        foo: i
      , bar: i
      })
    }

    return () => {
      for (let i = 0; i < 10000; i++) {
        soa.get(i, 'foo')
        soa.get(i, 'bar')
      }
    }
  })

  benchmark.addCase('StructureOfArrays#add', () => {
    const soa = new StructureOfArrays({
      foo: uint16
    , bar: uint32
    })

    return {
      beforeEach() {
        soa.clear()

        for (let i = 0; i < 10000; i += 2) {
          soa.upsert(i, {
            foo: i
          , bar: i
          })
        }
      }
    , iterate() {
        for (let i = 0; i < 10000; i++) {
          soa.add({
            foo: i
          , bar: i
          })
        }
      }
    }
  })

  benchmark.addCase('StructureOfSparseMaps#add', () => {
    const soa = new StructureOfSparseMaps({
      foo: uint16
    , bar: uint32
    })

    return {
      beforeEach() {
        soa.clear()

        for (let i = 0; i < 10000; i += 2) {
          soa.upsert(i, {
            foo: i
          , bar: i
          })
        }
      }
    , iterate() {
        for (let i = 0; i < 10000; i++) {
          soa.add({
            foo: i
          , bar: i
          })
        }
      }
    }
  })

  benchmark.addCase('StructureOfArrays#upsert', () => {
    const soa = new StructureOfArrays({
      foo: uint16
    , bar: uint32
    })

    return {
      beforeEach() {
        soa.clear()

        for (let i = 0; i < 10000; i += 2) {
          soa.upsert(i, {
            foo: i
          , bar: i
          })
        }
      }
    , iterate() {
        for (let i = 0; i < 10000; i++) {
          soa.upsert(i, {
            foo: i
          , bar: i
          })
        }
      }
    }
  })

  benchmark.addCase('StructureOfSparseMaps#upsert', () => {
    const soa = new StructureOfSparseMaps({
      foo: uint16
    , bar: uint32
    })

    return {
      beforeEach() {
        soa.clear()

        for (let i = 0; i < 10000; i += 2) {
          soa.upsert(i, {
            foo: i
          , bar: i
          })
        }
      }
    , iterate() {
        for (let i = 0; i < 10000; i++) {
          soa.upsert(i, {
            foo: i
          , bar: i
          })
        }
      }
    }
  })

  benchmark.addCase('StructureOfArrays#update', () => {
    const soa = new StructureOfArrays({
      foo: uint16
    , bar: uint32
    })

    return {
      beforeEach() {
        soa.clear()

        for (let i = 0; i < 10000; i++) {
          soa.upsert(i, {
            foo: i
          , bar: i
          })
        }
      }
    , iterate() {
        for (let i = 0; i < 10000; i++) {
          soa.update(i, 'foo', i)
          soa.update(i, 'bar', i)
        }
      }
    }
  })

  benchmark.addCase('StructureOfSparseMaps#update', () => {
    const soa = new StructureOfSparseMaps({
      foo: uint16
    , bar: uint32
    })

    return {
      beforeEach() {
        soa.clear()

        for (let i = 0; i < 10000; i++) {
          soa.upsert(i, {
            foo: i
          , bar: i
          })
        }
      }
    , iterate() {
        for (let i = 0; i < 10000; i++) {
          soa.update(i, 'foo', i)
          soa.update(i, 'bar', i)
        }
      }
    }
  })

  benchmark.addCase('StructureOfArrays#delete', () => {
    const soa = new StructureOfArrays({
      foo: uint16
    , bar: uint32
    })

    return {
      beforeEach() {
        soa.clear()

        for (let i = 0; i < 10000; i += 2) {
          soa.upsert(i, {
            foo: i
          , bar: i
          })
        }
      }
    , iterate() {
        for (let i = 0; i < 10000; i++) {
          soa.delete(i)
        }
      }
    }
  })

  benchmark.addCase('StructureOfSparseMaps#delete', () => {
    const soa = new StructureOfSparseMaps({
      foo: uint16
    , bar: uint32
    })

    return {
      beforeEach() {
        soa.clear()

        for (let i = 0; i < 10000; i += 2) {
          soa.upsert(i, {
            foo: i
          , bar: i
          })
        }
      }
    , iterate() {
        for (let i = 0; i < 10000; i++) {
          soa.delete(i)
        }
      }
    }
  })

  console.log(`Benchmark: ${benchmark.name}`)
  for await (const result of benchmark.run()) {
    console.log(result)
  }
})
