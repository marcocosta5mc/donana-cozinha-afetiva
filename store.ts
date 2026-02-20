
import { DBState, Pedido, Insumo, Prato, ReceitaItem, OrderStatus, ShoppingListItem } from './types';
import { INITIAL_INSUMOS, INITIAL_PRATOS, INITIAL_RECEITAS, MAX_DAILY_CAPACITY } from './constants';

const STORAGE_KEY = 'donana_db_state';

const getInitialState = (): DBState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return {
    insumos: INITIAL_INSUMOS,
    pratos: INITIAL_PRATOS,
    receitas: INITIAL_RECEITAS,
    pedidos: [],
    currentUser: null,
  };
};

export class Store {
  private state: DBState = getInitialState();

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  getState() {
    return this.state;
  }

  login(role: 'admin' | 'cliente') {
    this.state.currentUser = {
      id: role === 'admin' ? 'admin-1' : 'user-123',
      nome: role === 'admin' ? 'Dona Ana' : 'João Silva',
      role,
    };
    this.save();
  }

  logout() {
    this.state.currentUser = null;
    this.save();
  }

  addOrder(itens: { prato_id: string; quantidade: number }[]) {
    const totalMarmitas = itens.reduce((acc, i) => acc + i.quantidade, 0);
    const deliveryDate = this.calculateNextAvailableDate(totalMarmitas);
    
    const pedido: Pedido = {
      id: Math.random().toString(36).substr(2, 9),
      cliente_id: this.state.currentUser?.id || 'anon',
      cliente_nome: this.state.currentUser?.nome || 'Cliente',
      data_criacao: new Date().toISOString(),
      data_entrega: deliveryDate.toISOString(),
      status: OrderStatus.SCHEDULED,
      total: itens.reduce((acc, item) => {
        const prato = this.state.pratos.find(p => p.id === item.prato_id);
        return acc + (prato?.preco || 0) * item.quantidade;
      }, 0),
      pago: false,
      itens,
    };

    this.state.pedidos.push(pedido);
    this.save();
    return pedido;
  }

  calculateNextAvailableDate(qtyNeeded: number): Date {
    const now = new Date();
    // Pedidos feitos hoje tentam ir para amanhã
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);

    while (true) {
      const dateString = date.toISOString().split('T')[0];
      const existingQty = this.state.pedidos
        .filter(p => p.data_entrega.startsWith(dateString) && p.status !== OrderStatus.CANCELLED)
        .reduce((acc, p) => acc + p.itens.reduce((sum, i) => sum + i.quantidade, 0), 0);

      if (existingQty + qtyNeeded <= MAX_DAILY_CAPACITY) {
        return date;
      }
      date.setDate(date.getDate() + 1);
    }
  }

  confirmDelivery(orderId: string) {
    const pedido = this.state.pedidos.find(p => p.id === orderId);
    if (!pedido || pedido.status === OrderStatus.DELIVERED) return;

    // Baixar estoque
    pedido.itens.forEach(item => {
      const receita = this.state.receitas.filter(r => r.prato_id === item.prato_id);
      receita.forEach(ingrediente => {
        const insumo = this.state.insumos.find(i => i.id === ingrediente.insumo_id);
        if (insumo) {
          // A receita está em gramas, se o insumo for kg, divide por 1000
          const reduction = (ingrediente.quantidade_por_marmita * item.quantidade) / (insumo.unidade === 'kg' ? 1000 : 1);
          insumo.quantidade_atual -= reduction;
        }
      });
    });

    pedido.status = OrderStatus.DELIVERED;
    pedido.pago = true;
    this.save();
  }

  updateStockFromOCR(items: { nome: string; quantidade: number; preco_unitario: number }[]) {
    items.forEach(item => {
      // Procura insumo similar
      const insumo = this.state.insumos.find(i => i.nome.toLowerCase().includes(item.nome.toLowerCase()));
      if (insumo) {
        insumo.quantidade_atual += item.quantidade;
        insumo.custo_unitario = item.preco_unitario;
      } else {
        // Se não existir, poderíamos criar, mas por segurança apenas logamos
        console.log("Insumo não encontrado para atualizar:", item.nome);
      }
    });
    this.save();
  }

  generateShoppingList(forDate: string): ShoppingListItem[] {
    const tomorrowPedidos = this.state.pedidos.filter(p => p.data_entrega.startsWith(forDate) && p.status === OrderStatus.SCHEDULED);
    
    const needs: Record<string, number> = {};
    tomorrowPedidos.forEach(pedido => {
      pedido.itens.forEach(item => {
        const r = this.state.receitas.filter(rec => rec.prato_id === item.prato_id);
        r.forEach(ing => {
          needs[ing.insumo_id] = (needs[ing.insumo_id] || 0) + (ing.quantidade_por_marmita * item.quantidade);
        });
      });
    });

    return this.state.insumos.map(insumo => {
      const totalRequiredGrams = needs[insumo.id] || 0;
      const totalRequired = insumo.unidade === 'kg' ? totalRequiredGrams / 1000 : totalRequiredGrams;
      const missing = Math.max(0, totalRequired - insumo.quantidade_atual);
      
      return {
        insumo_id: insumo.id,
        nome: insumo.nome,
        quantidade_necessaria: totalRequired,
        quantidade_estoque: insumo.quantidade_atual,
        quantidade_comprar: missing,
        unidade: insumo.unidade,
      };
    }).filter(item => item.quantidade_necessaria > 0);
  }

  addInsumo(data: Omit<Insumo, 'id'>) {
    const newInsumo = { ...data, id: Math.random().toString(36).substr(2, 9) };
    this.state.insumos.push(newInsumo);
    this.save();
  }

  addPrato(prato: Omit<Prato, 'id'>, receita: { insumo_id: string; quantidade: number }[]) {
    const id = Math.random().toString(36).substr(2, 9);
    this.state.pratos.push({ ...prato, id });
    receita.forEach(r => {
      this.state.receitas.push({
        prato_id: id,
        insumo_id: r.insumo_id,
        quantidade_por_marmita: r.quantidade,
      });
    });
    this.save();
  }
}

export const store = new Store();
