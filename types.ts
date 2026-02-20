
export enum OrderStatus {
  SCHEDULED = 'Agendado',
  DELIVERED = 'Entregue',
  CANCELLED = 'Cancelado'
}

export interface Insumo {
  id: string;
  nome: string;
  unidade: 'kg' | 'g' | 'unidade';
  quantidade_atual: number;
  custo_unitario: number;
}

export interface Prato {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  foto: string;
  ativo: boolean;
}

export interface ReceitaItem {
  prato_id: string;
  insumo_id: string;
  quantidade_por_marmita: number; // sempre em gramas ou unidades
}

export interface OrderItem {
  prato_id: string;
  quantidade: number;
}

export interface Pedido {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  data_criacao: string;
  data_entrega: string;
  status: OrderStatus;
  total: number;
  pago: boolean;
  itens: OrderItem[];
}

export interface ShoppingListItem {
  insumo_id: string;
  nome: string;
  quantidade_necessaria: number;
  quantidade_estoque: number;
  quantidade_comprar: number;
  unidade: string;
}

export interface DBState {
  insumos: Insumo[];
  pratos: Prato[];
  receitas: ReceitaItem[];
  pedidos: Pedido[];
  currentUser: { id: string; nome: string; role: 'admin' | 'cliente' } | null;
}
