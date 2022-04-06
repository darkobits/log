import * as dateFns from 'date-fns';

import SpinnerFactory, {Spinner} from './spinner';


describe('Spinner', () => {
  let nowSpy: jest.SpyInstance<number, []>;
  let NOW = 0;

  beforeEach(() => {
    nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => NOW);
  });

  afterEach(() => {
    nowSpy.mockRestore();
  });

  describe('validating options', () => {
    describe('when provided an invalid name', () => {
      it('should throw an error', () => {
        expect(() => {
          // @ts-ignore
          SpinnerFactory({name: 'bad-spinner'});
        }).toThrow();
      });
    });
  });

  describe('rendering spinners', () => {
    let spinner: Spinner;

    beforeEach(() => {
      spinner = SpinnerFactory({name: 'dots'});
    });

    it('should render the named spinner', () => {
      expect(`${spinner}`).toBe('⠋');

      NOW = dateFns.addMilliseconds(NOW, 80).valueOf();
      expect(`${spinner}`).toBe('⠙');

      NOW = dateFns.addMilliseconds(NOW, 80).valueOf();
      expect(`${spinner}`).toBe('⠹');

      NOW = dateFns.addMilliseconds(NOW, 80).valueOf();
      expect(`${spinner}`).toBe('⠸');

      NOW = dateFns.addMilliseconds(NOW, 80).valueOf();
      expect(`${spinner}`).toBe('⠼');

      NOW = dateFns.addMilliseconds(NOW, 80).valueOf();
      expect(`${spinner}`).toBe('⠴');

      NOW = dateFns.addMilliseconds(NOW, 80).valueOf();
      expect(`${spinner}`).toBe('⠦');

      NOW = dateFns.addMilliseconds(NOW, 80).valueOf();
      expect(`${spinner}`).toBe('⠧');

      NOW = dateFns.addMilliseconds(NOW, 80).valueOf();
      expect(`${spinner}`).toBe('⠇');

      NOW = dateFns.addMilliseconds(NOW, 80).valueOf();
      expect(`${spinner}`).toBe('⠏');

      NOW = dateFns.addMilliseconds(NOW, 80).valueOf();
      expect(`${spinner}`).toBe('⠋');
    });
  });
});
