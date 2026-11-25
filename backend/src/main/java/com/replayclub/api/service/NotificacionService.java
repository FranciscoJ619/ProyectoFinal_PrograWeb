package com.replayclub.api.service;

import com.replayclub.api.domain.Notificacion;
import com.replayclub.api.domain.Solicitud;
import com.replayclub.api.domain.TipoSolicitud;
import com.replayclub.api.domain.Usuario;
import com.replayclub.api.dto.ComunDtos.ConteoNotificacionesDto;
import com.replayclub.api.dto.ComunDtos.NotificacionDto;
import com.replayclub.api.dto.ComunDtos.PageResponse;
import com.replayclub.api.dto.DtoMapper;
import com.replayclub.api.exception.AccesoDenegadoException;
import com.replayclub.api.exception.RecursoNoEncontradoException;
import com.replayclub.api.repository.NotificacionRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Centraliza los avisos del sistema: notificación interna (campana del navbar),
 * correo electrónico, SMS y WhatsApp, disparados por acciones reales.
 */
@Service
public class NotificacionService {

    private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("d 'de' MMMM", Locale.of("es", "MX"));

    private final NotificacionRepository repo;
    private final EmailService email;
    private final TwilioService twilio;

    public NotificacionService(NotificacionRepository repo, EmailService email, TwilioService twilio) {
        this.repo = repo;
        this.email = email;
        this.twilio = twilio;
    }

    // ------------------------------------------------------------------ consultas

    @Transactional(readOnly = true)
    public PageResponse<NotificacionDto> listar(Long usuarioId, Pageable pageable) {
        return PageResponse.of(repo.findByUsuarioId(usuarioId, pageable), DtoMapper::notificacion);
    }

    @Transactional(readOnly = true)
    public ConteoNotificacionesDto contarNoLeidas(Long usuarioId) {
        return new ConteoNotificacionesDto(repo.countByUsuarioIdAndLeidaFalse(usuarioId));
    }

    @Transactional
    public void marcarLeida(Long id, Long usuarioId) {
        Notificacion n = repo.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Notificación", id));
        if (!n.getUsuario().getId().equals(usuarioId)) {
            throw new AccesoDenegadoException("Esta notificación no es tuya");
        }
        n.setLeida(true);
    }

    @Transactional
    public void marcarTodasLeidas(Long usuarioId) {
        repo.marcarTodasLeidas(usuarioId);
    }

    // ------------------------------------------------------------------ eventos

    public void crear(Usuario usuario, String mensaje, String enlace) {
        Notificacion n = new Notificacion();
        n.setUsuario(usuario);
        n.setMensaje(mensaje.length() > 255 ? mensaje.substring(0, 252) + "..." : mensaje);
        n.setEnlace(enlace);
        repo.save(n);
    }

    public void bienvenida(Usuario u) {
        crear(u, "¡Bienvenido a Replay Club! Publica tu primer videojuego o explora el catálogo.", "/catalogo");
        email.enviar(u.getEmail(), "Bienvenido a Replay Club", "¡Hola, " + u.getNombre() + "!",
                "Tu cuenta quedó lista. Ya puedes rentar videojuegos físicos de otros jugadores o prestar los tuyos.",
                "Explorar catálogo", "/catalogo");
    }

    public void recuperacionPassword(Usuario u, String token) {
        email.enviar(u.getEmail(), "Recupera tu contraseña de Replay Club", "Restablece tu contraseña",
                "Recibimos una solicitud para cambiar tu contraseña. El enlace vence en 30 minutos. "
                        + "Si no fuiste tú, ignora este correo.",
                "Crear nueva contraseña", "/restablecer-password?token=" + token);
    }

    public void passwordActualizada(Usuario u) {
        email.enviar(u.getEmail(), "Tu contraseña fue actualizada", "Contraseña actualizada",
                "La contraseña de tu cuenta Replay Club se cambió correctamente. Si no fuiste tú, contáctanos.",
                "Iniciar sesión", "/login");
    }

    /** Nueva solicitud: el propietario recibe notificación, correo y WhatsApp. */
    public void solicitudCreada(Solicitud s) {
        Usuario dueno = s.getPropietario();
        String juego = s.getVideojuego().getTitulo();
        String accion = s.getTipo() == TipoSolicitud.PRESTAMO ? "que le prestes" : "comprar";
        String texto = s.getSolicitante().getNombre() + " quiere " + accion + " " + juego + ".";
        if (s.getTipo() == TipoSolicitud.PRESTAMO) {
            texto += " Del " + s.getFechaInicio().format(FECHA) + " al " + s.getFechaDevolucion().format(FECHA) + ".";
        }
        crear(dueno, texto, "/prestamos");
        email.enviar(dueno.getEmail(), "Nueva solicitud " + s.getFolio() + " - " + juego, "Tienes una nueva solicitud",
                texto + " Revísala y responde desde Mis préstamos.", "Ver solicitud", "/prestamos");
        twilio.enviarWhatsapp(dueno.getTelefono(), "Replay Club: " + texto + " Folio " + s.getFolio()
                + ". Responde desde la sección Mis préstamos.");
    }

