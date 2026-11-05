import { ArrowLeft, Building2, Check, CreditCard, Lock, ReceiptText, ShieldCheck, UserRound } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { findCountry, useCrmLocations } from "../../hooks/useCrmLocations";
import { validateCrmPromotion } from "../../services/crm";
import { createLeadSender } from "../../services/lead-sender.mjs";
import logo from "../Navbar/LOGO-01.png";

const EMAIL_PATTERN = "[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}";

// Acceso al portal de clientes del CRM (las cuentas se habilitan tras confirmar el pago).
const PORTAL_ACCESS_URL = "https://crm.readyin72.com/portal/armonia-digital/acceso";

function parseUsd(value) {
  const amount = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

function formatUsd(value) {
  return `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: Number(value || 0) % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function shouldShowExchangeNote(country) {
  const normalized = String(country || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return Boolean(normalized) && !["venezuela", "estados unidos", "united states", "usa"].includes(normalized);
}

function normalizePhoneCode(code) {
  const value = String(code || "").trim();
  if (!value) return "";
  return value.startsWith("+") ? value : `+${value}`;
}

function buildPhoneValue(code, number) {
  const localNumber = String(number || "").trim();
  if (!localNumber) return "";
  if (localNumber.startsWith("+")) return localNumber;
  const phoneCode = normalizePhoneCode(code);
  return phoneCode ? `${phoneCode} ${localNumber}` : localNumber;
}

function normalizeWebsiteUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

// Links de pago Bold por plan (opcionales). Se configuran en .env.local:
// VITE_BOLD_LINK_LAUNCH / VITE_BOLD_LINK_BUSINESS / VITE_BOLD_LINK_STORE.
// Si no existe link, la solicitud queda registrada en el CRM y el equipo
// coordina el pago con el cliente.
const boldLinks = {
  launch: (import.meta.env.VITE_BOLD_LINK_LAUNCH || "").trim(),
  business: (import.meta.env.VITE_BOLD_LINK_BUSINESS || "").trim(),
  store: (import.meta.env.VITE_BOLD_LINK_STORE || "").trim(),
};

function boldLinkFor(planName) {
  const key = String(planName || "").trim().toLowerCase();
  return boldLinks[key] || "";
}

// Mismo canal que usa la landing para leads: contrato vigente del CRM Next.js.
const sendLead = createLeadSender({
  endpoint: "https://crm-readyin72.vercel.app/api/landing/events",
  brand: "armonia-digital",
});

function Field({ name, type, required, label, placeholders, prefix = "", value, onChange }) {
  const inputName = `${prefix}${name}`;
  const websitePattern = "^(https?:\\/\\/)?([^\\s@]+\\.)+[^\\s@]{2,}.*$";

  if (type === "website") {
    return (
      <label className="checkout-field">
        <span>{label}</span>
        <input
          name={inputName}
          type="text"
          inputMode="url"
          required={required}
          pattern={websitePattern}
          value={value !== undefined ? value : undefined}
          onChange={onChange}
          title="Escribe un dominio válido, por ejemplo armoniadigital.digital"
          placeholder="empresa.com"
        />
      </label>
    );
  }

  return (
    <label className="checkout-field">
      <span>{label}</span>
      <input
        name={inputName}
        type={type}
        required={required}
        pattern={type === "email" ? EMAIL_PATTERN : undefined}
        value={value !== undefined ? value : undefined}
        onChange={onChange}
        title={type === "email" ? "Escribe un correo válido, por ejemplo nombre@dominio.com" : undefined}
      />
    </label>
  );
}

function PhoneField({ countries, label, name, phone, setPhone, prefix = "", required = false }) {
  const inputName = `${prefix}${name}`;
  const fullPhone = buildPhoneValue(phone.code, phone.number);

  return (
    <label className="checkout-field">
      <span>{label}</span>
      <input type="hidden" name={inputName} value={fullPhone} />
      <div className="checkout-phone-control">
        <select
          value={phone.code}
          onChange={(event) => setPhone((current) => ({ ...current, code: event.target.value }))}
          aria-label="Código de país"
          required={required}
        >
          <option value="">Código</option>
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
          name={`${inputName}_local`}
          type="tel"
          value={phone.number}
          onChange={(event) => setPhone((current) => ({ ...current, number: event.target.value }))}
          placeholder="Número"
          pattern="[+0-9 ()-]{7,20}"
          title="Escribe entre 7 y 15 dígitos, con o sin espacios."
          required={required}
        />
      </div>
    </label>
  );
}

function LocationFields({ copy, countries, location, setLocation, prefix = "", onCountryChange }) {
  const selectedCountry = findCountry(countries, location.country);
  const states = selectedCountry?.states || [];
  const selectedState = states.find((state) => state.name === location.state);
  const cities = selectedState?.cities || [];
  const hasStateOptions = states.length > 0;
  const hasCityOptions = cities.length > 0;

  const updateCountry = (country) => {
    setLocation({ country, state: "", city: "" });
    onCountryChange?.(normalizePhoneCode(findCountry(countries, country)?.phoneCode));
  };

  const updateState = (state) => {
    setLocation((current) => ({ ...current, state, city: "" }));
  };

  const updateCity = (city) => {
    setLocation((current) => ({ ...current, city }));
  };

  return (
    <>
      <label className="checkout-field">
        <span>{copy.fields.country || "País"}</span>
        <select
          name={`${prefix}country`}
          value={location.country}
          onChange={(event) => updateCountry(event.target.value)}
          required
        >
          <option value="" disabled>{copy.placeholders?.select || "Seleccionar"}</option>
          {countries.map((country) => (
            <option key={country.name} value={country.name}>{country.name}</option>
          ))}
        </select>
      </label>

      <label className="checkout-field">
        <span>{copy.fields.state || "Estado / Departamento"}</span>
        {hasStateOptions ? (
          <select
            name={`${prefix}state`}
            value={location.state}
            onChange={(event) => updateState(event.target.value)}
            disabled={!location.country}
            required
          >
            <option value="" disabled>{copy.placeholders?.select || "Seleccionar"}</option>
            {states.map((state) => (
              <option key={state.name} value={state.name}>{state.name}</option>
            ))}
          </select>
        ) : (
          <input
            name={`${prefix}state`}
            value={location.state}
            onChange={(event) => updateState(event.target.value)}
            disabled={!location.country}
            required
          />
        )}
      </label>

      <label className="checkout-field">
        <span>{copy.fields.city || "Ciudad"}</span>
        {hasCityOptions ? (
          <select
            name={`${prefix}city`}
            value={location.city}
            onChange={(event) => updateCity(event.target.value)}
            disabled={!location.state}
            required
          >
            <option value="" disabled>{copy.placeholders?.select || "Seleccionar"}</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        ) : (
          <input
            name={`${prefix}city`}
            value={location.city}
            onChange={(event) => updateCity(event.target.value)}
            disabled={!location.country}
            required
          />
        )}
      </label>
    </>
  );
}

export default function Checkout({ copy, plans, selectedPlan, contactHref }) {
  const initialPlan = plans.find((plan) => plan.name === selectedPlan)?.name || plans[0]?.name || "";
  const detailsFormRef = useRef(null);

  // Pasos: 1 = servicio, 2 = datos/cuenta, 3 = revisión/pago
  const [step, setStep] = useState(1);
  const [planName, setPlanName] = useState(initialPlan);
  const [detailsStatus, setDetailsStatus] = useState("idle");

  // Contacto & Facturación
  const [useContactForBilling, setUseContactForBilling] = useState(true);
  const [contactLocation, setContactLocation] = useState({ country: "", state: "", city: "" });
  const [companyLocation, setCompanyLocation] = useState({ country: "", state: "", city: "" });
  const [contactPhone, setContactPhone] = useState({ code: "", number: "" });
  const [companyPhoneData, setCompanyPhoneData] = useState({ code: "", number: "" });

  // Privacidad
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);

  // Promo & Orden
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState(null);
  const [promoStatus, setPromoStatus] = useState({ state: "idle", message: "" });
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [leadRegistered, setLeadRegistered] = useState(null);

  const [customerData, setCustomerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    tradeName: "",
    legalName: "",
    taxId: "",
    companyEmail: "",
    address: "",
    companyAddress: "",
    website: "",
  });

  const [orderData, setOrderData] = useState(null);
  const { countries } = useCrmLocations();

  const selected = useMemo(
    () => plans.find((plan) => plan.name === planName) || plans[0],
    [planName, plans]
  );
  const selectedPrice = parseUsd(selected?.price);
  const payableAmount = promoResult?.amounts?.total ?? selectedPrice;

  const clearPromotion = () => {
    setPromoResult(null);
    setPromoStatus({ state: "idle", message: "" });
  };

  const handleApplyPromotion = async () => {
    const code = promoCode.trim();
    if (!code) {
      setPromoStatus({ state: "error", message: "Escribe un código promocional." });
      return;
    }

    setPromoStatus({ state: "loading", message: "Validando código..." });

    try {
      const result = await validateCrmPromotion({
        code,
        price: selected?.price || "",
        selectedPlan: selected?.name || planName,
        contact: { email: customerData.email, phone: buildPhoneValue(contactPhone.code, contactPhone.number) },
      });

      if (result?.skipped) {
        setPromoResult(null);
        setPromoStatus({
          state: "error",
          message: "Los códigos promocionales no están disponibles en este momento.",
        });
        return;
      }

      setPromoResult(result);
      setPromoCode(result.promotion?.code || code.toUpperCase());
      setPromoStatus({
        state: "success",
        message: `Código aplicado: ${result.promotion?.discountPercent || 0}% de descuento.`,
      });
    } catch (error) {
      setPromoResult(null);
      setPromoStatus({ state: "error", message: error.message || "No pudimos aplicar este código." });
    }
  };

  const promotionPayload = promoResult
    ? {
        id: promoResult.promotion?.id,
        code: promoResult.promotion?.code,
        name: promoResult.promotion?.name,
        discountPercent: promoResult.promotion?.discountPercent,
        originalPrice: promoResult.amounts?.original,
        discountUsd: promoResult.amounts?.discount,
        finalPrice: promoResult.amounts?.total,
      }
    : null;

  // Paso 1 -> Paso 2
  const handleServiceNext = (e) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Paso 2 -> Paso 3 (Validación e intencionalidad)
  const handleDataSubmit = async (e) => {
    e.preventDefault();

    if (!privacyAccepted) {
      alert("Debes aceptar la política de privacidad para continuar.");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    const email = formData.get("email") || customerData.email;
    const firstName = formData.get("firstName") || customerData.firstName;
    const lastName = formData.get("lastName") || customerData.lastName;
    const fullName = `${firstName} ${lastName}`.trim();

    const tradeName = useContactForBilling ? fullName : formData.get("company_tradeName") || "";
    const legalName = useContactForBilling ? fullName : formData.get("company_legalName") || "";
    const taxId = useContactForBilling ? "" : formData.get("company_taxId") || "";

    const phone = buildPhoneValue(contactPhone.code, contactPhone.number);
    const companyPhone = useContactForBilling
      ? phone
      : buildPhoneValue(companyPhoneData.code, companyPhoneData.number);

    const compiledData = {
      firstName,
      lastName,
      email,
      phone,
      tradeName,
      legalName,
      taxId,
      companyEmail: useContactForBilling ? email : formData.get("company_companyEmail") || "",
      companyPhone,
      contactCountry: contactLocation.country,
      contactState: contactLocation.state,
      contactCity: contactLocation.city,
      address: formData.get("company_address") || "",
      companyCountry: useContactForBilling ? contactLocation.country : companyLocation.country,
      companyState: useContactForBilling ? contactLocation.state : companyLocation.state,
      companyCity: useContactForBilling ? contactLocation.city : companyLocation.city,
      companyAddress: useContactForBilling ? "" : formData.get("company_address") || "",
      privacyAccepted,
      privacyAcceptedAt: new Date().toISOString(),
      marketingAccepted,
    };

    if (String(firstName || "").replace(/\s/g, "").length < 3) {
      alert("Escribe tu nombre completo (mínimo 3 caracteres).");
      return;
    }

    if (!new RegExp(`^${EMAIL_PATTERN}$`).test(String(email || "").trim())) {
      alert("Escribe un correo válido, por ejemplo nombre@dominio.com.");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");

    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      alert("Escribe un teléfono válido de 7 a 15 dígitos.");
      return;
    }

    if (String(tradeName || "").replace(/\s/g, "").length < 3) {
      alert("Escribe el nombre comercial o de la persona que factura (mínimo 3 caracteres).");
      return;
    }

    setCustomerData(compiledData);

    const contractContact = {
      firstName,
      lastName,
      email,
      phone,
    };

    setDetailsStatus("sending");

    try {
      await sendLead("checkout_started", {
        contact: contractContact,
        company: { name: tradeName },
        selectedPlan: selected?.name || planName,
      });
    } catch {
      // El registro del lead no debe bloquear el avance del checkout.
    } finally {
      setDetailsStatus("idle");
    }

    setOrderData({
      ...compiledData,
      planName: selected?.name || planName,
      price: formatUsd(payableAmount),
      amount: payableAmount,
      originalPrice: selected?.price || "",
      promotion: promotionPayload,
    });

    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Paso 3 -> Procesamiento de pago / Coordinación
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentStatus("sending");

    const boldLink = boldLinkFor(orderData?.planName || selected?.name || planName);

    // El navegador solo permite abrir la pestaña dentro del gesto del usuario.
    // Se abre antes de esperar la red para que no la bloquee el navegador.
    if (boldLink) {
      window.open(boldLink, "_blank", "noopener,noreferrer");
    }

    try {
      await sendLead("checkout_payment_requested", {
        contact: {
          firstName: orderData?.firstName,
          lastName: orderData?.lastName,
          email: orderData?.email,
          phone: orderData?.phone,
        },
        company: { name: orderData?.tradeName },
        selectedPlan: orderData?.planName || selected?.name,
      });
      setLeadRegistered(true);
    } catch {
      // El registro del lead no debe bloquear el flujo de pago,
      // pero tampoco podemos afirmar que quedó registrado.
      setLeadRegistered(false);
    }

    if (boldLink) {
      setPaymentStatus("redirected");
      return;
    }

    // Sin link de Bold configurado: el equipo coordina el pago con el cliente.
    setPaymentStatus("success_coordinated");
  };

  return (
    <main className="checkout-page">
      <div className="checkout-shell">
        <header className="checkout-brandbar">
          <a className="checkout-brand" href="#inicio" aria-label="Armonía Digital">
            <img src={logo} alt="Armonía Digital" />
          </a>
          <a className="checkout-back" href="#precios">
            <ArrowLeft size={18} />
            {copy?.back || "Volver a la web"}
          </a>
        </header>

        {/* Indicador de 3 Pasos */}
        <section className="checkout-hero">
          <div>
            <span className="checkout-kicker">{copy?.kicker || "Proceso de contratación"}</span>
            <h1>
              {step === 1
                ? "Paso 1: Elige tu servicio"
                : step === 2
                ? "Paso 2: Tus datos y cuenta"
                : "Paso 3: Revisa y confirma el pago"}
            </h1>
            <p>
              {step === 1
                ? "Revisa la cobertura, periodicidad y condiciones de tu servicio."
                : step === 2
                ? "Crea tu cuenta o inicia sesión para gestionar tu proyecto de forma segura."
                : "Confirma los datos de tu orden y elige la forma de pago."}
            </p>
          </div>

          <aside className="checkout-plan-summary">
            <span>Servicio seleccionado</span>
            <strong>{selected?.name}</strong>
            <p>{selected?.description}</p>
            <b>
              {selected?.price} <small>USD</small>
            </b>
          </aside>
        </section>

        <div className="checkout-steps" aria-label="Pasos del checkout">
          <div className={`checkout-step ${step === 1 ? "active" : step > 1 ? "done" : ""}`}>
            <span>01</span>
            <strong>1. Servicio</strong>
          </div>
          <div className={`checkout-step ${step === 2 ? "active" : step > 2 ? "done" : ""}`}>
            <span>02</span>
            <strong>2. Datos y Cuenta</strong>
          </div>
          <div className={`checkout-step ${step === 3 ? "active" : ""}`}>
            <span>03</span>
            <strong>3. Revisión y Pago</strong>
          </div>
        </div>

        {/* PASO 1: SERVICIO */}
        {step === 1 && (
          <form className="checkout-layout" onSubmit={handleServiceNext}>
            <div className="checkout-form">
              <section className="checkout-panel">
                <div className="checkout-panel-title">
                  <CreditCard size={22} />
                  <h2>Selecciona o cambia tu plan</h2>
                </div>

                <label className="checkout-field checkout-field-wide">
                  <span>Plan de desarrollo web</span>
                  <select
                    value={planName}
                    onChange={(e) => {
                      setPlanName(e.target.value);
                      clearPromotion();
                    }}
                  >
                    {plans.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name} — {p.price} USD
                      </option>
                    ))}
                  </select>
                </label>

                <div className="checkout-plan-features">
                  <h3>Incluye:</h3>
                  <ul>
                    {selected?.features?.map((f) => (
                      <li key={f}>
                        <Check size={16} /> <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="checkout-promo-box">
                  <label className="checkout-field checkout-field-wide">
                    <span>Código promocional</span>
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          clearPromotion();
                        }}
                        placeholder="Ejemplo: PROMO10"
                      />
                      <button
                        type="button"
                        className="checkout-secondary-action"
                        onClick={handleApplyPromotion}
                        disabled={promoStatus.state === "loading"}
                      >
                        {promoStatus.state === "loading" ? "Validando..." : "Aplicar"}
                      </button>
                    </div>
                  </label>
                  {promoStatus.message && (
                    <p className={`checkout-promo-status ${promoStatus.state}`}>
                      {promoStatus.message}
                    </p>
                  )}
                </div>
              </section>
            </div>

            <aside className="checkout-sidebar">
              <div className="checkout-plan-card">
                <h3>Resumen de la selección</h3>
                <div className="checkout-total">
                  <span>Total a pagar</span>
                  <strong>
                    {formatUsd(payableAmount)} <small>USD</small>
                  </strong>
                </div>

                <button type="submit" className="checkout-submit">
                  Continuar a datos →
                </button>
              </div>
            </aside>
          </form>
        )}

        {/* PASO 2: DATOS Y CUENTA */}
        {step === 2 && (
          <form className="checkout-layout" onSubmit={handleDataSubmit} ref={detailsFormRef}>
            <div className="checkout-form">
              {/* Sección Cuenta / Autenticación */}
              <section className="checkout-panel">
                <div className="checkout-panel-title">
                  <Lock size={22} />
                  <h2>2.1 Tu acceso al portal</h2>
                </div>

                <p className="checkout-account-note">
                  Usaremos este correo para habilitar tu acceso al portal cuando confirmemos el pago. No necesitas
                  crear una contraseña aquí.
                </p>

                <div className="checkout-fields" style={{ marginTop: "16px" }}>
                  <label className="checkout-field checkout-field-wide">
                    <span>Correo electrónico de la cuenta *</span>
                    <input
                      name="email"
                      type="email"
                      required
                      value={customerData.email}
                      onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                      placeholder="tu@correo.com"
                      pattern={EMAIL_PATTERN}
                      title="Escribe un correo válido, por ejemplo nombre@dominio.com"
                    />
                  </label>
                </div>

                <a
                  className="checkout-portal-link"
                  href={PORTAL_ACCESS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ¿Ya eres cliente? Entra a tu espacio →
                </a>
              </section>

              {/* Sección Datos del Cliente */}
              <section className="checkout-panel">
                <div className="checkout-panel-title">
                  <UserRound size={22} />
                  <h2>2.2 Datos del contacto</h2>
                </div>

                <div className="checkout-fields">
                  <Field
                    name="firstName"
                    type="text"
                    required
                    label="Nombre *"
                    value={customerData.firstName}
                    onChange={(e) => setCustomerData({ ...customerData, firstName: e.target.value })}
                  />
                  <Field
                    name="lastName"
                    type="text"
                    required
                    label="Apellidos *"
                    value={customerData.lastName}
                    onChange={(e) => setCustomerData({ ...customerData, lastName: e.target.value })}
                  />

                  <PhoneField
                    countries={countries}
                    label="Teléfono con indicativo *"
                    name="phone"
                    phone={contactPhone}
                    setPhone={setContactPhone}
                    required
                  />

                  <LocationFields
                    copy={copy || { fields: {}, placeholders: {} }}
                    countries={countries}
                    location={contactLocation}
                    setLocation={setContactLocation}
                    onCountryChange={(code) => {
                      if (code) setContactPhone((prev) => ({ ...prev, code }));
                    }}
                  />
                </div>
              </section>

              {/* Sección Facturación / Empresa */}
              <section className="checkout-panel">
                <div className="checkout-panel-title">
                  <Building2 size={22} />
                  <h2>2.3 Datos de facturación</h2>
                </div>

                <label className="checkout-inline-option checkout-field-wide">
                  <input
                    type="checkbox"
                    checked={useContactForBilling}
                    onChange={(e) => setUseContactForBilling(e.target.checked)}
                  />
                  <span>Usar los datos del contacto para facturar</span>
                </label>

                {!useContactForBilling && (
                  <div className="checkout-fields" style={{ marginTop: "16px" }}>
                    <Field
                      name="tradeName"
                      type="text"
                      required
                      label="Razón social / Nombre de empresa *"
                      prefix="company_"
                    />
                    <Field
                      name="taxId"
                      type="text"
                      required={false}
                      label="Identificación fiscal / NIT / RUC"
                      prefix="company_"
                    />
                    <Field
                      name="companyEmail"
                      type="email"
                      required={false}
                      label="Correo de facturación"
                      prefix="company_"
                    />
                    <Field
                      name="address"
                      type="text"
                      required={false}
                      label="Dirección de facturación"
                      prefix="company_"
                    />
                    <LocationFields
                      copy={copy || { fields: {}, placeholders: {} }}
                      countries={countries}
                      location={companyLocation}
                      setLocation={setCompanyLocation}
                      prefix="company_"
                    />
                  </div>
                )}
              </section>

              {/* Sección Privacidad y Términos */}
              <section className="checkout-panel">
                <div className="checkout-panel-title">
                  <ShieldCheck size={22} />
                  <h2>2.4 Términos y Privacidad</h2>
                </div>

                <div className="checkout-fields">
                  <label className="checkout-inline-option checkout-field-wide">
                    <input
                      type="checkbox"
                      required
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    />
                    <span>
                      Acepto la{" "}
                      <a href="/#politica-privacidad" target="_blank" rel="noopener noreferrer">
                        Política de Privacidad
                      </a>{" "}
                      y el tratamiento de mis datos personales para la contratación de este servicio. *
                    </span>
                  </label>

                  <label className="checkout-inline-option checkout-field-wide">
                    <input
                      type="checkbox"
                      checked={marketingAccepted}
                      onChange={(e) => setMarketingAccepted(e.target.checked)}
                    />
                    <span>Deseo recibir novedades, actualizaciones y comunicaciones comerciales relativas a mi servicio. (Opcional)</span>
                  </label>
                </div>
              </section>
            </div>

            <aside className="checkout-sidebar">
              <div className="checkout-plan-card">
                <h3>Servicio: {selected?.name}</h3>
                <div className="checkout-total">
                  <span>Total</span>
                  <strong>
                    {formatUsd(payableAmount)} <small>USD</small>
                  </strong>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
                  <button type="submit" className="checkout-submit" disabled={detailsStatus === "sending"}>
                    {detailsStatus === "sending" ? "Guardando..." : "Continuar a revisión y pago →"}
                  </button>
                  <button
                    type="button"
                    className="checkout-secondary-action"
                    onClick={() => setStep(1)}
                  >
                    ← Cambiar plan
                  </button>
                </div>
              </div>
            </aside>
          </form>
        )}

        {/* PASO 3: REVISIÓN Y PAGO */}
        {step === 3 && (
          <form className="checkout-payment-layout" onSubmit={handlePaymentSubmit}>
            <section className="checkout-panel checkout-payment-panel">
              <div className="checkout-panel-title">
                <ReceiptText size={22} />
                <h2>3. Resumen y confirmación de la orden</h2>
              </div>

              {paymentStatus === "redirected" ? (
                <div className="checkout-success-box">
                  <ShieldCheck size={36} color="var(--brand-500)" />
                  <h3>
                    {leadRegistered === false ? "Tu pedido quedó en esta pantalla, no en el CRM" : "Tu solicitud quedó registrada."}
                  </h3>
                  <p>
                    Abrimos el pago seguro de <strong>{orderData?.planName}</strong> en una pestaña nueva. Si no se abrió,
                    usa el botón de abajo. El proyecto se activa cuando confirmemos tu pago.
                    {leadRegistered === false && " No pudimos registrar el lead automáticamente: guarda este comprobante y escríbenos si el pago no aparece."}
                  </p>
                  <a
                    className="checkout-submit"
                    style={{ display: "inline-flex", marginTop: "18px", textDecoration: "none" }}
                    href={boldLinkFor(orderData?.planName || selected?.name || planName)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ir al pago seguro
                  </a>
                </div>
              ) : paymentStatus === "success_coordinated" ? (
                <div className="checkout-success-box" style={{ padding: "24px", background: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
                  <ShieldCheck size={36} color="#16a34a" />
                  <h3 style={{ color: "#15803d", marginTop: "12px" }}>
                    {leadRegistered === false ? "Casi listo: falta confirmar tu solicitud" : "¡Solicitud registrada correctamente!"}
                  </h3>
                  <p style={{ color: "#166534", marginTop: "8px" }}>
                    {leadRegistered === false
                      ? `No pudimos registrar automáticamente tu pedido del servicio ${orderData?.planName}. Tus datos siguen aquí: escríbenos y coordinamos la activación y el pago de inmediato.`
                      : `Hemos registrado tu pedido para el servicio ${orderData?.planName}. Un asesor de nuestro equipo se pondrá en contacto contigo inmediatamente para coordinar los detalles de activación y pago.`}
                  </p>
                  {leadRegistered === false && (
                    <a
                      className="checkout-submit"
                      style={{ display: "inline-flex", marginTop: "18px", textDecoration: "none" }}
                      href={contactHref || "#contacto"}
                    >
                      Escribir al equipo
                    </a>
                  )}
                </div>
              ) : (
                <>
                  <div className="checkout-summary-grid">
                    <div>
                      <span>Servicio</span>
                      <strong>{orderData?.planName}</strong>
                    </div>
                    <div>
                      <span>Importe total</span>
                      <strong>{orderData?.price} USD</strong>
                    </div>
                    <div>
                      <span>Cliente / Contacto</span>
                      <strong>
                        {orderData?.firstName} {orderData?.lastName}
                      </strong>
                      <small style={{ display: "block", color: "#666" }}>{orderData?.email}</small>
                    </div>
                    <div>
                      <span>Facturación</span>
                      <strong>{orderData?.tradeName}</strong>
                      {orderData?.taxId && <small style={{ display: "block", color: "#666" }}>ID: {orderData.taxId}</small>}
                    </div>
                  </div>

                  {shouldShowExchangeNote(orderData?.contactCountry) && (
                    <p className="checkout-exchange-note">
                      El cobro se procesa en USD. El equivalente en moneda local depende de la tasa de cambio vigente de tu entidad emisora.
                    </p>
                  )}

                  <div className="checkout-payment-note">
                    <ShieldCheck size={22} />
                    <p>
                      Procesamiento de pago seguro. Tu información viaja cifrada y no almacenamos datos sensibles de tarjetas.
                    </p>
                  </div>

                  <div className="checkout-payment-actions">
                    <button
                      type="button"
                      className="checkout-secondary-action"
                      onClick={() => setStep(2)}
                    >
                      ← Editar datos del cliente
                    </button>
                    <button
                      type="submit"
                      className="checkout-submit"
                      disabled={paymentStatus === "sending"}
                    >
                      {paymentStatus === "sending" ? "Procesando orden..." : "Confirmar y proceder al pago"}
                    </button>
                  </div>
                </>
              )}
            </section>
          </form>
        )}
      </div>
    </main>
  );
}
