import type { Evidence } from "../replay/types";

// Live segment: the ASOS app "hacked" notification, 6 Oct 2026 (developing).
// Ledger only: no drafts in ASOS's voice. Never link or quote the Telegram channel
// or anything from a leak. Times are BST (+01:00).
//
// `at` is the time the source gives. Where it gives only "morning" or "afternoon",
// `at` is the latest time that wording allows and `time_note` keeps the wording.
// The UI shows `time_note` in place of the time, so keep it short. Sources for the
// times: A-01 per LBC, Yahoo News UK and Quartz; A-07 NY pre-market ends 14:30 BST;
// A-08 and A-09 placed before ASOS's 15:00 announcement, as in the prep ledger;
// A-11 "shortly after 3pm" per Drapers; A-14 LBC, published 10:11.

// Latest capture of any row. Refresh when new rows are added.
export const asosCapturedAt = "2026-10-06T17:00:00+01:00";

export type AsosEvidenceMeta = {
  captured_at: string;
  time_note: string | null;
  // false: excerpt comes from a search-result summary, not the original article.
  read_in_original: boolean;
};

export const asosEvidence: Evidence[] = [
  {
    id: "A-01",
    at: "2026-10-06T10:01:00+01:00",
    kind: "community",
    origin: "ASOS app push notification (screenshots via press)",
    provider: null,
    channel: null,
    excerpt:
      "Title \"ASOS HACKED\": \"Dear Asos DPO and IT, we have fully compromised the Snowflake instance. Engage with us, or we will leak it.\"",
    url: "https://www.lbc.co.uk/article/thousands-asos-users-hack-alert-5HjdjSR_2/",
    arrived_via: "manual",
    fictional: false,
  },
  {
    id: "A-02",
    at: "2026-10-06T12:00:00+01:00",
    kind: "community",
    origin: "ASOS app users on X (via Yahoo News UK)",
    provider: null,
    channel: "social",
    excerpt:
      "App users report receiving the notification, from the UK, US, Germany and Australia.",
    url: "https://uk.news.yahoo.com/asos-hacked-customers-concerned-receiving-092829903.html",
    arrived_via: "manual",
    fictional: false,
  },
  {
    id: "A-03",
    at: "2026-10-06T12:00:00+01:00",
    kind: "press",
    origin: "ITV News",
    provider: null,
    channel: null,
    excerpt:
      "Customers were told the retailer was \"hacked\" in a phone alert. The site and app appeared to keep working.",
    url: "https://www.itv.com/news/2026-10-06/asos-customers-told-online-retailer-hacked-in-phone-alert",
    arrived_via: "manual",
    fictional: false,
  },
  {
    id: "A-04",
    at: "2026-10-06T12:00:00+01:00",
    kind: "press",
    origin: "Irish Times (Bloomberg)",
    provider: null,
    channel: null,
    excerpt:
      "An ASOS spokesperson had seen the reports but declined to confirm or elaborate. Shares fell as much as 13% intraday, the largest drop since Sep 2025, then pared.",
    url: "https://www.irishtimes.com/business/2026/10/06/asos-shares-slump-amid-hack-worries/",
    arrived_via: "manual",
    fictional: false,
  },
  {
    id: "A-05",
    at: "2026-10-06T12:00:00+01:00",
    kind: "press",
    origin: "City AM",
    provider: null,
    channel: null,
    excerpt: "ASOS shares \"crater\", down about 11–12%.",
    url: "https://www.cityam.com/asos-shares-crater-after-hackers-threaten-data-leak/",
    arrived_via: "manual",
    fictional: false,
  },
  {
    id: "A-06",
    at: "2026-10-06T12:00:00+01:00",
    kind: "press",
    origin: "TechRadar",
    provider: null,
    channel: null,
    excerpt:
      "ASOS hasn't confirmed a breach and is understood to be investigating. No confirmation that personal or payment data was taken.",
    url: "https://www.techradar.com/pro/security/asos-hacked-customers-receive-threatening-notification-from-hackers-heres-what-we-know",
    arrived_via: "manual",
    fictional: false,
  },
  {
    id: "A-07",
    at: "2026-10-06T14:30:00+01:00",
    kind: "press",
    origin: "Irish Times (Bloomberg)",
    provider: null,
    channel: null,
    excerpt: "Snowflake shares fell as much as 3.2% in pre-market trading in New York.",
    url: "https://www.irishtimes.com/business/2026/10/06/asos-shares-slump-amid-hack-worries/",
    arrived_via: "manual",
    fictional: false,
  },
  {
    id: "A-08",
    at: "2026-10-06T14:59:00+01:00",
    kind: "press",
    origin: "GB News",
    provider: null,
    channel: null,
    excerpt:
      "The group behind the message calls itself \"Xuanye Group\" and isn't linked to any earlier breach claim.",
    url: "https://www.gbnews.com/tech/asos-hack-notification-snowflake-instance",
    arrived_via: "manual",
    fictional: false,
  },
  {
    id: "A-09",
    at: "2026-10-06T14:59:00+01:00",
    kind: "community",
    origin: "Cypro (security consultancy bulletin)",
    provider: null,
    channel: "blog",
    excerpt:
      "Delivery through the official app \"may indicate\" the attackers reached the systems that control the app's notifications.",
    url: "https://cypro.co.uk/insights/cyber-bulletins/asos-hack-alert-what-the-threatening-message-means/",
    arrived_via: "manual",
    fictional: false,
  },
  {
    // A separate, earlier incident. Context only: it must not support tonight's claims.
    id: "A-10",
    at: "2026-08-21T23:59:00+01:00",
    kind: "provider_official",
    origin: "ASOS US breach notification letters (via CyberInsider)",
    provider: "ASOS",
    channel: "report",
    excerpt:
      "Separate July 2026 incident: credential stuffing from 28 Jul 2026 affected about 138,828 US accounts. The letters say the credentials came from outside ASOS.",
    url: "https://cyberinsider.com/asos-credential-stuffing-attack-exposed-data-of-138828-customers/",
    arrived_via: "manual",
    fictional: false,
  },
  {
    id: "A-11",
    at: "2026-10-06T15:00:00+01:00",
    kind: "provider_official",
    origin: "ASOS plc stock-exchange announcement (RNS 8604X)",
    provider: "ASOS",
    channel: "report",
    excerpt:
      "ASOS can confirm that, at around 10am today, an unauthorised customer notification was sent to ASOS customers. We are investigating unauthorised activity involving third-party platforms that we use to communicate with customers. We took immediate action to restrict access to the notification platforms and are working with our internal and external specialist advisers, as well as all relevant authorities. Basic personal information including name and contact details may have been accessed. We do not believe that payment-card information or account passwords, were impacted. Our website and app are operating as normal, with no current disruption to any aspects of our operations. … It is too early to quantify any potential impact on trading.",
    url: "https://www.tradingview.com/news/reuters.com,2026-10-06:newsml_RSF8604Xa:0-reg-asos-plc-update-regarding-cyber-incident/",
    arrived_via: "manual",
    fictional: false,
  },
  {
    // A Snowflake spokesperson quoted by the press, not Snowflake's own channel.
    id: "A-12",
    at: "2026-10-06T17:00:00+01:00",
    kind: "press",
    origin: "Infosecurity Magazine (Snowflake spokesperson)",
    provider: null,
    channel: null,
    excerpt:
      "Snowflake \"found no compromise\" of its platform. \"The investigation is ongoing and we will provide further updates as soon as more information becomes available.\"",
    url: "https://www.infosecurity-magazine.com/news/asos-customers-message-suspected/",
    arrived_via: "manual",
    fictional: false,
  },
  {
    // The attacker's word, reported by the press. Supports nothing on its own.
    id: "A-13",
    at: "2026-10-06T17:00:00+01:00",
    kind: "community",
    origin: "The group's administrator, as reported by Infosecurity Magazine",
    provider: null,
    channel: null,
    excerpt: "The group's administrator says payment information was unaffected.",
    url: "https://www.infosecurity-magazine.com/news/asos-customers-message-suspected/",
    arrived_via: "manual",
    fictional: false,
  },
  {
    id: "A-14",
    at: "2026-10-06T09:41:00+01:00",
    kind: "press",
    origin: "LBC",
    provider: null,
    channel: null,
    excerpt:
      "Downdetector showed ASOS website issues from about 09:41. Shares fell about 5% within 30 minutes of the first reports.",
    url: "https://www.lbc.co.uk/article/thousands-asos-users-hack-alert-5HjdjSR_2/",
    arrived_via: "manual",
    fictional: false,
  },
];

