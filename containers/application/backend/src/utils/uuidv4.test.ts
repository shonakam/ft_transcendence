import { uuidv4 } from './uuidv4.ts';

describe('uuidv4 fuzzing test', () => {
  const N = 2000;
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  it('generates many valid UUID v4 strings', () => {
    for (let i = 0; i < N; i++) {
      const id = uuidv4();
      expect(id).toMatch(UUID_REGEX);
      expect(id[14]).toBe('4'); // バージョンが "4" であること
      expect('89ab').toContain(id[19]); // バリアントが "8,9,a,b" のどれかであること
    }
  });

  it('does not generate duplicates in a batch', () => {
    const set = new Set<string>();
    for (let i = 0; i < N; i++) {
      const id = uuidv4();
      expect(set.has(id)).toBe(false);
      set.add(id);
    }
  });
});
