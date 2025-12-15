import { PhoneFormatPipe } from './phone-format-pipe';

describe('PhoneFormatPipe', () => {
  it('create an instance', () => {
    const pipe = new PhoneFormatPipe();
    expect(pipe).toBeTruthy();
  });

  it('should format phone number correctly', () => {
    const pipe = new PhoneFormatPipe();
    expect(pipe.transform('987654321')).toBe('987 654 321');
  });

  it('should return empty string for empty input', () => {
    const pipe = new PhoneFormatPipe();
    expect(pipe.transform('')).toBe('');
  });
});