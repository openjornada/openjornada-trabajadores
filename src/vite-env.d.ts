/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_USERNAME?: string;
  readonly VITE_API_PASSWORD?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_LOGO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __APP_CONFIG__?: {
    apiUrl?: string;
    apiUsername?: string;
    apiPassword?: string;
    appName?: string;
    appLogo?: string;
  };
}
