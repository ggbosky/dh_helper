/*
  Deník Hokeje – vykreslovač postů (Canvas 2D)
  Jeden kód pro aplikaci Studio i pro export z Claude Code (tools/render-post.mjs).

  Šablony:
    titulek    – fotka přes celý slajd, červený přechod zleva shora, tmavý spodek,
                 krátký nadpis s podtržením a hlavní text s *červeně zvýrazněnými* slovy
    slovnicek  – fotka bez překryvu, patkový pojem a drobný popis (série „hokejový slovníček“)

  Formáty: ig (1080×1350, Instagram + Facebook), tt (1080×1920, TikTok), yt (1280×720, YouTube)

  Použití:
    await DH.ready();                       // načte fonty
    DH.render(canvas, spec, { photo, wordmark });
*/
(function (global) {
  "use strict";

  var RED = "#FE0000";
  var FORMATS = {
    ig: { w: 1080, h: 1350, label: "Instagram / Facebook 4:5" },
    tt: { w: 1080, h: 1920, label: "TikTok 9:16" },
    yt: { w: 1280, h: 720, label: "YouTube 16:9" }
  };
  var WORDMARK_COLORS = { dark: "#181818", light: "#FFFFFF", gold: "#C9A44C" };

  var FONTS = {
    kicker: "800 {s}px Montserrat, 'Arial Black', sans-serif",
    headline: "700 {s}px Roboto, Arial, sans-serif",
    term: "700 {s}px Gelasio, Georgia, serif",
    desc: "400 {s}px 'Open Sans', Arial, sans-serif"
  };
  function font(kind, size) { return FONTS[kind].replace("{s}", Math.round(size)); }

  // Rozvržení podle formátu (hodnoty v px pro daný formát)
  var LAYOUT = {
    ig: { pad: 78, bottom: 78, wmX: 46, wmY: 40, wmW: 150, kicker: 86, headline: 90, maxW: 860 },
    tt: { pad: 78, bottom: 430, wmX: 46, wmY: 150, wmW: 165, kicker: 96, headline: 104, maxW: 860 },
    yt: { pad: 64, bottom: 50, wmX: 40, wmY: 34, wmW: 150, kicker: 64, headline: 180, maxW: 820 }
  };

  function ready() {
    if (!global.document || !document.fonts) return Promise.resolve();
    var faces = [font("kicker", 40), font("headline", 40), font("term", 40), font("desc", 20),
      "900 40px Roboto", "500 40px Roboto"];
    var sample = "ĚŠČŘŽÝÁÍÉŮÚěščřžýáíéůú";
    return Promise.all(faces.map(function (f) { return document.fonts.load(f, sample); }))
      .then(function () { return document.fonts.ready; });
  }

  // ---------- pomocné funkce ----------

  function drawCover(ctx, img, W, H, fit) {
    fit = fit || {};
    var zoom = Math.max(1, fit.zoom || 1);
    var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    var scale = Math.max(W / iw, H / ih) * zoom;
    var dw = iw * scale, dh = ih * scale;
    var fx = fit.x == null ? 0.5 : fit.x, fy = fit.y == null ? 0.5 : fit.y;
    var dx = (W - dw) * fx, dy = (H - dh) * fy;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function drawPlaceholder(ctx, W, H) {
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#3a3f47");
    g.addColorStop(1, "#15171b");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.06)";
    ctx.lineWidth = 2;
    for (var x = -H; x < W; x += 46) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke(); }
    ctx.restore();
  }

  function sampleLuma(ctx, x, y, w, h) {
    try {
      var d = ctx.getImageData(Math.max(0, x | 0), Math.max(0, y | 0), Math.max(1, w | 0), Math.max(1, h | 0)).data;
      var sum = 0, n = 0;
      for (var i = 0; i < d.length; i += 16) { sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; n++; }
      return n ? sum / n : 0;
    } catch (e) { return 0; }
  }

  var tintCache = {};
  function tinted(img, color) {
    var key = (img.src || "wm") + color;
    if (tintCache[key]) return tintCache[key];
    var c = document.createElement("canvas");
    c.width = img.naturalWidth || img.width;
    c.height = img.naturalHeight || img.height;
    var x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = "source-in";
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    tintCache[key] = c;
    return c;
  }

  function drawWordmark(ctx, wm, mode, L, autoBg) {
    if (!wm || mode === "none") return;
    var w = L.wmW, h = w * (wm.naturalHeight || wm.height) / (wm.naturalWidth || wm.width);
    if (mode === "auto" || !mode) mode = autoBg(L.wmX, L.wmY, w, h) > 140 ? "dark" : "light";
    ctx.drawImage(tinted(wm, WORDMARK_COLORS[mode] || mode), L.wmX, L.wmY, w, h);
  }

  // Rozdělí text s *zvýrazněním* na slova se stylem
  function tokens(text) {
    var out = [], red = false;
    String(text || "").split(/(\*)/).forEach(function (part) {
      if (part === "*") { red = !red; return; }
      part.split(/(\s+)/).forEach(function (w) {
        if (!w) return;
        if (/^\s+$/.test(w)) { if (w.indexOf("\n") >= 0) out.push({ br: true }); else out.push({ sp: true }); }
        else out.push({ t: w, red: red });
      });
    });
    return out;
  }

  function wrap(ctx, toks, maxW, letter) {
    var lines = [[]], width = 0, space = ctx.measureText(" ").width;
    var pendingSpace = false;
    toks.forEach(function (tk) {
      if (tk.br) { lines.push([]); width = 0; pendingSpace = false; return; }
      if (tk.sp) { pendingSpace = true; return; }
      var w = ctx.measureText(tk.t).width + letter * tk.t.length;
      var line = lines[lines.length - 1];
      var add = (line.length && pendingSpace ? space : 0) + w;
      if (line.length && width + add > maxW) { lines.push([]); line = lines[lines.length - 1]; width = 0; add = w; }
      if (line.length && pendingSpace) line.push({ sp: true, w: space });
      line.push({ t: tk.t, red: tk.red, w: w });
      width += add;
      pendingSpace = false;
    });
    return lines.filter(function (l, i) { return l.length || i < lines.length - 1; });
  }

  function lineWidth(line) { return line.reduce(function (s, p) { return s + p.w; }, 0); }

  function drawRuns(ctx, line, x, y, color, letter) {
    line.forEach(function (p) {
      if (!p.sp) {
        ctx.fillStyle = p.red ? RED : color;
        if (letter && "letterSpacing" in ctx) ctx.letterSpacing = letter + "px";
        ctx.fillText(p.t, x, y);
      }
      x += p.w;
    });
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  }

  // Ručně tažená linka pod nadpisem (štětec, ztenčené konce)
  function drawSwoosh(ctx, x, y, len, thick) {
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(x, y + thick * 0.35);
    ctx.quadraticCurveTo(x + len * 0.35, y - thick * 0.75, x + len, y - thick * 0.05);
    ctx.quadraticCurveTo(x + len * 0.55, y + thick * 0.55, x + len * 0.06, y + thick * 1.05);
    ctx.quadraticCurveTo(x - thick * 0.3, y + thick * 0.9, x, y + thick * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ---------- šablony ----------

  function renderTitulek(ctx, W, H, spec, assets, L) {
    if (assets.photo) drawCover(ctx, assets.photo, W, H, spec.fit); else drawPlaceholder(ctx, W, H);
    var autoBg = function (x, y, w, h) { return sampleLuma(ctx, x, y, w, h); };

    // Červený přechod zleva shora
    var strength = spec.redStrength == null ? 1 : spec.redStrength;
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    var g1 = ctx.createLinearGradient(0, 0, W * 0.78, H * 0.5);
    g1.addColorStop(0, "rgba(255,40,40," + (0.95 * strength) + ")");
    g1.addColorStop(0.55, "rgba(255,60,60," + (0.55 * strength) + ")");
    g1.addColorStop(1, "rgba(255,90,90,0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
    var g2 = ctx.createLinearGradient(0, 0, W * 0.72, H * 0.48);
    g2.addColorStop(0, "rgba(200,0,0," + (0.62 * strength) + ")");
    g2.addColorStop(0.5, "rgba(190,0,0," + (0.3 * strength) + ")");
    g2.addColorStop(1, "rgba(180,0,0,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Text: nejdřív rozměřit, pak podle výšky bloku ztmavit spodek
    var maxW = Math.min(L.maxW, W - L.pad * 2);
    var hSize = spec.headlineSize || L.headline;
    var toks = tokens(spec.headline);
    var lines, lh;
    for (var guard = 0; guard < 30; guard++) {
      ctx.font = font("headline", hSize);
      lines = wrap(ctx, toks, maxW, -0.6);
      if (lines.length <= (spec.maxLines || 4) || hSize < 40) break;
      hSize -= 4;
    }
    lh = hSize * 1.1;
    var kSize = spec.kickerSize || L.kicker;
    var hasKicker = !!(spec.kicker && String(spec.kicker).trim());
    var blockH = lines.length * lh + (hasKicker ? kSize * 0.95 + kSize * 0.62 + 6 : 0);
    var baseBottom = H - L.bottom;
    var headTop = baseBottom - lines.length * lh;
    var textTop = headTop - (hasKicker ? kSize * 0.95 + kSize * 0.62 : 0);

    // Tmavý spodek: plynulý přechod do černé pod textem
    var fadeStart = Math.max(0, textTop - H * 0.26);
    var fadeEnd = headTop + lh * 0.9;
    var g3 = ctx.createLinearGradient(0, fadeStart, 0, fadeEnd);
    g3.addColorStop(0, "rgba(0,0,0,0)");
    g3.addColorStop(0.35, "rgba(0,0,0,.45)");
    g3.addColorStop(0.7, "rgba(0,0,0,.85)");
    g3.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = g3;
    ctx.fillRect(0, Math.floor(fadeStart), W, H - Math.floor(fadeStart));

    drawWordmark(ctx, assets.wordmark, spec.wordmark || "dark", L, autoBg);

    ctx.textBaseline = "alphabetic";
    if (hasKicker) {
      ctx.font = font("kicker", kSize);
      if ("letterSpacing" in ctx) ctx.letterSpacing = "-1px";
      var kBase = textTop + kSize * 0.78;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(spec.kicker, L.pad, kBase);
      var kw = ctx.measureText(spec.kicker).width;
      if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
      drawSwoosh(ctx, L.pad - 2, kBase + kSize * 0.3, kw + kSize * 0.18, Math.max(4, kSize * 0.075));
    }
    ctx.font = font("headline", hSize);
    lines.forEach(function (line, i) {
      drawRuns(ctx, line, L.pad, headTop + lh * (i + 1) - lh * 0.22, "#FFFFFF", -0.6);
    });
    return { lines: lines.length, headlineSize: hSize, blockH: blockH };
  }

  function renderSlovnicek(ctx, W, H, spec, assets, L) {
    if (assets.photo) drawCover(ctx, assets.photo, W, H, spec.fit); else drawPlaceholder(ctx, W, H);
    var autoBg = function (x, y, w, h) { return sampleLuma(ctx, x, y, w, h); };
    drawWordmark(ctx, assets.wordmark, spec.wordmark || "auto", L, autoBg);

    var x = spec.textX != null ? spec.textX * W : 46;
    var tSize = spec.termSize || 68;
    var dSize = spec.descSize || 21;
    var baseY = (spec.textY != null ? spec.textY : 0.62) * H;

    ctx.font = font("desc", dSize);
    var descMax = spec.descWidth || 430;
    var dLines = wrap(ctx, tokens(spec.desc), descMax, 0);
    var dLh = dSize * 1.38;

    var color = spec.textColor;
    if (!color || color === "auto") {
      color = sampleLuma(ctx, x, baseY - tSize, Math.max(descMax, tSize * 5), tSize + dLh * dLines.length + 20) > 140 ? "dark" : "light";
    }
    var fill = color === "dark" ? "#0D0D0D" : "#FFFFFF";
    var shadow = color === "dark" ? "rgba(255,255,255,0)" : "rgba(0,0,0,.35)";

    ctx.save();
    ctx.shadowColor = shadow;
    ctx.shadowBlur = color === "dark" ? 0 : 10;
    ctx.fillStyle = fill;
    ctx.font = font("term", tSize);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "-0.5px";
    ctx.fillText(spec.term || "", x - tSize * 0.03, baseY);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    ctx.font = font("desc", dSize);
    dLines.forEach(function (line, i) { drawRuns(ctx, line, x, baseY + dSize * 1.15 + dLh * i + dSize * 0.25, fill, 0); });
    ctx.restore();
    return { color: color };
  }

  function render(canvas, spec, assets) {
    spec = spec || {};
    assets = assets || {};
    var fmt = FORMATS[spec.format] ? spec.format : (spec.template === "thumb" ? "yt" : "ig");
    var W = FORMATS[fmt].w, H = FORMATS[fmt].h, L = LAYOUT[fmt];
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;
    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0, 0, W, H);
    if (spec.template === "slovnicek") return renderSlovnicek(ctx, W, H, spec, assets, L);
    return renderTitulek(ctx, W, H, spec, assets, L);
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error("Obrázek se nepodařilo načíst: " + src)); };
      img.src = src;
    });
  }

  global.DH = { FORMATS: FORMATS, RED: RED, ready: ready, render: render, loadImage: loadImage, tokens: tokens };
})(typeof window !== "undefined" ? window : this);
