import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, UserPlus } from 'lucide-react';
import AuthShell from './AuthShell';
import { Button, Input, PasswordInput } from '../../components/ui';
import useForm from '../../hooks/useForm';
import { v } from '../../utils/validators';
import { authApi } from '../../api/services';
import { erroresCampo, mensajeError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const reglas = {
  nombre: [v.requerido('El nombre es obligatorio'), v.min(3, 'El nombre debe tener entre 3 y 100 caracteres'), v.max(100)],
  email: [v.requerido('El correo es obligatorio'), v.email()],
  telefono: [v.requerido('El teléfono es obligatorio para avisarte por SMS y WhatsApp'), v.telefono()],
  ciudad: [v.max(100)],
  password: [v.requerido('La contraseña es obligatoria'), v.password()],
  confirmar: [v.requerido('Confirma tu contraseña'), v.igualA('password', 'Las contraseñas no coinciden')],
  terminos: [(x) => (!x ? 'Debes aceptar las normas de la comunidad' : null)],
};

export default function Registro() {
  const { iniciarSesion } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const form = useForm({ nombre: '', email: '', telefono: '+52', ciudad: '', password: '', confirmar: '', terminos: false }, reglas);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.validar()) return;
    setEnviando(true);
    try {
      const { nombre, email, telefono, ciudad, password } = form.valores;
      const r = await authApi.registro({ nombre: nombre.trim(), email: email.trim(), telefono: telefono.trim(), ciudad, password });
      iniciarSesion(r, true);
      toast('¡Cuenta creada! Te enviamos un correo de bienvenida.');
      navigate('/', { replace: true });
    } catch (err) {
      form.setErroresServidor(erroresCampo(err));
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  const f = form.valores;
  return (
    <AuthShell>
      <div className="kicker"><UserPlus size={18} /> Únete al club</div>
      <h1>Crea tu cuenta</h1>
      <p className="muted" style={{ fontSize: 16 }}>Renta los juegos de otros y presta los tuyos.</p>
      {error && <div className="alert alert-error mt-16" role="alert">{error}</div>}

      <form className="stack mt-24" onSubmit={enviar} noValidate>
        <Input label="Nombre completo" name="nombre" required value={f.nombre} onChange={form.onChange} error={form.errores.nombre} autoComplete="name" />
        <Input label="Correo electrónico" name="email" type="email" required icon={Mail} value={f.email} onChange={form.onChange} error={form.errores.email} autoComplete="email" />
        <div className="form-grid">
          <Input label="Teléfono (WhatsApp)" name="telefono" required icon={Phone} value={f.telefono} onChange={form.onChange} error={form.errores.telefono} help="Formato internacional: +525512345678" autoComplete="tel" />
          <Input label="Ciudad" name="ciudad" value={f.ciudad} onChange={form.onChange} error={form.errores.ciudad} placeholder="Coyoacán, CDMX" />
        </div>
        <PasswordInput label="Contraseña" name="password" required mostrarReglas value={f.password} onChange={form.onChange} error={form.errores.password} autoComplete="new-password" />
        <PasswordInput label="Confirmar contraseña" name="confirmar" required value={f.confirmar} onChange={form.onChange} error={form.errores.confirmar} autoComplete="new-password" />
        <div className="field">
          <label className="checkbox">
            <input type="checkbox" name="terminos" checked={f.terminos} onChange={form.onChange} />
            Acepto cuidar los juegos que rente y respetar las normas de la comunidad
          </label>
          {form.errores.terminos && <span className="field-error">{form.errores.terminos}</span>}
        </div>
        <Button type="submit" loading={enviando} block>Crear cuenta</Button>
      </form>
      <p className="muted mt-24" style={{ textAlign: 'center', fontSize: 15 }}>
        ¿Ya tienes cuenta? <Link to="/login"><strong>Inicia sesión</strong></Link>
      </p>
    </AuthShell>
  );
}
