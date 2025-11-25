import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Server, BookOpen, FileSpreadsheet } from 'lucide-react';

interface ServerCodeViewerProps {
  onClose: () => void;
  webhookPath: string;
}

type Language = 'nodejs' | 'python';
type Tab = 'code' | 'guide';

const ServerCodeViewer: React.FC<ServerCodeViewerProps> = ({ onClose, webhookPath }) => {
  // Helper to defaulting to guide on first open could be nice, but 'code' is standard
  const guideFirstVisit = false;

  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<Language>('nodejs');
  const [activeTab, setActiveTab] = useState<Tab>(guideFirstVisit ? 'guide' : 'code');
  

  const path = new URL(webhookPath).pathname;

  const codeTemplates = {
    nodejs: `
/**
 * Servidor Webhook (Node.js + Express)
 * Funcionalidade: Recebe Webhook -> Transforma Dados -> Salva em CSV
 * 
 * Setup:
 * 1. Crie uma pasta e entre nela
 * 2. npm init -y
 * 3. npm install express body-parser cors csv-writer
 * 4. node server.js
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');

const app = express();
const PORT = 3000;
const CSV_FILE = 'webhooks.csv';

app.use(bodyParser.json());
app.use(cors());

// Função auxiliar para "achatar" o JSON (Nested -> Flat)
const flattenObject = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '_' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = Array.isArray(obj[k]) ? obj[k].join('|') : obj[k];
    }
    return acc;
  }, {});
};

// Endpoint do Webhook
app.post('${path}', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(\`[$\{timestamp}] 📩 Webhook recebido!\`);
  
  try {
    const rawData = req.body;
    const flatData = flattenObject(rawData);
    const dataWithTime = { timestamp, ...flatData };

    // Determina cabeçalhos baseados nas chaves
    const headers = Object.keys(dataWithTime).map(id => ({ id, title: id }));

    // Configura o escritor de CSV
    const csvWriter = createObjectCsvWriter({
      path: CSV_FILE,
      header: headers,
      append: fs.existsSync(CSV_FILE) // Adiciona se arquivo já existe
    });

    // Se o arquivo já existe mas tem cabeçalhos diferentes, isso é simplificado aqui.
    // Em produção, você verificaria a consistência do schema.
    
    await csvWriter.writeRecords([dataWithTime]);
    console.log(\`✅ Dados salvos em $\{CSV_FILE}\`);

    res.status(200).json({ received: true, saved: true });
  } catch (error) {
    console.error('Erro ao processar:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(\`🚀 Servidor rodando na porta $\{PORT}\`);
  console.log(\`📂 Os dados serão salvos em: $\{CSV_FILE}\`);
  console.log(\`👉 Endpoint Local: http://localhost:$\{PORT}${path}\`);
});
`.trim(),
    python: `
"""
Servidor Webhook (Python + Flask)
Funcionalidade: Recebe Webhook -> Transforma Dados -> Salva em CSV

Setup:
1. pip install flask
2. python server.py
"""

from flask import Flask, request, jsonify
import json
import datetime
import csv
import os

app = Flask(__name__)
CSV_FILE = 'webhooks.csv'

def flatten_json(y):
    out = {}
    def flatten(x, name=''):
        if type(x) is dict:
            for a in x:
                flatten(x[a], name + a + '_')
        elif type(x) is list:
            out[name[:-1]] = "|".join([str(i) for i in x])
        else:
            out[name[:-1]] = x
    flatten(y)
    return out

@app.route('${path}', methods=['POST'])
def webhook():
    timestamp = datetime.datetime.now().isoformat()
    print(f"[{timestamp}] 📩 Webhook recebido!")
    
    try:
        data = request.json
        flat_data = flatten_json(data)
        flat_data['timestamp'] = timestamp

        # Verifica se arquivo existe para escrever cabeçalho
        file_exists = os.path.isfile(CSV_FILE)
        
        with open(CSV_FILE, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=flat_data.keys())
            
            if not file_exists:
                writer.writeheader()
            
            # Nota: Se novos campos aparecerem em webhooks futuros, 
            # o DictWriter do Python pode ignorá-los se não estiverem no header inicial.
            # Para produção, use pandas ou verifique headers dinamicamente.
            writer.writerow(flat_data)
            
        print(f"✅ Dados salvos em {CSV_FILE}")
        return jsonify({"received": True, "saved": True}), 200

    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print(f"🚀 Servidor Python rodando na porta 3000")
    print(f"📂 Os dados serão salvos em: {CSV_FILE}")
    app.run(port=3000, debug=True)
`.trim()
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeTemplates[language]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Server size={20} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Gerar Endpoint Real</h3>
              <p className="text-xs text-slate-400">Este código cria um servidor que salva os dados recebidos em CSV</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'code' 
                ? 'border-indigo-500 text-white bg-slate-800/30' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal size={16} />
            Código do Servidor
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'guide' 
                ? 'border-indigo-500 text-white bg-slate-800/30' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={16} />
            Guia de Instalação (Ngrok)
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-hidden bg-[#0d1117] relative flex flex-col">
          
          {activeTab === 'code' && (
            <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setLanguage('nodejs')}
                    className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                      language === 'nodejs' 
                        ? 'bg-green-500/10 border-green-500 text-green-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    Node.js (com CSV)
                  </button>
                  <button 
                    onClick={() => setLanguage('python')}
                    className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                      language === 'python' 
                        ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    Python (com CSV)
                  </button>
                </div>
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <div className="relative flex-grow">
                 <pre className="absolute inset-0 overflow-auto p-4 text-sm font-mono text-slate-300 leading-relaxed selection:bg-indigo-500/30">
                  <code>{codeTemplates[language]}</code>
                </pre>
              </div>
              <div className="bg-slate-800 p-2 text-xs text-slate-400 border-t border-slate-700 flex items-center justify-center gap-2">
                <FileSpreadsheet size={14} className="text-green-400" />
                Este código salvará automaticamente os dados recebidos em <strong>webhooks.csv</strong> na mesma pasta.
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="flex-grow overflow-auto p-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="max-w-2xl mx-auto space-y-8 pb-8">
                
                <section>
                  <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs">1</span>
                    Salve e Rode o Código
                  </h4>
                  <p className="text-slate-400 text-sm mb-3">
                    Copie o código da aba "Código do Servidor", crie um arquivo no seu computador (ex: <code>server.js</code>) e execute-o.
                  </p>
                  <div className="bg-black/30 p-3 rounded border border-slate-800 font-mono text-xs text-slate-300">
                    <span className="text-slate-500"># Instale as dependências primeiro (se Node.js)</span><br/>
                    $ npm install express body-parser cors csv-writer<br/><br/>
                    <span className="text-slate-500"># Rode o servidor</span><br/>
                    $ node server.js<br/>
                    <span className="text-green-400">🚀 Servidor rodando na porta 3000</span>
                  </div>
                </section>

                <section>
                  <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs">2</span>
                    Use o Ngrok para ficar Online
                  </h4>
                  <p className="text-slate-400 text-sm mb-3">
                    O <strong>Ngrok</strong> cria um túnel seguro para que o Stripe, GitHub ou Shopify consigam enviar dados para o seu computador pessoal.
                  </p>
                  <ul className="list-disc list-inside text-sm text-slate-400 space-y-2 mb-3">
                    <li>Crie uma conta e baixe em <a href="https://ngrok.com/download" target="_blank" className="text-indigo-400 hover:underline">ngrok.com</a>.</li>
                    <li>No terminal, exponha a porta 3000:</li>
                  </ul>
                  <div className="bg-black/30 p-3 rounded border border-slate-800 font-mono text-xs text-slate-300">
                    $ ngrok http 3000
                  </div>
                  <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded text-sm text-indigo-200">
                    O Ngrok mostrará uma URL "Forwarding", parecida com:<br/>
                    <strong className="text-white select-all">https://abc-123.ngrok-free.app</strong>
                  </div>
                </section>

                <section>
                  <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs">3</span>
                    Cadastre o Webhook
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Pegue a URL do Ngrok e adicione o caminho do endpoint. Cole no painel do serviço que você quer integrar.
                  </p>
                  <div className="mt-2 bg-slate-800 p-3 rounded text-xs font-mono text-slate-300 border border-slate-700 break-all">
                    URL para cadastrar: <strong>https://[SEU-ID-NGROK].ngrok-free.app{path}</strong>
                  </div>
                </section>

                <section className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg">
                   <h4 className="text-sm font-bold text-green-400 mb-1 flex items-center gap-2">
                     <FileSpreadsheet size={16} /> Resultado Final
                   </h4>
                   <p className="text-xs text-slate-400">
                     Assim que os eventos começarem a chegar, verifique a pasta do seu script. Um arquivo <strong>webhooks.csv</strong> será criado automaticamente com todos os dados organizados!
                   </p>
                </section>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerCodeViewer;