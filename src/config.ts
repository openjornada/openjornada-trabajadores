const runtimeConfig = typeof window === 'undefined' ? undefined : window.__APP_CONFIG__;

export const config = {
  apiUrl: runtimeConfig?.apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:8000',
  apiUsername: runtimeConfig?.apiUsername || import.meta.env.VITE_API_USERNAME,
  apiPassword: runtimeConfig?.apiPassword || import.meta.env.VITE_API_PASSWORD,
  appName: runtimeConfig?.appName || import.meta.env.VITE_APP_NAME || 'Time Tracking',
  appLogo: runtimeConfig?.appLogo || import.meta.env.VITE_APP_LOGO || '',
};
