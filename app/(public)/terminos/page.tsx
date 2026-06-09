import Link from 'next/link'

export const metadata = {
  title: 'Términos y Condiciones – BUSCO',
  description: 'Términos y Condiciones de uso de la plataforma BUSCO.',
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-surface px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-8">

        {/* Encabezado */}
        <div className="border-b border-outline-variant pb-6">
          <Link href="/" className="text-sm text-primary-container hover:underline">← Volver al inicio</Link>
          <h1 className="mt-4 text-3xl font-bold text-on-surface">Términos y Condiciones de Uso</h1>
          <p className="mt-1 text-sm text-on-surface-variant">BUSCO · Plataforma de servicios locales · Versión vigente desde Junio de 2026</p>
        </div>

        <p className="text-sm text-on-surface-variant">
          Bienvenido/a a BUSCO. Antes de utilizar la plataforma, te pedimos que leas atentamente estos Términos y Condiciones.
          Al registrarte o navegar por BUSCO, aceptás cumplir con todo lo que se describe a continuación.
        </p>
        <p className="text-sm text-on-surface-variant">
          Estos términos rigen la relación entre BUSCO (en adelante &ldquo;la Plataforma&rdquo;) y sus usuarios,
          tanto clientes (en adelante &ldquo;vecinos&rdquo;) como prestadores de servicios (en adelante &ldquo;prestadores&rdquo;).
        </p>

        {/* 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface">1. ¿Qué es BUSCO?</h2>
          <p className="text-sm text-on-surface-variant">
            BUSCO es una plataforma digital que conecta vecinos con prestadores de servicios y oficios locales en
            San Antonio de Arredondo, Valle de Punilla, y localidades aledañas de la provincia de Córdoba, Argentina.
          </p>
          <p className="text-sm text-on-surface-variant">
            BUSCO actúa exclusivamente como intermediario de contacto. No es parte de ningún acuerdo, contrato, ni
            transacción económica que se realice entre vecinos y prestadores. Toda negociación, acuerdo de precio, y
            ejecución del servicio ocurre fuera de la Plataforma, directamente entre las partes.
          </p>
        </section>

        {/* 2 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-on-surface">2. Usuarios y roles</h2>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary-container">2.1 Vecinos (clientes)</h3>
            <p className="text-sm text-on-surface-variant">
              Son las personas que utilizan BUSCO para buscar y contactar prestadores de servicios. Los vecinos pueden:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-on-surface-variant">
              <li>Navegar el directorio de prestadores sin registrarse.</li>
              <li>Registrarse para dejar reseñas y calificaciones.</li>
              <li>Contactar prestadores a través del botón de WhatsApp disponible en cada perfil.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary-container">2.2 Prestadores</h3>
            <p className="text-sm text-on-surface-variant">
              Son las personas que ofrecen sus servicios u oficios a través de BUSCO. Los prestadores pueden:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-on-surface-variant">
              <li>Crear un perfil público con información sobre sus servicios, zona de trabajo y datos de contacto.</li>
              <li>Recibir contactos de vecinos interesados.</li>
              <li>Recibir y responder reseñas públicas.</li>
              <li>Gestionar su perfil desde el panel privado.</li>
            </ul>
            <p className="text-sm text-on-surface-variant">
              Al registrarse como prestador, la persona declara que la información proporcionada es veraz, que está
              habilitada para prestar los servicios que anuncia, y que cumple con las obligaciones impositivas y
              legales que correspondan a su actividad.
            </p>
          </div>
        </section>

        {/* 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface">3. Registro y cuenta</h2>
          <p className="text-sm text-on-surface-variant">
            Para acceder a ciertas funcionalidades de BUSCO es necesario crear una cuenta. Al hacerlo, el usuario se compromete a:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-on-surface-variant">
            <li>Proveer información verdadera, completa y actualizada.</li>
            <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
            <li>Notificar a BUSCO ante cualquier uso no autorizado de su cuenta.</li>
          </ul>
          <p className="text-sm text-on-surface-variant">
            BUSCO se reserva el derecho de suspender o eliminar cuentas que contengan información falsa, que
            incumplan estos Términos, o que realicen un uso inapropiado de la Plataforma.
          </p>
        </section>

        {/* 4 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-on-surface">4. Suscripción de prestadores</h2>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary-container">4.1 Período gratuito</h3>
            <p className="text-sm text-on-surface-variant">
              Los prestadores que se registren gozarán de un período gratuito de sesenta (60) días durante el cual
              su perfil estará activo y visible en el directorio sin ningún costo.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary-container">4.2 Suscripción mensual</h3>
            <p className="text-sm text-on-surface-variant">
              Vencido el período gratuito, los prestadores deberán abonar una suscripción mensual para mantener su
              perfil activo y visible en las búsquedas. El valor de la suscripción será informado en la sección
              correspondiente del panel del prestador y puede actualizarse con un preaviso mínimo de treinta (30) días.
            </p>
            <p className="text-sm text-on-surface-variant">
              El no pago de la suscripción resultará en la pausa automática del perfil, que dejará de aparecer en los
              resultados de búsqueda. El perfil, las reseñas y los datos del prestador se conservarán y podrán
              reactivarse abonando la suscripción correspondiente.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary-container">4.3 Reembolsos</h3>
            <p className="text-sm text-on-surface-variant">
              Las suscripciones abonadas no son reembolsables, salvo que BUSCO no haya podido prestar el servicio
              por causas imputables a la Plataforma.
            </p>
          </div>
        </section>

        {/* 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface">5. Reseñas y calificaciones</h2>
          <p className="text-sm text-on-surface-variant">
            El sistema de reseñas es un componente central de BUSCO. Su propósito es generar confianza genuina en la comunidad. Por eso:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-on-surface-variant">
            <li>Solo pueden dejar reseñas los vecinos registrados que hayan contactado previamente al prestador a través de la Plataforma.</li>
            <li>Cada vecino puede dejar una sola reseña por prestador.</li>
            <li>Un prestador no puede reseñar su propio perfil.</li>
            <li>Las reseñas deben reflejar experiencias reales y honestas.</li>
            <li>Está prohibido publicar reseñas falsas, injuriosas, discriminatorias, o con contenido inapropiado.</li>
          </ul>
          <p className="text-sm text-on-surface-variant">
            Los prestadores pueden responder públicamente a las reseñas recibidas. BUSCO se reserva el derecho de
            eliminar reseñas o respuestas que incumplan estas condiciones, ya sea de oficio o a partir de un reporte
            de otro usuario.
          </p>
        </section>

        {/* 6 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-on-surface">6. Responsabilidades y limitaciones</h2>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary-container">6.1 BUSCO no garantiza la calidad de los servicios</h3>
            <p className="text-sm text-on-surface-variant">
              BUSCO es una plataforma de conexión. No verifica las habilitaciones, certificaciones, ni la calidad de
              los trabajos de los prestadores. La contratación de cualquier servicio es una decisión exclusiva del
              vecino, bajo su propia responsabilidad.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary-container">6.2 BUSCO no es parte de los contratos</h3>
            <p className="text-sm text-on-surface-variant">
              Cualquier acuerdo, precio, condición de pago o garantía pactado entre un vecino y un prestador es
              responsabilidad exclusiva de las partes. BUSCO no interviene en esas negociaciones ni asume
              responsabilidad por su cumplimiento.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary-container">6.3 Disponibilidad del servicio</h3>
            <p className="text-sm text-on-surface-variant">
              BUSCO hará sus mejores esfuerzos para mantener la Plataforma disponible de manera continua. Sin embargo,
              no garantiza disponibilidad ininterrumpida y no se hace responsable por interrupciones técnicas, pérdida
              de datos, o perjuicios derivados del uso o imposibilidad de uso de la Plataforma.
            </p>
          </div>
        </section>

        {/* 7 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface">7. Conducta prohibida</h2>
          <p className="text-sm text-on-surface-variant">Está expresamente prohibido en BUSCO:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-on-surface-variant">
            <li>Publicar información falsa o engañosa en perfiles o reseñas.</li>
            <li>Usar la Plataforma para fines ilegales o contrarios a la moral.</li>
            <li>Hostigar, amenazar o discriminar a otros usuarios.</li>
            <li>Intentar acceder de manera no autorizada a sistemas o datos de la Plataforma.</li>
            <li>Publicar contenido de terceros sin autorización.</li>
            <li>Realizar actividades que dañen la reputación o el funcionamiento de BUSCO.</li>
          </ul>
          <p className="text-sm text-on-surface-variant">
            El incumplimiento de estas prohibiciones puede resultar en la suspensión inmediata de la cuenta, sin
            derecho a reembolso de suscripciones abonadas.
          </p>
        </section>

        {/* 8 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface">8. Privacidad y datos personales</h2>
          <p className="text-sm text-on-surface-variant">
            BUSCO recolecta y trata datos personales de sus usuarios conforme a la Ley N° 25.326 de Protección de
            Datos Personales de la República Argentina.
          </p>
          <p className="text-sm text-on-surface-variant">
            Los datos recolectados se utilizan exclusivamente para el funcionamiento de la Plataforma: mostrar perfiles
            públicos, facilitar el contacto entre vecinos y prestadores, y mejorar la experiencia de uso.
          </p>
          <p className="text-sm text-on-surface-variant">BUSCO no vende ni cede datos personales a terceros, salvo obligación legal.</p>
          <p className="text-sm text-on-surface-variant">
            Los usuarios tienen derecho a acceder, rectificar y eliminar sus datos personales enviando una solicitud
            a través del formulario de contacto de la Plataforma.
          </p>
          <p className="text-sm text-on-surface-variant">
            Los números de WhatsApp de los prestadores son visibles públicamente en sus perfiles, por ser el canal de
            contacto principal de la Plataforma. Al registrarse, el prestador presta su consentimiento expreso para ello.
          </p>
        </section>

        {/* 9 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface">9. Propiedad intelectual</h2>
          <p className="text-sm text-on-surface-variant">
            El nombre BUSCO, su diseño, logotipo, y el contenido desarrollado por la Plataforma son propiedad de sus
            creadores y están protegidos por la legislación aplicable en materia de propiedad intelectual.
          </p>
          <p className="text-sm text-on-surface-variant">
            Los usuarios conservan los derechos sobre el contenido que publican (fotos, descripciones, reseñas) y
            otorgan a BUSCO una licencia no exclusiva para mostrarlo dentro de la Plataforma con el fin de prestar el servicio.
          </p>
        </section>

        {/* 10 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface">10. Modificaciones</h2>
          <p className="text-sm text-on-surface-variant">
            BUSCO podrá modificar estos Términos y Condiciones en cualquier momento. Los cambios serán notificados
            a los usuarios registrados por email o mediante un aviso visible en la Plataforma con un mínimo de
            quince (15) días de anticipación.
          </p>
          <p className="text-sm text-on-surface-variant">
            El uso continuado de la Plataforma tras la entrada en vigencia de los nuevos términos implica la aceptación
            de los mismos. Si el usuario no acepta los cambios, puede solicitar la baja de su cuenta.
          </p>
        </section>

        {/* 11 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface">11. Jurisdicción y ley aplicable</h2>
          <p className="text-sm text-on-surface-variant">
            Estos Términos y Condiciones se rigen por las leyes de la República Argentina. Ante cualquier controversia,
            las partes se someten a la jurisdicción de los tribunales ordinarios de la ciudad de Córdoba, renunciando
            a cualquier otro fuero que pudiera corresponderles.
          </p>
        </section>

        {/* 12 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface">12. Contacto</h2>
          <p className="text-sm text-on-surface-variant">
            Para consultas, reportes o solicitudes relacionadas con estos Términos, los usuarios pueden comunicarse
            a través del{' '}
            <Link href="/contacto" className="text-primary-container hover:underline">
              formulario de contacto
            </Link>{' '}
            disponible en la sección &ldquo;Contacto&rdquo; de la Plataforma.
          </p>
        </section>

        {/* Footer */}
        <div className="border-t border-outline-variant pt-6 text-center">
          <p className="text-xs text-on-surface-variant">
            BUSCO — Plataforma de servicios locales · Valle de Punilla, Córdoba, Argentina
          </p>
          <p className="text-xs text-on-surface-variant">Versión vigente desde Junio de 2026</p>
          <Link href="/" className="mt-4 inline-block text-sm text-primary-container hover:underline">
            Volver al inicio
          </Link>
        </div>

      </div>
    </div>
  )
}
