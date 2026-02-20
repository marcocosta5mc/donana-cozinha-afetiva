
import React, { useState } from 'react';
import { DBState } from '../types';
import { store } from '../store';

const RecipesView: React.FC<{ db: DBState; refresh: () => void }> = ({ db, refresh }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newPrato, setNewPrato] = useState({ 
    nome: '', 
    descricao: '', 
    preco: 0, 
    foto: 'https://picsum.photos/seed/new/400/300', 
    ativo: true 
  });
  const [ingredientesSelected, setIngredientesSelected] = useState<{insumo_id: string, quantidade: number}[]>([]);

  const handleAddIngredient = () => {
    setIngredientesSelected([...ingredientesSelected, { insumo_id: db.insumos[0].id, quantidade: 0 }]);
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const next = [...ingredientesSelected];
    next[index] = { ...next[index], [field]: value };
    setIngredientesSelected(next);
  };

  const handleSave = () => {
    store.addPrato(newPrato, ingredientesSelected);
    setShowAdd(false);
    setNewPrato({ nome: '', descricao: '', preco: 0, foto: 'https://picsum.photos/seed/new/400/300', ativo: true });
    setIngredientesSelected([]);
    refresh();
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-donana-primary mb-2">Cardápio Ativo</h1>
          <p className="text-gray-500">Configure os pratos da semana e suas receitas.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-donana-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-opacity-90 transition-all"
        >
          + Novo Prato
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {db.pratos.map(prato => (
          <div key={prato.id} className="bg-white border border-donana-soft p-6 rounded-3xl flex gap-6">
            <img src={prato.foto} alt={prato.nome} className="w-32 h-32 rounded-2xl object-cover shadow-sm" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-800">{prato.nome}</h3>
                <span className="text-donana-accent font-bold">R$ {prato.preco.toFixed(2)}</span>
              </div>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{prato.descricao}</p>
              <div className="flex flex-wrap gap-2">
                {db.receitas.filter(r => r.prato_id === prato.id).map((r, i) => {
                  const insumo = db.insumos.find(ins => ins.id === r.insumo_id);
                  return (
                    <span key={i} className="text-[10px] bg-donana-soft/30 px-2 py-0.5 rounded-full text-donana-primary">
                      {r.quantidade_por_marmita}{insumo?.unidade === 'unidade' ? '' : 'g'} {insumo?.nome}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] overflow-y-auto">
          <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl my-8">
            <h2 className="text-2xl font-bold text-donana-primary mb-6">Cadastrar Prato & Receita</h2>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome do Prato</label>
                  <input 
                    type="text" 
                    value={newPrato.nome}
                    onChange={e => setNewPrato({...newPrato, nome: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preço Sugerido (R$)</label>
                  <input 
                    type="number" 
                    value={newPrato.preco}
                    onChange={e => setNewPrato({...newPrato, preco: Number(e.target.value)})}
                    className="mt-1 block w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea 
                    value={newPrato.descricao}
                    onChange={e => setNewPrato({...newPrato, descricao: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border rounded-xl h-24"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Ingredientes (por marmita)</label>
                  <button onClick={handleAddIngredient} className="text-xs font-bold text-donana-primary">+ Adicionar</button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {ingredientesSelected.map((ing, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select 
                        value={ing.insumo_id}
                        onChange={e => updateIngredient(idx, 'insumo_id', e.target.value)}
                        className="flex-1 text-sm p-2 border rounded-lg"
                      >
                        {db.insumos.map(ins => <option key={ins.id} value={ins.id}>{ins.nome}</option>)}
                      </select>
                      <input 
                        type="number" 
                        placeholder="Qtd (g)"
                        value={ing.quantidade}
                        onChange={e => updateIngredient(idx, 'quantidade', Number(e.target.value))}
                        className="w-20 text-sm p-2 border rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowAdd(false)}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-bold"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-3 bg-donana-primary text-white rounded-xl font-bold"
              >
                Salvar Prato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesView;
