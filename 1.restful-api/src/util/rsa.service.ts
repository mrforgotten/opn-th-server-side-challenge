import * as fs from 'fs';
import { generateKeyPairSync, KeyPairSyncResult } from 'crypto';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RsaKeyService {
  private privateKey: string;
  private publicKey: string;
  private readonly privateKeyPath = path.join(
    __dirname,
    '../../',
    'rsa-private.pem',
  );
  private readonly publicKeyPath = path.join(
    __dirname,
    '../../',
    'rsa-public.pem',
  );

  constructor() {
    this.loadOrGenerateKeys();
  }

  private loadOrGenerateKeys() {
    if (
      !fs.existsSync(this.privateKeyPath) ||
      !fs.existsSync(this.publicKeyPath)
    ) {
      const { privateKey, publicKey }: KeyPairSyncResult<string, string> =
        generateKeyPairSync('rsa', {
          modulusLength: 2048,
          publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
          },
          privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
          },
        });

      fs.writeFileSync(this.privateKeyPath, privateKey);
      fs.writeFileSync(this.publicKeyPath, publicKey);
    }

    this.privateKey = fs.readFileSync(this.privateKeyPath, 'utf8');
    this.publicKey = fs.readFileSync(this.publicKeyPath, 'utf8');
    return true;
  }

  // Expose the private key
  getPrivateKey(): string {
    return this.privateKey;
  }

  // Expose the public key
  getPublicKey(): string {
    return this.publicKey;
  }
}
