import LeadRequest from "./LeadRequest";
import { createLeadSender } from "../../services/lead-sender.mjs";
import { getInitialLocale } from "../../i18n";
import logo from "../Navbar/LOGO-01.png";

const send = createLeadSender({ endpoint: "https://crm-readyin72.vercel.app/api/landing/events", brand: "armonia-digital" });

export function AppointmentRequest({ copy }) {
  return <LeadRequest send={send} logo={logo} brand="Armonía Digital" language={getInitialLocale()} calendar={copy.calendlyFallback} />;
}

export function PurchaseRequest({ selectedPlan }) {
  return <LeadRequest key={selectedPlan} send={send} logo={logo} brand="Armonía Digital" language={getInitialLocale()} purchase initialPlan={selectedPlan} />;
}
