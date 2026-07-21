// EazyPost Design System Generator
// Builds Color Styles, Text Styles, and reference component frames on a new
// Figma page, sourced from DESIGN_SYSTEM.md (repo root).
// Run once via Figma > Plugins > Development > (import this) > Run.

// ---------------------------------------------------------------------------
// Tokens (kept in sync with DESIGN_SYSTEM.md — update both together)
// ---------------------------------------------------------------------------

const COLORS = {
  brand: [
    { hex: "#040028", name: "Navy", role: "Navbar / Footer bg, dark ink text" },
    { hex: "#174CD2", name: "Brand Blue", role: "Primary — dominant CTA/link/accent color" },
    { hex: "#FFFFFF", name: "White", role: "Base background, text-on-blue", border: true },
    { hex: "#D2E823", name: "Lime (proposed)", role: "4th accent — NOT yet confirmed by client" },
  ],
  blueVariants: [
    { hex: "#174CD2", name: "Blue / Default", role: "Navbar, Footer, FAQ, Contact, most CTAs" },
    { hex: "#184CD1", name: "Blue / Tarifs+Checkout", role: "/tarifs cards+table, /checkout" },
    { hex: "#061492", name: "Blue / Canaux", role: "/canaux/* channel template accent" },
  ],
  ink: [
    { hex: "#040028", name: "Navy", role: "Primary ink" },
    { hex: "#000B33", name: "Navy / Tarifs", role: "/tarifs price + heading text" },
    { hex: "#0D0303", name: "Near-black / Tarifs", role: "/tarifs subtitle text" },
    { hex: "#12141D", name: "Ink / Pour (deviation)", role: "/pour/pme + /pour/agences only — flagged inconsistency" },
  ],
  neutrals: [
    { hex: "#D9D9D9", name: "Input border", role: "Auth page input borders" },
    { hex: "#8E8E8E", name: "Placeholder", role: "Auth page placeholder text" },
    { hex: "#8D8D8D", name: "Placeholder / Contact", role: "ContactSection placeholder text" },
    { hex: "#717171", name: "Secondary text", role: "ContactSection subtitle" },
    { hex: "#C4C4C4", name: "Avatar placeholder", role: "/pour/* avatar backgrounds" },
    { hex: "#E0E0E0", name: "Radio unselected", role: "ContactSection radio dots" },
  ],
  utility: [
    { hex: "#EF4444", name: "Red 500", role: "Errors, cross icons" },
    { hex: "#16A34A", name: "Green 600", role: "Checkmarks" },
    { hex: "#C9FAD6", name: "Coming Soon bg", role: "/tarifs pill background" },
    { hex: "#1AA703", name: "Coming Soon text", role: "/tarifs pill text" },
    { hex: "#FFFDE8", name: "Tooltip bg", role: "/tarifs info popover" },
    { hex: "#FFB342", name: "Tooltip border", role: "/tarifs info popover border" },
  ],
};

// Rubik weight -> Figma Google Font style name
const RUBIK_WEIGHT = {
  400: "Regular",
  500: "Medium",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
};

const TYPE_SPECIMENS = [
  { family: "Rubik One", weight: 400, size: 88, label: "Display / Hero — 3xl (2000px+)", sample: "Boost your online presence" },
  { family: "Rubik One", weight: 400, size: 70, label: "Display / Hero — lg", sample: "Contactez-nous" },
  { family: "Rubik One", weight: 400, size: 48, label: "Display / Mid", sample: "Comparison" },
  { family: "Rubik One", weight: 400, size: 36, label: "Display / Small (eyebrow)", sample: "EazyPost" },
  { family: "Rubik", weight: 900, size: 66, label: "Body / Black — hero numerals", sample: "1 500 FCFA" },
  { family: "Rubik", weight: 700, size: 24, label: "Body / Bold — card heading", sample: "Créateurs & Influenceurs" },
  { family: "Rubik", weight: 500, size: 20, label: "Body / Medium — lead paragraph", sample: "Des tarifs adaptés à chaque étape de votre croissance." },
  { family: "Rubik", weight: 400, size: 16, label: "Body / Regular — default text", sample: "Planifiez, programmez et automatisez votre contenu." },
  { family: "Rubik", weight: 500, size: 14, label: "UI / Medium — form label, nav link", sample: "Adresse e-mail" },
  { family: "Rubik", weight: 700, size: 12, label: "UI / Bold — fine print, footer link", sample: "Fonctionnalités" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255,
  };
}

