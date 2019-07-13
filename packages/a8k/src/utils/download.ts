import download from 'download-git-repo';
import tmp from 'tmp';

export default (repo: string): Promise<{ path: string; cleanupCallback?: any }> => {
  const options: any = {};
  const isHttp = /^https?:/.test(repo);
  if (isHttp && /\.git(#.+)?$/.test(repo)) {
    repo = 'direct:' + repo;
    options.clone = true;
  } else if (isHttp && /\.zip$/.test(repo)) {
    repo = 'direct:' + repo;
  }
  return new Promise((resolve, reject) => {
    tmp.dir(function _tempDirCreated(err: Error, path: string, cleanupCallback: any) {
      if (err) {
        reject(err);
      } else {
        // tslint:disable-next-line: no-shadowed-variable
        download(repo, path, options, (err: Error) => {
          if (err) {
            cleanupCallback();
            reject(err);
          } else {
            resolve({
              cleanupCallback,
              path,
            });
          }
        });
      }
    });
  });
};
