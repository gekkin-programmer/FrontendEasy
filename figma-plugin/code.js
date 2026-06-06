// ────────────────────────────────────────────────────────────
//  EasyPost V2 — Hero Section (pixel-accurate bg + content)
//  Background: grid pattern (40px), radial fade, noise, stickers
// ────────────────────────────────────────────────────────────

const PAGE_W = 1440;
const HERO_H = 720;
const ACCENT = { r: 0.235, g: 0.282, b: 0.961 };
const WHITE = { r: 1, g: 1, b: 1 };
const BLACK = { r: 0.05, g: 0.05, b: 0.05 };
const GRAY = { r: 0.82, g: 0.82, b: 0.82 };
const GRAY_700 = { r: 0.37, g: 0.37, b: 0.37 };

function n(val, def) { return val !== null && val !== undefined ? val : def; }

var FONTS_LOADED = false;
async function ensureFonts() {
  if (FONTS_LOADED) return;
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" }),
    figma.loadFontAsync({ family: "Inter", style: "Black" }),
    figma.loadFontAsync({ family: "Inter", style: "Medium" }),
  ]);
  FONTS_LOADED = true;
}

function txt(content, size, weight, color, opts) {
  var t = figma.createText();
  t.characters = content;
  t.fontSize = size || 14;
  t.fontName = { family: "Inter", style: weight || "Regular" };
  t.fills = [{ type: "SOLID", color: color || BLACK }];
  t.lineHeight = { value: size * 1.35, unit: "PIXELS" };
  if (opts) {
    if (opts.letterSpacing) t.letterSpacing = opts.letterSpacing;
    if (opts.textCase) t.textCase = opts.textCase;
    if (opts.textAlign) t.textAlignHorizontal = opts.textAlign;
  }
  return t;
}

function plh(w, h, color) {
  var r = figma.createRectangle();
  r.resize(w, h);
  r.fills = [{ type: "SOLID", color: color || GRAY }];
  return r;
}

function absFrame(name, w, h, fill) {
  var f = figma.createFrame();
  f.name = name;
  f.resize(w, h);
  f.fills = fill ? [{ type: "SOLID", color: { r: fill.r, g: fill.g, b: fill.b } }] : [];
  f.layoutMode = "NONE";
  f.clipsContent = false;
  return f;
}

function autoRow(gap) {
  var f = figma.createFrame();
  f.layoutMode = "HORIZONTAL";
  f.itemSpacing = gap || 8;
  f.counterAxisAlignItems = "CENTER";
  f.fills = [];
  return f;
}

function autoCol(gap) {
  var f = figma.createFrame();
  f.layoutMode = "VERTICAL";
  f.itemSpacing = gap || 8;
  f.counterAxisAlignItems = "CENTER";
  f.fills = [];
  return f;
}

// ════════════════════════════════════════════════════════════
//  HERO SECTION
// ════════════════════════════════════════════════════════════

