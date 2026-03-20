import { SITE_CONFIG } from "../config/site.js";
import {
  renderAboutImage,
  renderContactAndSocial,
  renderEventList,
  renderFeaturedEvent,
  renderNav,
  renderProfileContent
} from "./render.js";
import { buildEventImageUrl, escapeHtml, filterUpcomingEvents, formatEventDate, getTagBadgeClasses, toAbsolutePath } from "./utils.js";

async function loadEvents() {
  const response = await fetch(toAbsolutePath("data/events.json"));
  if (!response.ok) {
    throw new Error("Unable to load events data");
  }
  const events = await response.json();
  return filterUpcomingEvents(events);
}

function applyTheme() {
  const existing = document.getElementById("active-theme");
  if (existing) {
    existing.remove();
  }
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.id = "active-theme";
  link.href = toAbsolutePath(`themes/${SITE_CONFIG.activeTheme}.css`);
  document.head.appendChild(link);
}

function pickFeaturedEvent(events) {
  const featuredTag = "featured";
  const featuredEvents = events.filter((event) => {
    const tags = Array.isArray(event.tags) ? event.tags : event.tags ? [event.tags] : [];
    return tags.some((t) => String(t).toLowerCase() === featuredTag);
  });

  // Upcoming events are already sorted oldest->newest, so the "newest" featured event is the last match.
  if (featuredEvents.length) return featuredEvents[featuredEvents.length - 1];
  return events[0] || null;
}

function renderCommonBlocks() {
  renderContactAndSocial(document.querySelector("[data-contact-social]"));
  renderAboutImage(document.querySelector("[data-about-image]"));
  renderProfileContent();
}

function setNavAndTheme() {
  const rawPage = document.body.dataset.page || "home";
  const activePage = rawPage === "event-detail" ? "events" : rawPage;
  renderNav(activePage);
  applyTheme();
}

async function initHomePage(events) {
  const featuredEvent = pickFeaturedEvent(events);
  const preview = events.slice(0, 3);
  renderFeaturedEvent(document.querySelector("[data-featured-event]"), featuredEvent);
  renderEventList(document.querySelector("[data-upcoming-preview]"), preview);
}

async function initEventsPage(events) {
  renderEventList(document.querySelector("[data-events-list]"), events);
}

async function initEventDetailPage(events) {
  const slug = new URLSearchParams(window.location.search).get("slug");
  const target = document.querySelector("[data-event-detail]");
  if (!target) {
    return;
  }

  const match = events.find((event) => event.slug === slug);
  if (!match) {
    target.innerHTML = `
      <article class="panel">
        <h2>Event not found</h2>
        <p>That event could not be found or is no longer upcoming.</p>
        <p><a class="button" href="${toAbsolutePath("events/index.html")}">Back to Events</a></p>
      </article>
    `;
    return;
  }

  const cardContainer = document.createElement("div");
  cardContainer.className = "event-detail-card";
  const imageHtml = `<img src="${buildEventImageUrl(match.image)}" alt="${match.imageAlt || `${match.title} flyer`}" class="event-detail-image">`;
  const tags = Array.isArray(match.tags) ? match.tags : match.tags ? [match.tags] : [];
  const tagsHtml = tags.map((tag) => `<span class="${getTagBadgeClasses(tag)}">${escapeHtml(tag)}</span>`).join("");

  cardContainer.innerHTML = `
    <article class="panel">
      <p class="event-date">${formatEventDate(match, { long: true })}</p>
      <h2>${match.title}</h2>
      <div class="badge-row">
        ${tagsHtml}
      </div>
      <p class="event-location">${match.location}</p>
      <p>${match.description}</p>
      ${imageHtml}
      <div class="event-actions">
        <a class="button" href="${match.ticketUrl}" target="_blank" rel="noopener noreferrer">Tickets</a>
        <a class="text-link" href="${toAbsolutePath("events/index.html")}">Back to Events</a>
      </div>
    </article>
  `;
  target.innerHTML = "";
  target.appendChild(cardContainer);
}

async function initAboutPage() {
  const imageSlot = document.querySelector("[data-about-image]");
  if (imageSlot) {
    imageSlot.innerHTML = "";
    renderAboutImage(imageSlot);
  }
}

async function initPage() {
  setNavAndTheme();
  renderCommonBlocks();

  let events = [];
  try {
    events = await loadEvents();
  } catch (error) {
    const fallback = document.querySelector("[data-events-list]") || document.querySelector("[data-upcoming-preview]");
    if (fallback) {
      fallback.innerHTML = "<p class='empty-state'>Events are unavailable right now.</p>";
    }
  }

  const page = document.body.dataset.page;
  if (page === "home") {
    await initHomePage(events);
  } else if (page === "events") {
    await initEventsPage(events);
  } else if (page === "event-detail") {
    await initEventDetailPage(events);
  } else if (page === "about") {
    await initAboutPage();
  }
}

initPage();
