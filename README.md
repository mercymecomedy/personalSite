# Mercy Hawkins Comedy Events Site

Static promotional site for Mercy Hawkins built with plain HTML, CSS, and vanilla JavaScript.

## Quick Setup

Use this checklist right after cloning:

1. Update core profile text in `config/site.js`:
   - `profile.name`
   - `profile.oneLineIntro`
   - `profile.shortBio`
   - `profile.longBioParagraphs`
   - `contactEmail`
   - `socialLinks`

2. Choose your theme in `config/site.js`:
   - `activeTheme: "windows95"` (classic)
   - `activeTheme: "windows95-purple"`
   - `activeTheme: "windows95-pink"`

3. Add your about/profile image:
   - Put the image file in `images/about/`
   - Set filename in `aboutImageFilename` (in `config/site.js`)
   - Set alt text in `aboutImageAlt`

4. Add event flyer images:
   - Put event flyer files in `images/events/`
   - In `data/events.json`, set each event's `image` to the filename only
   - If an event has no image, leave `image` empty and fallback is used

5. Update upcoming events in `data/events.json`:
   - Make sure each event includes all required fields
   - Use `localDate` + `localTime` + `timeZone` for each event
   - Example timezone values: `America/Denver`, `America/Phoenix`, `America/Chicago`
   - The homepage "featured next show" is the newest upcoming event tagged with `featured`
   - If no event is tagged `featured`, it falls back to the soonest upcoming event

## Structure

- `index.html`: Home page with featured event and preview list.
- `events/index.html`: Full upcoming events list.
- `events/event.html`: Reusable detail page (`?slug=...`).
- `about/index.html`: Full bio, profile image, and contact info.
- `data/events.json`: Local event source of truth.
- `config/site.js`: Central config for theme, paths, profile content, contact, and social links.
- `themes/`: Base CSS + Windows 95 theme variants.
- `scripts/`: Modular rendering and utility logic.

## Update Events

1. Open `data/events.json`.
2. Add/update event objects using this shape:
   - `slug`, `title`, `localDate`, `localTime`, `timeZone`, `location`, `ticketUrl`
   - `summary`, `description`
   - `tags` as an array of strings (shown as badges in the UI), e.g. `["featured", "festival"]`
   - `image` (filename only) and optional `imageAlt`
3. Keep each event's local date/time in the future to have events display.
   - The site filters out past events automatically.

## Change Theme / Site Settings

Edit `config/site.js`:

- `activeTheme`: Set to one of:
  - `windows95`
  - `windows95-purple`
  - `windows95-pink`
- `eventImageBasePath`, `fallbackEventImage`
- `aboutImageBasePath`, `aboutImageFilename`, `aboutImageAlt`
- `profile`:
  - `name`
  - `oneLineIntro`
  - `shortBio`
  - `longBioParagraphs` (array of paragraphs)
- `contactEmail`, `socialLinks`

## Images

- Event flyers live in `images/events/`.
- About/profile image lives in `images/about/`.
- In JSON/config, use only the filename, not full paths.

## Deploy (GitHub + Cloudflare Pages)

This project is static and has no backend/build step.

1. Push this repo to GitHub.
2. In Cloudflare Pages:
   - Connect the GitHub repo.
   - Framework preset: `None`.
   - Build command: *(leave blank)*.
   - Build output directory: `/` (root).
3. Deploy.

You can also test locally with any static server (for example VS Code Live Server or `python -m http.server`).
