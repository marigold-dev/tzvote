declare global {
    namespace NodeJS {
      interface ProcessEnv {
        NETWORK :  string | undefined;
        TEZOS_NODE : string | undefined;
        ORACLE_ADDRESS : string | undefined;
        TEMPLATE_ADDRESS: string | undefined;
        NODE_ENV: 'development' | 'production';
        PORT?: string;
        PWD: string;
      }
    }
  }