    /** Solicitud aprobada: el solicitante recibe notificación, correo y SMS. */
    public void solicitudAprobada(Solicitud s) {
        Usuario sol = s.getSolicitante();
        String juego = s.getVideojuego().getTitulo();
        String texto = s.getPropietario().getNombre() + " aprobó tu solicitud de " + juego + " (" + s.getFolio() + ").";
        crear(sol, texto, "/prestamos");
        email.enviar(sol.getEmail(), "Solicitud aprobada - " + juego, "¡Tu solicitud fue aprobada!",
                texto + " Coordina la entrega en " + s.getVideojuego().getUbicacion() + ".", "Ver préstamo", "/prestamos");
        twilio.enviarSms(sol.getTelefono(),"Replay Club: " + texto + " Punto de entrega: "+ s.getVideojuego().getUbicacion(),
        "sms_order_confirmation");
    }

    public void solicitudRechazada(Solicitud s) {
        Usuario sol = s.getSolicitante();
        String texto = s.getPropietario().getNombre() + " rechazó tu solicitud de " + s.getVideojuego().getTitulo() + ".";
        crear(sol, texto, "/prestamos");
        email.enviar(sol.getEmail(), "Solicitud rechazada - " + s.getVideojuego().getTitulo(), "Solicitud rechazada",
                texto + (s.getRespuesta() != null ? " Mensaje: " + s.getRespuesta() : ""), "Explorar catálogo", "/catalogo");
    }

    public void solicitudCancelada(Solicitud s) {
        crear(s.getPropietario(), s.getSolicitante().getNombre() + " canceló su solicitud de "
                + s.getVideojuego().getTitulo() + ".", "/prestamos");
    }

    /** Préstamo entregado: inicia el préstamo y se avisa la fecha de devolución por correo y SMS. */
    public void prestamoEntregado(Solicitud s) {
        Usuario sol = s.getSolicitante();
        String texto = "Tu préstamo de " + s.getVideojuego().getTitulo() + " está en curso. Devuélvelo el "
                + s.getFechaDevolucion().format(FECHA) + ".";
        crear(sol, texto, "/prestamos");
        email.enviar(sol.getEmail(), "Préstamo en curso - " + s.getVideojuego().getTitulo(), "¡A jugar!",
                texto + " Coordina la devolución con " + s.getPropietario().getNombre() + ".", "Ver préstamo", "/prestamos");
        twilio.enviarSms(sol.getTelefono(),"Replay Club: " + texto,"sms_delivery_updates");
    }

    public void transaccionFinalizada(Solicitud s) {
        String juego = s.getVideojuego().getTitulo();
        for (Usuario u : new Usuario[]{s.getSolicitante(), s.getPropietario()}) {
            crear(u, "La transacción " + s.getFolio() + " de " + juego + " finalizó. ¡Deja tu opinión!", "/comunidad");
            email.enviar(u.getEmail(), "Transacción finalizada - " + juego, "Transacción completada",
                    "La transacción " + s.getFolio() + " de " + juego + " se completó. Comparte tu experiencia en la comunidad.",
                    "Opinar en la comunidad", "/comunidad");
        }
    }

    /** "Contactar propietario/usuario": notificación + correo + WhatsApp al destinatario. */
    public void contacto(Usuario remitente, Usuario destinatario, String mensaje, String juego) {
        String sobre = juego != null ? " sobre " + juego : "";
        crear(destinatario, remitente.getNombre() + " te escribió" + sobre + ": " + mensaje, "/perfil/" + remitente.getId());
        email.enviar(destinatario.getEmail(), remitente.getNombre() + " te escribió en Replay Club",
                "Nuevo mensaje" + sobre, remitente.getNombre() + " dice: \"" + mensaje + "\". Puedes responderle a "
                        + remitente.getEmail() + ".", "Ver perfil", "/perfil/" + remitente.getId());
        twilio.enviarWhatsapp(destinatario.getTelefono(), "Replay Club - " + remitente.getNombre() + " te escribió"
                + sobre + ": " + mensaje);
    }
}
