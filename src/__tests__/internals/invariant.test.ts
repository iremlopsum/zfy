import invariant, { InvariantError } from '../../internals/invariant'

describe('🛡️ Internals > invariant:', () => {
  describe('InvariantError', () => {
    it('creates an error with default message', () => {
      const error = new InvariantError()
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(InvariantError)
      expect(error.name).toBe('Invariant Violation')
      expect(error.message).toBe('Invariant Violation')
      expect(error.framesToPop).toBe(1)
    })

    it('creates an error with custom string message', () => {
      const customMessage = 'Custom error message'
      const error = new InvariantError(customMessage)
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(InvariantError)
      expect(error.name).toBe('Invariant Violation')
      expect(error.message).toBe(customMessage)
    })

    it('creates an error with number message', () => {
      const error = new InvariantError(42)
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(InvariantError)
      expect(error.message).toBe(
        'Invariant Violation: 42 (see https://github.com/apollographql/invariant-packages)'
      )
    })

    it('has correct prototype chain', () => {
      const error = new InvariantError('test')
      expect(Object.getPrototypeOf(error)).toBe(InvariantError.prototype)
    })

    it('is catchable as Error', () => {
      expect(() => {
        throw new InvariantError('test')
      }).toThrow(Error)
    })

    it('is catchable as InvariantError', () => {
      expect(() => {
        throw new InvariantError('test')
      }).toThrow(InvariantError)
    })
  })

  describe('invariant function', () => {
    describe('when condition is truthy', () => {
      it('does not throw for true', () => {
        expect(() => invariant(true)).not.toThrow()
      })

      it('does not throw for truthy values', () => {
        expect(() => invariant(1)).not.toThrow()
        expect(() => invariant('string')).not.toThrow()
        expect(() => invariant({})).not.toThrow()
        expect(() => invariant([])).not.toThrow()
        expect(() => invariant(() => {})).not.toThrow()
      })

      it('does not throw with message parameter', () => {
        expect(() => invariant(true, 'Should not throw')).not.toThrow()
      })
    })

    describe('when condition is falsy', () => {
      it('throws InvariantError for false', () => {
        expect(() => invariant(false)).toThrow(InvariantError)
      })

      it('throws InvariantError for falsy values', () => {
        expect(() => invariant(0)).toThrow(InvariantError)
        expect(() => invariant('')).toThrow(InvariantError)
        expect(() => invariant(null)).toThrow(InvariantError)
        expect(() => invariant(undefined)).toThrow(InvariantError)
        expect(() => invariant(NaN)).toThrow(InvariantError)
      })

      it('throws with default message when no message provided', () => {
        expect(() => invariant(false)).toThrow('Invariant Violation')
      })

      it('throws with custom string message', () => {
        const customMessage = 'Custom invariant violation'
        expect(() => invariant(false, customMessage)).toThrow(customMessage)
        expect(() => invariant(false, customMessage)).toThrow(InvariantError)
      })

      it('throws with number message', () => {
        expect(() => invariant(false, 42)).toThrow(
          'Invariant Violation: 42 (see https://github.com/apollographql/invariant-packages)'
        )
      })
    })

    describe('integration scenarios', () => {
      it('works with logical expressions', () => {
        const value = 'test'
        expect(() => invariant(value && value.length > 0)).not.toThrow()
        expect(() => invariant(value && value.length > 10)).toThrow(
          InvariantError
        )
      })

      it('works with type checks', () => {
        const value = 'string'
        expect(() =>
          invariant(typeof value === 'string', 'Must be a string')
        ).not.toThrow()
        expect(() =>
          invariant(typeof value === 'number', 'Must be a number')
        ).toThrow('Must be a number')
      })

      it('works with array checks', () => {
        const arr: any = [1, 2, 3]
        expect(() =>
          invariant(
            Array.isArray(arr) && arr.length > 0,
            'Must be non-empty array'
          )
        ).not.toThrow()

        const emptyArr: any[] = []
        expect(() =>
          invariant(
            Array.isArray(emptyArr) && emptyArr.length > 0,
            'Must be non-empty array'
          )
        ).toThrow('Must be non-empty array')
      })

      it('works with object checks', () => {
        const obj: any = { key: 'value' }
        expect(() =>
          invariant(
            obj && typeof obj === 'object' && 'key' in obj,
            'Must have key property'
          )
        ).not.toThrow()

        const invalidObj: any = {}
        expect(() =>
          invariant(
            invalidObj && typeof invalidObj === 'object' && 'key' in invalidObj,
            'Must have key property'
          )
        ).toThrow('Must have key property')
      })

      it('can be used for early returns in functions', () => {
        const validateInput = (input: any) => {
          invariant(input !== null && input !== undefined, 'Input is required')
          invariant(typeof input === 'string', 'Input must be a string')
          return input.toUpperCase()
        }

        expect(validateInput('test')).toBe('TEST')
        expect(() => validateInput(null)).toThrow('Input is required')
        expect(() => validateInput(123)).toThrow('Input must be a string')
      })
    })

    describe('error handling', () => {
      it('can be caught and handled', () => {
        try {
          invariant(false, 'Test error')
          fail('Should have thrown')
        } catch (error) {
          expect(error).toBeInstanceOf(InvariantError)
          expect((error as InvariantError).message).toBe('Test error')
        }
      })

      it('preserves stack trace', () => {
        try {
          invariant(false, 'Stack trace test')
        } catch (error) {
          expect(error).toHaveProperty('stack')
          expect((error as Error).stack).toContain('invariant.test.ts')
        }
      })
    })
  })
})
