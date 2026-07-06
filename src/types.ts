export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'starter' | 'pro' | 'business' | 'enterprise';
  status: 'active' | 'inactive' | 'pending_payment';
  owner_email: string;
  createdAt: string;
  businessSegment?: string;
  businessDescription?: string;
}

export interface Channel {
  id: string;
  tenantId: string;
  type: 'whatsapp_meta' | 'instagram';
  identifier: string; // e.g. Phone number or Instagram handle
  status: 'connected' | 'disconnected';
}

export interface AgentConfig {
  id: string;
  tenantId: string;
  agentName: string;
  aiEnabled: boolean;
  systemPrompt: string;
  knowledgeBase?: string; // summary of knowledge base
}

export interface KnowledgeDoc {
  id: string;
  tenantId: string;
  filename: string;
  content: string; // Text representation of PDF or document
  sizeBytes: number;
  createdAt: string;
}

export interface Conversation {
  id: string;
  tenantId: string;
  channel: 'whatsapp_meta' | 'instagram';
  status: 'open' | 'closed' | 'paused';
  lead_id: string; // e.g. "Lead #1032" or customer contact name
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  convId: string;
  tenantId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface DashboardStats {
  totalConversations: number;
  activeLeads: number;
  aiResponseRate: number; // percentage of messages answered by AI
  totalKnowledgeDocs: number;
  activeChannels: number;
}
