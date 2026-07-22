/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';
import { OrganizationSchema } from '../organization/schemas/organization.schema';
import { OutletSchema } from '../outlet/schemas/outlet.schema';
import { UserSchema } from '../user/schemas/user.schema';
import { MenuItemSchema } from '../menu-item/schemas/menu-item.schema';
import { OrderSchema } from '../order/schemas/order.schema';
import { UserRole } from '../user/enums/user-role.enum';
import { MenuItemCategory } from '../menu-item/enums/menu-item-category.enum';
import { OrderStatus } from '../order/enums/order-status.enum';
import { PaymentMode } from '../order/enums/payment-mode.enum';
import { OrganizationStatus } from '../organization/enums/organization-status.enum';
import { OutletStatus } from '../outlet/enums/outlet-status.enum';
import * as fs from 'fs';
import * as path from 'path';
import { faker } from '@faker-js/faker';
import { hashPassword } from '../utils/hash.util';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts a string to a url-friendly slug (lowercase letters, digits, hyphens) */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 40); // cap length for email safety
}

/** Randomly pick one element from an array */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Weighted random pick: given pairs of [value, weight], returns a value */
function weightedPick<T>(pairs: [T, number][]): T {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of pairs) {
    r -= w;
    if (r <= 0) return v;
  }
  return pairs[pairs.length - 1][0];
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function runSeed() {
  // ── 1. Connect ──────────────────────────────────────────────────────────────
  const envPath = path.resolve(process.cwd(), '.env');
  let mongoUrl =
    'mongodb+srv://zentra421_db_user:vQv3TpoLlNhmlEza@cluster0.tfgcuuh.mongodb.net/restroos?appName=Cluster0';
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    const match = envConfig.match(/MONGO_URL=['"]?([^'"]+)['"]?/);
    if (match && match[1]) mongoUrl = match[1];
  }

  console.log('Connecting to MongoDB at:', mongoUrl);
  await mongoose.connect(mongoUrl);
  console.log('Connected to MongoDB');

  // ── 2. Register Models ──────────────────────────────────────────────────────
  const OrganizationModel = mongoose.model('Organization', OrganizationSchema);
  const OutletModel = mongoose.model('Outlet', OutletSchema);
  const UserModel = mongoose.model('User', UserSchema);
  const MenuItemModel = mongoose.model('MenuItem', MenuItemSchema);
  const OrderModel = mongoose.model('Order', OrderSchema);

  // ── 3. Clear existing data ──────────────────────────────────────────────────
  console.log('Clearing existing data...');
  await OrganizationModel.deleteMany({});
  await OutletModel.deleteMany({});
  await UserModel.deleteMany({});
  await MenuItemModel.deleteMany({});
  await OrderModel.deleteMany({});

  // ── 4. Seed Organizations ───────────────────────────────────────────────────
  console.log('Seeding Organizations...');

  // Status distribution: 3 active, 1 inactive, 1 on-hold
  const orgStatuses: OrganizationStatus[] = [
    OrganizationStatus.ACTIVE,
    OrganizationStatus.ACTIVE,
    OrganizationStatus.ACTIVE,
    OrganizationStatus.INACTIVE,
    OrganizationStatus.ON_HOLD,
  ];

  const orgs: any[] = [];
  for (let i = 0; i < 5; i++) {
    const org = await OrganizationModel.create({
      name: faker.company.name(),
      status: orgStatuses[i],
      isDeleted: false,
    });
    orgs.push(org);
    console.log(`  Org [${org.status}]: ${org.name}`);
  }

  // ── 5. Seed Outlets ─────────────────────────────────────────────────────────
  console.log('Seeding Outlets...');

  const outletStatusPairs: [OutletStatus, number][] = [
    [OutletStatus.ACTIVE, 70],
    [OutletStatus.INACTIVE, 20],
    [OutletStatus.ON_HOLD, 10],
  ];

  const outlets: any[] = [];

  // 15 linked outlets — 3 per org
  for (let i = 0; i < 15; i++) {
    const org = orgs[i % 5];
    const outletStatus = weightedPick(outletStatusPairs);
    const outlet = await OutletModel.create({
      organizationId: org._id,
      name: `${faker.company.name()} Outlet`,
      address: faker.location.streetAddress({ useFullAddress: true }),
      isCustomerapp: faker.datatype.boolean({ probability: 0.6 }),
      gstin: faker.datatype.boolean({ probability: 0.5 })
        ? `${faker.number.int({ min: 10, max: 36 }).toString().padStart(2, '0')}AAAAA1234A1Z1`
        : null,
      pan: faker.datatype.boolean({ probability: 0.5 }) ? 'ABCDE1234F' : null,
      status: outletStatus,
      isDeleted: false,
    });
    outlets.push(outlet);
    console.log(`  Outlet [${outlet.status}]: ${outlet.name} → org: ${org.name}`);
  }

  // 5 standalone outlets (no org)
  for (let i = 0; i < 5; i++) {
    const outletStatus = weightedPick(outletStatusPairs);
    const outlet = await OutletModel.create({
      organizationId: null,
      name: `${faker.company.name()} Independent Outlet`,
      address: faker.location.streetAddress({ useFullAddress: true }),
      isCustomerapp: faker.datatype.boolean({ probability: 0.4 }),
      gstin: null,
      pan: null,
      status: outletStatus,
      isDeleted: false,
    });
    outlets.push(outlet);
    console.log(`  Outlet [${outlet.status}]: ${outlet.name} → standalone`);
  }

  // ── 6. Seed Users ───────────────────────────────────────────────────────────
  console.log('\nSeeding Users...');

  const createdEmails = new Set<string>();

  function uniqueEmail(preferred: string): string {
    // sanitise to avoid invalid email chars
    const clean = preferred.replace(/[^a-z0-9@._-]/g, '').toLowerCase();
    if (!createdEmails.has(clean)) {
      createdEmails.add(clean);
      return clean;
    }
    // Append random suffix if collision
    const fallback = `${clean.split('@')[0]}.${faker.number.int(9999)}@${clean.split('@')[1] ?? 'mail.com'}`;
    createdEmails.add(fallback);
    return fallback;
  }

  const users: any[] = [];

  // Platform-level users
  const superAdmin = await UserModel.create({
    role: UserRole.SUPER_ADMIN,
    email: 'superadmin@thesmartbills.com',
    passwordHash: hashPassword('SuperAdmin@9500'),
    isDeleted: false,
  });
  createdEmails.add(superAdmin.email);
  users.push(superAdmin);
  console.log(`  [SUPER_ADMIN]        ${superAdmin.email}  /  SuperAdmin@9500`);

  const platformManager = await UserModel.create({
    role: UserRole.PLATFORM_MANAGER,
    email: 'admin@platform.com',
    passwordHash: hashPassword('admin123'),
    isDeleted: false,
  });
  createdEmails.add(platformManager.email);
  users.push(platformManager);
  console.log(`  [PLATFORM_MANAGER]   ${platformManager.email}  /  admin123`);

  // Restaurant Owners — one per org
  for (const org of orgs) {
    const email = uniqueEmail(`owner.${slugify(org.name)}@thesmartbills.com`);
    const user = await UserModel.create({
      organizationId: org._id,
      role: UserRole.RESTAURANT_OWNER,
      email,
      passwordHash: hashPassword('owner@123'),
      isDeleted: false,
    });
    users.push(user);
    console.log(`  [RESTAURANT_OWNER]   ${email}  /  owner@123   (org: ${org.name})`);
  }

  // Per-outlet staff: Manager + POS_STAFF + KITCHEN_STAFF
  for (const outlet of outlets) {
    const domain = slugify(outlet.name);

    const managerEmail = uniqueEmail(`manager.${domain}@${domain}.com`);
    users.push(
      await UserModel.create({
        organizationId: outlet.organizationId ?? null,
        outletId: outlet._id,
        role: UserRole.MANAGER,
        email: managerEmail,
        passwordHash: hashPassword('manager@123'),
        isDeleted: false,
      }),
    );
    console.log(`  [MANAGER]            ${managerEmail}  /  manager@123   (outlet: ${outlet.name})`);

    const posEmail = uniqueEmail(`pos.${domain}@${domain}.com`);
    users.push(
      await UserModel.create({
        organizationId: outlet.organizationId ?? null,
        outletId: outlet._id,
        role: UserRole.POS_STAFF,
        email: posEmail,
        passwordHash: hashPassword('pos@123'),
        isDeleted: false,
      }),
    );
    console.log(`  [POS_STAFF]          ${posEmail}  /  pos@123   (outlet: ${outlet.name})`);

    const kitchenEmail = uniqueEmail(`kitchen.${domain}@${domain}.com`);
    users.push(
      await UserModel.create({
        organizationId: outlet.organizationId ?? null,
        outletId: outlet._id,
        role: UserRole.KITCHEN_STAFF,
        email: kitchenEmail,
        passwordHash: hashPassword('kitchen@123'),
        isDeleted: false,
      }),
    );
    console.log(`  [KITCHEN_STAFF]      ${kitchenEmail}  /  kitchen@123   (outlet: ${outlet.name})`);
  }

  // ── 7. Seed Menu Items ──────────────────────────────────────────────────────
  console.log('\nSeeding Menu Items...');

  const dishNames: Record<MenuItemCategory, string[]> = {
    [MenuItemCategory.STARTER]: [
      'Paneer Tikka', 'Chicken 65', 'Veg Spring Roll', 'Fish Amritsari', 'Hara Bhara Kabab',
    ],
    [MenuItemCategory.MAIN_COURSE]: [
      'Butter Chicken', 'Dal Makhani', 'Kadai Paneer', 'Hyderabadi Biryani', 'Chole Bhature',
    ],
    [MenuItemCategory.DESSERT]: [
      'Gulab Jamun', 'Rasmalai', 'Kheer', 'Gajar Halwa', 'Mango Kulfi',
    ],
    [MenuItemCategory.BEVERAGE]: [
      'Mango Lassi', 'Masala Chai', 'Cold Coffee', 'Fresh Lime Soda', 'Nimbu Pani',
    ],
    [MenuItemCategory.SIDES]: [
      'Garlic Naan', 'Butter Roti', 'Jeera Rice', 'Papad', 'Raita',
    ],
  };

  const categories = Object.values(MenuItemCategory);
  const menuItemsByOutlet: Record<string, any[]> = {};

  for (const outlet of outlets) {
    const outletIdStr = outlet._id.toString();
    menuItemsByOutlet[outletIdStr] = [];

    for (const category of categories) {
      for (const dishName of dishNames[category]) {
        const isAvailable = faker.datatype.boolean({ probability: 0.85 });
        const menuItem = await MenuItemModel.create({
          outletId: outlet._id,
          category,
          name: dishName,
          price: parseFloat(faker.commerce.price({ min: 80, max: 1800 })),
          isAvailable,
          stock: isAvailable ? faker.number.int({ min: 5, max: 100 }) : 0,
          isDeleted: false,
        });
        menuItemsByOutlet[outletIdStr].push(menuItem);
      }
    }
    console.log(`  MenuItems seeded for outlet: ${outlet.name} (${menuItemsByOutlet[outletIdStr].length} items)`);
  }

  // ── 8. Seed Orders ──────────────────────────────────────────────────────────
  console.log('\nSeeding 100,000 Orders over the last 6 months...');

  const TOTAL_ORDERS = 100000;
  const BATCH_SIZE = 10000;
  const paymentModes = Object.values(PaymentMode);

  // Weight orders heavily towards active outlets
  const activeOutlets = outlets.filter((o) => o.status === OutletStatus.ACTIVE);
  const otherOutlets = outlets.filter((o) => o.status !== OutletStatus.ACTIVE);
  const weightedOutlets: any[] = [...activeOutlets, ...activeOutlets, ...otherOutlets];

  let totalInserted = 0;

  for (let i = 0; i < TOTAL_ORDERS; i += BATCH_SIZE) {
    const batch: any[] = [];

    for (let j = 0; j < BATCH_SIZE; j++) {
      const outlet = pick(weightedOutlets);
      const outletIdStr = outlet._id.toString();
      const availableItems = (menuItemsByOutlet[outletIdStr] || []).filter((m) => m.isAvailable);
      if (availableItems.length === 0) continue;

      const numItems = faker.number.int({ min: 1, max: 5 });
      const items: any[] = [];
      let subtotal = 0;

      for (let k = 0; k < numItems; k++) {
        const menuItem = pick(availableItems);
        const quantity = faker.number.int({ min: 1, max: 4 });
        items.push({ menuItemId: menuItem._id, quantity, price: menuItem.price });
        subtotal += menuItem.price * quantity;
      }

      const tax = parseFloat((subtotal * 0.05).toFixed(2));
      const total = parseFloat((subtotal + tax).toFixed(2));
      const date = faker.date.recent({ days: 180 });

      const status: OrderStatus = weightedPick([
        [OrderStatus.COMPLETED, 60],
        [OrderStatus.CANCELLED, 10],
        [OrderStatus.READY, 10],
        [OrderStatus.PREPARING, 10],
        [OrderStatus.PENDING, 10],
      ]);

      const isPaid =
        status === OrderStatus.COMPLETED ||
        status === OrderStatus.READY ||
        (status === OrderStatus.PREPARING && faker.datatype.boolean({ probability: 0.5 }));

      batch.push({
        _id: new mongoose.Types.ObjectId(),
        outletId: outlet._id,
        items,
        status,
        bill: {
          subtotal,
          tax,
          total,
          paymentMode: isPaid ? pick(paymentModes) : null,
          paidAt: isPaid ? date : null,
        },
        isDeleted: false,
        createdAt: date,
        updatedAt: date,
      });
    }

    if (batch.length > 0) {
      await OrderModel.collection.insertMany(batch);
    }
    totalInserted += batch.length;
    console.log(`  Inserted ${totalInserted.toLocaleString()} / ${TOTAL_ORDERS.toLocaleString()} orders`);
  }


  // ── 9. Summary ─────────────────────────────────────────────────────────────
  console.log('\n========================================');
  console.log('OK Seed completed successfully!');
  console.log('========================================');
  console.log('Organizations : ' + orgs.length);
  console.log('Outlets       : ' + outlets.length);
  console.log('Users         : ' + users.length);
  console.log('Menu Items    : ' + Object.values(menuItemsByOutlet).flat().length);
  console.log('Orders        : ' + totalInserted.toLocaleString());

  console.log('\nPlatform Login Credentials:');
  console.log('  superadmin@thesmartbills.com  ->  SuperAdmin@9500  [SUPER_ADMIN]');
  console.log('  admin@platform.com            ->  admin123         [PLATFORM_MANAGER]');

  console.log('\nOrganization Statuses & Owner Logins:');
  for (const org of orgs) {
    console.log('  [' + org.status + '] ' + org.name + '  ->  owner.' + slugify(org.name) + '@thesmartbills.com / owner@123');
  }

  console.log('\nOutlet Statuses & Staff Logins:');
  for (const outlet of outlets) {
    const domain = slugify(outlet.name);
    console.log('  [' + outlet.status + '] ' + outlet.name);
    console.log('     manager.' + domain + '@' + domain + '.com / manager@123');
    console.log('     pos.' + domain + '@' + domain + '.com / pos@123');
    console.log('     kitchen.' + domain + '@' + domain + '.com / kitchen@123');
  }

  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
