import * as dateFns from 'date-fns';
import TimerFactory, {Timer} from './timer';


describe('Timer', () => {
  let nowSpy: jest.SpyInstance<number, []>;
  let NOW = 0;

  beforeEach(() => {
    nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => NOW);
  });

  afterEach(() => {
    nowSpy.mockRestore();
  });

  describe('rendering a timer', () => {
    let timer: Timer;

    beforeEach(() => {
      timer = TimerFactory({});
    });

    it('should render the time elapsed', () => {
      expect(`${timer}`).toBe('0ms');

      NOW = dateFns.addSeconds(NOW, 2).valueOf();
      expect(`${timer}`).toBe('2s');

      NOW = dateFns.addMinutes(NOW, 2).valueOf();
      expect(`${timer}`).toBe('2m 2s');

      NOW = dateFns.addHours(NOW, 5).valueOf();
      expect(`${timer}`).toBe('5h 2m 2s');

      NOW = dateFns.addDays(NOW, 1).valueOf();
      expect(`${timer}`).toBe('1d 5h 2m 2s');
    });
  });

  describe('rendering a timer with options', () => {
    let timer: Timer;

    beforeEach(() => {
      timer = TimerFactory({
        compact: true
      });
    });

    it('should render the time elapsed', () => {
      expect(`${timer}`).toBe('0ms');

      NOW = dateFns.addSeconds(NOW, 2).valueOf();
      expect(`${timer}`).toBe('~2s');

      NOW = dateFns.addMinutes(NOW, 2).valueOf();
      expect(`${timer}`).toBe('~2m');

      NOW = dateFns.addHours(NOW, 5).valueOf();
      expect(`${timer}`).toBe('~5h');

      NOW = dateFns.addDays(NOW, 1).valueOf();
      expect(`${timer}`).toBe('~1d');
    });
  });

  describe('#reset', () => {
    let timer: Timer;

    beforeEach(() => {
      timer = TimerFactory();
    });

    it('should render the time elapsed', () => {
      expect(`${timer}`).toBe('0ms');

      NOW = dateFns.addSeconds(NOW, 2).valueOf();
      expect(`${timer}`).toBe('2s');

      NOW = dateFns.addMinutes(NOW, 2).valueOf();
      expect(`${timer}`).toBe('2m 2s');

      timer.reset();

      expect(`${timer}`).toBe('0ms');

      NOW = dateFns.addMinutes(NOW, 1).valueOf();
      expect(`${timer}`).toBe('1m');
    });
  });
});
