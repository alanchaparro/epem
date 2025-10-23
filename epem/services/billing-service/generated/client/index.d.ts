
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Insurer
 * 
 */
export type Insurer = $Result.DefaultSelection<Prisma.$InsurerPayload>
/**
 * Model Coverage
 * 
 */
export type Coverage = $Result.DefaultSelection<Prisma.$CoveragePayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Insurers
 * const insurers = await prisma.insurer.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Insurers
   * const insurers = await prisma.insurer.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.insurer`: Exposes CRUD operations for the **Insurer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Insurers
    * const insurers = await prisma.insurer.findMany()
    * ```
    */
  get insurer(): Prisma.InsurerDelegate<ExtArgs>;

  /**
   * `prisma.coverage`: Exposes CRUD operations for the **Coverage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Coverages
    * const coverages = await prisma.coverage.findMany()
    * ```
    */
  get coverage(): Prisma.CoverageDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Insurer: 'Insurer',
    Coverage: 'Coverage'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "insurer" | "coverage"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Insurer: {
        payload: Prisma.$InsurerPayload<ExtArgs>
        fields: Prisma.InsurerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InsurerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsurerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InsurerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsurerPayload>
          }
          findFirst: {
            args: Prisma.InsurerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsurerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InsurerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsurerPayload>
          }
          findMany: {
            args: Prisma.InsurerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsurerPayload>[]
          }
          create: {
            args: Prisma.InsurerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsurerPayload>
          }
          createMany: {
            args: Prisma.InsurerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.InsurerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsurerPayload>
          }
          update: {
            args: Prisma.InsurerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsurerPayload>
          }
          deleteMany: {
            args: Prisma.InsurerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InsurerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.InsurerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InsurerPayload>
          }
          aggregate: {
            args: Prisma.InsurerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInsurer>
          }
          groupBy: {
            args: Prisma.InsurerGroupByArgs<ExtArgs>
            result: $Utils.Optional<InsurerGroupByOutputType>[]
          }
          count: {
            args: Prisma.InsurerCountArgs<ExtArgs>
            result: $Utils.Optional<InsurerCountAggregateOutputType> | number
          }
        }
      }
      Coverage: {
        payload: Prisma.$CoveragePayload<ExtArgs>
        fields: Prisma.CoverageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CoverageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CoverageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload>
          }
          findFirst: {
            args: Prisma.CoverageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CoverageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload>
          }
          findMany: {
            args: Prisma.CoverageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload>[]
          }
          create: {
            args: Prisma.CoverageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload>
          }
          createMany: {
            args: Prisma.CoverageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.CoverageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload>
          }
          update: {
            args: Prisma.CoverageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload>
          }
          deleteMany: {
            args: Prisma.CoverageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CoverageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CoverageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload>
          }
          aggregate: {
            args: Prisma.CoverageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCoverage>
          }
          groupBy: {
            args: Prisma.CoverageGroupByArgs<ExtArgs>
            result: $Utils.Optional<CoverageGroupByOutputType>[]
          }
          count: {
            args: Prisma.CoverageCountArgs<ExtArgs>
            result: $Utils.Optional<CoverageCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type InsurerCountOutputType
   */

  export type InsurerCountOutputType = {
    coverages: number
  }

  export type InsurerCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    coverages?: boolean | InsurerCountOutputTypeCountCoveragesArgs
  }

  // Custom InputTypes
  /**
   * InsurerCountOutputType without action
   */
  export type InsurerCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InsurerCountOutputType
     */
    select?: InsurerCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * InsurerCountOutputType without action
   */
  export type InsurerCountOutputTypeCountCoveragesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CoverageWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Insurer
   */

  export type AggregateInsurer = {
    _count: InsurerCountAggregateOutputType | null
    _min: InsurerMinAggregateOutputType | null
    _max: InsurerMaxAggregateOutputType | null
  }

  export type InsurerMinAggregateOutputType = {
    id: string | null
    name: string | null
    planCode: string | null
    active: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InsurerMaxAggregateOutputType = {
    id: string | null
    name: string | null
    planCode: string | null
    active: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InsurerCountAggregateOutputType = {
    id: number
    name: number
    planCode: number
    active: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type InsurerMinAggregateInputType = {
    id?: true
    name?: true
    planCode?: true
    active?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InsurerMaxAggregateInputType = {
    id?: true
    name?: true
    planCode?: true
    active?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InsurerCountAggregateInputType = {
    id?: true
    name?: true
    planCode?: true
    active?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type InsurerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Insurer to aggregate.
     */
    where?: InsurerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Insurers to fetch.
     */
    orderBy?: InsurerOrderByWithRelationInput | InsurerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InsurerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Insurers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Insurers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Insurers
    **/
    _count?: true | InsurerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InsurerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InsurerMaxAggregateInputType
  }

  export type GetInsurerAggregateType<T extends InsurerAggregateArgs> = {
        [P in keyof T & keyof AggregateInsurer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInsurer[P]>
      : GetScalarType<T[P], AggregateInsurer[P]>
  }




  export type InsurerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InsurerWhereInput
    orderBy?: InsurerOrderByWithAggregationInput | InsurerOrderByWithAggregationInput[]
    by: InsurerScalarFieldEnum[] | InsurerScalarFieldEnum
    having?: InsurerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InsurerCountAggregateInputType | true
    _min?: InsurerMinAggregateInputType
    _max?: InsurerMaxAggregateInputType
  }

  export type InsurerGroupByOutputType = {
    id: string
    name: string
    planCode: string
    active: boolean
    createdAt: Date
    updatedAt: Date
    _count: InsurerCountAggregateOutputType | null
    _min: InsurerMinAggregateOutputType | null
    _max: InsurerMaxAggregateOutputType | null
  }

  type GetInsurerGroupByPayload<T extends InsurerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InsurerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InsurerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InsurerGroupByOutputType[P]>
            : GetScalarType<T[P], InsurerGroupByOutputType[P]>
        }
      >
    >


  export type InsurerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    planCode?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    coverages?: boolean | Insurer$coveragesArgs<ExtArgs>
    _count?: boolean | InsurerCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["insurer"]>


  export type InsurerSelectScalar = {
    id?: boolean
    name?: boolean
    planCode?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type InsurerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    coverages?: boolean | Insurer$coveragesArgs<ExtArgs>
    _count?: boolean | InsurerCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $InsurerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Insurer"
    objects: {
      coverages: Prisma.$CoveragePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      planCode: string
      active: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["insurer"]>
    composites: {}
  }

  type InsurerGetPayload<S extends boolean | null | undefined | InsurerDefaultArgs> = $Result.GetResult<Prisma.$InsurerPayload, S>

  type InsurerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<InsurerFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: InsurerCountAggregateInputType | true
    }

  export interface InsurerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Insurer'], meta: { name: 'Insurer' } }
    /**
     * Find zero or one Insurer that matches the filter.
     * @param {InsurerFindUniqueArgs} args - Arguments to find a Insurer
     * @example
     * // Get one Insurer
     * const insurer = await prisma.insurer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InsurerFindUniqueArgs>(args: SelectSubset<T, InsurerFindUniqueArgs<ExtArgs>>): Prisma__InsurerClient<$Result.GetResult<Prisma.$InsurerPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Insurer that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {InsurerFindUniqueOrThrowArgs} args - Arguments to find a Insurer
     * @example
     * // Get one Insurer
     * const insurer = await prisma.insurer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InsurerFindUniqueOrThrowArgs>(args: SelectSubset<T, InsurerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InsurerClient<$Result.GetResult<Prisma.$InsurerPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Insurer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsurerFindFirstArgs} args - Arguments to find a Insurer
     * @example
     * // Get one Insurer
     * const insurer = await prisma.insurer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InsurerFindFirstArgs>(args?: SelectSubset<T, InsurerFindFirstArgs<ExtArgs>>): Prisma__InsurerClient<$Result.GetResult<Prisma.$InsurerPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Insurer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsurerFindFirstOrThrowArgs} args - Arguments to find a Insurer
     * @example
     * // Get one Insurer
     * const insurer = await prisma.insurer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InsurerFindFirstOrThrowArgs>(args?: SelectSubset<T, InsurerFindFirstOrThrowArgs<ExtArgs>>): Prisma__InsurerClient<$Result.GetResult<Prisma.$InsurerPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Insurers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsurerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Insurers
     * const insurers = await prisma.insurer.findMany()
     * 
     * // Get first 10 Insurers
     * const insurers = await prisma.insurer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const insurerWithIdOnly = await prisma.insurer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InsurerFindManyArgs>(args?: SelectSubset<T, InsurerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InsurerPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Insurer.
     * @param {InsurerCreateArgs} args - Arguments to create a Insurer.
     * @example
     * // Create one Insurer
     * const Insurer = await prisma.insurer.create({
     *   data: {
     *     // ... data to create a Insurer
     *   }
     * })
     * 
     */
    create<T extends InsurerCreateArgs>(args: SelectSubset<T, InsurerCreateArgs<ExtArgs>>): Prisma__InsurerClient<$Result.GetResult<Prisma.$InsurerPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Insurers.
     * @param {InsurerCreateManyArgs} args - Arguments to create many Insurers.
     * @example
     * // Create many Insurers
     * const insurer = await prisma.insurer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InsurerCreateManyArgs>(args?: SelectSubset<T, InsurerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Insurer.
     * @param {InsurerDeleteArgs} args - Arguments to delete one Insurer.
     * @example
     * // Delete one Insurer
     * const Insurer = await prisma.insurer.delete({
     *   where: {
     *     // ... filter to delete one Insurer
     *   }
     * })
     * 
     */
    delete<T extends InsurerDeleteArgs>(args: SelectSubset<T, InsurerDeleteArgs<ExtArgs>>): Prisma__InsurerClient<$Result.GetResult<Prisma.$InsurerPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Insurer.
     * @param {InsurerUpdateArgs} args - Arguments to update one Insurer.
     * @example
     * // Update one Insurer
     * const insurer = await prisma.insurer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InsurerUpdateArgs>(args: SelectSubset<T, InsurerUpdateArgs<ExtArgs>>): Prisma__InsurerClient<$Result.GetResult<Prisma.$InsurerPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Insurers.
     * @param {InsurerDeleteManyArgs} args - Arguments to filter Insurers to delete.
     * @example
     * // Delete a few Insurers
     * const { count } = await prisma.insurer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InsurerDeleteManyArgs>(args?: SelectSubset<T, InsurerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Insurers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsurerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Insurers
     * const insurer = await prisma.insurer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InsurerUpdateManyArgs>(args: SelectSubset<T, InsurerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Insurer.
     * @param {InsurerUpsertArgs} args - Arguments to update or create a Insurer.
     * @example
     * // Update or create a Insurer
     * const insurer = await prisma.insurer.upsert({
     *   create: {
     *     // ... data to create a Insurer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Insurer we want to update
     *   }
     * })
     */
    upsert<T extends InsurerUpsertArgs>(args: SelectSubset<T, InsurerUpsertArgs<ExtArgs>>): Prisma__InsurerClient<$Result.GetResult<Prisma.$InsurerPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Insurers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsurerCountArgs} args - Arguments to filter Insurers to count.
     * @example
     * // Count the number of Insurers
     * const count = await prisma.insurer.count({
     *   where: {
     *     // ... the filter for the Insurers we want to count
     *   }
     * })
    **/
    count<T extends InsurerCountArgs>(
      args?: Subset<T, InsurerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InsurerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Insurer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsurerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InsurerAggregateArgs>(args: Subset<T, InsurerAggregateArgs>): Prisma.PrismaPromise<GetInsurerAggregateType<T>>

    /**
     * Group by Insurer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InsurerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InsurerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InsurerGroupByArgs['orderBy'] }
        : { orderBy?: InsurerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InsurerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInsurerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Insurer model
   */
  readonly fields: InsurerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Insurer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InsurerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    coverages<T extends Insurer$coveragesArgs<ExtArgs> = {}>(args?: Subset<T, Insurer$coveragesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Insurer model
   */ 
  interface InsurerFieldRefs {
    readonly id: FieldRef<"Insurer", 'String'>
    readonly name: FieldRef<"Insurer", 'String'>
    readonly planCode: FieldRef<"Insurer", 'String'>
    readonly active: FieldRef<"Insurer", 'Boolean'>
    readonly createdAt: FieldRef<"Insurer", 'DateTime'>
    readonly updatedAt: FieldRef<"Insurer", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Insurer findUnique
   */
  export type InsurerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insurer
     */
    select?: InsurerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsurerInclude<ExtArgs> | null
    /**
     * Filter, which Insurer to fetch.
     */
    where: InsurerWhereUniqueInput
  }

  /**
   * Insurer findUniqueOrThrow
   */
  export type InsurerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insurer
     */
    select?: InsurerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsurerInclude<ExtArgs> | null
    /**
     * Filter, which Insurer to fetch.
     */
    where: InsurerWhereUniqueInput
  }

  /**
   * Insurer findFirst
   */
  export type InsurerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insurer
     */
    select?: InsurerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsurerInclude<ExtArgs> | null
    /**
     * Filter, which Insurer to fetch.
     */
    where?: InsurerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Insurers to fetch.
     */
    orderBy?: InsurerOrderByWithRelationInput | InsurerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Insurers.
     */
    cursor?: InsurerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Insurers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Insurers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Insurers.
     */
    distinct?: InsurerScalarFieldEnum | InsurerScalarFieldEnum[]
  }

  /**
   * Insurer findFirstOrThrow
   */
  export type InsurerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insurer
     */
    select?: InsurerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsurerInclude<ExtArgs> | null
    /**
     * Filter, which Insurer to fetch.
     */
    where?: InsurerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Insurers to fetch.
     */
    orderBy?: InsurerOrderByWithRelationInput | InsurerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Insurers.
     */
    cursor?: InsurerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Insurers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Insurers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Insurers.
     */
    distinct?: InsurerScalarFieldEnum | InsurerScalarFieldEnum[]
  }

  /**
   * Insurer findMany
   */
  export type InsurerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insurer
     */
    select?: InsurerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsurerInclude<ExtArgs> | null
    /**
     * Filter, which Insurers to fetch.
     */
    where?: InsurerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Insurers to fetch.
     */
    orderBy?: InsurerOrderByWithRelationInput | InsurerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Insurers.
     */
    cursor?: InsurerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Insurers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Insurers.
     */
    skip?: number
    distinct?: InsurerScalarFieldEnum | InsurerScalarFieldEnum[]
  }

  /**
   * Insurer create
   */
  export type InsurerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insurer
     */
    select?: InsurerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsurerInclude<ExtArgs> | null
    /**
     * The data needed to create a Insurer.
     */
    data: XOR<InsurerCreateInput, InsurerUncheckedCreateInput>
  }

  /**
   * Insurer createMany
   */
  export type InsurerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Insurers.
     */
    data: InsurerCreateManyInput | InsurerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Insurer update
   */
  export type InsurerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insurer
     */
    select?: InsurerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsurerInclude<ExtArgs> | null
    /**
     * The data needed to update a Insurer.
     */
    data: XOR<InsurerUpdateInput, InsurerUncheckedUpdateInput>
    /**
     * Choose, which Insurer to update.
     */
    where: InsurerWhereUniqueInput
  }

  /**
   * Insurer updateMany
   */
  export type InsurerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Insurers.
     */
    data: XOR<InsurerUpdateManyMutationInput, InsurerUncheckedUpdateManyInput>
    /**
     * Filter which Insurers to update
     */
    where?: InsurerWhereInput
  }

  /**
   * Insurer upsert
   */
  export type InsurerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insurer
     */
    select?: InsurerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsurerInclude<ExtArgs> | null
    /**
     * The filter to search for the Insurer to update in case it exists.
     */
    where: InsurerWhereUniqueInput
    /**
     * In case the Insurer found by the `where` argument doesn't exist, create a new Insurer with this data.
     */
    create: XOR<InsurerCreateInput, InsurerUncheckedCreateInput>
    /**
     * In case the Insurer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InsurerUpdateInput, InsurerUncheckedUpdateInput>
  }

  /**
   * Insurer delete
   */
  export type InsurerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insurer
     */
    select?: InsurerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsurerInclude<ExtArgs> | null
    /**
     * Filter which Insurer to delete.
     */
    where: InsurerWhereUniqueInput
  }

  /**
   * Insurer deleteMany
   */
  export type InsurerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Insurers to delete
     */
    where?: InsurerWhereInput
  }

  /**
   * Insurer.coverages
   */
  export type Insurer$coveragesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverageInclude<ExtArgs> | null
    where?: CoverageWhereInput
    orderBy?: CoverageOrderByWithRelationInput | CoverageOrderByWithRelationInput[]
    cursor?: CoverageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CoverageScalarFieldEnum | CoverageScalarFieldEnum[]
  }

  /**
   * Insurer without action
   */
  export type InsurerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Insurer
     */
    select?: InsurerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InsurerInclude<ExtArgs> | null
  }


  /**
   * Model Coverage
   */

  export type AggregateCoverage = {
    _count: CoverageCountAggregateOutputType | null
    _avg: CoverageAvgAggregateOutputType | null
    _sum: CoverageSumAggregateOutputType | null
    _min: CoverageMinAggregateOutputType | null
    _max: CoverageMaxAggregateOutputType | null
  }

  export type CoverageAvgAggregateOutputType = {
    copay: Decimal | null
  }

  export type CoverageSumAggregateOutputType = {
    copay: Decimal | null
  }

  export type CoverageMinAggregateOutputType = {
    id: string | null
    insurerId: string | null
    serviceItemId: string | null
    copay: Decimal | null
    requiresAuth: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CoverageMaxAggregateOutputType = {
    id: string | null
    insurerId: string | null
    serviceItemId: string | null
    copay: Decimal | null
    requiresAuth: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CoverageCountAggregateOutputType = {
    id: number
    insurerId: number
    serviceItemId: number
    copay: number
    requiresAuth: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CoverageAvgAggregateInputType = {
    copay?: true
  }

  export type CoverageSumAggregateInputType = {
    copay?: true
  }

  export type CoverageMinAggregateInputType = {
    id?: true
    insurerId?: true
    serviceItemId?: true
    copay?: true
    requiresAuth?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CoverageMaxAggregateInputType = {
    id?: true
    insurerId?: true
    serviceItemId?: true
    copay?: true
    requiresAuth?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CoverageCountAggregateInputType = {
    id?: true
    insurerId?: true
    serviceItemId?: true
    copay?: true
    requiresAuth?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CoverageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Coverage to aggregate.
     */
    where?: CoverageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coverages to fetch.
     */
    orderBy?: CoverageOrderByWithRelationInput | CoverageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CoverageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coverages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coverages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Coverages
    **/
    _count?: true | CoverageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CoverageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CoverageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CoverageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CoverageMaxAggregateInputType
  }

  export type GetCoverageAggregateType<T extends CoverageAggregateArgs> = {
        [P in keyof T & keyof AggregateCoverage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCoverage[P]>
      : GetScalarType<T[P], AggregateCoverage[P]>
  }




  export type CoverageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CoverageWhereInput
    orderBy?: CoverageOrderByWithAggregationInput | CoverageOrderByWithAggregationInput[]
    by: CoverageScalarFieldEnum[] | CoverageScalarFieldEnum
    having?: CoverageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CoverageCountAggregateInputType | true
    _avg?: CoverageAvgAggregateInputType
    _sum?: CoverageSumAggregateInputType
    _min?: CoverageMinAggregateInputType
    _max?: CoverageMaxAggregateInputType
  }

  export type CoverageGroupByOutputType = {
    id: string
    insurerId: string
    serviceItemId: string
    copay: Decimal
    requiresAuth: boolean
    createdAt: Date
    updatedAt: Date
    _count: CoverageCountAggregateOutputType | null
    _avg: CoverageAvgAggregateOutputType | null
    _sum: CoverageSumAggregateOutputType | null
    _min: CoverageMinAggregateOutputType | null
    _max: CoverageMaxAggregateOutputType | null
  }

  type GetCoverageGroupByPayload<T extends CoverageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CoverageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CoverageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CoverageGroupByOutputType[P]>
            : GetScalarType<T[P], CoverageGroupByOutputType[P]>
        }
      >
    >


  export type CoverageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    insurerId?: boolean
    serviceItemId?: boolean
    copay?: boolean
    requiresAuth?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    insurer?: boolean | InsurerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["coverage"]>


  export type CoverageSelectScalar = {
    id?: boolean
    insurerId?: boolean
    serviceItemId?: boolean
    copay?: boolean
    requiresAuth?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CoverageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    insurer?: boolean | InsurerDefaultArgs<ExtArgs>
  }

  export type $CoveragePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Coverage"
    objects: {
      insurer: Prisma.$InsurerPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      insurerId: string
      serviceItemId: string
      copay: Prisma.Decimal
      requiresAuth: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["coverage"]>
    composites: {}
  }

  type CoverageGetPayload<S extends boolean | null | undefined | CoverageDefaultArgs> = $Result.GetResult<Prisma.$CoveragePayload, S>

  type CoverageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CoverageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CoverageCountAggregateInputType | true
    }

  export interface CoverageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Coverage'], meta: { name: 'Coverage' } }
    /**
     * Find zero or one Coverage that matches the filter.
     * @param {CoverageFindUniqueArgs} args - Arguments to find a Coverage
     * @example
     * // Get one Coverage
     * const coverage = await prisma.coverage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CoverageFindUniqueArgs>(args: SelectSubset<T, CoverageFindUniqueArgs<ExtArgs>>): Prisma__CoverageClient<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Coverage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CoverageFindUniqueOrThrowArgs} args - Arguments to find a Coverage
     * @example
     * // Get one Coverage
     * const coverage = await prisma.coverage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CoverageFindUniqueOrThrowArgs>(args: SelectSubset<T, CoverageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CoverageClient<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Coverage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageFindFirstArgs} args - Arguments to find a Coverage
     * @example
     * // Get one Coverage
     * const coverage = await prisma.coverage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CoverageFindFirstArgs>(args?: SelectSubset<T, CoverageFindFirstArgs<ExtArgs>>): Prisma__CoverageClient<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Coverage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageFindFirstOrThrowArgs} args - Arguments to find a Coverage
     * @example
     * // Get one Coverage
     * const coverage = await prisma.coverage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CoverageFindFirstOrThrowArgs>(args?: SelectSubset<T, CoverageFindFirstOrThrowArgs<ExtArgs>>): Prisma__CoverageClient<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Coverages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Coverages
     * const coverages = await prisma.coverage.findMany()
     * 
     * // Get first 10 Coverages
     * const coverages = await prisma.coverage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const coverageWithIdOnly = await prisma.coverage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CoverageFindManyArgs>(args?: SelectSubset<T, CoverageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Coverage.
     * @param {CoverageCreateArgs} args - Arguments to create a Coverage.
     * @example
     * // Create one Coverage
     * const Coverage = await prisma.coverage.create({
     *   data: {
     *     // ... data to create a Coverage
     *   }
     * })
     * 
     */
    create<T extends CoverageCreateArgs>(args: SelectSubset<T, CoverageCreateArgs<ExtArgs>>): Prisma__CoverageClient<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Coverages.
     * @param {CoverageCreateManyArgs} args - Arguments to create many Coverages.
     * @example
     * // Create many Coverages
     * const coverage = await prisma.coverage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CoverageCreateManyArgs>(args?: SelectSubset<T, CoverageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Coverage.
     * @param {CoverageDeleteArgs} args - Arguments to delete one Coverage.
     * @example
     * // Delete one Coverage
     * const Coverage = await prisma.coverage.delete({
     *   where: {
     *     // ... filter to delete one Coverage
     *   }
     * })
     * 
     */
    delete<T extends CoverageDeleteArgs>(args: SelectSubset<T, CoverageDeleteArgs<ExtArgs>>): Prisma__CoverageClient<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Coverage.
     * @param {CoverageUpdateArgs} args - Arguments to update one Coverage.
     * @example
     * // Update one Coverage
     * const coverage = await prisma.coverage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CoverageUpdateArgs>(args: SelectSubset<T, CoverageUpdateArgs<ExtArgs>>): Prisma__CoverageClient<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Coverages.
     * @param {CoverageDeleteManyArgs} args - Arguments to filter Coverages to delete.
     * @example
     * // Delete a few Coverages
     * const { count } = await prisma.coverage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CoverageDeleteManyArgs>(args?: SelectSubset<T, CoverageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Coverages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Coverages
     * const coverage = await prisma.coverage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CoverageUpdateManyArgs>(args: SelectSubset<T, CoverageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Coverage.
     * @param {CoverageUpsertArgs} args - Arguments to update or create a Coverage.
     * @example
     * // Update or create a Coverage
     * const coverage = await prisma.coverage.upsert({
     *   create: {
     *     // ... data to create a Coverage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Coverage we want to update
     *   }
     * })
     */
    upsert<T extends CoverageUpsertArgs>(args: SelectSubset<T, CoverageUpsertArgs<ExtArgs>>): Prisma__CoverageClient<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Coverages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageCountArgs} args - Arguments to filter Coverages to count.
     * @example
     * // Count the number of Coverages
     * const count = await prisma.coverage.count({
     *   where: {
     *     // ... the filter for the Coverages we want to count
     *   }
     * })
    **/
    count<T extends CoverageCountArgs>(
      args?: Subset<T, CoverageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CoverageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Coverage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CoverageAggregateArgs>(args: Subset<T, CoverageAggregateArgs>): Prisma.PrismaPromise<GetCoverageAggregateType<T>>

    /**
     * Group by Coverage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CoverageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CoverageGroupByArgs['orderBy'] }
        : { orderBy?: CoverageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CoverageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCoverageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Coverage model
   */
  readonly fields: CoverageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Coverage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CoverageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    insurer<T extends InsurerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InsurerDefaultArgs<ExtArgs>>): Prisma__InsurerClient<$Result.GetResult<Prisma.$InsurerPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Coverage model
   */ 
  interface CoverageFieldRefs {
    readonly id: FieldRef<"Coverage", 'String'>
    readonly insurerId: FieldRef<"Coverage", 'String'>
    readonly serviceItemId: FieldRef<"Coverage", 'String'>
    readonly copay: FieldRef<"Coverage", 'Decimal'>
    readonly requiresAuth: FieldRef<"Coverage", 'Boolean'>
    readonly createdAt: FieldRef<"Coverage", 'DateTime'>
    readonly updatedAt: FieldRef<"Coverage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Coverage findUnique
   */
  export type CoverageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverageInclude<ExtArgs> | null
    /**
     * Filter, which Coverage to fetch.
     */
    where: CoverageWhereUniqueInput
  }

  /**
   * Coverage findUniqueOrThrow
   */
  export type CoverageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverageInclude<ExtArgs> | null
    /**
     * Filter, which Coverage to fetch.
     */
    where: CoverageWhereUniqueInput
  }

  /**
   * Coverage findFirst
   */
  export type CoverageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverageInclude<ExtArgs> | null
    /**
     * Filter, which Coverage to fetch.
     */
    where?: CoverageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coverages to fetch.
     */
    orderBy?: CoverageOrderByWithRelationInput | CoverageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Coverages.
     */
    cursor?: CoverageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coverages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coverages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Coverages.
     */
    distinct?: CoverageScalarFieldEnum | CoverageScalarFieldEnum[]
  }

  /**
   * Coverage findFirstOrThrow
   */
  export type CoverageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverageInclude<ExtArgs> | null
    /**
     * Filter, which Coverage to fetch.
     */
    where?: CoverageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coverages to fetch.
     */
    orderBy?: CoverageOrderByWithRelationInput | CoverageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Coverages.
     */
    cursor?: CoverageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coverages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coverages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Coverages.
     */
    distinct?: CoverageScalarFieldEnum | CoverageScalarFieldEnum[]
  }

  /**
   * Coverage findMany
   */
  export type CoverageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverageInclude<ExtArgs> | null
    /**
     * Filter, which Coverages to fetch.
     */
    where?: CoverageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coverages to fetch.
     */
    orderBy?: CoverageOrderByWithRelationInput | CoverageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Coverages.
     */
    cursor?: CoverageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coverages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coverages.
     */
    skip?: number
    distinct?: CoverageScalarFieldEnum | CoverageScalarFieldEnum[]
  }

  /**
   * Coverage create
   */
  export type CoverageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverageInclude<ExtArgs> | null
    /**
     * The data needed to create a Coverage.
     */
    data: XOR<CoverageCreateInput, CoverageUncheckedCreateInput>
  }

  /**
   * Coverage createMany
   */
  export type CoverageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Coverages.
     */
    data: CoverageCreateManyInput | CoverageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Coverage update
   */
  export type CoverageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverageInclude<ExtArgs> | null
    /**
     * The data needed to update a Coverage.
     */
    data: XOR<CoverageUpdateInput, CoverageUncheckedUpdateInput>
    /**
     * Choose, which Coverage to update.
     */
    where: CoverageWhereUniqueInput
  }

  /**
   * Coverage updateMany
   */
  export type CoverageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Coverages.
     */
    data: XOR<CoverageUpdateManyMutationInput, CoverageUncheckedUpdateManyInput>
    /**
     * Filter which Coverages to update
     */
    where?: CoverageWhereInput
  }

  /**
   * Coverage upsert
   */
  export type CoverageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverageInclude<ExtArgs> | null
    /**
     * The filter to search for the Coverage to update in case it exists.
     */
    where: CoverageWhereUniqueInput
    /**
     * In case the Coverage found by the `where` argument doesn't exist, create a new Coverage with this data.
     */
    create: XOR<CoverageCreateInput, CoverageUncheckedCreateInput>
    /**
     * In case the Coverage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CoverageUpdateInput, CoverageUncheckedUpdateInput>
  }

  /**
   * Coverage delete
   */
  export type CoverageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverageInclude<ExtArgs> | null
    /**
     * Filter which Coverage to delete.
     */
    where: CoverageWhereUniqueInput
  }

  /**
   * Coverage deleteMany
   */
  export type CoverageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Coverages to delete
     */
    where?: CoverageWhereInput
  }

  /**
   * Coverage without action
   */
  export type CoverageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverageInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const InsurerScalarFieldEnum: {
    id: 'id',
    name: 'name',
    planCode: 'planCode',
    active: 'active',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type InsurerScalarFieldEnum = (typeof InsurerScalarFieldEnum)[keyof typeof InsurerScalarFieldEnum]


  export const CoverageScalarFieldEnum: {
    id: 'id',
    insurerId: 'insurerId',
    serviceItemId: 'serviceItemId',
    copay: 'copay',
    requiresAuth: 'requiresAuth',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CoverageScalarFieldEnum = (typeof CoverageScalarFieldEnum)[keyof typeof CoverageScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    
  /**
   * Deep Input Types
   */


  export type InsurerWhereInput = {
    AND?: InsurerWhereInput | InsurerWhereInput[]
    OR?: InsurerWhereInput[]
    NOT?: InsurerWhereInput | InsurerWhereInput[]
    id?: StringFilter<"Insurer"> | string
    name?: StringFilter<"Insurer"> | string
    planCode?: StringFilter<"Insurer"> | string
    active?: BoolFilter<"Insurer"> | boolean
    createdAt?: DateTimeFilter<"Insurer"> | Date | string
    updatedAt?: DateTimeFilter<"Insurer"> | Date | string
    coverages?: CoverageListRelationFilter
  }

  export type InsurerOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    planCode?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    coverages?: CoverageOrderByRelationAggregateInput
  }

  export type InsurerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    planCode?: string
    AND?: InsurerWhereInput | InsurerWhereInput[]
    OR?: InsurerWhereInput[]
    NOT?: InsurerWhereInput | InsurerWhereInput[]
    name?: StringFilter<"Insurer"> | string
    active?: BoolFilter<"Insurer"> | boolean
    createdAt?: DateTimeFilter<"Insurer"> | Date | string
    updatedAt?: DateTimeFilter<"Insurer"> | Date | string
    coverages?: CoverageListRelationFilter
  }, "id" | "planCode">

  export type InsurerOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    planCode?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: InsurerCountOrderByAggregateInput
    _max?: InsurerMaxOrderByAggregateInput
    _min?: InsurerMinOrderByAggregateInput
  }

  export type InsurerScalarWhereWithAggregatesInput = {
    AND?: InsurerScalarWhereWithAggregatesInput | InsurerScalarWhereWithAggregatesInput[]
    OR?: InsurerScalarWhereWithAggregatesInput[]
    NOT?: InsurerScalarWhereWithAggregatesInput | InsurerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Insurer"> | string
    name?: StringWithAggregatesFilter<"Insurer"> | string
    planCode?: StringWithAggregatesFilter<"Insurer"> | string
    active?: BoolWithAggregatesFilter<"Insurer"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Insurer"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Insurer"> | Date | string
  }

  export type CoverageWhereInput = {
    AND?: CoverageWhereInput | CoverageWhereInput[]
    OR?: CoverageWhereInput[]
    NOT?: CoverageWhereInput | CoverageWhereInput[]
    id?: StringFilter<"Coverage"> | string
    insurerId?: StringFilter<"Coverage"> | string
    serviceItemId?: StringFilter<"Coverage"> | string
    copay?: DecimalFilter<"Coverage"> | Decimal | DecimalJsLike | number | string
    requiresAuth?: BoolFilter<"Coverage"> | boolean
    createdAt?: DateTimeFilter<"Coverage"> | Date | string
    updatedAt?: DateTimeFilter<"Coverage"> | Date | string
    insurer?: XOR<InsurerRelationFilter, InsurerWhereInput>
  }

  export type CoverageOrderByWithRelationInput = {
    id?: SortOrder
    insurerId?: SortOrder
    serviceItemId?: SortOrder
    copay?: SortOrder
    requiresAuth?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    insurer?: InsurerOrderByWithRelationInput
  }

  export type CoverageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CoverageWhereInput | CoverageWhereInput[]
    OR?: CoverageWhereInput[]
    NOT?: CoverageWhereInput | CoverageWhereInput[]
    insurerId?: StringFilter<"Coverage"> | string
    serviceItemId?: StringFilter<"Coverage"> | string
    copay?: DecimalFilter<"Coverage"> | Decimal | DecimalJsLike | number | string
    requiresAuth?: BoolFilter<"Coverage"> | boolean
    createdAt?: DateTimeFilter<"Coverage"> | Date | string
    updatedAt?: DateTimeFilter<"Coverage"> | Date | string
    insurer?: XOR<InsurerRelationFilter, InsurerWhereInput>
  }, "id">

  export type CoverageOrderByWithAggregationInput = {
    id?: SortOrder
    insurerId?: SortOrder
    serviceItemId?: SortOrder
    copay?: SortOrder
    requiresAuth?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CoverageCountOrderByAggregateInput
    _avg?: CoverageAvgOrderByAggregateInput
    _max?: CoverageMaxOrderByAggregateInput
    _min?: CoverageMinOrderByAggregateInput
    _sum?: CoverageSumOrderByAggregateInput
  }

  export type CoverageScalarWhereWithAggregatesInput = {
    AND?: CoverageScalarWhereWithAggregatesInput | CoverageScalarWhereWithAggregatesInput[]
    OR?: CoverageScalarWhereWithAggregatesInput[]
    NOT?: CoverageScalarWhereWithAggregatesInput | CoverageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Coverage"> | string
    insurerId?: StringWithAggregatesFilter<"Coverage"> | string
    serviceItemId?: StringWithAggregatesFilter<"Coverage"> | string
    copay?: DecimalWithAggregatesFilter<"Coverage"> | Decimal | DecimalJsLike | number | string
    requiresAuth?: BoolWithAggregatesFilter<"Coverage"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Coverage"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Coverage"> | Date | string
  }

  export type InsurerCreateInput = {
    id?: string
    name: string
    planCode: string
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    coverages?: CoverageCreateNestedManyWithoutInsurerInput
  }

  export type InsurerUncheckedCreateInput = {
    id?: string
    name: string
    planCode: string
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    coverages?: CoverageUncheckedCreateNestedManyWithoutInsurerInput
  }

  export type InsurerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    planCode?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coverages?: CoverageUpdateManyWithoutInsurerNestedInput
  }

  export type InsurerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    planCode?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coverages?: CoverageUncheckedUpdateManyWithoutInsurerNestedInput
  }

  export type InsurerCreateManyInput = {
    id?: string
    name: string
    planCode: string
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InsurerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    planCode?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InsurerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    planCode?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageCreateInput = {
    id?: string
    serviceItemId: string
    copay: Decimal | DecimalJsLike | number | string
    requiresAuth?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    insurer: InsurerCreateNestedOneWithoutCoveragesInput
  }

  export type CoverageUncheckedCreateInput = {
    id?: string
    insurerId: string
    serviceItemId: string
    copay: Decimal | DecimalJsLike | number | string
    requiresAuth?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CoverageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    serviceItemId?: StringFieldUpdateOperationsInput | string
    copay?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    requiresAuth?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    insurer?: InsurerUpdateOneRequiredWithoutCoveragesNestedInput
  }

  export type CoverageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    insurerId?: StringFieldUpdateOperationsInput | string
    serviceItemId?: StringFieldUpdateOperationsInput | string
    copay?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    requiresAuth?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageCreateManyInput = {
    id?: string
    insurerId: string
    serviceItemId: string
    copay: Decimal | DecimalJsLike | number | string
    requiresAuth?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CoverageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    serviceItemId?: StringFieldUpdateOperationsInput | string
    copay?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    requiresAuth?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    insurerId?: StringFieldUpdateOperationsInput | string
    serviceItemId?: StringFieldUpdateOperationsInput | string
    copay?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    requiresAuth?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CoverageListRelationFilter = {
    every?: CoverageWhereInput
    some?: CoverageWhereInput
    none?: CoverageWhereInput
  }

  export type CoverageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InsurerCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    planCode?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InsurerMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    planCode?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InsurerMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    planCode?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[]
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[]
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type InsurerRelationFilter = {
    is?: InsurerWhereInput
    isNot?: InsurerWhereInput
  }

  export type CoverageCountOrderByAggregateInput = {
    id?: SortOrder
    insurerId?: SortOrder
    serviceItemId?: SortOrder
    copay?: SortOrder
    requiresAuth?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoverageAvgOrderByAggregateInput = {
    copay?: SortOrder
  }

  export type CoverageMaxOrderByAggregateInput = {
    id?: SortOrder
    insurerId?: SortOrder
    serviceItemId?: SortOrder
    copay?: SortOrder
    requiresAuth?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoverageMinOrderByAggregateInput = {
    id?: SortOrder
    insurerId?: SortOrder
    serviceItemId?: SortOrder
    copay?: SortOrder
    requiresAuth?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoverageSumOrderByAggregateInput = {
    copay?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[]
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[]
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type CoverageCreateNestedManyWithoutInsurerInput = {
    create?: XOR<CoverageCreateWithoutInsurerInput, CoverageUncheckedCreateWithoutInsurerInput> | CoverageCreateWithoutInsurerInput[] | CoverageUncheckedCreateWithoutInsurerInput[]
    connectOrCreate?: CoverageCreateOrConnectWithoutInsurerInput | CoverageCreateOrConnectWithoutInsurerInput[]
    createMany?: CoverageCreateManyInsurerInputEnvelope
    connect?: CoverageWhereUniqueInput | CoverageWhereUniqueInput[]
  }

  export type CoverageUncheckedCreateNestedManyWithoutInsurerInput = {
    create?: XOR<CoverageCreateWithoutInsurerInput, CoverageUncheckedCreateWithoutInsurerInput> | CoverageCreateWithoutInsurerInput[] | CoverageUncheckedCreateWithoutInsurerInput[]
    connectOrCreate?: CoverageCreateOrConnectWithoutInsurerInput | CoverageCreateOrConnectWithoutInsurerInput[]
    createMany?: CoverageCreateManyInsurerInputEnvelope
    connect?: CoverageWhereUniqueInput | CoverageWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CoverageUpdateManyWithoutInsurerNestedInput = {
    create?: XOR<CoverageCreateWithoutInsurerInput, CoverageUncheckedCreateWithoutInsurerInput> | CoverageCreateWithoutInsurerInput[] | CoverageUncheckedCreateWithoutInsurerInput[]
    connectOrCreate?: CoverageCreateOrConnectWithoutInsurerInput | CoverageCreateOrConnectWithoutInsurerInput[]
    upsert?: CoverageUpsertWithWhereUniqueWithoutInsurerInput | CoverageUpsertWithWhereUniqueWithoutInsurerInput[]
    createMany?: CoverageCreateManyInsurerInputEnvelope
    set?: CoverageWhereUniqueInput | CoverageWhereUniqueInput[]
    disconnect?: CoverageWhereUniqueInput | CoverageWhereUniqueInput[]
    delete?: CoverageWhereUniqueInput | CoverageWhereUniqueInput[]
    connect?: CoverageWhereUniqueInput | CoverageWhereUniqueInput[]
    update?: CoverageUpdateWithWhereUniqueWithoutInsurerInput | CoverageUpdateWithWhereUniqueWithoutInsurerInput[]
    updateMany?: CoverageUpdateManyWithWhereWithoutInsurerInput | CoverageUpdateManyWithWhereWithoutInsurerInput[]
    deleteMany?: CoverageScalarWhereInput | CoverageScalarWhereInput[]
  }

  export type CoverageUncheckedUpdateManyWithoutInsurerNestedInput = {
    create?: XOR<CoverageCreateWithoutInsurerInput, CoverageUncheckedCreateWithoutInsurerInput> | CoverageCreateWithoutInsurerInput[] | CoverageUncheckedCreateWithoutInsurerInput[]
    connectOrCreate?: CoverageCreateOrConnectWithoutInsurerInput | CoverageCreateOrConnectWithoutInsurerInput[]
    upsert?: CoverageUpsertWithWhereUniqueWithoutInsurerInput | CoverageUpsertWithWhereUniqueWithoutInsurerInput[]
    createMany?: CoverageCreateManyInsurerInputEnvelope
    set?: CoverageWhereUniqueInput | CoverageWhereUniqueInput[]
    disconnect?: CoverageWhereUniqueInput | CoverageWhereUniqueInput[]
    delete?: CoverageWhereUniqueInput | CoverageWhereUniqueInput[]
    connect?: CoverageWhereUniqueInput | CoverageWhereUniqueInput[]
    update?: CoverageUpdateWithWhereUniqueWithoutInsurerInput | CoverageUpdateWithWhereUniqueWithoutInsurerInput[]
    updateMany?: CoverageUpdateManyWithWhereWithoutInsurerInput | CoverageUpdateManyWithWhereWithoutInsurerInput[]
    deleteMany?: CoverageScalarWhereInput | CoverageScalarWhereInput[]
  }

  export type InsurerCreateNestedOneWithoutCoveragesInput = {
    create?: XOR<InsurerCreateWithoutCoveragesInput, InsurerUncheckedCreateWithoutCoveragesInput>
    connectOrCreate?: InsurerCreateOrConnectWithoutCoveragesInput
    connect?: InsurerWhereUniqueInput
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type InsurerUpdateOneRequiredWithoutCoveragesNestedInput = {
    create?: XOR<InsurerCreateWithoutCoveragesInput, InsurerUncheckedCreateWithoutCoveragesInput>
    connectOrCreate?: InsurerCreateOrConnectWithoutCoveragesInput
    upsert?: InsurerUpsertWithoutCoveragesInput
    connect?: InsurerWhereUniqueInput
    update?: XOR<XOR<InsurerUpdateToOneWithWhereWithoutCoveragesInput, InsurerUpdateWithoutCoveragesInput>, InsurerUncheckedUpdateWithoutCoveragesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[]
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[]
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[]
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[]
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type CoverageCreateWithoutInsurerInput = {
    id?: string
    serviceItemId: string
    copay: Decimal | DecimalJsLike | number | string
    requiresAuth?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CoverageUncheckedCreateWithoutInsurerInput = {
    id?: string
    serviceItemId: string
    copay: Decimal | DecimalJsLike | number | string
    requiresAuth?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CoverageCreateOrConnectWithoutInsurerInput = {
    where: CoverageWhereUniqueInput
    create: XOR<CoverageCreateWithoutInsurerInput, CoverageUncheckedCreateWithoutInsurerInput>
  }

  export type CoverageCreateManyInsurerInputEnvelope = {
    data: CoverageCreateManyInsurerInput | CoverageCreateManyInsurerInput[]
    skipDuplicates?: boolean
  }

  export type CoverageUpsertWithWhereUniqueWithoutInsurerInput = {
    where: CoverageWhereUniqueInput
    update: XOR<CoverageUpdateWithoutInsurerInput, CoverageUncheckedUpdateWithoutInsurerInput>
    create: XOR<CoverageCreateWithoutInsurerInput, CoverageUncheckedCreateWithoutInsurerInput>
  }

  export type CoverageUpdateWithWhereUniqueWithoutInsurerInput = {
    where: CoverageWhereUniqueInput
    data: XOR<CoverageUpdateWithoutInsurerInput, CoverageUncheckedUpdateWithoutInsurerInput>
  }

  export type CoverageUpdateManyWithWhereWithoutInsurerInput = {
    where: CoverageScalarWhereInput
    data: XOR<CoverageUpdateManyMutationInput, CoverageUncheckedUpdateManyWithoutInsurerInput>
  }

  export type CoverageScalarWhereInput = {
    AND?: CoverageScalarWhereInput | CoverageScalarWhereInput[]
    OR?: CoverageScalarWhereInput[]
    NOT?: CoverageScalarWhereInput | CoverageScalarWhereInput[]
    id?: StringFilter<"Coverage"> | string
    insurerId?: StringFilter<"Coverage"> | string
    serviceItemId?: StringFilter<"Coverage"> | string
    copay?: DecimalFilter<"Coverage"> | Decimal | DecimalJsLike | number | string
    requiresAuth?: BoolFilter<"Coverage"> | boolean
    createdAt?: DateTimeFilter<"Coverage"> | Date | string
    updatedAt?: DateTimeFilter<"Coverage"> | Date | string
  }

  export type InsurerCreateWithoutCoveragesInput = {
    id?: string
    name: string
    planCode: string
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InsurerUncheckedCreateWithoutCoveragesInput = {
    id?: string
    name: string
    planCode: string
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InsurerCreateOrConnectWithoutCoveragesInput = {
    where: InsurerWhereUniqueInput
    create: XOR<InsurerCreateWithoutCoveragesInput, InsurerUncheckedCreateWithoutCoveragesInput>
  }

  export type InsurerUpsertWithoutCoveragesInput = {
    update: XOR<InsurerUpdateWithoutCoveragesInput, InsurerUncheckedUpdateWithoutCoveragesInput>
    create: XOR<InsurerCreateWithoutCoveragesInput, InsurerUncheckedCreateWithoutCoveragesInput>
    where?: InsurerWhereInput
  }

  export type InsurerUpdateToOneWithWhereWithoutCoveragesInput = {
    where?: InsurerWhereInput
    data: XOR<InsurerUpdateWithoutCoveragesInput, InsurerUncheckedUpdateWithoutCoveragesInput>
  }

  export type InsurerUpdateWithoutCoveragesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    planCode?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InsurerUncheckedUpdateWithoutCoveragesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    planCode?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageCreateManyInsurerInput = {
    id?: string
    serviceItemId: string
    copay: Decimal | DecimalJsLike | number | string
    requiresAuth?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CoverageUpdateWithoutInsurerInput = {
    id?: StringFieldUpdateOperationsInput | string
    serviceItemId?: StringFieldUpdateOperationsInput | string
    copay?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    requiresAuth?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageUncheckedUpdateWithoutInsurerInput = {
    id?: StringFieldUpdateOperationsInput | string
    serviceItemId?: StringFieldUpdateOperationsInput | string
    copay?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    requiresAuth?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageUncheckedUpdateManyWithoutInsurerInput = {
    id?: StringFieldUpdateOperationsInput | string
    serviceItemId?: StringFieldUpdateOperationsInput | string
    copay?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    requiresAuth?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use InsurerCountOutputTypeDefaultArgs instead
     */
    export type InsurerCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InsurerCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InsurerDefaultArgs instead
     */
    export type InsurerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InsurerDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CoverageDefaultArgs instead
     */
    export type CoverageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CoverageDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}