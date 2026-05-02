(() => {
  if (window.__llmPointerActive) { window.__llmPointerTeardown?.(); return; }
  window.__llmPointerActive = true;

  // ======================== STYLES ========================
  const style = document.createElement("style");
  style.id = "__lp-style";
  style.textContent = `
    .__lp-tint{position:fixed;pointer-events:none;z-index:2147483640;background:rgba(0,0,0,0.45);transition:all .04s ease}
    .__lp-hl{position:fixed;pointer-events:none;z-index:2147483641;border:2px solid #6366f1;border-radius:4px;box-shadow:0 0 0 3px rgba(99,102,241,0.3);transition:all .04s ease;display:none}
    .__lp-lbl-wrap{position:fixed;z-index:2147483643;pointer-events:none;display:none;flex-direction:row;align-items:stretch}
    .__lp-lbl-arrows{display:flex;background:#2a2a3a;border-radius:4px 0 0 4px;overflow:hidden;pointer-events:auto}
    .__lp-lbl-arrows button{width:26px;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}
    .__lp-lbl-arrows button:hover{background:rgba(255,255,255,0.1)}
    .__lp-lbl-arrows button:first-child{border-right:1px solid rgba(255,255,255,0.08)}
    .__lp-lbl-text{background:#1e1b4b;color:#e0e7ff;font:600 11px/1.3 ui-monospace,monospace;padding:4px 10px;border-radius:0 4px 4px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:500px;display:flex;align-items:center}
    .__lp-bar{position:fixed;bottom:0;left:0;right:0;z-index:2147483645;background:#0c0c0f;color:#e0e7ff;font:500 13px/1.4 system-ui,-apple-system,sans-serif;display:flex;align-items:center;padding:10px 16px;gap:12px;box-shadow:0 -4px 24px rgba(0,0,0,0.4);pointer-events:auto;transition:transform .15s ease}
    .__lp-bar.minimized{transform:translateY(100%)}
    .__lp-bar kbd{background:rgba(255,255,255,0.1);border-radius:4px;padding:2px 6px;font:600 10px ui-monospace,monospace;color:rgba(224,231,255,0.6)}
    .__lp-bar-hint{font-size:12px;color:rgba(224,231,255,0.4);white-space:nowrap}
    .__lp-bar-path{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:12px ui-monospace,monospace;color:rgba(224,231,255,0.6)}
    .__lp-btn{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;border:none;padding:0}
    .__lp-btn-rec{background:#dc2626}
    .__lp-btn-stop{background:#2a2a3a}
    .__lp-btn-sm{width:32px;height:32px;border-radius:6px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;border:none;padding:0}
    .__lp-btn-sm:hover{background:rgba(255,255,255,0.12)}
    .__lp-timer{font:600 14px ui-monospace,monospace;color:#f87171;min-width:44px}
    .__lp-dot{width:6px;height:6px;border-radius:50%;background:#dc2626;flex-shrink:0;animation:__lp-blink 1s step-end infinite}
    .__lp-clicks{font:400 11px system-ui,sans-serif;color:rgba(224,231,255,0.25);white-space:nowrap}
    .__lp-toast{position:fixed;bottom:64px;left:50%;transform:translateX(-50%);z-index:2147483646;background:#22c55e;color:#fff;font:600 13px/1.4 system-ui,sans-serif;padding:8px 20px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.25);opacity:0;transition:opacity .2s;pointer-events:none}
    .__lp-toast.show{opacity:1}
    .__lp-toast.err{background:#dc2626}
    .__lp-settings{position:fixed;bottom:58px;right:16px;z-index:2147483646;width:300px;background:#0c0c0f;border:0.5px solid rgba(255,255,255,0.1);border-radius:10px;padding:16px;display:none;flex-direction:column;gap:12px;pointer-events:auto;box-shadow:0 -8px 32px rgba(0,0,0,0.4)}
    .__lp-settings label{font:400 11px system-ui,sans-serif;color:rgba(224,231,255,0.35);display:block;margin-bottom:4px}
    .__lp-settings input,.__lp-settings select{width:100%;background:#1a1a24;border:0.5px solid rgba(255,255,255,0.1);border-radius:6px;padding:8px 10px;color:#e0e7ff;font:13px ui-monospace,monospace;outline:none;box-sizing:border-box}
    .__lp-settings select{font-family:system-ui,-apple-system,sans-serif;cursor:pointer}
    .__lp-settings input:focus,.__lp-settings select:focus{border-color:rgba(99,102,241,0.5)}
    .__lp-settings input::placeholder{color:rgba(224,231,255,0.2)}
    .__lp-mini{position:fixed;bottom:12px;right:16px;z-index:2147483645;width:36px;height:36px;border-radius:8px;background:#0c0c0f;border:0.5px solid rgba(255,255,255,0.1);display:none;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto;box-shadow:0 4px 16px rgba(0,0,0,0.3)}
    .__lp-mini:hover{background:#1a1a24}
    .__lp-spin{animation:__lp-spin .8s linear infinite}
    @keyframes __lp-blink{50%{opacity:0}}
    @keyframes __lp-spin{to{transform:rotate(360deg)}}
  `;
  document.head.appendChild(style);

  // ======================== DOM ========================
  const tints = Array.from({length:4}, () => { const d = document.createElement("div"); d.className = "__lp-tint"; document.body.appendChild(d); return d; });
  const [tT,tB,tL,tR] = tints;
  function positionTint(r) {
    const vw = window.innerWidth, vh = window.innerHeight;
    Object.assign(tT.style,{left:"0",top:"0",width:vw+"px",height:Math.max(0,r.top)+"px",display:"block"});
    Object.assign(tB.style,{left:"0",top:r.bottom+"px",width:vw+"px",height:Math.max(0,vh-r.bottom)+"px",display:"block"});
    Object.assign(tL.style,{left:"0",top:r.top+"px",width:Math.max(0,r.left)+"px",height:r.height+"px",display:"block"});
    Object.assign(tR.style,{left:r.right+"px",top:r.top+"px",width:Math.max(0,vw-r.right)+"px",height:r.height+"px",display:"block"});
  }

  const highlight = document.createElement("div"); highlight.className = "__lp-hl"; document.body.appendChild(highlight);

  // Label with arrows
  const lblWrap = document.createElement("div"); lblWrap.className = "__lp-lbl-wrap";
  const lblArrows = document.createElement("div"); lblArrows.className = "__lp-lbl-arrows";
  const arrowUp = document.createElement("button");
  arrowUp.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="rgba(224,231,255,0.5)" stroke-width="1.5" stroke-linecap="round"><path d="M2 6.5L5 3.5L8 6.5"/></svg>`;
  const arrowDown = document.createElement("button");
  arrowDown.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="rgba(224,231,255,0.5)" stroke-width="1.5" stroke-linecap="round"><path d="M2 3.5L5 6.5L8 3.5"/></svg>`;
  lblArrows.append(arrowUp, arrowDown);
  const lblText = document.createElement("div"); lblText.className = "__lp-lbl-text";
  lblWrap.append(lblArrows, lblText);
  document.body.appendChild(lblWrap);

  const toast = document.createElement("div"); toast.className = "__lp-toast"; document.body.appendChild(toast);
  let toastTimer;
  function showToast(msg, isErr) {
    toast.textContent = msg; toast.className = "__lp-toast show" + (isErr ? " err" : "");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.className = "__lp-toast", 2000);
  }

  // Settings
  const settingsPanel = document.createElement("div"); settingsPanel.className = "__lp-settings";
  settingsPanel.innerHTML = `
    <div style="font:500 13px system-ui,sans-serif;color:rgba(224,231,255,0.7)">Settings</div>
    <div><label>Deepgram API key</label><input type="password" id="__lp-key" placeholder="paste your key here"></div>
    <div><label>Language</label><select id="__lp-lang">
      <option value="multi">🌍 Multilingual (auto)</option>
      <option value="uk">🇺🇦 Українська</option>
      <option value="en">🇬🇧 English</option>
    </select></div>
  `;
  blockEvents(settingsPanel);
  document.body.appendChild(settingsPanel);

  const keyInput = settingsPanel.querySelector("#__lp-key");
  const langSelect = settingsPanel.querySelector("#__lp-lang");
  keyInput.value = localStorage.getItem("lp_deepgram_key") || "";
  langSelect.value = localStorage.getItem("lp_language") || "multi";
  keyInput.addEventListener("change", () => { localStorage.setItem("lp_deepgram_key", keyInput.value.trim()); showToast("✓ Key saved"); });
  langSelect.addEventListener("change", () => { localStorage.setItem("lp_language", langSelect.value); });

  // SVGs
  const GEAR_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="rgba(224,231,255,0.45)"><path d="M6.8 1.6l-.5 1.5a5 5 0 0 0-1.2.7L3.6 3.4l-1.2 2 1 1.2a5 5 0 0 0 0 1.4l-1 1.2 1.2 2 1.5-.4a5 5 0 0 0 1.2.7l.5 1.5h2.4l.5-1.5a5 5 0 0 0 1.2-.7l1.5.4 1.2-2-1-1.2a5 5 0 0 0 0-1.4l1-1.2-1.2-2-1.5.4a5 5 0 0 0-1.2-.7L9.2 1.6H6.8zM8 5.8a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4z" fill-rule="evenodd"/></svg>`;
  const SPINNER_SVG = `<svg width="18" height="18" viewBox="0 0 18 18" class="__lp-spin"><circle cx="9" cy="9" r="7" fill="none" stroke="rgba(224,231,255,0.15)" stroke-width="2"/><path d="M9 2a7 7 0 0 1 7 7" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round"/></svg>`;
  const X_SVG = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(224,231,255,0.45)" stroke-width="1.5" stroke-linecap="round"><path d="M3 3l8 8M11 3l-8 8"/></svg>`;
  const MINIMIZE_SVG = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(224,231,255,0.45)" stroke-width="1.5" stroke-linecap="round"><path d="M3 7h8"/></svg>`;
  const EXPAND_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(224,231,255,0.55)" stroke-width="1.5" stroke-linecap="round"><path d="M4 6l4-3 4 3M4 10l4 3 4-3"/></svg>`;

  // Bar
  const bar = document.createElement("div"); bar.className = "__lp-bar";
  const recBtn = document.createElement("button"); recBtn.className = "__lp-btn __lp-btn-rec";
  recBtn.innerHTML = `<div style="width:12px;height:12px;border-radius:50%;background:#fff"></div>`;
  const timerEl = document.createElement("span"); timerEl.className = "__lp-timer"; timerEl.style.display = "none";
  const dotEl = document.createElement("div"); dotEl.className = "__lp-dot"; dotEl.style.display = "none";
  const clicksEl = document.createElement("span"); clicksEl.className = "__lp-clicks"; clicksEl.style.display = "none";
  const hintEl = document.createElement("span"); hintEl.className = "__lp-bar-hint";
  hintEl.innerHTML = `<kbd>Click</kbd> copy &nbsp;<kbd>↑↓</kbd> layer &nbsp;<kbd>Esc</kbd> exit`;
  const pathEl = document.createElement("span"); pathEl.className = "__lp-bar-path"; pathEl.textContent = "Hover over an element…";
  const minimizeBtn = document.createElement("button"); minimizeBtn.className = "__lp-btn-sm"; minimizeBtn.innerHTML = MINIMIZE_SVG;
  const gearBtn = document.createElement("button"); gearBtn.className = "__lp-btn-sm"; gearBtn.innerHTML = GEAR_SVG;
  const exitBtn = document.createElement("button"); exitBtn.className = "__lp-btn-sm"; exitBtn.innerHTML = X_SVG;
  bar.append(recBtn, timerEl, dotEl, clicksEl, hintEl, pathEl, minimizeBtn, gearBtn, exitBtn);
  blockEvents(bar);
  document.body.appendChild(bar);

  // Mini expand pill (shown when bar is minimized)
  const miniBtn = document.createElement("div"); miniBtn.className = "__lp-mini"; miniBtn.innerHTML = EXPAND_SVG;
  blockEvents(miniBtn);
  document.body.appendChild(miniBtn);

  // ======================== BLOCK EVENTS HELPER ========================
  // Prevent ALL our UI interactions from reaching the page (fixes modal closing)
  function blockEvents(el) {
    ["click","mousedown","mouseup","pointerdown","pointerup","touchstart","touchend"].forEach(evt => {
      el.addEventListener(evt, e => { e.stopPropagation(); e.stopImmediatePropagation(); }, true);
    });
  }

  // ======================== REACT ========================
  function getFiber(el) { const k = Object.keys(el).find(k => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$")); return k ? el[k] : null; }
  function fiberName(f) { if (!f?.type) return null; if (typeof f.type === "string") return null; if (typeof f.type === "function") return f.type.displayName || f.type.name || null; if (f.type?.render) return f.type.render.displayName || f.type.render.name || null; return f.type.displayName || f.type.name || null; }
  const INTERNALS = new Set(["SegmentViewNode","InnerLayoutRouter","OuterLayoutRouter","RedirectErrorBoundary","RedirectBoundary","HTTPAccessFallbackBoundary","LoadingBoundary","ErrorBoundary","LayoutRouterContext","RenderFromTemplateContext","ScrollAndFocusHandler","InnerScrollAndFocusHandler","NotFoundBoundary","Suspense","Fragment","RootLayout","HotReload","ReactDevOverlay","PathnameContextProviderAdapter"]);
  function getComponents(el) { let f = getFiber(el); const c = []; while (f && c.length < 6) { const n = fiberName(f); if (n && n.length > 1 && !INTERNALS.has(n)) c.push(n); f = f._debugOwner || f.return; } return c; }

  // ======================== SELECTOR / PATH ========================
  function shortSelector(el) {
    const parts = []; let node = el;
    while (node && node !== document.body && parts.length < 5) {
      let seg = node.tagName.toLowerCase();
      const id = node.id && !node.id.startsWith("__lp") ? node.id : null;
      const tid = node.getAttribute("data-testid");
      if (id) { seg += "#" + id; parts.unshift(seg); break; }
      if (tid) { seg += '[data-testid="' + tid + '"]'; parts.unshift(seg); break; }
      const cls = Array.from(node.classList).filter(c => !c.match(/^(__|css-|sc-|jsx-|emotion|svelte-)/) && c.length < 30 && !c.match(/^(flex|grid|gap-|p[xytblr]?-|m[xytblr]?-|w-|h-|min-|max-|text-|font-|bg-|border-|rounded|shadow|overflow|items-|justify-|self-|place-|col-|row-|space-|divide-|ring-|outline-|transition|duration|ease|animate|cursor|select|resize|appearance|opacity-|z-|inset-|top-|right-|bottom-|left-|translate|rotate|scale|skew|origin|sr-only|not-sr-only|block|inline|hidden|visible|invisible|static|fixed|absolute|relative|sticky|float|clear|table|contents|list-|decoration-|underline|overline|line-through|no-underline|uppercase|lowercase|capitalize|normal-case|truncate|align-|whitespace-|break-|tracking-|leading-|order-|grow|shrink|basis-|auto|pointer-events|object-)/) && !c.match(/^(dark:|hover:|focus:|active:|disabled:|sm:|md:|lg:|xl:|2xl:)/)).slice(0, 2);
      if (cls.length) seg += "." + cls.join(".");
      if (node.parentElement) { const sibs = Array.from(node.parentElement.children).filter(s => s.tagName === node.tagName); if (sibs.length > 1) seg += ":nth-child(" + (Array.from(node.parentElement.children).indexOf(node) + 1) + ")"; }
      parts.unshift(seg); node = node.parentElement;
    }
    return parts.join(" > ");
  }
  function getVisibleText(el) { let t = ""; for (const ch of el.childNodes) { if (ch.nodeType === 3) t += ch.textContent; } t = t.replace(/\s+/g," ").trim(); if (!t) t = (el.innerText||"").replace(/\s+/g," ").trim(); return t.length > 60 ? t.slice(0,60)+"…" : t; }
  function getSiblingContext(el) {
    const p = el.parentElement; if (!p) return null;
    const s = Array.from(p.children).filter(x => x.tagName === el.tagName); if (s.length <= 1) return null;
    const idx = s.indexOf(el)+1, tot = s.length; let desc = "";
    const pc = Array.from(p.classList);
    if (pc.some(c=>c.includes("grid"))) { const cols = pc.find(c=>c.match(/grid-cols-(\d+)/)); desc = cols ? " in a "+cols.replace("grid-cols-","")+ "-col grid" : " in a grid"; }
    else if (pc.some(c=>c.includes("flex"))) desc = pc.some(c=>c.includes("flex-col")) ? " in a column" : " in a row";
    const sc = getComponents(s[0]); const nm = sc.length ? sc[0]+"s" : el.tagName.toLowerCase()+"s";
    return idx+" of "+tot+" "+nm+desc;
  }
  function getScreenPosition(r) { const vw=window.innerWidth,vh=window.innerHeight,cx=r.left+r.width/2,cy=r.top+r.height/2; return (cy<vh*.33?"top":cy>vh*.66?"bottom":"middle")+"-"+(cx<vw*.33?"left":cx>vw*.66?"right":"center"); }
  function buildElementPath(el) {
    const tag=el.tagName.toLowerCase(),type=el.getAttribute("type"),rect=el.getBoundingClientRect();
    const comps=getComponents(el),text=getVisibleText(el),selector=shortSelector(el),context=getSiblingContext(el),pos=getScreenPosition(rect);
    const L=['## User pointed at this element','"""'];
    L.push("Page: "+location.pathname); L.push("Screen position: "+pos+" (viewport)");
    if(comps.length>=2)L.push("Component: <"+comps[0]+"> in <"+comps[1]+">"); else if(comps.length===1)L.push("Component: <"+comps[0]+">");
    L.push("Selector: "+selector); if(context)L.push("Context: "+context); if(text)L.push('Text: "'+text+'"');
    L.push("Tag: <"+tag+">"+(type?' type="'+type+'"':"")); L.push("Size: "+Math.round(rect.width)+"×"+Math.round(rect.height)+"px"); L.push('"""');
    return L.join("\n");
  }

  // ======================== CLIPBOARD ========================
  function copyText(text) { if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>showToast("✅ Copied!"),()=>fallbackCopy(text));}else fallbackCopy(text); }
  function fallbackCopy(text) { const ta=document.createElement("textarea");ta.value=text;ta.style.cssText="position:fixed;left:-9999px;";document.body.appendChild(ta);ta.select();try{document.execCommand("copy");showToast("✅ Copied!");}catch{showToast("⚠ Copy failed",true);}ta.remove(); }

  // ======================== STATE ========================
  let mode = "picking", selectedEl = null, hovered = null, pickedEl = null, lastPath = "";
  let lastPageX = 0, lastPageY = 0;
  let settingsOpen = false, barMinimized = false;
  let mediaRecorder = null, audioChunks = [], clicks = [], recStartTime = 0, timerInterval = null;

  function isOurs(el) { let n=el; while(n){if(typeof n.className==="string"&&n.className.includes("__lp"))return true;if(n.id?.startsWith("__lp"))return true;n=n.parentElement;}return false; }
  function formatTime(s) { return String(Math.floor(s/60)).padStart(2,"0")+":"+String(Math.floor(s%60)).padStart(2,"0"); }
  function updateTimer() { timerEl.textContent = formatTime((Date.now()-recStartTime)/1000); }

  // ======================== UPDATE SELECTION ========================
  function updateSelection(el) {
    if (!el || isOurs(el)) return;
    selectedEl = el;
    const rect = el.getBoundingClientRect();
    positionTint(rect);
    highlight.style.display = "block";
    Object.assign(highlight.style,{left:(rect.left-2)+"px",top:(rect.top-2)+"px",width:(rect.width+4)+"px",height:(rect.height+4)+"px"});
    const comps = getComponents(el), text = getVisibleText(el);
    let lbl = comps.length ? "<"+comps[0]+">" : el.tagName.toLowerCase();
    if (text) lbl += '  "'+(text.length>25?text.slice(0,25)+"…":text)+'"';
    lblText.textContent = lbl;
    lblWrap.style.display = "flex";
    const lt = rect.top - 32;
    lblWrap.style.top = (lt > 4 ? lt : rect.bottom + 4) + "px";
    lblWrap.style.left = Math.max(4, Math.min(rect.left, window.innerWidth - 560)) + "px";
    pathEl.textContent = comps.length >= 2 ? "<"+comps[0]+"> in <"+comps[1]+">" : lbl;
    lastPath = buildElementPath(el);
  }

  // ======================== LAYER NAVIGATION ========================
  function navigateUp() {
    if (!selectedEl) return;
    const parent = selectedEl.parentElement;
    if (parent && parent !== document.body && parent !== document.documentElement && !isOurs(parent)) {
      updateSelection(parent);
    }
  }
  function navigateDown() {
    if (!selectedEl) return;
    // Prefer descending toward whatever is under the cursor right now — re-evaluated live
    // so we track real cursor position, not the snapshot from the last hover (which can
    // drift after a fallback descent or a page mutation). Fall back to pickedEl if the
    // cursor is currently over our UI.
    const live = document.elementFromPoint(lastPageX, lastPageY);
    const target = (live && !isOurs(live)) ? live : pickedEl;
    if (target && target !== selectedEl && selectedEl.contains(target)) {
      let n = target;
      while (n && n.parentElement !== selectedEl) n = n.parentElement;
      if (n && !isOurs(n)) { updateSelection(n); return; }
    }
    // No cursor path available (cursor is past the leaf or unrelated) — pick the
    // largest visible child as a sensible default.
    let best = null, bestArea = 0;
    for (const c of selectedEl.children) {
      if (isOurs(c)) continue;
      const r = c.getBoundingClientRect();
      const a = r.width * r.height;
      if (a > bestArea) { best = c; bestArea = a; }
    }
    if (best) { pickedEl = best; updateSelection(best); }
  }

  // ======================== BAR STATES ========================
  function setBarPicking() {
    recBtn.className="__lp-btn __lp-btn-rec"; recBtn.innerHTML=`<div style="width:12px;height:12px;border-radius:50%;background:#fff"></div>`;
    timerEl.style.display="none"; dotEl.style.display="none"; clicksEl.style.display="none";
    hintEl.innerHTML=`<kbd>Click</kbd> copy &nbsp;<kbd>↑↓</kbd> layer &nbsp;<kbd>Esc</kbd> exit`; hintEl.style.display="";
  }
  function setBarRecording() {
    recBtn.className="__lp-btn __lp-btn-stop"; recBtn.innerHTML=`<div style="width:12px;height:12px;border-radius:2px;background:#fff"></div>`;
    timerEl.style.display=""; timerEl.textContent="00:00"; dotEl.style.display=""; clicksEl.style.display=""; clicksEl.textContent="0 clicks";
    hintEl.innerHTML=`<kbd>Click</kbd> log element &nbsp;<kbd>↑↓</kbd> layer`;
  }
  function setBarProcessing() {
    recBtn.className="__lp-btn"; recBtn.style.background="rgba(255,255,255,0.06)"; recBtn.innerHTML=SPINNER_SVG;
    timerEl.style.display="none"; dotEl.style.display="none"; clicksEl.style.display="none";
    hintEl.textContent="Transcribing "+formatTime((Date.now()-recStartTime)/1000)+" · "+clicks.length+" clicks…";
  }

  // ======================== BAR MINIMIZE ========================
  function toggleMinimize() {
    barMinimized = !barMinimized;
    bar.classList.toggle("minimized", barMinimized);
    miniBtn.style.display = barMinimized ? "flex" : "none";
  }

  // ======================== RECORDING ========================
  async function startRecording() {
    const key = keyInput.value.trim()||localStorage.getItem("lp_deepgram_key");
    if (!key) { showToast("Set Deepgram API key in settings",true); toggleSettings(true); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      audioChunks=[]; clicks=[]; recStartTime=Date.now(); mode="recording";
      mediaRecorder = new MediaRecorder(stream, {mimeType:"audio/webm;codecs=opus"});
      mediaRecorder.ondataavailable = e => { if(e.data.size>0) audioChunks.push(e.data); };
      mediaRecorder.start(250);
      timerInterval = setInterval(updateTimer, 200);
      setBarRecording();
    } catch(err) {
      showToast("Mic error: "+err.message, true);
    }
  }

  async function stopRecording() {
    if (!mediaRecorder) return;
    mode = "processing"; clearInterval(timerInterval); setBarProcessing();
    const blob = await new Promise(r => { mediaRecorder.onstop = () => r(new Blob(audioChunks,{type:"audio/webm"})); mediaRecorder.stop(); });
    mediaRecorder.stream.getTracks().forEach(t=>t.stop()); mediaRecorder=null;
    const result = await transcribe(blob);
    if (result) { const merged = mergeOutput(result); copyText(merged); }
    mode="picking"; recBtn.style.background=""; setBarPicking();
  }

  async function transcribe(audioBlob) {
    const key=keyInput.value.trim()||localStorage.getItem("lp_deepgram_key")||"";
    const lang=langSelect.value||localStorage.getItem("lp_language")||"multi";
    try {
      const resp = await fetch("https://api.deepgram.com/v1/listen?"+new URLSearchParams({model:"nova-3",language:lang,smart_format:"true",punctuate:"true",utterances:"true",words:"true"}),{method:"POST",headers:{"Authorization":"Token "+key,"Content-Type":"audio/webm"},body:audioBlob});
      if(!resp.ok){showToast("Deepgram error: "+resp.status,true);return null;}
      return await resp.json();
    } catch(err) { showToast("Network error: "+err.message,true); return null; }
  }

  function mergeOutput(dg) {
    const words=dg.results?.channels?.[0]?.alternatives?.[0]?.words||[];
    const totalDur=((Date.now()-recStartTime)/1000)|0;
    const events=[];
    for(const w of words)events.push({time:w.start,type:"word",text:w.punctuated_word||w.word});
    for(const c of clicks)events.push({time:c.time,type:"click",path:c.path});
    events.sort((a,b)=>a.time-b.time);
    let out="## UI Fix Session — "+location.pathname+" — "+formatTime(totalDur)+"\n\n";
    let lastTs=-1,lw=[];
    function flush(){if(lw.length){out+=lw.join(" ")+"\n";lw=[];}}
    for(const ev of events){const ts=Math.floor(ev.time/3)*3;if(ts>lastTs){flush();out+="["+formatTime(ts)+"] ";lastTs=ts;}if(ev.type==="word")lw.push(ev.text);else{flush();out+="\n  → [clicked at "+formatTime(ev.time)+"]:\n"+ev.path+"\n\n";}}
    flush(); return out;
  }

  // ======================== SETTINGS ========================
  function toggleSettings(fo) { settingsOpen=fo!==undefined?fo:!settingsOpen; settingsPanel.style.display=settingsOpen?"flex":"none"; }

  // ======================== EVENTS ========================
  function onMove(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || isOurs(el)) return;
    lastPageX = e.clientX; lastPageY = e.clientY;
    if (el === hovered) return;
    hovered = el;
    pickedEl = el;
    updateSelection(el);
  }

  function onClick(e) {
    // Our UI: dispatch button actions here. We must stop propagation at document capture
    // to keep page modal/outside-click handlers from firing — but per-button listeners
    // never get a chance to run after that, so delegate the dispatch in the same handler.
    if (isOurs(e.target)) {
      const t = e.target;
      let action = null;
      if (recBtn.contains(t)) action = () => { if (mode==="picking") startRecording(); else if (mode==="recording") stopRecording(); };
      else if (arrowUp.contains(t)) action = navigateUp;
      else if (arrowDown.contains(t)) action = navigateDown;
      else if (minimizeBtn.contains(t) || miniBtn.contains(t)) action = toggleMinimize;
      else if (gearBtn.contains(t)) action = () => toggleSettings();
      else if (exitBtn.contains(t)) action = teardown;
      if (action) {
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        action();
      } else {
        // Click on settings panel chrome / inputs — block bubble to page but let the
        // browser run its default (focus the input, open the select dropdown).
        e.stopPropagation(); e.stopImmediatePropagation();
      }
      return;
    }
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    if (settingsOpen) { toggleSettings(false); return; }
    if (mode === "picking") {
      if (lastPath) copyText(lastPath);
    } else if (mode === "recording") {
      const elapsed = (Date.now()-recStartTime)/1000;
      clicks.push({time:elapsed, path:lastPath});
      clicksEl.textContent = clicks.length+" click"+(clicks.length!==1?"s":"");
      highlight.style.borderColor="#22c55e"; highlight.style.boxShadow="0 0 0 3px rgba(34,197,94,0.3)";
      setTimeout(()=>{highlight.style.borderColor="#6366f1";highlight.style.boxShadow="0 0 0 3px rgba(99,102,241,0.3)";},300);
    }
  }

  // Mousedown also needs blocking to prevent modal backdrop triggers
  function onMouseDown(e) {
    if (isOurs(e.target)) {
      e.stopPropagation(); e.stopImmediatePropagation();
    }
  }

  function onKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      if (settingsOpen) toggleSettings(false);
      else if (mode === "recording") stopRecording();
      else teardown();
    } else if (e.key === "ArrowUp") {
      e.preventDefault(); navigateUp();
    } else if (e.key === "ArrowDown") {
      e.preventDefault(); navigateDown();
    }
  }

  document.addEventListener("mousemove", onMove, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("mousedown", onMouseDown, true);
  document.addEventListener("keydown", onKey, true);

  // ======================== TEARDOWN ========================
  function teardown() {
    if(mediaRecorder){mediaRecorder.stream.getTracks().forEach(t=>t.stop());mediaRecorder=null;}
    clearInterval(timerInterval); window.__llmPointerActive=false;window.__llmPointerTeardown=null;
    document.removeEventListener("mousemove",onMove,true);
    document.removeEventListener("click",onClick,true);
    document.removeEventListener("mousedown",onMouseDown,true);
    document.removeEventListener("keydown",onKey,true);
    [...tints,highlight,lblWrap,toast,bar,settingsPanel,miniBtn,style].forEach(el=>el.remove());
  }
  window.__llmPointerTeardown=teardown;
})();
