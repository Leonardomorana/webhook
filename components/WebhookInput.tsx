import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Clipboard, Globe, Wifi, Settings, Zap, Code, Terminal } from 'lucide-react';
import { SAMPLE_WEBHOOKS } from '../services/mockData';
import ServerCodeViewer from './ServerCodeViewer';

interface WebhookInputProps {
  onProcess: (json: string, instructions: string) => Promise<void>;
  isProcessing: boolean;
}

const DEFAULT_INSTRUCTIONS = "Extraia o email do cliente, o nome, a cidade, o valor total (divida por 100 para reais) e uma lista dos produtos separados por vírgula.";

const WebhookInput: React.FC<WebhookInputProps> = ({ onProcess, isProcessing }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
  const [error, setError] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [autoProcess, setAutoProcess] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate generating a unique webhook URL
    const uniqueId = Math.random().toString(36).substring(2, 10);
    setWebhookUrl(`https://api.transformer.ai/v1/hooks/${uniqueId}`);
    
    // Load default sample
    const defaultSample = SAMPLE_WEBHOOKS[0];
    setJsonInput(defaultSample.json);
    setInstructions(defaultSample.instructions);
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [simulationLog]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setSimulationLog(prev => [...prev.slice(-4), `[${time}] ${msg}`]);
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      JSON.parse(jsonInput);
      await onProcess(jsonInput, instructions);
    } catch (e) {
      setError("O JSON fornecido é inválido. Verifique a sintaxe.");
    }
  };

  const handleSimulateEvent = (sampleIndex: number) => {
    const sample = SAMPLE_WEBHOOKS[sampleIndex];
    setJsonInput(sample.json);
    setInstructions(sample.instructions);
    
    // Log simulation
    addLog(`POST ${webhookUrl} - 200 OK`);
    addLog(`Payload recebido: ${sample.name}`);
    
    // Visual feedback
    const flash = document.getElementById('json-editor');
    if (flash) {
      flash.classList.add('ring-2', 'ring-green-500', 'bg-slate-800');
      setTimeout(() => flash.classList.remove('ring-2', 'ring-green-500', 'bg-slate-800'), 300);
    }

    if (autoProcess) {
      addLog(`Auto-triggering transformation...`);
      setTimeout(() => {
        onProcess(sample.json, sample.instructions);
      }, 500);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addLog("URL copiada para área de transferência");
  };

  return (
    <div className="flex flex-col gap-6 h-full relative">
      {showCodeModal && (
        <ServerCodeViewer 
          onClose={() => setShowCodeModal(false)} 
          webhookPath={webhookUrl} 
        />
      )}
      
      {/* Configuration Header / Endpoint Info */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto min-w-0">
          <div className="p-2 bg-indigo-500/20 rounded-lg flex-shrink-0">
            <Globe size={20} className="text-indigo-400" />
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Virtual Sandbox Endpoint
              </label>
              <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/30">
                Simulação
              </span>
            </div>
            <div className="flex items-center gap-2 group cursor-pointer max-w-full">
              <code className="text-sm font-mono text-slate-200 bg-slate-900 px-2 py-1 rounded border border-slate-700 group-hover:border-indigo-500 transition-colors truncate select-all">
                {webhookUrl}
              </code>
              <button onClick={() => copyToClipboard(webhookUrl)} className="text-slate-500 hover:text-indigo-400 p-1">
                <Clipboard size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-l border-slate-700 pl-4 w-full md:w-auto justify-between md:justify-start">
           <button 
             onClick={() => setShowCodeModal(true)}
             className="flex items-center gap-2 text-xs font-medium text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-md border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors hover:shadow-lg hover:shadow-indigo-500/10"
           >
             <Code size={14} />
             Gerar Endpoint Real
           </button>

           <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Auto-Processar</span>
              <button 
                onClick={() => setAutoProcess(!autoProcess)}
                className={`w-10 h-5 rounded-full flex items-center transition-colors p-1 ${autoProcess ? 'bg-indigo-600' : 'bg-slate-700'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${autoProcess ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
        
        {/* Left Column: Receiver Simulator */}
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-t-lg border-x border-t border-slate-700">
             <label className="text-sm font-medium text-slate-400 flex items-center gap-2 px-2">
               <Wifi size={14} />
               Payload Recebido (JSON)
             </label>
             <div className="flex gap-2">
                <select 
                  onChange={(e) => handleSimulateEvent(Number(e.target.value))}
                  className="bg-slate-900 text-xs text-indigo-300 border border-indigo-500/30 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer hover:bg-slate-800"
                  value=""
                >
                  <option value="" disabled>📡 Testar com Dados...</option>
                  {SAMPLE_WEBHOOKS.map((sample, idx) => (
                    <option key={idx} value={idx}>Enviar: {sample.name}</option>
                  ))}
                </select>
             </div>
          </div>
          
          <div className="relative flex-grow min-h-[300px] flex flex-col">
            <textarea
              id="json-editor"
              className={`w-full flex-grow bg-slate-900 border-x border-t ${error ? 'border-red-500' : 'border-slate-700'} p-4 font-mono text-xs md:text-sm text-slate-300 focus:outline-none focus:ring-inset focus:ring-2 focus:ring-indigo-500 resize-none transition-all duration-300 rounded-b-none`}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='// O payload do webhook aparecerá aqui...'
              spellCheck={false}
            />
            
            {/* Simulation Console Log */}
            <div className="h-24 bg-black/40 border-x border-b border-slate-700 rounded-b-lg p-2 font-mono text-[10px] overflow-auto">
              <div className="text-slate-500 mb-1 flex items-center gap-1 border-b border-slate-800 pb-1">
                <Terminal size={10} /> Console de Eventos
              </div>
              {simulationLog.length === 0 && <span className="text-slate-700 italic">Aguardando requisições...</span>}
              {simulationLog.map((log, i) => (
                <div key={i} className="text-green-400/80 border-l-2 border-green-900 pl-2 mb-0.5 animate-fade-in">
                  <span className="text-slate-500 mr-2">{log.split(']')[0]}]</span>
                  {log.split(']')[1]}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            {error && (
              <div className="absolute top-4 right-4 bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded text-xs shadow-lg backdrop-blur-md">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Config */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex flex-col gap-2 flex-grow min-h-0">
             <label className="text-sm font-medium text-slate-400 flex items-center gap-2 px-1">
              <Settings size={14} />
              Regras de Transformação (IA)
            </label>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex-grow flex flex-col min-h-0 shadow-inner">
              <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                Descreva em linguagem natural como deseja organizar os dados do webhook na planilha.
              </p>
              <textarea
                className="w-full flex-grow bg-slate-900 border border-slate-700 rounded-md p-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-slate-600"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ex: Extraia o email, o ID do pedido e formate a data para DD/MM/AAAA..."
              />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 p-4 rounded-lg border border-slate-700">
            <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Zap size={12} fill="currentColor"/> Status do Pipeline
            </h4>
            <div className="flex items-center justify-between text-xs text-slate-400">
               <span>Listener: <span className="text-green-400">Ativo (Simulado)</span></span>
               <span>IA Model: <span className="text-blue-400">Gemini Flash 2.5</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-xl mt-auto">
        <button
          onClick={() => { 
            setJsonInput(''); 
            setInstructions(DEFAULT_INSTRUCTIONS); 
            addLog('Reset input manual');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors text-sm font-medium"
          disabled={isProcessing}
        >
          <RotateCcw size={16} />
          Limpar
        </button>
        <button
          onClick={() => {
            if(!jsonInput) {
              setError("O corpo do JSON está vazio.");
              return;
            }
            addLog("Iniciando transformação manual...");
            handleSubmit();
          }}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white font-semibold shadow-lg transition-all ${
            isProcessing 
              ? 'bg-indigo-600/50 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-95'
          }`}
        >
          {isProcessing ? (
             <>Processando...</>
          ) : (
            <>
              <Play size={18} fill="currentColor" />
              Executar Transformação
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WebhookInput;