package com.replayclub.api.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.nio.charset.StandardCharsets;

/**
 * Envía correos HTML mediante JavaMailSender. En producción apunta al Postfix
 * instalado en el VPS (spring.mail.host=localhost, puerto 25) con SPF y DKIM.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final boolean habilitado;
    private final String remitente;
    private final String frontendUrl;

    public EmailService(ObjectProvider<JavaMailSender> mailSender,
                        @Value("${app.mail.enabled:false}") boolean habilitado,
                        @Value("${app.mail.from:no-reply@localhost}") String remitente,
                        @Value("${app.frontend-url}") String frontendUrl) {
        this.mailSender = mailSender;
        this.habilitado = habilitado;
        this.remitente = remitente;
        this.frontendUrl = frontendUrl;
    }

    /**
     * @param ruta ruta del frontend para el botón (ej. "/prestamos"); null si no lleva botón
     */
    @Async
    public void enviar(String para, String asunto, String titulo, String mensaje, String textoBoton, String ruta) {
        if (!habilitado) {
            log.info("[correo deshabilitado] Para: {} | Asunto: {} | {}", para, asunto, mensaje);
            return;
        }
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            log.warn("No hay JavaMailSender configurado; no se envió el correo a {}", para);
            return;
        }
        try {
            MimeMessage mime = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, false, StandardCharsets.UTF_8.name());
            helper.setFrom(remitente);
            helper.setTo(para);
            helper.setSubject(asunto);
            helper.setText(plantilla(titulo, mensaje, textoBoton, ruta == null ? null : frontendUrl + ruta), true);
            sender.send(mime);
            log.info("Correo enviado a {}: {}", para, asunto);
        } catch (Exception e) {
            log.error("No se pudo enviar el correo a {}: {}", para, e.getMessage());
        }
    }

    private String plantilla(String titulo, String mensaje, String textoBoton, String url) {
        String boton = url == null ? "" : """
                <p style="margin:28px 0 8px"><a href="%s" style="background:#F5C542;color:#101827;padding:12px 24px;
                border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">%s</a></p>
                """.formatted(url, HtmlUtils.htmlEscape(textoBoton));
        return """
                <div style="background:#F5F7FA;padding:32px 16px;font-family:Inter,Arial,sans-serif">
                  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;
                              border:1px solid #E2E8F0">
                    <div style="background:#101827;padding:20px 28px;color:#ffffff;font-size:20px;font-weight:700">
                      <span style="background:#F5C542;color:#101827;border-radius:8px;padding:2px 8px;margin-right:8px">&#9654;</span>
                      Replay Club
                    </div>
                    <div style="padding:28px;color:#111827">
                      <h2 style="margin:0 0 12px;font-size:22px">%s</h2>
                      <p style="margin:0;color:#64748B;font-size:15px;line-height:1.6">%s</p>
                      %s
                    </div>
                    <div style="padding:16px 28px;background:#F5F7FA;color:#64748B;font-size:12px">
                      Tus juegos merecen una segunda partida. Este es un mensaje automático, no respondas a este correo.
                    </div>
                  </div>
                </div>
                """.formatted(HtmlUtils.htmlEscape(titulo), HtmlUtils.htmlEscape(mensaje), boton);
    }
}
