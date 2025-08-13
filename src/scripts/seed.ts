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

  // Buat user posyandu tambahan
  console.log('👤 Creating additional posyandu users...');
  const posyanduUsers = [
    { email: 'renianggraeni@posyandu.com', username: 'renianggraeni', password: 'posyandu123', fullName: 'Reni Anggraeni', posyanduName: 'DAHLIA' },
    { email: 'atikystika@posyandu.com', username: 'atikyustika', password: 'posyandu123', fullName: 'Atik Yustika', posyanduName: 'DAHLIA' },
    { email: 'uunnurhayati@posyandu.com', username: 'uunnurhayati', password: 'posyandu123', fullName: 'UUN Nurhayati', posyanduName: 'DAHLIA' },
    { email: 'mimindahlia@posyandu.com', username: 'mimindahlia', password: 'posyandu123', fullName: 'Mimin', posyanduName: 'DAHLIA' },
    { email: 'hadiyanti@posyandu.com', username: 'hadiyanti', password: 'posyandu123', fullName: 'Hadiyanti', posyanduName: 'DAHLIA' },
    { email: 'iloh@posyandu.com', username: 'iloh', password: 'posyandu123', fullName: 'Iloh', posyanduName: 'DAHLIA' },
    { email: 'kokom@posyandu.com', username: 'kokom', password: 'posyandu123', fullName: 'Kokom', posyanduName: 'DAHLIA' },
    { email: 'dedesumirat@posyandu.com', username: 'dedesumirat', password: 'posyandu123', fullName: 'Dede Sumirat', posyanduName: 'KENANGA I' },
    { email: 'yayahkomariah@posyandu.com', username: 'yayahkomariah', password: 'posyandu123', fullName: 'Yayah Komariah', posyanduName: 'KENANGA I' },
    { email: 'jujujuhanah@posyandu.com', username: 'jujujuhanah', password: 'posyandu123', fullName: 'Juju Juhanah', posyanduName: 'KENANGA I' },
    { email: 'adah@posyandu.com', username: 'adah', password: 'posyandu123', fullName: 'Adah', posyanduName: 'KENANGA I' },
    { email: 'mae@posyandu.com', username: 'mae', password: 'posyandu123', fullName: 'Mae', posyanduName: 'KENANGA I' },
    { email: 'kenoh@posyandu.com', username: 'kenoh', password: 'posyandu123', fullName: 'Kenoh', posyanduName: 'KENANGA I' },
    { email: 'rikcaanisa@posyandu.com', username: 'rikcaanisa', password: 'posyandu123', fullName: 'Rica Anisa', posyanduName: 'KENANGA I' },
    { email: 'nurlaela@posyandu.com', username: 'nurlaela', password: 'posyandu123', fullName: 'Nurlaela', posyanduName: 'MAWAR MERAH' },
    { email: 'tutisusanti@posyandu.com', username: 'tutisusanti', password: 'posyandu123', fullName: 'Tuti Susanti', posyanduName: 'MAWAR MERAH' },
    { email: 'dedewiwin@posyandu.com', username: 'dedewiwin', password: 'posyandu123', fullName: 'Dede Wiwin', posyanduName: 'MAWAR MERAH' },
    { email: 'romyatulhuda@posyandu.com', username: 'romyatulhuda', password: 'posyandu123', fullName: 'Romyatul Huda', posyanduName: 'MAWAR MERAH' },
    { email: 'oning@posyandu.com', username: 'oning', password: 'posyandu123', fullName: 'Oning', posyanduName: 'MAWAR MERAH' },
    { email: 'isah@posyandu.com', username: 'isah', password: 'posyandu123', fullName: 'Isah', posyanduName: 'MAWAR MERAH' },
    { email: 'entinrostini@posyandu.com', username: 'entinrostini', password: 'posyandu123', fullName: 'Entin Rostini', posyanduName: 'MAWAR MERAH' },
    { email: 'iisindrawati@posyandu.com', username: 'iisindrawati', password: 'posyandu123', fullName: 'Iis Indrawati', posyanduName: 'MAWAR MERAH' },
    { email: 'aahsitinurjanah@posyandu.com', username: 'aahsitinurjanah', password: 'posyandu123', fullName: 'Aah Siti Nurjanah', posyanduName: 'MAWAR MERAH' },
    { email: 'ihatsitisholihat@posyandu.com', username: 'ihatsitisholihat', password: 'posyandu123', fullName: 'Ihat Siti Sholihat', posyanduName: 'CEMPAKA' },
    { email: 'erna@posyandu.com', username: 'erna', password: 'posyandu123', fullName: 'Erna', posyanduName: 'CEMPAKA' },
    { email: 'cucutresnawati@posyandu.com', username: 'cucutresnawati', password: 'posyandu123', fullName: 'Cucu Tresnawati', posyanduName: 'CEMPAKA' },
    { email: 'uumrusmiati@posyandu.com', username: 'uumrusmiati', password: 'posyandu123', fullName: 'Uum Rusmiati', posyanduName: 'CEMPAKA' },
    { email: 'unah@posyandu.com', username: 'unah', password: 'posyandu123', fullName: 'Unah', posyanduName: 'CEMPAKA' },
    { email: 'ritasapirarohmatin@posyandu.com', username: 'ritasapirarohmatin', password: 'posyandu123', fullName: 'Rita Sapira Rohmatin', posyanduName: 'CEMPAKA' },
    { email: 'rina@posyandu.com', username: 'rina', password: 'posyandu123', fullName: 'Rina', posyanduName: 'CEMPAKA' },
    { email: 'cicihsusilawati@posyandu.com', username: 'cicihsusilawati', password: 'posyandu123', fullName: 'Cicih Susilawati', posyanduName: 'CEMPAKA' },
    { email: 'etirorahaeti@posyandu.com', username: 'etirorahaeti', password: 'posyandu123', fullName: 'Eti Rohaeti', posyanduName: 'CEMPAKA' },
    { email: 'ati@posyandu.com', username: 'ati', password: 'posyandu123', fullName: 'Ati', posyanduName: 'CEMPAKA' },
    { email: 'ocohhapsoh@posyandu.com', username: 'ocohhapsoh', password: 'posyandu123', fullName: 'Ocoh Hapsoh', posyanduName: 'KENANGA II' },
    { email: 'keninuraeni@posyandu.com', username: 'keninuraeni', password: 'posyandu123', fullName: 'Keni Nuraeni', posyanduName: 'KENANGA II' },
    { email: 'linlinnurlina@posyandu.com', username: 'linlinnurlina', password: 'posyandu123', fullName: 'Linlin Nurlina', posyanduName: 'KENANGA II' },
    { email: 'liayuliani@posyandu.com', username: 'liayuliani', password: 'posyandu123', fullName: 'Lia Yuliani', posyanduName: 'KENANGA II' },
    { email: 'imassuryani@posyandu.com', username: 'imassuryani', password: 'posyandu123', fullName: 'Imas Suryani', posyanduName: 'KENANGA II' },
    { email: 'oom@posyandu.com', username: 'oom', password: 'posyandu123', fullName: 'Oom', posyanduName: 'KENANGA II' },
    { email: 'enoksitihapsoh@posyandu.com', username: 'enoksitihapsoh', password: 'posyandu123', fullName: 'Enok Siti Hapsoh', posyanduName: 'KENANGA II' },
    { email: 'tetisrinurhayati@posyandu.com', username: 'tetisrinurhayati', password: 'posyandu123', fullName: 'Teti Sri Nurhayati', posyanduName: 'KENANGA II' },
    { email: 'sitirohmah@posyandu.com', username: 'sitirohmah', password: 'posyandu123', fullName: 'Siti Rohmah', posyanduName: 'KENANGA II' },
    { email: 'yeyenhendriyani@posyandu.com', username: 'yeyenhendriyani', password: 'posyandu123', fullName: 'Yeyen Hendriyani', posyanduName: 'KENANGA II' },
    { email: 'yatinurhayati@posyandu.com', username: 'yatinurhayati', password: 'posyandu123', fullName: 'Yati Nurhayati', posyanduName: 'MELATI' },
    { email: 'henisusanti@posyandu.com', username: 'henisusanti', password: 'posyandu123', fullName: 'Heni Susanti', posyanduName: 'MELATI' },
    { email: 'ijah@posyandu.com', username: 'Ijah', password: 'posyandu123', fullName: 'Ijah', posyanduName: 'MELATI' },
    { email: 'linamarlina@posyandu.com', username: 'linamarlina', password: 'posyandu123', fullName: 'Lina Marlina', posyanduName: 'MELATI' },
    { email: 'liawarokah@posyandu.com', username: 'liawarokah', password: 'posyandu123', fullName: 'Lia Warokah', posyanduName: 'MELATI' },
    { email: 'miminmelati@posyandu.com', username: 'miminmelati', password: 'posyandu123', fullName: 'Mimin', posyanduName: 'MELATI' },
    { email: 'onihheryani@posyandu.com', username: 'onihheryani', password: 'posyandu123', fullName: 'Onih Heryani', posyanduName: 'MELATI' },
    { email: 'uju@posyandu.com', username: 'uju', password: 'posyandu123', fullName: 'Uju', posyanduName: 'MELATI' },
    { email: 'yeniyulia@posyandu.com', username: 'yeniyulia', password: 'posyandu123', fullName: 'Yeni Yulia', posyanduName: 'MELATI' },
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
  for (const user of posyanduUsers) {
    console.log(`${user.posyanduName}: ${user.email} / ${user.password}`);
  }

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
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
