import { Module } from '@nestjs/common'

import { Encrypter } from '@/domain/carrier/application/cryptography/encrypter.js'
import { HashComparer } from '@/domain/carrier/application/cryptography/hash-comparer.js'
import { HashGenerator } from '@/domain/carrier/application/cryptography/hash-generator.js'

import { JwtEncrypter } from './jwt-encrypter.js'
import { BcryptHasher } from './bcrypt-hasher.js'

@Module({
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
  ],
  exports: [Encrypter, HashComparer, HashGenerator],
})
export class CryptographyModule {}
