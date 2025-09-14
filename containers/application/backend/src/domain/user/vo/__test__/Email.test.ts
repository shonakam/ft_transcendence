import Email from '../Email.ts';

describe('Email VO', () => {
  test('should create Email instance for valid email', () => {
    const emailStr = 'test@example.com';
    const email = Email.create(emailStr);

    expect(email).toBeInstanceOf(Email);
    expect(email.get()).toBe(emailStr);
  });

  test('should trim whitespace and keep lowercase', () => {
    const emailStr = '  TEST@Example.COM  ';
    const email = Email.create(emailStr);

    expect(email.get()).toBe('TEST@Example.COM'.trim());
  });

  test('should throw error for invalid email', () => {
    const invalidEmails = [
      'plainaddress',
      '@missinguser.com',
      'user@.com',
      'user@domain@domain.com',
      'user@domain com',
    ];

    invalidEmails.forEach((str) => {
      expect(() => Email.create(str)).toThrow('Invalid email');
    });
  });

  test('should return true for equals() when emails are identical', () => {
    const email1 = Email.create('test@example.com');
    const email2 = Email.create('test@example.com');

    expect(email1.equals(email2)).toBe(true);
  });

  test('should return false for equals() when emails are different', () => {
    const email1 = Email.create('test1@example.com');
    const email2 = Email.create('test2@example.com');

    expect(email1.equals(email2)).toBe(false);
  });
});
