const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
  const tools = await prisma.tool.findMany();
  for (const tool of tools) {
    const slug = generateSlug(tool.name);
    await prisma.tool.update({
      where: { id: tool.id },
      data: { slug }
    });
    console.log(`Updated ${tool.name} -> ${slug}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
