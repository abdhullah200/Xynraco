

const testConnection = async () => {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('Testing database connection...');
    
    // Try to connect
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    // MongoDB doesn't support $queryRaw, skip this test
    console.log('✅ Skipping raw query (not supported by MongoDB)');
    
    // Try to count users
    const userCount = await prisma.user.count();
    console.log('✅ User count query successful:', userCount, 'users found');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
};

testConnection();