interface ImportMetaEnv {
  readonly VITE_42_CLIENT_ID: string;
  readonly VITE_42_REDIRECT_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
