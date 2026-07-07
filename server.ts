import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Stripe from "stripe";

import { db as sqlDb } from "./src/db/index.ts";
import { 
  tenants as tenantsTable, 
  users as usersTable, 
  channels as channelsTable, 
  agentConfigs as agentConfigsTable, 
  knowledgeDocs as knowledgeDocsTable, 
  conversations as conversationsTable, 
  messages as messagesTable 
} from "./src/db/schema.ts";
import { eq, and, desc as descDrizzle, asc as ascDrizzle } from "drizzle-orm";

dotenv.config();

const isSqlEnabled = !!process.env.SQL_HOST;
console.log(`[CA.RO Connect] Database mode: ${isSqlEnabled ? "Cloud SQL PostgreSQL (Drizzle)" : "Local JSON Fallback"}`);

// Define Database file path
const DB_PATH = path.join(process.cwd(), "db.json");

// Helper to write to local DB
function getDb() {
  if (!fs.existsSync(DB_PATH)) {
    const defaultData = seedDatabase();
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (e) {
    const defaultData = seedDatabase();
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error writing to database", e);
  }
}

// Seed mock database to show initial rich demo data
function seedDatabase() {
  const demoUserId = "usr_demo";
  const demoTenantId = "ten_demo";

  const defaultTenants = [
    {
      id: demoTenantId,
      name: "CA.RO Connect Demo",
      slug: "caro-connect-demo",
      plan: "pro",
      status: "active",
      owner_email: "demo@caroconnect.com",
      createdAt: new Date().toISOString(),
      businessSegment: "E-Commerce de Moda",
      businessDescription: "Marca premium de roupas sustentáveis e calçados ecológicos fabricados no Brasil.",
    }
  ];

  const defaultUsers = [
    {
      id: demoUserId,
      email: "demo@caroconnect.com",
      name: "Rony Silva",
      password: "demo", // simple password for local demo
      tenantId: demoTenantId,
    }
  ];

  const defaultChannels = [
    {
      id: "ch_wa_1",
      tenantId: demoTenantId,
      type: "whatsapp_meta",
      identifier: "+55 (11) 99888-7766",
      status: "connected",
    },
    {
      id: "ch_ig_1",
      tenantId: demoTenantId,
      type: "instagram",
      identifier: "@caroconnect.eco",
      status: "connected",
    }
  ];

  const defaultAgentConfigs = [
    {
      id: "ag_1",
      tenantId: demoTenantId,
      agentName: "CA.RO a Assistente Virtual",
      aiEnabled: true,
      systemPrompt: "Você é a CA.RO, assistente inteligente da CA.RO Connect. Seja muito simpática, solícita e use emojis amigáveis 🌿✨. Responda às perguntas dos clientes de forma concisa e objetiva. Nós vendemos roupas de algodão orgânico e calçados ecológicos de alta durabilidade. Nossos prazos de entrega para todo o Brasil variam de 3 a 7 dias úteis. Oferecemos 10% de desconto na primeira compra usando o cupom BEMVINDO10. Caso não saiba alguma informação específica, diga que vai verificar com o atendimento humano e peça o contato de e-mail deles.",
      knowledgeBase: "Cupom BEMVINDO10 fornece 10% de desconto. Entrega de 3 a 7 dias. Roupas sustentáveis.",
    }
  ];

  const defaultKnowledgeDocs = [
    {
      id: "doc_1",
      tenantId: demoTenantId,
      filename: "politica_de_trocas_e_devolucoes.pdf",
      content: "Nossa política de trocas e devoluções aceita solicitações em até 30 dias após o recebimento do produto. O item deve estar na embalagem original, sem sinais de uso, e com a etiqueta fixada. A primeira troca tem frete grátis por nossa conta. Para dar entrada, envie uma mensagem pelo e-mail trocas@caroconnect.eco ou solicite diretamente ao nosso suporte.",
      sizeBytes: 15420,
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "doc_2",
      tenantId: demoTenantId,
      filename: "catalogo_e_valores_2026.pdf",
      content: "Camiseta Clássica Algodão Orgânico: R$ 89,90. Calça Jeans Ecológica Reciclada: R$ 189,90. Tênis de Fibra de Bambu: R$ 249,90. Jaqueta Corta-Vento sustentável: R$ 219,90. Cores disponíveis: Areia, Verde Musgo, Terracota, Branco e Preto. Aceitamos pagamentos via PIX (com 5% de desconto), Boleto e Cartão de Crédito em até 6x sem juros.",
      sizeBytes: 32048,
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    }
  ];

  const defaultConversations = [
    {
      id: "conv_wa_1",
      tenantId: demoTenantId,
      channel: "whatsapp_meta",
      status: "open",
      lead_id: "Mariana Costa",
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: "conv_wa_2",
      tenantId: demoTenantId,
      channel: "whatsapp_meta",
      status: "open",
      lead_id: "Carlos Eduardo (Dúvida sobre Cupom)",
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: "conv_ig_1",
      tenantId: demoTenantId,
      channel: "instagram",
      status: "open",
      lead_id: "gabriela_mendes",
      createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    }
  ];

  const defaultMessages = [
    // Conversation WA 1 - Mariana
    {
      id: "msg_1",
      convId: "conv_wa_1",
      tenantId: demoTenantId,
      role: "user",
      content: "Olá! Gostaria de saber qual o prazo de entrega de vocês para Minas Gerais?",
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: "msg_2",
      convId: "conv_wa_1",
      tenantId: demoTenantId,
      role: "assistant",
      content: "Olá, Mariana! ✨ Tudo bem? Nosso prazo de entrega para Minas Gerais (e qualquer região do Brasil) varia entre 3 a 7 dias úteis após a confirmação do pagamento! 🚚 Se precisar de ajuda para calcular com seu CEP específico, é só me passar!",
      createdAt: new Date(Date.now() - 2 * 3600 * 1000 + 30 * 1000).toISOString(),
    },
    {
      id: "msg_3",
      convId: "conv_wa_1",
      tenantId: demoTenantId,
      role: "user",
      content: "Ah, ótimo! E tem algum cupom de desconto para novos compradores?",
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: "msg_4",
      convId: "conv_wa_1",
      tenantId: demoTenantId,
      role: "assistant",
      content: "Temos sim! 🎉 Você pode aproveitar 10% de desconto na sua primeira compra utilizando o cupom BEMVINDO10 no fechamento do seu pedido! 🌿 Se precisar de ajuda com os tamanhos ou modelos, estou aqui!",
      createdAt: new Date(Date.now() - 5 * 60 * 1000 + 15 * 1000).toISOString(),
    },

    // Conversation WA 2 - Carlos
    {
      id: "msg_5",
      convId: "conv_wa_2",
      tenantId: demoTenantId,
      role: "user",
      content: "Bom dia, o cupom BEMVINDO10 não está aplicando no tênis. Vocês dão desconto no PIX?",
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    },
    {
      id: "msg_6",
      convId: "conv_wa_2",
      tenantId: demoTenantId,
      role: "assistant",
      content: "Bom dia, Carlos! 🌿 Pedimos desculpas pelo transtorno. O cupom deveria funcionar em todo o site. De qualquer forma, nós oferecemos sim 5% de desconto automático para pagamentos via PIX! Esse desconto já acumula no carrinho se você selecionar essa opção de pagamento. 💚 Quer que eu verifique se o modelo do tênis está com algum bloqueio?",
      createdAt: new Date(Date.now() - 5 * 3600 * 1000 + 45 * 1000).toISOString(),
    },

    // Conversation IG 1 - Gabriela
    {
      id: "msg_7",
      convId: "conv_ig_1",
      tenantId: demoTenantId,
      role: "user",
      content: "Oi! Vi a foto da camiseta musgo no feed de vcs. Como funciona para trocar caso fique pequena?",
      createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    },
    {
      id: "msg_8",
      convId: "conv_ig_1",
      tenantId: demoTenantId,
      role: "assistant",
      content: "Oi, Gabi! 😍 Que bom que gostou da nossa camiseta Verde Musgo! Ela é feita de algodão 100% orgânico e tem um toque incrível. Sobre trocas, fique super tranquila: se não servir, você pode solicitar a troca em até 30 dias após receber! O produto precisa estar com etiqueta e sem uso. Ah, e a primeira troca tem o frete de devolução grátis por nossa conta! 🌿🛍️",
      createdAt: new Date(Date.now() - 1 * 3600 * 1000 + 20 * 1000).toISOString(),
    }
  ];

  return {
    tenants: defaultTenants,
    users: defaultUsers,
    channels: defaultChannels,
    agentConfigs: defaultAgentConfigs,
    knowledgeDocs: defaultKnowledgeDocs,
    conversations: defaultConversations,
    messages: defaultMessages,
  };
}

// Lazy initialization of Gemini AI API SDK Client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Falling back to simple rule-based AI.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Lazy initialization of Stripe Client for real payments when configured
let stripeClientInstance: Stripe | null = null;
function getStripeInstance(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  if (!stripeClientInstance) {
    stripeClientInstance = new Stripe(key, {
      apiVersion: "2025-01-27" as any,
    });
  }
  return stripeClientInstance;
}

// Unified AI Response Generator (supports Anthropic Claude & Google Gemini)
async function generateAIResponse(prompt: string): Promise<string> {
  const claudeKey = process.env.ANTHROPIC_API_KEY;
  if (claudeKey) {
    try {
      console.log("[AI Engine] Querying Anthropic Claude API (claude-3-5-sonnet-20241022)...");
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": claudeKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          messages: [
            { role: "user", content: prompt }
          ]
        })
      });

      if (response.ok) {
        const data: any = await response.json();
        const text = data.content?.[0]?.text;
        if (text) {
          console.log("[AI Engine] Claude response generated successfully.");
          return text;
        }
      } else {
        const errText = await response.text();
        console.error("[AI Engine] Claude API returned error:", errText);
      }
    } catch (err) {
      console.error("[AI Engine] Claude API connection failed:", err);
    }
  }

  // Fallback 1: Google Gemini API
  const geminiClient = getAIClient();
  if (geminiClient) {
    try {
      console.log("[AI Engine] Querying Google Gemini API (gemini-3.5-flash)...");
      const response = await geminiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      if (response.text) {
        console.log("[AI Engine] Gemini response generated successfully.");
        return response.text;
      }
    } catch (err) {
      console.error("[AI Engine] Gemini API connection failed:", err);
    }
  }

  // Fallback 2: Local Rule-Based Mock Engine (runs offline)
  console.log("[AI Engine] Model APIs unavailable. Running local business rule-based simulation.");
  const lowerText = prompt.toLowerCase();
  if (lowerText.includes("olá") || lowerText.includes("oi") || lowerText.includes("bom dia") || lowerText.includes("boa tarde")) {
    return "Olá! Seja muito bem-vindo! 🌿 Como posso ajudar você hoje?";
  } else if (lowerText.includes("prazo") || lowerText.includes("entrega") || lowerText.includes("frete")) {
    return "Nosso prazo de entrega padrão para todo o Brasil varia entre 3 a 7 dias úteis! 🚚 Se quiser que eu calcule o frete exato para o seu CEP, basta digitá-lo aqui.";
  } else if (lowerText.includes("cupom") || lowerText.includes("desconto")) {
    return "Temos sim! Use o cupom BEMVINDO10 e ganhe 10% de desconto na sua primeira compra! 🎉 Além disso, oferecemos 5% de desconto automático para pagamentos via PIX.";
  } else if (lowerText.includes("troca") || lowerText.includes("devolução")) {
    return "Fique super tranquilo(a)! Aceitamos trocas ou devoluções em até 30 dias após o recebimento. O frete da primeira troca é totalmente por nossa conta! 🌿";
  } else {
    return "Agradeço sua mensagem! ✨ Como assistente virtual do negócio, estou pronto para tirar todas as suas dúvidas. Deseja saber mais sobre nossos produtos, políticas de entrega ou formas de pagamento?";
  }
}

