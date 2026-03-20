import { SITE_CONFIG } from "../config/site.js";

export function getRootPath() {
  return document.documentElement.dataset.root || ".";
}

export function toAbsolutePath(relativePath) {
  const root = getRootPath().replace(/\/$/, "");
  return `${root}/${relativePath.replace(/^\//, "")}`;
}

function parseEventDateParts(event) {
  if (event.datetime) {
    return new Date(event.datetime);
  }

  if (event.localDate && event.localTime && event.timeZone) {
    const [year, month, day] = event.localDate.split("-").map(Number);
    const [hour, minute] = event.localTime.split(":").map(Number);
    if ([year, month, day, hour, minute].some(Number.isNaN)) {
      return new Date(NaN);
    }
    return zonedLocalToDate(year, month, day, hour, minute, event.timeZone);
  }

  return new Date(NaN);
}

function getTimeZoneOffsetMs(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(date);
  const map = {};
  parts.forEach((part) => {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  });
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );
  return asUtc - date.getTime();
}

function zonedLocalToDate(year, month, day, hour, minute, timeZone) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  let offset = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
  let correctedUtc = utcGuess - offset;
  const secondOffset = getTimeZoneOffsetMs(new Date(correctedUtc), timeZone);
  if (secondOffset !== offset) {
    correctedUtc = utcGuess - secondOffset;
  }
  return new Date(correctedUtc);
}

export function getEventDate(event) {
  return parseEventDateParts(event);
}

export function formatEventDate(event, options = {}) {
  const { long = false } = options;
  const date = getEventDate(event);
  if (Number.isNaN(date.getTime())) {
    return "Invalid event date";
  }

  const formatterOptions = long
    ? {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }
    : {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    };

  if (event.timeZone) {
    formatterOptions.timeZone = event.timeZone;
    formatterOptions.timeZoneName = "short";
  }

  return new Intl.DateTimeFormat("en-US", formatterOptions).format(date);
}

export function filterUpcomingEvents(events) {
  const nowMs = Date.now();
  return events
    .map((event) => ({ event, date: getEventDate(event) }))
    .filter((item) => !Number.isNaN(item.date.getTime()) && item.date.getTime() > nowMs)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((item) => item.event);
}

export function escapeHtml(input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function getBadgeTypeClasses(type, value) {
  const normalized = String(value || "").toLowerCase();
  if (type === "role") {
    return `badge badge-role badge-role-${normalized || "default"}`;
  }
  return `badge badge-status badge-status-${normalized || "default"}`;
}

export function getTagBadgeClasses(tag) {
  const normalized = String(tag || "").trim().toLowerCase();
  if (normalized === "featured") {
    return "badge badge-tag badge-tag-featured";
  }
  return "badge badge-tag";
}

export function buildEventImageUrl(imageFilename) {
  const base = SITE_CONFIG.eventImageBasePath;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const filename = imageFilename && imageFilename.trim() ? imageFilename.trim() : SITE_CONFIG.fallbackEventImage;
  return toAbsolutePath(`${normalizedBase}${filename}`);
}

export function buildAboutImageUrl() {
  const base = SITE_CONFIG.aboutImageBasePath;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return toAbsolutePath(`${normalizedBase}${SITE_CONFIG.aboutImageFilename}`);
}

export function getEventDetailUrl(slug) {
  return `${toAbsolutePath("events/event.html")}?slug=${encodeURIComponent(slug)}`;
}

export function getNavLinks() {
  return {
    home: toAbsolutePath("index.html"),
    events: toAbsolutePath("events/index.html"),
    about: toAbsolutePath("about/index.html")
  };
}
