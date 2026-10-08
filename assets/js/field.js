(function () {
  "use strict";
  const D = document, R = D.documentElement;
  const wrap = D.querySelector("[data-field]");
  if (!wrap) return;
  const canvas = wrap.querySelector("canvas");
  const Q = new URLSearchParams(location.search);
  const SHOT = Q.has("shot");
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NARROW = () => innerWidth < 821;
  const CELL_D = 7, CELL_M = 5.5, CELL_ASPECT = 1.3, MAX_DPR = 1.5, ANALYSE_W = 640, FPS_2D = 10;
  const SCRIPTS = [
    ".'`,-:;ilrcvxjtfnouzeskaywhbdpqgLTIJFCEPVXYZKHNUDOABSGQRMW",
    ".:;174235960%#&@8",
    "·'`:-~=+<>^*!?/\\|()[]{}$%#&@※◆■",
    "ㆍㅡㅣㄱㄴㅅㅇ이시가나다고미사김한국말를뜻했빛쀍뛟뽥",
    "丶一二人十口日山円中本字東雨金重電雷黒圖鑑繁鬱龍黑",
    "ヽノーヘニトハミソシアカサタナマヤラワンヲヨネホボギズぬゐゑ"
  ];
  const BANDS = 14;
  const GLYPH_FONT = "\"Geist Mono\",\"Hiragino Sans\",\"Hiragino Kaku Gothic ProN\",\"Apple SD Gothic Neo\",\"PingFang SC\",\"Noto Sans CJK SC\",\"Noto Sans CJK JP\",\"Noto Sans CJK KR\",\"Noto Sans KR\",\"Microsoft YaHei\",\"Malgun Gothic\",\"Yu Gothic\",ui-monospace,Menlo,monospace";
  const ON = [192, 254, 4], DENS = 1, SPEED = 1, FLICK = .026;
  const GAIN_D = +(wrap.dataset.gain || 1), GAIN_M = +(wrap.dataset.gainM || GAIN_D);
  const gain = () => NARROW() ? GAIN_M : GAIN_D;
  const LEVELS = [.4, .996];

  const nums = (s, d) => { const a = String(s || "").split(",").map(Number); return a.length === d.length && a.every(Number.isFinite) ? a : null; };
  const windows = Array.from(D.querySelectorAll("[data-field-window]"));
  const CFG = {};
  windows.forEach((w, i) => {
    const k = w.dataset.fieldKey || "f" + i;
    w.dataset.fieldKey = k;
    if (!w.dataset.fieldSrc) return;
    CFG[k] = {
      img: w.dataset.fieldSrc,
      f: nums(w.dataset.fieldFocus, [0, 0]) || [.5, .5],
      fm: nums(w.dataset.fieldFocusM, [0, 0]),
      z: +(w.dataset.fieldZoom || 1), zm: +(w.dataset.fieldZoomM || w.dataset.fieldZoom || 1),
      inv: w.dataset.fieldInv === "1",
      lv: w.dataset.fieldLv ? +w.dataset.fieldLv : null,
      wz: nums(w.dataset.fieldWander, [0, 0, 0, 0]),
      wzm: nums(w.dataset.fieldWanderM, [0, 0, 0, 0]),
      src: w.dataset.fieldLabel || ""
    };
  });
  if (!Object.keys(CFG).length) return;

  const st = { w: 0, h: 0, cell: 1, cw: 0, ch: 0, t: 7.3, key: null, prev: null, mix: 1, mixT0: 0, ready: false, visible: !D.hidden, onscreen: true, raf: 0, last: 0, last2d: 0 };
  const lens = { x: -999, y: -999, tx: 0, ty: 0, r: 0, tr: 0, mode: "wander", lastInput: -1e9, fixed: false };
  const TEX = {};
  const atlas = { canvas: null, n: 0, v: 1, cw: 0, ch: 0, tex: null, tint: {} };
  let gl = null, u = {}, ctx = null, poster = false;

  function hash(x, y) { const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return s - Math.floor(s); }
  function smooth(a, b, x) { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); }
  const lensR = () => NARROW() ? Math.round(Math.min(124, innerWidth * .31)) : Math.round(Math.min(170, Math.max(120, innerWidth * .105)));
  const focus = k => { const c = CFG[k] || {}; return NARROW() && c.fm ? c.fm : (c.f || [.5, .5]); };
  const zoom = k => { const c = CFG[k] || {}; return (NARROW() ? c.zm : c.z) || 1; };

  /**
   * @param {number} cw glyph cell width in device px
   * @param {number} ch glyph cell height in device px
   * @returns {{canvas: HTMLCanvasElement, n: number, v: number}}
   */
  function buildAtlas(cw, ch) {
    const paint = list => {
      const c = D.createElement("canvas"); c.width = cw * list.length; c.height = ch;
      const g = c.getContext("2d");
      g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = "500 " + Math.max(5, Math.round(Math.min(ch * .8, cw * 1.06))) + "px " + GLYPH_FONT;
      list.forEach((s, i) => {
        const fit = Math.min(1, cw * .96 / Math.max(1, g.measureText(s).width));
        g.save(); g.beginPath(); g.rect(i * cw, 0, cw, ch); g.clip();
        g.translate(i * cw + cw / 2, ch * .54); g.scale(fit, 1); g.fillText(s, 0, 0);
        g.restore();
      });
      return c;
    };
    const ramps = SCRIPTS.map(set => {
      const chars = Array.from(set), probe = paint(chars), px = probe.getContext("2d").getImageData(0, 0, probe.width, ch).data;
      const cov = chars.map((s, i) => { let a = 0; for (let y = 0; y < ch; y++) for (let x = i * cw; x < (i + 1) * cw; x++) a += px[(y * probe.width + x) * 4 + 3]; return { s, a }; });
      const sorted = cov.filter(o => o.a > 0).sort((p, q) => p.a - q.a).map(o => o.s);
      return sorted.length ? sorted : chars;
    });
    const V = ramps.length, list = new Array(V).fill(" ");
    for (let b = 1; b < BANDS; b++) ramps.forEach(r => list.push(r[Math.round((b - 1) * (r.length - 1) / (BANDS - 2))]));
    return { canvas: paint(list), n: BANDS, v: V };
  }

  function ensureAtlas(force) {
    if (!force && atlas.canvas && atlas.cw === st.cw && atlas.ch === st.ch) return;
    Object.assign(atlas, buildAtlas(st.cw, st.ch), { cw: st.cw, ch: st.ch, tint: {} });
    if (gl) {
      if (atlas.tex) gl.deleteTexture(atlas.tex);
      gl.activeTexture(gl.TEXTURE2);
      atlas.tex = makeTex(atlas.canvas, gl.NEAREST);
    }
  }

  const VS = "#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const FS = "#version 300 es\nprecision highp float;" +
    "uniform sampler2D uTexA,uTexB,uAtlas;uniform vec2 uRes,uCell,uImgA,uImgB,uFocA,uFocB,uLvA,uLvB;uniform float uZA,uZB,uN,uV,uFlick;uniform vec3 uLens,uOn;uniform float uT,uDens,uMix,uInvA,uInvB;out vec4 o;" +
    "float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}" +
    "vec2 cover(vec2 uv,vec2 im,vec2 f,float z){float ca=uRes.x/uRes.y,ia=im.x/im.y;vec2 s=(ca>ia?vec2(1.,ia/ca):vec2(ca/ia,1.))/z;return uv*s+(1.-s)*f;}" +
    "float lum(sampler2D t,vec2 uv,float inv){vec3 c=texture(t,clamp(uv,0.,1.)).rgb;float l=.25*max(c.r,max(c.g,c.b))+.75*dot(c,vec3(.299,.587,.114));return mix(l,1.-l,inv);}" +
    "float tone(float L,vec2 lv){return clamp((L-lv.x)/(lv.y-lv.x),0.,1.);}" +
    "float sampleL(vec2 uv,vec2 off){float a=tone(lum(uTexA,cover(uv,uImgA,uFocA,uZA)+off,uInvA),uLvA);float b=tone(lum(uTexB,cover(uv,uImgB,uFocB,uZB)+off,uInvB),uLvB);return mix(a,b,uMix);}" +
    "void main(){vec2 px=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);vec2 cell=floor(px/uCell);vec2 cpx=(cell+.5)*uCell;vec2 uv=cpx/uRes;vec2 lp=px-cell*uCell;float t=uT;float tq=floor(t*2.);" +
    "vec2 off=vec2(step(.986,h(vec2(cell.y,tq)))*(h(vec2(cell.y,tq+7.))-.5)*.03,0.);" +
    "float L=pow(sampleL(uv,off),1.12);L+=smoothstep(.05,0.,abs(uv.y-fract(t*.035)))*.08;L+=(h(cell+fract(tq*.37)*91.)-.5)*.05;" +
    "L*=smoothstep(0.,.05,uv.x)*smoothstep(1.,.95,uv.x)*smoothstep(0.,.04,uv.y)*smoothstep(1.,.96,uv.y);L*=uDens;" +
    "float ld=length(cpx-uLens.xy);float k=uLens.z>1.?smoothstep(uLens.z*.5,uLens.z*1.02,ld):1.;L*=k;" +
    "L=clamp(L,0.,1.);float g=L*(uN-1.)+(h(cell)-.5)*1.4;float slot=floor(t*2.2+h(cell+3.1)*9.);float hot=step(1.-uFlick,h(cell+slot*.173));g+=hot*(h(cell+slot)-.5)*uN*.7;" +
    "g=clamp(floor(g+.5),0.,uN-1.);if(L<.05&&hot<.5)g=0.;" +
    "float drift=floor(t*.22+h(cell+5.7)*9.);float vr=min(uV-1.,floor(h(cell+drift*.311+hot*slot*.07)*uV));" +
    "float a=texelFetch(uAtlas,ivec2(int(g*uV+vr)*int(uCell.x)+int(lp.x),int(lp.y)),0).a;" +
    "vec3 col=uOn*a*(.3+.85*L);col=mix(col,vec3(a),hot*.35*step(.1,L));" +
    "if(uLens.z>1.){float rr=abs(length(px-uLens.xy)-uLens.z*1.07);float an=atan(px.y-uLens.y,px.x-uLens.x);if(rr<.9&&fract(an*11.459+uT*.15)<.45)col=uOn;}" +
    "o=vec4(col,1.);}";

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const cssW = D.documentElement.clientWidth || innerWidth, cssH = innerHeight;
    st.cw = Math.max(5, Math.round((NARROW() ? CELL_M : CELL_D) * dpr));
    st.ch = Math.round(st.cw * CELL_ASPECT);
    st.w = Math.ceil(cssW * dpr); st.h = Math.ceil(cssH * dpr);
    st.cell = 1 / dpr;
    canvas.width = st.w; canvas.height = st.h;
    canvas.style.width = (st.w / dpr) + "px";
    canvas.style.height = (st.h / dpr) + "px";
    if (gl) gl.viewport(0, 0, st.w, st.h);
    if (!poster) ensureAtlas(false);
    lens.tr = lens.tr ? lensR() : 0;
    applyFocusCSS();
  }

  function analyse(img, inv, lv) {
    const sc = Math.min(1, ANALYSE_W / img.naturalWidth);
    const iw = Math.max(1, Math.round(img.naturalWidth * sc)), ih = Math.max(1, Math.round(img.naturalHeight * sc));
    const off = D.createElement("canvas"); off.width = iw; off.height = ih;
    const oc = off.getContext("2d"); oc.drawImage(img, 0, 0, iw, ih);
    const px = oc.getImageData(0, 0, iw, ih).data;
    const lum = new Float32Array(iw * ih);
    for (let i = 0; i < iw * ih; i++) {
      const r = px[i * 4] / 255, g = px[i * 4 + 1] / 255, b = px[i * 4 + 2] / 255;
      const l = .25 * Math.max(r, g, b) + .75 * (.299 * r + .587 * g + .114 * b);
      lum[i] = inv ? 1 - l : l;
    }
    const sorted = Float32Array.from(lum).sort();
    const lo = sorted[Math.floor(sorted.length * (lv || LEVELS[0]))];
    const hi = Math.max(lo + .1, sorted[Math.floor(sorted.length * LEVELS[1])]);
    return { iw, ih, lum, lo, hi, canvas: off };
  }

  function loadImg(url) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => res(img);
      img.onerror = () => rej(new Error("image failed: " + url));
      img.src = url;
    });
  }

  function makeTex(source, filter) {
    const t = gl.createTexture(), f = filter || gl.LINEAR;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    return t;
  }

  function mobileSrc(url) {
    return NARROW() && /\/assets\/img\/kit\/[^/]+\.jpg$/.test(url) && !/-m\.jpg$/.test(url) ? url.replace(/\.jpg$/, "-m.jpg") : url;
  }

  function ensure(key) {
    if (TEX[key]) return TEX[key].p;
    const entry = {}, c = CFG[key], small = mobileSrc(c.img);
    entry.p = (small === c.img ? loadImg(c.img) : loadImg(small).catch(() => loadImg(c.img))).then(img => {
      entry.img = img;
      try { Object.assign(entry, analyse(img, c.inv, c.lv), { ok: true }); }
      catch (err) { entry.tainted = true; return entry; }
      if (gl) { gl.activeTexture(gl.TEXTURE0); entry.tex = makeTex(entry.canvas); }
      return entry;
    }).catch(err => { console.warn("[ml field]", err.message); entry.fail = true; return entry; });
    TEX[key] = entry;
    return entry.p;
  }

  function initGL() {
    if (Q.get("gl") === "0") return false;
    gl = canvas.getContext("webgl2", { antialias: false, alpha: false, preserveDrawingBuffer: SHOT, powerPreference: "low-power" });
    if (!gl) return false;
    const sh = (type, srcText) => { const s = gl.createShader(type); gl.shaderSource(s, srcText); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    try {
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      const vb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vb);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ["uZA", "uZB", "uTexA", "uTexB", "uAtlas", "uRes", "uCell", "uN", "uV", "uFlick", "uImgA", "uImgB", "uFocA", "uFocB", "uLvA", "uLvB", "uLens", "uOn", "uT", "uDens", "uMix", "uInvA", "uInvB"].forEach(n => { u[n] = gl.getUniformLocation(prog, n); });
      gl.uniform1i(u.uTexA, 0); gl.uniform1i(u.uTexB, 1); gl.uniform1i(u.uAtlas, 2);
      return true;
    } catch (err) {
      console.warn("[ml field] webgl2 off, 2d fallback:", err.message);
      gl = null;
      return false;
    }
  }

  function breath() { return SHOT || RM ? 1 : .92 + .08 * Math.sin(st.t * .45); }
  const flick = () => SHOT || RM ? 0 : FLICK;

  function drawGL() {
    const A = TEX[st.prev] && TEX[st.prev].ok ? TEX[st.prev] : TEX[st.key];
    const Bt = TEX[st.key];
    if (!A || !Bt || !Bt.ok || !atlas.tex) return;
    const on = ON;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A.tex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, Bt.tex);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, atlas.tex);
    const ka = A === Bt ? st.key : st.prev, fa = focus(ka), fb = focus(st.key);
    gl.uniform2f(u.uRes, st.w, st.h);
    gl.uniform2f(u.uCell, st.cw, st.ch);
    gl.uniform1f(u.uN, atlas.n);
    gl.uniform1f(u.uV, atlas.v);
    gl.uniform1f(u.uFlick, flick());
    gl.uniform2f(u.uImgA, A.iw, A.ih); gl.uniform2f(u.uImgB, Bt.iw, Bt.ih);
    gl.uniform2f(u.uFocA, fa[0], fa[1]); gl.uniform2f(u.uFocB, fb[0], fb[1]);
    gl.uniform1f(u.uZA, zoom(ka)); gl.uniform1f(u.uZB, zoom(st.key));
    gl.uniform2f(u.uLvA, A.lo, A.hi); gl.uniform2f(u.uLvB, Bt.lo, Bt.hi);
    gl.uniform1f(u.uInvA, CFG[ka].inv ? 1 : 0); gl.uniform1f(u.uInvB, CFG[st.key].inv ? 1 : 0);
    gl.uniform1f(u.uMix, A === Bt ? 1 : st.mix);
    gl.uniform1f(u.uT, st.t);
    gl.uniform1f(u.uDens, DENS * gain() * breath());
    gl.uniform3f(u.uOn, on[0] / 255, on[1] / 255, on[2] / 255);
    gl.uniform3f(u.uLens, lens.x / st.cell, lens.y / st.cell, lens.r / st.cell);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /**
   * @param {number} level brightness bucket 0..3
   * @returns {HTMLCanvasElement}
   */
  function tinted(level) {
    const key = String(level);
    if (atlas.tint[key]) return atlas.tint[key];
    const c = D.createElement("canvas"); c.width = atlas.canvas.width; c.height = atlas.canvas.height;
    const g = c.getContext("2d"), on = ON;
    g.drawImage(atlas.canvas, 0, 0);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = "rgba(" + on.join(",") + "," + (.35 + level * .22).toFixed(2) + ")";
    g.fillRect(0, 0, c.width, c.height);
    return (atlas.tint[key] = c);
  }

  function draw2D() {
    const T = TEX[st.key];
    if (!T || !T.ok || !atlas.canvas) return;
    const { w, h, cw, ch } = st, cols = Math.ceil(w / cw), rows = Math.ceil(h / ch);
    const ca = w / h, ia = T.iw / T.ih;
    const z = zoom(st.key), sx = (ca > ia ? 1 : ca / ia) / z, sy = (ca > ia ? ia / ca : 1) / z;
    const f = focus(st.key), dens = DENS * gain(), N = atlas.n, V = atlas.v, fl = flick();
    const lx = lens.x / st.cell, ly = lens.y / st.cell, lr = lens.r / st.cell, slotT = st.t * 2.2;
    const sheets = [0, 1, 2, 3].map(tinted);
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < rows; y++) {
      const cy = (y + .5) * ch, v = cy / h, iy = v * sy + (1 - sy) * f[1];
      for (let x = 0; x < cols; x++) {
        const cx = (x + .5) * cw, uu = cx / w, ix = uu * sx + (1 - sx) * f[0];
        const jx = Math.min(T.iw - 1, Math.max(0, (ix * T.iw) | 0)), jy = Math.min(T.ih - 1, Math.max(0, (iy * T.ih) | 0));
        let L = Math.pow(Math.min(1, Math.max(0, (T.lum[jy * T.iw + jx] - T.lo) / (T.hi - T.lo))), 1.12);
        L *= smooth(0, .05, uu) * smooth(1, .95, uu) * smooth(0, .04, v) * smooth(1, .96, v) * dens;
        if (lr > 1) L *= smooth(lr * .5, lr * 1.02, Math.hypot(cx - lx, cy - ly));
        const slot = Math.floor(slotT + hash(x + 3.1, y + 3.1) * 9);
        const hot = hash(x + slot * .173, y + slot * .173) > 1 - fl;
        let g = L * (N - 1) + (hash(x, y) - .5) * 1.4 + (hot ? (hash(x + slot, y + slot) - .5) * N * .7 : 0);
        g = Math.max(0, Math.min(N - 1, Math.round(g)));
        if ((L < .05 && !hot) || g === 0) continue;
        const drift = Math.floor(st.t * .22 + hash(x + 5.7, y + 5.7) * 9);
        const vr = Math.min(V - 1, Math.floor(hash(x + drift * .311 + (hot ? slot * .07 : 0), y + drift * .311) * V));
        ctx.drawImage(sheets[Math.min(3, (L * 4) | 0)], (g * V + vr) * cw, 0, cw, ch, x * cw, y * ch, cw, ch);
      }
    }
  }

  function render() { if (st.ready && !poster) { if (gl) drawGL(); else if (ctx) draw2D(); } }

  function applyFocusCSS() {
    const k = st.key; if (!k) return;
    const f = focus(k), T = TEX[k], img = T && T.img;
    if (img && img.naturalWidth) { const sc = Math.max(innerWidth / img.naturalWidth, innerHeight / img.naturalHeight) * zoom(k); wrap.style.setProperty("--bs", Math.ceil(img.naturalWidth * sc) + "px " + Math.ceil(img.naturalHeight * sc) + "px"); }
    wrap.style.setProperty("--fx", (f[0] * 100).toFixed(1) + "%");
    wrap.style.setProperty("--fy", (f[1] * 100).toFixed(1) + "%");
  }
  const readouts = Array.from(D.querySelectorAll("[data-lens-readout]"));
  const modeLbls = Array.from(D.querySelectorAll("[data-lens-mode]"));
  let lastRead = "";
  function paintLens() {
    wrap.style.setProperty("--lx", lens.x.toFixed(1) + "px");
    wrap.style.setProperty("--ly", lens.y.toFixed(1) + "px");
    wrap.style.setProperty("--lr", lens.r.toFixed(1) + "px");
    wrap.classList.toggle("is-lens", lens.r > 4);
    const txt = "X " + String(Math.max(0, Math.round(lens.x))).padStart(4, "0") + " // Y " + String(Math.max(0, Math.round(lens.y))).padStart(4, "0");
    if (txt !== lastRead) { lastRead = txt; readouts.forEach(e => { e.textContent = txt; }); }
    const m = window.ML_I18N ? window.ML_I18N.t("field.mode") : "";
    modeLbls.forEach(e => { if (e.textContent !== m) e.textContent = m; });
  }

  function wanderTarget(now) {
    const t = now / 1000, W = innerWidth, H = innerHeight;
    const c = CFG[st.key] || {};
    let wz = (NARROW() ? c.wzm : c.wz) || [.5, .5, .34, .28];
    if (NARROW() && hero) { const r = hero.getBoundingClientRect(); const top = Math.max(0, r.top), bot = Math.min(H, r.bottom); if (bot - top > 120) wz = [wz[0], (top + (bot - top) * .45) / H, wz[2], Math.min(wz[3], (bot - top) * .3 / H)]; }
    return { x: W * (wz[0] + wz[2] * Math.sin(t * .17)), y: H * (wz[1] + wz[3] * Math.sin(t * .23 + 1.3)) };
  }
  const hero = D.querySelector("[data-lens-zone]");

  function stepLens(now) {
    const idle = now - lens.lastInput > (lens.mode === "touch" ? 2200 : 2600);
    if (!lens.fixed && idle && lens.mode !== "wander") lens.mode = "wander";
    if (lens.mode === "wander" && !lens.fixed) { const p = wanderTarget(now); lens.tx = p.x; lens.ty = p.y; lens.tr = lensR() * .86; }
    const k = lens.mode === "wander" ? .035 : lens.mode === "touch" ? .3 : .2;
    if (lens.x < -900) { lens.x = lens.tx; lens.y = lens.ty; }
    lens.x += (lens.tx - lens.x) * k; lens.y += (lens.ty - lens.y) * k;
    lens.r += (lens.tr - lens.r) * .09;
    paintLens();
  }


  function frame(now) {
    st.raf = 0;
    if (!running()) return;
    const dt = Math.min(.1, (now - st.last) / 1000); st.last = now;
    st.t += dt * SPEED;
    if (st.mix < 1) st.mix = Math.min(1, (now - st.mixT0) / 700);
    if (st.mix >= 1 && st.prev) st.prev = null;
    stepLens(now);
    if (gl || now - st.last2d > 1000 / FPS_2D) { st.last2d = now; render(); }
    st.raf = requestAnimationFrame(frame);
  }
  function running() { return st.ready && !poster && st.visible && st.onscreen && !RM && !SHOT; }
  function start() { if (!st.raf && running()) { st.last = performance.now(); st.raf = requestAnimationFrame(frame); } }

  function pointAt(x, y, mode) {
    lens.mode = mode; lens.tx = x; lens.ty = y; lens.lastInput = performance.now(); lens.fixed = false;
    lens.tr = lensR();
    if (RM || SHOT || !st.ready) { lens.x = x; lens.y = y; lens.r = lens.tr; paintLens(); render(); }
    start();
  }
  addEventListener("pointermove", e => { if (e.pointerType === "mouse" || e.pointerType === "pen") pointAt(e.clientX, e.clientY, "pointer"); }, { passive: true });
  D.addEventListener("pointerleave", () => { lens.lastInput = performance.now() - 1500; });
  const inZone = t => !hero || (t.target && t.target.closest && t.target.closest("[data-lens-zone],[data-field-window]"));
  const onTouch = e => { const t = e.touches[0]; if (t && inZone(e)) pointAt(t.clientX, t.clientY, "touch"); };
  addEventListener("touchstart", onTouch, { passive: true });
  addEventListener("touchmove", onTouch, { passive: true });
  addEventListener("touchend", () => { lens.lastInput = performance.now(); }, { passive: true });

  D.addEventListener("visibilitychange", () => { st.visible = !D.hidden; start(); });
  let rz = 0;
  addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { size(); render(); }, 120); });

  if ("IntersectionObserver" in window) {
    const seen = new Set();
    const io = new IntersectionObserver(es => {
      es.forEach(en => { if (en.isIntersecting) seen.add(en.target); else seen.delete(en.target); });
      st.onscreen = seen.size > 0;
      start();
    });
    windows.forEach(w => io.observe(w));
  }

  function setLabel(c) { D.querySelectorAll("[data-field-src-label]").forEach(e => { if (c.src) e.textContent = c.src; }); }
  function setKey(key) {
    if (!key || key === st.key || !CFG[key]) return;
    const prevKey = st.key;
    ensure(key).then(entry => {
      if (entry.fail) return;
      const c = CFG[key];
      if (entry.tainted && !poster) { poster = true; wrap.classList.add("is-poster"); }
      if (st.key && st.key !== key && !RM && !SHOT && gl && !poster) { st.prev = prevKey; st.mix = 0; st.mixT0 = performance.now(); }
      st.key = key;
      wrap.style.setProperty("--img", "url(\"" + new URL(c.img, location.href).href + "\")");
      wrap.dataset.key = key;
      applyFocusCSS();
      setLabel(c);
      if (!st.ready) boot(); else { render(); start(); }
    });
  }

  function boot() {
    if (!poster && !initGL()) ctx = canvas.getContext("2d", { alpha: false });
    R.classList.add(poster ? "field-poster" : gl ? "field-gl" : "field-2d");
    size();
    st.ready = true;
    const lp = nums(Q.get("lens"), [0, 0]);
    if (lp) {
      lens.x = lens.tx = lp[0]; lens.y = lens.ty = lp[1]; lens.r = lens.tr = lensR(); lens.fixed = true; lens.mode = "pointer";
      lens.lastInput = performance.now() + 4000;
    } else if (SHOT || RM) { lens.r = lens.tr = 0; }
    else { lens.r = lensR() * .55; }
    paintLens();
    Object.values(TEX).forEach(e => { if (e.ok && gl && !e.tex) { gl.activeTexture(gl.TEXTURE0); e.tex = makeTex(e.canvas); } });
    render();
    R.classList.add("field-ready");
    start();
    if (!poster && D.fonts && D.fonts.load) D.fonts.load("500 20px \"Geist Mono\"").then(() => { ensureAtlas(true); render(); }).catch(() => {});
  }

  function nearest() {
    let best = null, bestD = 1e9;
    const mid = innerHeight / 2;
    windows.forEach(w => {
      if (!CFG[w.dataset.fieldKey]) return;
      const r = w.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const d = Math.abs((r.top + r.bottom) / 2 - mid);
      if (d < bestD) { bestD = d; best = w; }
    });
    return best;
  }
  let ticking = false;
  function onScroll() {
    ticking = false;
    const w = nearest(); if (!w) return;
    setKey(w.dataset.fieldKey);
    const i = windows.indexOf(w), next = windows[i + 1];
    if (next && CFG[next.dataset.fieldKey]) ensure(next.dataset.fieldKey);
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  window.MLField = { setKey, preload: k => CFG[k] && ensure(k), get key() { return st.key; } };
  const first = nearest() || windows.find(w => CFG[w.dataset.fieldKey]);
  setKey(first.dataset.fieldKey);
})();
