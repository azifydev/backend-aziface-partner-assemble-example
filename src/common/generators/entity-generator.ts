/* eslint-disable func-call-spacing */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

/**
 * Entity Generator - Flexible Mock System
 *
 * This file provides a flexible system for mocking any interface/type, not just Prisma entities.
 *
 * ## Main Classes:
 *
 * ### Generic (For any interface/type):
 * - `GenericFakeEntityFacade` - Main facade for generic entity mocking
 * - `GenericFunctionalFakeEntityFacade` - Functional approach for generic entities
 * - `GenericFakeEntity<T>` - Type for generic fake entities
 * - `GenericFakeEntityConstructor<T>` - Schema type for generic entities
 *
 * ### Prisma-specific (Legacy support):
 * - `FakeEntityFacade` - Prisma-specific facade (backward compatibility)
 * - `FunctionalFakeEntityFacade` - Functional approach for Prisma entities
 * - `FakeEntity<T>` - Type for Prisma fake entities (snake_case)
 * - `FakeEntityConstructor<T>` - Schema type for Prisma entities
 *
 * ### Core Builder:
 * - `FakeEntityBuilder<T, TFake>` - Generic builder that works with both approaches
 *
 * ## Usage Examples:
 *
 * ```typescript
 * // Generic usage (any interface/type)
 * interface User { id: string; name: string; email: string; }
 * const user = GenericFakeEntityFacade.quickBuild<User>({
 *   id: 'uuid',
 *   name: 'string',
 *   email: 'string'
 * });
 *
 * // Prisma usage (legacy, with snake_case)
 * const prismaUser = FakeEntityFacade.quickBuild({
 *   user_id: 'uuid',
 *   user_name: 'string',
 *   user_email: 'string'
 * });
 *
 * // Functional composition (generic)
 * const userConfig = (builder) => builder.withBasicSchema({ id: 'uuid', name: 'string' });
 * const activeConfig = (builder) => builder.withFixedValues({ isActive: true });
 * const user = GenericFunctionalFakeEntityFacade.compose(userConfig, activeConfig).build();
 * ```
 */

import { faker } from '@faker-js/faker';

import type { DeepPartialNullable } from 'src/common/types/deep-partial-object';
import type { SnakeCaseLike } from 'src/common/types/snake-like-object';

// Generic types for any entity/interface
export type GenericFakeEntity<T> = DeepPartialNullable<T>;
export type GenericFakeEntityConstructor<T> = {
  [K in keyof DeepPartialNullable<T>]?: BuiltinTypesString;
};

// Prisma-specific types (legacy support)
export type FakeEntity<T> = DeepPartialNullable<SnakeCaseLike<T>>;
export type FakeEntityConstructor<T> = {
  [K in keyof DeepPartialNullable<SnakeCaseLike<T>>]?: BuiltinTypesString;
};

// Tipos existentes mantidos
export type BuiltinTypes =
  | string
  | number
  | boolean
  | Date
  | undefined
  | null
  | bigint
  | symbol
  | object
  | (() => unknown)
  | RegExp
  | Error
  | Array<any>
  | Promise<any>
  | Map<any, any>
  | Set<any>
  | WeakMap<any, any>
  | WeakSet<any>
  | ArrayBuffer
  | DataView
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

export type BuiltinTypesString =
  | 'uuid'
  | 'string'
  | 'number'
  | 'boolean'
  | 'Date'
  | 'undefined'
  | 'null'
  | 'bigint'
  | 'symbol'
  | 'object'
  | 'Function'
  | 'RegExp'
  | 'Error'
  | 'Array<any>'
  | 'Promise<any>'
  | 'Map<any, any>'
  | 'Set<any>'
  | 'WeakMap<any, any>'
  | 'WeakSet<any>'
  | 'ArrayBuffer'
  | 'DataView'
  | 'Int8Array'
  | 'Uint8Array'
  | 'Uint8ClampedArray'
  | 'Int16Array'
  | 'Uint16Array'
  | 'Int32Array'
  | 'Uint32Array'
  | 'Float32Array'
  | 'Float64Array'
  | 'BigInt64Array'
  | 'BigUint64Array';

// 1. STRATEGY PATTERN - Para geração de tipos
interface TypeGenerationStrategy {
  generate(): BuiltinTypes;
}

class UUIDGenerationStrategy implements TypeGenerationStrategy {
  generate(): string {
    return faker.string.uuid();
  }
}

class StringGenerationStrategy implements TypeGenerationStrategy {
  generate(): string {
    return faker.string.sample();
  }
}

