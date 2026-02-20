
import React, { useState, useEffect } from 'react';
import { DBState, ShoppingListItem } from '../types';
import { store } from '../store';

const ShoppingListView: React.FC<{ db: DBState }> = ({ db }) => {
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [list, setList] = useState<ShoppingListItem[]>([]);

  useEffect(() => {
    setList(store.generateShoppingList(targetDate));
  }, [targetDate, db]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-donana-primary mb-2">Lista de Compras</h1>
          <p className="text-gray-500">Planejamento automático baseado nos pedidos agendados.</p>
        </div>
        <div className="bg-white p-2 rounded-xl border border-donana-soft flex items-center">
          <label className="px-3 text-xs font-bold text-gray-400 uppercase">Previsão para</label>
          <input 
            type="date" 
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
            className="border-none focus:ring-0 p-2 text-donana-primary font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-donana-accent/10 p-6 rounded-3xl border border-donana-accent/20">
          <p className="text-xs font-bold text-donana-accent uppercase mb-1">Pedidos p/ Data</p>
          <p className="text-3xl font-bold text-donana-accent">
            {db.pedidos.filter(p => p.data_entrega.startsWith(targetDate)).length}
          </p>
        </div>
        <div className="bg-donana-primary/10 p-6 rounded-3xl border border-donana-primary/20">
          <p className="text-xs font-bold text-donana-primary uppercase mb-1">Marmitas p/ Produzir</p>
          <p className="text-3xl font-bold text-donana-primary">
            {db.pedidos.filter(p => p.data_entrega.startsWith(targetDate)).reduce((acc, p) => acc + p.itens.reduce((sum, i) => sum + i.quantidade, 0), 0)}
          </p>
        </div>
        <div className="bg-donana-secondary/10 p-6 rounded-3xl border border-donana-secondary/20">
          <p className="text-xs font-bold text-donana-secondary uppercase mb-1">Itens a Comprar</p>
          <p className="text-3xl font-bold text-donana-secondary">
            {list.filter(i => i.quantidade_comprar > 0).length}
          </p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl border border-donana-soft text-center text-gray-400">
          Nenhum insumo necessário para os pedidos agendados nesta data.
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-donana-soft overflow-hidden">
          <div className="p-6 border-b border-donana-soft flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Insumos Necessários</h2>
            <button 
              onClick={() => window.print()}
              className="text-donana-primary text-sm font-bold flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 00-2 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              Imprimir Lista
            </button>
          </div>
          <div className="divide-y divide-donana-soft">
            {list.map((item, idx) => (
              <div key={idx} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${item.quantidade_comprar > 0 ? 'bg-orange-50/20' : ''}`}>
                <div>
                  <p className="font-bold text-gray-800">{item.nome}</p>
                  <p className="text-xs text-gray-400">Total Necessário: {item.quantidade_necessaria.toFixed(2)}{item.unidade}</p>
                </div>
                <div className="text-right">
                  {item.quantidade_comprar > 0 ? (
                    <div className="flex flex-col items-end">
                      <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                        Comprar: {item.quantidade_comprar.toFixed(2)}{item.unidade}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1">Disponível: {item.quantidade_estoque.toFixed(2)}{item.unidade}</span>
                    </div>
                  ) : (
                    <span className="text-donana-accent font-bold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      Estoque Suficiente
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListView;
