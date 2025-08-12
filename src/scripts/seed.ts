import { PrismaClient } from '../generated/prisma';
import { createUser, createPermission, updateUser } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Buat permissions default
  const defaultPermissions = [
    'view_kehadiran',
    'create_kehadiran',
    'edit_kehadiran',
    'delete_kehadiran',
    'view_kegiatan',
    'create_kegiatan',
    'edit_kegiatan',
    'delete_kegiatan',
    'view_reports',
    'export_data',
  ];

  console.log('📝 Creating default permissions...');
  for (const permission of defaultPermissions) {
    try {
      await createPermission(permission);
      console.log(`✅ Created permission: ${permission}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Permission already exists: ${permission}`);
      } else {
        console.error(`❌ Error creating permission ${permission}:`, error);
      }
    }
  }

  // Buat admin default
  console.log('👤 Creating default admin user...');
  try {
    const adminUser = await createUser({ email: 'admin@posyandu.com', username: 'admin', password: 'admin123', role: 'ADMIN', fullName: 'Admin Posyandu', posyanduName: 'Kantor Pusat' });
    console.log('✅ Created admin user:', adminUser.email);
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('⚠️  Admin user already exists');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  }

  // Buat user demo
  console.log('👤 Creating demo user...');
  try {
    const demoUser = await createUser({ email: 'user@posyandu.com', username: 'user', password: 'user123', role: 'USER', fullName: 'User Demo Posyandu', posyanduName: 'Posyandu Melati 1' });
    console.log('✅ Created demo user:', demoUser.email);
    
    // Berikan beberapa permissions ke demo user
    await updateUser(demoUser.id, { permissions: ['view_kehadiran', 'view_kegiatan', 'export_data'] });
    console.log('✅ Assigned permissions to demo user');
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('⚠️  Demo user already exists');
    } else {
      console.error('❌ Error creating demo user:', error);
    }
  }

  console.log('🎉 Seeding completed!');
  console.log('\n📋 Default accounts:');
  console.log('Admin: admin@posyandu.com / admin123');
  console.log('User:  user@posyandu.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
