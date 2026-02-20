
import React from 'react';
import { DBState, OrderStatus } from '../types';
import { store } from '../store';

const AdminDashboard: React.FC<{ db: DBState; refresh: () => void }> = ({ db, refresh }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayPedidos = db.pedidos.filter(p => p.data_entrega.startsWith(today));

  const handleConfirm = (id: string) => {
    store.confirmDelivery(id);
    refresh();
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-bold text-donana-dark mb-2">Entregas de Hoje</h1>
          <p className="text-donana-secondary font-medium italic">Gestão da produção para {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="flex gap-6">
          <div className="bg-white px-8 py-5 rounded-3xl shadow-sm border border-donana-soft text-center min-w-[120px]">
            <p className="text-[10px] font-bold text-donana-secondary uppercase tracking-widest mb-1">Pedidos</p>
            <p className="text-3xl font-bold text-donana-primary">{todayPedidos.length}</p>
          </div>
          <div className="bg-donana-primary/10 px-8 py-5 rounded-3xl border border-donana-primary/20 text-center min-w-[120px]">
            <p className="text-[10px] font-bold text-donana-primary uppercase tracking-widest mb-1">Total Marmitas</p>
            <p className="text-3xl font-bold text-donana-dark">{todayPedidos.reduce((acc, p) => acc + p.itens.reduce((sum, i) => sum + i.quantidade, 0), 0)}</p>
          </div>
        </div>
      </header>

      {todayPedidos.length === 0 ? (
        <div className="bg-white py-24 px-6 rounded-[3rem] border border-donana-soft text-center shadow-inner">
          <p className="text-donana-secondary text-xl italic font-serif">Nenhum pedido agendado para o dia de hoje.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {todayPedidos.map(pedido => (
            <div key={pedido.id} className={`bg-white p-8 rounded-[2rem] border transition-all ${pedido.status === OrderStatus.DELIVERED ? 'opacity-70 border-donana-soft' : 'border-donana-primary/30 shadow-md ring-1 ring-donana-primary/5'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-2xl font-bold text-donana-dark">{pedido.cliente_nome}</h3>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${pedido.status === OrderStatus.DELIVERED ? 'bg-donana-soft text-donana-secondary' : 'bg-donana-primary text-white'}`}>
                      {pedido.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pedido.itens.map((item, idx) => {
                      const prato = db.pratos.find(p => p.id === item.prato_id);
                      return (
                        <div key={idx} className="flex items-center gap-3 text-sm text-donana-text font-medium bg-donana-bg/50 px-4 py-2 rounded-xl border border-donana-soft/50">
                          <span className="w-6 h-6 bg-donana-primary/20 text-donana-dark flex items-center justify-center rounded text-[10px] font-black">{item.quantidade}x</span>
                          {prato?.nome}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end gap-6 border-t md:border-t-0 md:border-l border-donana-soft pt-6 md:pt-0 md:pl-10">
                  <div className="text-right flex-1 md:flex-none">
                    <p className="text-[10px] font-bold text-donana-secondary uppercase tracking-widest">Valor Recebido</p>
                    <p className="text-2xl font-bold text-donana-dark">R$ {pedido.total.toFixed(2)}</p>
                  </div>
                  
                  {pedido.status === OrderStatus.SCHEDULED ? (
                    <button 
                      onClick={() => handleConfirm(pedido.id)}
                      className="bg-donana-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-donana-dark transition-all shadow-lg transform hover:-translate-y-1"
                    >
                      Confirmar Entrega
                    </button>
                  ) : (
                    <div className="flex items-center text-donana-secondary gap-2 font-bold bg-donana-bg px-5 py-3 rounded-2xl border border-donana-soft">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Finalizado
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
