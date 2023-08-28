import { BcryptJsHashProvider } from '../../bcryptjs-hash.provider';

describe('BcryptjsHasProvider unit tests', () => {
  let sut: BcryptJsHashProvider;

  beforeEach(() => {
    sut = new BcryptJsHashProvider();
  });
  it('should return a encrypted string', async () => {
    const password = 'pass123';
    const hash = await sut.generateHash(password);
    expect(hash).toBeDefined();
  });
  it('should return false in invalid password and hash comparison', async () => {
    const password = 'pass123';
    const hash = await sut.generateHash(password);
    const result = await sut.compareHash('wrongpass', hash);
    expect(result).toBeFalsy();
  });
  it('should return true in valid password and hash comparison', async () => {
    const password = 'pass123';
    const hash = await sut.generateHash(password);
    const result = await sut.compareHash(password, hash);
    expect(result).toBeTruthy();
  });
});