class NumberGenerationStrategy implements TypeGenerationStrategy {
  generate(): number {
    return faker.number.int();
  }
}

class BooleanGenerationStrategy implements TypeGenerationStrategy {
  generate(): boolean {
    return faker.datatype.boolean();
  }
}

class DateGenerationStrategy implements TypeGenerationStrategy {
  generate(): Date {
    return faker.date.recent();
  }
}

class NullGenerationStrategy implements TypeGenerationStrategy {
  generate(): null {
    return null;
  }
}

class UndefinedGenerationStrategy implements TypeGenerationStrategy {
  generate(): undefined {
    return undefined;
  }
}

class MockFunctionGenerationStrategy implements TypeGenerationStrategy {
  generate(): () => unknown {
    return jest.fn();
  }
}

export class TypeGenerationStrategyFactory {
  private static readonly strategies: Map<
    BuiltinTypesString,
    () => TypeGenerationStrategy
  > = new Map<BuiltinTypesString, () => TypeGenerationStrategy>([
    ['uuid', () => new UUIDGenerationStrategy()],
    ['string', () => new StringGenerationStrategy()],
    ['number', () => new NumberGenerationStrategy()],
    ['boolean', () => new BooleanGenerationStrategy()],
    ['Date', () => new DateGenerationStrategy()],
    ['null', () => new NullGenerationStrategy()],
    ['undefined', () => new UndefinedGenerationStrategy()],
    ['Function', () => new MockFunctionGenerationStrategy()],
    // Adicione outras estratégias conforme necessário
  ]);

  static getStrategy(type: string): TypeGenerationStrategy {
    const strategyFactory = this.strategies.get(type as BuiltinTypesString);
    if (!strategyFactory) {
      console.warn(`No strategy found for type: ${type}, using null strategy`);
      return new NullGenerationStrategy();
    }
    return strategyFactory();
  }

  static registerStrategy(
    type: BuiltinTypesString,
    strategyFactory: () => TypeGenerationStrategy,
  ): void {
    this.strategies.set(type, strategyFactory);
  }
}

/**
 * A generic builder class for generating fake entity objects for testing or seeding purposes.
 * Can work with any interface/type, not just Prisma entities.
 *
 * @typeParam T - The type of the entity.
 * @typeParam TSchema - The schema type (defaults to generic, can be Prisma-specific)
 *
 * @example
 * ```typescript
 * // Generic usage
 * const builder = new FakeEntityBuilder<User>()
 *   .withBasicSchema({ id: 'string', name: 'string' })
 *   .withFixedValues({ name: 'Alice' })
 *   .withSingleRelation('profile', fakeProfile)
 *   .withManyRelations('posts', [fakePost1, fakePost2]);
 *
 * // Prisma-specific usage (legacy)
 * const prismaBuilder = new FakeEntityBuilder<User, FakeEntity<User>>()
 *   .withBasicSchema({ user_id: 'string', user_name: 'string' });
 * ```
 *
 * @method withBasicSchema Sets the basic schema for the entity, defining the types of its fields.
 * @method withFixedValues Sets fixed values for specific fields, overriding generated values.
 * @method withSingleRelation Adds a single related entity under the specified key.
 * @method withManyRelations Adds multiple related entities under the specified key.
 * @method build Generates a single fake entity object based on the schema and provided values.
 * @method buildMany Generates an array of fake entity objects.
 */
export class FakeEntityBuilder<T, TFake = GenericFakeEntity<T>> {
  private basicSchema: GenericFakeEntityConstructor<T> = {};
  private fixedValues: Partial<TFake> = {};
  private singleRelations: Record<string, any> = {};
  private manyRelations: Record<string, any[]> = {};

  /**
   * Merges the provided schema with the existing basic schema for the entity.
   *
   * @param schema - An object representing the basic schema to be merged.
   * @returns The current instance for method chaining.
   */
  withBasicSchema(schema: GenericFakeEntityConstructor<T>): this {
    this.basicSchema = { ...this.basicSchema, ...schema };
    return this;
  }

  /**
   * Sets fixed values for the generated fake entity.
   * The provided values will override any previously set fixed values.
   *
   * @param values - An object containing partial properties of the fake entity to be fixed.
   * @returns The current instance for method chaining.
   */
  withFixedValues(values: Partial<TFake>): this {
    this.fixedValues = { ...this.fixedValues, ...values };
    return this;
  }

