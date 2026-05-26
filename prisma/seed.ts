import { prisma } from '../src/lib/prisma';

async function main() {
  console.log("🌱 Seeding database using configured client...");

  // 1. Ensure we have an admin user
  const adminEmail = 'dhruvnvishwa@gmail.com';
  let user = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        role: 'ADMIN',
      }
    });
    console.log("Created admin user:", user.email);
  }

  // 2. Define curated tools with new relationship structure
  const toolsData = [
    {
      name: 'Ghostty',
      description: 'A fast, native, feature-rich terminal emulator pushing the boundaries of what is possible.',
      repoUrl: 'https://github.com/ghostty/ghostty',
      stars: 12400,
      platforms: ['macOS', 'Linux'],
      toolTypes: ['CLI Tool']
    },
    {
      name: 'Ollama',
      description: 'Get up and running with large language models locally. Run Llama 3, Mistral, and more.',
      repoUrl: 'https://github.com/ollama/ollama',
      stars: 85000,
      platforms: ['macOS', 'Linux', 'Windows'],
      toolTypes: ['AI Agent', 'CLI Tool']
    },
    {
      name: 'Zed',
      description: 'A high-performance, multiplayer code editor from the creators of Atom and Tree-sitter.',
      repoUrl: 'https://github.com/zed-industries/zed',
      stars: 42000,
      platforms: ['macOS', 'Linux'],
      toolTypes: ['Extension', 'Other']
    },
    {
      name: 'OBS Studio',
      description: 'Free and open source software for video recording and live streaming.',
      repoUrl: 'https://github.com/obsproject/obs-studio',
      stars: 55000,
      platforms: ['Windows', 'macOS', 'Linux'],
      toolTypes: ['Other']
    },
    {
      name: 'MCP Server - SQLite',
      description: 'A Model Context Protocol server that provides direct database access to LLMs.',
      repoUrl: 'https://github.com/modelcontextprotocol/servers',
      stars: 5000,
      platforms: ['Agnostic'],
      toolTypes: ['MCP Server']
    }
  ];

  for (const tool of toolsData) {
    const { platforms, toolTypes, ...toolInfo } = tool;

    await prisma.tool.upsert({
      where: { repoUrl: toolInfo.repoUrl },
      update: {
        stars: toolInfo.stars,
        status: 'ACTIVE',
      },
      create: {
        ...toolInfo,
        userId: user.id,
        status: 'ACTIVE',
        platforms: {
          connectOrCreate: platforms.map(name => ({
            where: { name },
            create: { name }
          }))
        },
        toolTypes: {
          connectOrCreate: toolTypes.map(name => ({
            where: { name },
            create: { name }
          }))
        }
      }
    });
    console.log(`Synced tool: ${toolInfo.name}`);
  }

  console.log("✅ Seeding finished successfully!");
  await prisma.$disconnect();
}

main().catch(err => {
  console.error("Seeding Error:", err);
  process.exit(1);
});
