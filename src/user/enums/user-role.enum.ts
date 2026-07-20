export enum UserRole {
  // Platform Level (SaaS Operators)
  SUPER_ADMIN = 'SUPER_ADMIN',
  PLATFORM_MANAGER = 'PLATFORM_MANAGER',

  // Tenant Level (Restaurant Vendors)
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  MANAGER = 'MANAGER',
  POS_STAFF = 'POS_STAFF',
  KITCHEN_STAFF = 'KITCHEN_STAFF',
}
