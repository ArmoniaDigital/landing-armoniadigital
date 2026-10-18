import { ArrowLeft, Building2, Check, CreditCard, ReceiptText, ShieldCheck, UserRound } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { findCountry, useCrmLocations } from "../../hooks/useCrmLocations";
import { createEpaycoSession, sendCrmEvent, validateCrmPromotion } from "../../services/crm";
import logo from "../Navbar/LOGO-01.png";

const contactFields = [
  ["firstName", "text", true],
  ["lastName", "text", true],
  ["birthDate", "date", false],
  ["email", "email", false],
  ["phone", "phone", false],
  ["location", "location", false],
  ["address", "text", false],
  ["mapUrl", "maps", false],
  ["contactNotes", "textarea", false],
];

const companyFields = [
  ["tradeName", "text", true],
  ["legalName", "text", false],
  ["companyEmail", "email", false],
  ["companyPhone", "phone", false],
  ["website", "website", false],
  ["location", "location", false],
  ["address", "text", false],
  ["mapUrl", "maps", false],
  ["companyNotes", "textarea", false],
];

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

function Field({ name, type, required, label, placeholders, prefix = "" }) {
  const inputName = `${prefix}${name}`;
  const today = new Date().toISOString().split("T")[0];
  const emailPattern = "[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}";
  const websitePattern = "^(https?:\\/\\/)?([^\\s@]+\\.)+[^\\s@]{2,}.*$";
  const mapsPattern = "^https?:\\/\\/((www\\.)?google\\.[^\\s]+\\/maps|maps\\.google\\.[^\\s]+|maps\\.app\\.goo\\.gl|goo\\.gl\\/maps).*$";

  if (type === "textarea") {
    return (
      <label className="checkout-field checkout-field-wide">
        <span>{label}</span>
        <textarea name={inputName} rows="4" required={required} />
      </label>
    );
  }

  if (type === "website" || type === "maps") {
    return (
      <label className="checkout-field">
        <span>{label}</span>
        <input
          name={inputName}
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
    <label className="checkout-field">
      <span>{label}</span>
      <input
        name={inputName}
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

function loadEpaycoCheckoutScript() {
  return new Promise((resolve, reject) => {
    if (window.ePayco?.checkout) {
      resolve(window.ePayco);
      return;
    }

    const existingScript = document.querySelector("script[data-epayco-checkout]");

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.ePayco));
      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.epayco.co/checkout-v2.js";
    script.async = true;
    script.dataset.epaycoCheckout = "true";
    script.onload = () => resolve(window.ePayco);
    script.onerror = reject;
    document.body.appendChild(script);
  });
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
          name={`${inputName}_local`}
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
        <span>{copy.fields.country}</span>
        <select
          name={`${prefix}country`}
          value={location.country}
          onChange={(event) => updateCountry(event.target.value)}
        >
          <option value="" disabled>{copy.placeholders.select}</option>
          {countries.map((country) => (
            <option key={country.name} value={country.name}>{country.name}</option>
          ))}
        </select>
      </label>

      <label className="checkout-field">
        <span>{copy.fields.state}</span>
        {hasStateOptions ? (
          <select
            name={`${prefix}state`}
            value={location.state}
            onChange={(event) => updateState(event.target.value)}
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
            onChange={(event) => updateState(event.target.value)}
            disabled={!location.country}
          />
        )}
      </label>

      <label className="checkout-field">
        <span>{copy.fields.city}</span>
        {hasCityOptions ? (
          <select
            name={`${prefix}city`}
            value={location.city}
            onChange={(event) => updateCity(event.target.value)}
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
            onChange={(event) => updateCity(event.target.value)}
            disabled={!location.country}
          />
        )}
      </label>
    </>
  );
}

