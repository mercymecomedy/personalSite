import { SITE_CONFIG } from "../config/site.js";
import {
  buildAboutImageUrl,
  buildEventImageUrl,
  formatEventDate,
  escapeHtml,
  getTagBadgeClasses,
  getEventDetailUrl,
  getNavLinks
} from "./utils.js";

export function renderNav(activePage) {
  const navRoot = document.querySelector("[data-nav]");
  if (!navRoot) {
    return;
  }

  const links = getNavLinks();
  navRoot.innerHTML = `
    <a href="${links.home}" data-page="home">Home</a>
    <a href="${links.events}" data-page="events">Events</a>
    <a href="${links.about}" data-page="about">About</a>
  `;

  const active = navRoot.querySelector(`[data-page="${activePage}"]`);
  if (active) {
    active.classList.add("active");
    active.setAttribute("aria-current", "page");
  }
}

export function renderContactAndSocial(target) {
  if (!target) {
    return;
  }

  const socialItems = Object.entries(SITE_CONFIG.socialLinks)
    .map(([platform, url]) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${capitalize(platform)}</a></li>`)
    .join("");

  target.innerHTML = `
    <p><strong>Booking:</strong> <a href="mailto:${SITE_CONFIG.contactEmail}">${SITE_CONFIG.contactEmail}</a></p>
    <ul class="social-list">${socialItems}</ul>
  `;
}

function capitalize(input) {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export function renderProfileContent() {
  const profile = SITE_CONFIG.profile || {};

  document.querySelectorAll("[data-profile-name]").forEach((node) => {
    node.textContent = profile.name || "Performer Name";
  });

  document.querySelectorAll("[data-profile-tagline]").forEach((node) => {
    node.textContent = profile.oneLineIntro || "";
  });

  const shortBioTarget = document.querySelector("[data-about-short]");
  if (shortBioTarget) {
    shortBioTarget.textContent = profile.shortBio || "";
  }

  const longBioTarget = document.querySelector("[data-about-long]");
  if (longBioTarget) {
    const paragraphs = Array.isArray(profile.longBioParagraphs) ? profile.longBioParagraphs : [];
    longBioTarget.innerHTML = paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
  }
}

export function createEventCard(event, options = {}) {
  const { includeDescription = false } = options;
  const card = document.createElement("article");
  card.className = "event-card";
  card.tabIndex = 0;
  card.setAttribute("role", "link");
  card.setAttribute("aria-label", `${event.title} event details`);

  const detailUrl = getEventDetailUrl(event.slug);
  const imageUrl = buildEventImageUrl(event.image);
  const hasImage = Boolean(event.image && event.image.trim());
  const imageAlt = event.imageAlt && event.imageAlt.trim() ? event.imageAlt : `${event.title} flyer`;
  const tags = Array.isArray(event.tags) ? event.tags : event.tags ? [event.tags] : [];
  const tagsHtml = tags.map((tag) => `<span class="${getTagBadgeClasses(tag)}">${escapeHtml(tag)}</span>`).join("");

  card.innerHTML = `
    <div class="event-card-content">
      <p class="event-date">${formatEventDate(event)}</p>
      <h3>${event.title}</h3>
      <div class="badge-row">
        ${tagsHtml}
      </div>
      <p class="event-location">${event.location}</p>
      <p class="event-summary">${includeDescription ? event.description : event.summary}</p>
      <div class="event-actions">
        <a class="button" href="${event.ticketUrl}" target="_blank" rel="noopener noreferrer" data-ticket-link>Tickets</a>
        <a class="text-link" href="${detailUrl}">Details</a>
      </div>
    </div>
    ${
      hasImage
        ? `<div class="event-image-wrap"><img src="${imageUrl}" alt="${imageAlt}" loading="lazy"></div>`
        : ""
    }
  `;

  card.addEventListener("click", () => {
    window.location.href = detailUrl;
  });
  card.addEventListener("keydown", (eventKey) => {
    if (eventKey.key === "Enter" || eventKey.key === " ") {
      eventKey.preventDefault();
      window.location.href = detailUrl;
    }
  });

  const ticketLink = card.querySelector("[data-ticket-link]");
  if (ticketLink) {
    ticketLink.addEventListener("click", (eventClick) => {
      eventClick.stopPropagation();
    });
  }

  const detailLink = card.querySelector(".text-link");
  if (detailLink) {
    detailLink.addEventListener("click", (eventClick) => {
      eventClick.stopPropagation();
    });
  }

  return card;
}

export function renderEventList(target, events) {
  if (!target) {
    return;
  }

  if (!events.length) {
    target.innerHTML = `<p class="empty-state">No upcoming events are listed right now. Check back soon.</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  events.forEach((event) => {
    fragment.appendChild(createEventCard(event));
  });
  target.innerHTML = "";
  target.appendChild(fragment);
}

export function renderFeaturedEvent(target, event) {
  if (!target) {
    return;
  }

  if (!event) {
    target.innerHTML = `<p class="empty-state">No upcoming events are listed right now.</p>`;
    return;
  }

  target.innerHTML = "";
  target.appendChild(createEventCard(event, { includeDescription: false }));
}

export function renderAboutImage(target) {
  if (!target) {
    return;
  }

  const image = document.createElement("img");
  image.src = buildAboutImageUrl();
  image.alt = SITE_CONFIG.aboutImageAlt;
  image.loading = "lazy";
  image.className = "about-profile-image";
  target.appendChild(image);
}
