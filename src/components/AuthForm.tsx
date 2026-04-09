/**
 * Auth Form - Login / Sign Up Component
 */
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthForm: React.FC = () => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          // 登録成功 → 自動ログイン試行
          const { error: loginError } = await signIn(email, password);
          if (loginError) {
            // 確認メールが必要な場合
            setMessage('アカウントを作成しました。確認メールが届かない場合は、Supabaseダッシュボードで「Confirm email」を無効にしてください。');
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[800px] h-[800px] bg-[#00BFA5] opacity-[0.04] blur-[150px] rounded-full animate-float"></div>
        <div className="absolute bottom-[-30%] right-[-20%] w-[700px] h-[700px] bg-[#00d4ff] opacity-[0.04] blur-[150px] rounded-full"></div>
        <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#78909C] opacity-[0.02] blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00BFA5] to-[#78909C] flex items-center justify-center text-4xl font-black mx-auto mb-5 shadow-2xl shadow-teal-500/30 animate-float">
            着
          </div>
          <h1 className="text-3xl font-extrabold text-[#333333] tracking-tight">着てみるAI</h1>
          <p className="text-sm text-[#78909C] mt-2 tracking-[0.15em] uppercase">AI Virtual Try-On</p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-3xl p-8 border border-[#E0E0E0] shadow-2xl">
          <h2 className="text-[#333333] font-bold text-xl mb-8 text-center">
            {isLogin ? 'ログイン' : 'アカウント作成'}
          </h2>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Googleでログイン
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-xs text-[#78909C] font-medium">または</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-[#78909C] mb-2 block uppercase tracking-wider">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl px-4 py-3.5 text-sm text-[#333333] placeholder-[#444] focus:outline-none focus:border-[#00BFA5]/50 focus:bg-[#FAFAFA] focus:shadow-lg focus:shadow-teal-500/10 transition-all duration-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#78909C] mb-2 block uppercase tracking-wider">
                  パスワード
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8文字以上"
                  required
                  minLength={8}
                  className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl px-4 py-3.5 text-sm text-[#333333] placeholder-[#444] focus:outline-none focus:border-[#00BFA5]/50 focus:bg-[#FAFAFA] focus:shadow-lg focus:shadow-teal-500/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in">
                {error}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="mt-5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs animate-in">
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00BFA5] via-[#78909C] to-[#00BFA5] text-[#333333] shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 animate-gradient"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  処理中...
                </span>
              ) : isLogin ? (
                'ログイン'
              ) : (
                'アカウント作成'
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-[#78909C] mt-8">
            {isLogin ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              className="text-[#00BFA5] font-semibold hover:text-[#c4b5fd] transition-colors duration-300 ml-1"
            >
              {isLogin ? '新規登録' : 'ログイン'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[#444] mt-8 tracking-wider">
          Powered by Supabase Auth
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
