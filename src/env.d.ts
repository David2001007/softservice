/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY: string
  readonly GOOGLE_DRIVE_FOLDER_ID: string
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY: string
      readonly GOOGLE_DRIVE_FOLDER_ID: string
      // Add other environment variables here
    }
  }
}

export {}
