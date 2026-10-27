import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const setRuntimeConfig = (value: Window['__APP_CONFIG__']) => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { __APP_CONFIG__: value },
  });
};

describe('runtime app configuration', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'https://local.example/api');
    vi.stubEnv('VITE_API_USERNAME', 'local-user');
    vi.stubEnv('VITE_API_PASSWORD', 'local-password');
    vi.stubEnv('VITE_APP_NAME', 'Local App');
    vi.stubEnv('VITE_APP_LOGO', '/local-logo.svg');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    Reflect.deleteProperty(globalThis, 'window');
    vi.resetModules();
  });

  it('prefers non-empty values from config.js to import.meta.env', async () => {
    setRuntimeConfig({
      apiUrl: 'https://tenant.example/api',
      apiUsername: 'tenant-user',
      apiPassword: 'tenant-password',
      appName: 'Tenant App',
      appLogo: '/tenant-logo.svg',
    });

    const { config } = await import('./config');

    expect(config).toEqual({
      apiUrl: 'https://tenant.example/api',
      apiUsername: 'tenant-user',
      apiPassword: 'tenant-password',
      appName: 'Tenant App',
      appLogo: '/tenant-logo.svg',
    });
  });

  it('uses import.meta.env when runtime config is absent', async () => {
    const { config } = await import('./config');

    expect(config).toEqual({
      apiUrl: 'https://local.example/api',
      apiUsername: 'local-user',
      apiPassword: 'local-password',
      appName: 'Local App',
      appLogo: '/local-logo.svg',
    });
  });

  it('treats empty runtime values as missing and applies defaults', async () => {
    setRuntimeConfig({
      apiUrl: '',
      apiUsername: '',
      apiPassword: '',
      appName: '',
      appLogo: '',
    });
    vi.stubEnv('VITE_API_URL', '');
    vi.stubEnv('VITE_API_USERNAME', '');
    vi.stubEnv('VITE_API_PASSWORD', '');
    vi.stubEnv('VITE_APP_NAME', '');
    vi.stubEnv('VITE_APP_LOGO', '');

    const { config } = await import('./config');

    expect(config).toEqual({
      apiUrl: 'http://localhost:8000',
      apiUsername: '',
      apiPassword: '',
      appName: 'Time Tracking',
      appLogo: '',
    });
  });
});
