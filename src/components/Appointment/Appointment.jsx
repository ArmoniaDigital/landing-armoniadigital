import { AlertTriangle, ArrowLeft, Building2, CalendarDays, CheckCircle2, Send, UserRound, X } from "lucide-react";
import { useState } from "react";
import { findCountry, useCrmLocations } from "../../hooks/useCrmLocations";
import { sendCrmEvent } from "../../services/crm";
import logo from "../Navbar/LOGO-01.png";
import "./Appointment.css";

const fieldGroups = {
  contact: [
    ["firstName", "text", true],
    ["lastName", "text", true],
    ["birthDate", "date", false],
    ["email", "email", true],
    ["phone", "phone", true],
    ["location", "location", false],
    ["address", "text", false],
    ["mapUrl", "maps", false],
    ["contactNotes", "textarea", false],
  ],
  company: [
    ["tradeName", "text", true],
    ["legalName", "text", false],
    ["companyEmail", "email", false],
    ["companyPhone", "phone", false],
    ["website", "website", false],
    ["location", "location", false],
    ["companyAddress", "text", false],
    ["companyMapUrl", "maps", false],
    ["companyNotes", "textarea", false],
  ],
};

function AppointmentField({ copy, name, type, required }) {
  const today = new Date().toISOString().split("T")[0];
  const emailPattern = "[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}";
  const websitePattern = "^(https?:\\/\\/)?([^\\s@]+\\.)+[^\\s@]{2,}.*$";
  const mapsPattern = "^https?:\\/\\/((www\\.)?google\\.[^\\s]+\\/maps|maps\\.google\\.[^\\s]+|maps\\.app\\.goo\\.gl|goo\\.gl\\/maps).*$";

  if (type === "textarea") {
    return (
      <label className="appointment-field appointment-field-wide">
        <span>{copy.fields[name]}</span>
        <textarea name={name} rows="4" required={required} />
      </label>
    );
  }

  if (type === "website" || type === "maps") {
    return (
      <label className="appointment-field">
        <span>{copy.fields[name]}</span>
        <input
          name={name}
          type="text"
          inputMode="url"
          required={required}
          pattern={type === "website" ? websitePattern : mapsPattern}
          title={type === "website" ? "Escribe un dominio valido, por ejemplo armoniadigital.digital" : "Pega una URL valida de Google Maps"}
          placeholder={type === "website" ? "empresa.com" : "https://maps.app.goo.gl/..."}
        />
      </label>
    );
  }

  return (
    <label className="appointment-field">
      <span>{copy.fields[name]}</span>
      <input
        name={name}
        type={type}
        required={required}
        pattern={type === "email" ? emailPattern : undefined}
        title={type === "email" ? "Escribe un correo valido, por ejemplo nombre@dominio.com" : undefined}
        min={name === "birthDate" ? "1900-01-01" : undefined}
        max={name === "birthDate" ? today : undefined}
      />
    </label>
  );
}

function normalizePhoneCode(code) {
  const value = String(code || "").trim();

  if (!value) {
    return "";
  }

  return value.startsWith("+") ? value : `+${value}`;
}

function buildPhoneValue(code, number) {
  const localNumber = String(number || "").trim();

  if (!localNumber) {
    return "";
  }

  if (localNumber.startsWith("+")) {
    return localNumber;
  }

  const phoneCode = normalizePhoneCode(code);

  return phoneCode ? `${phoneCode} ${localNumber}` : localNumber;
}

