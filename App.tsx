
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { store } from './store';
import { DBState } from './types';

// Views
import ClientHome from './views/ClientHome';
import AdminDashboard from './views/AdminDashboard';
import InventoryView from './views/InventoryView';
import RecipesView from './views/RecipesView';
import ShoppingListView from './views/ShoppingListView';
import Login from './views/Login';

const Navbar: React.FC<{ user: DBState['currentUser'], onLogout: () => void }> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <nav className="bg-donana-dark text-white shadow-2xl sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-24 flex items-center justify-between">
        <div className="flex items-center">
          <Link to={user.role === 'admin' ? '/admin' : '/'} className="flex items-center gap-4 group">
            <div className="relative">
              <img 
                src="brand/logo.png" 
                alt="D’Onana Cozinha Afetiva" 
                className="h-16 md:h-20 w-auto transition-transform duration-500 group-hover:scale-110 logo-shadow"
              />
            </div>
            <div className="hidden lg:flex flex-col border-l border-white/10 pl-5">
              <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">
                Sistema de Gestão
              </span>
              <span className="text-xs font-bold text-donana-bg opacity-80 italic font-serif">
                {user.role === 'admin' ? 'Painel de Controle' : 'Seu Cardápio Diário'}
              </span>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3 md:space-x-8">
          {user.role === 'admin' ? (
            <div className="hidden xl:flex items-center space-x-8 text-[11px] font-black uppercase tracking-[0.2em]">
              <Link to="/admin" className="hover:text-donana-bg transition-colors border-b-2 border-transparent hover:border-donana-bg pb-1">Entregas</Link>
              <Link to="/inventory" className="hover:text-donana-bg transition-colors border-b-2 border-transparent hover:border-donana-bg pb-1">Estoque</Link>
              <Link to="/recipes" className="hover:text-donana-bg transition-colors border-b-2 border-transparent hover:border-donana-bg pb-1">Cardápio</Link>
              <Link to="/shopping" className="hover:text-donana-bg transition-colors border-b-2 border-transparent hover:border-donana-bg pb-1">Lista de Compras</Link>
            </div>
          ) : (
            <div className="hidden sm:block text-right pr-4 border-r border-white/10">
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Olá,</p>
              <p className="text-sm font-bold text-donana-bg">{user.nome}</p>
            </div>
          )}
          
          <button 
            onClick={() => { onLogout(); navigate('/login'); }}
            className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-inner"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [db, setDb] = useState(store.getState());

  const refresh = () => setDb({ ...store.getState() });

  const handleLogout = () => {
    store.logout();
    refresh();
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-donana-bg">
        <Navbar user={db.currentUser} onLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<Login onLogin={refresh} />} />
            <Route 
              path="/" 
              element={db.currentUser?.role === 'cliente' ? <ClientHome db={db} refresh={refresh} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={db.currentUser?.role === 'admin' ? <AdminDashboard db={db} refresh={refresh} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/inventory" 
              element={db.currentUser?.role === 'admin' ? <InventoryView db={db} refresh={refresh} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/recipes" 
              element={db.currentUser?.role === 'admin' ? <RecipesView db={db} refresh={refresh} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/shopping" 
              element={db.currentUser?.role === 'admin' ? <ShoppingListView db={db} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
        
        <footer className="bg-donana-dark text-white/40 py-16 text-center border-t border-white/5">
          <div className="flex flex-col items-center gap-8">
             <img src="brand/logo.png" alt="D’Onana" className="h-28 opacity-20 hover:opacity-100 transition-opacity duration-1000" />
             <div className="max-w-xs h-px bg-white/10 w-full"></div>
             <div>
               <p className="font-serif italic text-2xl text-donana-bg opacity-60 mb-2">D’Onana Cozinha Afetiva</p>
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sabor que acolhe • Comida que abraça</p>
               <div className="mt-10 flex flex-col gap-1 text-[10px] font-bold tracking-widest uppercase opacity-30">
                 <p>&copy; 2024 - Sistema de Gestão Interno</p>
                 <p>Feito com amor para a melhor marmitaria da região.</p>
               </div>
          </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
