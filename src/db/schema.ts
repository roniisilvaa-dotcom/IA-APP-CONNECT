import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Tenants table
export const tenants = pgTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  plan: text('plan'),
  status: text('status'),
  ownerEmail: text('owner_email'),
  createdAt: timestamp('created_at').defaultNow(),
  businessSegment: text('business_segment'),
  businessDescription: text('business_description'),
});

// 2. Users table (linked to Firebase UID)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Holds Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  password: text('password'),
  tenantId: text('tenant_id').references(() => tenants.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Channels table
export const channels = pgTable('channels', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.id).notNull(),
  type: text('type').notNull(), // 'whatsapp_meta' | 'instagram'
  identifier: text('identifier').notNull(),
  status: text('status'), // 'connected' | etc.
  // Real Meta Graph API connection data (per-tenant OAuth connection)
  accessToken: text('access_token'), // long-lived user/page access token
  phoneNumberId: text('phone_number_id'), // WhatsApp Cloud API phone number id
  wabaId: text('waba_id'), // WhatsApp Business Account id
  pageId: text('page_id'), // Facebook Page id (used for Instagram messaging)
  igAccountId: text('ig_account_id'), // Instagram Business Account id
  tokenExpiresAt: timestamp('token_expires_at'),
});

// 4. Agent Configurations table
export const agentConfigs = pgTable('agent_configs', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.id).notNull(),
  agentName: text('agent_name').notNull(),
  aiEnabled: boolean('ai_enabled').default(true).notNull(),
  systemPrompt: text('system_prompt'),
  knowledgeBase: text('knowledge_base'),
  instagramTriggers: text('instagram_triggers'), // JSON: {onDmEnabled, onDmWelcomeMsg, onCommentEnabled, onCommentKeywords, onCommentReplyText, onCommentDmText}
});

// 5. Knowledge Docs table
export const knowledgeDocs = pgTable('knowledge_docs', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.id).notNull(),
  filename: text('filename').notNull(),
  content: text('content').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Conversations table
export const conversations = pgTable('conversations', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.id).notNull(),
  channel: text('channel').notNull(), // 'whatsapp_meta' | 'instagram'
  status: text('status').notNull(), // 'open' | 'paused' | etc.
  leadId: text('lead_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  phone: text('phone'),
  email: text('email'),
  location: text('location'),
  statusTag: text('status_tag'),
  avatarUrl: text('avatar_url'),
  notes: text('notes'),
});

// 7. Messages table
export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  convId: text('conv_id').references(() => conversations.id).notNull(),
  tenantId: text('tenant_id').references(() => tenants.id).notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  channels: many(channels),
  agentConfigs: many(agentConfigs),
  knowledgeDocs: many(knowledgeDocs),
  conversations: many(conversations),
}));

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
}));

export const channelsRelations = relations(channels, ({ one }) => ({
  tenant: one(tenants, {
    fields: [channels.tenantId],
    references: [tenants.id],
  }),
}));

export const agentConfigsRelations = relations(agentConfigs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [agentConfigs.tenantId],
    references: [tenants.id],
  }),
}));

export const knowledgeDocsRelations = relations(knowledgeDocs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [knowledgeDocs.tenantId],
    references: [tenants.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ many, one }) => ({
  messages: many(messages),
  tenant: one(tenants, {
    fields: [conversations.tenantId],
    references: [tenants.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.convId],
    references: [conversations.id],
  }),
  tenant: one(tenants, {
    fields: [messages.tenantId],
    references: [tenants.id],
  }),
}));
