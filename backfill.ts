import { prisma } from './src/lib/prisma';

function generateSlug(name: string) {
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