// PostgreSQL Seeding on startup
async function seedCloudSqlIfNeeded() {
  if (!isSqlEnabled) return;
  try {
    const existingTenants = await sqlDb.select().from(tenantsTable).limit(1);
    if (existingTenants.length > 0) {
      console.log("[Cloud SQL] Database already seeded.");
      return;
    }
    console.log("[Cloud SQL] Seeding default records into PostgreSQL...");
    const demoUserId = "usr_demo";
    const demoTenantId = "ten_demo";

    await sqlDb.insert(tenantsTable).values({
      id: demoTenantId,
      name: "CA.RO Connect Demo",
      slug: "caro-connect-demo",
      plan: "pro",
      status: "active",
      ownerEmail: "demo@caroconnect.com",
      businessSegment: "E-Commerce de Moda",
      businessDescription: "Marca premium de roupas sustentáveis e calçados ecológicos fabricados no Brasil.",
    });

    await sqlDb.insert(usersTable).values({
      id: demoUserId,
      email: "demo@caroconnect.com",
      name: "Rony Silva",
      password: "demo",
      tenantId: demoTenantId,
    });

    await sqlDb.insert(channelsTable).values([
      {
        id: "ch_wa_1",
        tenantId: demoTenantId,
        type: "whatsapp_meta",
        identifier: "+55 (11) 99888-7766",
        status: "connected",
      },
      {
        id: "ch_ig_1",
        tenantId: demoTenantId,
        type: "instagram",
        identifier: "@caroconnect.eco",
        status: "connected",
      }
    ]);

    await sqlDb.insert(agentConfigsTable).values({
      id: "ag_1",
      tenantId: demoTenantId,
      agentName: "CA.RO a Assistente Virtual",
      aiEnabled: true,
      systemPrompt: "Você é a CA.RO, assistente inteligente da CA.RO Connect. Seja muito simpática, solícita e use emojis amigáveis 🌿✨. Responda às perguntas dos clientes de forma concisa e objetiva. Nós vendemos roupas de algodão orgânico e calçados ecológicos de alta durabilidade. Nossos prazos de entrega para todo o Brasil variam de 3 a 7 dias úteis. Oferecemos 10% de desconto na primeira compra usando o cupom BEMVINDO10. Caso não saiba alguma informação específica, diga que vai verificar com o atendimento humano e peça o contato de e-mail deles.",
      knowledgeBase: "Cupom BEMVINDO10 fornece 10% de desconto. Entrega de 3 a 7 dias. Roupas sustentáveis.",
    });

    await sqlDb.insert(knowledgeDocsTable).values([
      {
        id: "doc_1",
        tenantId: demoTenantId,
        filename: "politica_de_trocas_e_devolucoes.pdf",
        content: "Nossa política de trocas e devoluções aceita solicitações em até 30 dias após o recebimento do produto. O item deve estar na embalagem original, sem sinais de uso, e com a etiqueta fixada. A primeira troca tem frete grátis por nossa conta. Para dar entrada, envie uma mensagem pelo e-mail trocas@caroconnect.eco ou solicite diretamente ao nosso suporte.",
        sizeBytes: 15420,
      },
      {
        id: "doc_2",
        tenantId: demoTenantId,
        filename: "catalogo_e_valores_2026.pdf",
        content: "Camiseta Clássica Algodão Orgânico: R$ 89,90. Calça Jeans Ecológica Reciclada: R$ 189,90. Tênis de Fibra de Bambu: R$ 249,90. Jaqueta Corta-Vento sustentável: R$ 219,90. Cores disponíveis: Areia, Verde Musgo, Terracota, Branco e Preto. Aceitamos pagamentos via PIX (com 5% de desconto), Boleto e Cartão de Crédito em até 6x sem juros.",
        sizeBytes: 32048,
      }
    ]);

    await sqlDb.insert(conversationsTable).values([
      {
        id: "conv_wa_1",
        tenantId: demoTenantId,
        channel: "whatsapp_meta",
        status: "open",
        leadId: "Mariana Costa",
        phone: "+55 (11) 98765-4321",
        email: "mariana.costa@outlook.com.br",
        location: "Belo Horizonte, MG",
        statusTag: "Lead Quente 🔥",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        notes: "Interessada na camiseta verde musgo e quer cupom de primeira compra.",
      },
      {
        id: "conv_wa_2",
        tenantId: demoTenantId,
        channel: "whatsapp_meta",
        status: "open",
        leadId: "Carlos Eduardo (Dúvida sobre Cupom)",
        phone: "+55 (19) 99122-3344",
        email: "carlos.edu@gmail.com",
        location: "Campinas, SP",
        statusTag: "Suporte 🛠️",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        notes: "Teve problemas com o cupom de desconto ao comprar o tênis. Informado sobre o desconto de 5% no PIX.",
      },
      {
        id: "conv_ig_1",
        tenantId: demoTenantId,
        channel: "instagram",
        status: "open",
        leadId: "gabriela_mendes",
        phone: "@gabriela_mendes",
        email: "gabi.mendes@gmail.com",
        location: "Rio de Janeiro, RJ",
        statusTag: "Negociação 🏷️",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        notes: "Gostou da camiseta musgo no Instagram e perguntou sobre a política de devoluções.",
      }
    ]);

    await sqlDb.insert(messagesTable).values([
      {
        id: "msg_1",
        convId: "conv_wa_1",
        tenantId: demoTenantId,
        role: "user",
        content: "Olá! Gostaria de saber qual o prazo de entrega de vocês para Minas Gerais?",
      },
      {
        id: "msg_2",
        convId: "conv_wa_1",
        tenantId: demoTenantId,
        role: "assistant",
        content: "Olá, Mariana! ✨ Tudo bem? Nosso prazo de entrega para Minas Gerais (e qualquer região do Brasil) varia entre 3 a 7 dias úteis após a confirmação do pagamento! 🚚 Se precisar de ajuda para calcular com seu CEP específico, é só me passar!",
      },
      {
        id: "msg_3",
        convId: "conv_wa_1",
        tenantId: demoTenantId,
        role: "user",
        content: "Ah, ótimo! E tem algum cupom de desconto para novos compradores?",
      },
      {
        id: "msg_4",
        convId: "conv_wa_1",
        tenantId: demoTenantId,
        role: "assistant",
        content: "Temos sim! 🎉 Você pode aproveitar 10% de desconto na sua primeira compra utilizando o cupom BEMVINDO10 no fechamento do seu pedido! 🌿 Se precisar de ajuda com os tamanhos ou modelos, estou aqui!",
      },
      {
        id: "msg_5",
        convId: "conv_wa_2",
        tenantId: demoTenantId,
        role: "user",
        content: "Bom dia, o cupom BEMVINDO10 não está aplicando no tênis. Vocês dão desconto no PIX?",
      },
      {
        id: "msg_6",
        convId: "conv_wa_2",
        tenantId: demoTenantId,
        role: "assistant",
        content: "Bom dia, Carlos! 🌿 Pedimos desculpas pelo transtorno. O cupom deveria funcionar em todo o site. De qualquer forma, nós oferecemos sim 5% de desconto automático para pagamentos via PIX! Esse desconto já acumula no carrinho se você selecionar essa opção de pagamento. 💚 Quer que eu verifique se o modelo do tênis está com algum bloqueio?",
      },
      {
        id: "msg_7",
        convId: "conv_ig_1",
        tenantId: demoTenantId,
        role: "user",
        content: "Oi! Vi a foto da camiseta musgo no feed de vcs. Como funciona para trocar caso fique pequena?",
      },
      {
        id: "msg_8",
        convId: "conv_ig_1",
        tenantId: demoTenantId,
        role: "assistant",
        content: "Oi, Gabi! 😍 Que bom que gostou da nossa camiseta Verde Musgo! Ela é feita de algodão 100% orgânico e tem um toque incrível. Sobre trocas, fique super tranquila: se não servir, você pode solicitar a troca em até 30 dias após receber! O produto precisa estar com etiqueta e sem uso. Ah, e a primeira troca tem o frete de devolução grátis por nossa conta! 🌿🛍️",
      }
    ]);
    console.log("[Cloud SQL] Seeding completed successfully.");
  } catch (err) {
    console.error("[Cloud SQL] Seeding failed:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Call Seeder
  await seedCloudSqlIfNeeded();

  // 1. AUTHENTICATION ENDPOINTS
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name, plan } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "E-mail, senha e nome são obrigatórios" });
    }

    try {
      if (isSqlEnabled) {
        const existing = await sqlDb.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
        if (existing.length > 0) {
          return res.status(400).json({ error: "E-mail já cadastrado" });
        }

        const tenantId = `ten_${Math.random().toString(36).substring(2, 11)}`;
        const userId = `usr_${Math.random().toString(36).substring(2, 11)}`;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

        const newTenant = {
          id: tenantId,
          name,
          slug,
          plan: plan || "starter",
          status: plan === "enterprise" ? "pending_payment" : "active",
          ownerEmail: email.toLowerCase(),
        };

        const newUser = {
          id: userId,
          email: email.toLowerCase(),
          name,
          password,
          tenantId,
        };

        const newAgentConfig = {
          id: `ag_${Math.random().toString(36).substring(2, 11)}`,
          tenantId,
          agentName: "CA.RO a Assistente Virtual",
          aiEnabled: true,
          systemPrompt: `Você é a CA.RO, assistente inteligente oficial da ${name}. Responda às dúvidas dos clientes com simpatia e clareza, sempre auxiliando no processo de vendas e suporte.`,
        };

        await sqlDb.insert(tenantsTable).values(newTenant);
        await sqlDb.insert(usersTable).values(newUser);
        await sqlDb.insert(agentConfigsTable).values(newAgentConfig);

        return res.json({
          user: { id: newUser.id, email: newUser.email, name: newUser.name, tenantId },
          tenant: { ...newTenant, owner_email: newTenant.ownerEmail },
        });
      }
    } catch (dbErr) {
      console.error("[SQL Auth Register Error]", dbErr);
    }

    // Local DB Fallback
    const db = getDb();
    const existingUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    const tenantId = `ten_${Math.random().toString(36).substring(2, 11)}`;
    const userId = `usr_${Math.random().toString(36).substring(2, 11)}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const newTenant = {
      id: tenantId,
      name,
      slug,
      plan: plan || "starter",
      status: plan === "enterprise" ? "pending_payment" : "active",
      owner_email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      name,
      password,
      tenantId,
    };

    const newAgentConfig = {
      id: `ag_${Math.random().toString(36).substring(2, 11)}`,
      tenantId,
      agentName: "CA.RO a Assistente Virtual",
      aiEnabled: true,
      systemPrompt: `Você é a CA.RO, assistente inteligente oficial da ${name}. Responda às dúvidas dos clientes com simpatia e clareza, sempre auxiliando no processo de vendas e suporte.`,
    };

    db.tenants.push(newTenant);
    db.users.push(newUser);
    db.agentConfigs.push(newAgentConfig);
    saveDb(db);

    res.json({
      user: { id: newUser.id, email: newUser.email, name: newUser.name, tenantId },
      tenant: newTenant,
    });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
    }

    try {
      if (isSqlEnabled) {
        const foundUsers = await sqlDb.select().from(usersTable).where(
          and(
            eq(usersTable.email, email.toLowerCase()),
            eq(usersTable.password, password)
          )
        ).limit(1);

        if (foundUsers.length > 0) {
          const user = foundUsers[0];
          const foundTenants = await sqlDb.select().from(tenantsTable).where(eq(tenantsTable.id, user.tenantId || "")).limit(1);
          const tenant = foundTenants[0] || null;

          return res.json({
            user: { id: user.id, email: user.email, name: user.name, tenantId: user.tenantId },
            tenant: tenant ? { ...tenant, owner_email: tenant.ownerEmail } : null,
          });
        }
      }
    } catch (dbErr) {
      console.error("[SQL Auth Login Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const tenant = db.tenants.find((t: any) => t.id === user.tenantId);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, tenantId: user.tenantId },
      tenant,
    });
  });

  // 2. TENANT & ONBOARDING ENDPOINTS
  app.post("/api/tenant/onboard", async (req, res) => {
    const { tenantId, segment, description, channels } = req.body;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID é obrigatório" });
    }

    try {
      if (isSqlEnabled) {
        // Update Tenant Info
        await sqlDb.update(tenantsTable).set({
          businessSegment: segment,
          businessDescription: description,
        }).where(eq(tenantsTable.id, tenantId));

        // Get tenant name to update agent prompt
        const tenantList = await sqlDb.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);
        if (tenantList.length > 0) {
          const tenant = tenantList[0];
          
          // Update Agent Config System Prompt
          await sqlDb.update(agentConfigsTable).set({
            systemPrompt: `Você é a assistente virtual inteligente da ${tenant.name}. Nós atuamos no segmento de ${segment}.\n\nSobre nosso negócio:\n${description}\n\nSeja atenciosa, prestativa e procure ajudar o cliente a sanar dúvidas e fechar compras! Use emojis amigáveis ✨🌿.`,
          }).where(eq(agentConfigsTable.tenantId, tenantId));
        }

        // Add channels
        if (channels && Array.isArray(channels)) {
          await sqlDb.delete(channelsTable).where(eq(channelsTable.tenantId, tenantId));
          for (const ch of channels) {
            await sqlDb.insert(channelsTable).values({
              id: `ch_${Math.random().toString(36).substring(2, 11)}`,
              tenantId,
              type: ch.type,
              identifier: ch.identifier,
              status: "connected",
            });
          }
        }

        const freshTenant = await sqlDb.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);
        return res.json({ success: true, tenant: freshTenant[0] ? { ...freshTenant[0], owner_email: freshTenant[0].ownerEmail } : null });
      }
    } catch (dbErr) {
      console.error("[SQL Onboarding Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    const tenantIndex = db.tenants.findIndex((t: any) => t.id === tenantId);
    if (tenantIndex === -1) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    db.tenants[tenantIndex].businessSegment = segment;
    db.tenants[tenantIndex].businessDescription = description;

    const agentConfigIndex = db.agentConfigs.findIndex((ac: any) => ac.tenantId === tenantId);
    if (agentConfigIndex !== -1) {
      db.agentConfigs[agentConfigIndex].systemPrompt = `Você é a assistente virtual inteligente da ${db.tenants[tenantIndex].name}. Nós atuamos no segmento de ${segment}.\n\nSobre nosso negócio:\n${description}\n\nSeja atenciosa, prestativa e procure ajudar o cliente a sanar dúvidas e fechar compras! Use emojis amigáveis ✨🌿.`;
    }

    if (channels && Array.isArray(channels)) {
      db.channels = db.channels.filter((c: any) => c.tenantId !== tenantId);
      channels.forEach((ch: any) => {
        db.channels.push({
          id: `ch_${Math.random().toString(36).substring(2, 11)}`,
          tenantId,
          type: ch.type,
          identifier: ch.identifier,
          status: "connected",
        });
      });
    }

    saveDb(db);
    res.json({ success: true, tenant: db.tenants[tenantIndex] });
  });

  app.get("/api/tenant/stats", async (req, res) => {
    const { tenantId } = req.query;
    if (!tenantId || typeof tenantId !== "string") {
      return res.status(400).json({ error: "Tenant ID é obrigatório" });
    }

    try {
      if (isSqlEnabled) {
        const convList = await sqlDb.select().from(conversationsTable).where(eq(conversationsTable.tenantId, tenantId));
        const msgList = await sqlDb.select().from(messagesTable).where(eq(messagesTable.tenantId, tenantId));
        const docList = await sqlDb.select().from(knowledgeDocsTable).where(eq(knowledgeDocsTable.tenantId, tenantId));
        const chanList = await sqlDb.select().from(channelsTable).where(
          and(
            eq(channelsTable.tenantId, tenantId),
            eq(channelsTable.status, "connected")
          )
        );

        const assistantCount = msgList.filter((m) => m.role === "assistant").length;
        const userCount = msgList.filter((m) => m.role === "user").length;
        const aiResponseRate = userCount > 0 ? Math.round((assistantCount / userCount) * 100) : 100;

        return res.json({
          totalConversations: convList.length,
          activeLeads: [...new Set(convList.map((c) => c.leadId))].length,
          aiResponseRate: Math.min(aiResponseRate, 100),
          totalKnowledgeDocs: docList.length,
          activeChannels: chanList.length,
        });
      }
    } catch (dbErr) {
      console.error("[SQL Stats Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    const tenantConvs = db.conversations.filter((c: any) => c.tenantId === tenantId);
    const tenantMsgs = db.messages.filter((m: any) => m.tenantId === tenantId);
    const tenantDocs = db.knowledgeDocs.filter((d: any) => d.tenantId === tenantId);
    const tenantChs = db.channels.filter((c: any) => c.tenantId === tenantId && c.status === "connected");

    const assistantCount = tenantMsgs.filter((m: any) => m.role === "assistant").length;
    const userCount = tenantMsgs.filter((m: any) => m.role === "user").length;
    const aiResponseRate = userCount > 0 ? Math.round((assistantCount / userCount) * 100) : 100;

    res.json({
      totalConversations: tenantConvs.length,
      activeLeads: [...new Set(tenantConvs.map((c: any) => c.lead_id))].length,
      aiResponseRate: Math.min(aiResponseRate, 100),
      totalKnowledgeDocs: tenantDocs.length,
      activeChannels: tenantChs.length,
    });
  });

  // 3. AGENT CONFIGURATION
  app.get("/api/tenant/agent-config", async (req, res) => {
    const { tenantId } = req.query;
    if (!tenantId || typeof tenantId !== "string") {
      return res.status(400).json({ error: "Tenant ID é obrigatório" });
    }

    try {
      if (isSqlEnabled) {
        const configs = await sqlDb.select().from(agentConfigsTable).where(eq(agentConfigsTable.tenantId, tenantId)).limit(1);
        if (configs.length > 0) {
          const config = configs[0];
          return res.json({
            id: config.id,
            tenantId: config.tenantId,
            agentName: config.agentName,
            aiEnabled: config.aiEnabled,
            systemPrompt: config.systemPrompt,
            knowledgeBase: config.knowledgeBase,
          });
        } else {
          // Auto create
          const newConfig = {
            id: `ag_${Math.random().toString(36).substring(2, 11)}`,
            tenantId,
            agentName: "CA.RO a Assistente Virtual",
            aiEnabled: true,
            systemPrompt: "Você é a CA.RO, assistente inteligente super educada.",
          };
          await sqlDb.insert(agentConfigsTable).values(newConfig);
          return res.json(newConfig);
        }
      }
    } catch (dbErr) {
      console.error("[SQL Get AgentConfig Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    let config = db.agentConfigs.find((ac: any) => ac.tenantId === tenantId);
    if (!config) {
      config = {
        id: `ag_${Math.random().toString(36).substring(2, 11)}`,
        tenantId,
        agentName: "CA.RO a Assistente Virtual",
        aiEnabled: true,
        systemPrompt: "Você é a CA.RO, assistente inteligente super educada.",
      };
      db.agentConfigs.push(config);
      saveDb(db);
    }
    res.json(config);
  });

  app.post("/api/tenant/agent-config", async (req, res) => {
    const { tenantId, agentName, aiEnabled, systemPrompt } = req.body;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID é obrigatório" });
    }

    try {
      if (isSqlEnabled) {
        const existing = await sqlDb.select().from(agentConfigsTable).where(eq(agentConfigsTable.tenantId, tenantId)).limit(1);
        if (existing.length > 0) {
          await sqlDb.update(agentConfigsTable).set({
            agentName,
            aiEnabled,
            systemPrompt,
          }).where(eq(agentConfigsTable.tenantId, tenantId));
        } else {
          await sqlDb.insert(agentConfigsTable).values({
            id: `ag_${Math.random().toString(36).substring(2, 11)}`,
            tenantId,
            agentName,
            aiEnabled,
            systemPrompt,
          });
        }
        return res.json({ success: true });
      }
    } catch (dbErr) {
      console.error("[SQL Post AgentConfig Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    const index = db.agentConfigs.findIndex((ac: any) => ac.tenantId === tenantId);
    if (index !== -1) {
      db.agentConfigs[index].agentName = agentName;
      db.agentConfigs[index].aiEnabled = aiEnabled;
      db.agentConfigs[index].systemPrompt = systemPrompt;
    } else {
      db.agentConfigs.push({
        id: `ag_${Math.random().toString(36).substring(2, 11)}`,
        tenantId,
        agentName,
        aiEnabled,
        systemPrompt,
      });
    }
    saveDb(db);
    res.json({ success: true });
  });

  // 4. KNOWLEDGE BASE DOCUMENTS
  app.get("/api/tenant/knowledge-docs", async (req, res) => {
    const { tenantId } = req.query;
    if (!tenantId || typeof tenantId !== "string") {
      return res.status(400).json({ error: "Tenant ID é obrigatório" });
    }

    try {
      if (isSqlEnabled) {
        const docs = await sqlDb.select().from(knowledgeDocsTable).where(eq(knowledgeDocsTable.tenantId, tenantId));
        return res.json(docs);
      }
    } catch (dbErr) {
      console.error("[SQL Get KnowledgeDocs Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    const docs = db.knowledgeDocs.filter((kd: any) => kd.tenantId === tenantId);
    res.json(docs);
  });

  app.post("/api/tenant/knowledge-docs", async (req, res) => {
    const { tenantId, filename, content } = req.body;
    if (!tenantId || !filename || !content) {
      return res.status(400).json({ error: "Faltando dados para criar documento de conhecimento" });
    }

    try {
      if (isSqlEnabled) {
        const newDoc = {
          id: `doc_${Math.random().toString(36).substring(2, 11)}`,
          tenantId,
          filename,
          content,
          sizeBytes: content.length * 2,
        };
        await sqlDb.insert(knowledgeDocsTable).values(newDoc);
        return res.json(newDoc);
      }
    } catch (dbErr) {
      console.error("[SQL Post KnowledgeDocs Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    const newDoc = {
      id: `doc_${Math.random().toString(36).substring(2, 11)}`,
      tenantId,
      filename,
      content,
      sizeBytes: content.length * 2,
      createdAt: new Date().toISOString(),
    };
    db.knowledgeDocs.push(newDoc);
    saveDb(db);
    res.json(newDoc);
  });

  app.delete("/api/tenant/knowledge-docs/:id", async (req, res) => {
    const { id } = req.params;
    const { tenantId } = req.query;
    if (!tenantId || typeof tenantId !== "string") {
      return res.status(400).json({ error: "Tenant ID é obrigatório" });
    }

    try {
      if (isSqlEnabled) {
        await sqlDb.delete(knowledgeDocsTable).where(
          and(
            eq(knowledgeDocsTable.id, id),
            eq(knowledgeDocsTable.tenantId, tenantId)
          )
        );
        return res.json({ success: true });
      }
    } catch (dbErr) {
      console.error("[SQL Delete KnowledgeDoc Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    db.knowledgeDocs = db.knowledgeDocs.filter((kd: any) => !(kd.id === id && kd.tenantId === tenantId));
    saveDb(db);
    res.json({ success: true });
  });

  // 5. CONVERSATIONS & CHAT ENGINE
  app.get("/api/conversations", async (req, res) => {
    const { tenantId, channel } = req.query;
    if (!tenantId || typeof tenantId !== "string") {
      return res.status(400).json({ error: "Tenant ID é obrigatório" });
    }

    try {
      if (isSqlEnabled) {
        let conditions = eq(conversationsTable.tenantId, tenantId);
        let convs = await sqlDb.select().from(conversationsTable).where(conditions);
        
        let updated = false;
        convs = await Promise.all(convs.map(async (c) => {
          let changed = false;
          let phone = c.phone;
          let email = c.email;
          let location = c.location;
          let statusTag = c.statusTag;
          let avatarUrl = c.avatarUrl;
          let notes = c.notes;

          if (!phone) {
            if (c.leadId.includes("Mariana")) phone = "+55 (11) 98765-4321";
            else if (c.leadId.includes("Carlos")) phone = "+55 (19) 99122-3344";
            else if (c.leadId.includes("gabriela")) phone = "@gabriela_mendes";
            else if (c.leadId.includes("Roni") || c.leadId.includes("Rony")) phone = "@ronysiilvaa";
            else phone = c.channel === "whatsapp_meta" ? "+55 (11) 9" + Math.floor(10000000 + Math.random() * 90000000) : "@" + c.leadId.toLowerCase().replace(/\s+/g, "_");
            changed = true;
          }
          if (!email) {
            if (c.leadId.includes("Mariana")) email = "mariana.costa@outlook.com.br";
            else if (c.leadId.includes("Carlos")) email = "carlos.edu@gmail.com";
            else if (c.leadId.includes("gabriela")) email = "gabi.mendes@gmail.com";
            else if (c.leadId.includes("Roni") || c.leadId.includes("Rony")) email = "roni.silva@gmail.com";
            else email = c.leadId.toLowerCase().replace(/\s+/g, ".") + "@exemplo.com";
            changed = true;
          }
          if (!location) {
            if (c.leadId.includes("Mariana")) location = "Belo Horizonte, MG";
            else if (c.leadId.includes("Carlos")) location = "Campinas, SP";
            else if (c.leadId.includes("gabriela")) location = "Rio de Janeiro, RJ";
            else if (c.leadId.includes("Roni") || c.leadId.includes("Rony")) location = "São Paulo, SP";
            else location = "São Paulo, SP";
            changed = true;
          }
          if (!statusTag) {
            if (c.leadId.includes("Mariana")) statusTag = "Lead Quente 🔥";
            else if (c.leadId.includes("Carlos")) statusTag = "Suporte 🛠️";
            else if (c.leadId.includes("gabriela")) statusTag = "Negociação 🏷️";
            else if (c.leadId.includes("Roni") || c.leadId.includes("Rony")) statusTag = "Interesse Geral ✨";
            else statusTag = "Novo Lead 🆕";
            changed = true;
          }
          if (!avatarUrl) {
            if (c.leadId.includes("Mariana")) avatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150";
            else if (c.leadId.includes("Carlos")) avatarUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150";
            else if (c.leadId.includes("gabriela")) avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
            else if (c.leadId.includes("Roni") || c.leadId.includes("Rony")) avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150";
            else avatarUrl = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150";
            changed = true;
          }
          if (!notes) {
            if (c.leadId.includes("Mariana")) notes = "Interessada na camiseta verde musgo e quer cupom de primeira compra.";
            else if (c.leadId.includes("Carlos")) notes = "Teve problemas com o cupom de desconto ao comprar o tênis.";
            else if (c.leadId.includes("gabriela")) notes = "Gostou da camiseta musgo no Instagram e perguntou sobre a política de devoluções.";
            else if (c.leadId.includes("Roni") || c.leadId.includes("Rony")) notes = "Cliente simulado entrando em contato pelo Instagram Direct.";
            else notes = "Nenhuma observação registrada.";
            changed = true;
          }

          if (changed) {
            updated = true;
            await sqlDb.update(conversationsTable).set({
              phone, email, location, statusTag, avatarUrl, notes
            }).where(eq(conversationsTable.id, c.id));
            
            return { ...c, phone, email, location, statusTag, avatarUrl, notes };
          }
          return c;
        }));

        let formattedConvs = convs.map(c => ({
          id: c.id,
          tenantId: c.tenantId,
          channel: c.channel,
          status: c.status,
          lead_id: c.leadId,
          phone: c.phone,
          email: c.email,
          location: c.location,
          status_tag: c.statusTag,
          avatarUrl: c.avatarUrl,
          notes: c.notes,
          createdAt: c.createdAt?.toISOString(),
          updatedAt: c.updatedAt?.toISOString()
        }));

        if (channel && typeof channel === "string") {
          formattedConvs = formattedConvs.filter(c => c.channel === channel);
        }

        formattedConvs.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
        return res.json(formattedConvs);
      }
    } catch (dbErr) {
      console.error("[SQL Get Conversations Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    let convs = db.conversations.filter((c: any) => c.tenantId === tenantId);
    
    let updated = false;
    convs = convs.map((c: any) => {
      let changed = false;
      if (!c.phone) {
        if (c.lead_id.includes("Mariana")) c.phone = "+55 (11) 98765-4321";
        else if (c.lead_id.includes("Carlos")) c.phone = "+55 (19) 99122-3344";
        else if (c.lead_id.includes("gabriela")) c.phone = "@gabriela_mendes";
        else if (c.lead_id.includes("Roni") || c.lead_id.includes("Rony")) c.phone = "@ronysiilvaa";
        else c.phone = c.channel === "whatsapp_meta" ? "+55 (11) 9" + Math.floor(10000000 + Math.random() * 90000000) : "@" + c.lead_id.toLowerCase().replace(/\s+/g, "_");
        changed = true;
      }
      if (!c.email) {
        if (c.lead_id.includes("Mariana")) c.email = "mariana.costa@outlook.com.br";
        else if (c.lead_id.includes("Carlos")) c.email = "carlos.edu@gmail.com";
        else if (c.lead_id.includes("gabriela")) c.email = "gabi.mendes@gmail.com";
        else if (c.lead_id.includes("Roni") || c.lead_id.includes("Rony")) c.email = "roni.silva@gmail.com";
        else c.email = c.lead_id.toLowerCase().replace(/\s+/g, ".") + "@exemplo.com";
        changed = true;
      }
      if (!c.location) {
        if (c.lead_id.includes("Mariana")) c.location = "Belo Horizonte, MG";
        else if (c.lead_id.includes("Carlos")) c.location = "Campinas, SP";
        else if (c.lead_id.includes("gabriela")) c.location = "Rio de Janeiro, RJ";
        else if (c.lead_id.includes("Roni") || c.lead_id.includes("Rony")) c.location = "São Paulo, SP";
        else c.location = "São Paulo, SP";
        changed = true;
      }
      if (!c.status_tag) {
        if (c.lead_id.includes("Mariana")) c.status_tag = "Lead Quente 🔥";
        else if (c.lead_id.includes("Carlos")) c.status_tag = "Suporte 🛠️";
        else if (c.lead_id.includes("gabriela")) c.status_tag = "Negociação 🏷️";
        else if (c.lead_id.includes("Roni") || c.lead_id.includes("Rony")) c.status_tag = "Interesse Geral ✨";
        else c.status_tag = "Novo Lead 🆕";
        changed = true;
      }
      if (!c.avatarUrl) {
        if (c.lead_id.includes("Mariana")) c.avatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150";
        else if (c.lead_id.includes("Carlos")) c.avatarUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150";
        else if (c.lead_id.includes("gabriela")) c.avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
        else if (c.lead_id.includes("Roni") || c.lead_id.includes("Rony")) c.avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150";
        else c.avatarUrl = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150";
        changed = true;
      }
      if (!c.notes) {
        if (c.lead_id.includes("Mariana")) c.notes = "Interessada na camiseta verde musgo e quer cupom de primeira compra.";
        else if (c.lead_id.includes("Carlos")) c.notes = "Teve problemas com o cupom de desconto ao comprar o tênis. Informado sobre o desconto de 5% no PIX.";
        else if (c.lead_id.includes("gabriela")) c.notes = "Gostou da camiseta musgo no Instagram e perguntou sobre a política de devoluções.";
        else if (c.lead_id.includes("Roni") || c.lead_id.includes("Rony")) c.notes = "Cliente simulado entrando em contato pelo Instagram Direct.";
        else c.notes = "Nenhuma observação registrada.";
        changed = true;
      }
      if (changed) {
        updated = true;
        const idx = db.conversations.findIndex((dc: any) => dc.id === c.id);
        if (idx !== -1) {
          db.conversations[idx] = { ...db.conversations[idx], ...c };
        }
      }
      return c;
    });

    if (updated) {
      saveDb(db);
    }

    if (channel) {
      convs = convs.filter((c: any) => c.channel === channel);
    }
    convs.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    res.json(convs);
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    const { id } = req.params;

    try {
      if (isSqlEnabled) {
        const msgs = await sqlDb.select().from(messagesTable).where(eq(messagesTable.convId, id));
        msgs.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        return res.json(msgs);
      }
    } catch (dbErr) {
      console.error("[SQL Get Messages Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    const msgs = db.messages.filter((m: any) => m.convId === id);
    msgs.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    res.json(msgs);
  });

  app.post("/api/conversations", async (req, res) => {
    const { tenantId, channel, lead_id, phone, email, location, status_tag, avatarUrl, notes } = req.body;
    if (!tenantId || !channel || !lead_id) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    try {
      if (isSqlEnabled) {
        const id = `conv_${Math.random().toString(36).substring(2, 11)}`;
        const resolvedPhone = phone || (channel === "whatsapp_meta" ? "+55 (11) 9" + Math.floor(10000000 + Math.random() * 90000000) : "@" + lead_id.toLowerCase().replace(/\s+/g, "_"));
        const resolvedEmail = email || lead_id.toLowerCase().replace(/\s+/g, ".") + "@exemplo.com";
        const resolvedAvatarUrl = avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150";

        const newConv = {
          id,
          tenantId,
          channel,
          status: "open",
          leadId: lead_id,
          phone: resolvedPhone,
          email: resolvedEmail,
          location: location || "São Paulo, SP",
          statusTag: status_tag || "Novo Lead 🆕",
          avatarUrl: resolvedAvatarUrl,
          notes: notes || "Nenhuma observação registrada.",
        };

        await sqlDb.insert(conversationsTable).values(newConv);
        return res.json({
          ...newConv,
          lead_id: newConv.leadId,
          status_tag: newConv.statusTag,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (dbErr) {
      console.error("[SQL Create Conversation Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    const newConv = {
      id: `conv_${Math.random().toString(36).substring(2, 11)}`,
      tenantId,
      channel,
      status: "open",
      lead_id,
      phone: phone || (channel === "whatsapp_meta" ? "+55 (11) 9" + Math.floor(10000000 + Math.random() * 90000000) : "@" + lead_id.toLowerCase().replace(/\s+/g, "_")),
      email: email || lead_id.toLowerCase().replace(/\s+/g, ".") + "@exemplo.com",
      location: location || "São Paulo, SP",
      status_tag: status_tag || "Novo Lead 🆕",
      avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      notes: notes || "Nenhuma observação registrada.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.conversations.push(newConv);
    saveDb(db);
    res.json(newConv);
  });

  app.post("/api/conversations/:id/update-profile", async (req, res) => {
    const { id } = req.params;
    const { tenantId, phone, email, location, status_tag, notes } = req.body;

    try {
      if (isSqlEnabled) {
        await sqlDb.update(conversationsTable).set({
          phone,
          email,
          location,
          statusTag: status_tag,
          notes,
          updatedAt: new Date()
        }).where(
          and(
            eq(conversationsTable.id, id),
            eq(conversationsTable.tenantId, tenantId)
          )
        );

        const list = await sqlDb.select().from(conversationsTable).where(eq(conversationsTable.id, id)).limit(1);
        const c = list[0];
        if (c) {
          return res.json({
            success: true,
            conversation: {
              id: c.id,
              tenantId: c.tenantId,
              channel: c.channel,
              status: c.status,
              lead_id: c.leadId,
              phone: c.phone,
              email: c.email,
              location: c.location,
              status_tag: c.statusTag,
              avatarUrl: c.avatarUrl,
              notes: c.notes,
              createdAt: c.createdAt?.toISOString(),
              updatedAt: c.updatedAt?.toISOString()
            }
          });
        }
      }
    } catch (dbErr) {
      console.error("[SQL Update Profile Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    const idx = db.conversations.findIndex((c: any) => c.id === id && c.tenantId === tenantId);
    if (idx !== -1) {
      if (phone !== undefined) db.conversations[idx].phone = phone;
      if (email !== undefined) db.conversations[idx].email = email;
      if (location !== undefined) db.conversations[idx].location = location;
      if (status_tag !== undefined) db.conversations[idx].status_tag = status_tag;
      if (notes !== undefined) db.conversations[idx].notes = notes;
      db.conversations[idx].updatedAt = new Date().toISOString();
      saveDb(db);
      return res.json({ success: true, conversation: db.conversations[idx] });
    }
    res.status(404).json({ error: "Conversa não encontrada" });
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    const { id } = req.params;
    const { role, content, tenantId } = req.body;

    if (!content || !role || !tenantId) {
      return res.status(400).json({ error: "Conteúdo, autor e tenantId são obrigatórios" });
    }

    try {
      if (isSqlEnabled) {
        // Create user message
        const userMsg = {
          id: `msg_${Math.random().toString(36).substring(2, 11)}`,
          convId: id,
          tenantId,
          role,
          content,
        };

        await sqlDb.insert(messagesTable).values(userMsg);
        await sqlDb.update(conversationsTable).set({ updatedAt: new Date() }).where(eq(conversationsTable.id, id));

        res.json({ userMessage: { ...userMsg, createdAt: new Date().toISOString() } });

        // Trigger AI Assistant response asynchronously
        if (role === "user") {
          const configs = await sqlDb.select().from(agentConfigsTable).where(eq(agentConfigsTable.tenantId, tenantId)).limit(1);
          const agentConfig = configs[0];
          const isAiEnabled = agentConfig ? agentConfig.aiEnabled : true;

          const convs = await sqlDb.select().from(conversationsTable).where(eq(conversationsTable.id, id)).limit(1);
          const convStatus = convs[0] ? convs[0].status : "open";

          if (isAiEnabled && convStatus !== "paused") {
            setTimeout(async () => {
              try {
                const freshMsgs = await sqlDb.select().from(messagesTable).where(eq(messagesTable.convId, id));
                const agentPrompt = agentConfig ? agentConfig.systemPrompt : "Você é um assistente virtual atencioso.";
                
                const tenantList = await sqlDb.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);
                const tenantObj = tenantList[0];
                const segment = tenantObj ? tenantObj.businessSegment : "";
                const desc = tenantObj ? tenantObj.businessDescription : "";

                const docs = await sqlDb.select().from(knowledgeDocsTable).where(eq(knowledgeDocsTable.tenantId, tenantId));
                const docsContext = docs.map((d) => `DOCUMENTO: ${d.filename}\nCONTEÚDO:\n${d.content}`).join("\n\n---\n\n");

                const contextPrompt = `Você é o chatbot oficial do negócio: "${tenantObj ? tenantObj.name : "CA.RO Connect Client"}".