const loadedFonts = new Set();
async function ensureFont(family, weight) {
  const style = RUBIK_WEIGHT[weight] || "Regular";
  const key = `${family}__${style}`;
  if (loadedFonts.has(key)) return { family, style };
  try {
    await figma.loadFontAsync({ family, style });
    loadedFonts.add(key);
    return { family, style };
  } catch (e) {
    // Fallback if Rubik/Rubik One aren't resolvable in this Figma environment.
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    loadedFonts.add("Inter__Regular");
    return { family: "Inter", style: "Regular" };
  }
}

function autoFrame(name, direction, spacing, padding) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = direction; // 'VERTICAL' | 'HORIZONTAL'
  f.itemSpacing = spacing;
  f.paddingLeft = f.paddingRight = padding;
  f.paddingTop = f.paddingBottom = padding;
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.fills = [];
  f.strokeWeight = 0;
  return f;
}

async function makeText(content, family, weight, size, colorHex, extra) {
  const font = await ensureFont(family, weight);
  const t = figma.createText();
  t.fontName = font;
  t.fontSize = size;
  t.characters = content;
  t.fills = [{ type: "SOLID", color: hexToRgb(colorHex || "#040028") }];
  if (extra && extra.letterSpacing) t.letterSpacing = { value: extra.letterSpacing, unit: "PIXELS" };
  if (extra && extra.lineHeightPct) t.lineHeight = { value: extra.lineHeightPct, unit: "PERCENT" };
  return t;
}

function sectionHeader(title, subtitle) {
  const wrap = autoFrame(`Section — ${title}`, "VERTICAL", 4, 0);
  return { wrap, title, subtitle };
}

// ---------------------------------------------------------------------------
// Color style registration + swatch builder
// ---------------------------------------------------------------------------

const paintStyleCache = {};

function getOrCreatePaintStyle(hex, groupLabel, name) {
  const key = `${groupLabel}/${name}/${hex}`;
  if (paintStyleCache[key]) return paintStyleCache[key];
  const style = figma.createPaintStyle();
  style.name = `EazyPost/${groupLabel}/${name}`;
  style.paints = [{ type: "SOLID", color: hexToRgb(hex) }];
  paintStyleCache[key] = style;
  return style;
}

async function buildSwatch(entry, groupLabel) {
  const row = autoFrame(`Swatch — ${entry.name}`, "HORIZONTAL", 16, 0);
  row.counterAxisAlignItems = "CENTER";

  const chip = figma.createRectangle();
  chip.resize(64, 64);
  chip.cornerRadius = 12;
  const style = getOrCreatePaintStyle(entry.hex, groupLabel, entry.name);
  chip.fillStyleId = style.id;
  if (entry.border) {
    chip.strokes = [{ type: "SOLID", color: hexToRgb("#E5E5E5") }];
    chip.strokeWeight = 1;
  }
  row.appendChild(chip);

  const textCol = autoFrame("labels", "VERTICAL", 2, 0);
  textCol.appendChild(await makeText(entry.name, "Rubik", 700, 16, "#040028"));
  textCol.appendChild(await makeText(entry.hex.toUpperCase(), "Rubik", 500, 13, "#174CD2"));
  textCol.appendChild(await makeText(entry.role, "Rubik", 400, 12, "#717171"));
  row.appendChild(textCol);

  return row;
}

