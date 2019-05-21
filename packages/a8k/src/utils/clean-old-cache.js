import { logWithSpinner, stopSpinner } from '@a8k/cli-utils/spinner';
import fs from 'fs-extra';
import path from 'path';

async function cleanUnusedCache(context) {
  const { cacheBase, cache } = context.config;
  if (cacheBase) {
    logWithSpinner('clean old cache');
    const list = await fs.readdir(cacheBase);
    await Promise.all(
      list
        .filter(i => path.basename(cache) !== i)
        .map(i => path.join(cacheBase, i))
        .map(filepath => fs.remove(filepath))
    );
    stopSpinner();
  }
}
export default cleanUnusedCache;
