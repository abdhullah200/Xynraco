import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined;
  connectionRetries: number;
};

// Initialize connection retry counter
if (!globalForPrisma.connectionRetries) {
  globalForPrisma.connectionRetries = 0;
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  errorFormat: "pretty",
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Enhanced connection checker with retry logic
export const ensureConnection = async (maxRetries = 3): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await db.$connect();
      console.log(`Database connection successful on attempt ${i + 1}`);
      globalForPrisma.connectionRetries = 0;
      return true;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error.message);
      globalForPrisma.connectionRetries = i + 1;
      
      if (i < maxRetries - 1) {
        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, i) * 1000;
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        try {
          await db.$disconnect();
        } catch (disconnectError) {
          // Ignore disconnect errors during retry
        }
      }
    }
  }
  
  console.error(`Failed to connect to database after ${maxRetries} attempts`);
  return false;
};

// Handle graceful shutdown
process.on('beforeExit', async () => {
  try {
    await db.$disconnect();
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
});