  /**
   * Adds or updates a single relation for the specified key.
   *
   * @param key - The name of the relation property.
   * @param relation - The relation object to associate with the key.
   * @returns The current instance for method chaining.
   */
  withSingleRelation(key: string, relation: any): this {
    this.singleRelations[key] = relation;
    return this;
  }

  /**
   * Associates multiple relations with a given key.
   *
   * @param key - The identifier for the group of relations.
   * @param relations - An array of relation objects to associate with the key.
   * @returns The current instance for method chaining.
   */
  withManyRelations(key: string, relations: any[]): this {
    this.manyRelations[key] = relations;
    return this;
  }

  /**
   * Builds and returns a fake entity object by merging generated basic values,
   * single and many relations, and any fixed values provided.
   *
   * @returns {TFake} The constructed fake entity with all properties combined.
   */
  build(): TFake {
    const generatedBasic = this.generateBasicValues();

    return {
      ...generatedBasic,
      ...this.singleRelations,
      ...this.manyRelations,
      ...this.fixedValues,
    } as TFake;
  }

  /**
   * Generates an array of fake entities.
   *
   * @param count - The number of entities to generate.
   * @returns An array containing the specified number of fake entities.
   */
  buildMany(count: number): TFake[] {
    const result: TFake[] = [];
    for (let i = 0; i < count; i++) {
      result.push(this.build());
    }
    return result;
  }

  /**
   * Generates an object containing basic values based on the `basicSchema` definition.
   *
   * Iterates over each entry in `basicSchema`, determines the appropriate type generation
   * strategy for each property, and generates a value using that strategy. The resulting
   * object maps each property key to its generated value.
   *
   * @returns {any} An object with keys from `basicSchema` and generated values according to their types.
   */
  private generateBasicValues(): any {
    const response: any = {};

    for (const [key, type] of Object.entries(this.basicSchema)) {
      if (type) {
        const strategy = TypeGenerationStrategyFactory.getStrategy(
          type as string,
        );
        response[key] = strategy.generate();
      }
    }

    return response;
  }
}

/**
 * Generic facade class providing utility methods for generating fake entities.
 * Works with any interface/type, not restricted to Prisma entities.
 *
 * @example
 * // Create a builder for a custom entity
 * const builder = GenericFakeEntityFacade.createBuilder<MyEntity>();
 *
 * // Quickly build a single fake entity
 * const entity = GenericFakeEntityFacade.quickBuild<MyEntity>({ id: 'string', name: 'string' });
 *
 * // Quickly build multiple fake entities
 * const entities = GenericFakeEntityFacade.quickBuildMany<MyEntity>(5, { id: 'string', name: 'string' });
 */
export class GenericFakeEntityFacade {
  /**
   * Creates and returns a new instance of `FakeEntityBuilder` for the specified type `T`.
   *
   * @typeParam T - The type of the entity for which the builder is created.
   * @returns A new `FakeEntityBuilder` instance for type `T`.
   */
  static createBuilder<T>(): FakeEntityBuilder<T, GenericFakeEntity<T>> {
    return new FakeEntityBuilder<T, GenericFakeEntity<T>>();
  }

  /**
   * Quickly creates a new instance of `GenericFakeEntity<T>` using the provided schema.
   *
   * @typeParam T - The type of the entity to be generated.
   * @param schema - The constructor or schema definition for the fake entity.
   * @returns A new instance of `GenericFakeEntity<T>` initialized with the given schema.
   */
  static quickBuild<T = any>(
    schema: GenericFakeEntityConstructor<T>,
  ): GenericFakeEntity<T> {
    return new FakeEntityBuilder<T, GenericFakeEntity<T>>()
      .withBasicSchema(schema)
      .build();
  }

  /**
   * Quickly builds an array of fake entities using the provided schema.
   *
   * @template T - The type of the entity to generate.
   * @param count - The number of entities to generate.
   * @param schema - The schema constructor used to define the entity structure.
   * @returns An array of generated fake entities.
   */
  static quickBuildMany<T = any>(
    count: number,
    schema: GenericFakeEntityConstructor<T>,
  ): GenericFakeEntity<T>[] {
    return new FakeEntityBuilder<T, GenericFakeEntity<T>>()
      .withBasicSchema(schema)
      .buildMany(count);
  }

  /**
   * Registers a custom type generation strategy for a specified built-in type.
   *
   * @param type - The name of the built-in type to associate with the custom generator.
   * @param generator - A function that returns a `TypeGenerationStrategy` instance for the specified type.
   */
  static registerCustomType(
    type: BuiltinTypesString,
    generator: () => TypeGenerationStrategy,
  ): void {
    TypeGenerationStrategyFactory.registerStrategy(type, generator);
  }
}

