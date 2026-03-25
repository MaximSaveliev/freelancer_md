import { decodeCookieValue } from './cookie';

function assertEqual(actual: unknown, expected: unknown) {
  if (actual !== expected) {
    throw new Error(`Assertion failed. Expected ${String(expected)} but got ${String(actual)}`);
  }
}

// URL-encoded base64 should match raw base64
assertEqual(
  decodeCookieValue('hFBrzXL3SiTG721bvUBmVH%2BLlLR3PpJKf4xsUdAvmOB8lg57Xn1GBKzpKj%2B2c7Qv1GTwS1qIgVj3eaTOsoAnGQ%3D%3D'),
  'hFBrzXL3SiTG721bvUBmVH+LlLR3PpJKf4xsUdAvmOB8lg57Xn1GBKzpKj+2c7Qv1GTwS1qIgVj3eaTOsoAnGQ==',
);

