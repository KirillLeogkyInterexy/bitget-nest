import { Module } from '@nestjs/common';
import { BitgetService } from './bitget.service.js';
import { TradingService } from '../trading/trading.service.js';
import { WebsocketService } from '../websocket/websocket.service.js';

@Module({
  providers: [BitgetService, TradingService, WebsocketService],
  exports: [BitgetService],
})
export class BitgetModule {}