function normalizeWebsiteUrl(value) {
  const url = String(value || "").trim();

  if (!url) {
    return "";
  }

  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function AppointmentPhoneField({ copy, countries, name, phone, setPhone, required }) {
  const fullPhone = buildPhoneValue(phone.code, phone.number);

  return (
    <label className="appointment-field">
      <span>{copy.fields[name]}</span>
      <input type="hidden" name={name} value={fullPhone} />
      <div className="appointment-phone-control">
        <select
          value={phone.code}
          onChange={(event) => setPhone((current) => ({ ...current, code: event.target.value }))}
          aria-label="Codigo de pais"
          required={required}
        >
          <option value="">Codigo</option>
          {countries
            .filter((country) => country.phoneCode)
            .map((country) => {
              const phoneCode = normalizePhoneCode(country.phoneCode);

              return (
                <option key={`${country.name}-${phoneCode}`} value={phoneCode}>
                  {phoneCode} {country.name}
                </option>
              );
            })}
        </select>
        <input
          name={`${name}_local`}
          type="tel"
          value={phone.number}
          onChange={(event) => setPhone((current) => ({ ...current, number: event.target.value }))}
          placeholder="Numero"
          required={required}
        />
      </div>
    </label>
  );
}

function AppointmentLocationFields({ copy, countries, location, setLocation, prefix = "", onCountryChange }) {
  const selectedCountry = findCountry(countries, location.country);
  const states = selectedCountry?.states || [];
  const selectedState = states.find((state) => state.name === location.state);
  const cities = selectedState?.cities || [];
  const hasStateOptions = states.length > 0;
  const hasCityOptions = cities.length > 0;

  return (
    <>
      <label className="appointment-field">
        <span>{copy.fields.country}</span>
        <select
          name={`${prefix}country`}
          value={location.country}
          onChange={(event) => {
            const country = event.target.value;

            setLocation({ country, state: "", city: "" });
            onCountryChange?.(normalizePhoneCode(findCountry(countries, country)?.phoneCode));
          }}
        >
          <option value="" disabled>{copy.placeholders.select}</option>
          {countries.map((country) => (
            <option key={country.name} value={country.name}>{country.name}</option>
          ))}
        </select>
      </label>

      <label className="appointment-field">
        <span>{copy.fields.state}</span>
        {hasStateOptions ? (
          <select
            name={`${prefix}state`}
            value={location.state}
            onChange={(event) => setLocation((current) => ({ ...current, state: event.target.value, city: "" }))}
            disabled={!location.country}
          >
            <option value="" disabled>{copy.placeholders.select}</option>
            {states.map((state) => (
              <option key={state.name} value={state.name}>{state.name}</option>
            ))}
          </select>
        ) : (
          <input
            name={`${prefix}state`}
            value={location.state}
            onChange={(event) => setLocation((current) => ({ ...current, state: event.target.value, city: "" }))}
            disabled={!location.country}
          />
        )}
      </label>

      <label className="appointment-field">
        <span>{copy.fields.city}</span>
        {hasCityOptions ? (
          <select
            name={`${prefix}city`}
            value={location.city}
            onChange={(event) => setLocation((current) => ({ ...current, city: event.target.value }))}
            disabled={!location.state}
          >
            <option value="" disabled>{copy.placeholders.select}</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        ) : (
          <input
            name={`${prefix}city`}
            value={location.city}
            onChange={(event) => setLocation((current) => ({ ...current, city: event.target.value }))}
            disabled={!location.country}
          />
        )}
      </label>
    </>
  );
}

export default function Appointment({ copy }) {
  const [status, setStatus] = useState("idle");
  const [companySameAsContact, setCompanySameAsContact] = useState(false);
  const [contactLocation, setContactLocation] = useState({ country: "", state: "", city: "" });
  const [companyLocation, setCompanyLocation] = useState({ country: "", state: "", city: "" });
  const [contactPhoneData, setContactPhoneData] = useState({ code: "", number: "" });
  const [companyPhoneData, setCompanyPhoneData] = useState({ code: "", number: "" });
  const { countries } = useCrmLocations();
  const calendlyUrl = import.meta.env.VITE_CALENDLY_URL || copy.calendlyFallback;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("sending");

    const formData = new FormData(event.currentTarget);
    const firstName = formData.get("firstName") || "";
    const lastName = formData.get("lastName") || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const contactEmail = formData.get("email") || "";
    const contactPhone = formData.get("phone") || "";
    const contactCountry = formData.get("country") || "";
    const contactState = formData.get("state") || "";
    const contactCity = formData.get("city") || "";
    const contactAddress = formData.get("address") || "";
    const companyName = companySameAsContact ? fullName : formData.get("tradeName") || "";
    const companyPhone = companySameAsContact ? contactPhone : formData.get("companyPhone") || "";
    const companyCountry = companySameAsContact ? contactCountry : formData.get("company_country") || "";
    const companyState = companySameAsContact ? contactState : formData.get("company_state") || "";
    const companyCity = companySameAsContact ? contactCity : formData.get("company_city") || "";
    const companyAddress = companySameAsContact ? contactAddress : formData.get("companyAddress") || "";
    const contactMapUrl = formData.get("mapUrl") || "";
    const companyMapUrl = companySameAsContact ? contactMapUrl : formData.get("companyMapUrl") || "";

    const payload = {
      source: "agenda_call_pre_calendly",
      intent: "Agendar llamada",
      createdAt: new Date().toISOString(),
      calendlyUrl,
      contact: {
        firstName,
        lastName,
        birthDate: formData.get("birthDate") || "",
        email: contactEmail,
        phone: contactPhone,
        country: contactCountry,
        state: contactState,
        city: contactCity,
        address: contactAddress,
        mapUrl: contactMapUrl,
        notes: formData.get("contactNotes") || "",
      },
      company: {
        name: companyName,
        legalName: companySameAsContact ? fullName : formData.get("legalName") || "",
        email: companySameAsContact ? contactEmail : formData.get("companyEmail") || "",
        phone: companyPhone,
        website: companySameAsContact ? "" : normalizeWebsiteUrl(formData.get("website")),
        country: companyCountry,
        state: companyState,
        city: companyCity,
        address: companyAddress,
        mapUrl: companyMapUrl,
        notes: companySameAsContact ? "" : formData.get("companyNotes") || "",
        sameAsContact: companySameAsContact,
      },
    };

    try {
      await sendCrmEvent("appointment_requested", payload);

      setStatus("done");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <main className="appointment-page">
      <div className="appointment-shell">
        <header className="appointment-brandbar">
          <a className="appointment-brand" href="#inicio" aria-label="Armonia Digital">
            <img src={logo} alt="Armonia Digital" />
          </a>

          <a className="appointment-back" href="#inicio">
            <ArrowLeft size={18} />
            {copy.back}
          </a>
        </header>

        <section className="appointment-hero">
          <div>
            <span className="appointment-kicker">{copy.kicker}</span>
            <h1>{copy.title}</h1>
            <p>{copy.subtitle}</p>
          </div>
          <aside className="appointment-next-card">
            <CalendarDays size={26} />
            <strong>{copy.nextTitle}</strong>
            <p>{copy.nextText}</p>
          </aside>
        </section>

        <form className="appointment-layout" onSubmit={handleSubmit}>
          <section className="appointment-panel">
            <div className="appointment-panel-title">
              <UserRound size={22} />
              <h2>{copy.contactTitle}</h2>
            </div>
            <div className="appointment-fields">
              {fieldGroups.contact.map(([name, type, required]) => (
                type === "location" ? (
                  <AppointmentLocationFields
                    key={name}
                    copy={copy}
                    countries={countries}
                    location={contactLocation}
                    setLocation={setContactLocation}
                    onCountryChange={(phoneCode) => {
                      if (phoneCode) {
                        setContactPhoneData((current) => ({ ...current, code: phoneCode }));
                      }
                    }}
                  />
                ) : type === "phone" ? (
                  <AppointmentPhoneField
                    key={name}
                    copy={copy}
                    countries={countries}
                    name={name}
                    phone={contactPhoneData}
                    setPhone={setContactPhoneData}
                    required={required}
                  />
                ) : (
                  <AppointmentField key={name} copy={copy} name={name} type={type} required={required} />
                )
              ))}
            </div>
          </section>

          <section className="appointment-panel">
            <div className="appointment-panel-title">
              <Building2 size={22} />
              <h2>{copy.companyTitle}</h2>
            </div>
            <label className="appointment-inline-option appointment-field-wide">
              <input
                type="checkbox"
                checked={companySameAsContact}
                onChange={(event) => setCompanySameAsContact(event.target.checked)}
              />
              <span>Igual que el contacto</span>
              <small>Usaremos nombre, correo, telefono y direccion del contacto.</small>
            </label>
            {!companySameAsContact && (
              <div className="appointment-fields">
                {fieldGroups.company.map(([name, type, required]) => (
                    type === "location" ? (
                      <AppointmentLocationFields
                        key={name}
                        copy={copy}
                        countries={countries}
                        location={companyLocation}
                        setLocation={setCompanyLocation}
                        prefix="company_"
                        onCountryChange={(phoneCode) => {
                          if (phoneCode) {
                            setCompanyPhoneData((current) => ({ ...current, code: phoneCode }));
                          }
                        }}
                      />
                    ) : type === "phone" ? (
                      <AppointmentPhoneField
                        key={name}
                        copy={copy}
                        countries={countries}
                        name={name}
                        phone={companyPhoneData}
                        setPhone={setCompanyPhoneData}
                        required={required}
                      />
                    ) : (
                      <AppointmentField key={name} copy={copy} name={name} type={type} required={required} />
                    )
                  ))}
              </div>
            )}
          </section>

          <aside className="appointment-submit-card">
            <span>{copy.crmNoteTitle}</span>
            <p>{copy.crmNoteText}</p>
            <button type="submit" disabled={status === "sending"}>
              <Send size={18} />
              {status === "sending" ? copy.sending : copy.submit}
            </button>
          </aside>
        </form>

        {(status === "done" || status === "error") && (
          <div className="appointment-modal-backdrop" role="dialog" aria-modal="true">
            <div className="appointment-modal-card">
              <button
                type="button"
                className="appointment-modal-close"
                aria-label="Cerrar mensaje"
                onClick={() => setStatus("idle")}
              >
                <X size={18} />
              </button>
              <div className={`appointment-modal-icon ${status}`}>
                {status === "done" ? <CheckCircle2 size={34} /> : <AlertTriangle size={34} />}
              </div>
              <h2>{status === "done" ? copy.done : "No pudimos completar el envio."}</h2>
              <p>
                {status === "done"
                  ? "Ahora puedes escoger el horario que mejor se ajuste a ti."
                  : copy.error}
              </p>
              {status === "done" ? (
                <a className="appointment-modal-action" href={calendlyUrl}>
                  Continuar a Calendly
                </a>
              ) : (
                <button type="button" className="appointment-modal-action" onClick={() => setStatus("idle")}>
                  Intentar de nuevo
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
