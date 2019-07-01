import chalk from 'chalk';
import getIp from 'internal-ip';
import WebpackDevServer from 'webpack-dev-server';

async function printInstructions(devServer: WebpackDevServer.Configuration) {
  const { host, port, https } = devServer;
  const protocol = https ? 'https://' : 'http://';
  const isAnyHost = host === '0.0.0.0';

  console.log();

  // eslint-disable-next-line max-len
  const getLocalAddress = (color: any) =>
    `${protocol}${isAnyHost ? 'localhost' : host}:${color ? chalk.bold(port as any) : port}`;
  console.log(`  ${chalk.green('Local:')}            ${getLocalAddress(true)}`);

  const ip = await getIp.v4();
  if (ip) {
    console.log(`  ${chalk.green('On Your Network:')}  ${protocol}${ip}:${port}`);
  }
  console.log();
}

export { printInstructions };
