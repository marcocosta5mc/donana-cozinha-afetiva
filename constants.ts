
import { Insumo, Prato, ReceitaItem } from './types';

export const MAX_DAILY_CAPACITY = 30;
export const PIX_KEY = "00.000.000/0001-00"; // Exemplo de CNPJ da D'Onana
export const APP_NAME = "D’Onana Cozinha Afetiva";

// Added explicit types to avoid inference of 'unidade' as string
export const INITIAL_INSUMOS: Insumo[] = [
  { id: '1', nome: 'Arroz Integral', unidade: 'kg', quantidade_atual: 10, custo_unitario: 8.5 },
  { id: '2', nome: 'Feijão Carioca', unidade: 'kg', quantidade_atual: 5, custo_unitario: 9.0 },
  { id: '3', nome: 'Peito de Frango', unidade: 'kg', quantidade_atual: 3, custo_unitario: 22.0 },
  { id: '4', nome: 'Patinho Moído', unidade: 'kg', quantidade_atual: 4, custo_unitario: 45.0 },
  { id: '5', nome: 'Batata Doce', unidade: 'kg', quantidade_atual: 8, custo_unitario: 4.5 },
];

export const INITIAL_PRATOS: Prato[] = [
  { 
    id: 'p1', 
    nome: 'Frango com Batata Doce', 
    descricao: 'Peito de frango grelhado com ervas finas, arroz integral e batata doce rústica.', 
    preco: 25.0, 
    foto: 'https://picsum.photos/seed/frango/400/300',
    ativo: true 
  },
  { 
    id: 'p2', 
    nome: 'Escondidinho de Patinho', 
    descricao: 'Purê de batata doce cremoso recheado com patinho moído temperado.', 
    preco: 28.0, 
    foto: 'https://picsum.photos/seed/escondidinho/400/300',
    ativo: true 
  },
  { 
    id: 'p3', 
    nome: 'Bowl Fit Veggie', 
    descricao: 'Mix de legumes sazonais, arroz integral e feijão carioca com tempero caseiro.', 
    preco: 22.0, 
    foto: 'https://picsum.photos/seed/veggie/400/300',
    ativo: true 
  }
];

export const INITIAL_RECEITAS: ReceitaItem[] = [
  { prato_id: 'p1', insumo_id: '1', quantidade_por_marmita: 150 }, // 150g arroz
  { prato_id: 'p1', insumo_id: '3', quantidade_por_marmita: 150 }, // 150g frango
  { prato_id: 'p1', insumo_id: '5', quantidade_por_marmita: 100 }, // 100g batata
  { prato_id: 'p2', insumo_id: '4', quantidade_por_marmita: 200 }, // 200g carne
  { prato_id: 'p2', insumo_id: '5', quantidade_por_marmita: 250 }, // 250g batata (purê)
];
