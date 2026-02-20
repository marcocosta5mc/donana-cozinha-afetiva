
import React, { useState } from 'react';
import { DBState } from '../types';
import { store } from '../store';
import { processInvoiceOCR } from '../services/geminiService';

const InventoryView: React.FC<{ db: DBState; refresh: () => void }> = ({ db, refresh }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ nome: '', unidade: 'kg' as 'kg' | 'g' | 'unidade', quantidade_atual: 0, custo_unitario: 0 });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const items = await processInvoiceOCR(base64);
      if (items && items.length > 0) {
        store.updateStockFromOCR(items);
        refresh();
        alert("Estoque atualizado via IA com sucesso!");
      } else {
        alert("Não foi possível extrair dados da nota fiscal.");
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddItem = () => {
    store.addInsumo(newItem);
    setNewItem({ nome: '', unidade: 'kg', quantidade_atual: 0, custo_unitario: 0 });
    setShowAddModal(false);
    refresh();
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-donana-primary mb-2">Controle de Insumos</h1>
          <p className="text-gray-500">Gerencie a matéria-prima da sua cozinha.</p>
        </div>
        <div className="flex gap-4">
          <label className={`cursor-pointer bg-white border-2 border-donana-primary text-donana-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-donana-primary hover:text-white transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {isUploading ? 'Processando IA...' : '📸 Importar Nota Fiscal'}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-donana-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-opacity-90 transition-all"
          >
            + Novo Insumo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-donana-soft">
        <table className="w-full text-left">
          <thead className="bg-donana-soft/20 text-donana-primary font-bold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Nome do Item</th>
              <th className="px-6 py-4 text-center">Unidade</th>
              <th className="px-6 py-4 text-center">Qtd Atual</th>
              <th className="px-6 py-4 text-right">Custo Unitário</th>
              <th className="px-6 py-4 text-right">Valor em Estoque</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-donana-soft">
            {db.insumos.map(insumo => (
              <tr key={insumo.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-800">{insumo.nome}</td>
                <td className="px-6 py-4 text-center text-gray-500">{insumo.unidade}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full font-bold ${insumo.quantidade_atual < 2 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {insumo.quantidade_atual.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-500">R$ {insumo.custo_unitario.toFixed(2)}</td>
                <td className="px-6 py-4 text-right font-bold text-gray-800">
                  R$ {(insumo.quantidade_atual * insumo.custo_unitario).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-donana-primary mb-6">Novo Insumo</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input 
                  type="text" 
                  value={newItem.nome}
                  onChange={e => setNewItem({...newItem, nome: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unidade</label>
                  <select 
                    value={newItem.unidade}
                    onChange={e => setNewItem({...newItem, unidade: e.target.value as any})}
                    className="mt-1 block w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="kg">Quilo (kg)</option>
                    <option value="g">Grama (g)</option>
                    <option value="unidade">Unidade</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Qtd Inicial</label>
                  <input 
                    type="number" 
                    value={newItem.quantidade_atual}
                    onChange={e => setNewItem({...newItem, quantidade_atual: Number(e.target.value)})}
                    className="mt-1 block w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Custo Unitário (R$)</label>
                <input 
                  type="number" 
                  value={newItem.custo_unitario}
                  onChange={e => setNewItem({...newItem, custo_unitario: Number(e.target.value)})}
                  className="mt-1 block w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl font-bold"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddItem}
                className="flex-1 px-4 py-3 bg-donana-primary text-white rounded-xl font-bold"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
