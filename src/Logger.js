// @flow

import log4js from 'log4js';
import prettyjson from 'prettyjson';

import getCurrentUrl from './utils/testcafe/getCurrentUrl';

export default class DirectorLogger {
  _screenshotCount: number = 0;
  _startDate: string;

  // I haven't found any working type annotation.
  // Maybe currently it's available and not broken, check. :-)
  _logger: any;

  constructor() {
    // Log4JS setup.
    log4js.configure({
      appenders: { verbose: { type: 'file', filename: 'verbose.log' } },
      categories: { default: { appenders: ['verbose'], level: 'info' } },
    });
    this._logger = log4js.getLogger('verbose');
    this._startDate = (new Date()).toISOString();
  }

  async log(t: TestCafe$TestController, name: string): Promise<void> {
    const location = await getCurrentUrl();
    const screenName = await this._takeScreenshot(t);

    this._logger.info('-- LOG ENTRY START --');
    this._logger.info(`name: ${name}`);
    this._logger.info(`screenshot: ${screenName}`);
    this._logger.info(`location: ${location}`);
    // $FlowFixMe no typedef for getBrowserConsoleMessages method
    this._logger.info(`browserLogs: ${prettyjson.render(await t.getBrowserConsoleMessages())}`);
    this._logger.info('-- LOG ENTRY END --');
  }

  async _takeScreenshot(t: TestCafe$TestController): Promise<string> {
    this._screenshotCount += 1;
    const path = `directorCafe/${this._startDate}/${this._screenshotCount}.png`;
    await t.takeScreenshot(path);
    return path;
  }
}
