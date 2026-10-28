import { feetToMeters, formatLength, metersToFeet } from './units';

describe('units', () => {
  it('converts meters to feet and back', () => {
    expect(metersToFeet(30)).toBeCloseTo(98.43, 1);
    expect(feetToMeters(metersToFeet(30))).toBeCloseTo(30, 5);
  });

  it('formats lengths for each unit system', () => {
    expect(formatLength(30, 'metric')).toBe('30 m');
    expect(formatLength(30, 'imperial')).toBe('98 ft');
  });
});
