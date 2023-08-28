import { IHashProvider } from '@/shared/application/providers/hash-provider';
import { compare, hash } from 'bcryptjs';

const SALT = 6;
export class BcryptJsHashProvider implements IHashProvider {
  async generateHash(payload: string): Promise<string> {
    return await hash(payload, SALT);
  }
  async compareHash(payload: string, hash: string): Promise<boolean> {
    return await compare(payload, hash);
  }
}
