export type ChartsTimeInterval = '1min' | '5min' | '15min' | '30min' | '1h' | '4h' | '6h' | '12h' | '1day' | '3day' | '1week' | '1M' | '6Hutc' | '12Hutc' | '1Dutc' | '3Dutc' | '1Wutc' | '1Mutc';
export declare enum OrderSide {
    BUY = "buy",
    SELL = "sell"
}
export type OrderType = 'limit' | 'market';
export type TriggerType = 'fill_price' | 'mark_price';
export type PlanType = 'amount' | 'total';
export type OrderExecutionStrategy = 'gtc' | 'post_only' | 'fok' | 'ioc';
export declare enum OrderStatus {
    INIT = "init",
    LIVE = "live",
    NEW = "new",
    PARTIALLY_FILLED = "partially_filled",
    FILLED = "filled",
    CANCELLED = "cancelled"
}
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
export declare enum WebSocketSubscriptionChannel {
    ORDERS = "orders"
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