async function buildColorGroup(title, entries) {
  const wrap = autoFrame(`Colors — ${title}`, "VERTICAL", 16, 0);
  wrap.appendChild(await makeText(title, "Rubik", 800, 20, "#040028"));
  const grid = autoFrame("grid", "VERTICAL", 12, 0);
  for (const entry of entries) {
    grid.appendChild(await buildSwatch(entry, title));
  }
  wrap.appendChild(grid);
  return wrap;
}

// ---------------------------------------------------------------------------
// Typography section
// ---------------------------------------------------------------------------

async function buildTypographySection() {
  const wrap = autoFrame("Typography", "VERTICAL", 20, 0);
  wrap.appendChild(await makeText("Typography — Rubik + Rubik One only", "Rubik", 800, 20, "#040028"));

  for (const spec of TYPE_SPECIMENS) {
    const row = autoFrame(spec.label, "VERTICAL", 4, 16);
    row.fills = [{ type: "SOLID", color: hexToRgb("#FAFAFA") }];
    row.cornerRadius = 10;
    row.counterAxisSizingMode = "AUTO";

    const meta = await makeText(
      `${spec.label}  ·  ${spec.family} ${spec.weight}  ·  ${spec.size}px`,
      "Rubik", 500, 11, "#717171"
    );
    row.appendChild(meta);

    const sample = await makeText(spec.sample, spec.family, spec.weight, spec.size, "#040028");
    sample.textAutoResize = "WIDTH_AND_HEIGHT";
    row.appendChild(sample);

    // Register a matching Text Style so it's usable from Figma's style picker.
    const ts = figma.createTextStyle();
    ts.name = `EazyPost/${spec.label}`;
    const font = await ensureFont(spec.family, spec.weight);
    ts.fontName = font;
    ts.fontSize = spec.size;

    wrap.appendChild(row);
  }
  return wrap;
}

// ---------------------------------------------------------------------------
// Buttons section
// ---------------------------------------------------------------------------

async function pillButton(label, bgHex, textHex, height, radius, border) {
  const btn = figma.createFrame();
  btn.name = `Button — ${label}`;
  btn.layoutMode = "HORIZONTAL";
  btn.primaryAxisAlignItems = "CENTER";
  btn.counterAxisAlignItems = "CENTER";
  btn.primaryAxisSizingMode = "AUTO";
  btn.counterAxisSizingMode = "AUTO";
  btn.paddingLeft = btn.paddingRight = 30;
  btn.paddingTop = btn.paddingBottom = (height - 24) / 2;
  btn.cornerRadius = radius;
  btn.fills = bgHex ? [{ type: "SOLID", color: hexToRgb(bgHex) }] : [];
  if (border) {
    btn.strokes = [{ type: "SOLID", color: hexToRgb(border) }];
    btn.strokeWeight = 2;
  }
  const t = await makeText(label, "Rubik", 800, 14, textHex);
  btn.appendChild(t);
  return btn;
}

