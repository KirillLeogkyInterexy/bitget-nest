import { LoggerService } from '@nestjs/common';
import ansi from 'ansi-colors';
import { TradingService } from '../trading/trading.service.js';

export class CustomLoggerService implements LoggerService {
  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]) {
    if (optionalParams.includes(TradingService.name)) {
      console.log(ansi.bold.cyanBright(message));
    }
  }

  /**
   * Write a 'fatal' level log.
   */
  fatal(message: any) {
    console.error(ansi.red(`FATAL: ${message}`));
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any) {
    console.error(ansi.bold.red(`ERROR: ${message}`));
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]) {
    console.warn(ansi.bold.yellow(`WARN: ${message}`));
  }

  /**
   * Write a 'debug' level log.
   */
  debug?(message: any, ...optionalParams: any[]) {
    console.debug(ansi.blue('DEBUG:'), message, ...optionalParams);
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose?(message: any, ...optionalParams: any[]) {
    console.debug(ansi.cyan('VERBOSE:'), message, ...optionalParams);
  }
}
