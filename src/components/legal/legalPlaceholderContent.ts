export type LegalPlaceholderLang = "en" | "es";

export type LegalPlaceholderKey =
  | "legal"
  | "privacy"
  | "cookies"
  | "terms"
  | "accessibility"
  | "demoNotice";

type LegalPlaceholderSection = {
  title: string;
  body: string[];
};

type LegalPlaceholderCopy = {
  title: string;
  pageTitle: string;
  description: string;
  eyebrow: string;
  intro: string;
  sections: LegalPlaceholderSection[];
};

export const legalPlaceholderCopy: Record<LegalPlaceholderLang, Record<LegalPlaceholderKey, LegalPlaceholderCopy>> = {
  en: {
    legal: {
      title: "Legal Notice",
      pageTitle: "Legal Notice | Barcelona Private Advisory",
      description: "Portfolio-prototype legal notice placeholder for Barcelona Private Advisory.",
      eyebrow: "Legal / Trust",
      intro:
        "This page outlines the legal notice structure a production advisory site would need, without inventing provider details or agency credentials for this portfolio prototype.",
      sections: [
        {
          title: "Service provider information",
          body: [
            "Barcelona Private Advisory is a portfolio prototype for a private property advisory interface. It is not presented here as a registered company, agency mandate or licensed brokerage.",
            "In production, this page should be replaced by verified provider information, corporate identity, registration details, tax identifiers and legally reviewed notices.",
          ],
        },
        {
          title: "Demo status",
          body: [
            "Property data, advisory language, media and contact details in this build are demonstrative. They support product design evaluation and portfolio presentation only.",
            "No real property availability, service-provider relationship or commercial engagement is created by viewing this prototype.",
          ],
        },
        {
          title: "Intellectual property",
          body: [
            "The interface concept, layout system, copy structure and front-end implementation are presented as a Brenych Studio portfolio work.",
            "Production use would require confirmed ownership, licensing and permissions for all brand, media, data, text and software assets.",
          ],
        },
        {
          title: "Contact and responsibility",
          body: [
            "This prototype does not provide a monitored legal or commercial contact channel. Demo contact details shown elsewhere are clearly marked as demonstrative.",
            "A production deployment should add verified responsibility information and a real contact path controlled by the service provider.",
          ],
        },
        {
          title: "Production replacement note",
          body: [
            "Before launch, this placeholder should be replaced with legal text prepared from verified company facts and reviewed by appropriate legal counsel.",
            "The purpose of this page is structural completeness, not a claim of legal compliance.",
          ],
        },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      pageTitle: "Privacy Policy | Barcelona Private Advisory",
      description: "Portfolio-prototype privacy placeholder explaining the local-only demo state.",
      eyebrow: "Privacy / Prototype",
      intro:
        "This page explains the privacy posture of the current portfolio build: local interface behavior, demo data and no automatic inquiry submission.",
      sections: [
        {
          title: "Local front-end state",
          body: [
            "This build does not include a backend form submission, CRM integration or automatic email delivery.",
            "The inquiry brief is prepared locally in the browser so the visitor can copy it. Nothing is sent automatically from this prototype.",
          ],
        },
        {
          title: "Shortlist storage",
          body: [
            "The private shortlist may use browser localStorage to remember selected demo properties on the same device.",
            "The localStorage key used for this prototype is sc_shortlist_v1.",
          ],
        },
        {
          title: "Contact information",
          body: [
            "The advisory inquiry panel can collect draft contact text inside the current browser session, but this portfolio build does not transmit it to a server.",
            "No automatic email, WhatsApp, calendar booking or CRM record is created by this build.",
          ],
        },
        {
          title: "Demo media and data",
          body: [
            "Listings, advisory signals, districts and media are sample or curated presentation materials for interface demonstration.",
            "They should be replaced with verified source data and reviewed privacy disclosures before any real deployment.",
          ],
        },
        {
          title: "Production privacy policy",
          body: [
            "A production deployment would need a real privacy policy identifying the data controller, purposes, legal bases, retention, recipients and user rights.",
            "This placeholder does not claim full GDPR compliance and should not be used as final privacy documentation.",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookie Policy",
      pageTitle: "Cookie Policy | Barcelona Private Advisory",
      description: "Portfolio-prototype cookie policy placeholder for current storage behavior.",
      eyebrow: "Cookies / Storage",
      intro:
        "This page explains the current prototype behavior around cookies and browser storage, while reserving real consent implementation for production.",
      sections: [
        {
          title: "Current prototype behavior",
          body: [
            "This portfolio build does not intentionally use advertising cookies.",
            "The private shortlist may use browser localStorage so selected demo properties remain available on the same device.",
          ],
        },
        {
          title: "No consent layer in this task",
          body: [
            "Cookie preference management is not implemented in this prototype.",
            "No cookie banner or preference center has been added as part of this placeholder-page task.",
          ],
        },
        {
          title: "Analytics and future services",
          body: [
            "If analytics, advertising pixels, embedded services or marketing cookies are added in production, a real cookie policy and consent layer may be required.",
            "Any production policy should identify cookie categories, purposes, duration, providers and user controls.",
          ],
        },
        {
          title: "Production replacement note",
          body: [
            "This page is a structural placeholder and should be replaced with reviewed cookie documentation based on the final production stack.",
            "It does not claim that a complete consent system currently exists.",
          ],
        },
      ],
    },
    terms: {
      title: "Terms of Use",
      pageTitle: "Terms of Use | Barcelona Private Advisory",
      description: "Portfolio-prototype terms placeholder for demo use and limitations.",
      eyebrow: "Terms / Prototype Use",
      intro:
        "These placeholder terms clarify that the current site is a portfolio prototype and not a real transaction, agency or advisory service.",
      sections: [
        {
          title: "Portfolio prototype",
          body: [
            "This website is presented as a portfolio prototype demonstrating advisory UX, front-end system design and real-estate decision flows.",
            "It is not a live commercial service and does not create a client relationship, agency instruction or advisory mandate.",
          ],
        },
        {
          title: "Illustrative property data",
          body: [
            "Property listings, prices, availability signals, advisory notes and district fit logic are illustrative sample materials.",
            "Media is generated or curated for interface demonstration and should not be treated as a representation of real property availability.",
          ],
        },
        {
          title: "No advice or offer",
          body: [
            "Nothing in this build is legal, financial, investment, tax, relocation or real-estate advice.",
            "No real property offer, negotiation, viewing booking or transaction can be completed through this prototype.",
          ],
        },
        {
          title: "Production commercial terms",
          body: [
            "A production deployment would require verified content, provider details, commercial terms, service scope and reviewed legal documentation.",
            "These placeholder terms should be replaced before any real business use.",
          ],
        },
      ],
    },
    accessibility: {
      title: "Accessibility",
      pageTitle: "Accessibility | Barcelona Private Advisory",
      description: "Portfolio-prototype accessibility placeholder for interface intent and production audit needs.",
      eyebrow: "Accessibility / Interface Intent",
      intro:
        "This page describes accessibility intent for the prototype without claiming that a final accessibility audit or compliance certification has been completed.",
      sections: [
        {
          title: "Interface intent",
          body: [
            "The interface aims for readable contrast, clear hierarchy, keyboard-accessible actions and predictable navigation.",
            "Interactive surfaces are designed to support direct actions such as private search, shortlist opening and inquiry preparation.",
          ],
        },
        {
          title: "Motion and readability",
          body: [
            "The global style layer includes reduced-motion safeguards for visitors who prefer less animation.",
            "Typography, spacing and editorial sections are built for calm scanning rather than dense legal reading.",
          ],
        },
        {
          title: "Known production requirement",
          body: [
            "A final accessibility audit should be completed before production deployment.",
            "That audit should test keyboard flow, focus management, screen-reader output, color contrast, forms, dialogs and responsive behavior.",
          ],
        },
        {
          title: "Contact path",
          body: [
            "This prototype does not provide a real monitored accessibility contact channel.",
            "A production deployment should include verified provider contact details and a process for accessibility feedback.",
          ],
        },
      ],
    },
    demoNotice: {
      title: "Portfolio Demo Notice",
      pageTitle: "Portfolio Demo Notice | Barcelona Private Advisory",
      description: "Portfolio demo notice for Barcelona Private Advisory prototype.",
      eyebrow: "Portfolio / Demo Status",
      intro:
        "This notice makes the demo status explicit: the site demonstrates an advisory interface system, not a live property service.",
      sections: [
        {
          title: "Portfolio prototype by Brenych Studio",
          body: [
            "Barcelona Private Advisory is presented as a portfolio prototype by Brenych Studio.",
            "Its purpose is to demonstrate advisory UX, information architecture, front-end interaction design and premium real-estate product direction.",
          ],
        },
        {
          title: "Sample listings and media",
          body: [
            "Property listings are sample/demo objects and do not represent real availability.",
            "Images are generated or curated for interface demonstration and should not be interpreted as live listing media.",
          ],
        },
        {
          title: "Demo contact details",
          body: [
            "Contact details shown in the footer are demo-only and are not presented as monitored real contact targets.",
            "No messages are sent automatically from this build.",
          ],
        },
        {
          title: "No real transaction",
          body: [
            "No real offer, booking, viewing path, agency service or property transaction is represented by this prototype.",
            "Production deployment would require verified inventory, verified provider details, reviewed legal pages and real inquiry handling.",
          ],
        },
      ],
    },
  },
  es: {
    legal: {
      title: "Aviso legal",
      pageTitle: "Aviso legal | Barcelona Private Advisory",
      description: "Placeholder de aviso legal para el prototipo de portfolio Barcelona Private Advisory.",
      eyebrow: "Legal / Confianza",
      intro:
        "Esta página muestra la estructura de aviso legal que necesitaría una superficie de asesoría en producción, sin inventar datos del prestador ni credenciales de agencia.",
      sections: [
        {
          title: "Información del prestador del servicio",
          body: [
            "Barcelona Private Advisory es un prototipo de portfolio para una interfaz de asesoría inmobiliaria privada. No se presenta aquí como sociedad registrada, mandato de agencia o intermediación licenciada.",
            "En producción, esta página debe sustituirse por información verificada del prestador, identidad corporativa, datos registrales, identificadores fiscales y avisos revisados legalmente.",
          ],
        },
        {
          title: "Estado demo",
          body: [
            "Los datos de propiedades, lenguaje de asesoría, medios y contactos en este build son demostrativos. Sirven solo para evaluación de producto y presentación de portfolio.",
            "La visualización de este prototipo no crea disponibilidad real de inmueble, relación con prestador de servicios ni contratación comercial.",
          ],
        },
        {
          title: "Propiedad intelectual",
          body: [
            "El concepto de interfaz, sistema visual, estructura de copy e implementación front-end se presentan como trabajo de portfolio de Brenych Studio.",
            "El uso en producción requeriría confirmar titularidad, licencias y permisos de marca, medios, datos, textos y software.",
          ],
        },
        {
          title: "Contacto y responsabilidad",
          body: [
            "Este prototipo no ofrece un canal legal o comercial monitorizado. Los contactos demo que aparecen en otras áreas están marcados como demostrativos.",
            "Una implementación de producción debe añadir información verificada de responsabilidad y una vía real de contacto controlada por el prestador.",
          ],
        },
        {
          title: "Nota para producción",
          body: [
            "Antes del lanzamiento, este placeholder debe sustituirse por texto legal preparado a partir de datos verificados de empresa y revisado por asesoría legal.",
            "La finalidad de esta página es completar la estructura, no afirmar cumplimiento legal.",
          ],
        },
      ],
    },
    privacy: {
      title: "Política de privacidad",
      pageTitle: "Política de privacidad | Barcelona Private Advisory",
      description: "Placeholder de privacidad para el prototipo, con estado local y sin envío automático.",
      eyebrow: "Privacidad / Prototipo",
      intro:
        "Esta página explica la postura de privacidad del build actual: comportamiento local de interfaz, datos demo y ausencia de envío automático de solicitudes.",
      sections: [
        {
          title: "Estado front-end local",
          body: [
            "Este build no incluye envío de formularios a backend, integración CRM ni entrega automática de email.",
            "El brief de solicitud se prepara localmente en el navegador para que la persona visitante pueda copiarlo. Nada se envía automáticamente desde este prototipo.",
          ],
        },
        {
          title: "Almacenamiento de shortlist",
          body: [
            "La shortlist privada puede usar localStorage del navegador para recordar propiedades demo seleccionadas en el mismo dispositivo.",
            "La clave de localStorage usada en este prototipo es sc_shortlist_v1.",
          ],
        },
        {
          title: "Información de contacto",
          body: [
            "El panel de solicitud puede recoger texto de contacto en borrador dentro de la sesión actual del navegador, pero este build de portfolio no lo transmite a un servidor.",
            "Este build no crea email automático, WhatsApp, reserva de calendario ni registro CRM.",
          ],
        },
        {
          title: "Datos y medios demo",
          body: [
            "Listings, señales de asesoría, distritos y medios son muestras o materiales curados para demostrar la interfaz.",
            "Deben sustituirse por datos de fuente verificada y disclosures de privacidad revisados antes de cualquier despliegue real.",
          ],
        },
        {
          title: "Política de privacidad en producción",
          body: [
            "Una implementación de producción necesitaría una política real que identifique responsable, finalidades, bases jurídicas, conservación, destinatarios y derechos de usuario.",
            "Este placeholder no afirma cumplimiento completo de GDPR/RGPD y no debe usarse como documentación final de privacidad.",
          ],
        },
      ],
    },
    cookies: {
      title: "Política de cookies",
      pageTitle: "Política de cookies | Barcelona Private Advisory",
      description: "Placeholder de cookies para el comportamiento actual de almacenamiento del prototipo.",
      eyebrow: "Cookies / Almacenamiento",
      intro:
        "Esta página explica el comportamiento actual del prototipo sobre cookies y almacenamiento del navegador, reservando el consentimiento real para producción.",
      sections: [
        {
          title: "Comportamiento actual del prototipo",
          body: [
            "Este build de portfolio no usa intencionadamente cookies publicitarias.",
            "La shortlist privada puede usar localStorage del navegador para mantener propiedades demo seleccionadas en el mismo dispositivo.",
          ],
        },
        {
          title: "Sin capa de consentimiento en esta tarea",
          body: [
            "La gestión de preferencias de cookies no está implementada en este prototipo.",
            "No se ha añadido banner de cookies ni centro de preferencias como parte de esta tarea de páginas placeholder.",
          ],
        },
        {
          title: "Analytics y servicios futuros",
          body: [
            "Si se añaden analytics, píxeles publicitarios, servicios embebidos o cookies de marketing en producción, podría requerirse una política real de cookies y una capa de consentimiento.",
            "Cualquier política de producción debe identificar categorías, finalidades, duración, proveedores y controles de usuario.",
          ],
        },
        {
          title: "Nota para producción",
          body: [
            "Esta página es un placeholder estructural y debe sustituirse por documentación de cookies revisada según el stack final de producción.",
            "No afirma que exista actualmente un sistema completo de consentimiento.",
          ],
        },
      ],
    },
    terms: {
      title: "Condiciones de uso",
      pageTitle: "Condiciones de uso | Barcelona Private Advisory",
      description: "Placeholder de condiciones de uso para el prototipo demo y sus limitaciones.",
      eyebrow: "Condiciones / Uso de prototipo",
      intro:
        "Estas condiciones placeholder aclaran que el sitio actual es un prototipo de portfolio y no un servicio real de transacción, agencia o asesoría.",
      sections: [
        {
          title: "Prototipo de portfolio",
          body: [
            "Este sitio se presenta como prototipo de portfolio para demostrar UX de asesoría, diseño de sistema front-end y flujos de decisión inmobiliaria.",
            "No es un servicio comercial activo y no crea relación de cliente, encargo de agencia ni mandato de asesoría.",
          ],
        },
        {
          title: "Datos inmobiliarios ilustrativos",
          body: [
            "Listings, precios, señales de disponibilidad, notas de asesoría y lógica de encaje de distrito son materiales ilustrativos de muestra.",
            "Los medios son generados o curados para demostración de interfaz y no deben tratarse como representación de disponibilidad real.",
          ],
        },
        {
          title: "Sin asesoramiento ni oferta",
          body: [
            "Nada en este build constituye asesoramiento legal, financiero, fiscal, de inversión, relocalización o inmobiliario.",
            "No se puede completar una oferta real, negociación, reserva de visita o transacción a través de este prototipo.",
          ],
        },
        {
          title: "Condiciones comerciales en producción",
          body: [
            "Una implementación de producción requeriría contenido verificado, datos del prestador, condiciones comerciales, alcance del servicio y documentación legal revisada.",
            "Estas condiciones placeholder deben sustituirse antes de cualquier uso empresarial real.",
          ],
        },
      ],
    },
    accessibility: {
      title: "Accesibilidad",
      pageTitle: "Accesibilidad | Barcelona Private Advisory",
      description: "Placeholder de accesibilidad para intención de interfaz y auditoría antes de producción.",
      eyebrow: "Accesibilidad / Intención de interfaz",
      intro:
        "Esta página describe la intención de accesibilidad del prototipo sin afirmar que exista una auditoría final o certificación de cumplimiento.",
      sections: [
        {
          title: "Intención de interfaz",
          body: [
            "La interfaz busca contraste legible, jerarquía clara, acciones accesibles con teclado y navegación predecible.",
            "Las superficies interactivas están diseñadas para acciones directas como búsqueda privada, apertura de shortlist y preparación de solicitud.",
          ],
        },
        {
          title: "Movimiento y legibilidad",
          body: [
            "La capa global de estilos incluye salvaguardas de movimiento reducido para visitantes que prefieren menos animación.",
            "La tipografía, el espaciado y las secciones editoriales están pensadas para lectura calmada, no para una página legal densa.",
          ],
        },
        {
          title: "Requisito conocido para producción",
          body: [
            "Debe completarse una auditoría final de accesibilidad antes del despliegue en producción.",
            "Esa auditoría debe probar flujo de teclado, gestión de foco, salida de lector de pantalla, contraste, formularios, diálogos y comportamiento responsive.",
          ],
        },
        {
          title: "Vía de contacto",
          body: [
            "Este prototipo no ofrece un canal real y monitorizado para feedback de accesibilidad.",
            "Una implementación de producción debe incluir datos verificados del prestador y un proceso para feedback de accesibilidad.",
          ],
        },
      ],
    },
    demoNotice: {
      title: "Aviso de demo de portfolio",
      pageTitle: "Aviso de demo de portfolio | Barcelona Private Advisory",
      description: "Aviso de demo para el prototipo Barcelona Private Advisory.",
      eyebrow: "Portfolio / Estado demo",
      intro:
        "Este aviso explicita el estado demo: el sitio demuestra un sistema de interfaz de asesoría, no un servicio inmobiliario activo.",
      sections: [
        {
          title: "Prototipo de portfolio por Brenych Studio",
          body: [
            "Barcelona Private Advisory se presenta como prototipo de portfolio por Brenych Studio.",
            "Su finalidad es demostrar UX de asesoría, arquitectura de información, diseño de interacción front-end y dirección de producto inmobiliario premium.",
          ],
        },
        {
          title: "Listings y medios de muestra",
          body: [
            "Las propiedades son objetos de muestra/demo y no representan disponibilidad real.",
            "Las imágenes son generadas o curadas para demostración de interfaz y no deben interpretarse como medios de listings activos.",
          ],
        },
        {
          title: "Contactos demo",
          body: [
            "Los datos de contacto mostrados en el footer son solo demo y no se presentan como canales reales monitorizados.",
            "No se envían mensajes automáticamente desde este build.",
          ],
        },
        {
          title: "Sin transacción real",
          body: [
            "Este prototipo no representa oferta real, reserva, ruta de visita, servicio de agencia ni transacción inmobiliaria.",
            "Un despliegue en producción requeriría inventario verificado, datos verificados del prestador, páginas legales revisadas y gestión real de solicitudes.",
          ],
        },
      ],
    },
  },
};
