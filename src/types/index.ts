export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum OrderType {
  LIMIT = 'limit',
  MARKET = 'market',
}

export type OrderExecutionStrategy = 'gtc' | 'post_only' | 'fok' | 'ioc';

export enum OrderStatus {
  INIT = 'init',
  LIVE = 'live',
  NEW = 'new',
  PARTIALLY_FILLED = 'partially_filled',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
}

export type InsuranceOrdersInfo = {
  totalUSDTRequired: number;
  orderInfoList: Array<{
    orderSize: string;
    orderPrice: string;
  }>;
};

export type CancelOrderDto = {
  orderId?: string;
  clientOid?: string;
};

export type SpotOrderDto = {
  side: OrderSide;
  orderType: OrderType;
  force: OrderExecutionStrategy;
  price?: string;
  size: string;
};

export type OrderInfoDto = {
  orderId?: string;
  clientOid?: string;
};

export type SubmitOrderResponseDto = {
  code: string;
  msg: string;
  data: {
    orderId: string;
    clientOid: string;
  };
};

export type OrderInfoResponseDto = {
  code: string;
  msg: string;
  requestTime: number;
  data: Array<{
    userId: string;
    symbol: string;
    orderId: string;
    clientOid: string;
    price: string;
    size: string;
    orderType: string;
    side: string;
    status: OrderStatus;
    priceAvg: string;
    baseVolume: string;
    quoteVolume: string;
    enterPointSource: string;
    feeDetail: string;
    orderSource: string;
    cTime: number;
    uTime: number;
  }>;
};

export type CancelOrderResponseDto = {
  code: string;
  message: string;
  data: {
    orderId: string;
    clientOid: string;
  };
};

export type USDTAccountBalanceResponseDto = {
  coin: string;
  available: string;
  frozen: string;
  locked: string;
  limitAvailable: string;
  uTime: string;
};

export type SpotTickerResponseDto = {
  symbol: string;
  high24h: string;
  open: string;
  low24h: string;
  lastPr: string;
  quoteVolume: string;
  baseVolume: string;
  usdtVolume: string;
  bidPr: string;
  askPr: string;
  bidSz: string;
  askSz: string;
  openUtc: string;
  ts: string;
  changeUtc24h: string;
  change24h: string;
};

export enum WebSocketSubscriptionChannel {
  ORDERS = 'orders',
}

export type WebSocketBase = {
  action: string;
  ts: number;
};

export type WebSocketOrderInfoDto = {
  instId: string;
  orderId: string;
  clientOid: string;
  size: string;
  notional: string;
  orderType: string;
  force: string;
  side: string;
  fillPrice: string;
  tradeId: string;
  baseVolume: string;
  fillTime: string;
  fillFee: string;
  fillFeeCoin: string;
  tradeScope: string;
  accBaseVolume: string;
  priceAvg: string;
  status: OrderStatus;
  cTime: string;
  uTime: string;
  feeDetail: Array<{
    feeCoin: string;
    fee: string;
  }>;
  enterPointSource: string;
};

export type OrderSnapshot = WebSocketBase & {
  arg: {
    instType: string;
    channel: WebSocketSubscriptionChannel.ORDERS;
    instId: string;
  };
  data: Array<WebSocketOrderInfoDto>;
};

export type WebSocketData = OrderSnapshot;
