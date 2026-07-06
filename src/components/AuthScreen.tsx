import React, { useState } from "react";
import { Mail, Lock, User as UserIcon, ArrowLeft, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface AuthScreenProps {
  initialPlan?: 'starter' | 'pro' | 'business' | 'enterprise';
  onAuthSuccess: (user: any, tenant: any) => void;
  onBackToLanding: () => void;
}

export default function AuthScreen({ initialPlan = 'pro', onAuthSuccess, onBackToLanding }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<'starter' | 'pro' | 'business' | 'enterprise'>(initialPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin ? { email, password } : { email, password, name, plan };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Algo deu errado");
      }

      onAuthSuccess(data.user, data.tenant);
    } catch (err: any) {
      setError(err.message || "Falha na conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setError("");
    setLoading(true);

    // Simulate Google OAuth popup and automatic register/login
    setTimeout(async () => {
      try {
        const fakeEmail = "google.user@caroconnect.eco";
        const fakeName = "Google User Demo";
        
        // Try to register, if already exists try login
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: fakeEmail,
            name: fakeName,
            password: "oauth_simulated_password",
            plan,
          }),
        });

        let data = await res.json();
        if (!res.ok) {
          // If already registered, log in
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: fakeEmail, password: "oauth_simulated_password" }),
          });
          data = await loginRes.json();
          if (!loginRes.ok) {
            throw new Error(data.error || "Falha ao simular Google OAuth");
          }
        }

        onAuthSuccess(data.user, data.tenant);
      } catch (err: any) {
        setError(err.message || "Erro no fluxo Google OAuth");
      } finally {
        setLoading(false);
      }
    }, 1200); // simulated OAuth delay
  };

  const handleAppleOAuth = async () => {
    setError("");
    setLoading(true);

    // Simulate Apple ID popup and automatic register/login
    setTimeout(async () => {
      try {
        const fakeEmail = "apple.user@caroconnect.eco";
        const fakeName = "Apple User Demo";
        
        // Try to register, if already exists try login
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: fakeEmail,
            name: fakeName,
            password: "oauth_simulated_password",
            plan,
          }),
        });

        let data = await res.json();
        if (!res.ok) {
          // If already registered, log in
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: fakeEmail, password: "oauth_simulated_password" }),
          });
          data = await loginRes.json();
          if (!loginRes.ok) {
            throw new Error(data.error || "Falha ao simular Apple ID");
          }
        }

        onAuthSuccess(data.user, data.tenant);
      } catch (err: any) {
        setError(err.message || "Erro no fluxo Apple ID");
      } finally {
        setLoading(false);
      }
    }, 1200); // simulated OAuth delay
  };

  return (
    <div id="auth-screen" className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden p-8 relative">
        
        {/* Back button */}
        <button
          onClick={onBackToLanding}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar
        </button>

        {/* Logo and Greeting */}
        <div className="text-center mt-6 mb-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto shadow-md shadow-emerald-100">
            CA
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
            {isLogin ? "Bem-vindo de volta" : "Criar sua conta CA.RO"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {isLogin
              ? "Acesse seu dashboard e controle seus agentes"
              : "Cadastre-se e ative seu atendente virtual inteligente em minutos"}
          </p>
        </div>

        {/* Errors display */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-100 text-red-700 rounded-xl p-3.5 text-xs flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Seu Nome Completo / Razão Social
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Rony Silva ou EcoModas Ltda"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Plano Selecionado
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as any)}
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="starter">START (R$ 97/mês)</option>
                  <option value="pro">PRO (R$ 197/mês)</option>
                  <option value="business">BUSINESS (R$ 397/mês)</option>
                  <option value="enterprise">ENTERPRISE (Sob consulta)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              E-mail de Acesso
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Senha secreta
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm shadow-md shadow-emerald-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLogin ? (
              "Acessar Painel"
            ) : (
              "Criar Conta & Avançar"
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-slate-400 uppercase tracking-wider font-bold">ou continue com</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            id="btn-google-oauth"
            type="button"
            onClick={handleGoogleOAuth}
            disabled={loading}
            className="bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          <button
            id="btn-apple-oauth"
            type="button"
            onClick={handleAppleOAuth}
            disabled={loading}
            className="bg-slate-900 border border-slate-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.94-1.39z"/>
            </svg>
            Apple ID
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          {isLogin ? (
            <p>
              Não possui uma conta?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
              >
                Cadastre-se grátis
              </button>
            </p>
          ) : (
            <p>
              Já possui uma conta?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
              >
                Entre aqui
              </button>
            </p>
          )}
        </div>

        {/* Demo instructions */}
        <div className="mt-6 bg-emerald-50/50 rounded-2xl p-4 text-[11px] text-slate-600 leading-relaxed border border-emerald-50">
          <p className="flex items-center gap-1 font-bold text-emerald-800 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Dica de Teste Rápido:
          </p>
          Você pode usar o e-mail <b className="text-emerald-950 font-bold">demo@caroconnect.com</b> e senha <b className="text-emerald-950 font-bold">demo</b> para entrar instantaneamente em um painel já preenchido com dados!
        </div>

      </div>
    </div>
  );
}
