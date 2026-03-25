// test-prisma.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const assistant = await prisma.assistant.create({
      data: { name: 'Direct Test User', password: 'securepass123' },
    });
    console.log('Success:', assistant);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
