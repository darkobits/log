import * as dateFns from 'date-fns';
import ProgressBarFactory, {ProgressBar} from './progress-bar';


describe('ProgressBar', () => {
  let nowSpy: jest.SpyInstance<number, []>;
  let NOW = 0;

  beforeEach(() => {
    nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => NOW);
  });

  afterEach(() => {
    nowSpy.mockRestore();
  });

  describe('rendering progress bars', () => {
    let progress = -1;

    const bar = ProgressBarFactory({
      getProgress: () => progress,
      format: ':bar',
      width: 10
    });

    it('should render a progress bar based on the result of `getProgress`', () => {
      progress = 0;
      expect(`${bar}`).toBe('[----------]');

      progress = 0.1;
      expect(`${bar}`).toBe('[>---------]');

      progress = 0.2;
      expect(`${bar}`).toBe('[=>--------]');

      progress = 0.3;
      expect(`${bar}`).toBe('[==>-------]');

      progress = 0.4;
      expect(`${bar}`).toBe('[===>------]');

      progress = 0.5;
      expect(`${bar}`).toBe('[====>-----]');

      progress = 0.6;
      expect(`${bar}`).toBe('[=====>----]');

      progress = 0.7;
      expect(`${bar}`).toBe('[======>---]');

      progress = 0.8;
      expect(`${bar}`).toBe('[=======>--]');

      progress = 0.9;
      expect(`${bar}`).toBe('[========>-]');

      progress = 0.99;
      expect(`${bar}`).toBe('[=========>]');

      progress = 1;
      expect(`${bar}`).toBe('[==========]');
    });

    describe('when progress is greater than 1', () => {
      it('should render a complete bar', () => {
        progress = 10;
        expect(`${bar}`).toBe('[==========]');
      });
    });

    describe('when progress is less than 1', () => {
      it('should render an empty bar', () => {
        progress = -10;
        expect(`${bar}`).toBe('[----------]');
      });
    });
  });

  describe('rendering percentages', () => {
    let progress = -1;

    const bar = ProgressBarFactory({
      getProgress: () => progress,
      format: ':percentage',
      width: 10
    });

    it('should render a percentage based on the result of `getProgress`', () => {
      progress = 0;
      expect(`${bar}`).toBe('0%');

      progress = 0.1;
      expect(`${bar}`).toBe('10%');

      progress = 0.2;
      expect(`${bar}`).toBe('20%');

      progress = 0.3;
      expect(`${bar}`).toBe('30%');

      progress = 0.4;
      expect(`${bar}`).toBe('40%');

      progress = 0.5;
      expect(`${bar}`).toBe('50%');

      progress = 0.6;
      expect(`${bar}`).toBe('60%');

      progress = 0.7;
      expect(`${bar}`).toBe('70%');

      progress = 0.8;
      expect(`${bar}`).toBe('80%');

      progress = 0.9;
      expect(`${bar}`).toBe('90%');

      progress = 1;
      expect(`${bar}`).toBe('100%');
    });

    describe('when progress is greater than 1', () => {
      it('should render 100%', () => {
        progress = 10;
        expect(`${bar}`).toBe('100%');
      });
    });

    describe('when progress is less than 1', () => {
      it('should render 0%', () => {
        progress = -10;
        expect(`${bar}`).toBe('0%');
      });
    });
  });

  describe('rendering elapsed time', () => {
    let bar: ProgressBar;

    beforeEach(() => {
      bar = ProgressBarFactory({
        getProgress: () => 1,
        format: ':elapsed',
        width: 10
      });
    });

    it('should render the time elapsed', () => {
      expect(`${bar}`).toBe('0ms');

      NOW = dateFns.addSeconds(NOW, 2).valueOf();
      expect(`${bar}`).toBe('2s');

      NOW = dateFns.addMinutes(NOW, 2).valueOf();
      expect(`${bar}`).toBe('2m 2s');

      NOW = dateFns.addHours(NOW, 5).valueOf();
      expect(`${bar}`).toBe('5h 2m 2s');

      NOW = dateFns.addDays(NOW, 1).valueOf();
      expect(`${bar}`).toBe('1d 5h 2m 2s');
    });
  });

  describe('rendering remaining time', () => {
    let progress = 0;
    let bar: ProgressBar;

    beforeEach(() => {
      bar = ProgressBarFactory({
        getProgress: () => progress,
        format: ':remaining',
        width: 10
      });
    });

    it('should render the estimated time remaining', () => {
      expect(`${bar}`).toBe('');

      progress = 0.1;
      NOW = dateFns.addMinutes(NOW, 1).valueOf();
      expect(`${bar}`).toBe('9m');

      progress = 0.3;
      NOW = dateFns.addMinutes(NOW, 2).valueOf();
      expect(`${bar}`).toBe('7m');

      progress = 0.5;
      NOW = dateFns.addSeconds(NOW, 30).valueOf();
      expect(`${bar}`).toBe('3m 30s');
    });
  });
});
