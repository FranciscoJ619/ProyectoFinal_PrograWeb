import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import AuthShell from './AuthShell';
import { Button, PasswordInput } from '../../components/ui';
import useForm from '../../hooks/useForm';
import { v } from '../../utils/validators';
import { authApi } from '../../api/services';
import { erroresCampo, mensajeError } from '../../api/client';

const reglas = {
  password: [v.requerido('La contraseña es obligatoria'), v.password()],
  confirmar: [v.requerido('Confirma tu contraseña'), v.igualA('password', 'Las contraseñas no coinciden')],
};

export default function RestablecerPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const form = useForm({ password: '', confirmar: '' }, reglas);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(token ? null : 'El enlace no es válido. Solicita uno nuevo.');

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.validar()) return;
    setEnviando(true);
    try {
      const r = await authApi.restablecer({ token, password: form.valores.password });
      navigate('/login', { replace: true, state: { mensaje: r.mensaje } });
    } catch (err) {
      form.setErroresServidor(erroresCampo(err));
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthShell>
      <div className="kicker"><KeyRound size={18} /> Nueva contraseña</div>
      <h1>Crea tu nueva contraseña</h1>
      {error && <div className="alert alert-error mt-16" role="alert">{error}</div>}
      <form className="stack mt-24" onSubmit={enviar} noValidate>
        <PasswordInput label="Nueva contraseña" name="password" required mostrarReglas value={form.valores.password} onChange={form.onChange} error={form.errores.password} autoComplete="new-password" />
        <PasswordInput label="Confirmar contraseña" name="confirmar" required value={form.valores.confirmar} onChange={form.onChange} error={form.errores.confirmar} autoComplete="new-password" />
        <Button type="submit" loading={enviando} disabled={!token} block>Guardar contraseña</Button>
      </form>
      <p className="muted mt-24" style={{ textAlign: 'center' }}>
        <Link to="/olvide-password">Solicitar otro enlace</Link>
      </p>
    </AuthShell>
  );
}