export default function Checkout({ copy, plans, selectedPlan, contactHref }) {
  const initialPlan = plans.find((plan) => plan.name === selectedPlan)?.name || plans[0]?.name || "";
  const detailsFormRef = useRef(null);
  const [planName, setPlanName] = useState(initialPlan);
  const [companySameAsContact, setCompanySameAsContact] = useState(false);
  const [contactLocation, setContactLocation] = useState({ country: "", state: "", city: "" });
  const [companyLocation, setCompanyLocation] = useState({ country: "", state: "", city: "" });
  const [contactPhone, setContactPhone] = useState({ code: "", number: "" });
  const [companyPhoneData, setCompanyPhoneData] = useState({ code: "", number: "" });
  const [checkoutStep, setCheckoutStep] = useState("details");
  const [orderData, setOrderData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState(null);
  const [promoStatus, setPromoStatus] = useState({ state: "idle", message: "" });
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
      setPromoStatus({ state: "error", message: "Escribe un codigo promocional." });
      return;
    }

    const formData = new FormData(detailsFormRef.current);
    const email = formData.get("email") || "";
    const phone = formData.get("phone") || "";
    const contactCountry = formData.get("country") || "";

    setPromoStatus({ state: "loading", message: "Validando codigo..." });

    try {
      const result = await validateCrmPromotion({
        code,
        price: selected?.price || "",
        selectedPlan: selected?.name || planName,
        contact: { email, phone },
      });

      setPromoResult(result);
      setPromoCode(result.promotion?.code || code.toUpperCase());
      setPromoStatus({
        state: "success",
        message: `Codigo aplicado: ${result.promotion?.discountPercent || 0}% de descuento.`,
      });
    } catch (error) {
      setPromoResult(null);
      setPromoStatus({ state: "error", message: error.message || "No pudimos aplicar este codigo." });
    }
  };

  const promotionPayload = promoResult ? {
    id: promoResult.promotion?.id,
    code: promoResult.promotion?.code,
    name: promoResult.promotion?.name,
    discountPercent: promoResult.promotion?.discountPercent,
    originalPrice: promoResult.amounts?.original,
    discountUsd: promoResult.amounts?.discount,
    finalPrice: promoResult.amounts?.total,
    remainingUses: promoResult.promotion?.remainingUses,
  } : null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const firstName = formData.get("firstName") || "";
    const lastName = formData.get("lastName") || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const contactCountry = formData.get("country") || "";
    const contactState = formData.get("state") || "";
    const contactCity = formData.get("city") || "";
    const contactAddress = formData.get("address") || "";
    const tradeName = companySameAsContact ? fullName : formData.get("company_tradeName") || "";
    const email = formData.get("email") || "";
    const phone = formData.get("phone") || "";
    const companyEmail = companySameAsContact ? email : formData.get("company_companyEmail") || "";
    const companyPhone = companySameAsContact ? phone : formData.get("company_companyPhone") || "";
    const companyCountry = companySameAsContact ? contactCountry : formData.get("company_country") || "";
    const companyState = companySameAsContact ? contactState : formData.get("company_state") || "";
    const companyCity = companySameAsContact ? contactCity : formData.get("company_city") || "";
    const companyAddress = companySameAsContact ? contactAddress : formData.get("company_address") || "";
    const contactMapUrl = formData.get("mapUrl") || "";
    const companyMapUrl = companySameAsContact ? contactMapUrl : formData.get("company_mapUrl") || "";

    const payload = {
      source: "checkout_details",
      intent: "Compra de plan web",
      createdAt: new Date().toISOString(),
      selectedPlan: selected?.name || planName,
      price: formatUsd(payableAmount),
      originalPrice: selected?.price || "",
      promotion: promotionPayload,
      contact: {
        firstName,
        lastName,
        birthDate: formData.get("birthDate") || "",
        email,
        phone,
        country: contactCountry,
        state: contactState,
        city: contactCity,
        address: contactAddress,
        mapUrl: contactMapUrl,
        notes: formData.get("contactNotes") || "",
      },
      company: {
        name: tradeName,
        legalName: companySameAsContact ? fullName : formData.get("company_legalName") || "",
        email: companyEmail,
        phone: companyPhone,
        website: companySameAsContact ? "" : normalizeWebsiteUrl(formData.get("company_website")),
        country: companyCountry,
        state: companyState,
        city: companyCity,
        address: companyAddress,
        mapUrl: companyMapUrl,
        notes: companySameAsContact ? "" : formData.get("company_companyNotes") || "",
        sameAsContact: companySameAsContact,
      },
    };

    let opportunityId = null;

    try {
      const crmResult = await sendCrmEvent("checkout_started", payload);
      opportunityId = crmResult?.opportunity_id || null;
    } catch (error) {
      form.dataset.crmError = "true";
    }

    setOrderData({
      firstName,
      lastName,
      tradeName,
      email,
      phone,
      companyEmail,
      companyPhone,
      contactCountry,
      opportunityId,
      planName: selected?.name || planName,
      price: formatUsd(payableAmount),
      amount: payableAmount,
      originalPrice: selected?.price || "",
      promotion: promotionPayload,
    });
    setCheckoutStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    setPaymentStatus("sending");
    const formData = new FormData(event.currentTarget);
    const billingName = formData.get("billingName") || "";
    const billingDocument = formData.get("billingDocument") || "";
    const paymentNotes = formData.get("paymentNotes") || "";

    try {
      await sendCrmEvent("checkout_payment_requested", {
        source: "checkout_payment",
        intent: "Pago ePayco",
        createdAt: new Date().toISOString(),
        selectedPlan: orderData?.planName || selected?.name || planName,
        price: orderData?.price || selected?.price || "",
        originalPrice: orderData?.originalPrice || selected?.price || "",
        promotion: orderData?.promotion || null,
        contact: {
          firstName: orderData?.firstName || "",
          lastName: orderData?.lastName || "",
          email: orderData?.email || "",
          phone: orderData?.phone || "",
          country: orderData?.contactCountry || "",
        },
        company: {
          name: orderData?.tradeName || "",
          email: orderData?.companyEmail || "",
          phone: orderData?.companyPhone || "",
        },
        payment: {
          method: "ePayco",
          billingName,
          billingDocument,
          notes: paymentNotes,
        },
      });

      const session = await createEpaycoSession({
        opportunity_id: orderData?.opportunityId,
        selectedPlan: orderData?.planName || selected?.name || planName,
        amount: orderData?.amount || payableAmount,
        currency: "USD",
        promotion: orderData?.promotion || null,
        contact: {
          firstName: orderData?.firstName || "",
          lastName: orderData?.lastName || "",
          email: orderData?.email || "",
          phone: orderData?.phone || "",
          country: orderData?.contactCountry || "",
        },
        company: {
          name: orderData?.tradeName || "",
        },
        billing: {
          name: billingName,
          document: billingDocument,
        },
      });

      if (!session.sessionId) {
        throw new Error("ePayco no devolvio sessionId.");
      }

      const epayco = await loadEpaycoCheckoutScript();
      const handler = epayco.checkout.configure({
        sessionId: session.sessionId,
        type: session.type || "onpage",
        test: Boolean(session.test),
      });

      handler.open();
      setPaymentStatus("idle");
    } catch (error) {
      setPaymentStatus("error");
    }
  };
  return (
    <main className="checkout-page">
      <div className="checkout-shell">
        <header className="checkout-brandbar">
          <a className="checkout-brand" href="#inicio" aria-label="ArmonÃ­a Digital">
            <img src={logo} alt="ArmonÃ­a Digital" />
          </a>

          <a className="checkout-back" href="#precios">
            <ArrowLeft size={18} />
            {copy.back}
          </a>
        </header>

        <section className="checkout-hero">
          <div>
            <span className="checkout-kicker">{copy.kicker}</span>
            <h1>{checkoutStep === "payment" ? copy.paymentTitle : copy.title}</h1>
            <p>{checkoutStep === "payment" ? copy.paymentSubtitle : copy.subtitle}</p>
          </div>
          <aside className="checkout-plan-summary">
            <span>{copy.selectedPlan}</span>
            <strong>{selected?.name}</strong>
            <p>{selected?.description}</p>
            <b>{selected?.price} <small>USD</small></b>
          </aside>
        </section>

        <div className="checkout-steps" aria-label="Pasos del checkout">
          <div className={`checkout-step ${checkoutStep === "details" ? "active" : "done"}`}>
            <span>01</span>
            <strong>{copy.steps.details}</strong>
          </div>
          <div className={`checkout-step ${checkoutStep === "payment" ? "active" : ""}`}>
            <span>02</span>
            <strong>{copy.steps.payment}</strong>
          </div>
        </div>

        {checkoutStep === "payment" ? (
          <form className="checkout-payment-layout" onSubmit={handlePaymentSubmit}>
            <section className="checkout-panel checkout-payment-panel">
              <div className="checkout-panel-title">
                <ReceiptText size={22} />
                <h2>{copy.paymentSectionTitle}</h2>
              </div>

              <div className="checkout-summary-grid">
                <div>
                  <span>{copy.selectedPlan}</span>
                  <strong>{orderData?.planName || selected?.name}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{orderData?.price || selected?.price} USD</strong>
                </div>
                <div>
                  <span>Contacto</span>
                  <strong>{`${orderData?.firstName || ""} ${orderData?.lastName || ""}`.trim()}</strong>
                </div>
                {orderData?.tradeName && (
                  <div>
                    <span>Empresa</span>
                    <strong>{orderData.tradeName}</strong>
                  </div>
                )}
              </div>

              {shouldShowExchangeNote(orderData?.contactCountry) && (
                <p className="checkout-exchange-note">
                  El pago se procesa en USD. Cualquier monto en moneda local es una equivalencia al valor en dolares con la tasa del dia.
                </p>
              )}

              <div className="checkout-payment-note">
                <ShieldCheck size={22} />
                <p>{copy.paymentNotice}</p>
              </div>

              <div className="checkout-fields">
                <Field name="billingName" type="text" required={false} label={copy.fields.billingName} placeholders={copy.placeholders} />
                <Field name="billingDocument" type="text" required={false} label={copy.fields.billingDocument} placeholders={copy.placeholders} />
                <Field name="paymentNotes" type="textarea" required={false} label={copy.fields.paymentNotes} placeholders={copy.placeholders} />
              </div>

              <div className="checkout-payment-actions">
                <button type="button" className="checkout-secondary-action" onClick={() => setCheckoutStep("details")}>
                  {copy.editDetails}
                </button>
                <button type="submit" className="checkout-submit" disabled={paymentStatus === "sending"}>
                  {paymentStatus === "sending" ? "Enviando solicitud..." : copy.paymentSubmit}
                </button>
              </div>
              {paymentStatus === "error" && (
                <p className="checkout-required">No pudimos abrir ePayco. Revisa la configuracion del procesador o intenta nuevamente.</p>
              )}
            </section>
          </form>
        ) : (
        <form className="checkout-layout" onSubmit={handleSubmit} ref={detailsFormRef}>
          <div className="checkout-form">
            <section className="checkout-panel">
              <div className="checkout-panel-title">
                <UserRound size={22} />
                <h2>{copy.contactTitle}</h2>
              </div>
              <div className="checkout-fields">
                {contactFields.map(([name, type, required]) => (
                type === "location" ? (
                  <LocationFields
                    key={name}
                    copy={copy}
                    countries={countries}
                    location={contactLocation}
                    setLocation={setContactLocation}
                    onCountryChange={(phoneCode) => {
                      if (phoneCode) {
                        setContactPhone((current) => ({ ...current, code: phoneCode }));
                      }
                    }}
                  />
                ) : type === "phone" ? (
                  <PhoneField
                    key={name}
                    countries={countries}
                    label={copy.fields[name]}
                    name={name}
                    phone={contactPhone}
                    setPhone={setContactPhone}
                    required={required}
                  />
                ) : (
                  <Field
                    key={name}
                      name={name}
                      type={type}
                      required={required}
                      label={copy.fields[name]}
                      placeholders={copy.placeholders}
                    />
                  )
                ))}
              </div>
            </section>

            <section className="checkout-panel">
              <div className="checkout-panel-title checkout-panel-title-row">
                <div>
                  <Building2 size={22} />
                  <h2>{copy.companyTitle}</h2>
                </div>
              </div>

              <label className="checkout-inline-option checkout-field-wide">
                <input
                  type="checkbox"
                  checked={companySameAsContact}
                  onChange={(event) => setCompanySameAsContact(event.target.checked)}
                />
                <span>Igual que el contacto</span>
                <small>Usaremos nombre, correo, telefono y direccion del contacto.</small>
              </label>

              {!companySameAsContact && (
                <div className="checkout-fields">
                  {companyFields.map(([name, type, required]) => (
                    type === "location" ? (
                      <LocationFields
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
                    <PhoneField
                      key={name}
                      countries={countries}
                      label={copy.fields[name]}
                      name={name}
                      phone={companyPhoneData}
                      setPhone={setCompanyPhoneData}
                      prefix="company_"
                      required={required}
                    />
                  ) : (
                    <Field
                      key={name}
                        name={name}
                        type={type}
                        required={required}
                        label={copy.fields[name]}
                        placeholders={copy.placeholders}
                        prefix="company_"
                      />
                    )
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="checkout-sidebar">
            <div className="checkout-plan-card">
              <div className="checkout-panel-title">
                <CreditCard size={22} />
                <h2>{copy.selectedPlan}</h2>
              </div>

              <label className="checkout-field checkout-field-wide">
                <span>{copy.selectedPlan}</span>
                <select value={planName} onChange={(event) => {
                  setPlanName(event.target.value);
                  clearPromotion();
                }}>
                  {plans.map((plan) => (
                    <option key={plan.name} value={plan.name}>
                      {plan.name} - {plan.price} USD
                    </option>
                  ))}
                </select>
              </label>

              <p className="checkout-helper">{copy.changePlan}</p>

              <div className="checkout-promo-box">
                <label className="checkout-field checkout-field-wide">
                  <span>Codigo promocional</span>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(event) => {
                      setPromoCode(event.target.value);
                      clearPromotion();
                    }}
                    placeholder="Ejemplo: JESUS"
                  />
                </label>
                <button
                  type="button"
                  className="checkout-secondary-action checkout-promo-action"
                  onClick={handleApplyPromotion}
                  disabled={promoStatus.state === "loading"}
                >
                  {promoStatus.state === "loading" ? "Validando..." : "Aplicar"}
                </button>
                {promoStatus.message && (
                  <p className={`checkout-promo-status ${promoStatus.state}`}>
                    {promoStatus.message}
                  </p>
                )}
              </div>

              <ul>
                {selected?.features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="checkout-total">
                <span>Total</span>
                <strong>{formatUsd(payableAmount)} <small>USD</small></strong>
              </div>
              {promoResult && (
                <div className="checkout-discount">
                  <span>Antes: {formatUsd(promoResult.amounts?.original)} USD</span>
                  <strong>-{formatUsd(promoResult.amounts?.discount)} USD</strong>
                </div>
              )}

              {shouldShowExchangeNote(contactLocation.country) && (
                <p className="checkout-exchange-note">
                  El pago se procesa en USD. La moneda local es solo una equivalencia referencial con la tasa del dia.
                </p>
              )}

              <p className="checkout-required">{copy.requiredNote}</p>
              <button type="submit" className="checkout-submit">{copy.submit}</button>
            </div>
          </aside>
        </form>
        )}
      </div>
    </main>
  );
}