Segmento do negócio: ${segment}
Descrição do negócio: ${desc}

INSTRUÇÕES DO AGENTE:
${agentPrompt}

BASE DE CONHECIMENTO EXTRAÍDA DE DOCUMENTOS (Utilize estritamente para responder dúvidas com precisão comercial):
${docsContext || "Nenhum documento carregado. Utilize a descrição do negócio e suas diretrizes gerais."}

Conversa com o Lead até agora:
${freshMsgs.map((m) => `${m.role === "user" ? "Cliente" : "Assistente"}: ${m.content}`).join("\n")}
Assistente:`;

                const aiReplyText = await generateAIResponse(contextPrompt);

                const aiMsg = {
                  id: `msg_${Math.random().toString(36).substring(2, 11)}`,
                  convId: id,
                  tenantId,
                  role: "assistant",
                  content: aiReplyText,
                };

                await sqlDb.insert(messagesTable).values(aiMsg);
                await sqlDb.update(conversationsTable).set({ updatedAt: new Date() }).where(eq(conversationsTable.id, id));
              } catch (aiErr) {
                console.error("[SQL AI Response Generation Error]", aiErr);
              }
            }, 1500);
          }
        }
        return;
      }
    } catch (dbErr) {
      console.error("[SQL Post Message Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    const convIndex = db.conversations.findIndex((c: any) => c.id === id && c.tenantId === tenantId);
    if (convIndex === -1) {
      return res.status(404).json({ error: "Conversa não encontrada" });
    }

    const userMsg = {
      id: `msg_${Math.random().toString(36).substring(2, 11)}`,
      convId: id,
      tenantId,
      role,
      content,
      createdAt: new Date().toISOString(),
    };

    db.messages.push(userMsg);
    db.conversations[convIndex].updatedAt = new Date().toISOString();
    saveDb(db);

    res.json({ userMessage: userMsg });

    if (role === "user") {
      const agentConfig = db.agentConfigs.find((ac: any) => ac.tenantId === tenantId);
      const isAiEnabled = agentConfig ? agentConfig.aiEnabled : true;
      const convStatus = db.conversations[convIndex].status;

      if (isAiEnabled && convStatus !== "paused") {
        setTimeout(async () => {
          try {
            const freshDb = getDb();
            const freshMsgs = freshDb.messages.filter((m: any) => m.convId === id);
            const agentPrompt = agentConfig ? agentConfig.systemPrompt : "Você é um assistente virtual atencioso.";
            const tenantObj = freshDb.tenants.find((t: any) => t.id === tenantId);
            const segment = tenantObj ? tenantObj.businessSegment : "";
            const desc = tenantObj ? tenantObj.businessDescription : "";

            const docs = freshDb.knowledgeDocs.filter((kd: any) => kd.tenantId === tenantId);
            const docsContext = docs.map((d: any) => `DOCUMENTO: ${d.filename}\nCONTEÚDO:\n${d.content}`).join("\n\n---\n\n");

            const contextPrompt = `Você é o chatbot oficial do negócio: "${tenantObj ? tenantObj.name : "CA.RO Connect Client"}".
