import React, { useState, useEffect } from "react";
import { FileText, Upload, Trash2, Loader2, Sparkles, AlertCircle, PlusCircle, FileUp, Database } from "lucide-react";

interface KnowledgeBaseProps {
  tenant: any;
}

export default function KnowledgeBase({ tenant }: KnowledgeBaseProps) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filename, setFilename] = useState("");
  const [content, setContent] = useState("");

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tenant/knowledge-docs?tenantId=${tenant.id}`);
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
      }
    } catch (err) {
      console.error("Failed to fetch knowledge docs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [tenant.id]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename || !content) {
      alert("Preencha todos os campos para carregar o documento");
      return;
    }

    setUploading(true);
    try {
      const properFilename = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
      const res = await fetch("/api/tenant/knowledge-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          filename: properFilename,
          content,
        }),
      });

      if (res.ok) {
        const newDoc = await res.json();
        setDocs((prev) => [...prev, newDoc]);
        setShowUploadModal(false);
        setFilename("");
        setContent("");
      } else {
        alert("Falha ao fazer upload simulado.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro na rede.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta base de conhecimento? O Agente IA perderá acesso a estas informações imediatamente.")) {
      return;
    }

    try {
      const res = await fetch(`/api/tenant/knowledge-docs/${docId}?tenantId=${tenant.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocs((prev) => prev.filter((d) => d.id !== docId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="knowledge-base-view" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <Database className="w-5 h-5 text-emerald-600" />
            Base de Conhecimento do Agente
          </h2>
          <p className="text-xs text-slate-500">
            Adicione manuais, FAQs, tabelas de valores ou políticas em PDF. O Agente IA usará estes dados para responder clientes de forma precisa.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-50 cursor-pointer flex items-center gap-1.5 transition-all self-start"
        >
          <FileUp className="w-4 h-4" />
          Treinar IA com Novo PDF
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-xs font-bold text-slate-800">Sua base de conhecimento está vazia</h3>
          <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
            Sem documentos, o Agente IA usará apenas as instruções gerais do prompt e informações do negócio. Adicione seu primeiro PDF para obter respostas cirúrgicas!
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-[11px] font-bold px-4 py-2 rounded-lg cursor-pointer transition-all"
          >
            Adicionar manual em PDF
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="border border-slate-200 hover:border-slate-300 rounded-2xl p-4 bg-white shadow-sm flex items-start justify-between gap-4 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{doc.filename}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Tamanho: {(doc.sizeBytes / 1024).toFixed(1)} KB • Enviado em{" "}
                    {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                  
                  {/* Collapsible/preview content text */}
                  <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-600 line-clamp-3 leading-relaxed">
                    {doc.content}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDeleteDoc(doc.id)}
                className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Excluir documento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD PDF MOCK MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[200] px-4 font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden p-6 relative animate-zoomIn">
            <h3 className="text-sm font-black text-slate-900">Treinar IA com Novo Manual (Simulador de PDF)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Escreva ou cole as diretrizes de perguntas e respostas ou regras de negócio. O sistema simulará o upload e a extração automática do texto do PDF.
            </p>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Nome do Arquivo PDF
                </label>
                <input
                  type="text"
                  required
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="politica_reembolso.pdf"
                  className="block w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Conteúdo Textual (Será indexado no banco vetorizado)
                </label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Cole aqui as regras de negócio de forma explícita. Ex: 'O suporte comercial funciona das 9h às 18h de segunda a sexta. No sábado atendemos das 9h às 13h pelo telefone comercial. O frete é gratuito nas compras acima de R$ 250,00...'"
                  className="block w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1"
                >
                  {uploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      Indexar Conhecimento
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