async function buildButtonsSection() {
  const wrap = autoFrame("Buttons & CTAs", "VERTICAL", 20, 0);
  wrap.appendChild(await makeText("Buttons & CTAs", "Rubik", 800, 20, "#040028"));

  const row = autoFrame("button row", "HORIZONTAL", 24, 0);
  row.counterAxisAlignItems = "CENTER";
  row.fills = [{ type: "SOLID", color: hexToRgb("#F4F4F4") }];
  row.cornerRadius = 16;
  row.paddingLeft = row.paddingRight = row.paddingTop = row.paddingBottom = 32;

  row.appendChild(await pillButton("Start for free", "#174CD2", "#FFFFFF", 62, 999, null));

  const navyChip = figma.createFrame();
  navyChip.name = "Navbar CTA context";
  navyChip.layoutMode = "HORIZONTAL";
  navyChip.primaryAxisSizingMode = "AUTO";
  navyChip.counterAxisSizingMode = "AUTO";
  navyChip.fills = [{ type: "SOLID", color: hexToRgb("#040028") }];
  navyChip.cornerRadius = 16;
  navyChip.paddingLeft = navyChip.paddingRight = navyChip.paddingTop = navyChip.paddingBottom = 20;
  navyChip.appendChild(await pillButton("Sign up", null, "#FFFFFF", 48, 16, "#FFFFFF"));
  row.appendChild(navyChip);

  row.appendChild(await pillButton("Get Started", "#184CD1", "#FFFFFF", 40, 4, null));

  const toggle = autoFrame("toggle", "HORIZONTAL", 0, 0);
  const monthly = await pillButton("Monthly", "#184CD1", "#FFFFFF", 53, 0, null);
  monthly.cornerRadius = 0;
  monthly.topLeftRadius = monthly.bottomLeftRadius = 5;
  const yearly = await pillButton("Yearly  -20%", "#FFFFFF", "#000000", 53, 0, "#000000");
  yearly.cornerRadius = 0;
  yearly.topRightRadius = yearly.bottomRightRadius = 5;
  toggle.appendChild(monthly);
  toggle.appendChild(yearly);
  row.appendChild(toggle);

  wrap.appendChild(row);
  return wrap;
}

// ---------------------------------------------------------------------------
// Cards section
// ---------------------------------------------------------------------------

async function buildFaqCard() {
  const card = figma.createFrame();
  card.name = "Card — FAQ accordion (open)";
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "FIXED";
  card.resize(420, card.height);
  card.cornerRadius = 10;
  card.fills = [{ type: "SOLID", color: hexToRgb("#FFFFFF") }];
  card.strokes = [{ type: "SOLID", color: hexToRgb("#F1F5F9") }];
  card.strokeWeight = 1;
  card.paddingLeft = card.paddingRight = 30;
  card.paddingTop = card.paddingBottom = 20;
  card.itemSpacing = 12;

  const headerRow = autoFrame("header", "HORIZONTAL", 12, 0);
  headerRow.counterAxisAlignItems = "CENTER";
  headerRow.primaryAxisSizingMode = "FIXED";
  headerRow.resize(360, headerRow.height);
  headerRow.primaryAxisAlignItems = "SPACE_BETWEEN";
  headerRow.appendChild(await makeText("Qu'est-ce qu'Eazypost exactement ?", "Rubik", 500, 16, "#000000"));

  const toggle = figma.createEllipse();
  toggle.resize(36, 36);
  toggle.fills = [{ type: "SOLID", color: hexToRgb("#174CD2") }];
  headerRow.appendChild(toggle);

  card.appendChild(headerRow);
  card.appendChild(await makeText(
    "Eazypost est une plateforme web qui te permet de gérer tous tes réseaux sociaux au même endroit.",
    "Rubik", 400, 14, "#334155"
  ));
  return card;
}

async function buildPricingCardMini() {
  const card = figma.createFrame();
  card.name = "Card — Pricing (popular / dark)";
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "FIXED";
  card.resize(280, card.height);
  card.cornerRadius = 9;
  card.fills = [{ type: "SOLID", color: hexToRgb("#184CD1") }];
  card.paddingLeft = card.paddingRight = 28;
  card.paddingTop = card.paddingBottom = 30;
  card.itemSpacing = 14;

  const badge = autoFrame("badge", "HORIZONTAL", 0, 0);
  badge.fills = [{ type: "SOLID", color: hexToRgb("#F1F1F1") }];
  badge.cornerRadius = 6;
  badge.paddingLeft = badge.paddingRight = 14;
  badge.paddingTop = badge.paddingBottom = 6;
  badge.appendChild(await makeText("ESSENTIAL", "Rubik", 700, 12, "#000B33"));
  card.appendChild(badge);

  card.appendChild(await makeText("1 500 FCFA", "Rubik", 700, 40, "#FFFFFF"));
  card.appendChild(await makeText("Per member, per month", "Rubik", 700, 12, "#FFFFFF"));

  const cta = await pillButton("Get Started", "#FFFFFF", "#000B6B", 44, 4, null);
  card.appendChild(cta);
  return card;
}