export const asosEvidenceMeta: Record<string, AsosEvidenceMeta> = {
  "A-01": { captured_at: "2026-10-06T16:00:00+01:00", time_note: "~10:01", read_in_original: false },
  "A-02": { captured_at: "2026-10-06T16:00:00+01:00", time_note: "morning", read_in_original: false },
  "A-03": { captured_at: "2026-10-06T16:00:00+01:00", time_note: "morning", read_in_original: false },
  "A-04": { captured_at: "2026-10-06T16:00:00+01:00", time_note: "morning", read_in_original: false },
  "A-05": { captured_at: "2026-10-06T16:00:00+01:00", time_note: "morning", read_in_original: false },
  "A-06": { captured_at: "2026-10-06T16:00:00+01:00", time_note: "morning", read_in_original: false },
  "A-07": { captured_at: "2026-10-06T16:00:00+01:00", time_note: "pre-market NY", read_in_original: false },
  "A-08": { captured_at: "2026-10-06T16:00:00+01:00", time_note: "during the day", read_in_original: false },
  "A-09": { captured_at: "2026-10-06T16:00:00+01:00", time_note: "during the day", read_in_original: false },
  "A-10": { captured_at: "2026-10-06T16:00:00+01:00", time_note: "21 Aug 2026", read_in_original: false },
  "A-11": { captured_at: "2026-10-06T17:00:00+01:00", time_note: "~15:00", read_in_original: true },
  "A-12": { captured_at: "2026-10-06T17:00:00+01:00", time_note: "afternoon", read_in_original: true },
  "A-13": { captured_at: "2026-10-06T17:00:00+01:00", time_note: "afternoon", read_in_original: true },
  "A-14": { captured_at: "2026-10-06T17:00:00+01:00", time_note: "~09:41", read_in_original: true },
};
