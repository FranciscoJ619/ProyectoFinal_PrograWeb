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

/**
 * Envía SMS y mensajes de WhatsApp a través de la API REST de Twilio
 * (POST /2010-04-01/Accounts/{sid}/Messages.json).
 */
@Service
public class TwilioService {

    private static final Logger log = LoggerFactory.getLogger(TwilioService.class);

    private final RestClient restClient;
    private final boolean habilitado;
    private final String accountSid;
    private final String authToken;
    private final String smsFrom;
    private final String whatsappFrom;

    public TwilioService(@Value("${app.twilio.enabled:false}") boolean habilitado,
                         @Value("${app.twilio.account-sid:}") String accountSid,
                         @Value("${app.twilio.auth-token:}") String authToken,
                         @Value("${app.twilio.sms-from:}") String smsFrom,
                         @Value("${app.twilio.whatsapp-from:}") String whatsappFrom) {
        this.restClient = RestClient.builder().baseUrl("https://api.twilio.com/2010-04-01").build();
        this.habilitado = habilitado;
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.smsFrom = smsFrom;
        this.whatsappFrom = whatsappFrom;
    }

    @Async
    public void enviarSms(String telefono, String mensaje) {
        enviar(smsFrom, telefono, mensaje, "SMS");
    }

    @Async
    public void enviarWhatsapp(String telefono, String mensaje) {
        if (telefono == null || telefono.isBlank()) return;
        enviar(whatsappFrom, "whatsapp:" + telefono, mensaje, "WhatsApp");
    }

    private void enviar(String from, String to, String mensaje, String canal) {
        if (to == null || to.isBlank() || to.equals("whatsapp:")) return;
        if (!habilitado) {
            log.info("[{} deshabilitado] Para: {} | {}", canal, to, mensaje);
            return;
        }
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("From", from);
        form.add("To", to);
        form.add("Body", mensaje);
        try {
            restClient.post()
                    .uri("/Accounts/{sid}/Messages.json", accountSid)
                    .headers(h -> h.setBasicAuth(accountSid, authToken))
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .toBodilessEntity();
            log.info("{} enviado a {}", canal, to);
        } catch (Exception e) {
            log.error("No se pudo enviar {} a {}: {}", canal, to, e.getMessage());
        }
    }
}
