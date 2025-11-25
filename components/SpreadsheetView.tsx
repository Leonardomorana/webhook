import React from 'react';
import { ProcessedRow } from '../types';
import { Download, Trash2, Database, AlertCircle } from 'lucide-react';

interface SpreadsheetViewProps {
  data: ProcessedRow[];
  onClearData: () => void;
}

const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({ data, onClearData }) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
        <Database size={64} className="mb-4 text-slate-600" />
        <p className="text-lg font-medium">Nenhum dado processado ainda.</p>
        <p className="text-sm">Envie um webhook na aba "Entrada" para começar.</p>
      </div>
    );
  }

  // Determine all unique keys across all rows to build dynamic headers
  const allKeys = Array.from(
    new Set(data.flatMap((row) => Object.keys(row.data)))
  ).sort() as string[];

  const handleExportCSV = () => {
    if (data.length === 0) return;

    // Header
    const headers = ['Timestamp', 'ID', ...allKeys].join(',');
    
    // Rows
    const rows = data.map(row => {
      const rowData = allKeys.map(key => {
        const val = row.data[key];
        // Escape quotes and wrap in quotes if necessary
        const stringVal = val === null || val === undefined ? '' : String(val);
        return `"${stringVal.replace(/"/g, '""')}"`;
      });
      return [`"${row.timestamp}"`, `"${row.id}"`, ...rowData].join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `webhook_data_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-mono border border-green-500/20">
            {data.length} Registro(s)
          </div>
          <span className="text-slate-400 text-sm">Dados prontos para exportação</span>
        </div>
        <div className="flex gap-2">
           <button
            onClick={onClearData}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors text-xs font-medium"
          >
            <Trash2 size={14} />
            Limpar Tudo
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white transition-colors text-xs font-bold shadow-lg shadow-green-900/20"
          >
            <Download size={14} />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-auto border border-slate-700 rounded-lg bg-slate-900 shadow-inner">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-800 text-slate-200 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-3 border-b border-r border-slate-700 font-semibold w-20 text-center">#</th>
              <th className="p-3 border-b border-r border-slate-700 font-semibold whitespace-nowrap">Timestamp</th>
              {allKeys.map(key => (
                <th key={key} className="p-3 border-b border-r border-slate-700 font-semibold whitespace-nowrap min-w-[150px]">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.map((row, index) => (
              <tr key={row.id} className="hover:bg-slate-800/50 transition-colors group">
                <td className="p-3 border-r border-slate-800 text-slate-500 text-center font-mono text-xs">
                  {data.length - index}
                </td>
                <td className="p-3 border-r border-slate-800 text-slate-400 font-mono text-xs whitespace-nowrap">
                  {new Date(row.timestamp).toLocaleTimeString()}
                </td>
                {allKeys.map(key => {
                   const value = row.data[key];
                   let displayValue = value;
                   let valueClass = "text-slate-300";

                   if (value === null || value === undefined) {
                     displayValue = "-";
                     valueClass = "text-slate-600";
                   } else if (typeof value === 'boolean') {
                     displayValue = value ? 'TRUE' : 'FALSE';
                     valueClass = value ? 'text-green-400 font-mono text-xs' : 'text-red-400 font-mono text-xs';
                   } else if (typeof value === 'number') {
                     valueClass = "text-blue-300 font-mono";
                   }

                   return (
                    <td key={key} className={`p-3 border-r border-slate-800 ${valueClass} truncate max-w-[300px]`} title={String(displayValue)}>
                      {String(displayValue)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex gap-2 items-start text-xs text-slate-500 p-2">
         <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
         <p>As colunas são geradas dinamicamente pela IA com base nas chaves encontradas. Se você alterar as regras de transformação drasticamente, recomenda-se limpar a tabela para manter a consistência.</p>
      </div>
    </div>
  );
};

export default SpreadsheetView;