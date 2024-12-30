import {
  PaginatedEvents,
  PaginatedObjectsResponse,
  SuiClient,
} from "@mysten/sui/client";
import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

export class SuiService {
  private client: SuiClient;
  private prisma: PrismaClient;
  private limit = 10;

  constructor({ url }: { url: string }) {
    this.client = new SuiClient({
      url,
    });
    this.prisma = new PrismaClient({
      log: ["query", "info", "warn", "error"],
    });
  }

  async getOwnedSuiNS({ owner }: { owner: string }) {
    if (!process.env.NEXT_PUBLIC_SUI_NS_TYPE) {
      throw new Error("SUI_NS_TYPE not found");
    }
    const suiNSs = await this.client.getOwnedObjects({
      filter: {
        StructType: process.env.NEXT_PUBLIC_SUI_NS_TYPE,
      },
      owner,
    });
    return suiNSs;
  }

  async queryEvents({
    module,
    packageId,
    eventType,
    nextCursor,
  }: {
    module: string;
    packageId: string;
    eventType: string;
    nextCursor?: PaginatedEvents["nextCursor"];
  }) {
    let hasNextPage = false;

    const data: PaginatedEvents["data"] = [];
    console.log(`${packageId}::${module}::${eventType}`);
    do {
      const event = await this.client.queryEvents({
        query: {
          MoveEventType: `${packageId}::${module}::${eventType}`,
        },
        limit: this.limit,
        cursor: nextCursor,
        order: "ascending",
      });
      hasNextPage = event.hasNextPage;
      nextCursor = event.nextCursor;
      data.push(...event.data);
    } while (hasNextPage);

    return data;
  }

  async queryOwnedObjects({
    owner,
    module,
    packageId,
    type,
    nextCursor,
  }: {
    owner: string;
    module: string;
    packageId: string;
    type: string;
    nextCursor?: PaginatedObjectsResponse["nextCursor"];
  }) {
    let hasNextPage = false;

    const data: PaginatedObjectsResponse["data"] = [];
    console.log(`${packageId}::${module}::${type}`);
    do {
      const event = await this.client.getOwnedObjects({
        owner,
        filter: {
          StructType: `${packageId}::${module}::${type}`,
        },
        limit: this.limit,
        cursor: nextCursor,
        options: {
          showContent: true,
        },
      });
      hasNextPage = event.hasNextPage;
      nextCursor = event.nextCursor;
      data.push(...event.data);
    } while (hasNextPage);

    return data;
  }

  async queryObjects({ ids }: { ids: string[] }) {
    const objects = await this.client.multiGetObjects({
      ids,
      options: {
        showContent: true,
      },
    });
    return objects;
  }

  async upsertArenaEvents() {
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ASSET;
    if (!packageId) {
      throw new Error("Package not found");
    }
    const lastArena = await this.prisma.arena.findFirst({
      orderBy: {
        timestamp: "desc",
      },
      select: {
        tx_digest: true,
        event_seq: true,
      },
    });
    const nextCursor: PaginatedEvents["nextCursor"] = lastArena
      ? {
          txDigest: lastArena.tx_digest,
          eventSeq: lastArena.event_seq.toString(),
        }
      : undefined;
    const events = await this.queryEvents({
      module: "arena",
      packageId,
      eventType: `NewArena<${process.env.NEXT_PUBLIC_FUND_BASE}>`,
      nextCursor,
    });

    type ArenaData = {
      arena_type: number;
      attend_duration: string;
      end_time: string;
      id: string;
      invest_duration: string;
      start_time: string;
    };

    const upserts = events.map((event) => {
      const arenaData: ArenaData = event.parsedJson as ArenaData;
      const timestamp = event.timestampMs ?? "0";
      console.log(event);

      const start_time = Number(arenaData.start_time);
      const end_time = Number(arenaData.end_time);
      const attend_end_time = start_time + Number(arenaData.attend_duration);
      const invest_end_time =
        attend_end_time + Number(arenaData.invest_duration);
      const trade_duration = end_time - invest_end_time;

      const object: {
        object_id: string;
        start_time: number;
        end_time: number;
        invest_end_time: number;
        attend_end_time: number;
        trade_duration: number;
        event_seq: number;
        tx_digest: string;
        timestamp: number;
      } = {
        object_id: arenaData.id,
        start_time,
        end_time,
        invest_end_time,
        attend_end_time,
        trade_duration: trade_duration,
        event_seq: Number(event.id.eventSeq),
        tx_digest: event.id.txDigest,
        timestamp: Number(timestamp),
      };

      return this.prisma.arena.upsert({
        where: {
          object_id: arenaData.id,
          event_seq: Number(event.id.eventSeq),
          tx_digest: event.id.txDigest,
        },
        update: object,
        create: object,
      });
    });
    const result = await this.prisma.$transaction(upserts);
    return result;
  }

  async upsertFundEvents() {
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ASSET;
    if (!packageId) {
      throw new Error("Package not found");
    }
    const lastFund = await this.prisma.fund.findFirst({
      where: {
        arena_object_id: {
          equals: null,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      select: {
        tx_digest: true,
        event_seq: true,
      },
    });
    const nextCursor: PaginatedEvents["nextCursor"] = lastFund
      ? {
          txDigest: lastFund.tx_digest,
          eventSeq: lastFund.event_seq.toString(),
        }
      : undefined;
    console.log(nextCursor, "nextCursor");
    const events = await this.queryEvents({
      module: "fund",
      packageId,
      eventType: "CreatedFund",
      nextCursor,
    });
    console.log(events);
    type FundData = {
      name: string;
      description: string;
      start_time: string;
      end_time: string;
      invest_duration: string;
      fund_img: string;
      id: string;
      trader: string;
      trader_fee: string;
      limit_amount: string;
      expected_roi: string;
    };

    const upserts = events.map((event) => {
      console.log(event);
      const data: FundData = event.parsedJson as FundData;
      const timestamp = event.timestampMs ?? "0";

      const start_time = Number(data.start_time);
      const end_time = Number(data.end_time);
      const invest_end_time = start_time + Number(data.invest_duration);
      const trade_duration = end_time - invest_end_time;

      const object: {
        object_id: string;
        name: string;
        description: string;
        start_time: number;
        end_time: number;
        invest_end_time: number;
        trade_duration: number;
        image_blob_id: string;
        trader_fee: number;
        owner_id: string;
        limit_amount: number;
        expected_roi: number;
        event_seq: number;
        tx_digest: string;
        timestamp: number;
      } = {
        object_id: data.id,
        name: data.name,
        description: data.description,
        start_time,
        end_time,
        invest_end_time,
        trade_duration,
        image_blob_id: data.fund_img,
        trader_fee: Number(data.trader_fee) / 100,
        owner_id: data.trader,
        limit_amount: Number(data.limit_amount),
        expected_roi: Number(data.expected_roi) / 100,
        event_seq: Number(event.id.eventSeq),
        tx_digest: event.id.txDigest,
        timestamp: Number(timestamp),
      };
      return this.prisma.fund.upsert({
        where: {
          object_id: data.id,
          event_seq: Number(event.id.eventSeq),
          tx_digest: event.id.txDigest,
        },
        update: object,
        create: object,
      });
    });
    const result = await this.prisma.$transaction(upserts);
    return result;
  }

  async upsertAttendEvents() {
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ASSET;
    if (!packageId) {
      throw new Error("Package not found");
    }
    const lastFund = await this.prisma.fund.findFirst({
      where: {
        arena_object_id: {
          not: null,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      select: {
        tx_digest: true,
        event_seq: true,
      },
    });
    const nextCursor: PaginatedEvents["nextCursor"] = lastFund
      ? {
          txDigest: lastFund.tx_digest,
          eventSeq: lastFund.event_seq.toString(),
        }
      : undefined;
    const events = await this.queryEvents({
      module: "arena",
      packageId,
      eventType: `Attended<${process.env.NEXT_PUBLIC_FUND_BASE}>`,
      nextCursor,
    });

    type ArenaFundData = {
      name: string;
      description: string;
      end_time: string;
      fund_img: string;
      fund: string;
      arena: string;
      invest_duration: string;
      start_time: string;
      trader: string;
      trader_fee: string;
      limit_amount: string;
      expected_roi: string;
    };

    const upserts = events.map((event) => {
      console.log(event);
      const data: ArenaFundData = event.parsedJson as ArenaFundData;
      const timestamp = event.timestampMs ?? "0";

      const start_time = Number(data.start_time);
      const end_time = Number(data.end_time);
      const invest_end_time = start_time + Number(data.invest_duration);
      const trade_duration = end_time - invest_end_time;

      const object: {
        object_id: string;
        name: string;
        description: string;
        start_time: number;
        end_time: number;
        invest_end_time: number;
        trade_duration: number;
        image_blob_id: string;
        arena_object_id: string;
        trader_fee: number;
        owner_id: string;
        limit_amount: number;
        expected_roi: number;
        event_seq: number;
        tx_digest: string;
        timestamp: number;
      } = {
        object_id: data.fund,
        name: data.name,
        description: data.description,
        start_time,
        end_time,
        invest_end_time,
        trade_duration,
        image_blob_id: data.fund_img,
        arena_object_id: data.arena,
        trader_fee: Number(data.trader_fee) / 100,
        owner_id: data.trader,
        limit_amount: Number(data.limit_amount),
        expected_roi: Number(data.expected_roi) / 100,
        event_seq: Number(event.id.eventSeq),
        tx_digest: event.id.txDigest,
        timestamp: Number(timestamp),
      };
      return this.prisma.fund.upsert({
        where: {
          object_id: data.fund,
          event_seq: Number(event.id.eventSeq),
          tx_digest: event.id.txDigest,
        },
        update: object,
        create: object,
      });
    });
    const result = await this.prisma.$transaction(upserts);
    return result;
  }

  async upsertInvestedEvents() {
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ASSET;
    if (!packageId) {
      throw new Error("Package not found");
    }
    const fundHistory = await this.prisma.fund_history.findFirst({
      where: {
        action: "Invested",
      },
      orderBy: {
        timestamp: "desc",
      },
      select: {
        tx_digest: true,
        event_seq: true,
      },
    });
    const nextCursor: PaginatedEvents["nextCursor"] = fundHistory
      ? {
          txDigest: fundHistory.tx_digest,
          eventSeq: fundHistory.event_seq.toString(),
        }
      : undefined;
    const events = await this.queryEvents({
      module: "fund_share",
      packageId,
      eventType: "Invested",
      nextCursor,
    });
    console.log(events);

    type InvestedData = {
      fund_id: string;
      invest_amount: string;
      investor: string;
      share_id: string;
    };

    const upserts = events.map((event) => {
      console.log(event);
      const data: InvestedData = event.parsedJson as InvestedData;
      const timestamp = event.timestampMs ?? "0";

      const object: {
        share_id: string;
        action: string;
        fund_object_id: string;
        redeemed: boolean;
        amount: number;
        investor: string;
        event_seq: number;
        tx_digest: string;
        timestamp: number;
      } = {
        share_id: data.share_id,
        action: "Invested",
        fund_object_id: data.fund_id,
        redeemed: false,
        amount: Number(data.invest_amount),
        investor: data.investor,
        event_seq: Number(event.id.eventSeq),
        tx_digest: event.id.txDigest,
        timestamp: Number(timestamp),
      };

      return this.prisma.fund_history.create({
        data: object,
      });
    });
    const result = await this.prisma.$transaction(upserts);
    return result;
  }

  async upsertDeinvestedEvents() {
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ASSET;
    if (!packageId) {
      throw new Error("Package not found");
    }
    const fundHistory = await this.prisma.fund_history.findFirst({
      where: {
        action: "Deinvested",
      },
      orderBy: {
        timestamp: "desc",
      },
      select: {
        tx_digest: true,
        event_seq: true,
      },
    });
    const nextCursor: PaginatedEvents["nextCursor"] = fundHistory
      ? {
          txDigest: fundHistory.tx_digest,
          eventSeq: fundHistory.event_seq.toString(),
        }
      : undefined;
    const events = await this.queryEvents({
      module: "fund",
      packageId,
      eventType: "Deinvested",
      nextCursor,
    });
    console.log(events);

    type DeinvestedData = {
      fund_id: string;
      withdraw_invest_amount: string;
      investor: string;
      remain_share: string;
    };

    const upserts = await Promise.all(
      events.map(async (event) => {
        console.log(event);
        const data: DeinvestedData = event.parsedJson as DeinvestedData;
        const timestamp = event.timestampMs ?? "0";

        const object: {
          share_id: string;
          action: string;
          fund_object_id: string;
          redeemed: boolean;
          amount: number;
          investor: string;
          event_seq: number;
          tx_digest: string;
          timestamp: number;
        } = {
          share_id: data.remain_share ?? uuid(),
          action: "Deinvested",
          fund_object_id: data.fund_id,
          redeemed: data.remain_share ? false : true,
          amount: Number(data.withdraw_invest_amount),
          investor: data.investor,
          event_seq: Number(event.id.eventSeq),
          tx_digest: event.id.txDigest,
          timestamp: Number(timestamp),
        };

        const share = await this.prisma.fund_history.findFirst({
          where: {
            share_id: object.share_id,
          },
        });

        const executions = [];
        executions.push(
          this.prisma.fund_history.updateMany({
            where: {
              AND: [
                {
                  NOT: {
                    share_id: { equals: object.share_id ?? "" },
                  },
                },
                {
                  fund_object_id: {
                    equals: data.fund_id,
                  },
                },
                {
                  redeemed: {
                    equals: false,
                  },
                },
              ],
            },
            data: {
              redeemed: true,
            },
          }),
        );

        if (share) {
          executions.push(
            this.prisma.fund_history.create({
              data: {
                ...object,
                share_id: uuid(),
                redeemed: true,
              },
            }),
          );
        } else {
          executions.push(
            this.prisma.fund_history.create({
              data: object,
            }),
          );
        }

        return executions;
      }),
    );
    const result = await this.prisma.$transaction(upserts.flatMap((x) => x));
    return result;
  }

  async upsertSettleEvents() {
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ASSET;
    if (!packageId) {
      throw new Error("Package not found");
    }
    const settleResult = await this.prisma.settle_result.findFirst({
      orderBy: [
        {
          timestamp: "desc",
        },
        {
          event_seq: "desc",
        },
      ],

      select: {
        tx_digest: true,
        event_seq: true,
      },
    });
    const nextCursor: PaginatedEvents["nextCursor"] = settleResult
      ? {
          txDigest: settleResult.tx_digest,
          eventSeq: settleResult.event_seq.toString(),
        }
      : undefined;
    const events = await this.queryEvents({
      module: "fund",
      packageId,
      eventType: "SettleResult",
      nextCursor,
    });
    console.log(events);

    type SettleResultData = {
      fund: string;
      trader: string;
      is_matched_roi: boolean;
    };

    const upserts = events.map((event) => {
      console.log(event);
      const data: SettleResultData = event.parsedJson as SettleResultData;
      const timestamp = event.timestampMs ?? "0";

      const object: {
        fund_object_id: string;
        trader_id: string;
        match_roi: boolean;
        roi: number;
        event_seq: number;
        tx_digest: string;
        timestamp: number;
      } = {
        fund_object_id: data.fund,
        trader_id: data.trader,
        match_roi: data.is_matched_roi,
        roi: 0,
        event_seq: Number(event.id.eventSeq),
        tx_digest: event.id.txDigest,
        timestamp: Number(timestamp),
      };
      return this.prisma.settle_result.upsert({
        where: {
          fund_object_id: data.fund,
          event_seq: Number(event.id.eventSeq),
          tx_digest: event.id.txDigest,
        },
        update: object,
        create: object,
      });
    });

    const result = await this.prisma.$transaction(upserts);
    return result;
  }

  async upsertSwapEvents() {
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ASSET;
    if (!packageId) {
      throw new Error("Package not found");
    }
    const traderOperation = await this.prisma.trader_operation.findFirst({
      where: {
        action: "Swap",
      },
      orderBy: [
        {
          timestamp: "desc",
        },
        {
          event_seq: "desc",
        },
      ],
      select: {
        tx_digest: true,
        event_seq: true,
      },
    });
    const nextCursor: PaginatedEvents["nextCursor"] = traderOperation
      ? {
          txDigest: traderOperation.tx_digest,
          eventSeq: traderOperation.event_seq.toString(),
        }
      : undefined;
    const events = await this.queryEvents({
      module: "cetus",
      packageId,
      eventType: "Swap",
      nextCursor,
    });
    console.log(events);

    type SwapData = {
      fund: string;
      protocol: string;
      input_coin_type: {
        name: string;
      };
      input_amount: string;
      output_coin_type: {
        name: string;
      };
      output_amount: string;
    };
    console.log(events);
    const upserts = events.map((event) => {
      console.log(event);
      const data: SwapData = event.parsedJson as SwapData;
      console.log(data);
      const timestamp = event.timestampMs ?? "0";

      const object: {
        id: string;
        fund_object_id: string;
        action: string;
        protocol: string;
        token_in: string;
        amount_in: number;
        token_in2?: string;
        amount_in2?: number;
        token_out: string;
        amount_out: number;
        token_out2?: string;
        amount_out2?: number;
        event_seq: number;
        tx_digest: string;
        timestamp: number;
      } = {
        id: event.id.txDigest + Number(event.id.eventSeq),
        fund_object_id: data.fund,
        action: "Swap",
        protocol: data.protocol,
        token_in: data.input_coin_type.name,
        amount_in: Number(data.input_amount),
        token_out: data.output_coin_type.name,
        amount_out: Number(data.output_amount),
        event_seq: Number(event.id.eventSeq),
        tx_digest: event.id.txDigest,
        timestamp: Number(timestamp),
      };

      return this.prisma.trader_operation.upsert({
        where: {
          id: event.id.txDigest + Number(event.id.eventSeq),
          event_seq: Number(event.id.eventSeq),
          tx_digest: event.id.txDigest,
        },
        update: object,
        create: object,
      });
    });
    const result = await this.prisma.$transaction(upserts);
    return result;
  }

  async upsertDepositEvents({
    protocol,
  }: {
    protocol: "Scallop" | "Bucket" | "Suilend";
  }) {
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ASSET;
    if (!packageId) {
      throw new Error("Package not found");
    }
    const traderOperation = await this.prisma.trader_operation.findFirst({
      where: {
        action: "Deposit",
        protocol,
      },
      orderBy: {
        timestamp: "desc",
      },
      select: {
        tx_digest: true,
        event_seq: true,
      },
    });
    const nextCursor: PaginatedEvents["nextCursor"] = traderOperation
      ? {
          txDigest: traderOperation.tx_digest,
          eventSeq: traderOperation.event_seq.toString(),
        }
      : undefined;
    const events = await this.queryEvents({
      module: protocol.toLocaleLowerCase(),
      packageId,
      eventType: "Deposited",
      nextCursor,
    });
    console.log(events);

    type DepositData = {
      fund: string;
      protocol: string;
      input_type: {
        name: string;
      };
      in_amount: string;
      output_type: {
        name: string;
      };
      output_amount: string;
    };
    console.log(events);
    const upserts = events.map((event) => {
      console.log(event);
      const data: DepositData = event.parsedJson as DepositData;
      console.log(data);
      const timestamp = event.timestampMs ?? "0";

      const object: {
        id: string;
        fund_object_id: string;
        action: string;
        protocol: string;
        token_in: string;
        amount_in: number;
        token_in2?: string;
        amount_in2?: number;
        token_out: string;
        amount_out: number;
        token_out2?: string;
        amount_out2?: number;
        event_seq: number;
        tx_digest: string;
        timestamp: number;
      } = {
        id: event.id.txDigest + Number(event.id.eventSeq),
        fund_object_id: data.fund,
        action: "Deposit",
        protocol: data.protocol,
        token_in: data.input_type.name,
        amount_in: Number(data.in_amount),
        token_out: data.output_type.name,
        amount_out: Number(data.output_amount),
        event_seq: Number(event.id.eventSeq),
        tx_digest: event.id.txDigest,
        timestamp: Number(timestamp),
      };

      return this.prisma.trader_operation.upsert({
        where: {
          id: event.id.txDigest + Number(event.id.eventSeq),
          event_seq: Number(event.id.eventSeq),
          tx_digest: event.id.txDigest,
        },
        update: object,
        create: object,
      });
    });
    const result = await this.prisma.$transaction(upserts);
    return result;
  }

  async upsertWithdrawEvents({
    protocol,
  }: {
    protocol: "Scallop" | "Bucket" | "Suilend";
  }) {
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ASSET;
    if (!packageId) {
      throw new Error("Package not found");
    }
    const traderOperation = await this.prisma.trader_operation.findFirst({
      where: {
        action: "Withdraw",
        protocol,
      },
      orderBy: {
        timestamp: "desc",
      },
      select: {
        tx_digest: true,
        event_seq: true,
      },
    });
    const nextCursor: PaginatedEvents["nextCursor"] = traderOperation
      ? {
          txDigest: traderOperation.tx_digest,
          eventSeq: traderOperation.event_seq.toString(),
        }
      : undefined;
    const events = await this.queryEvents({
      module: protocol.toLocaleLowerCase(),
      packageId,
      eventType: "Withdrawed",
      nextCursor,
    });
    console.log(events);

    type WithdrawData = {
      fund: string;
      protocol: string;
      input_type: {
        name: string;
      };
      in_amount: string;
      output_type: {
        name: string;
      };
      output_amount: string;
    };

    type BucketWithdrawData = {
      fund: string;
      protocol: string;
      input_type: {
        name: string;
      };
      in_amount: string;
      output_type1: {
        name: string;
      };
      output_amount1: string;
      output_type2: {
        name: string;
      };
      output_amount2: string;
    };

    console.log(events);
    const upserts = events.map((event) => {
      if (protocol === "Bucket") {
        console.log(event);
        const data: BucketWithdrawData = event.parsedJson as BucketWithdrawData;
        console.log(data);
        const timestamp = event.timestampMs ?? "0";

        const bucketObject: {
          id: string;
          fund_object_id: string;
          action: string;
          protocol: string;
          token_in: string;
          amount_in: number;
          token_in2?: string;
          amount_in2?: number;
          token_out: string;
          amount_out: number;
          token_out2?: string;
          amount_out2?: number;
          event_seq: number;
          tx_digest: string;
          timestamp: number;
        } = {
          id: event.id.txDigest + Number(event.id.eventSeq),
          fund_object_id: data.fund,
          action: "Withdraw",
          protocol: data.protocol,
          token_in: data.input_type.name,
          amount_in: Number(data.in_amount),
          token_out: data.output_type1.name,
          amount_out: Number(data.output_amount1),
          token_out2: data.output_type2.name,
          amount_out2: Number(data.output_amount2),
          event_seq: Number(event.id.eventSeq),
          tx_digest: event.id.txDigest,
          timestamp: Number(timestamp),
        };

        return this.prisma.trader_operation.upsert({
          where: {
            id: event.id.txDigest + Number(event.id.eventSeq),
            event_seq: Number(event.id.eventSeq),
            tx_digest: event.id.txDigest,
          },
          update: bucketObject,
          create: bucketObject,
        });
      } else {
        console.log(event);
        const data: WithdrawData = event.parsedJson as WithdrawData;
        console.log(data);
        const timestamp = event.timestampMs ?? "0";

        const object: {
          id: string;
          fund_object_id: string;
          action: string;
          protocol: string;
          token_in: string;
          amount_in: number;
          token_in2?: string;
          amount_in2?: number;
          token_out: string;
          amount_out: number;
          token_out2?: string;
          amount_out2?: number;
          event_seq: number;
          tx_digest: string;
          timestamp: number;
        } = {
          id: event.id.txDigest + Number(event.id.eventSeq),
          fund_object_id: data.fund,
          action: "Withdraw",
          protocol: data.protocol,
          token_in: data.input_type.name,
          amount_in: Number(data.in_amount),
          token_out: data.output_type.name,
          amount_out: Number(data.output_amount),
          event_seq: Number(event.id.eventSeq),
          tx_digest: event.id.txDigest,
          timestamp: Number(timestamp),
        };

        return this.prisma.trader_operation.upsert({
          where: {
            id: event.id.txDigest + Number(event.id.eventSeq),
            event_seq: Number(event.id.eventSeq),
            tx_digest: event.id.txDigest,
          },
          update: object,
          create: object,
        });
      }
    });
    const result = await this.prisma.$transaction(upserts);
    return result;
  }

  async upsertClaimEvents() {
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ASSET;
    if (!packageId) {
      throw new Error("Package not found");
    }
    const claimResult = await this.prisma.claim_result.findFirst({
      orderBy: [
        {
          timestamp: "desc",
        },
        {
          event_seq: "desc",
        },
      ],

      select: {
        tx_digest: true,
        event_seq: true,
      },
    });
    const nextCursor: PaginatedEvents["nextCursor"] = claimResult
      ? {
          txDigest: claimResult.tx_digest,
          eventSeq: claimResult.event_seq.toString(),
        }
      : undefined;
    const events = await this.queryEvents({
      module: "fund",
      packageId,
      eventType: `Claimed<${process.env.NEXT_PUBLIC_FUND_BASE}>`,
      nextCursor,
    });
    console.log(events);

    type ClaimedResultData = {
      fund: string;
      receiver: string;
      amount: string;
      shares: string[];
    };

    const upserts = events.map((event) => {
      console.log(event);
      const data: ClaimedResultData = event.parsedJson as ClaimedResultData;
      const timestamp = event.timestampMs ?? "0";

      const executions = [];

      const object: {
        id: string;
        fund_object_id: string;
        receiver: string;
        amount: number;
        event_seq: number;
        tx_digest: string;
        timestamp: number;
      } = {
        id: event.id.txDigest + Number(event.id.eventSeq),
        fund_object_id: data.fund,
        receiver: data.receiver,
        amount: Number(data.amount),
        event_seq: Number(event.id.eventSeq),
        tx_digest: event.id.txDigest,
        timestamp: Number(timestamp),
      };
      executions.push(
        this.prisma.claim_result.upsert({
          where: {
            id: event.id.txDigest + Number(event.id.eventSeq),
            event_seq: Number(event.id.eventSeq),
            tx_digest: event.id.txDigest,
          },
          update: object,
          create: object,
        }),
      );

      data.shares.forEach((share) => {
        console.log(share);
        executions.push(
          this.prisma.fund_history.update({
            where: {
              share_id: share,
              fund_object_id: data.fund,
            },
            data: {
              redeemed: true,
            },
          }),
        );
      });

      return executions;
    });

    const result = await this.prisma.$transaction(upserts.flatMap((x) => x));
    return result;
  }

  async upsertSponsorPoolEvents() {
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ASSET;
    if (!packageId) {
      throw new Error("Package not found");
    }
    const sponsorPool = await this.prisma.sponsor_pool.findFirst({
      orderBy: [
        {
          timestamp: "desc",
        },
        {
          event_seq: "desc",
        },
      ],

      select: {
        tx_digest: true,
        event_seq: true,
      },
    });
    const nextCursor: PaginatedEvents["nextCursor"] = sponsorPool
      ? {
          txDigest: sponsorPool.tx_digest,
          eventSeq: sponsorPool.event_seq.toString(),
        }
      : undefined;
    const events = await this.queryEvents({
      module: "voucher",
      packageId,
      eventType: `CreatedSponsorPool<${process.env.NEXT_PUBLIC_FUND_BASE}>`,
      nextCursor,
    });
    console.log(events);

    type SponsorPoolData = {
      id: string;
      init_asset_amount: string;
      sponsor_addr?: string;
    };

    const upserts = events.map((event) => {
      console.log(event);
      const data: SponsorPoolData = event.parsedJson as SponsorPoolData;
      const timestamp = event.timestampMs ?? "0";

      const object: {
        id: string;
        sponsor: string;
        init_amount: number;
        event_seq: number;
        tx_digest: string;
        timestamp: number;
      } = {
        id: data.id,
        sponsor: data.sponsor_addr ?? "",
        init_amount: Number(data.init_asset_amount),
        event_seq: Number(event.id.eventSeq),
        tx_digest: event.id.txDigest,
        timestamp: Number(timestamp),
      };

      return this.prisma.sponsor_pool.upsert({
        where: {
          id: data.id,
          event_seq: Number(event.id.eventSeq),
          tx_digest: event.id.txDigest,
        },
        update: object,
        create: object,
      });
    });

    const result = await this.prisma.$transaction(upserts);
    return result;
  }
}
