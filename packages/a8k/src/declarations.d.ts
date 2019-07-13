declare namespace NodeJS {
  interface Process {
    noDeprecation: boolean;
  }
}

declare module '@a8k/cli-utils/load-config';
declare module '@a8k/dev-utils/formatWebpackMessages';
declare module 'html-webpack-plugin';
declare module '@a8k/cli-utils/npm';
declare module 'download-git-repo';
declare module 'tmp';
