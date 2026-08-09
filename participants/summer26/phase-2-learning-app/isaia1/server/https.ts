import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { generate } from 'selfsigned';

const CERT_DIR = join(process.cwd(), '.cert');

export async function getLocalHttpsCredentials(): Promise<{ key: string; cert: string }> {
  mkdirSync(CERT_DIR, { recursive: true });

  const keyPath = join(CERT_DIR, 'localhost-key.pem');
  const certPath = join(CERT_DIR, 'localhost-cert.pem');

  if (existsSync(keyPath) && existsSync(certPath)) {
    return {
      key: readFileSync(keyPath, 'utf8'),
      cert: readFileSync(certPath, 'utf8'),
    };
  }

  const pems = await generate([{ name: 'commonName', value: 'localhost' }], {
    days: 365,
    keySize: 2048,
    algorithm: 'sha256',
    extensions: [
      { name: 'basicConstraints', cA: true },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
      },
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 7, ip: '127.0.0.1' },
        ],
      },
    ],
  });

  writeFileSync(keyPath, pems.private);
  writeFileSync(certPath, pems.cert);

  return { key: pems.private, cert: pems.cert };
}
