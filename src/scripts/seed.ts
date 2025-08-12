import { PrismaClient } from '@prisma/client';
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

  // Buat user posyandu tambahan
  console.log('👤 Creating additional posyandu users...');
  const posyanduUsers = [
    { email: 'dahlia@posyandu.com', username: 'dahlia', password: 'posyandu123', fullName: 'Petugas Posyandu Dahlia', posyanduName: 'DAHLIA' },
    { email: 'kenanga1@posyandu.com', username: 'kenanga1', password: 'posyandu123', fullName: 'Petugas Posyandu Kenanga I', posyanduName: 'KENANGA I' },
    { email: 'mawarmerah@posyandu.com', username: 'mawarmerah', password: 'posyandu123', fullName: 'Petugas Posyandu Mawar Merah', posyanduName: 'MAWAR MERAH' },
    { email: 'cempaka@posyandu.com', username: 'cempaka', password: 'posyandu123', fullName: 'Petugas Posyandu Cempaka', posyanduName: 'CEMPAKA' },
    { email: 'kenanga2@posyandu.com', username: 'kenanga2', password: 'posyandu123', fullName: 'Petugas Posyandu Kenanga II', posyanduName: 'KENANGA II' },
    { email: 'melati@posyandu.com', username: 'melati', password: 'posyandu123', fullName: 'Petugas Posyandu Melati', posyanduName: 'MELATI' },
  ];

  for (const user of posyanduUsers) {
    try {
      const newUser = await createUser({ ...user, role: 'USER' });
      console.log(`✅ Created posyandu user: ${newUser.email}`);
      await updateUser(newUser.id, { permissions: ['view_kehadiran', 'view_kegiatan', 'export_data'] });
      console.log(`✅ Assigned permissions to ${newUser.email}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Posyandu user already exists: ${user.email}`);
      } else {
        console.error(`❌ Error creating posyandu user ${user.email}:`, error);
      }
    }
  }

  console.log('🎉 Seeding completed!');
  console.log('\n📋 Default accounts:');
  console.log('Admin: admin@posyandu.com / admin123');
  console.log('User:  user@posyandu.com / user123');
  console.log('Posyandu Dahlia: dahlia@posyandu.com / posyandu123');
  console.log('Posyandu Kenanga I: kenanga1@posyandu.com / posyandu123');
  console.log('Posyandu Mawar Merah: mawarmerah@posyandu.com / posyandu123');
  console.log('Posyandu Cempaka: cempaka@posyandu.com / posyandu123');
  console.log('Posyandu Kenanga II: kenanga2@posyandu.com / posyandu123');
  console.log('Posyandu Melati: melati@posyandu.com / posyandu123');

  // Buat data kegiatan dummy
  console.log('\n📊 Creating dummy activity records...');
  const posyanduNames = ["DAHLIA", "KENANGA I", "MAWAR MERAH", "CEMPAKA", "KENANGA II", "MELATI"];
  const today = new Date();

  for (const name of posyanduNames) {
    for (let i = 0; i < 3; i++) { // Buat 3 kegiatan untuk setiap posyandu
      const activityDate = new Date(today);
      activityDate.setMonth(today.getMonth() - i); // Setiap bulan sekali
      activityDate.setDate(1); // Set ke tanggal 1 setiap bulan untuk konsistensi

      try {
        await prisma.activityRecord.create({
          data: {
            posyanduName: name,
            activityDate: activityDate,
            sasaranBalita: Math.floor(Math.random() * 50) + 10,
            sasaranBumil: Math.floor(Math.random() * 20) + 5,
            sasaranRemaja: Math.floor(Math.random() * 30) + 5,
            sasaranLansia: Math.floor(Math.random() * 25) + 5,
            sasaranBusu: Math.floor(Math.random() * 15) + 3,
            sasaranBayi: Math.floor(Math.random() * 10) + 2,
            sasaranDewasa: Math.floor(Math.random() * 40) + 10,
            sasaranBufas: Math.floor(Math.random() * 10) + 2,
            pengunjungBalita: Math.floor(Math.random() * 40) + 5,
            pengunjungBumil: Math.floor(Math.random() * 15) + 2,
            pengunjungRemaja: Math.floor(Math.random() * 25) + 3,
            pengunjungLansia: Math.floor(Math.random() * 20) + 3,
            pengunjungBusu: Math.floor(Math.random() * 10) + 1,
            pengunjungBayi: Math.floor(Math.random() * 8) + 1,
            pengunjungDewasa: Math.floor(Math.random() * 30) + 5,
            pengunjungBufas: Math.floor(Math.random() * 8) + 1,
            fotoUrl: null,
          },
        });
        console.log(`✅ Created activity record for ${name} on ${activityDate.toDateString()}`);
      } catch (error) {
        console.error(`❌ Error creating activity record for ${name}:`, error);
      }
    }
  }

  // Buat data kehadiran dummy
  console.log('\nAttendance Creating dummy attendance records...');
  const dummyFullNames = ["Budi Santoso", "Siti Aminah", "Agus Salim", "Dewi Lestari", "Joko Susilo", "Ani Rahayu"];

  for (const name of posyanduNames) {
    for (let i = 0; i < 5; i++) { // Buat 5 kehadiran untuk setiap posyandu
      const attendanceDate = new Date(today);
      attendanceDate.setDate(today.getDate() - (i * 5)); // Setiap 5 hari sekali

      try {
        await prisma.attendanceRecord.create({
          data: {
            posyanduName: name,
            fullName: dummyFullNames[Math.floor(Math.random() * dummyFullNames.length)],
            attendanceDate: attendanceDate,
          },
        });
        console.log(`✅ Created attendance record for ${name} on ${attendanceDate.toDateString()}`);
      } catch (error) {
        console.error(`❌ Error creating attendance record for ${name}:`, error);
      }
    }
  }

  console.log('\n🎉 Seeding completed!');
  console.log('\n📋 Default accounts:');
  console.log('Admin: admin@posyandu.com / admin123');
  console.log('User:  user@posyandu.com / user123');
  console.log('Posyandu Dahlia: dahlia@posyandu.com / posyandu123');
  console.log('Posyandu Kenanga I: kenanga1@posyandu.com / posyandu123');
  console.log('Posyandu Mawar Merah: mawarmerah@posyandu.com / posyandu123');
  console.log('Posyandu Cempaka: cempaka@posyandu.com / posyandu123');
  console.log('Posyandu Kenanga II: kenanga2@posyandu.com / posyandu123');
  console.log('Posyandu Melati: melati@posyandu.com / posyandu123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
