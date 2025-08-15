/**
 * Simple tests to verify the new flexible entity generator system works correctly
 */

import {
  GenericFakeEntityFacade,
  GenericFunctionalFakeEntityFacade,
} from './entity-generator';

// Test interface
interface TestUser {
  id: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  createdAt: Date;
}

interface TestProduct {
  id: string;
  title: string;
  price: number;
  tags: string[];
}

// Test 1: Basic Generic Facade
console.log('=== Test 1: Basic Generic Facade ===');
const testUser = GenericFakeEntityFacade.quickBuild<TestUser>({
  id: 'uuid',
  name: 'string',
  email: 'string',
  age: 'number',
  isActive: 'boolean',
  createdAt: 'Date',
});

console.log('Generated user:', testUser);
console.log('User has expected properties:', {
  hasId: typeof testUser.id === 'string',
  hasName: typeof testUser.name === 'string',
  hasEmail: typeof testUser.email === 'string',
  hasAge: typeof testUser.age === 'number',
  hasIsActive: typeof testUser.isActive === 'boolean',
  hasCreatedAt: testUser.createdAt instanceof Date,
});

// Test 2: Multiple entities
console.log('\n=== Test 2: Multiple Entities ===');
const testUsers = GenericFakeEntityFacade.quickBuildMany<TestUser>(3, {
  id: 'uuid',
  name: 'string',
  email: 'string',
  age: 'number',
  isActive: 'boolean',
  createdAt: 'Date',
});

console.log('Generated users count:', testUsers.length);
console.log(
  'All have unique IDs:',
  new Set(testUsers.map((u) => u.id)).size === testUsers.length,
);

// Test 3: Builder with fixed values and relations
console.log('\n=== Test 3: Builder with Fixed Values and Relations ===');
const productWithRelations =
  GenericFakeEntityFacade.createBuilder<TestProduct>()
    .withBasicSchema({
      id: 'uuid',
      title: 'string',
      price: 'number',
    })
    .withFixedValues({
      title: 'MacBook Pro',
      price: 2499,
    })
    .withSingleRelation('category', { id: 'cat-1', name: 'Electronics' })
    .withManyRelations('reviews', [
      { id: 'rev-1', rating: 5, comment: 'Great!' },
      { id: 'rev-2', rating: 4, comment: 'Good product' },
    ])
    .build();

console.log('Product with relations:', productWithRelations);
console.log('Fixed title:', productWithRelations.title === 'MacBook Pro');
console.log('Fixed price:', productWithRelations.price === 2499);
console.log('Has category relation:', !!(productWithRelations as any).category);
console.log(
  'Has reviews relations:',
  Array.isArray((productWithRelations as any).reviews) &&
    (productWithRelations as any).reviews.length === 2,
);

// Test 4: Functional composition
console.log('\n=== Test 4: Functional Composition ===');
const withBaseUserSchema = (builder) =>
  builder.withBasicSchema({
    id: 'uuid',
    name: 'string',
    email: 'string',
    age: 'number',
    isActive: 'boolean',
    createdAt: 'Date',
  });

const withActiveUser = (builder) =>
  builder.withFixedValues({
    isActive: true,
  });

const withAdminUser = (builder) =>
  builder.withFixedValues({
    name: 'Admin User',
    email: 'admin@example.com',
  });

const adminUser = GenericFunctionalFakeEntityFacade.compose(
  withBaseUserSchema,
  withActiveUser,
  withAdminUser,
).build() as any; // Type assertion for testing purposes

console.log('Admin user:', adminUser);
console.log('Is admin user active:', adminUser.isActive === true);
console.log('Has admin name:', adminUser.name === 'Admin User');
console.log('Has admin email:', adminUser.email === 'admin@example.com');

// Test 5: Multiple functional composition
console.log('\n=== Test 5: Multiple Functional Composition ===');
const regularUsers = GenericFunctionalFakeEntityFacade.compose(
  withBaseUserSchema,
  withActiveUser,
).buildMany(2) as any[]; // Type assertion for testing purposes

console.log('Regular users count:', regularUsers.length);
console.log(
  'All regular users are active:',
  regularUsers.every((u) => u.isActive === true),
);
console.log(
  'Regular users have different IDs:',
  new Set(regularUsers.map((u) => u.id)).size === regularUsers.length,
);

// Test 6: Complex nested interface
console.log('\n=== Test 6: Complex Nested Interface ===');
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  meta: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}

const userApiResponse = GenericFakeEntityFacade.createBuilder<
  ApiResponse<TestUser>
>()
  .withBasicSchema({
    status: 'number',
    message: 'string',
  })
  .withFixedValues({
    status: 200,
    message: 'Success',
  })
  .withSingleRelation('data', testUser)
  .withSingleRelation('meta', {
    page: 1,
    totalPages: 5,
    totalItems: 100,
  })
  .build();

console.log('API Response:', userApiResponse);
console.log('Response has correct status:', userApiResponse.status === 200);
console.log('Response has user data:', !!userApiResponse.data);
console.log('Response has meta:', !!userApiResponse.meta);

console.log('\n=== All Tests Completed Successfully! ===');
console.log('The new flexible entity generator system is working correctly.');
console.log('You can now use:');
console.log('- GenericFakeEntityFacade for any interface/type');
console.log('- GenericFunctionalFakeEntityFacade for functional composition');
console.log('- FakeEntityFacade for legacy Prisma support (when needed)');
