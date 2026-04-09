import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import './App.css';
import { auth, firebaseReady } from './firebase/client';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(firebaseReady);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!auth) return;
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
      setPassword('');
    } catch (err) {
      setError(err.message ?? 'Não foi possível concluir.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    if (!auth) return;
    setBusy(true);
    try {
      await signOut(auth);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="App">
      <div className="brand-accent" aria-hidden="true" />
      <header className="brand-header">
        <img
          src={`${process.env.PUBLIC_URL}/logo-vyzin.png`}
          className="brand-logo"
          alt="Vyzin — condomínio conectado"
        />
        <p className="brand-tagline">Condomínio conectado</p>
      </header>
      <main className="brand-main">
        <p className="lead">
          Gestão do seu condomínio com simplicidade e automação.
        </p>

        {!firebaseReady && (
          <div className="auth-panel auth-panel--warn" role="status">
            <p>
              Firebase não configurado. Copie{' '}
              <code className="inline-code">.env.example</code> para{' '}
              <code className="inline-code">.env</code> e preencha as variáveis{' '}
              <code className="inline-code">REACT_APP_FIREBASE_*</code>.
            </p>
          </div>
        )}

        {firebaseReady && loading && (
          <p className="auth-loading">Carregando sessão…</p>
        )}

        {firebaseReady && !loading && user && (
          <div className="auth-panel">
            <p className="auth-user">
              Conectado como <strong>{user.email}</strong>
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSignOut}
              disabled={busy}
            >
              Sair
            </button>
          </div>
        )}

        {firebaseReady && !loading && !user && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                className={`auth-tab ${mode === 'login' ? 'is-active' : ''}`}
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
              >
                Entrar
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                className={`auth-tab ${mode === 'register' ? 'is-active' : ''}`}
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
              >
                Criar conta
              </button>
            </div>
            <label className="field">
              <span className="field-label">E-mail</span>
              <input
                className="field-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
              />
            </label>
            <label className="field">
              <span className="field-label">Senha</span>
              <input
                className="field-input"
                type="password"
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                required
                minLength={6}
              />
            </label>
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={busy}
            >
              {mode === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>
        )}

        <div className="demo-panel">
          <p>Exemplo de status (verde de sucesso)</p>
          <span className="pill pill-success">Reserva confirmada</span>
        </div>
      </main>
    </div>
  );
}

export default App;
