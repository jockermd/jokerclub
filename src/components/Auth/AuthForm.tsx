import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Previne múltiplos submits
    if (loading) return;
    
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          toast.error("As senhas não coincidem");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              user_name: formData.name.toLowerCase().replace(/\s/g, ''),
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Verifique seu e-mail para o link de confirmação!");
          navigate('/');
        }
      } else { // login
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          // Se for rate limit, exibe mensagem específica
          if (error.message.includes('rate limit') || error.message.includes('429')) {
            toast.error("Muitas tentativas. Aguarde alguns segundos e tente novamente.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Login bem-sucedido!");
          navigate('/');
        }
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Erro ao processar sua solicitação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        {mode === 'login' ? 'Entrar no Jokerclub' : 'Crie sua conta Jokerclub'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1">
              Nome
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:border-mart-primary transition-colors"
              placeholder="Seu nome"
              required
              disabled={loading}
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:border-mart-primary transition-colors"
            placeholder="seu.email@exemplo.com"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1">
            Senha
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:border-mart-primary transition-colors"
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>

        {mode === 'signup' && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-1">
              Confirmar Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:border-mart-primary transition-colors"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
        )}

        <Button type="submit" fullWidth className="mt-6" disabled={loading}>
          {loading ? 'Processando...' : (mode === 'login' ? 'Entrar' : 'Inscrever-se')}
        </Button>
      </form>

      <div className="mt-6 text-center text-white/60">
        {mode === 'login' ? (
          <>
            Não tem uma conta?{' '}
            <Link to="/signup" className="text-mart-primary hover:underline">
              Inscreva-se
            </Link>
          </>
        ) : (
          <>
            Já tem uma conta?{' '}
            <Link to="/login" className="text-mart-primary hover:underline">
              Entrar
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