function buildHero() {
  var hero = absFrame("Hero", PAGE_W, HERO_H, WHITE);
  hero.clipsContent = true;

  // ── Layer 1: GRID PATTERN ───────────────────────────────
  // linear-gradient(#000 1px, transparent 1px)  40px spacing
  // opacity: 0.3, mask: radial-gradient(ellipse at 50% 70%, black 30%, transparent 75%)
  var gridLayer = absFrame("Grid", PAGE_W, HERO_H);
  gridLayer.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 0 } }];

  // Horizontal lines every 40px
  for (var y = 0; y <= HERO_H; y += 40) {
    var hl = figma.createRectangle();
    hl.resize(PAGE_W, 1);
    hl.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0, a: 0.3 } }];
    hl.x = 0;
    hl.y = y;
    gridLayer.appendChild(hl);
  }
  // Vertical lines every 40px
  for (var x = 0; x <= PAGE_W; x += 40) {
    var vl = figma.createRectangle();
    vl.resize(1, HERO_H);
    vl.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0, a: 0.3 } }];
    vl.x = x;
    vl.y = 0;
    gridLayer.appendChild(vl);
  }
  hero.appendChild(gridLayer);

  // ── Layer 2: RADIAL FADE (simulates CSS mask) ───────────
  // radial-gradient(ellipse at 50% 70%, black 30%, transparent 75%)
  // In Figma: white rect on top with radial gradient (transparent center → white edges)
  var fade = figma.createRectangle();
  fade.name = "GridFade";
  fade.resize(PAGE_W, HERO_H);
  fade.fills = [{
    type: "GRADIENT_RADIAL",
    gradientTransform: [
      [0.5, 0, 0.5],
      [0, 0.7, 0.7],
    ],
    gradientStops: [
      { position: 0, color: { r: 1, g: 1, b: 1, a: 0 } },
      { position: 0.3, color: { r: 1, g: 1, b: 1, a: 0 } },
      { position: 0.55, color: { r: 1, g: 1, b: 1, a: 0.3 } },
      { position: 0.75, color: { r: 1, g: 1, b: 1, a: 0.7 } },
      { position: 1, color: { r: 1, g: 1, b: 1, a: 1 } },
    ],
  }];
  hero.appendChild(fade);

  // ── Layer 3: NOISE TEXTURE (approximation) ──────────────
  // The real code uses SVG feTurbulence filter
  // Approximate with a very low opacity black fill
  var noise = absFrame("Noise", PAGE_W, HERO_H, { r: 0, g: 0, b: 0, a: 0.03 });
  hero.appendChild(noise);

  // ── Layer 4: FLOATING STICKERS ──────────────────────────
  // 17 social media icons with tape effect and wacky border-radius
  // Position conversion: % → px for 1440×720
  var stickers = [
    // Left side
    { x: 72, y: 86, color: "#FF0000", rot: -5 },     // FaYoutube
    { x: 43, y: 576, color: "#E1306C", rot: 12 },    // FaInstagram
    { x: 115, y: 360, color: "#000000", rot: -8 },   // SiTiktok
    { x: 173, y: 432, color: "#E60023", rot: 4 },    // FaPinterestP
    { x: 216, y: 180, color: "#4A154B", rot: -15 },  // FaSlack
    { x: 288, y: 648, color: "#9146FF", rot: 6 },    // SiTwitch
    { x: 1080, y: 252, color: "#6364FF", rot: -9 },  // FaMastodon
    { x: 29, y: 504, color: "#25D366", rot: 7 },     // FaWhatsapp
    { x: 432, y: 612, color: "#FFFC00", rot: 5 },    // FaSnapchat
    { x: 403, y: 108, color: "#26A5E4", rot: -7 },   // FaTelegram
    // Right side
    { x: 1325, y: 58, color: "#1DA1F2", rot: 10 },   // FaTwitter
    { x: 1411, y: 324, color: "#0A66C2", rot: -6 },  // FaLinkedinIn
    { x: 1296, y: 648, color: "#1877F2", rot: 8 },   // FaFacebookF
    { x: 1224, y: 144, color: "#000000", rot: -12 }, // SiThreads
    { x: 1267, y: 432, color: "#181717", rot: -3 },  // FaGithub
    { x: 1181, y: 360, color: "#000000", rot: 9 },   // SiMedium
    { x: 1368, y: 504, color: "#5865F2", rot: -10 }, // FaDiscord
  ];

  stickers.forEach(function (s, i) {
    // Tape (blue strip above card): w-8 h-3 = 32×12, -top-1.5 = -6px, rotate -5deg
    // Card: p-3 = 12px padding, border-2 black, shadow, icon 24×24
    // Total card size: 24 + 24 = 48×48

    var stickerGroup = absFrame("Sticker_" + i, 48, 56); // 48 card + 8 tape overlap

    // Tape
    var tape = figma.createRectangle();
    tape.resize(32, 12);
    tape.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.94, b: 0.98, a: 0.8 } }];
    tape.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 0.2 } }];
    tape.strokeWeight = 1;
    tape.cornerRadius = 2;
    tape.rotation = -5;
    tape.x = 8;
    tape.y = 0;
    stickerGroup.appendChild(tape);

    // Card
    var card = absFrame("Card", 48, 48, WHITE);
    card.strokes = [{ type: "SOLID", color: BLACK }];
    card.strokeWeight = 2;
    // Wacky border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px
    card.topLeftRadius = 16;
    card.topRightRadius = 4;
    card.bottomRightRadius = 14;
    card.bottomLeftRadius = 4;
    // Shadow: 2px 2px 0px 0px rgba(0,0,0,0.15)
    card.effects = [{
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.15 },
      offset: { x: 2, y: 2 },
      radius: 0,
      visible: true,
      blendMode: "NORMAL",
    }];
    card.x = 0;
    card.y = 6;  // below tape
    stickerGroup.appendChild(card);

    // Icon placeholder (colored box inside card)
    var icon = plh(24, 24);
    // Parse hex color for the icon
    var hex = s.color.replace("#", "");
    var ir = parseInt(hex.slice(0, 2), 16) / 255;
    var ig = parseInt(hex.slice(2, 4), 16) / 255;
    var ib = parseInt(hex.slice(4, 6), 16) / 255;
    icon.fills = [{ type: "SOLID", color: { r: ir, g: ig, b: ib, a: 0.9 } }];
    icon.x = 12;
    icon.y = 18;
    stickerGroup.appendChild(icon);

    stickerGroup.x = s.x;
    stickerGroup.y = s.y;
    stickerGroup.rotation = s.rot;
    hero.appendChild(stickerGroup);
  });

  // ── Layer 5: HERO CONTENT ───────────────────────────────
  // Centered: max-w-7xl container, text-center

  var content = autoCol(20);
  content.x = 80;   // center of 1440 = (1440-1280)/2
  content.y = 110;  // vertical centering: (720 - content_height)/2 ≈ 110
  content.resize(1280, 500);
  content.counterAxisAlignItems = "CENTER";

  // Headline: text-8xl (80px) font-black tracking-tighter
  // "YOUR SOCIAL MEDIA"
  var h1 = txt("YOUR SOCIAL MEDIA", 80, "Black", BLACK, {
    letterSpacing: { value: -5, unit: "PERCENT" },
    textAlign: "CENTER",
  });
  h1.layoutAlign = "STRETCH";
  content.appendChild(h1);

  // "WORKSPACE." in accent color with scribble underline
  var hlRow = autoRow(0);
  hlRow.counterAxisAlignItems = "CENTER";
  hlRow.layoutAlign = "STRETCH";
  hlRow.primaryAxisAlignItems = "CENTER";

  var accentWord = txt("WORKSPACE.", 80, "Black", ACCENT, {
    letterSpacing: { value: -5, unit: "PERCENT" },
    textAlign: "CENTER",
  });
  // Scribble underline: w-110% h-40%, positioned -bottom-2 -left-2
  // SVG path: M5 15 Q 100 25 195 10, stroke #3D49F9, strokeWidth 6, opacity 0.8
  var scribble = figma.createVector();
  scribble.name = "ScribbleUnderline";
  // Use a simple rectangle to approximate the scribble effect
  var scribbleRect = figma.createRectangle();
  scribbleRect.resize(360, 8);
  scribbleRect.fills = [{ type: "SOLID", color: { r: 0.24, g: 0.29, b: 0.98, a: 0.8 } }];
  scribbleRect.cornerRadius = 4;
  scribbleRect.rotation = -2;
  scribbleRect.x = -10;
  scribbleRect.y = 20;

  hlRow.appendChild(accentWord);
  hlRow.appendChild(scribbleRect);
  content.appendChild(hlRow);

  // Subheadline: max-w-2xl (672px), text-2xl (24px) font-medium text-gray-700
  var sub = txt("Stop juggling apps. Plan, schedule, and automate your content across Facebook, TikTok, LinkedIn and more in one place.", 24, "Medium", GRAY_700, {
    textAlign: "CENTER",
  });
  sub.layoutAlign = "STRETCH";
  sub.resize(720, null);
  content.appendChild(sub);

  // Analytics illustration: 140×105, -right-28 -bottom-2
  var analytics = plh(140, 105, GRAY);
  analytics.x = 900;
  analytics.y = 340;
  analytics.opacity = 0.7;
  hero.appendChild(analytics);

  // ── CTAs (gap-6 = 24px) ─────────────────────────────────
  var ctaRow = autoRow(24);
  ctaRow.primaryAxisAlignItems = "CENTER";
  ctaRow.layoutAlign = "STRETCH";

  // Primary CTA: bg-black text-white text-lg (18px) font-bold px-8 py-4 shadow
  var primaryBtn = figma.createFrame();
  primaryBtn.name = "StartFreeTrial";
  primaryBtn.layoutMode = "HORIZONTAL";
  primaryBtn.counterAxisAlignItems = "CENTER";
  primaryBtn.primaryAxisAlignItems = "CENTER";
  primaryBtn.fills = [{ type: "SOLID", color: BLACK }];
  primaryBtn.resize(206, 56);
  primaryBtn.cornerRadius = 2;
  primaryBtn.effects = [{
    type: "DROP_SHADOW",
    color: { r: 0, g: 0, b: 0, a: 0.2 },
    offset: { x: 4, y: 4 },
    radius: 0,
    visible: true,
    blendMode: "NORMAL",
  }];
  primaryBtn.appendChild(txt("Start Free Trial", 18, "Bold", WHITE));
  ctaRow.appendChild(primaryBtn);

  // Secondary CTA: bg-transparent text-black text-lg (18px) font-bold border-2
  var secondaryBtn = figma.createFrame();
  secondaryBtn.name = "ViewPricing";
  secondaryBtn.layoutMode = "HORIZONTAL";
  secondaryBtn.counterAxisAlignItems = "CENTER";
  secondaryBtn.primaryAxisAlignItems = "CENTER";
  secondaryBtn.fills = [];
  secondaryBtn.resize(180, 56);
  secondaryBtn.cornerRadius = 2;
  secondaryBtn.strokes = [{ type: "SOLID", color: BLACK }];
  secondaryBtn.strokeWeight = 2;
  secondaryBtn.appendChild(txt("View Pricing", 18, "Bold"));
  ctaRow.appendChild(secondaryBtn);

  content.appendChild(ctaRow);

  hero.appendChild(content);

  return hero;
}

// ════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════

async function main() {
  await ensureFonts();

  var output = buildHero();

  figma.currentPage.appendChild(output);
  output.x = 4000;
  output.y = 0;

  figma.viewport.scrollAndZoomIntoView([output]);

  figma.notify("Created Hero wireframe!");
  figma.closePlugin();
}

main().catch(function (err) {
  console.error(err);
  figma.notify("Error: " + err.message, { error: true });
  figma.closePlugin();
});
