<template>
  <div class="legal-page">
    <header class="legal-header">
      <RouterLink to="/" class="back-link">← DevPresent</RouterLink>
      <h1>Política de Privacidad</h1>
      <p class="last-updated">Última actualización: mayo de 2026</p>
    </header>

    <main class="legal-content">

      <section>
        <h2>1. Responsable del tratamiento</h2>
        <p>
          <strong>Identidad:</strong> Andrés Blasco Aleixos<br>
          <strong>NIF:</strong> 23848403W<br>
          <strong>Correo electrónico:</strong> <a href="mailto:blasco.ivia@gmail.com">blasco.ivia@gmail.com</a><br>
          <strong>Sitio web:</strong> <a href="https://pdfs-interactivos.vercel.app/" target="_blank" rel="noopener">https://pdfs-interactivos.vercel.app/</a>
        </p>
        <p>
          <strong>Delegado de Protección de Datos (DPO):</strong> No hemos designado un DPO porque
          no concurre ninguno de los supuestos que lo exigen conforme al art. 37 del RGPD
          (no somos organismo público, no realizamos tratamiento a gran escala de categorías
          especiales de datos ni monitorización sistemática). Esta evaluación podrá revisarse
          si el volumen o la naturaleza del tratamiento cambia de forma significativa. Para
          cualquier consulta en materia de privacidad dirígete al responsable en la dirección indicada.
        </p>
      </section>

      <section>
        <h2>2. Datos que recogemos</h2>
        <p>Recogemos únicamente los datos estrictamente necesarios para prestar el servicio:</p>
        <ul>
          <li><strong>Dirección de correo electrónico</strong> — para crear y gestionar tu cuenta.</li>
          <li><strong>Datos de pago</strong> — nombre del titular, número de tarjeta (tokenizado), país de facturación. Procesados íntegramente por <strong>Stripe, Inc.</strong>; DevPresent no almacena datos de tarjeta en ningún momento.</li>
          <li><strong>Contenido que subes</strong> — archivos PDF, PPTX e imágenes que importas al editor, almacenados en Cloudinary.</li>
          <li><strong>Datos de uso anónimos</strong> — páginas visitadas y acciones dentro de la aplicación, recogidos de forma agregada y sin cookies por <strong>Vercel Analytics</strong>.</li>
          <li><strong>Dirección IP</strong> — recogida automáticamente por el servidor para seguridad y prevención de fraude.</li>
        </ul>
      </section>

      <section>
        <h2>3. Finalidades y base jurídica</h2>
        <table>
          <thead>
            <tr>
              <th>Finalidad</th>
              <th>Base jurídica (RGPD)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Prestación del servicio (cuenta, editor, publicación)</td>
              <td>Ejecución de contrato — art. 6.1.b</td>
            </tr>
            <tr>
              <td>Gestión de suscripción y facturación</td>
              <td>Ejecución de contrato — art. 6.1.b</td>
            </tr>
            <tr>
              <td>Seguridad y prevención de fraude</td>
              <td>Interés legítimo — art. 6.1.f</td>
            </tr>
            <tr>
              <td>Análisis de uso agregado y anónimo</td>
              <td>Interés legítimo — art. 6.1.f</td>
            </tr>
            <tr>
              <td>Cumplimiento de obligaciones legales</td>
              <td>Obligación legal — art. 6.1.c</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>4. Encargados del tratamiento y subprocesadores</h2>
        <p>
          Trabajamos con los siguientes encargados de tratamiento que acceden a datos personales
          exclusivamente para prestar el servicio. Cada uno dispone de un Acuerdo de Tratamiento
          de Datos (DPA) en vigor:
        </p>
        <ul>
          <li><strong>Stripe, Inc.</strong> — procesamiento de pagos. <a href="https://stripe.com/es/privacy" target="_blank" rel="noopener">Política de privacidad</a> · <a href="https://stripe.com/es/legal/dpa" target="_blank" rel="noopener">DPA</a></li>
          <li><strong>Cloudinary, Inc.</strong> — almacenamiento de archivos multimedia. <a href="https://cloudinary.com/privacy" target="_blank" rel="noopener">Política de privacidad</a></li>
          <li><strong>Vercel, Inc.</strong> — alojamiento del servicio y analítica de uso anónima. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener">Política de privacidad</a> · <a href="https://vercel.com/legal/dpa" target="_blank" rel="noopener">DPA</a></li>
          <li><strong>MongoDB Atlas (MongoDB, Inc.)</strong> — base de datos. <a href="https://www.mongodb.com/legal/privacy-policy" target="_blank" rel="noopener">Política de privacidad</a> · <a href="https://www.mongodb.com/legal/dpa" target="_blank" rel="noopener">DPA</a></li>
        </ul>
        <p>
          Los encargados pueden utilizar <strong>subprocesadores</strong> para prestar sus propios
          servicios. Puedes solicitar el listado actualizado de subprocesadores en cualquier
          momento escribiendo a <a href="mailto:blasco.ivia@gmail.com">blasco.ivia@gmail.com</a>.
          Nos comprometemos a notificarte ante cualquier cambio relevante de encargado o
          subprocesador que pudiera afectar al nivel de protección de tus datos.
        </p>
      </section>

      <section>
        <h2>5. Transferencias internacionales</h2>
        <p>
          Algunos encargados están ubicados en Estados Unidos. Las garantías aplicadas son las siguientes:
        </p>
        <table>
          <thead>
            <tr><th>Proveedor</th><th>Mecanismo de transferencia</th></tr>
          </thead>
          <tbody>
            <tr><td>Stripe, Inc.</td><td>EU-U.S. Data Privacy Framework (DPF) — certificado</td></tr>
            <tr><td>Vercel, Inc.</td><td>EU-U.S. Data Privacy Framework (DPF) — certificado</td></tr>
            <tr><td>Cloudinary, Inc.</td><td>Cláusulas Contractuales Tipo (SCC) — Decisión UE 2021/914</td></tr>
            <tr><td>MongoDB Atlas</td><td>Cláusulas Contractuales Tipo (SCC) — Decisión UE 2021/914</td></tr>
          </tbody>
        </table>
        <p>
          El mecanismo «Privacy Shield» fue invalidado por el TJUE en julio de 2020 (Schrems II)
          y <strong>no se utiliza</strong>. Todos los proveedores operan bajo DPF vigente o SCC
          aprobadas por la Comisión Europea. Hemos realizado una evaluación de impacto de
          transferencias (Transfer Impact Assessment — TIA) interna para cada proveedor
          con el fin de verificar que el nivel de protección es esencialmente equivalente al
          garantizado en la UE.
        </p>
      </section>

      <section>
        <h2>6. Conservación de datos</h2>
        <ul>
          <li><strong>Datos de cuenta:</strong> mientras la cuenta esté activa. Tras la cancelación, se eliminan en un plazo máximo de 30 días, salvo obligación legal de conservación.</li>
          <li><strong>Datos de facturación:</strong> 5 años, conforme a la legislación fiscal española.</li>
          <li><strong>Archivos subidos:</strong> hasta que el usuario los elimine o cancele su cuenta.</li>
        </ul>
      </section>

      <section>
        <h2>7. Derechos del usuario</h2>
        <p>Conforme al RGPD y la LOPDGDD, puedes ejercer los siguientes derechos:</p>
        <ul>
          <li><strong>Acceso</strong> — conocer qué datos tenemos sobre ti.</li>
          <li><strong>Rectificación</strong> — corregir datos inexactos.</li>
          <li><strong>Supresión</strong> — solicitar la eliminación de tus datos («derecho al olvido»).</li>
          <li><strong>Limitación del tratamiento</strong> — restringir el uso de tus datos en determinados casos.</li>
          <li><strong>Portabilidad</strong> — recibir tus datos en formato estructurado y legible.</li>
          <li><strong>Oposición</strong> — oponerte al tratamiento basado en interés legítimo.</li>
          <li><strong>Retirada del consentimiento</strong> — en cualquier momento, sin efectos retroactivos.</li>
        </ul>
        <p>
          Para ejercer cualquier derecho, escríbenos a
          <a href="mailto:blasco.ivia@gmail.com">blasco.ivia@gmail.com</a> indicando:
          nombre completo, derecho que deseas ejercer y correo asociado a tu cuenta.
          Responderemos en un plazo máximo de <strong>30 días</strong>.
        </p>
        <p>
          <strong>Revocación del consentimiento:</strong> cuando el tratamiento se base en tu
          consentimiento, puedes revocarlo en cualquier momento sin efectos retroactivos mediante:
        </p>
        <ul>
          <li>Correo a <a href="mailto:blasco.ivia@gmail.com">blasco.ivia@gmail.com</a> con el asunto «Revocación de consentimiento».</li>
          <li>Eliminación de tu cuenta desde <RouterLink to="/devpresent/perfil">Ajustes de cuenta</RouterLink>, que supone la supresión de todos tus datos.</li>
        </ul>
        <p>
          Si no recibes respuesta satisfactoria, puedes reclamar ante la
          <a href="https://www.aepd.es/" target="_blank" rel="noopener">Agencia Española de Protección de Datos (AEPD)</a>.
        </p>
      </section>

      <section>
        <h2>8. Seguridad</h2>
        <p>
          Aplicamos medidas técnicas y organizativas apropiadas para proteger tus datos:
          comunicaciones cifradas (HTTPS/TLS), acceso restringido a datos sensibles,
          tokens JWT para autenticación y contraseñas almacenadas con hash bcrypt.
        </p>
      </section>

      <section>
        <h2>9. Menores de edad</h2>
        <p>
          DevPresent está dirigido exclusivamente a personas de <strong>18 o más años</strong>.
          No recogemos conscientemente datos de menores. Si sospechas que un menor ha creado
          una cuenta, notifícanos a <a href="mailto:blasco.ivia@gmail.com">blasco.ivia@gmail.com</a>
          y eliminaremos la cuenta y sus datos en un plazo máximo de <strong>72 horas</strong>.
        </p>
        <p>
          La verificación de edad se realiza de forma declarativa en el momento del registro.
          Si detectamos un uso contrario a esta restricción, nos reservamos el derecho de
          cancelar la cuenta de forma inmediata.
        </p>
      </section>

      <section>
        <h2>10. Exportación y portabilidad de datos</h2>
        <p>
          Tienes derecho a recibir una copia de tus datos en formato estructurado, de uso común
          y lectura mecánica — habitualmente <strong>JSON o ZIP</strong> según el tipo de datos —
          (derecho de portabilidad, art. 20 RGPD). Para solicitarla escríbenos a
          <a href="mailto:blasco.ivia@gmail.com">blasco.ivia@gmail.com</a>.
        </p>
        <p>
          Antes de cancelar tu cuenta te recomendamos descargar tus proyectos y archivos.
          Tras la cancelación, los datos se eliminan en un plazo máximo de 30 días y
          <strong>no es posible recuperarlos</strong>.
        </p>
      </section>

      <section>
        <h2>11. Cookies</h2>
        <p>
          DevPresent utiliza <strong>Vercel Analytics</strong>, que según la configuración actual
          del proveedor opera de forma cookieless, sin almacenar identificadores personales en
          el dispositivo del usuario. No instalamos cookies de seguimiento ni de publicidad.
          Para más detalle consulta nuestra <RouterLink to="/legal/cookies">Política de Cookies</RouterLink>.
        </p>
      </section>

      <section>
        <h2>12. Cambios en esta política</h2>
        <p>
          Podemos actualizar esta política para reflejar cambios en el servicio o en la legislación.
          Te notificaremos por correo electrónico con al menos 15 días de antelación ante cambios sustanciales.
        </p>
      </section>

      <section>
        <h2>13. Contacto</h2>
        <p>
          Para cualquier consulta sobre privacidad o protección de datos:
          <a href="mailto:blasco.ivia@gmail.com">blasco.ivia@gmail.com</a>
        </p>
      </section>

    </main>

    <footer class="legal-footer">
      <RouterLink to="/legal/terminos">Términos y Condiciones</RouterLink>
      <RouterLink to="/legal/aviso">Aviso Legal</RouterLink>
      <RouterLink to="/legal/cookies">Política de Cookies</RouterLink>
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
  font-size: 0.9rem;
  margin-top: 10px;
}

th {
  background: rgba(234, 88, 12, 0.08);
  color: #280e04;
  font-weight: 700;
  padding: 10px 14px;
  text-align: left;
  border: 1px solid rgba(234, 88, 12, 0.18);
}

td {
  padding: 9px 14px;
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
