import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebsocketService } from '../websocket/websocket.service.js';
import { BitgetService } from '../bitget/bitget.service.js';
import { askToRestart } from '../../prompts/restart.prompt.js';
import {
  InsuranceOrdersInfo,
  OrderSide,
  OrderStatus,
  OrderType,
  SpotOrderDto,
  WebSocketData,
  WebSocketOrderInfoDto,
  WebSocketSubscriptionChannel,
} from '../../types/index.js';

const addPercentageToNumber = (number: number, percentage: number) => {
  const increase = number * (percentage / 100);

  return Number(truncate(number + increase, 2));
};

const truncate = (value: number, precision: number) => {
  const s = Math.pow(10, precision || 0);

  return Math.trunc(s * value) / s;
};

@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);
  private totalPurchasedCryptoAmount: number;
  private takeProfitOrderId: string;
  // Нужно для отмены ордера (после того как take profit ордер отменен необходимо сохранить цену take profit и сразу после подтверждения отмены ордера установить новый ордер с takeProfitAmount)
  private insuranceOrderTakeProfitAmount: number;
  private initialCryptoPricePerOne: number;
  private insuranceOrderIdList: Array<string>;
  private buyAmount: number;
  private takeProfitPercentage: number;
  private symbol: string;
  private priceDropPercentage: number;
  private insuranceOrdersAmount: number;
  private insuranceOrdersIntervalMultiplier: number;
  private insuranceOrdersMultiplier: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly bitgetService: BitgetService,
    private readonly websocketService: WebsocketService,
  ) {
    this.takeProfitOrderId = '';
    this.insuranceOrderTakeProfitAmount = 0;
    this.initialCryptoPricePerOne = 0;
    this.insuranceOrderIdList = [];
    this.totalPurchasedCryptoAmount = 0;
    this.buyAmount = this.configService.get<number>('BUY_AMOUNT');
    this.takeProfitPercentage = this.configService.get<number>(
      'TAKE_PROFIT_PERCENTAGE',
    );
    this.symbol = this.configService.get<string>('SYMBOL');
    this.priceDropPercentage = this.configService.get<number>(
      'PRICE_DROP_PERCENTAGE',
    );
    this.insuranceOrdersAmount = this.configService.get<number>(
      'INSURANCE_ORDERS_AMOUNT',
    );
    this.insuranceOrdersIntervalMultiplier = this.configService.get<number>(
      'INSURANCE_ORDERS_INTERVAL_MULTIPLIER',
    );
    this.insuranceOrdersMultiplier = this.configService.get<number>(
      'INSURANCE_ORDERS_MULTIPLIER',
    );

    // Запуск мониторинга рынка
    this.monitorMarket();
  }

  // Инициализация приложения
  private async monitorMarket() {
    await this.checkBotReadiness();
    await this.initializeCryptoBot();
  }

  public async initializeCryptoBot() {
    try {
      // Создание market ордера
      const marketOrder: SpotOrderDto = {
        side: OrderSide.BUY,
        orderType: OrderType.MARKET,
        force: 'gtc',
        size: `${this.buyAmount}`,
      };

      // Make market purchase
      const { data } = (await this.placeOrder(marketOrder)) || {};

      const { orderId } = data || {};

      // Get purchase info
      const { data: executedOrderInfo } = await this.bitgetService.getOrderInfo(
        {
          orderId: orderId,
        },
      );

      const executedOrderPricePerOneSymbol = Number(
        executedOrderInfo[0]?.priceAvg,
      );

      const executedOrderCryptoPurchasedAmount = truncate(
        Number(executedOrderInfo[0]?.baseVolume),
        4,
      );

      this.totalPurchasedCryptoAmount =
        this.totalPurchasedCryptoAmount + executedOrderCryptoPurchasedAmount;

      this.takeProfitOrderId = await this.placeTakeProfitOrder(
        addPercentageToNumber(
          executedOrderPricePerOneSymbol,
          this.takeProfitPercentage,
        ),
      );

      this.initialCryptoPricePerOne = truncate(
        executedOrderPricePerOneSymbol,
        2,
      );

      this.logger.log(
        `Initial Crypto Price Per One: ${this.initialCryptoPricePerOne}`,
      );

      this.logger.log(
        `Initial Crypto Purchased Amount: ${this.totalPurchasedCryptoAmount}`,
      );

      await this.placeInsuranceOrders();
    } catch (error) {
      this.logger.error('Error in initializing crypto bot:', error);
    }
  }

  public async placeInsuranceOrders() {
    let insuranceOrderList = [];
    const { orderInfoList } = this.getInsuranceOrdersInfo(
      Number(this.initialCryptoPricePerOne),
    );

    for (let i = 0; i < orderInfoList.length; i++) {
      const { orderSize, orderPrice } = orderInfoList[i];

      // Создание страховочного ордера
      const safetyOrder: SpotOrderDto = {
        side: OrderSide.BUY,
        orderType: OrderType.LIMIT,
        force: 'gtc',
        size: orderSize,
        price: orderPrice,
      };

      // Размещение ордера
      const { data } = (await this.placeOrder(safetyOrder)) || {};

      this.insuranceOrderIdList.push(data?.orderId);
      insuranceOrderList.push({
        'Insurance Order Price': `${orderPrice}`,
        'Insurance Order Size': `${orderSize}`,
      });
    }

    this.logger.log('Insurance orders has been made:');
    console.table(insuranceOrderList);

    this.subscribeToOrderUpdates();
  }

  private getInsuranceOrdersInfo(cryptoPricePerOne: number) {
    const insuranceOrdersInfo: InsuranceOrdersInfo = {
      // Сумма необходимая для покупок считается с первоначальной покупки по рынку
      totalUSDTRequired: this.buyAmount,
      orderInfoList: [],
    };
    let currentInsuranceOrdersMultiplier = this.insuranceOrdersMultiplier;
    let calculatedInsuranceDropPercentage = this.priceDropPercentage;

    for (let i = 0; i < this.insuranceOrdersAmount; i++) {
      // Расчет суммы падения на которую надо ставить новый страховочный ордер
      // (должно быть так как расчёт у bitget идёт не по вычисленной цене страх. ордера (nextOrderPrice) а от первоначальной купленной цены крипты (this.baseOrder.cryptoPricePerOne))
      const priceDrop =
        (cryptoPricePerOne * calculatedInsuranceDropPercentage) / 100;

      // Расчет цены по которой будет установлен следующий страховочный ордер
      const nextOrderPrice = truncate(cryptoPricePerOne - priceDrop, 2);

      // Получение размера криптовалюты на который совершается покупка (сумма в USD которую хочет тратить при старте / цена за одну единицу крипты * множитель (в процентах) суммы покупки)
      const nextOrderSize = truncate(
        (this.buyAmount / nextOrderPrice) * currentInsuranceOrdersMultiplier,
        4,
      );

      // Получение суммы в USDT которую необходимо потратить на покупку текущего страховочного ордера (сумма в USD которую хочет тратить при старте * множитель (в процентах) суммы покупки)
      const nextOrderUSDTPrice =
        this.buyAmount * currentInsuranceOrdersMultiplier;

      // Если сумма покупки или цена покупки меньше или равна нуля - пропустить все последующие страховочные ордеры
      if (nextOrderSize <= 0 || nextOrderPrice <= 0) {
        break;
      }

      insuranceOrdersInfo.totalUSDTRequired += nextOrderUSDTPrice;
      insuranceOrdersInfo.orderInfoList.push({
        orderSize: `${nextOrderSize}`,
        orderPrice: `${nextOrderPrice}`,
      });

      // Обновление множителя (в процентах) для объема покупки и процент интервала страховочного ордера
      // (через какой промежуток выставлять следующий страховой ордер)
      currentInsuranceOrdersMultiplier =
        currentInsuranceOrdersMultiplier * this.insuranceOrdersMultiplier;
      calculatedInsuranceDropPercentage =
        calculatedInsuranceDropPercentage *
          this.insuranceOrdersIntervalMultiplier +
        this.priceDropPercentage;
    }

    return insuranceOrdersInfo;
  }

  private async checkBotReadiness() {
    const { available } = (await this.getUSDTBalance()) || {};
    const { lastPr } = (await this.getCryptoExchangeRate()) || {};

    const { totalUSDTRequired, orderInfoList } = this.getInsuranceOrdersInfo(
      Number(lastPr),
    );

    let isRestartService = false;

    if (Number(available) <= totalUSDTRequired) {
      this.logger.error(
        `Insufficient funds to run the bot. Need at least ${totalUSDTRequired} USDT`,
      );
      isRestartService = await askToRestart();
    }

    if (orderInfoList.length !== this.insuranceOrdersAmount) {
      this.logger.error(
        `The maximum possible number of safety orders with the specified parameters: ${orderInfoList.length}`,
      );
      isRestartService = await askToRestart();
    }

    if (isRestartService) {
      this.initializeCryptoBot();
    }
  }

  private async placeOrder(order: SpotOrderDto) {
    try {
      const data = await this.bitgetService.submitOrder(order);

      return data;
    } catch (error) {
      this.logger.error('Error when placing order:', error);
    }
  }

  private async cancelOrder(orderId: string) {
    try {
      const data = await this.bitgetService.cancelOrder({ orderId: orderId });

      return data;
    } catch (error) {
      this.logger.error('Error when canceling order:', error);
    }
  }

  private async getUSDTBalance() {
    try {
      const data = await this.bitgetService.getUSDTAccountBalance();

      return data;
    } catch (error) {
      this.logger.error('Error when getting USDT balance info:', error);
    }
  }

  private async getCryptoExchangeRate() {
    try {
      const data = await this.bitgetService.getSpotTicker();

      return data;
    } catch (error) {
      this.logger.error('Error when getting USDT balance info:', error);
    }
  }

  private async restartCryptoBot() {
    // Сброс остальных переменных
    this.takeProfitOrderId = '';
    this.insuranceOrderTakeProfitAmount = 0;
    this.initialCryptoPricePerOne = 0;
    this.totalPurchasedCryptoAmount = 0;

    // Создание массива промисов для отмены каждого страховочного ордера
    const cancelInsuranceOrderPromises = this.insuranceOrderIdList.map(
      (orderId) => this.cancelOrder(orderId),
    );

    // Отмена всех страховочных ордеров одновременно
    await Promise.all(cancelInsuranceOrderPromises);
  }

  private async placeTakeProfitOrder(orderPrice: number) {
    // Создание страховочного ордера
    const takeProfitOrder: SpotOrderDto = {
      side: OrderSide.SELL,
      orderType: OrderType.LIMIT,
      force: 'gtc',
      size: `${truncate(this.totalPurchasedCryptoAmount, 4)}`,
      price: `${orderPrice}`,
    };

    // Размещение ордера
    const { data } = (await this.placeOrder(takeProfitOrder)) || {};

    return data?.orderId;
  }

  private async handleOrderChanged(orderChangedInfo: WebSocketOrderInfoDto) {
    if (orderChangedInfo.status === OrderStatus.FILLED) {
      const { priceAvg, accBaseVolume } = orderChangedInfo;

      const isTakeProfitOrderFilled =
        this.takeProfitOrderId === orderChangedInfo.orderId;

      // Если take profit ордер выполнился - необходимо перезапустить скрипт
      if (isTakeProfitOrderFilled) {
        this.logger.log('Take Profit Reached!');
        this.logger.log(`Sold at price: ${priceAvg}`);
        this.logger.log(`Total cryptocurrencies sold: ${accBaseVolume}`);

        this.restartCryptoBot();
      } else {
        // Найти в списке страховочных ордеров необходимый ордер
        const insuranceOrderIdIndex = this.insuranceOrderIdList.findIndex(
          (orderId) => orderId === orderChangedInfo.orderId,
        );

        if (insuranceOrderIdIndex !== -1) {
          // Take profit после срабатывания страховочного ордера
          const insuranceOrderTakeProfit = addPercentageToNumber(
            (Number(priceAvg) + this.initialCryptoPricePerOne) / 2,
            this.takeProfitPercentage,
          );

          // Обновить объём купленной криптовалюты
          this.totalPurchasedCryptoAmount += truncate(Number(accBaseVolume), 4);

          // Remove the order from the list
          this.insuranceOrderIdList.splice(insuranceOrderIdIndex, 1);

          // Сохранить цену take profit ордера который будет установлен после того как проошлый будет отменен
          this.insuranceOrderTakeProfitAmount = insuranceOrderTakeProfit;

          // Отменить предыдущий take profit ордер так как цена опустилась до значения одного из страховочных ордеров
          this.cancelOrder(this.takeProfitOrderId);
        }
      }
    }

    if (orderChangedInfo.status === OrderStatus.CANCELLED) {
      // Если take profit ордер в статусе cancelled - значит ставим новый take profit ордер
      if (orderChangedInfo.orderId === this.takeProfitOrderId) {
        // Сделать новый take profit ордер и обновить takeProfitOrderId
        this.takeProfitOrderId = await this.placeTakeProfitOrder(
          this.insuranceOrderTakeProfitAmount,
        );
        this.insuranceOrderTakeProfitAmount = 0;
      } else {
        // Найти в списке страховочных ордеров необходимый ордер
        const insuranceOrderIdIndex = this.insuranceOrderIdList.findIndex(
          (orderId) => orderId === orderChangedInfo.orderId,
        );

        // Если отмененный ордер найден - значит запущен механизм перезапуска скрипта
        if (insuranceOrderIdIndex !== -1) {
          this.insuranceOrderIdList.splice(insuranceOrderIdIndex, 1);

          // Если после отмены текущего страховочного ордера список остальных страховочных ордеров пуст - запустить инициализацию скрипта
          if (!this.insuranceOrderIdList.length) {
            // await this.initializeCryptoBot();
          }
        }
      }
    }
  }

  private subscribeToOrderUpdates() {
    const wsClient = this.websocketService.getWebSocketClient();

    wsClient.subscribeTopic('SPOT', 'orders', this.symbol);

    wsClient.on('update', async ({ data, arg }: WebSocketData) => {
      if (arg.channel === WebSocketSubscriptionChannel.ORDERS) {
        const [orderData] = data;

        this.handleOrderChanged(orderData);
      }
    });

    wsClient.on('authenticated', () => {
      this.logger.log('Waiting for filling orders...');
    });
  }
}
