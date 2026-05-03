<template>
  <div class="legal-page">
    <header class="legal-header">
      <RouterLink to="/" class="back-link">← DevPresent</RouterLink>
      <h1>Aviso Legal</h1>
      <p class="last-updated">Última actualización: mayo de 2026</p>
    </header>

    <main class="legal-content">

      <section>
        <h2>1. Datos identificativos del titular</h2>
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
          Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se ponen a disposición
          del usuario los siguientes datos identificativos:
        </p>
        <ul>
          <li><strong>Titular:</strong> Andrés Blasco Aleixos</li>
          <li><strong>NIF:</strong> 23848403W</li>
          <li><strong>Correo electrónico de contacto:</strong> <a href="mailto:blasco.ivia@gmail.com">blasco.ivia@gmail.com</a></li>
          <li><strong>Sitio web:</strong> <a href="https://pdfs-interactivos.vercel.app/" target="_blank" rel="noopener">https://pdfs-interactivos.vercel.app/</a></li>
        </ul>
      </section>

      <section>
        <h2>2. Objeto y ámbito de aplicación</h2>
        <p>
          El presente Aviso Legal regula el acceso y uso del sitio web y servicio <strong>DevPresent</strong>,
          accesible en la dirección indicada anteriormente. El acceso al sitio implica la aceptación plena
          y sin reservas de las condiciones recogidas en este aviso.
        </p>
      </section>

      <section>
        <h2>3. Propiedad intelectual e industrial</h2>
        <p>
          Todos los contenidos del sitio web (incluyendo, a título enunciativo, textos, imágenes,
          logotipos, íconos, código fuente, diseño gráfico y estructura) son titularidad de
          Andrés Blasco Aleixos o de terceros que han autorizado su uso, y están protegidos por
          las leyes españolas y europeas de propiedad intelectual e industrial.
        </p>
        <p>
          Queda expresamente prohibida la reproducción, distribución, comunicación pública o
          transformación de estos contenidos sin autorización previa y por escrito del titular,
          salvo los supuestos permitidos por la ley.
        </p>
      </section>

      <section>
        <h2>4. Exclusión de garantías y responsabilidad</h2>
        <p>
          El titular no garantiza la inexistencia de interrupciones o errores en el acceso al sitio
          ni en su contenido, ni que éste se encuentre actualizado en todo momento, aunque
          desarrollará sus mejores esfuerzos para, en su caso, evitarlos, subsanarlos o actualizarlos.
        </p>
        <p>
          El titular queda exonerado de cualquier tipo de responsabilidad derivada de la información
          publicada en su sitio web siempre que esta información haya sido manipulada o introducida
          por un tercero ajeno al mismo.
        </p>
      </section>

      <section>
        <h2>5. Política de enlaces</h2>
        <p>
          El sitio web puede contener enlaces a sitios de terceros. El titular no controla ni asume
          responsabilidad alguna sobre el contenido de dichos sitios. La inclusión de un enlace no
          supone aprobación del sitio enlazado.
        </p>
        <p>
          Cualquier persona que desee establecer un enlace hacia este sitio web deberá obtener
          autorización previa del titular.
        </p>
      </section>

      <section>
        <h2>6. Legislación aplicable y jurisdicción</h2>
        <p>
          Este Aviso Legal se rige por la legislación española. Para la resolución de cualquier
          controversia derivada del uso del sitio web, las partes se someten, con renuncia expresa
          a cualquier otro fuero, a los Juzgados y Tribunales competentes conforme a derecho.
        </p>
      </section>

      <section>
        <h2>7. Normativa aplicable</h2>
        <ul>
          <li>Ley 34/2002 (LSSI-CE) — Servicios de la Sociedad de la Información.</li>
          <li>Reglamento (UE) 2016/679 (RGPD) — Protección de datos personales.</li>
          <li>Ley Orgánica 3/2018 (LOPDGDD) — Protección de datos y garantía de derechos digitales.</li>
          <li>Real Decreto Legislativo 1/2007 (TRLGDCU) — Defensa de consumidores y usuarios.</li>
          <li>Ley 7/1998 — Condiciones generales de la contratación.</li>
        </ul>
      </section>

    </main>

    <footer class="legal-footer">
      <RouterLink to="/legal/privacidad">Política de Privacidad</RouterLink>
      <RouterLink to="/legal/terminos">Términos y Condiciones</RouterLink>
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
