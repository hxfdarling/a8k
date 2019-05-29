import { logWithSpinner, stopSpinner } from '@a8k/cli-utils/spinner';
import fs from 'fs-extra';
import path from 'path';
import A8k from '..';

async function cleanUnusedCache(context: A8k) {
  const { cacheBase, cache } = context.config;
  if (cacheBase) {
    logWithSpinner('clean old cache');
    try {
      const list: string[] = await fs.readdir(cacheBase);
      await Promise.all(
        list
          .filter(i => path.basename(cache) !== i)
          .map(i => path.join(cacheBase, i))
          .map(filepath => fs.remove(filepath))
      );
    } catch (e) {}
    stopSpinner();
  }
}
export default cleanUnusedCache;
