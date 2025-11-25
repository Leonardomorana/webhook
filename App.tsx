
import React, { useState } from 'react';
import { Box, Table, Zap, FileSpreadsheet, Layers, Radio } from 'lucide-react';
import WebhookInput from './components/WebhookInput';
import SpreadsheetView from './components/SpreadsheetView';
import { transformWebhookData } from './services/geminiService';
import { ProcessedRow, Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.INPUT);
  const [rows, setRows] = useState<ProcessedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleProcessWebhook = async (json: string, instructions: string) => {
    setIsProcessing(true);
    try {
      const result = await transformWebhookData(json, instructions);
      
      const newRow: ProcessedRow = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        originalPayload: json,
        data: result
      };

      setRows(prev => [newRow, ...prev]);
      showNotification("Webhook processado e adicionado à planilha com sucesso!", 'success');
      
      // We don't auto-switch tabs immediately if it's an auto-process flow, 
      // but for manual clicks we might want to stay to see the result or switch.
      // Let's stay on input to allow rapid testing, but show a success bubble.
    } catch (error) {
      console.error(error);
      showNotification("Falha ao processar webhook. Verifique o console ou tente novamente.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados da planilha?')) {
      setRows([]);
      showNotification("Planilha limpa.", 'success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">Webhook Transformer AI</h1>
              <p className="text-xs text-slate-500">Intelligent Data Pipeline</p>
            </div>
          </div>
          
          <nav className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
            <button
              onClick={() => setActiveTab(Tab.INPUT)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === Tab.INPUT 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Radio size={16} />
              Conexão Webhook
            </button>
            <button
              onClick={() => setActiveTab(Tab.SHEET)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === Tab.SHEET 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet size={16} />
              Planilha de Dados
              {rows.length > 0 && (
                <span className="ml-1 bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {rows.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-64px)]">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl h-full p-6 flex flex-col relative overflow-hidden">
          
          {/* Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          {/* Notification Toast */}
          {notification && (
            <div className={`absolute top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 animate-fade-in-down ${
              notification.type === 'success' 
                ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                : 'bg-red-500/10 border-red-500/50 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">{notification.msg}</span>
            </div>
          )}

          {activeTab === Tab.INPUT && (
            <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col">
               <div className="mb-4 flex-shrink-0">
                 <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                   <Layers size={20} className="text-indigo-400"/>
                   Receptor de Webhooks
                 </h2>
                 <p className="text-slate-400 text-sm mt-1">
                   Configure seu endpoint, simule eventos recebidos e defina regras de ETL com IA.
                 </p>
               </div>
               <div className="flex-grow min-h-0">
                 <WebhookInput onProcess={handleProcessWebhook} isProcessing={isProcessing} />
               </div>
            </div>
          )}

          {activeTab === Tab.SHEET && (
             <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col">
               <div className="mb-4 flex-shrink-0">
                 <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                   <FileSpreadsheet size={20} className="text-green-400"/>
                   Dados Organizados
                 </h2>
                 <p className="text-slate-400 text-sm mt-1">Visualize, filtre e exporte os dados transformados pela IA.</p>
               </div>
               <div className="flex-grow min-h-0">
                <SpreadsheetView data={rows} onClearData={handleClearData} />
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
