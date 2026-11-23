# Despliegue de Replay Club en el VPS (Ubuntu 22.04/24.04)

Todo corre en el mismo servidor: **MySQL**, **backend (JAR con systemd)**, **frontend (build estático en Nginx)**,
**Postfix** para correo y **certificado SSL de Let's Encrypt**. Sustituye `TU-DOMINIO` por el dominio real.

## 1. Paquetes base

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y openjdk-21-jre-headless nginx mysql-server certbot python3-certbot-nginx git
# Node solo se necesita si compilas el frontend en el VPS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
```

> Importante: usar **MySQL** (`mysql-server`), no MariaDB.

## 2. Base de datos MySQL

```bash
sudo mysql
```
```sql
CREATE DATABASE replay_club CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'replayclub'@'localhost' IDENTIFIED BY 'UNA_CONTRASEÑA_SEGURA';
GRANT ALL PRIVILEGES ON replay_club.* TO 'replayclub'@'localhost';
FLUSH PRIVILEGES;
```
Las tablas y los datos de prueba los crea **Flyway** automáticamente al iniciar el backend
(`backend/src/main/resources/db/migration`). Como alternativa de respaldo:
`mysql -u replayclub -p < database/replay_club_respaldo.sql`.

## 3. Backend (JAR + systemd)

```bash
# En tu computadora (o en el VPS):
cd backend && ./mvnw -DskipTests package        # genera target/replay-club-api.jar

# En el VPS:
sudo useradd -r -s /usr/sbin/nologin replayclub
sudo mkdir -p /opt/replayclub/uploads
sudo cp replay-club-api.jar /opt/replayclub/
sudo cp application.properties.example /opt/replayclub/application.properties
sudo nano /opt/replayclub/application.properties   # llena BD, JWT, correo, Twilio
sudo chown -R replayclub:replayclub /opt/replayclub
sudo chmod 600 /opt/replayclub/application.properties
sudo cp deploy/replayclub-api.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now replayclub-api
sudo journalctl -u replayclub-api -f               # ver logs
```

Valores de producción a cambiar en `application.properties`:

```properties
app.frontend-url=https://TU-DOMINIO
app.cors.allowed-origins=https://TU-DOMINIO
app.uploads.dir=/opt/replayclub/uploads
app.mail.enabled=true
app.mail.from=Replay Club <no-reply@TU-DOMINIO>
spring.mail.host=localhost
spring.mail.port=25
app.twilio.enabled=true
```

Genera la clave JWT con: `openssl rand -base64 48`.

## 4. Frontend (build estático)

```bash
cd frontend && npm ci && npm run build
sudo mkdir -p /var/www/replayclub && sudo cp -r dist/* /var/www/replayclub/
```

## 5. Nginx + HTTPS con Let's Encrypt

```bash
sudo cp deploy/nginx-replayclub.conf /etc/nginx/sites-available/replayclub
sudo ln -s /etc/nginx/sites-available/replayclub /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d TU-DOMINIO -d www.TU-DOMINIO     # certificado gratuito + redirección a HTTPS
sudo certbot renew --dry-run                              # verifica la renovación automática
```

## 6. Correo con Postfix + SPF + DKIM

```bash
sudo apt install -y postfix opendkim opendkim-tools mailutils
# En el asistente: "Internet Site", nombre de correo = TU-DOMINIO
```

`/etc/postfix/main.cf` (valores clave):

```
myhostname = mail.TU-DOMINIO
mydomain = TU-DOMINIO
myorigin = $mydomain
inet_interfaces = loopback-only      # solo envía; Spring Boot se conecta por localhost:25
mydestination = localhost
smtpd_tls_security_level = may
smtp_tls_security_level = may
milter_default_action = accept
milter_protocol = 6
smtpd_milters = inet:localhost:8891
non_smtpd_milters = $smtpd_milters
```

DKIM con OpenDKIM:

```bash
sudo mkdir -p /etc/opendkim/keys/TU-DOMINIO
sudo opendkim-genkey -b 2048 -d TU-DOMINIO -D /etc/opendkim/keys/TU-DOMINIO -s mail -v
sudo chown -R opendkim:opendkim /etc/opendkim
sudo cat /etc/opendkim/keys/TU-DOMINIO/mail.txt   # este es el registro TXT DKIM
```

`/etc/opendkim.conf`:

```
Domain    TU-DOMINIO
Selector  mail
KeyFile   /etc/opendkim/keys/TU-DOMINIO/mail.private
Socket    inet:8891@localhost
Canonicalization relaxed/simple
Mode      sv
```

```bash
sudo systemctl restart opendkim postfix
```

Registros DNS en tu proveedor de dominio:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A    | `@` y `mail` | IP del VPS |
| MX   | `@` | `mail.TU-DOMINIO` (prioridad 10) |
| TXT (SPF) | `@` | `v=spf1 a mx ip4:IP_DEL_VPS -all` |
| TXT (DKIM) | `mail._domainkey` | contenido de `mail.txt` (`v=DKIM1; k=rsa; p=...`) |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:postmaster@TU-DOMINIO` |

Además configura el **PTR (DNS inverso)** de la IP del VPS a `mail.TU-DOMINIO` desde el panel del proveedor del VPS.
Prueba: `echo "Prueba" | mail -s "Prueba Postfix" tu-correo@gmail.com` y revisa en Gmail → "Mostrar original" que diga
`SPF: PASS` y `DKIM: PASS`.

## 7. Twilio (SMS y WhatsApp)

1. Crea una cuenta en twilio.com y obtén `Account SID` y `Auth Token`.
2. Compra/usa el número de prueba para SMS (`app.twilio.sms-from`).
3. WhatsApp: activa el **Sandbox** (Messaging → Try it out → WhatsApp). Cada teléfono que vaya a recibir debe enviar
   `join <palabra-clave>` al +1 415 523 8886. Con cuenta de prueba, los SMS solo llegan a números verificados.
4. Los teléfonos de los usuarios se guardan en formato E.164 (`+52...`).

Acciones reales que disparan cada canal:

| Acción en la app | Correo | SMS | WhatsApp |
|---|:---:|:---:|:---:|
| Registro (bienvenida) | ✅ | | |
| Recuperar / cambiar contraseña | ✅ | | |
| Nueva solicitud de préstamo/compra (al propietario) | ✅ | | ✅ |
| Solicitud aprobada (al solicitante) | ✅ | ✅ | |
| Préstamo entregado: aviso de fecha de devolución | ✅ | ✅ | |
| "Contactar propietario/usuario" | ✅ | | ✅ |
| Transacción finalizada | ✅ | | |

## 8. Firewall

```bash
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
# El puerto 8010 NO se abre: Nginx hace de proxy. MySQL y Postfix escuchan solo en localhost.
```
