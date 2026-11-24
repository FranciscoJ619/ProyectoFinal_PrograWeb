import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LogIn, Mail } from 'lucide-react';
import AuthShell from './AuthShell';
import { Button, Input, PasswordInput } from '../../components/ui';
import useForm from '../../hooks/useForm';
import { v } from '../../utils/validators';
import { authApi } from '../../api/services';
import { erroresCampo, mensajeError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const reglas = {
  email: [v.requerido('El correo es obligatorio'), v.email()],
  password: [v.requerido('La contraseña es obligatoria')],
};

export default function Login() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm({ email: '', password: '', recordar: true }, reglas);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.validar()) return;
    setEnviando(true);
    try {
      const r = await authApi.login({ email: form.valores.email.trim(), password: form.valores.password });
      iniciarSesion(r, form.valores.recordar);
      navigate(location.state?.desde || '/', { replace: true });
    } catch (err) {
      form.setErroresServidor(erroresCampo(err));
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthShell>
      <div className="kicker"><LogIn size={18} /> Tu siguiente partida empieza aquí</div>
      <h1>Bienvenido de nuevo</h1>
      <p className="muted" style={{ fontSize: 16 }}>Inicia sesión y continúa jugando</p>

      {location.state?.mensaje && <div className="alert alert-success mt-16">{location.state.mensaje}</div>}
      {error && <div className="alert alert-error mt-16" role="alert">{error}</div>}

      <form className="stack mt-24" onSubmit={enviar} noValidate>
        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          icon={Mail}
          placeholder="tu.correo@ejemplo.com"
          value={form.valores.email}
          onChange={form.onChange}
          error={form.errores.email}
        />
        <PasswordInput
          label="Contraseña"
          name="password"
          autoComplete="current-password"
          value={form.valores.password}
          onChange={form.onChange}
          error={form.errores.password}
          help="Usa la contraseña de tu cuenta Replay Club."
        />
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <label className="checkbox">
            <input type="checkbox" name="recordar" checked={form.valores.recordar} onChange={form.onChange} />
            Recordarme
          </label>
          <Link to="/olvide-password">¿Olvidaste tu contraseña?</Link>
        </div>
        <Button type="submit" icon={ArrowRight} loading={enviando} block>
          Iniciar sesión
        </Button>
      </form>
      <p className="muted mt-24" style={{ textAlign: 'center', fontSize: 15 }}>
        ¿No tienes cuenta? <Link to="/registro"><strong>Regístrate</strong></Link>
      </p>
    </AuthShell>
  );
}
