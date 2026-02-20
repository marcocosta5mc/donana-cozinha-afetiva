
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../store';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent, role: 'admin' | 'cliente') => {
    e.preventDefault();
    store.login(role);
    onLogin();
    navigate(role === 'admin' ? '/admin' : '/');
  };

  return (
    <div className="min-h-full flex items-center justify-center py-20 px-4 bg-donana-bg">
      <div className="max-w-md w-full space-y-10 bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-donana-soft relative overflow-hidden text-center">
        {/* Faixa decorativa no topo seguindo a cor principal da logo */}
        <div className="absolute top-0 left-0 w-full h-3 bg-donana-dark"></div>
        
        <div>
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-donana-primary/5 rounded-full blur-2xl transform scale-150"></div>
            <img 
              src="brand/logo.png" 
              alt="D’Onana Cozinha Afetiva" 
              className="relative h-44 md:h-52 mx-auto drop-shadow-2xl animate-in zoom-in duration-1000"
            />
          </div>
          <h2 className="text-donana-primary font-bold italic font-serif text-xl">Sabor que acolhe, comida que abraça.</h2>
          <p className="mt-2 text-donana-secondary text-xs font-black uppercase tracking-[0.2em] opacity-60">Seja bem-vindo(a) à nossa casa</p>
        </div>
        
        <form className="mt-10 space-y-6 text-left">
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-donana-dark uppercase tracking-[0.2em] mb-2 ml-2">Email de Acesso</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-7 py-4 bg-donana-bg/20 border-2 border-transparent focus:border-donana-primary rounded-3xl focus:outline-none transition-all font-medium text-donana-text placeholder-donana-dark/20"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-donana-dark uppercase tracking-[0.2em] mb-2 ml-2">Sua Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-7 py-4 bg-donana-bg/20 border-2 border-transparent focus:border-donana-primary rounded-3xl focus:outline-none transition-all font-medium text-donana-text placeholder-donana-dark/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <button
              onClick={(e) => handleLogin(e, 'cliente')}
              className="w-full py-5 px-8 rounded-3xl shadow-xl text-white bg-donana-primary hover:bg-donana-dark font-black uppercase tracking-widest text-xs transition-all transform hover:-translate-y-1 active:scale-95 shadow-donana-primary/20"
            >
              Entrar como Cliente
            </button>
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-donana-soft"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-5 text-donana-dark/30 font-black tracking-widest">Acesso Restrito</span></div>
            </div>
            <button
              onClick={(e) => handleLogin(e, 'admin')}
              className="w-full py-4 px-8 border-2 border-donana-primary/20 rounded-3xl text-donana-primary hover:bg-donana-primary hover:text-white font-black uppercase tracking-widest text-[10px] transition-all"
            >
              Painel Administrativo
            </button>
          </div>
        </form>
        
        <div className="pt-8 border-t border-donana-bg">
          <p className="text-[10px] text-donana-secondary font-black tracking-widest opacity-40">
            D'ONANA COZINHA AFETIVA &copy; 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