async function buildFeatureCardMini() {
  const card = figma.createFrame();
  card.name = "Card — Feature (lime)";
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "FIXED";
  card.resize(260, card.height);
  card.cornerRadius = 32;
  card.fills = [{ type: "SOLID", color: hexToRgb("#D2E823") }];
  card.paddingLeft = card.paddingRight = card.paddingTop = card.paddingBottom = 32;
  card.itemSpacing = 16;

  card.appendChild(await makeText("Unlimited posts", "Rubik", 800, 20, "#040028"));
  card.appendChild(await makeText(
    "Schedule as many posts per channel as you need.",
    "Rubik", 400, 13, "#040028"
  ));
  return card;
}

async function buildCardsSection() {
  const wrap = autoFrame("Cards", "VERTICAL", 20, 0);
  wrap.appendChild(await makeText("Cards", "Rubik", 800, 20, "#040028"));
  const row = autoFrame("card row", "HORIZONTAL", 24, 0);
  row.counterAxisAlignItems = "MIN";
  row.appendChild(await buildPricingCardMini());
  row.appendChild(await buildFeatureCardMini());
  row.appendChild(await buildFaqCard());
  wrap.appendChild(row);
  return wrap;
}

// ---------------------------------------------------------------------------
// Inputs section
// ---------------------------------------------------------------------------

async function buildBoxedInput() {
  const wrap = autoFrame("Input — Pattern A (boxed, auth pages)", "VERTICAL", 6, 0);
  wrap.appendChild(await makeText("Email address", "Rubik", 500, 14, "#000000"));
  const box = figma.createFrame();
  box.resize(320, 48);
  box.cornerRadius = 10;
  box.fills = [{ type: "SOLID", color: hexToRgb("#FFFFFF") }];
  box.strokes = [{ type: "SOLID", color: hexToRgb("#D9D9D9") }];
  box.strokeWeight = 1;
  box.layoutMode = "HORIZONTAL";
  box.counterAxisAlignItems = "CENTER";
  box.paddingLeft = box.paddingRight = 10;
  box.appendChild(await makeText("Enter your email", "Rubik", 500, 14, "#8E8E8E"));
  wrap.appendChild(box);
  return wrap;
}

async function buildUnderlineInput() {
  const wrap = autoFrame("Input — Pattern B (underline, checkout/contact)", "VERTICAL", 6, 0);
  wrap.appendChild(await makeText("First Name", "Rubik", 500, 12, "#000000"));

  // Underline-only field: text + a 1px bottom rule (no box, no radius, no background).
  const col = autoFrame("field", "VERTICAL", 4, 0);
  col.appendChild(await makeText("Donfack", "Rubik", 500, 14, "#000000"));
  const line = figma.createRectangle();
  line.resize(320, 1);
  line.fills = [{ type: "SOLID", color: hexToRgb("#000000") }];
  col.appendChild(line);
  wrap.appendChild(col);
  return wrap;
}

async function buildCheckboxAndRadio() {
  const wrap = autoFrame("Checkbox + Radio", "VERTICAL", 14, 0);

  const checkRow = autoFrame("checkbox", "HORIZONTAL", 10, 0);
  checkRow.counterAxisAlignItems = "CENTER";
  const check = figma.createFrame();
  check.resize(14, 14);
  check.cornerRadius = 2;
  check.fills = [{ type: "SOLID", color: hexToRgb("#174CD2") }];
  checkRow.appendChild(check);
  checkRow.appendChild(await makeText("I agree to the Terms of Service", "Rubik", 500, 12, "#000000"));
  wrap.appendChild(checkRow);

  const radioRow = autoFrame("radio", "HORIZONTAL", 10, 0);
  radioRow.counterAxisAlignItems = "CENTER";
  const radioOuter = figma.createEllipse();
  radioOuter.resize(13, 13);
  radioOuter.fills = [{ type: "SOLID", color: hexToRgb("#174CD2") }];
  radioRow.appendChild(radioOuter);
  radioRow.appendChild(await makeText("Features & Demo", "Rubik", 400, 12, "#000000"));
  wrap.appendChild(radioRow);

  return wrap;
}

