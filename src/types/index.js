export var OrderSide;
(function (OrderSide) {
    OrderSide["BUY"] = "buy";
    OrderSide["SELL"] = "sell";
})(OrderSide || (OrderSide = {}));
export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["INIT"] = "init";
    OrderStatus["LIVE"] = "live";
    OrderStatus["NEW"] = "new";
    OrderStatus["PARTIALLY_FILLED"] = "partially_filled";
    OrderStatus["FILLED"] = "filled";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (OrderStatus = {}));
export var WebSocketSubscriptionChannel;
(function (WebSocketSubscriptionChannel) {
    WebSocketSubscriptionChannel["ORDERS"] = "orders";
})(WebSocketSubscriptionChannel || (WebSocketSubscriptionChannel = {}));
//# sourceMappingURL=index.js.map