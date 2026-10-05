import { HashComparer } from '@/domain/carrier/application/cryptography/hash-comparer.js'
import { HashGenerator } from '@/domain/carrier/application/cryptography/hash-generator.js'

export class FakeHasher implements HashGenerator, HashComparer {
  async hash(plain: string): Promise<string> {
    return plain.concat('-hashed')
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return plain.concat('-hashed') === hash
  }
}