async function buildInputsSection() {
  const wrap = autoFrame("Forms & Inputs", "VERTICAL", 20, 0);
  wrap.appendChild(await makeText("Forms & Inputs", "Rubik", 800, 20, "#040028"));
  const row = autoFrame("input row", "HORIZONTAL", 40, 0);
  row.appendChild(await buildBoxedInput());
  row.appendChild(await buildUnderlineInput());
  row.appendChild(await buildCheckboxAndRadio());
  wrap.appendChild(row);
  return wrap;
}

// ---------------------------------------------------------------------------
// Radius reference
// ---------------------------------------------------------------------------

async function buildRadiusSection() {
  const wrap = autoFrame("Border Radius Scale", "VERTICAL", 20, 0);
  wrap.appendChild(await makeText("Border Radius Scale", "Rubik", 800, 20, "#040028"));
  const row = autoFrame("radius row", "HORIZONTAL", 24, 0);
  row.counterAxisAlignItems = "CENTER";

  const radii = [
    { r: 4, label: "4px — tarifs/checkout" },
    { r: 9, label: "9px — pricing card" },
    { r: 10, label: "10px — default card/input" },
    { r: 16, label: "16px — large card" },
    { r: 32, label: "32px — feature card" },
    { r: 999, label: "full — pills" },
  ];
  for (const item of radii) {
    const col = autoFrame(item.label, "VERTICAL", 8, 0);
    col.counterAxisAlignItems = "CENTER";
    const box = figma.createRectangle();
    box.resize(72, 72);
    box.cornerRadius = item.r;
    box.fills = [{ type: "SOLID", color: hexToRgb("#174CD2") }];
    col.appendChild(box);
    col.appendChild(await makeText(item.label, "Rubik", 500, 11, "#717171"));
    row.appendChild(col);
  }
  wrap.appendChild(row);
  return wrap;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const page = figma.createPage();
  page.name = "EazyPost — Design System";
  figma.currentPage = page;

  const root = autoFrame("EazyPost Design System", "VERTICAL", 64, 64);
  root.fills = [{ type: "SOLID", color: hexToRgb("#FFFFFF") }];
  root.x = 0;
  root.y = 0;

  // Cover
  const cover = autoFrame("Cover", "VERTICAL", 8, 0);
  cover.appendChild(await makeText("EazyPost", "Rubik One", 400, 48, "#174CD2"));
  cover.appendChild(await makeText("Design System — source of truth, generated from DESIGN_SYSTEM.md", "Rubik", 500, 16, "#717171"));
  root.appendChild(cover);

  root.appendChild(await buildColorGroup("Brand", COLORS.brand));
  root.appendChild(await buildColorGroup("Blue Variants", COLORS.blueVariants));
  root.appendChild(await buildColorGroup("Ink", COLORS.ink));
  root.appendChild(await buildColorGroup("Neutrals", COLORS.neutrals));
  root.appendChild(await buildColorGroup("Utility", COLORS.utility));

  root.appendChild(await buildTypographySection());
  root.appendChild(await buildButtonsSection());
  root.appendChild(await buildCardsSection());
  root.appendChild(await buildInputsSection());
  root.appendChild(await buildRadiusSection());

  page.appendChild(root);

  figma.viewport.scrollAndZoomIntoView([root]);
  figma.closePlugin("EazyPost Design System generated on a new page ✅");
}

main().catch((err) => {
  console.error(err);
  figma.closePlugin(`Failed: ${err.message}`);
});