/**
 * Facade class providing utility methods for generating fake Prisma entities (legacy support).
 * This class maintains backward compatibility with existing Prisma-specific code.
 *
 * @example
 * // Create a builder for a Prisma entity
 * const builder = FakeEntityFacade.createBuilder<User>();
 *
 * // Quickly build a single fake Prisma entity
 * const entity = FakeEntityFacade.quickBuild({ user_id: 'string', user_name: 'string' });
 *
 * // Quickly build multiple fake Prisma entities
 * const entities = FakeEntityFacade.quickBuildMany(5, { user_id: 'string', user_name: 'string' });
 */
export class FakeEntityFacade {
  /**
   * Creates and returns a new instance of `FakeEntityBuilder` for Prisma entities.
   *
   * @typeParam T - The type of the entity for which the builder is created.
   * @returns A new `FakeEntityBuilder` instance for Prisma type `T`.
   */
  static createBuilder<T>(): FakeEntityBuilder<T, FakeEntity<T>> {
    return new FakeEntityBuilder<T, FakeEntity<T>>();
  }

  /**
   * Quickly creates a new instance of `FakeEntity<T>` using the provided schema.
   *
   * @typeParam T - The type of the entity to be generated.
   * @param schema - The constructor or schema definition for the fake entity.
   * @returns A new instance of `FakeEntity<T>` initialized with the given schema.
   */
  static quickBuild<T = any>(schema: FakeEntityConstructor<T>): FakeEntity<T> {
    // For Prisma entities, we need to cast the schema
    return new FakeEntityBuilder<T, FakeEntity<T>>()
      .withBasicSchema(schema as any)
      .build();
  }

  /**
   * Quickly builds an array of fake entities using the provided schema.
   *
   * @template T - The type of the entity to generate.
   * @param count - The number of entities to generate.
   * @param schema - The schema constructor used to define the entity structure.
   * @returns An array of generated fake entities.
   */
  static quickBuildMany<T = any>(
    count: number,
    schema: FakeEntityConstructor<T>,
  ): FakeEntity<T>[] {
    // For Prisma entities, we need to cast the schema
    return new FakeEntityBuilder<T, FakeEntity<T>>()
      .withBasicSchema(schema as any)
      .buildMany(count);
  }

  /**
   * Registers a custom type generation strategy for a specified built-in type.
   *
   * @param type - The name of the built-in type to associate with the custom generator.
   * @param generator - A function that returns a `TypeGenerationStrategy` instance for the specified type.
   */
  static registerCustomType(
    type: BuiltinTypesString,
    generator: () => TypeGenerationStrategy,
  ): void {
    TypeGenerationStrategyFactory.registerStrategy(type, generator);
  }
}

/**
 * A function type that receives a `FakeEntityBuilder` for a given entity type `T`
 * and returns a (possibly modified) `FakeEntityBuilder<T>`.
 *
 * This is typically used to configure or customize the builder before generating fake entities.
 *
 * @typeParam T - The type of the entity for which the builder is being configured.
 * @typeParam TFake - The fake entity type (generic or Prisma-specific).
 * @param builder - The builder instance to configure.
 * @returns The configured builder instance.
 */
export type BuilderConfigFn<T, TFake = GenericFakeEntity<T>> = (
  builder: FakeEntityBuilder<T, TFake>,
) => FakeEntityBuilder<T, TFake>;

/**
 * Generic functional facade class providing functional utilities for composing and configuring fake entity builders.
 * Works with any interface/type, not restricted to Prisma entities.
 *
 * @example
 * ```typescript
 * // Generic usage
 * const userConfig = (builder) => builder.withBasicSchema({ id: 'string', name: 'string' });
 * const activeConfig = (builder) => builder.withFixedValues({ isActive: true });
 *
 * const user = GenericFunctionalFakeEntityFacade.compose(userConfig, activeConfig).build();
 * ```
 */
