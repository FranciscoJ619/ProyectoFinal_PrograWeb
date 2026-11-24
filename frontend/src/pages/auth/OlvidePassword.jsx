import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, MailCheck } from 'lucide-react';
import AuthShell from './AuthShell';
import { Button, Input } from '../../components/ui';
import useForm from '../../hooks/useForm';
import { v } from '../../utils/validators';
import { authApi } from '../../api/services';
import { erroresCampo, mensajeError } from '../../api/client';

export default function OlvidePassword() {
  const form = useForm({ email: '' }, { email: [v.requerido('El correo es obligatorio'), v.email()] });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(null);
  const [error, setError] = useState(null);

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.validar()) return;
    setEnviando(true);
    try {
      const r = await authApi.olvide({ email: form.valores.email.trim() });
      setEnviado(r.mensaje);
    } catch (err) {
      form.setErroresServidor(erroresCampo(err));
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthShell>
      <div className="kicker"><KeyRound size={18} /> Recuperar acceso</div>
      <h1>¿Olvidaste tu contraseña?</h1>
      <p className="muted" style={{ fontSize: 16 }}>Te enviaremos un enlace a tu correo para crear una nueva.</p>
      {enviado ? (
        <div className="alert alert-success mt-24">
          <MailCheck size={20} />
          <span>{enviado}. Revisa tu bandeja de entrada y la carpeta de spam.</span>
        </div>
      ) : (
        <form className="stack mt-24" onSubmit={enviar} noValidate>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <Input label="Correo electrónico" name="email" type="email" icon={Mail} value={form.valores.email} onChange={form.onChange} error={form.errores.email} />
          <Button type="submit" loading={enviando} block>Enviar enlace</Button>
        </form>
      )}
      <p className="muted mt-24" style={{ textAlign: 'center' }}>
        <Link to="/login">Volver a iniciar sesión</Link>
      </p>
    </AuthShell>
  );
}
