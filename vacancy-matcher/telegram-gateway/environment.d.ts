declare const module: any;

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      NODE_ENV: 'development' | 'production';
      BOT_PORT?: string;
      ML_HOST_URL?: string;
    }
  }
}

export { }