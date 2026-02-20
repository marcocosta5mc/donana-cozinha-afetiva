
import React, { useState } from 'react';
import { store } from '../store';
import { DBState, Pedido, OrderStatus } from '../types';
import { PIX_KEY } from '../constants';

const OrderCard: React.FC<{ pedido: Pedido; onSelect: (p: Pedido) => void }> = ({ pedido, onSelect }) => (
  <div className="bg-white border border-donana-soft p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-[10px] text-donana-secondary font-bold uppercase tracking-widest">Pedido #{pedido.id.toUpperCase()}</p>
        <p className="text-sm font-bold text-donana-text">{new Date(pedido.data_criacao).toLocaleDateString('pt-BR')}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${pedido.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-700' : 'bg-donana-primary/10 text-donana-primary'}`}>
        {pedido.status}
      </span>
    </div>
    <div className="flex justify-between items-end">
      <div>
        <p className="text-[10px] text-donana-secondary uppercase font-bold">Entrega para:</p>
        <p className="font-bold text-donana-dark">{new Date(pedido.data_entrega).toLocaleDateString('pt-BR')}</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-donana-text">R$ {pedido.total.toFixed(2)}</p>
        <button 
          onClick={() => onSelect(pedido)}
          className="text-xs font-bold text-donana-primary group-hover:text-donana-dark underline transition-colors"
        >
          Ver Detalhes
        </button>
      </div>
    </div>
  </div>
);

const ClientHome: React.FC<{ db: DBState; refresh: () => void }> = ({ db, refresh }) => {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [lastOrder, setLastOrder] = useState<Pedido | null>(null);
  const [activeTab, setActiveTab] = useState<'aberto' | 'historico'>('aberto');
  const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null);
  const [historyLimit, setHistoryLimit] = useState(3);

  const updateCart = (pratoId: string, delta: number) => {
    setCart(prev => {
      const current = prev[pratoId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [pratoId]: next };
    });
  };

  const totalQty = (Object.values(cart) as number[]).reduce((a, b) => a + b, 0);
  const totalPrice = (Object.entries(cart) as [string, number][]).reduce((acc, [id, qty]) => {
    const prato = db.pratos.find(p => p.id === id);
    return acc + (prato?.preco || 0) * qty;
  }, 0);

  const handleSubmit = () => {
    if (totalQty === 0) return;
    const items = (Object.entries(cart) as [string, number][])
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ prato_id: id, quantidade: qty }));
    
    const pedido = store.addOrder(items);
    setLastOrder(pedido);
    setCart({});
    refresh();
  };

  const myOrders = db.pedidos.filter(p => p.cliente_id === db.currentUser?.id);
  const openOrders = myOrders.filter(p => p.status === OrderStatus.SCHEDULED);
  const historyOrders = myOrders.filter(p => p.status === OrderStatus.DELIVERED);
  const displayedHistory = historyOrders.slice(0, historyLimit);

  if (lastOrder) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-donana-soft relative overflow-hidden">
          {/* Logo como selo de qualidade no sucesso */}
          <img src="brand/logo.png" alt="D’Onana" className="h-28 mx-auto mb-6 animate-bounce" />
          
          <h2 className="text-4xl font-bold text-donana-dark mb-2 font-serif">Pedido Confirmado!</h2>
          <p className="text-donana-secondary font-medium mb-8 italic">Sua refeição está sendo preparada com afeto.</p>
          
          <div className="bg-donana-bg p-8 rounded-[2rem] mb-8 text-left space-y-4 border border-donana-soft">
            <div>
              <p className="text-[10px] text-donana-secondary uppercase font-bold tracking-widest">Previsão de Entrega</p>
              <p className="text-2xl font-bold text-donana-dark">{new Date(lastOrder.data_entrega).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="pt-4 border-t border-donana-soft flex justify-between items-center">
              <span className="font-bold text-donana-text">Total do Pedido</span>
              <span className="text-xl font-bold text-donana-primary">R$ {lastOrder.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-donana-dark text-white p-8 rounded-[2rem] mb-8 relative overflow-hidden">
            <p className="font-bold mb-3 uppercase text-[10px] tracking-[0.2em] opacity-80">Chave PIX (Copia e Cola)</p>
            <div className="bg-white/10 p-4 rounded-xl text-sm break-all font-mono mb-4 border border-white/20">
              {PIX_KEY}
            </div>
            <p className="text-[10px] opacity-70 italic">Envie o comprovante pelo WhatsApp após o pagamento.</p>
          </div>

          <button 
            onClick={() => setLastOrder(null)}
            className="text-donana-primary font-black uppercase text-xs tracking-widest hover:text-donana-dark transition-all"
          >
            ← Voltar ao Cardápio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-20">
      <section>
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-donana-dark mb-4">Cardápio da Semana</h1>
          <p className="text-lg text-donana-secondary max-w-2xl mx-auto italic font-medium">Comida caseira, saudável e feita com o tempero que você conhece.</p>
          <div className="mt-8 inline-flex items-center gap-3 bg-donana-primary/10 text-donana-primary px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border border-donana-primary/20">
            <span className="w-2 h-2 bg-donana-primary rounded-full animate-pulse"></span>
            Limite Diário: 30 Marmitas
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {db.pratos.filter(p => p.ativo).map(prato => (
            <div key={prato.id} className="card-donana group">
              <div className="h-56 relative overflow-hidden">
                <img src={prato.foto} alt={prato.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl font-bold text-donana-dark shadow-xl">
                  R$ {prato.preco.toFixed(2)}
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-donana-dark mb-3 leading-tight">{prato.nome}</h3>
                <p className="text-donana-text/70 text-sm mb-8 leading-relaxed line-clamp-2">{prato.descricao}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-donana-bg rounded-2xl p-1.5 border border-donana-soft">
                    <button onClick={() => updateCart(prato.id, -1)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white text-donana-primary font-bold transition-all shadow-sm">−</button>
                    <span className="w-12 text-center font-bold text-xl text-donana-dark">{cart[prato.id] || 0}</span>
                    <button onClick={() => updateCart(prato.id, 1)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white text-donana-primary font-bold transition-all shadow-sm">+</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/60 -mx-6 px-6 py-20 rounded-[4rem] shadow-inner border-y border-donana-soft">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-bold text-donana-dark mb-2">Meus Pedidos</h2>
              <p className="text-donana-secondary font-medium italic">Acompanhe suas refeições agendadas.</p>
            </div>
            <div className="flex bg-donana-bg p-1.5 rounded-2xl border border-donana-soft">
              <button 
                onClick={() => setActiveTab('aberto')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === 'aberto' ? 'bg-donana-primary text-white shadow-lg' : 'text-donana-secondary hover:text-donana-dark'}`}
              >
                Ativos ({openOrders.length})
              </button>
              <button 
                onClick={() => setActiveTab('historico')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === 'historico' ? 'bg-donana-primary text-white shadow-lg' : 'text-donana-secondary hover:text-donana-dark'}`}
              >
                Entregues
              </button>
            </div>
          </div>

          {activeTab === 'aberto' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {openOrders.length > 0 ? (
                openOrders.map(p => <OrderCard key={p.id} pedido={p} onSelect={setSelectedOrder} />)
              ) : (
                <div className="col-span-full py-16 text-center bg-donana-bg/30 rounded-[2.5rem] border-2 border-dashed border-donana-soft">
                  <p className="text-donana-secondary font-medium">Você não tem pedidos em aberto.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {historyOrders.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayedHistory.map(p => <OrderCard key={p.id} pedido={p} onSelect={setSelectedOrder} />)}
                  </div>
                  {historyLimit < historyOrders.length && (
                    <div className="text-center mt-12">
                      <button 
                        onClick={() => setHistoryLimit(prev => prev + 3)}
                        className="px-8 py-3 border-2 border-donana-primary text-donana-primary rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-donana-primary hover:text-white transition-all shadow-sm"
                      >
                        Carregar Mais Histórico
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-16 text-center bg-donana-bg/30 rounded-[2.5rem] border-2 border-dashed border-donana-soft">
                  <p className="text-donana-secondary font-medium">Nenhum histórico encontrado.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modal Detalhes */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-donana-dark/90 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
          <div className="bg-donana-bg rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
            <div className="bg-donana-dark p-10 text-white relative">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-bold font-serif">Detalhes do Pedido</h3>
                  <p className="opacity-60 font-mono text-[10px] mt-1 uppercase tracking-widest">Protocolo: {selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-donana-soft">
                  <p className="text-[10px] uppercase font-black text-donana-secondary mb-1 tracking-widest opacity-60">Pedido em</p>
                  <p className="font-bold text-donana-text">{new Date(selectedOrder.data_criacao).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="bg-donana-primary/10 p-5 rounded-3xl border border-donana-primary/20">
                  <p className="text-[10px] uppercase font-black text-donana-primary mb-1 tracking-widest opacity-60">Entrega prevista</p>
                  <p className="font-bold text-donana-dark">{new Date(selectedOrder.data_entrega).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-donana-secondary uppercase mb-4 px-2 tracking-[0.2em]">Sua Refeição</p>
                <div className="space-y-3">
                  {selectedOrder.itens.map((item, idx) => {
                    const prato = db.pratos.find(p => p.id === item.prato_id);
                    return (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white border border-donana-soft rounded-2xl">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-donana-bg flex items-center justify-center rounded-xl text-xs font-black text-donana-dark border border-donana-soft">
                            {item.quantidade}x
                          </span>
                          <span className="font-bold text-donana-text">{prato?.nome}</span>
                        </div>
                        <span className="text-sm font-bold text-donana-secondary">R$ {((prato?.preco || 0) * item.quantidade).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-8 border-t border-donana-soft flex justify-between items-center">
                <p className="text-xl font-bold text-donana-dark">Valor Total</p>
                <p className="text-4xl font-bold text-donana-primary font-serif">R$ {selectedOrder.total.toFixed(2)}</p>
              </div>

              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-donana-primary text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-donana-dark transition-all transform hover:-translate-y-1"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carrinho Flutuante */}
      {totalQty > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-2xl bg-donana-dark text-white p-8 rounded-[2.5rem] shadow-2xl flex items-center justify-between z-50 animate-in slide-in-from-bottom-10 border border-white/10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{totalQty} marmitas no carrinho</p>
            <p className="text-3xl font-bold">Total: R$ {totalPrice.toFixed(2)}</p>
          </div>
          <button 
            onClick={handleSubmit}
            className="bg-donana-primary hover:bg-white hover:text-donana-dark px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl transform hover:-translate-y-1 active:scale-95"
          >
            Fechar Pedido
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientHome;