export class GenericFunctionalFakeEntityFacade extends GenericFakeEntityFacade {
  /**
   * Composes multiple builder configuration functions into a single builder interface.
   *
   * @typeParam T - The type of the entity to be built.
   * @param configFns - A list of builder configuration functions to apply in sequence.
   * @returns An object with methods to build entities or retrieve the configured builder.
   */
  static compose<T>(...configFns: BuilderConfigFn<T, GenericFakeEntity<T>>[]) {
    return {
      build(): GenericFakeEntity<T> {
        const builder = new FakeEntityBuilder<T, GenericFakeEntity<T>>();
        const configuredBuilder = configFns.reduce(
          (acc, configFn) => configFn(acc),
          builder,
        );
        return configuredBuilder.build();
      },

      buildMany(count: number): GenericFakeEntity<T>[] {
        const builder = new FakeEntityBuilder<T, GenericFakeEntity<T>>();
        const configuredBuilder = configFns.reduce(
          (acc, configFn) => configFn(acc),
          builder,
        );
        return configuredBuilder.buildMany(count);
      },

      getBuilder(): FakeEntityBuilder<T, GenericFakeEntity<T>> {
        const builder = new FakeEntityBuilder<T, GenericFakeEntity<T>>();
        return configFns.reduce((acc, configFn) => configFn(acc), builder);
      },
    };
  }

  /**
   * Creates a new `FakeEntityBuilder` instance and applies a sequence of configuration functions to it.
   *
   * @typeParam T - The type of the entity being built.
   * @param configFns - A variable number of builder configuration functions to apply to the builder.
   * @returns The configured `FakeEntityBuilder` instance.
   */
  static pipeline<T>(
    ...configFns: BuilderConfigFn<T, GenericFakeEntity<T>>[]
  ): FakeEntityBuilder<T, GenericFakeEntity<T>> {
    const builder = new FakeEntityBuilder<T, GenericFakeEntity<T>>();
    return configFns.reduce((acc, configFn) => configFn(acc), builder);
  }
}

/**
 * Legacy BuilderConfigFn type for backward compatibility with Prisma entities.
 */
export type PrismaBuilderConfigFn<T> = BuilderConfigFn<T, FakeEntity<T>>;

/**
 * A facade class providing functional utilities for composing and configuring fake entity builders.
 * This maintains backward compatibility with existing Prisma-specific code.
 *
 * @remarks
 * This class is intended to simplify the creation and configuration of fake entities for testing or seeding
 * purposes, leveraging a functional programming style for builder configuration.
 *
 * @extends FakeEntityFacade
 */
export class FunctionalFakeEntityFacade extends FakeEntityFacade {
  /**
   * Composes multiple builder configuration functions into a single builder interface.
   *
   * @typeParam T - The type of the entity to be built.
   * @param configFns - A list of builder configuration functions to apply in sequence.
   * @returns An object with methods to build a single entity, build multiple entities, or retrieve the configured builder:
   * - `build()`: Builds and returns a single fake entity of type `T`.
   * - `buildMany(count: number)`: Builds and returns an array of fake entities of type `T`.
   * - `getBuilder()`: Returns the configured `FakeEntityBuilder<T>` instance.
   */
  static compose<T>(...configFns: PrismaBuilderConfigFn<T>[]) {
    return {
      build(): FakeEntity<T> {
        const builder = new FakeEntityBuilder<T, FakeEntity<T>>();
        const configuredBuilder = configFns.reduce(
          (acc, configFn) => configFn(acc),
          builder,
        );
        return configuredBuilder.build();
      },

      buildMany(count: number): FakeEntity<T>[] {
        const builder = new FakeEntityBuilder<T, FakeEntity<T>>();
        const configuredBuilder = configFns.reduce(
          (acc, configFn) => configFn(acc),
          builder,
        );
        return configuredBuilder.buildMany(count);
      },

      getBuilder(): FakeEntityBuilder<T, FakeEntity<T>> {
        const builder = new FakeEntityBuilder<T, FakeEntity<T>>();
        return configFns.reduce((acc, configFn) => configFn(acc), builder);
      },
    };
  }

  /**
   * Creates a new `FakeEntityBuilder` instance and applies a sequence of configuration functions to it.
   *
   * This method enables a functional pipeline approach to configuring a builder by passing in multiple
   * configuration functions, which are applied in order to the builder instance.
   *
   * @typeParam T - The type of the entity being built.
   * @param configFns - A variable number of builder configuration functions to apply to the builder.
   * @returns The configured `FakeEntityBuilder` instance.
   */
  static pipeline<T>(
    ...configFns: PrismaBuilderConfigFn<T>[]
  ): FakeEntityBuilder<T, FakeEntity<T>> {
    const builder = new FakeEntityBuilder<T, FakeEntity<T>>();
    return configFns.reduce((acc, configFn) => configFn(acc), builder);
  }
}
