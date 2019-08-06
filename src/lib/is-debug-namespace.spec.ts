describe('isDebugNamespace', () => {
  let isDebugNamespace: Function;
  let DEBUG: any = '';

  beforeEach(() => {
    jest.doMock('@darkobits/env', () => {
      const envFn = (varName: string) => {
        if (varName === 'DEBUG') {
          return DEBUG;
        }
      };

      envFn.has = envFn;

      return envFn;
    });
  });

  describe('when the global wildcard was not used', () => {
    beforeEach(() => {
      DEBUG = 'one,two,three:a,three:b, four:*';
      jest.resetModuleRegistry();
      isDebugNamespace = require('./is-debug-namespace'); // tslint:disable-line no-require-imports
    });

    it('should return true if the provided value has been selected for debugging', () => {
      expect(isDebugNamespace('one')).toBe(true);
      expect(isDebugNamespace('two')).toBe(true);
      expect(isDebugNamespace('three:a')).toBe(true);
      expect(isDebugNamespace('three:b')).toBe(true);
      expect(isDebugNamespace('four:a')).toBe(true);
    });

    it('should return false if the provided value has not been selected for debugging', () => {
      expect(isDebugNamespace('three')).toBe(false);
      expect(isDebugNamespace('three:c')).toBe(false);
    });
  });

  describe('when the global wildcard was used', () => {
    beforeEach(() => {
      DEBUG = '*';
      jest.resetModuleRegistry();
      isDebugNamespace = require('./is-debug-namespace'); // tslint:disable-line no-require-imports
    });

    it('should return true', () => {
      expect(isDebugNamespace('foo')).toBe(true);
    });
  });

  describe('when no DEBUG variable was set', () => {
    beforeEach(() => {
      DEBUG = undefined;
      jest.resetModuleRegistry();
      isDebugNamespace = require('./is-debug-namespace'); // tslint:disable-line no-require-imports
    });

    it('should return true', () => {
      expect(isDebugNamespace('foo')).toBe(false);
    });
  });
});
