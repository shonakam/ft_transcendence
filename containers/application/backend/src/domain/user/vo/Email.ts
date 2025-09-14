class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    const sanitized = email.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // ^        : start of string
    // [^\s@]+  : one or more characters except whitespace and @
    // @        : literal @ symbol
    // [^\s@]+  : one or more characters except whitespace and @ (domain)
    // \.       : literal dot
    // [^\s@]+  : one or more characters except whitespace and @ (top-level domain)
    // $        : end of string

    if (!regex.test(sanitized)) {
      throw new Error('Invalid email');
    }
    return new Email(sanitized);
  }

  get(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

export default Email;
