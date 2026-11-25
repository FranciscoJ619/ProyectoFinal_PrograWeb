
package com.replayclub.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Service
public class TwilioService {

    private static final Logger log = LoggerFactory.getLogger(TwilioService.class);

    private final RestClient restClient;
    private final boolean smsHabilitado;
    private final boolean whatsappHabilitado;
    private final boolean smsModoPrueba;
    private final String accountSid;
    private final String authToken;
    private final String smsFrom;
    private final String whatsappFrom;

    public TwilioService(
            @Value("${app.twilio.sms.enabled:false}") boolean smsHabilitado,
            @Value("${app.twilio.whatsapp.enabled:false}") boolean whatsappHabilitado,
            @Value("${app.twilio.sms-trial-mode:true}") boolean smsModoPrueba,
            @Value("${app.twilio.account-sid:}") String accountSid,
            @Value("${app.twilio.auth-token:}") String authToken,
            @Value("${app.twilio.sms-from:}") String smsFrom,
            @Value("${app.twilio.whatsapp-from:}") String whatsappFrom) {

        this.restClient = RestClient.builder()
                .baseUrl("https://api.twilio.com/2010-04-01")
                .build();

        this.smsHabilitado = smsHabilitado;
        this.whatsappHabilitado = whatsappHabilitado;
        this.smsModoPrueba = smsModoPrueba;
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.smsFrom = smsFrom;
        this.whatsappFrom = whatsappFrom;
    }

    @Async
    public void enviarSms(String telefono, String mensaje, String plantillaPrueba) {
        String contenido = smsModoPrueba ? plantillaPrueba : mensaje;

        enviar(
            smsHabilitado,
            smsFrom,
            telefono,
            contenido,
            "SMS",
            true
        );
    }

    @Async
    public void enviarWhatsapp(String telefono, String mensaje) {
        if (telefono == null || telefono.isBlank()) {
            return;
        }

        enviar(
                whatsappHabilitado,
                whatsappFrom,
                "whatsapp:" + telefono,
                mensaje,
                "WhatsApp",
                true
        );
    }

    private void enviar(
            boolean habilitado,
            String from,
            String to,
            String mensaje,
            String canal,
            boolean incluirFrom) {

        if (to == null || to.isBlank()) {
            return;
        }

        if (!habilitado) {
            log.info("[{} deshabilitado] Para: {}", canal, to);
            return;
        }

        if (accountSid.isBlank() || authToken.isBlank() || (incluirFrom && (from == null || from.isBlank()))) {
            log.error("No se pudo enviar {}: faltan datos de configuración.", canal);
            return;
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        if (incluirFrom) {
            form.add("From", from);
        }
        form.add("To", to);
        form.add("Body", mensaje);

        try {
            restClient.post()
                    .uri("/Accounts/{sid}/Messages.json", accountSid)
                    .headers(headers -> headers.setBasicAuth(accountSid, authToken))
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .toBodilessEntity();

            log.info("{} enviado correctamente a {}", canal, to);

        } catch (Exception e) {
            log.error("No se pudo enviar {} a {}: {}", canal, to, e.getMessage());
        }
    }
}