Segmento do negócio: ${segment}
Descrição do negócio: ${desc}

INSTRUÇÕES DO AGENTE:
${agentPrompt}

BASE DE CONHECIMENTO EXTRAÍDA DE DOCUMENTOS (Utilize estritamente para responder dúvidas com precisão comercial):
${docsContext || "Nenhum documento carregado. Utilize a descrição do negócio e suas diretrizes gerais."}

Conversa com o Lead até agora:
${freshMsgs.map((m: any) => `${m.role === "user" ? "Cliente" : "Assistente"}: ${m.content}`).join("\n")}
Assistente:`;

            const aiReplyText = await generateAIResponse(contextPrompt);

            const aiDb = getDb();
            const aiMsg = {
              id: `msg_${Math.random().toString(36).substring(2, 11)}`,
              convId: id,
              tenantId,
              role: "assistant",
              content: aiReplyText,
              createdAt: new Date().toISOString(),
            };
            aiDb.messages.push(aiMsg);
            const activeConvIndex = aiDb.conversations.findIndex((c: any) => c.id === id);
            if (activeConvIndex !== -1) {
              aiDb.conversations[activeConvIndex].updatedAt = new Date().toISOString();
            }
            saveDb(aiDb);
          } catch (error) {
            console.error("AI automated responder failed", error);
          }
        }, 1500);
      }
    }
  });

  app.post("/api/conversations/:id/toggle-status", async (req, res) => {
    const { id } = req.params;
    const { status, tenantId } = req.body;

    try {
      if (isSqlEnabled) {
        await sqlDb.update(conversationsTable).set({ status }).where(
          and(
            eq(conversationsTable.id, id),
            eq(conversationsTable.tenantId, tenantId)
          )
        );
        const list = await sqlDb.select().from(conversationsTable).where(eq(conversationsTable.id, id)).limit(1);
        const c = list[0];
        if (c) {
          return res.json({
            success: true,
            conversation: {
              id: c.id,
              tenantId: c.tenantId,
              channel: c.channel,
              status: c.status,
              lead_id: c.leadId,
              phone: c.phone,
              email: c.email,
              location: c.location,
              status_tag: c.statusTag,
              avatarUrl: c.avatarUrl,
              notes: c.notes,
              createdAt: c.createdAt?.toISOString(),
              updatedAt: c.updatedAt?.toISOString()
            }
          });
        }
      }
    } catch (dbErr) {
      console.error("[SQL Toggle Conversation Status Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    const convIndex = db.conversations.findIndex((c: any) => c.id === id && c.tenantId === tenantId);
    if (convIndex !== -1) {
      db.conversations[convIndex].status = status;
      saveDb(db);
      return res.json({ success: true, conversation: db.conversations[convIndex] });
    }
    res.status(404).json({ error: "Conversa não encontrada" });
  });

  // 5.1 AUTOMATION TRIGGERS SIMULATION ENDPOINT
  app.post("/api/conversations/simulate-trigger", async (req, res) => {
    const { tenantId, platform, triggerType, customMessage, commentText, clientName } = req.body;
    if (!tenantId || !platform || !triggerType) {
      return res.status(400).json({ error: "Faltando parâmetros obrigatórios para simular gatilho" });
    }

    const name = clientName || (platform === "instagram" ? ["Renata Silva", "Pedro Mendes", "Juliana Rocha", "Bruno Castro"][Math.floor(Math.random() * 4)] : ["Marcelo Souza", "Fernanda Lima", "Thiago Alves", "Amanda Costa"][Math.floor(Math.random() * 4)]);
    const identifier = platform === "instagram" ? "@" + name.toLowerCase().replace(/\s+/g, "_") : "+55 (11) 9" + Math.floor(91000000 + Math.random() * 8000000);
    const email = name.toLowerCase().replace(/\s+/g, ".") + "@exemplo.com.br";
    const location = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Curitiba, PR", "Salvador, BA"][Math.floor(Math.random() * 5)];
    const avatarUrl = [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    ][Math.floor(Math.random() * 4)];

    const convId = `sim_${Math.random().toString(36).substring(2, 11)}`;
    const statusTag = triggerType === "follow" ? "Novo Seguidor 💖" : triggerType === "comment" ? "Comentário 💬" : "Lead Ativo 🔥";
    const notes = `Disparado via Simulador de Gatilhos da Automação. Tipo: ${triggerType.toUpperCase()}`;

    const newConv = {
      id: convId,
      tenantId,
      channel: platform === "instagram" ? "instagram" : "whatsapp_meta",
      status: "open",
      leadId: name,
      phone: identifier,
      email,
      location,
      statusTag,
      avatarUrl,
      notes,
    };

    try {
      if (isSqlEnabled) {
        await sqlDb.insert(conversationsTable).values(newConv);
      } else {
        const db = getDb();
        db.conversations.push({
          ...newConv,
          lead_id: name,
          status_tag: statusTag,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        saveDb(db);
      }

      // Add messages based on trigger type
      const messagesToInsert: any[] = [];

      if (platform === "instagram") {
        if (triggerType === "follow") {
          messagesToInsert.push(
            { role: "user", content: `✨ ${name} começou a seguir seu perfil no Instagram.` },
            { role: "assistant", content: customMessage || `Olá, ${name}! Obrigado por nos seguir! Use o cupom SEGUIDOR10 para 10% OFF!` }
          );
        } else if (triggerType === "comment") {
          const userComment = commentText || "Qual é o valor dessa camiseta musgo?";
          const assistantReply = `Oi, ${name}! Acabei de te enviar todos os detalhes e o link no seu Direct! Dá uma olhadinha lá! 😉✨`;
          messagesToInsert.push(
            { role: "user", content: `💬 Comentou na publicação: "${userComment}"` },
            { role: "assistant", content: `↩️ Resposta automática no comentário: "${assistantReply}"` },
            { role: "assistant", content: customMessage || `Oi, ${name}! Te chamei aqui no Direct para passar as informações da camiseta musgo...` }
          );
        } else {
          // message
          messagesToInsert.push(
            { role: "user", content: "Olá! Gostaria de falar com o atendimento." },
            { role: "assistant", content: customMessage || "Olá! Como posso te ajudar?" }
          );
        }
      } else {
        // whatsapp
        if (triggerType === "off_hours") {
          messagesToInsert.push(
            { role: "user", content: "Olá! Tem alguém online?" },
            { role: "assistant", content: customMessage || "Olá! Nosso horário comercial é das 8h às 18h, mas nossa IA está aqui para te ajudar..." }
          );
        } else {
          // first_msg
          messagesToInsert.push(
            { role: "user", content: "Oi! Gostaria de tirar uma dúvida sobre entrega." },
            { role: "assistant", content: customMessage || "Olá! Tudo bem? Como posso te ajudar?" }
          );
        }
      }

      // Insert messages to DB
      for (const m of messagesToInsert) {
        const msgId = `msg_${Math.random().toString(36).substring(2, 11)}`;
        if (isSqlEnabled) {
          await sqlDb.insert(messagesTable).values({
            id: msgId,
            convId,
            tenantId,
            role: m.role,
            content: m.content,
          });
        } else {
          const db = getDb();
          db.messages.push({
            id: msgId,
            convId,
            tenantId,
            role: m.role,
            content: m.content,
            createdAt: new Date().toISOString(),
          });
          saveDb(db);
        }
      }

      res.json({ success: true, conversationId: convId });
    } catch (err) {
      console.error("[Simulate Trigger Error]", err);
      res.status(500).json({ error: "Erro interno ao simular o gatilho" });
    }
  });

  // 6. STRIPE INTEGRATION REAL & MOCK ENDPOINTS
  app.post("/api/stripe/checkout", async (req, res) => {
    const { tenantId, plan } = req.body;
    if (!tenantId || !plan) {
      return res.status(400).json({ error: "Tenant ID e plano são obrigatórios" });
    }

    const stripe = getStripeInstance();
    if (stripe) {
      try {
        const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
        
        let priceAmount = 9700; // Starter
        let planName = "Plano Starter";
        if (plan === "pro") {
          priceAmount = 19700;
          planName = "Plano Pro";
        } else if (plan === "enterprise") {
          priceAmount = 49700;
          planName = "Plano Enterprise";
        }

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "brl",
                product_data: {
                  name: `Assinatura CA.RO Connect - ${planName}`,
                  description: `Acesso completo aos canais do ${planName}`,
                },
                unit_amount: priceAmount,
                recurring: {
                  interval: "month",
                },
              },
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${appUrl}/dashboard?stripe_success=true&tenant_id=${tenantId}&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/dashboard?stripe_cancel=true`,
          metadata: {
            tenantId,
            plan,
          },
        });

        console.log(`[Stripe] Created real Checkout Session for tenant ${tenantId}: ${session.id}`);
        return res.json({
          checkoutUrl: session.url,
          sessionId: session.id,
          realStripe: true,
        });
      } catch (stripeErr: any) {
        console.error("[Stripe Real Session Error - Falling back to Simulation]", stripeErr);
      }
    }

    // Fallback Mock checkout
    const sessionId = `cs_${Math.random().toString(36).substring(2, 15)}`;
    res.json({
      checkoutUrl: `/checkout-sim?session_id=${sessionId}&tenant_id=${tenantId}&plan=${plan}`,
      sessionId,
      realStripe: false,
    });
  });

  app.post("/api/stripe/activate-plan", async (req, res) => {
    const { tenantId, plan } = req.body;

    try {
      if (isSqlEnabled) {
        await sqlDb.update(tenantsTable).set({
          plan,
          status: "active",
        }).where(eq(tenantsTable.id, tenantId));

        const list = await sqlDb.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);
        const tenant = list[0];
        return res.json({ success: true, tenant: tenant ? { ...tenant, owner_email: tenant.ownerEmail } : null });
      }
    } catch (dbErr) {
      console.error("[SQL Stripe Activate Plan Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    const index = db.tenants.findIndex((t: any) => t.id === tenantId);
    if (index !== -1) {
      db.tenants[index].plan = plan;
      db.tenants[index].status = "active";
      saveDb(db);
      return res.json({ success: true, tenant: db.tenants[index] });
    }
    res.status(404).json({ error: "Tenant não encontrado" });
  });

  // Stripe webhook to handle production checkout sessions
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripe = getStripeInstance();

    if (!stripe || !sig || !webhookSecret) {
      return res.status(400).send("Webhook configurations missing");
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`❌ Stripe webhook signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const tenantId = session.metadata?.tenantId;
      const plan = session.metadata?.plan;

      if (tenantId && plan) {
        console.log(`[Stripe Webhook] Verified payment! Activating plan ${plan} for tenant ${tenantId}`);
        try {
          if (isSqlEnabled) {
            await sqlDb.update(tenantsTable).set({
              plan,
              status: "active",
            }).where(eq(tenantsTable.id, tenantId));
          } else {
            const db = getDb();
            const index = db.tenants.findIndex((t: any) => t.id === tenantId);
            if (index !== -1) {
              db.tenants[index].plan = plan;
              db.tenants[index].status = "active";
              saveDb(db);
            }
          }
        } catch (dbErr) {
          console.error("[Stripe Webhook DB Update Error]", dbErr);
        }
      }
    }

    res.json({ received: true });
  });

  // 7. MULTI-TENANT CHANNELS API
  app.get("/api/tenant/channels", async (req, res) => {
    const { tenantId } = req.query;
    if (!tenantId || typeof tenantId !== "string") {
      return res.status(400).json({ error: "Tenant ID é obrigatório" });
    }

    try {
      if (isSqlEnabled) {
        const channels = await sqlDb.select().from(channelsTable).where(eq(channelsTable.tenantId, tenantId));
        return res.json(channels);
      }
    } catch (dbErr) {
      console.error("[SQL Get Channels Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    const channels = db.channels.filter((c: any) => c.tenantId === tenantId);
    res.json(channels);
  });

  app.post("/api/tenant/channels", async (req, res) => {
    const { tenantId, type, identifier } = req.body;
    if (!tenantId || !type || !identifier) {
      return res.status(400).json({ error: "Dados incompletos para conectar canal" });
    }

    try {
      if (isSqlEnabled) {
        const newCh = {
          id: `ch_${Math.random().toString(36).substring(2, 11)}`,
          tenantId,
          type,
          identifier,
          status: "connected",
        };
        await sqlDb.insert(channelsTable).values(newCh);
        return res.json(newCh);
      }
    } catch (dbErr) {
      console.error("[SQL Post Channel Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    const newChannel = {
      id: `ch_${Math.random().toString(36).substring(2, 11)}`,
      tenantId,
      type,
      identifier,
      status: "connected",
    };

    db.channels.push(newChannel);
    saveDb(db);
    res.json(newChannel);
  });

  app.delete("/api/tenant/channels/:id", async (req, res) => {
    const { id } = req.params;
    const { tenantId } = req.query;
    if (!tenantId || typeof tenantId !== "string") {
      return res.status(400).json({ error: "Tenant ID é obrigatório" });
    }

    try {
      if (isSqlEnabled) {
        await sqlDb.delete(channelsTable).where(
          and(
            eq(channelsTable.id, id),
            eq(channelsTable.tenantId, tenantId)
          )
        );
        return res.json({ success: true });
      }
    } catch (dbErr) {
      console.error("[SQL Delete Channel Error]", dbErr);
    }

    // Fallback
    const db = getDb();
    db.channels = db.channels.filter((c: any) => !(c.id === id && c.tenantId === tenantId));
    saveDb(db);
    res.json({ success: true });
  });

  // 7.5 META OAUTH CONNECT FLOW (Facebook Login for Business - per-tenant real connection)
    const META_APP_ID = process.env.META_APP_ID;
    const META_APP_SECRET = process.env.META_APP_SECRET;
    const META_OAUTH_REDIRECT_URI = process.env.META_OAUTH_REDIRECT_URI || "https://iaconnect.carostudio.com.br/api/meta/oauth/callback";
  
    async function getTenantMetaConnection(tenantId: string) {
          try {
                  if (isSqlEnabled) {
                            const rows = await sqlDb.select().from(channelsTable).where(
                                        and(eq(channelsTable.tenantId, tenantId), eq(channelsTable.type, "whatsapp_meta"))
                                      );
                            if (rows.length > 0) return rows[0];
                  }
          } catch (err) {
                  console.error("[Meta OAuth] Erro ao buscar conexao do tenant:", err);
          }
          return null;
    }
  
    // Starts the official Meta OAuth flow: redirects the tenant's browser to Facebook's login dialog
    app.get("/api/meta/oauth/start", (req, res) => {
          const { tenantId } = req.query;
          if (!tenantId || typeof tenantId !== "string") {
                  return res.status(400).send("Tenant ID e obrigatorio");
          }
          if (!META_APP_ID) {
                  return res.status(500).send("Integracao Meta nao configurada (META_APP_ID ausente). Contate o suporte.");
          }
          const scope = [
                  "whatsapp_business_management",
                  "whatsapp_business_messaging",
                  "instagram_basic",
                  "instagram_manage_messages",
                  "pages_show_list",
                  "pages_manage_metadata",
                  "business_management",
                ].join(",");
          const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(META_OAUTH_REDIRECT_URI)}&state=${encodeURIComponent(tenantId)}&scope=${encodeURIComponent(scope)}&response_type=code`;
          res.redirect(authUrl);
    });
  
    // Handles Facebook's redirect back with an auth code, exchanges it for tokens,
    // discovers the tenant's WhatsApp phone number and Instagram account, and saves them.
    app.get("/api/meta/oauth/callback", async (req, res) => {
          const { code, state, error: oauthError } = req.query;
          const tenantId = typeof state === "string" ? state : "";
      
          if (oauthError) {
                  console.warn("[Meta OAuth] Usuario cancelou ou negou permissoes:", oauthError);
                  return res.redirect(`/?meta_connect=cancelled`);
          }
          if (!code || typeof code !== "string" || !tenantId) {
                  return res.status(400).send("Parametros invalidos no retorno do Facebook.");
          }
          if (!META_APP_ID || !META_APP_SECRET) {
                  return res.status(500).send("Integracao Meta nao configurada no servidor (META_APP_SECRET ausente).");
          }
      
          try {
                  const tokenResp = await fetch(
                            `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(META_OAUTH_REDIRECT_URI)}&client_secret=${META_APP_SECRET}&code=${code}`
                          );
                  const tokenData = await tokenResp.json();
                  if (!tokenResp.ok || !tokenData.access_token) {
                            console.error("[Meta OAuth] Falha ao trocar code por token:", tokenData);
                            return res.redirect(`/?meta_connect=error`);
                  }
            
                  const longLivedResp = await fetch(
                            `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${tokenData.access_token}`
                          );
                  const longLivedData = await longLivedResp.json();
                  const accessToken = longLivedData.access_token || tokenData.access_token;
                  const expiresInSec = longLivedData.expires_in || tokenData.expires_in;
                  const tokenExpiresAt = expiresInSec ? new Date(Date.now() + expiresInSec * 1000) : null;
            
                  let phoneNumberId: string | null = null;
                  let wabaId: string | null = null;
                  let whatsappDisplayNumber: string | null = null;
                  try {
                            const bizResp = await fetch(`https://graph.facebook.com/v21.0/me/businesses?access_token=${accessToken}`);
                            const bizData = await bizResp.json();
                            const businessId = bizData?.data?.[0]?.id;
                            if (businessId) {
                                        const wabaResp = await fetch(`https://graph.facebook.com/v21.0/${businessId}/owned_whatsapp_business_accounts?access_token=${accessToken}`);
                                        const wabaData = await wabaResp.json();
                                        wabaId = wabaData?.data?.[0]?.id || null;
                                        if (wabaId) {
                                                      const phoneResp = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/phone_numbers?access_token=${accessToken}`);
                                                      const phoneData = await phoneResp.json();
                                                      phoneNumberId = phoneData?.data?.[0]?.id || null;
                                                      whatsappDisplayNumber = phoneData?.data?.[0]?.display_phone_number || null;
                                        }
                            }
                  } catch (waErr) {
                            console.error("[Meta OAuth] Erro ao descobrir WhatsApp Business Account:", waErr);
                  }
            
                  let pageId: string | null = null;
                  let igAccountId: string | null = null;
                  let igUsername: string | null = null;
                  try {
                            const pagesResp = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`);
                            const pagesData = await pagesResp.json();
                            const page = pagesData?.data?.[0];
                            pageId = page?.id || null;
                            if (pageId) {
                                        const igResp = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`);
                                        const igData = await igResp.json();
                                        igAccountId = igData?.instagram_business_account?.id || null;
                                        if (igAccountId) {
                                                      const igUserResp = await fetch(`https://graph.facebook.com/v21.0/${igAccountId}?fields=username&access_token=${accessToken}`);
                                                      const igUserData = await igUserResp.json();
                                                      igUsername = igUserData?.username || null;
                                        }
                            }
                  } catch (igErr) {
                            console.error("[Meta OAuth] Erro ao descobrir conta do Instagram:", igErr);
                  }
            
                  if (isSqlEnabled) {
                            const existing = await getTenantMetaConnection(tenantId);
                            const record = {
                                        tenantId,
                                        type: "whatsapp_meta",
                                        identifier: JSON.stringify({ whatsapp: whatsappDisplayNumber, instagram: igUsername }),
                                        status: "connected",
                                        accessToken,
                                        phoneNumberId,
                                        wabaId,
                                        pageId,
                                        igAccountId,
                                        tokenExpiresAt,
                            };
                            if (existing) {
                                        await sqlDb.update(channelsTable).set(record).where(eq(channelsTable.id, existing.id));
                            } else {
                                        await sqlDb.insert(channelsTable).values({ id: `ch_${Math.random().toString(36).substring(2, 11)}`, ...record });
                            }
                  }
            
                  return res.redirect(`/?meta_connect=success`);
          } catch (err) {
                  console.error("[Meta OAuth] Erro inesperado no callback:", err);
                  return res.redirect(`/?meta_connect=error`);
          }
    });
  
    // Returns the tenant's current Meta connection status (for the frontend polling widget)
    app.get("/api/meta/status", async (req, res) => {
          const { tenantId } = req.query;
          if (!tenantId || typeof tenantId !== "string") {
                  return res.status(400).json({ connected: false });
          }
          const conn = await getTenantMetaConnection(tenantId);
          if (!conn || !conn.accessToken) {
                  return res.json({ connected: false });
          }
          let parsedIdentifier: any = {};
          try {
                  parsedIdentifier = JSON.parse(conn.identifier || "{}");
          } catch (parseErr) {
                  parsedIdentifier = {};
          }
          return res.json({
                  connected: true,
                  whatsapp: parsedIdentifier.whatsapp || (conn.phoneNumberId ? "Numero conectado" : undefined),
                  instagram: parsedIdentifier.instagram || undefined,
                  connectedAt: conn.tokenExpiresAt ? new Date(conn.tokenExpiresAt).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR"),
          });
    });
  
    // Disconnects the tenant's Meta integration (clears stored tokens)
    app.post("/api/meta/disconnect", async (req, res) => {
          const { tenantId } = req.body;
          if (!tenantId) {
                  return res.status(400).json({ error: "Tenant ID e obrigatorio" });
          }
          try {
                  if (isSqlEnabled) {
                            const conn = await getTenantMetaConnection(tenantId);
                            if (conn) {
                                        await sqlDb.update(channelsTable).set({
                                                      status: "disconnected",
                                                      accessToken: null,
                                                      phoneNumberId: null,
                                                      wabaId: null,
                                                      pageId: null,
                                                      igAccountId: null,
                                                      tokenExpiresAt: null,
                                        }).where(eq(channelsTable.id, conn.id));
                            }
                  }
          } catch (err) {
                  console.error("[Meta OAuth] Erro ao desconectar:", err);
          }
          res.json({ success: true });
    });
  
  // 8. META PLATFORM OFFICIAL WEBHOOKS (WhatsApp Cloud API & Instagram Graph API)
  // Meta Webhook Verification (GET)
  app.get("/api/webhooks/meta", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // Default verify token is "caro_connect_token_2026" but can be customized with META_VERIFY_TOKEN env var
    const verifyToken = process.env.META_VERIFY_TOKEN || "caro_connect_token_2026";

    if (mode === "subscribe" && token === verifyToken) {
      console.log("[Meta Webhook] Verified successfully!");
      return res.status(200).send(challenge);
    } else {
      console.warn("[Meta Webhook] Verification failed. Expected token:", verifyToken, "Received:", token);
      return res.status(403).send("Forbidden");
    }
  });

  // Sends the AI-generated reply back to the client via Meta Graph API (WhatsApp Cloud API / Instagram Messaging).
    // Uses the tenant's OWN connected access token/phone number when available (per-tenant OAuth connection),
    // falling back to the shared global credentials only when the tenant has no connection of its own.
    async function sendMetaReply(channelType: string, recipientId: string, message: string, tenantId?: string) {
          let accessToken = process.env.META_ACCESS_TOKEN;
          let phoneNumberId = process.env.META_PHONE_NUMBER_ID;

          if (tenantId) {
                  try {
                            const conn = await getTenantMetaConnection(tenantId);
                            if (conn && conn.accessToken) {
                                        accessToken = conn.accessToken;
                                        if (conn.phoneNumberId) {
                                                      phoneNumberId = conn.phoneNumberId;
                                        }
                            }
                  } catch (connErr) {
                            console.error("[Meta Send] Erro ao buscar conexao do tenant, usando credenciais globais:", connErr);
                  }
          }

          if (!accessToken) {
                  console.warn("[Meta Send] Nenhum access token disponivel (nem do tenant nem global). Pulando envio real.");
                  return;
          }
          try {
                  if (channelType === "whatsapp_meta") {
                            if (!phoneNumberId) {
                                        console.warn("[Meta Send] Nenhum phoneNumberId disponivel (nem do tenant nem global). Pulando envio real do WhatsApp.");
                                        return;
                            }
                            const resp = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
                                        method: "POST",
                                        headers: {
                                                      "Authorization": `Bearer ${accessToken}`,
                                                      "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                                      messaging_product: "whatsapp",
                                                      to: recipientId,
                                                      type: "text",
                                                      text: { body: message },
                                        }),
                            });
                            const data = await resp.json();
                            if (!resp.ok) {
                                        console.error("[Meta Send] Falha ao enviar mensagem WhatsApp:", data);
                            } else {
                                        console.log("[Meta Send] Mensagem WhatsApp enviada com sucesso.");
                            }
                  } else if (channelType === "instagram") {
                            const resp = await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
                                        method: "POST",
                                        headers: {
                                                      "Authorization": `Bearer ${accessToken}`,
                                                      "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                                      recipient: { id: recipientId },
                                                      message: { text: message },
                                        }),
                            });
                            const data = await resp.json();
                            if (!resp.ok) {
                                        console.error("[Meta Send] Falha ao enviar mensagem Instagram:", data);
                            } else {
                                        console.log("[Meta Send] Mensagem Instagram enviada com sucesso.");
                            }
                  }
          } catch (sendErr) {
                  console.error("[Meta Send] Erro ao enviar mensagem via Graph API:", sendErr);
          }
    }
  // Meta Webhook Receiver (POST)
  app.post("/api/webhooks/meta", async (req, res) => {
    const { tenantId } = req.query; // Multi-tenant Webhook URL format: /api/webhooks/meta?tenantId=...
    console.log("[Meta Webhook] Received event. Query Tenant ID:", tenantId);
    
    const body = req.body;
    
    let senderId = "";
    let senderName = "";
    let messageText = "";
    let channelType = "whatsapp_meta"; // default

    try {
      if (body.object === "whatsapp_business_account") {
        channelType = "whatsapp_meta";
        const entry = body.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        const message = value?.messages?.[0];
        const contact = value?.contacts?.[0];

        if (message) {
          senderId = message.from || "";
          senderName = contact?.profile?.name || senderId;
          messageText = message.text?.body || "";
        }
      } else if (body.object === "instagram" || body.entry?.[0]?.messaging) {
        channelType = "instagram";
        const entry = body.entry?.[0];
        const messaging = entry?.messaging?.[0];
        const message = messaging?.message;

        if (messaging && message) {
          senderId = messaging.sender?.id || "";
          senderName = `Instagram User ${senderId.slice(-4)}`;
          messageText = message.text || "";
        }
      } else {
        // Direct testing/simulation payload
        senderId = body.senderId || body.from || "123456789";
        senderName = body.senderName || "Cliente Teste Webhook";
        messageText = body.messageText || body.text || "";
        channelType = body.channelType || "whatsapp_meta";
      }

      if (!senderId || !messageText) {
        return res.status(400).json({ error: "No messages or sender found in payload" });
      }

      // Resolve tenantId
      let resolvedTenantId = tenantId as string;
      if (!resolvedTenantId) {
        if (isSqlEnabled) {
          const tenantsList = await sqlDb.select().from(tenantsTable).limit(1);
          if (tenantsList.length > 0) {
            resolvedTenantId = tenantsList[0].id;
          }
        } else {
          const localDb = getDb();
          if (localDb.tenants.length > 0) {
            resolvedTenantId = localDb.tenants[0].id;
          }
        }
      }

      if (!resolvedTenantId) {
        return res.status(400).json({ error: "Tenant ID could not be resolved" });
      }

      let convId = "";
      
      if (isSqlEnabled) {
        const existingConvs = await sqlDb.select().from(conversationsTable).where(
          and(
            eq(conversationsTable.tenantId, resolvedTenantId),
            eq(conversationsTable.leadId, senderName),
            eq(conversationsTable.channel, channelType)
          )
        ).limit(1);

        if (existingConvs.length > 0) {
          convId = existingConvs[0].id;
          await sqlDb.update(conversationsTable).set({ updatedAt: new Date() }).where(eq(conversationsTable.id, convId));
        } else {
          convId = `conv_${Math.random().toString(36).substring(2, 11)}`;
          const newConv = {
            id: convId,
            tenantId: resolvedTenantId,
            channel: channelType,
            status: "open",
            leadId: senderName,
            phone: channelType === "whatsapp_meta" ? senderId : `@${senderId}`,
            email: `${senderId.toLowerCase()}@meta-webhook.com`,
            location: "Conectado via Meta API",
            statusTag: "Novo Lead 🆕",
            avatarUrl: channelType === "whatsapp_meta" 
              ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            notes: `Lead captado automaticamente através de webhook oficial da Meta (${channelType === 'whatsapp_meta' ? 'WhatsApp Cloud API' : 'Instagram Direct'}).`
          };
          await sqlDb.insert(conversationsTable).values(newConv);
        }

        const msgId = `msg_${Math.random().toString(36).substring(2, 11)}`;
        await sqlDb.insert(messagesTable).values({
          id: msgId,
          convId,
          tenantId: resolvedTenantId,
          role: "user",
          content: messageText,
        });

      } else {
        const localDb = getDb();
        const existingConv = localDb.conversations.find((c: any) => 
          c.tenantId === resolvedTenantId && 
          c.lead_id === senderName && 
          c.channel === channelType
        );

        if (existingConv) {
          convId = existingConv.id;
          existingConv.updatedAt = new Date().toISOString();
        } else {
          convId = `conv_${Math.random().toString(36).substring(2, 11)}`;
          const newConv = {
            id: convId,
            tenantId: resolvedTenantId,
            channel: channelType,
            status: "open",
            lead_id: senderName,
            phone: channelType === "whatsapp_meta" ? senderId : `@${senderId}`,
            email: `${senderId.toLowerCase()}@meta-webhook.com`,
            location: "Conectado via Meta API",
            status_tag: "Novo Lead 🆕",
            avatarUrl: channelType === "whatsapp_meta" 
              ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            notes: `Lead captado automaticamente através de webhook oficial da Meta (${channelType === 'whatsapp_meta' ? 'WhatsApp Cloud API' : 'Instagram Direct'}).`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          localDb.conversations.push(newConv);
        }

        const msgId = `msg_${Math.random().toString(36).substring(2, 11)}`;
        localDb.messages.push({
          id: msgId,
          convId,
          tenantId: resolvedTenantId,
          role: "user",
          content: messageText,
          createdAt: new Date().toISOString()
        });
        saveDb(localDb);
      }

      console.log(`[Meta Webhook] Successfully processed incoming message from ${senderName} on ${channelType}: "${messageText}"`);

      // AI Response Generation
      setTimeout(async () => {
        try {
          let agentPrompt = "Você é um assistente virtual atencioso.";
          let isAiEnabled = true;
          let tenantName = "CA.RO Client";
          let businessSegment = "";
          let businessDescription = "";
          let docsContext = "";

          if (isSqlEnabled) {
            const configs = await sqlDb.select().from(agentConfigsTable).where(eq(agentConfigsTable.tenantId, resolvedTenantId)).limit(1);
            if (configs[0]) {
              agentPrompt = configs[0].systemPrompt || agentPrompt;
              isAiEnabled = configs[0].aiEnabled;
            }
            const tenantObj = (await sqlDb.select().from(tenantsTable).where(eq(tenantsTable.id, resolvedTenantId)).limit(1))[0];
            if (tenantObj) {
              tenantName = tenantObj.name;
              businessSegment = tenantObj.businessSegment || "";
              businessDescription = tenantObj.businessDescription || "";
            }
            const docs = await sqlDb.select().from(knowledgeDocsTable).where(eq(knowledgeDocsTable.tenantId, resolvedTenantId));
            docsContext = docs.map((d) => `DOCUMENTO: ${d.filename}\nCONTEÚDO:\n${d.content}`).join("\n\n---\n\n");
          } else {
            const localDb = getDb();
            const config = localDb.agentConfigs.find((ac: any) => ac.tenantId === resolvedTenantId);
            if (config) {
              agentPrompt = config.systemPrompt || agentPrompt;
              isAiEnabled = config.aiEnabled;
            }
            const tenantObj = localDb.tenants.find((t: any) => t.id === resolvedTenantId);
            if (tenantObj) {
              tenantName = tenantObj.name;
              businessSegment = tenantObj.businessSegment || "";
              businessDescription = tenantObj.businessDescription || "";
            }
            const docs = localDb.knowledgeDocs.filter((kd: any) => kd.tenantId === resolvedTenantId);
            docsContext = docs.map((d: any) => `DOCUMENTO: ${d.filename}\nCONTEÚDO:\n${d.content}`).join("\n\n---\n\n");
          }

          if (!isAiEnabled) {
            console.log("[Meta Webhook] AI is disabled for this tenant. Skipping response.");
            return;
          }

          let freshMsgs: any[] = [];
          if (isSqlEnabled) {
            freshMsgs = await sqlDb.select().from(messagesTable).where(eq(messagesTable.convId, convId));
            freshMsgs.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
          } else {
            const freshDb = getDb();
            freshMsgs = freshDb.messages.filter((m: any) => m.convId === convId);
          }

          const contextPrompt = `Você é o chatbot oficial do negócio: "${tenantName}".
Segmento do negócio: ${businessSegment}
Descrição do negócio: ${businessDescription}

INSTRUÇÕES DO AGENTE:
${agentPrompt}

BASE DE CONHECIMENTO EXTRAÍDA DE DOCUMENTOS (Utilize estritamente para responder dúvidas com precisão comercial):
${docsContext || "Nenhum documento carregado."}

Conversa com o Lead até agora:
${freshMsgs.map((m) => `${m.role === "user" ? "Cliente" : "Assistente"}: ${m.content}`).join("\n")}
Assistente:`;

          const aiReplyText = await generateAIResponse(contextPrompt);

          if (isSqlEnabled) {
            const aiMsgId = `msg_${Math.random().toString(36).substring(2, 11)}`;
            await sqlDb.insert(messagesTable).values({
              id: aiMsgId,
              convId,
              tenantId: resolvedTenantId,
              role: "assistant",
              content: aiReplyText,
            });
            await sqlDb.update(conversationsTable).set({ updatedAt: new Date() }).where(eq(conversationsTable.id, convId));
          } else {
            const finalDb = getDb();
            const aiMsgId = `msg_${Math.random().toString(36).substring(2, 11)}`;
            finalDb.messages.push({
              id: aiMsgId,
              convId,
              tenantId: resolvedTenantId,
              role: "assistant",
              content: aiReplyText,
              createdAt: new Date().toISOString()
            });
            const activeConvIndex = finalDb.conversations.findIndex((c: any) => c.id === convId);
            if (activeConvIndex !== -1) {
              finalDb.conversations[activeConvIndex].updatedAt = new Date().toISOString();
            }
            saveDb(finalDb);
          }

          console.log("[Meta Webhook] Successfully generated and saved AI response:", aiReplyText);
          await sendMetaReply(channelType, senderId, aiReplyText, resolvedTenantId);
        } catch (innerErr) {
          console.error("[Meta Webhook] Failed to generate automated response", innerErr);
        }
      }, 1000);

      return res.json({ success: true, message: "Webhook processed successfully", convId });
    } catch (err: any) {
      console.error("[Meta Webhook Handler Error]", err);
      return res.status(500).json({ error: "Failed to process webhook event", details: err.message });
    }
  });

  // 9. CLIENT/TENANT MANAGEMENT ENDPOINTS (Multi-Tenant SaaS Panel)
  // Get all tenants in the system for administrative switching/listing
  app.get("/api/admin/tenants", async (req, res) => {
    try {
      if (isSqlEnabled) {
        const allTenantsList = await sqlDb.select().from(tenantsTable);
        // Map ownerEmail to owner_email for frontend compatibility
        const mapped = allTenantsList.map((t) => ({
          ...t,
          owner_email: t.ownerEmail,
        }));
        return res.json({ success: true, tenants: mapped });
      }
    } catch (err) {
      console.error("[SQL Get Tenants Error]", err);
    }

    const db = getDb();
    return res.json({ success: true, tenants: db.tenants });
  });

  // Create a new client tenant & corresponding user account
  app.post("/api/admin/create-tenant", async (req, res) => {
    const { name, email, password, plan, segment, description } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome da empresa, e-mail e senha são obrigatórios" });
    }

    const tenantId = `ten_${Math.random().toString(36).substring(2, 11)}`;
    const userId = `usr_${Math.random().toString(36).substring(2, 11)}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    try {
      if (isSqlEnabled) {
        // Check if user already exists
        const existingUsers = await sqlDb.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
        if (existingUsers.length > 0) {
          return res.status(400).json({ error: "E-mail de acesso já está em uso por outro cliente" });
        }

        // Insert new tenant
        await sqlDb.insert(tenantsTable).values({
          id: tenantId,
          name,
          slug,
          plan: plan || "pro",
          status: "active",
          ownerEmail: email.toLowerCase(),
          businessSegment: segment || "Geral",
          businessDescription: description || "",
        });

        // Insert new user
        await sqlDb.insert(usersTable).values({
          id: userId,
          email: email.toLowerCase(),
          name,
          password,
          tenantId,
        });

        // Insert initial agent config
        await sqlDb.insert(agentConfigsTable).values({
          id: `ag_${Math.random().toString(36).substring(2, 11)}`,
          tenantId,
          agentName: "Assistente IA",
          aiEnabled: true,
          systemPrompt: `Você é a assistente de atendimento inteligente oficial da ${name}.\nAtuamos no segmento de: ${segment || 'Geral'}.\n\nSobre nós:\n${description || ''}\n\nResponda amigavelmente usando emojis e ajude a tirar dúvidas! ✨🌿`,
        });

        const createdTenant = (await sqlDb.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1))[0];
        return res.json({
          success: true,
          message: "Cliente registrado com sucesso!",
          tenant: createdTenant ? { ...createdTenant, owner_email: createdTenant.ownerEmail } : null,
          user: { id: userId, email, name, tenantId }
        });
      }
    } catch (err: any) {
      console.error("[SQL Create Tenant Error]", err);
    }

    // Fallback JSON DB
    const db = getDb();
    const existingUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: "E-mail de acesso já está em uso por outro cliente" });
    }

    const newTenant = {
      id: tenantId,
      name,
      slug,
      plan: plan || "pro",
      status: "active",
      owner_email: email.toLowerCase(),
      businessSegment: segment || "Geral",
      businessDescription: description || "",
      createdAt: new Date().toISOString(),
    };

    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      name,
      password,
      tenantId,
    };

    const newAgentConfig = {
      id: `ag_${Math.random().toString(36).substring(2, 11)}`,
      tenantId,
      agentName: "Assistente IA",
      aiEnabled: true,
      systemPrompt: `Você é a assistente de atendimento inteligente oficial da ${name}.\nAtuamos no segmento de: ${segment || 'Geral'}.\n\nSobre nós:\n${description || ''}\n\nResponda amigavelmente usando emojis e ajude a tirar dúvidas! ✨🌿`,
    };

    db.tenants.push(newTenant);
    db.users.push(newUser);
    db.agentConfigs.push(newAgentConfig);
    saveDb(db);

    return res.json({
      success: true,
      message: "Cliente registrado com sucesso!",
      tenant: newTenant,
      user: { id: userId, email, name, tenantId }
    });
  });

    // On Vercel, static assets are served by the platform itself from the Vite
             // build output, and this Express app only handles /api/* as a serverless
             // function. Skip the local dev/Cloud Run bootstrap (vite middleware, static
             // serving, and app.listen) in that environment.
             if (!process.env.VERCEL) {
                   if (process.env.NODE_ENV !== "production") {
                           const vite = await createViteServer({
                                     server: { middlewareMode: true },
                                     appType: "spa",
                           });
                           app.use(vite.middlewares);
                   } else {
                           const distPath = path.join(process.cwd(), "dist");
                           app.use(express.static(distPath));
                           app.get("*", (req, res) => {
                                     res.sendFile(path.join(distPath, "index.html"));
                           });
                   }

        app.listen(PORT, "0.0.0.0", () => {
                console.log(`[CA.RO Connect] Full-Stack server running on port ${PORT}`);
        });
             }

             return app;
  }

           const appPromise = startServer();

export default async function handler(req: any, res: any) {
    const app = await appPromise;
    return (app as any)(req, res);
}
  
