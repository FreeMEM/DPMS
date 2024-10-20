import smtplib
import ssl
from django.core.mail.backends.smtp import EmailBackend


class CustomSMTPConnection(EmailBackend):
    def open(self):
        if self.connection:
            return False
        try:
            self.connection = smtplib.SMTP(
                self.host, self.port, **self.connection_params
            )
            if self.use_tls:
                context = ssl.create_default_context()
                context.check_hostname = False
                context.verify_mode = (
                    ssl.CERT_NONE
                )  # Deshabilitar verificación del certificado
                self.connection.starttls(context=context)
            self.connection.login(self.username, self.password)
        except:
            self.close()
            raise
        return True
