<template>
  <div class="legal-page">
    <header class="legal-header">
      <RouterLink to="/" class="back-link">← DevPresent</RouterLink>
      <h1>Política de Cookies</h1>
      <p class="last-updated">Última actualización: mayo de 2026</p>
    </header>

    <main class="legal-content">

      <section class="highlight-box">
        <p>
          <strong>Resumen:</strong> DevPresent <strong>no utiliza cookies</strong> de rastreo, publicidad ni análisis de comportamiento individual.
          No se muestra banner de cookies porque no hay cookies que requieran consentimiento.
        </p>
      </section>

      <section>
        <h2>1. ¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que un sitio web almacena en el dispositivo del
          usuario. Pueden tener distintos propósitos: funcionamiento técnico, análisis de uso,
          personalización o publicidad.
        </p>
      </section>

      <section>
        <h2>2. Cookies que usa DevPresent</h2>
        <h3>Cookies técnicas (necesarias)</h3>
        <p>
          DevPresent almacena en el <strong>localStorage</strong> del navegador el token de sesión JWT
          necesario para mantener la sesión iniciada. Esto <strong>no es una cookie</strong> en sentido
          técnico y no requiere consentimiento conforme a la Directiva ePrivacy.
        </p>

        <h3>Análisis de uso: Vercel Analytics</h3>
        <p>
          Usamos <strong>Vercel Analytics</strong> para medir el tráfico del sitio. Según la
          información disponible del proveedor <em>a fecha de esta política</em>, esta herramienta
          opera de forma <strong>cookieless</strong> (sin cookies): no almacena identificadores
          persistentes en el dispositivo del usuario y utiliza datos agregados a nivel de red.
          Bajo esta configuración no requiere consentimiento conforme a la Directiva ePrivacy.
          Si Vercel modificara su implementación, actualizaremos esta política de inmediato.
        </p>
        <p>
          Para más información: <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener">Vercel Analytics Privacy</a>.
        </p>

        <h3>Stripe (pasarela de pago)</h3>
        <p>
          Cuando accedes al proceso de pago, eres redirigido a la plataforma de <strong>Stripe</strong>,
          que puede establecer sus propias cookies en el contexto del checkout. Estas cookies son
          responsabilidad de Stripe y están sujetas a su propia política:
          <a href="https://stripe.com/es/cookie-settings" target="_blank" rel="noopener">Configuración de cookies de Stripe</a>.
          DevPresent no tiene control sobre ellas.
        </p>
      </section>

      <section>
        <h2>3. Tabla resumen</h2>
        <table>
          <thead>
            <tr>
              <th>Nombre / Tipo</th>
              <th>Proveedor</th>
              <th>Finalidad</th>
              <th>Duración</th>
              <th>Consentimiento</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>auth_token (localStorage)</td>
              <td>DevPresent</td>
              <td>Mantener sesión de usuario</td>
              <td>Sesión / hasta logout</td>
              <td>No requerido (técnico)</td>
            </tr>
            <tr>
              <td>Vercel Analytics</td>
              <td>Vercel, Inc.</td>
              <td>Métricas de tráfico agregadas, sin cookies</td>
              <td>Sin almacenamiento local</td>
              <td>No requerido (cookieless)</td>
            </tr>
            <tr>
              <td>Cookies de Stripe</td>
              <td>Stripe, Inc.</td>
              <td>Prevención de fraude en pagos</td>
              <td>Según Stripe</td>
              <td>Gestionado por Stripe</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>4. ¿Por qué no hay banner de cookies?</h2>
        <p>
          La Directiva 2002/58/CE (ePrivacy) y las guías de la AEPD exigen consentimiento
          únicamente para las cookies no técnicas (analítica con identificadores, marketing,
          personalización). Según la información disponible de los servicios que utilizamos
          <em>a fecha de esta política</em>,
          DevPresent no instala cookies de ese tipo en el dispositivo del usuario, por lo que
          actualmente <strong>no es obligatorio mostrar un banner de consentimiento</strong>.
        </p>
        <p>
          Esta evaluación puede cambiar si se incorporan nuevos servicios o cambia la
          implementación de los actuales. En tal caso, se activará el mecanismo de
          consentimiento antes de desplegar dichas cookies.
        </p>
      </section>

      <section>
        <h2>5. Cambios futuros</h2>
        <p>
          Si en el futuro incorporamos cookies que requieran consentimiento, actualizaremos esta
          política e implementaremos el mecanismo de aceptación correspondiente antes de activarlas.
        </p>
      </section>

      <section>
        <h2>6. Contacto</h2>
        <p>
          Para cualquier duda sobre el uso de cookies:
          <a href="mailto:blasco.ivia@gmail.com">blasco.ivia@gmail.com</a>
        </p>
        <p>
          También puedes consultar la guía de cookies de la
          <a href="https://www.aepd.es/guias/guia-cookies.pdf" target="_blank" rel="noopener">Agencia Española de Protección de Datos</a>.
        </p>
      </section>

    </main>

    <footer class="legal-footer">
      <RouterLink to="/legal/privacidad">Política de Privacidad</RouterLink>
      <RouterLink to="/legal/terminos">Términos y Condiciones</RouterLink>
      <RouterLink to="/legal/aviso">Aviso Legal</RouterLink>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  background: #faf8f5;
  color: #1c140c;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  padding: 40px 24px 60px;
}

