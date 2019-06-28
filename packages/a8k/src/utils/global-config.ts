import { configPath } from '@a8k/common/lib/constants';
import fs from 'fs';

interface IConfig {
  updateDate: string;
  needUpdate: boolean;
  plugins: string[];
}
let config: IConfig = {} as IConfig;

try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (e) {
  // 文件不存在
}
export function setConfig(key: string | { [key: string]: any }, value?: any) {
  if (typeof key === 'string') {
    config[key] = value;
  } else {
    Object.keys(key).forEach((i: string) => {
      config[i] = key[i];
    });
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}
export function getConfig(key: string, defaultValue?: any) {
  if (config[key] === undefined) {
    return defaultValue;
  }
  return config[key];
}
