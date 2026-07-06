import React, { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Briefcase, 
  Mail, 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Building,
  Key
} from "lucide-react";

interface ClientsManagementViewProps {
  currentTenant: any;
  onUpdateTenant: (updatedTenant: any) => void;
}

export default function ClientsManagementView({ currentTenant, onUpdateTenant }: ClientsManagementViewProps) {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Create Client Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [segment, setSegment] = useState("Varejo e Moda");
  const [description, setDescription] = useState("");
  const [plan, setPlan] = useState<"starter" | "pro" | "business" | "enterprise">("pro");
  
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tenants");
      if (res.ok) {
        const data = await res.json();
        setTenants(data.tenants || []);
      }
    } catch (err) {
      console.error("Erro ao buscar empresas", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setActionLoading(true);

    try {
      const res = await fetch("/api/admin/create-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          plan,
          segment,
          description
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ocorreu um erro ao cadastrar");
      }

      setSuccessMsg(`Empresa "${name}" criada com sucesso! O usuário ${email} já pode acessar o sistema com a senha fornecida.`);
      
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setDescription("");
      
      // Refresh list
      fetchTenants();
    } catch (err: any) {
      setError(err.message || "Erro de rede");
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageClient = (targetTenant: any) => {
    onUpdateTenant(targetTenant);
    alert(`Sessão alterada! Você agora está visualizando e gerenciando o painel de: "${targetTenant.name}".`);
  };

  return (
    <div id="clients-management-view" className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
          Controle SaaS Multi-Tenant
        </span>
        <h2 className="text-xl font-black text-slate-900 mt-2 tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          Gerenciar Contas de Clientes (Empresas)
        </h2>
        <p className="text-xs text-slate-500">
          Cadastre novas clientes comerciais, configure seus dados de IA, gere credenciais exclusivas de acesso e alterne entre painéis instantaneamente.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Form to Create Tenant (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Registrar Nova Cliente
            </h3>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-[11px] flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-[11px] space-y-1">
                <div className="flex items-start gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Sucesso!</span>
                </div>
                <p className="leading-relaxed">{successMsg}</p>
              </div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-3.5">
              {/* Business Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Nome da Empresa / Cliente
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Boutique da Maria, EcoModas"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Segment */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Ramo de Atuação (Segmento)
                </label>
                <input
                  type="text"
                  required
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  placeholder="Ex: Loja de Roupas Femininas, Clínica Médica"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Business Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Descrição Comercial (Base para IA)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o negócio da cliente, horários de funcionamento, regras de entrega, etc..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                />
              </div>

              {/* Plan & Pricing */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Plano Comercial Vinculado
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="starter">START (R$ 97/mês)</option>
                  <option value="pro">PRO (R$ 197/mês)</option>
                  <option value="business">BUSINESS (R$ 397/mês)</option>
                  <option value="enterprise">ENTERPRISE (Premium)</option>
                </select>
              </div>

              <div className="border-t border-slate-100 my-4 pt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  Dados de Login Exclusivos do Cliente
                </span>
                <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
                  Sua cliente usará estes dados para acessar o sistema de forma segura, visualizando apenas o painel e os chats dela.
                </p>
                
                {/* Operator Email */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      E-mail de Acesso
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="cliente@email.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Senha de Acesso
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-100"
              >
                {actionLoading ? "Registrando no Banco..." : "Criar Empresa & Ativar Login"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Existing Clients List (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-600" />
                Empresas Ativas no Sistema
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                {tenants.length} cadastradas
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Carregando lista de clientes do banco de dados...
              </div>
            ) : tenants.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Nenhuma empresa de cliente cadastrada ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {tenants.map((item) => {
                  const isActive = item.id === currentTenant.id;
                  return (
                    <div 
                      key={item.id}
                      className={`border rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isActive 
                          ? "bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300"
                          : "bg-white border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs text-slate-900">{item.name}</h4>
                          {isActive && (
                            <span className="text-[8px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                              Visualizando Agora
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          E-mail de Login: <b className="text-slate-800 font-bold">{item.owner_email || "Nenhum cadastrado"}</b>
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Segmento: <b className="text-slate-800 font-bold">{item.businessSegment || "Não definido"}</b>
                        </p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {item.businessDescription || "Sem descrição preenchida no onboarding."}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          Plano {item.plan?.toUpperCase()}
                        </span>
                        
                        <button
                          onClick={() => handleManageClient(item)}
                          className={`px-3 py-2 text-[10px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                            isActive
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          }`}
                        >
                          <Activity className="w-3.5 h-3.5" />
                          Gerenciar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Instruction Warning for Switcher */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-[10px] text-slate-500 leading-relaxed space-y-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Como funciona a simulação e configuração?
              </span>
              <p>
                Ao clicar em <b>"Gerenciar"</b> em qualquer empresa da lista, você sintoniza instantaneamente seu ambiente do sistema para a conta dela. Todos os chats, documentos de conhecimento e inteligência artificial mostrados nas outras abas do menu passarão a responder pelo contexto desse cliente em tempo real!
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
