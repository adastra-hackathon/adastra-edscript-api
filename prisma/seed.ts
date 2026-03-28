import { PrismaClient, GameType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

// picsum.photos/seed/<slug>/<w>/<h> — imagem consistente por seed, funciona em React Native
function slug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function gameImg(label: string, _color: string): string {
  return `https://picsum.photos/seed/game-${slug(label)}/300/180`;
}
function bannerImg(label: string): string {
  return `https://picsum.photos/seed/banner-${slug(label)}/800/300`;
}
function bannerImgMobile(label: string): string {
  return `https://picsum.photos/seed/bnr-m-${slug(label)}/390/200`;
}
function shortcutImg(label: string, _color: string): string {
  return `https://picsum.photos/seed/sc-${slug(label)}/120/120`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin user ─────────────────────────────────────────────────────────────

  const adminEmail = 'admin@edscript.com';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const passwordHash = await bcrypt.hash('Admin@123456', 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        cpf: '00000000000',
        phone: '00000000000',
        birthDate: new Date('1990-01-01'),
        role: 'ADMIN',
        status: 'ACTIVE',
        isEmailVerified: true,
        isPhoneVerified: true,
        credential: { create: { passwordHash } },
        profile: { create: { fullName: 'Admin EdScript', displayName: 'Admin' } },
        wallet: { create: {} },
        termsAcceptances: { create: { termType: 'TERMS_OF_SERVICE', termVersion: '1.0' } },
      },
    });
    console.log('✅ Admin user: admin@edscript.com / Admin@123456');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // ── Providers ──────────────────────────────────────────────────────────────

  const providerDefs = [
    { name: 'Evolution',      slug: 'evolution',      sortOrder: 1, color: '1a2e4a' },
    { name: 'Ezugi',          slug: 'ezugi',          sortOrder: 2, color: 'e07b2a' },
    { name: 'Pragmatic Play', slug: 'pragmatic-play', sortOrder: 3, color: 'e02a2a' },
    { name: 'PG Soft',        slug: 'pg-soft',        sortOrder: 4, color: '2a5ae0' },
    { name: 'Playtech',       slug: 'playtech',       sortOrder: 5, color: '6a2ae0' },
    { name: 'Blueprint',      slug: 'blueprint',      sortOrder: 6, color: '2a9e6a' },
  ];

  const providers = await Promise.all(
    providerDefs.map((p) =>
      prisma.provider.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          name: p.name,
          slug: p.slug,
          logoUrl: shortcutImg(p.name, p.color),
          sortOrder: p.sortOrder,
        },
      })
    )
  );
  const pMap = Object.fromEntries(providers.map((p) => [p.slug, p.id]));
  console.log(`✅ ${providers.length} providers`);

  // ── Categories ─────────────────────────────────────────────────────────────

  const categoryDefs = [
    { name: 'Todos os jogos',    slug: 'todos-os-jogos',    icon: '🎮', sortOrder: 0 },
    { name: 'Populares',         slug: 'populares',          icon: '🔥', sortOrder: 1 },
    { name: 'Novo',              slug: 'novo',               icon: '✨', sortOrder: 2 },
    { name: 'Jogos Do Raul',     slug: 'jogos-do-raul',      icon: '⭐', sortOrder: 3 },
    { name: 'Fast Games',        slug: 'fast-games',         icon: '⚡', sortOrder: 4 },
    { name: 'Instant Games',     slug: 'instant-games',      icon: '⏱', sortOrder: 5 },
    { name: 'Outros Jogos',      slug: 'outros-jogos',       icon: '🎲', sortOrder: 6 },
    { name: 'Roleta',            slug: 'roleta',             icon: '🎡', sortOrder: 7 },
    { name: 'Video Bingo',       slug: 'video-bingo',        icon: '📺', sortOrder: 8 },
    { name: 'Video Slots',       slug: 'video-slots',        icon: '🎰', sortOrder: 9 },
    { name: 'Blackjack',         slug: 'blackjack',          icon: '🃏', sortOrder: 10 },
    { name: 'Fortune',           slug: 'fortune',            icon: '💰', sortOrder: 11 },
    { name: 'Crash Games',       slug: 'crash-games',        icon: '🚀', sortOrder: 12 },
    { name: 'Jogos exclusivos',  slug: 'jogos-exclusivos',   icon: '👑', sortOrder: 13 },
    { name: 'Torneios',          slug: 'torneios',           icon: '🏆', sortOrder: 14 },
    { name: 'Jogo em português', slug: 'jogo-em-portugues',  icon: '🇧🇷', sortOrder: 15 },
    { name: 'Lottery',           slug: 'lottery',            icon: '🎟', sortOrder: 16 },
  ];

  const categories = await Promise.all(
    categoryDefs.map((c) =>
      prisma.gameCategory.upsert({
        where: { slug: c.slug },
        update: {},
        create: c,
      })
    )
  );
  const cMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  console.log(`✅ ${categories.length} categories`);

  // ── Helper: upsert game + relations ───────────────────────────────────────

  async function upsertGame(
    g: {
      name: string;
      slug: string;
      provider: string;
      imageUrl: string;
      type: GameType;
      isPopular: boolean;
      isNew: boolean;
      sortOrder: number;
      cats: string[];
      rtp?: number;
      volatility?: string;
      minBet?: number;
      maxBet?: number;
      description?: string;
      dealerName?: string;
      playersCount?: number;
    }
  ) {
    const game = await prisma.game.upsert({
      where: { slug: g.slug },
      update: {
        imageUrl: g.imageUrl,
        rtp: g.rtp,
        volatility: g.volatility,
        minBet: g.minBet,
        maxBet: g.maxBet,
        description: g.description,
        dealerName: g.dealerName,
        playersCount: g.playersCount,
      },
      create: {
        name: g.name,
        slug: g.slug,
        providerId: pMap[g.provider],
        imageUrl: g.imageUrl,
        type: g.type,
        isPopular: g.isPopular,
        isNew: g.isNew,
        sortOrder: g.sortOrder,
        rtp: g.rtp,
        volatility: g.volatility,
        minBet: g.minBet,
        maxBet: g.maxBet,
        description: g.description,
        dealerName: g.dealerName,
        playersCount: g.playersCount,
      },
    });

    const allCats = [...new Set([...g.cats, 'todos-os-jogos'])];
    for (const slug of allCats) {
      const catId = cMap[slug];
      if (!catId) continue;
      await prisma.gameCategoryRelation.upsert({
        where: { gameId_categoryId: { gameId: game.id, categoryId: catId } },
        update: {},
        create: { gameId: game.id, categoryId: catId },
      });
    }
  }

  // ── Casino Games (20) ──────────────────────────────────────────────────────

  const CASINO = GameType.CASINO;
  const LIVE   = GameType.LIVE_CASINO;

  const casinoGames = [
    { name: 'Fortune Ox',       slug: 'fortune-ox',       provider: 'pg-soft',        imageUrl: gameImg('Fortune Ox',       'c8860a'), type: CASINO, isPopular: true,  isNew: false, sortOrder: 1,  cats: ['populares', 'video-slots', 'fortune'],        rtp: 96.8, volatility: 'high',   minBet: 0.2, maxBet: 100, description: 'Fortune Ox é um slot de 3 rolos com mecânica Hold and Win. Desbloqueie rodadas bônus e acumule multiplicadores épicos.' },
    { name: 'Dragon Hatch',     slug: 'dragon-hatch',     provider: 'pg-soft',        imageUrl: gameImg('Dragon Hatch',     '1a6e2a'), type: CASINO, isPopular: true,  isNew: false, sortOrder: 2,  cats: ['populares', 'video-slots'],                   rtp: 96.74, volatility: 'high',   minBet: 0.2, maxBet: 100, description: 'Dragon Hatch traz dragões em cascata em um grid 6x6. Símbolos combinados desbloqueiam rodadas grátis e multiplicadores.' },
    { name: 'Mine Island',      slug: 'mine-island',      provider: 'pg-soft',        imageUrl: gameImg('Mine Island',      '1a4e8e'), type: CASINO, isPopular: true,  isNew: false, sortOrder: 3,  cats: ['populares', 'video-slots', 'fast-games'],     rtp: 97.0,  volatility: 'medium', minBet: 0.2, maxBet: 100, description: 'Aventura de mineração onde cada rodada pode revelar gemas preciosas e bônus escondidos na ilha.' },
    { name: 'Gates of Olympus', slug: 'gates-of-olympus', provider: 'pragmatic-play', imageUrl: gameImg('Gates Olympus',    '5a1aae'), type: CASINO, isPopular: true,  isNew: false, sortOrder: 4,  cats: ['populares', 'video-slots'],                   rtp: 96.5,  volatility: 'high',   minBet: 0.2, maxBet: 100, description: 'Slot de 6 rolos com mecânica Tumble. Zeus pode aparecer e multiplicar seus ganhos em até 500x.' },
    { name: 'Sweet Bonanza',    slug: 'sweet-bonanza',    provider: 'pragmatic-play', imageUrl: gameImg('Sweet Bonanza',    'e0449e'), type: CASINO, isPopular: true,  isNew: true,  sortOrder: 5,  cats: ['populares', 'novo', 'video-slots'],            rtp: 96.48, volatility: 'high',   minBet: 0.2, maxBet: 100, description: 'Mundo de doces com grid 6x5 e mecânica Tumble. Scatter Pays garante vitórias em qualquer posição.' },
    { name: 'Starlight Princess', slug: 'starlight-princess', provider: 'pragmatic-play', imageUrl: gameImg('Starlight',  'ae1a9e'), type: CASINO, isPopular: true,  isNew: true,  sortOrder: 6,  cats: ['populares', 'novo', 'video-slots'],            rtp: 96.5,  volatility: 'high',   minBet: 0.2, maxBet: 100, description: 'Slot mágico da princesa das estrelas com multiplicadores de rodadas grátis até 10x.' },
    { name: 'Big Bass Bonanza', slug: 'big-bass-bonanza', provider: 'pragmatic-play', imageUrl: gameImg('Big Bass',         '1a5e9e'), type: CASINO, isPopular: false, isNew: true,  sortOrder: 7,  cats: ['novo', 'video-slots'],                        rtp: 96.71, volatility: 'high',   minBet: 0.1, maxBet: 250, description: 'Slot de pesca com pescador bônus colecionando peixes-dinheiro. Rodadas grátis com multiplicadores.' },
    { name: "Book of Dead",     slug: 'book-of-dead',     provider: 'playtech',       imageUrl: gameImg('Book of Dead',    'ae8e1a'), type: CASINO, isPopular: false, isNew: false, sortOrder: 8,  cats: ['video-slots', 'jogos-do-raul'],               rtp: 96.21, volatility: 'high',   minBet: 0.1, maxBet: 100, description: 'Clássico de aventura egípcia. Um símbolo especial expande para cobrir os rolos nas rodadas grátis.' },
    { name: "Gonzo's Quest",    slug: 'gonzos-quest',     provider: 'playtech',       imageUrl: gameImg('Gonzos Quest',    '2a8e6a'), type: CASINO, isPopular: false, isNew: false, sortOrder: 9,  cats: ['video-slots'],                                rtp: 95.97, volatility: 'medium', minBet: 0.2, maxBet: 50,  description: "Siga Gonzo em busca de El Dorado. Mecânica Avalanche com multiplicadores crescentes." },
    { name: 'Starburst',        slug: 'starburst',        provider: 'blueprint',      imageUrl: gameImg('Starburst',       '6a2ae0'), type: CASINO, isPopular: false, isNew: false, sortOrder: 10, cats: ['video-slots'],                                rtp: 96.09, volatility: 'low',    minBet: 0.1, maxBet: 100, description: 'Slot clássico com gemas coloridas e Wild expansivo. Simples e gratificante.' },
    { name: 'Wolf Gold',        slug: 'wolf-gold',        provider: 'pragmatic-play', imageUrl: gameImg('Wolf Gold',       '4a6e2a'), type: CASINO, isPopular: false, isNew: false, sortOrder: 11, cats: ['video-slots', 'fortune'],                     rtp: 96.01, volatility: 'medium', minBet: 0.25,maxBet: 125, description: 'Slot do Velho Oeste com lobos e Moon Wilds. Jackpot progressivo com 3 níveis.' },
    { name: 'Aviator',          slug: 'aviator',          provider: 'pg-soft',        imageUrl: gameImg('Aviator',         'e0321a'), type: CASINO, isPopular: true,  isNew: false, sortOrder: 12, cats: ['populares', 'crash-games', 'fast-games'],     rtp: 97.0,  volatility: 'medium', minBet: 0.1, maxBet: 200, description: 'Crash game onde um avião decola e você escolhe quando retirar. Quanto mais aguarda, maior o multiplicador.' },
    { name: 'Spaceman',         slug: 'spaceman',         provider: 'pragmatic-play', imageUrl: gameImg('Spaceman',        '1a1aae'), type: CASINO, isPopular: false, isNew: true,  sortOrder: 13, cats: ['crash-games', 'novo'],                        rtp: 96.5,  volatility: 'medium', minBet: 0.1, maxBet: 100, description: 'Astronauta em missão cósmica. Multiplicadores crescentes até você decidir pousar.' },
    { name: 'Candy Blitz',      slug: 'candy-blitz',      provider: 'pg-soft',        imageUrl: gameImg('Candy Blitz',     'e05a9e'), type: CASINO, isPopular: false, isNew: true,  sortOrder: 14, cats: ['video-slots', 'novo'],                        rtp: 96.7,  volatility: 'medium', minBet: 0.2, maxBet: 100, description: 'Explosão de doces com mecânica de cascata. Combine balas e acumule vitórias encadeadas.' },
    { name: 'Mahjong Ways',     slug: 'mahjong-ways',     provider: 'pg-soft',        imageUrl: gameImg('Mahjong Ways',    'ae2a2a'), type: CASINO, isPopular: false, isNew: false, sortOrder: 15, cats: ['video-slots', 'jogos-do-raul'],               rtp: 96.5,  volatility: 'medium', minBet: 0.2, maxBet: 100, description: 'Slot inspirado no jogo clássico oriental com 3.125 formas de vencer.' },
    { name: 'Buffalo King',     slug: 'buffalo-king',     provider: 'pragmatic-play', imageUrl: gameImg('Buffalo King',    '6e4a1a'), type: CASINO, isPopular: false, isNew: false, sortOrder: 16, cats: ['video-slots'],                                rtp: 96.52, volatility: 'high',   minBet: 0.25,maxBet: 125, description: 'Reino dos búfalos com megaways e rodadas grátis. Simbolos Wild com multiplicadores.' },
    { name: 'Troll Haven',      slug: 'troll-haven',      provider: 'blueprint',      imageUrl: gameImg('Troll Haven',     '2a7e4a'), type: CASINO, isPopular: false, isNew: false, sortOrder: 17, cats: ['video-slots', 'jogos-exclusivos'],            rtp: 95.9,  volatility: 'medium', minBet: 0.1, maxBet: 100, description: 'Mundo fantástico de trolls com recursos bônus e rodadas grátis com multiplicadores.' },
    { name: 'Diamond Strike',   slug: 'diamond-strike',   provider: 'playtech',       imageUrl: gameImg('Diamond Strike',  '1a9eae'), type: CASINO, isPopular: false, isNew: false, sortOrder: 18, cats: ['video-slots'],                                rtp: 96.48, volatility: 'medium', minBet: 0.25,maxBet: 125, description: 'Clássico com diamantes reluzentes. Jackpot fixo e rodadas grátis.' },
    { name: 'Golden Ox',        slug: 'golden-ox',        provider: 'blueprint',      imageUrl: gameImg('Golden Ox',       'c8a81a'), type: CASINO, isPopular: false, isNew: true,  sortOrder: 19, cats: ['video-slots', 'fortune', 'novo'],             rtp: 96.1,  volatility: 'high',   minBet: 0.2, maxBet: 100, description: 'O Boi de Ouro traz fortuna e multiplicadores em cada rodada festiva.' },
    { name: 'Fire Joker',       slug: 'fire-joker',       provider: 'playtech',       imageUrl: gameImg('Fire Joker',      'e04a1a'), type: CASINO, isPopular: false, isNew: false, sortOrder: 20, cats: ['video-slots'],                                rtp: 96.15, volatility: 'medium', minBet: 0.05,maxBet: 100, description: 'Clássico de 3 rolos com Joker de Fogo que expande e paga em todas as linhas.' },
  ];

  const liveGames = [
    { name: 'Roleta ao Vivo',      slug: 'roleta-ao-vivo',      provider: 'evolution',      imageUrl: gameImg('Roleta Vivo',       '1a2e4a'), type: LIVE, isPopular: true,  isNew: false, sortOrder: 1,  cats: ['populares', 'roleta'],                        rtp: 97.3,  volatility: 'low',    minBet: 1,   maxBet: 5000,  dealerName: 'Sofia M.',    playersCount: 312, description: 'Roleta europeia clássica com dealer ao vivo. Um número, múltiplas possibilidades de aposta.' },
    { name: 'Blackjack ao Vivo',   slug: 'blackjack-ao-vivo',   provider: 'evolution',      imageUrl: gameImg('Blackjack Vivo',    '1a3e2a'), type: LIVE, isPopular: true,  isNew: false, sortOrder: 2,  cats: ['populares', 'blackjack'],                     rtp: 99.5,  volatility: 'low',    minBet: 25,  maxBet: 5000,  dealerName: 'Marco A.',    playersCount: 234, description: 'Blackjack clássico com dealer profissional. Tente chegar a 21 sem ultrapassar.' },
    { name: 'Baccarat ao Vivo',    slug: 'baccarat-ao-vivo',    provider: 'evolution',      imageUrl: gameImg('Baccarat Vivo',     '2a1a4e'), type: LIVE, isPopular: true,  isNew: false, sortOrder: 3,  cats: ['populares', 'outros-jogos'],                  rtp: 98.94, volatility: 'low',    minBet: 5,   maxBet: 5000,  dealerName: 'Li Wei',      playersCount: 156, description: 'Baccarat tradicional com ritmo acelerado. Aposte em Banqueiro, Jogador ou Empate.' },
    { name: 'Speed Roulette',      slug: 'speed-roulette',      provider: 'pragmatic-play', imageUrl: gameImg('Speed Roulette',    'ae2a1a'), type: LIVE, isPopular: true,  isNew: false, sortOrder: 4,  cats: ['populares', 'roleta', 'fast-games'],          rtp: 97.3,  volatility: 'low',    minBet: 10,  maxBet: 3000,  dealerName: 'Ana C.',      playersCount: 189, description: 'Rodadas rápidas de 25 segundos. Perfeita para quem quer mais ação em menos tempo.' },
    { name: 'Lightning Roulette',  slug: 'lightning-roulette',  provider: 'evolution',      imageUrl: gameImg('Lightning',         'c8ae00'), type: LIVE, isPopular: true,  isNew: false, sortOrder: 5,  cats: ['populares', 'roleta', 'jogos-exclusivos'],   rtp: 97.3,  volatility: 'medium', minBet: 20,  maxBet: 5000,  dealerName: 'James R.',    playersCount: 847, description: 'Roleta com raios que adicionam multiplicadores de 50x a 500x em números aleatórios.' },
    { name: 'Crazy Time',          slug: 'crazy-time',          provider: 'evolution',      imageUrl: gameImg('Crazy Time',        'e07a1a'), type: LIVE, isPopular: true,  isNew: false, sortOrder: 6,  cats: ['populares', 'outros-jogos'],                  rtp: 96.08, volatility: 'high',   minBet: 10,  maxBet: 2000,  dealerName: 'Maria S.',    playersCount: 523, description: 'Game show ao vivo com roda gigante e 4 bônus interativos: Pachinko, Cash Hunt, Coin Flip e Crazy Time.' },
    { name: 'Monopoly Live',       slug: 'monopoly-live',       provider: 'evolution',      imageUrl: gameImg('Monopoly Live',     '1a5e9e'), type: LIVE, isPopular: false, isNew: false, sortOrder: 7,  cats: ['outros-jogos', 'instant-games'],              rtp: 96.23, volatility: 'high',   minBet: 10,  maxBet: 2000,  dealerName: 'Carlos B.',   playersCount: 203, description: 'Game show com Mr. Monopoly em 3D. Acumule casas e hotéis para multiplicar seus ganhos.' },
    { name: 'Dream Catcher',       slug: 'dream-catcher',       provider: 'evolution',      imageUrl: gameImg('Dream Catcher',     '9e1aae'), type: LIVE, isPopular: false, isNew: false, sortOrder: 8,  cats: ['outros-jogos'],                               rtp: 96.58, volatility: 'medium', minBet: 5,   maxBet: 2500,  dealerName: 'Elena P.',    playersCount: 98,  description: 'Roda da fortuna com números e multiplicadores. Simples, envolvente e com grandes possibilidades.' },
    { name: 'Ezugi Roulette',      slug: 'ezugi-roulette',      provider: 'ezugi',          imageUrl: gameImg('Ezugi Roulette',    'e07b2a'), type: LIVE, isPopular: false, isNew: false, sortOrder: 9,  cats: ['roleta'],                                     rtp: 97.3,  volatility: 'low',    minBet: 1,   maxBet: 2500,  dealerName: 'Priya K.',    playersCount: 76,  description: 'Roleta europeia da Ezugi com interface moderna e dealer experiente.' },
    { name: 'Andar Bahar',         slug: 'andar-bahar',         provider: 'ezugi',          imageUrl: gameImg('Andar Bahar',       'c82a6a'), type: LIVE, isPopular: false, isNew: true,  sortOrder: 10, cats: ['outros-jogos', 'novo', 'jogo-em-portugues'], rtp: 97.85, volatility: 'low',    minBet: 1,   maxBet: 2000,  dealerName: 'Meera S.',    playersCount: 45,  description: 'Jogo de cartas tradicional indiano. Adivinhe se a carta correspondente cai em Andar ou Bahar.' },
    { name: 'Teen Patti',          slug: 'teen-patti',          provider: 'ezugi',          imageUrl: gameImg('Teen Patti',        '2a8e3a'), type: LIVE, isPopular: false, isNew: false, sortOrder: 11, cats: ['outros-jogos'],                               rtp: 97.95, volatility: 'low',    minBet: 1,   maxBet: 2000,  dealerName: 'Raj V.',      playersCount: 38,  description: 'Pôquer indiano de 3 cartas popular em toda a Ásia. Simples e empolgante.' },
    { name: 'Bet on Numbers',      slug: 'bet-on-numbers',      provider: 'ezugi',          imageUrl: gameImg('Bet Numbers',       '4a2aae'), type: LIVE, isPopular: false, isNew: true,  sortOrder: 12, cats: ['lottery', 'novo'],                            rtp: 97.3,  volatility: 'medium', minBet: 1,   maxBet: 1000,  dealerName: 'Fatima A.',   playersCount: 61,  description: 'Aposte em números de 1 a 80 e veja 20 números sorteados. Quanto mais acerta, mais ganha.' },
    { name: 'Lucky 7',             slug: 'lucky-7',             provider: 'ezugi',          imageUrl: gameImg('Lucky 7',           'ae8a1a'), type: LIVE, isPopular: false, isNew: false, sortOrder: 13, cats: ['outros-jogos', 'instant-games'],              rtp: 96.5,  volatility: 'low',    minBet: 1,   maxBet: 1000,  dealerName: 'Omar H.',     playersCount: 29,  description: 'Cartas numeradas de Ás a 7. Aposte em Alto, Baixo ou 7 exato para multiplicadores máximos.' },
    { name: 'Sic Bo Live',         slug: 'sic-bo-live',         provider: 'ezugi',          imageUrl: gameImg('Sic Bo',            'ae1a5a'), type: LIVE, isPopular: false, isNew: false, sortOrder: 14, cats: ['outros-jogos'],                               rtp: 97.22, volatility: 'medium', minBet: 1,   maxBet: 2000,  dealerName: 'Mei L.',      playersCount: 54,  description: 'Jogo de dados chinês clássico. Preveja o resultado de 3 dados e ganhe até 180x.' },
    { name: 'Mega Roulette',       slug: 'mega-roulette',       provider: 'pragmatic-play', imageUrl: gameImg('Mega Roulette',     'e02a2a'), type: LIVE, isPopular: false, isNew: true,  sortOrder: 15, cats: ['roleta', 'novo'],                             rtp: 97.3,  volatility: 'medium', minBet: 10,  maxBet: 5000,  dealerName: 'Lorenzo F.',  playersCount: 276, description: 'Roleta com multiplicadores Mega que podem atingir até 500x em números sortudos.' },
    { name: 'One Blackjack',       slug: 'one-blackjack',       provider: 'pragmatic-play', imageUrl: gameImg('One Blackjack',     '1a4e2a'), type: LIVE, isPopular: false, isNew: false, sortOrder: 16, cats: ['blackjack'],                                  rtp: 99.5,  volatility: 'low',    minBet: 1,   maxBet: 5000,  dealerName: 'Ana C.',      playersCount: 312, description: 'Blackjack com uma mão compartilhada entre todos os jogadores. Decisões coletivas e prêmios reais.' },
    { name: 'Baccarat Squeeze',    slug: 'baccarat-squeeze',    provider: 'pragmatic-play', imageUrl: gameImg('Baccarat Squeeze',  '2a1a6e'), type: LIVE, isPopular: false, isNew: false, sortOrder: 17, cats: ['outros-jogos'],                               rtp: 98.94, volatility: 'low',    minBet: 10,  maxBet: 10000, dealerName: 'Yu M.',       playersCount: 87,  description: 'Baccarat com o ritual do Squeeze. O dealer revela as cartas lentamente para máxima emoção.' },
    { name: 'Video Bingo Ao Vivo', slug: 'video-bingo-ao-vivo', provider: 'evolution',      imageUrl: gameImg('Video Bingo',       '6a1aae'), type: LIVE, isPopular: false, isNew: false, sortOrder: 18, cats: ['video-bingo'],                                rtp: 96.0,  volatility: 'medium', minBet: 0.5, maxBet: 500,   dealerName: 'Bianca R.',   playersCount: 143, description: 'Bingo ao vivo com cartelas e bolas numeradas. Marque linhas e cartelas completas para grandes prêmios.' },
    { name: 'XXXtreme Lightning',  slug: 'xxxtreme-lightning',  provider: 'evolution',      imageUrl: gameImg('XXXtreme',          'c86a00'), type: LIVE, isPopular: false, isNew: true,  sortOrder: 19, cats: ['roleta', 'novo', 'jogos-exclusivos'],         rtp: 97.3,  volatility: 'high',   minBet: 20,  maxBet: 10000, dealerName: 'Victor N.',   playersCount: 392, description: 'Versão turbinada da Lightning Roulette com multiplicadores dobrados e raios consecutivos.' },
    { name: 'Power Blackjack',     slug: 'power-blackjack',     provider: 'evolution',      imageUrl: gameImg('Power Blackjack',   '1a2a5e'), type: LIVE, isPopular: false, isNew: false, sortOrder: 20, cats: ['blackjack'],                                  rtp: 98.8,  volatility: 'medium', minBet: 25,  maxBet: 5000,  dealerName: 'Elena P.',    playersCount: 178, description: 'Blackjack com a opção de Turbo Double em qualquer mão. Multiplicadores até 8x.' },
  ];

  let gameCount = 0;
  for (const g of [...casinoGames, ...liveGames]) {
    await upsertGame(g);
    gameCount++;
  }
  console.log(`✅ ${gameCount} games`);

  // ── Banners ────────────────────────────────────────────────────────────────

  const bannerDefs = [
    { title: 'Sweet Rush Bonanza',   subtitle: 'Big Wins Await! Play Now',                imageUrl: bannerImg('Sweet Rush Bonanza'),   mobileImageUrl: bannerImgMobile('Sweet Rush Bonanza'),   redirectType: 'game',   redirectValue: 'sweet-bonanza',      sortOrder: 1 },
    { title: 'Bônus de Boas-Vindas', subtitle: 'Até R$ 1.000 no primeiro depósito',        imageUrl: bannerImg('Bonus de Boas-Vindas'), mobileImageUrl: bannerImgMobile('Bonus de Boas-Vindas'), redirectType: 'screen', redirectValue: 'Deposit',            sortOrder: 2 },
    { title: 'Torneio Semanal',      subtitle: 'R$ 50.000 em prêmios toda semana',         imageUrl: bannerImg('Torneio Semanal'),      mobileImageUrl: bannerImgMobile('Torneio Semanal'),      redirectType: 'screen', redirectValue: 'Tournaments',        sortOrder: 3 },
    { title: 'Cashback Exclusivo',   subtitle: 'Recupere até 15% das suas apostas',        imageUrl: bannerImg('Cashback Exclusivo'),   mobileImageUrl: bannerImgMobile('Cashback Exclusivo'),   redirectType: 'screen', redirectValue: 'Bets',               sortOrder: 4 },
    { title: 'Lightning Roulette',   subtitle: 'Multiplique até 500x sua aposta',          imageUrl: bannerImg('Lightning Roulette'),   mobileImageUrl: bannerImgMobile('Lightning Roulette'),   redirectType: 'game',   redirectValue: 'lightning-roulette', sortOrder: 5 },
  ];

  for (const b of bannerDefs) {
    const existing = await prisma.banner.findFirst({ where: { title: b.title } });
    if (existing) {
      await prisma.banner.update({ where: { id: existing.id }, data: { imageUrl: b.imageUrl, mobileImageUrl: b.mobileImageUrl } });
    } else {
      await prisma.banner.create({ data: b });
    }
  }
  console.log(`✅ ${bannerDefs.length} banners`);

  // ── Home Shortcuts ─────────────────────────────────────────────────────────

  const shortcutDefs = [
    { title: 'Prêmio Diário', imageUrl: shortcutImg('premio-diario', 'f0a500'),  redirectType: 'screen', redirectValue: 'Missions',    sortOrder: 1 },
    { title: 'Baú',           imageUrl: shortcutImg('bau',           'c8860a'),  redirectType: 'screen', redirectValue: 'Missions',    sortOrder: 2 },
    { title: 'Missões',       imageUrl: shortcutImg('missoes',       '1a7e4a'),  redirectType: 'screen', redirectValue: 'Missions',    sortOrder: 3 },
    { title: 'Torneios',      imageUrl: shortcutImg('torneios',      '1a2e9e'), redirectType: 'screen', redirectValue: 'Tournaments', sortOrder: 4 },
  ];

  for (const s of shortcutDefs) {
    const existing = await prisma.homeShortcut.findFirst({ where: { title: s.title } });
    if (existing) {
      await prisma.homeShortcut.update({ where: { id: existing.id }, data: { imageUrl: s.imageUrl } });
    } else {
      await prisma.homeShortcut.create({ data: s });
    }
  }
  console.log(`✅ ${shortcutDefs.length} shortcuts`);

  // ── Sports Matches ─────────────────────────────────────────────────────────

  const now = new Date();
  const inHours = (h: number) => new Date(now.getTime() + h * 3600000);
  const inMins = (m: number) => new Date(now.getTime() + m * 60000);
  const agoMins = (m: number) => new Date(now.getTime() - m * 60000);

  const matchDefs = [
    { sport: 'futebol', league: 'Brasileirao Serie A', homeTeam: 'Flamengo',     awayTeam: 'Palmeiras',      startTime: agoMins(67), isLive: true,  minute: 67, homeScore: 2,  awayScore: 1, oddsHome: 1.40, oddsDraw: 4.20, oddsAway: 6.50, homeLogoUrl: `https://picsum.photos/seed/flamengo/60/60`,   awayLogoUrl: `https://picsum.photos/seed/palmeiras/60/60` },
    { sport: 'futebol', league: 'La Liga',             homeTeam: 'Atletico Madrid',awayTeam: 'Sevilla',       startTime: agoMins(33), isLive: true,  minute: 33, homeScore: 0,  awayScore: 0, oddsHome: 2.05, oddsDraw: 3.30, oddsAway: 3.60, homeLogoUrl: `https://picsum.photos/seed/atletico/60/60`,    awayLogoUrl: `https://picsum.photos/seed/sevilla/60/60` },
    { sport: 'basquete', league: 'NBA',                homeTeam: 'Lakers',        awayTeam: 'Celtics',        startTime: agoMins(45), isLive: true,  minute: 45, homeScore: 78, awayScore: 82, oddsHome: 2.10, oddsDraw: 0,    oddsAway: 1.70, homeLogoUrl: `https://picsum.photos/seed/lakers/60/60`,     awayLogoUrl: `https://picsum.photos/seed/celtics/60/60` },
    { sport: 'futebol', league: 'Champions League',    homeTeam: 'Real Madrid',   awayTeam: 'Barcelona',      startTime: inHours(3),  isLive: false, minute: null, homeScore: null, awayScore: null, oddsHome: 2.10, oddsDraw: 3.40, oddsAway: 3.20, homeLogoUrl: `https://picsum.photos/seed/realmadrid/60/60`, awayLogoUrl: `https://picsum.photos/seed/barcelona/60/60` },
    { sport: 'futebol', league: 'Brasileirao',         homeTeam: 'Corinthians',   awayTeam: 'Santos',         startTime: inHours(6),  isLive: false, minute: null, homeScore: null, awayScore: null, oddsHome: 2.30, oddsDraw: 3.10, oddsAway: 2.90, homeLogoUrl: `https://picsum.photos/seed/corinthians/60/60`,awayLogoUrl: `https://picsum.photos/seed/santos/60/60` },
    { sport: 'futebol', league: 'Ligue 1',             homeTeam: 'PSG',           awayTeam: 'Marseille',      startTime: inHours(20), isLive: false, minute: null, homeScore: null, awayScore: null, oddsHome: 1.60, oddsDraw: 3.80, oddsAway: 5.20, homeLogoUrl: `https://picsum.photos/seed/psg/60/60`,        awayLogoUrl: `https://picsum.photos/seed/marseille/60/60` },
    { sport: 'futebol', league: 'Premier League',      homeTeam: 'Arsenal',       awayTeam: 'Manchester City',startTime: inHours(26), isLive: false, minute: null, homeScore: null, awayScore: null, oddsHome: 3.10, oddsDraw: 3.50, oddsAway: 2.20, homeLogoUrl: `https://picsum.photos/seed/arsenal/60/60`,    awayLogoUrl: `https://picsum.photos/seed/mancity/60/60` },
    { sport: 'basquete', league: 'NBA - Conf. Leste',  homeTeam: 'Lakers',        awayTeam: 'Celtics',        startTime: inHours(30), isLive: false, minute: null, homeScore: null, awayScore: null, oddsHome: 1.85, oddsDraw: 0,    oddsAway: 1.95, homeLogoUrl: `https://picsum.photos/seed/lakers/60/60`,     awayLogoUrl: `https://picsum.photos/seed/celtics/60/60` },
    { sport: 'basquete', league: 'NBA',                homeTeam: 'Golden State',  awayTeam: 'Miami Heat',     startTime: inHours(8),  isLive: false, minute: null, homeScore: null, awayScore: null, oddsHome: 1.70, oddsDraw: 0,    oddsAway: 2.10, homeLogoUrl: `https://picsum.photos/seed/gsw/60/60`,        awayLogoUrl: `https://picsum.photos/seed/heat/60/60` },
    { sport: 'tenis',   league: 'ATP Masters',         homeTeam: 'Djokovic',      awayTeam: 'Alcaraz',        startTime: inMins(90),  isLive: false, minute: null, homeScore: null, awayScore: null, oddsHome: 1.90, oddsDraw: 0,    oddsAway: 1.90, homeLogoUrl: `https://picsum.photos/seed/djokovic/60/60`,   awayLogoUrl: `https://picsum.photos/seed/alcaraz/60/60` },
    { sport: 'tenis',   league: 'WTA',                 homeTeam: 'Swiatek',       awayTeam: 'Sabalenka',      startTime: inHours(5),  isLive: false, minute: null, homeScore: null, awayScore: null, oddsHome: 1.75, oddsDraw: 0,    oddsAway: 2.05, homeLogoUrl: `https://picsum.photos/seed/swiatek/60/60`,    awayLogoUrl: `https://picsum.photos/seed/sabalenka/60/60` },
  ];

  await prisma.sportsMatch.deleteMany({});
  await prisma.sportsMatch.createMany({ data: matchDefs });
  console.log(`✅ ${matchDefs.length} sports matches`);

  // ── Game Rooms — Duelo (demo seed) ────────────────────────────────────────

  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  const firstGame = await prisma.game.findFirst({ orderBy: { sortOrder: 'asc' } });

  if (admin && firstGame) {
    const existingRooms = await prisma.gameRoom.count();
    if (existingRooms === 0) {
      await prisma.gameRoom.create({
        data: {
          hostId: admin.id,
          gameId: firstGame.id,
          entryAmount: 20,
          maxPlayers: 6,
          duration: 300,
          isSimulation: true,
          status: 'WAITING',
        },
      });
      console.log('✅ 1 game room (Duelo demo)');
    }

    // ── Prediction Rooms — Apostas (demo seed) ───────────────────────────────

    const existingPredictionRooms = await prisma.predictionRoom.count();
    if (existingPredictionRooms === 0) {
      await prisma.predictionRoom.create({
        data: {
          hostId: admin.id,
          title: 'Champions League — Final Madrid vs Barca',
          entryAmount: 10,
          maxPlayers: 8,
          isSimulation: true,
          status: 'WAITING',
          events: {
            create: [
              {
                title: 'Quem vencerá a partida?',
                sortOrder: 0,
                options: {
                  create: [
                    { label: 'Real Madrid', sortOrder: 0 },
                    { label: 'Barcelona', sortOrder: 1 },
                    { label: 'Empate', sortOrder: 2 },
                  ],
                },
              },
              {
                title: 'Quem marcará o primeiro gol?',
                sortOrder: 1,
                options: {
                  create: [
                    { label: 'Vini Jr', sortOrder: 0 },
                    { label: 'Lewandowski', sortOrder: 1 },
                    { label: 'Bellingham', sortOrder: 2 },
                    { label: 'Outro', sortOrder: 3 },
                  ],
                },
              },
              {
                title: 'Quantos gols no total?',
                sortOrder: 2,
                options: {
                  create: [
                    { label: '0 a 1', sortOrder: 0 },
                    { label: '2 a 3', sortOrder: 1 },
                    { label: '4 ou mais', sortOrder: 2 },
                  ],
                },
              },
            ],
          },
        },
      });
      console.log('✅ 1 prediction room (Apostas demo)');
    }
  }

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
