import { useMemo, useState } from "react";

type Lang = "en" | "es";

const WA_PHONE = "34600000000"; // TODO: replace (no +)

function enc(s: string) {
  return encodeURIComponent(s);
}

const ui = (lang: Lang) => {
  const en = {
    request: "REQUEST",
    demo: "Demo automation: copy / email draft / WhatsApp draft.",
    copy: "Copy details",
    email: "Email draft",
    wa: "WhatsApp draft",
    saved: "Saved (demo). Use Email/WhatsApp draft or copy details.",
    name: "Name",
    emailPh: "Email",
    districts: "Preferred districts (e.g., Eixample, Gràcia)",
    notes: "Notes (constraints, light preference, renovation tolerance, etc.)",
    type: {
      Buying: "Buying",
      Investment: "Investment",
      Relocation: "Relocation",
      "Shortlist request": "Shortlist request",
      Partnership: "Partnership",
    },
    budget: { Any: "Any" },
    timeline: {
      Any: "Any",
      "2–4 weeks": "2–4 weeks",
      "1–2 months": "1–2 months",
      "3–6 months": "3–6 months",
      "6+ months": "6+ months",
    },
    subject: "Barcelona Advisory",
  };

  const es = {
    request: "SOLICITUD",
    demo: "Automatización demo: copiar / borrador email / borrador WhatsApp.",
    copy: "Copiar datos",
    email: "Borrador email",
    wa: "Borrador WhatsApp",
    saved: "Guardado (demo). Usa borrador de email/WhatsApp o copia los datos.",
    name: "Nombre",
    emailPh: "Correo",
    districts: "Distritos preferidos (p. ej., Eixample, Gràcia)",
    notes: "Notas (criterios, luz, tolerancia a reforma, etc.)",
    type: {
      Buying: "Compra",
      Investment: "Inversión",
      Relocation: "Reubicación",
      "Shortlist request": "Solicitud de selección",
      Partnership: "Colaboración",
    },
    budget: { Any: "Cualquiera" },
    timeline: {
      Any: "Cualquiera",
      "2–4 weeks": "2–4 semanas",
      "1–2 months": "1–2 meses",
      "3–6 months": "3–6 meses",
      "6+ months": "6+ meses",
    },
    subject: "Barcelona Advisory",
  };

  return lang === "es" ? es : en;
};

export default function ContactForm({ lang = "en" }: { lang?: Lang }) {
  const L = ui(lang);

  const [type, setType] = useState<keyof typeof L.type>("Buying");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [districts, setDistricts] = useState("");
  const [budget, setBudget] = useState(lang === "es" ? "Cualquiera" : "Any");
  const [timeline, setTimeline] = useState(lang === "es" ? "Cualquiera" : "Any");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const summary = useMemo(() => {
    const lines = [
      `Type: ${L.type[type]}`,
      `Name: ${name || "-"}`,
      `Email: ${email || "-"}`,
      `Preferred districts: ${districts || "-"}`,
      `Budget: ${budget}`,
      `Timeline: ${timeline}`,
      `Message: ${message || "-"}`,
    ];
    return lines.join("\n");
  }, [L.type, type, name, email, districts, budget, timeline, message]);

  const mailtoHref = useMemo(() => {
    const subject = `${L.subject} — ${L.type[type]}`;
    const body = summary;
    return `mailto:advisory@example.com?subject=${enc(subject)}&body=${enc(body)}`;
  }, [summary, type, L.subject, L.type]);

  const whatsappHref = useMemo(() => {
    return `https://wa.me/${WA_PHONE}?text=${enc(`Barcelona Advisory inquiry\n\n${summary}`)}`;
  }, [summary]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setSent(true);
      window.setTimeout(() => setSent(false), 1800);
    } catch {
      window.prompt("Copy this text:", summary);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    window.setTimeout(() => setSent(false), 2200);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="text-[12px] tracking-[0.18em] text-black/50">{L.request}</div>

      <div className="grid gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="h-10 rounded-2xl border border-black/10 bg-white px-3 text-[12px] text-black/70 outline-none"
          >
            {Object.keys(L.type).map((k) => (
              <option key={k} value={k}>
                {L.type[k as keyof typeof L.type]}
              </option>
            ))}
          </select>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={L.name}
            className="h-10 rounded-2xl border border-black/10 bg-white px-3 text-[12px] text-black/70 outline-none placeholder:text-black/30"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={L.emailPh}
            className="h-10 rounded-2xl border border-black/10 bg-white px-3 text-[12px] text-black/70 outline-none placeholder:text-black/30"
          />

          <input
            value={districts}
            onChange={(e) => setDistricts(e.target.value)}
            placeholder={L.districts}
            className="h-10 rounded-2xl border border-black/10 bg-white px-3 text-[12px] text-black/70 outline-none placeholder:text-black/30"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="h-10 rounded-2xl border border-black/10 bg-white px-3 text-[12px] text-black/70 outline-none"
          >
            <option>{lang === "es" ? "Cualquiera" : "Any"}</option>
            <option>≤ €450k</option>
            <option>≤ €650k</option>
            <option>≤ €900k</option>
            <option>≤ €1.3M</option>
            <option>≤ €2.5M</option>
          </select>

          <select
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="h-10 rounded-2xl border border-black/10 bg-white px-3 text-[12px] text-black/70 outline-none"
          >
            {Object.values(L.timeline).map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={L.notes}
          className="min-h-[140px] w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-[12px] text-black/70 outline-none placeholder:text-black/30"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[12px] text-black/50">{L.demo}</div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copy}
            className="rounded-full border border-black/10 px-4 py-2 text-[12px] text-black/70 hover:border-black/20 hover:text-black"
          >
            {L.copy}
          </button>

          <a
            href={mailtoHref}
            className="rounded-full border border-black/10 px-4 py-2 text-[12px] text-black/70 hover:border-black/20 hover:text-black"
          >
            {L.email}
          </a>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-black/25 bg-white px-4 py-2 text-[12px] hover:border-black/35"
          >
            {L.wa}
          </a>
        </div>
      </div>

      {sent && (
        <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-[12px] text-black/60">
          {L.saved}
        </div>
      )}
    </form>
  );
}