.legal-header {
  max-width: 760px;
  margin: 0 auto 48px;
}

.back-link {
  display: inline-block;
  margin-bottom: 20px;
  color: #ea580c;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.back-link:hover {
  text-decoration: underline;
}

.legal-header h1 {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #280e04;
  margin: 0 0 8px;
}

.last-updated {
  font-size: 0.84rem;
  color: #7a5030;
  margin: 0;
}

.legal-content {
  max-width: 760px;
  margin: 0 auto;
}

.highlight-box {
  background: rgba(234, 88, 12, 0.07);
  border: 1px solid rgba(234, 88, 12, 0.22);
  border-radius: 8px;
  padding: 16px 20px !important;
  margin-bottom: 32px !important;
  border-bottom: none !important;
}

.highlight-box p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.65;
  color: #3d1a0a;
}

.legal-content section {
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(234, 88, 12, 0.12);
}

.legal-content section:last-child {
  border-bottom: none;
}

.legal-content h2 {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #280e04;
  margin: 0 0 14px;
  letter-spacing: -0.02em;
}

.legal-content h3 {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 0.98rem;
  font-weight: 700;
  color: #3d1a0a;
  margin: 20px 0 8px;
}

.legal-content p,
.legal-content li {
  font-size: 0.95rem;
  line-height: 1.75;
  color: #3d2010;
}

.legal-content ul,
.legal-content ol {
  padding-left: 1.4em;
  margin: 10px 0;
}

.legal-content li {
  margin-bottom: 6px;
}

.legal-content a {
  color: #ea580c;
  text-decoration: underline;
  text-decoration-color: rgba(234, 88, 12, 0.4);
}

.legal-content a:hover {
  text-decoration-color: #ea580c;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
  margin-top: 10px;
}

th {
  background: rgba(234, 88, 12, 0.08);
  color: #280e04;
  font-weight: 700;
  padding: 10px 12px;
  text-align: left;
  border: 1px solid rgba(234, 88, 12, 0.18);
}

td {
  padding: 9px 12px;
  border: 1px solid rgba(234, 88, 12, 0.12);
  color: #3d2010;
  vertical-align: top;
}

.legal-footer {
  max-width: 760px;
  margin: 48px auto 0;
  padding-top: 24px;
  border-top: 1px solid rgba(234, 88, 12, 0.15);
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.legal-footer a {
  color: #7a5030;
  text-decoration: none;
  font-size: 0.85rem;
}

.legal-footer a:hover {
  color: #ea580c;
}
</style>
