// AvispaLabs — código compartido por todas las páginas (Inicio, Avispa Flow, Avispa Studio).
// Cada bloque revisa si su sección existe en la página antes de animarla.
const WHATSAPP = "573163490524";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCIR = matchMedia("(prefers-reduced-motion: reduce)").matches;
window.__scroll = { p: 0, v: 0 };
const EN = document.documentElement.lang === "en";
const L = (es, en) => EN ? en : es;

// ---------- datos ----------
$$(".anio").forEach(e => e.textContent = new Date().getFullYear());
$$(".wa").forEach(a => {
  a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(a.dataset.msg)}`;
  a.target = "_blank"; a.rel = "noopener";
});
// menú: marcar la página actual
const pagina = document.body.dataset.pagina;
$$("nav .links a").forEach(a => a.classList.toggle("actual", a.dataset.pagina === pagina));

// franja de palabras
const llenar = (el, arr, hueco) => {
  if (!el) return;
  const uno = arr.map((t, i) => `<span class="${(i % 2) === hueco ? "hueco" : ""}">${t}<i></i></span>`).join("");
  el.innerHTML = uno + uno + uno;
};
llenar($("#fila1"), L(["Bots de WhatsApp", "Edición de video", "Automatización", "Motion graphics"], ["WhatsApp bots", "Video editing", "Automation", "Motion graphics"]), 1);
llenar($("#fila2"), L(["Inteligencia artificial", "Reels que venden", "Paneles de control", "¡Avíspese, ome!"], ["Artificial intelligence", "Reels that sell", "Dashboards", "Work like a swarm"]), 0);

// pasos de las avispitas
const PASOS_ES = [
  ["💬", "Recibe", "Contesta cada mensaje de WhatsApp al instante, de día o de noche."],
  ["📦", "Busca", "Consulta información del negocio mediante integraciones disponibles."],
  ["🎤", "Escucha", "Entiende notas de voz como si fuera una persona."],
  ["🧾", "Verifica", "Lee comprobantes de pago y los deja listos para aprobar."],
  ["📸", "Reconoce", "Identifica productos con solo una foto."],
  ["🛡️", "Filtra", "Bloquea spam e intentos de engaño."],
  ["🙋", "Avisa", "Le pasa el chat a un asesor humano cuando hace falta."],
  ["📊", "Reporta", "Pagos, casos y conversaciones quedan en tu panel."]
];
const PASOS = EN ? [
  ["💬", "Receives", "Answers every WhatsApp message instantly, day or night."],
  ["📦", "Searches", "Looks up business information through available integrations."],
  ["🎤", "Listens", "Understands voice notes as if it were a person."],
  ["🧾", "Verifies", "Reads payment receipts and leaves them ready to approve."],
  ["📸", "Recognizes", "Identifies products from a single photo."],
  ["🛡️", "Filters", "Blocks spam and scam attempts."],
  ["🙋", "Alerts", "Hands the chat to a human agent when needed."],
  ["📊", "Reports", "Payments, cases and conversations all land in your dashboard."]
] : PASOS_ES;
const avispaHTML = `<div class="avispa"><div class="ala i"></div><div class="ala d"></div><div class="cuerpo"></div><div class="ojo i"></div><div class="ojo d"></div></div>`;
if ($("#carril")) $("#carril").innerHTML = PASOS.map(([ico, t, d], i) =>
  `<div class="paso"><div class="num">${String(i + 1).padStart(2, "0")}</div><div class="avi-cont">${avispaHTML}<div class="herr">${ico}</div></div><h4>${t}</h4><p>${d}</p></div>`).join("");

// partir títulos en palabras (para que entren con giro 3D)
$$(".partir").forEach(el => {
  const recorrer = nodo => [...nodo.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(p => {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
        const w = document.createElement("span"); w.className = "w";
        const s = document.createElement("span"); s.textContent = p; w.appendChild(s); frag.appendChild(w);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1) recorrer(n);
  });
  recorrer(el);
});

// ---------- transición de panal entre páginas (un solo canvas: mucho más liviano y sin parpadeo) ----------
// Al llegar, el CSS ya tapa la página de dorado antes del primer pintado (clase "trans", puesta en el <head>).
// La página nueva se destapa solo cuando las letras y el panal 3D ya están listos.
const raizDoc = document.documentElement;
const capa = $("#transicion");
const lienzoT = capa && $("canvas", capa);
const ctxT = lienzoT && lienzoT.getContext("2d");
const COLORES_T = ["#FFC400", "#E0A800", "#B8860B"];
const entrando = raizDoc.classList.contains("trans");
try { sessionStorage.removeItem("avispa-trans"); } catch (e) {}
window.__panalPausa = entrando;
let celdasT = [], radioT = 0, anchoT = 0, altoT = 0, saliendo = false;
const prepararT = () => {
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  anchoT = innerWidth; altoT = innerHeight;
  lienzoT.width = Math.ceil(anchoT * dpr); lienzoT.height = Math.ceil(altoT * dpr);
  ctxT.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cols = anchoT < 760 ? 5 : 10;
  const dx = anchoT / cols * 1.1; radioT = dx / Math.sqrt(3);
  const dy = 1.5 * radioT, filas = Math.ceil(altoT / dy) + 1;
  celdasT = [];
  let max = 1;
  for (let r = -1; r <= filas; r++) for (let q = -1; q <= cols + 1; q++) {
    const x = q * dx + (r & 1 ? dx / 2 : 0), y = r * dy;
    const d = Math.hypot(x - anchoT / 2, y - altoT / 2);
    max = Math.max(max, d);
    celdasT.push({ x, y, d, c: (q * 3 + r * 7) & 3 });
  }
  celdasT.forEach(c => c.d /= max);
};
const dibujarT = (p, abrir) => {
  ctxT.clearRect(0, 0, anchoT, altoT);
  const caminos = [new Path2D(), new Path2D(), new Path2D()];
  for (const c of celdasT) {
    const retraso = (abrir ? c.d : 1 - c.d) * .55;
    const t = Math.min(1, Math.max(0, (p - retraso) / .45));
    const s = abrir ? 1 - t * t * t : 1 - Math.pow(1 - t, 3);
    if (s < .01) continue;
    const giro = (1 - s) * 1.05, R = radioT * 1.04 * s;
    const camino = caminos[s > .995 ? 0 : (c.c % 3)];
    for (let i = 0; i < 6; i++) {
      const a = giro + Math.PI / 6 + i * Math.PI / 3, vx = c.x + R * Math.cos(a), vy = c.y + R * Math.sin(a);
      i ? camino.lineTo(vx, vy) : camino.moveTo(vx, vy);
    }
    camino.closePath();
  }
  caminos.forEach((cam, i) => { ctxT.fillStyle = COLORES_T[i]; ctxT.fill(cam); });
};
const animarT = (duracion, abrir, alAvanzar, fin) => {
  const ini = performance.now();
  const paso = ahora => {
    const p = Math.min(1, (ahora - ini) / duracion);
    dibujarT(p, abrir); alAvanzar && alAvanzar(p);
    p < 1 ? requestAnimationFrame(paso) : fin();
  };
  requestAnimationFrame(paso);
};
const iraA = url => {
  if (saliendo) return;
  if (!capa || REDUCIR) { location.href = url; return; }
  saliendo = true;
  prepararT();
  capa.classList.add("activa");
  window.__panalPausa = true; // el panal 3D descansa mientras corre la transición
  let fue = false;
  const ir = () => {
    if (fue) return; fue = true;
    try { sessionStorage.setItem("avispa-trans", "1"); } catch (e) {}
    location.href = url;
  };
  animarT(400, false, p => { if (p > .6) capa.classList.add("logo"); }, ir);
  setTimeout(ir, 900); // respaldo si el navegador pausa las animaciones (pestaña en segundo plano)
};
const destapar = () => {
  prepararT();
  dibujarT(0, true);
  capa.classList.add("abriendo");
  window.__panalPausa = false;
  if (window.__tlHero) window.__tlHero.play();
  setTimeout(() => animarT(460, true, null, () => {
    raizDoc.classList.remove("trans");
    capa.classList.remove("abriendo");
    ctxT.clearRect(0, 0, anchoT, altoT);
  }), 110);
};
if (capa && entrando) {
  const panalListo = new Promise(ok => window.__panalListo ? ok() : addEventListener("panal:listo", ok, { once: true }));
  const letras = document.fonts ? document.fonts.ready : Promise.resolve();
  const limite = new Promise(ok => setTimeout(ok, 1000)); // nunca dejar a nadie esperando más de 1 segundo
  Promise.race([Promise.all([panalListo, letras]), limite]).then(destapar);
}
$$("a[data-ir]").forEach(a => a.addEventListener("click", e => {
  if (e.metaKey || e.ctrlKey) return;
  e.preventDefault(); iraA(a.getAttribute("href"));
}));
// al volver con el botón "atrás" del navegador, quitar la capa
addEventListener("pageshow", e => {
  if (!e.persisted || !capa) return;
  saliendo = false; window.__panalPausa = false;
  capa.classList.remove("activa", "logo", "abriendo"); raizDoc.classList.remove("trans");
  ctxT.clearRect(0, 0, anchoT, altoT);
});
// cargar las otras páginas por adelantado para que abran al instante
const adelantar = () => {
  if (navigator.connection && navigator.connection.saveData) return;
  [...new Set($$("nav a[data-ir], .puerta[data-ir], .siguiente a[data-ir]").map(a => a.href))].forEach(href => {
    if (href === location.href) return;
    const l = document.createElement("link"); l.rel = "prefetch"; l.href = href; document.head.appendChild(l);
  });
};
"requestIdleCallback" in window ? requestIdleCallback(adelantar, { timeout: 3000 }) : setTimeout(adelantar, 2500);

// ---------- botón ES | EN ----------
$$(".idiomas a").forEach(a => {
  const destino = a.dataset.lang;
  const ruta = location.pathname.replace(/^\/en(\/|$)/, "/");
  a.href = (destino === "en" ? "/en" + ruta : ruta) + location.search;
  a.classList.toggle("actual", destino === (EN ? "en" : "es"));
  a.addEventListener("click", e => {
    e.preventDefault();
    try { localStorage.setItem("avispalabs-idioma", destino); } catch (err) {}
    if (destino !== (EN ? "en" : "es")) iraA(a.getAttribute("href"));
  });
});

// ---------- movimiento ----------
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
$$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
  const id = a.getAttribute("href"); if (id.length < 2 || !$(id)) return;
  e.preventDefault(); lenis.scrollTo(id, { offset: -60 });
}));
// menú del celular
const btnMenu = $("#btnMenu");
if (btnMenu) btnMenu.addEventListener("click", () => document.body.classList.toggle("menu-abierto"));
$$("nav .links a").forEach(a => a.addEventListener("click", () => document.body.classList.remove("menu-abierto")));

// barra y progreso
ScrollTrigger.create({ start: 0, end: "max", onUpdate: s => {
  gsap.set("#progreso", { scaleX: s.progress });
  $("#barra").classList.toggle("solida", s.scroll() > 40);
  window.__scroll.v = s.getVelocity();
}});

// entrada del hero
const tlHero = gsap.timeline({ delay: entrando ? 0 : .15, paused: entrando });
window.__tlHero = tlHero;
tlHero.from(".kicker", { y: 20, opacity: 0, duration: .7, ease: "power3.out" })
  .from(".hero h1 .w > span", { yPercent: 110, rotationX: -85, opacity: 0, duration: 1, ease: "expo.out", stagger: .06 }, "-=.4")
  .from(".hero .lema", { y: 30, scale: .8, opacity: 0, duration: .9, ease: "expo.out" }, "-=.6")
  .from(".hero .sub", { y: 20, opacity: 0, duration: .7, ease: "power3.out" }, "-=.6")
  .from(".hero .acciones .btn", { y: 20, opacity: 0, duration: .6, ease: "back.out(2)", stagger: .1 }, "-=.5")
  .from(".bajar", { opacity: 0, duration: .6 }, "-=.3");

// el hero se aleja al bajar y el panal 3D se desarma
// Solo mueve la caja .hero-in (no los textos), con valores de inicio fijos: así al volver a subir el mensaje siempre reaparece.
gsap.fromTo(".hero-in", { yPercent: 0, opacity: 1, scale: 1 },
  { yPercent: -18, opacity: 0, scale: .92, ease: "none", immediateRender: false,
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });gsap.to("#oscurecer", { opacity: .35, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom top", onUpdate: s => window.__scroll.p = s.progress });

// avispita que vuela por el hero (en celular, por encima del título)
const vol = $("#voladora");
if (vol && !REDUCIR) {
  const vuelo = () => {
    const W = innerWidth, H = innerWidth < 760 ? innerHeight * .45 : innerHeight;
    gsap.timeline({ onComplete: vuelo })
      .set(vol, { x: -80, y: H * .3, rotation: 15 })
      .to(vol, { duration: 7, ease: "none", keyframes: [
        { x: W * .18, y: H * .18, rotation: 10 }, { x: W * .38, y: H * .32, rotation: -8 }, { x: W * .55, y: H * .14, rotation: 12 },
        { x: W * .74, y: H * .26, rotation: -10 }, { x: W + 80, y: H * .12, rotation: 8 }] })
      .to({}, { duration: 2.5 });
  };
  vuelo();
}

// títulos de sección: palabras con giro 3D
$$("section .partir, .carril-cab .partir").forEach(h => {
  gsap.from(h.querySelectorAll(".w > span"), { yPercent: 115, rotationX: -90, opacity: 0, duration: 1, ease: "expo.out", stagger: .07,
    scrollTrigger: { trigger: h, start: "top 85%" } });
});
$$("section .etiqueta, section .intro").forEach(el => gsap.from(el, { y: 26, opacity: 0, duration: .8, ease: "power3.out",
  scrollTrigger: { trigger: el, start: "top 88%" } }));

// franja: se mueve sola y acelera con la velocidad del scroll
const f1 = $("#fila1"), f2 = $("#fila2");
if (f1) {
  let off = 0, anchoFranja = f1.scrollWidth / 3, franjaVisible = true;
  addEventListener("resize", () => anchoFranja = f1.scrollWidth / 3, { passive: true });
  if (document.fonts) document.fonts.ready.then(() => anchoFranja = f1.scrollWidth / 3);
  new IntersectionObserver(([e]) => franjaVisible = e.isIntersecting).observe($(".franja"));
  gsap.ticker.add(() => {
    if (!franjaVisible) return;
    const v = Math.min(Math.abs(window.__scroll.v) / 400, 6);
    off += 0.6 + v; const w = anchoFranja;
    gsap.set(f1, { x: -(off % w) }); gsap.set(f2, { x: -w + (off % w) });
  });
}

// tarjetas que se inclinan con el mouse
const inclinar = (sel, fuerza) => $$(sel).forEach(el => {
  el.addEventListener("pointermove", e => {
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
    gsap.to(el, { rotationY: (x - .5) * fuerza, rotationX: (.5 - y) * fuerza, transformPerspective: 1200, duration: .5, ease: "power2.out", overwrite: "auto" });
  });
  el.addEventListener("pointerleave", () => gsap.to(el, { rotationY: 0, rotationX: 0, duration: .8, ease: "elastic.out(1,.5)" }));
});
if (matchMedia("(hover: hover)").matches) { inclinar(".tilt", 16); inclinar(".tilt-suave", 9); }

// puertas
if ($(".puertas")) gsap.from(".puerta", { y: 120, rotationX: 25, rotationY: (i) => i ? -18 : 18, opacity: 0, duration: 1.2, ease: "expo.out", stagger: .15,
  scrollTrigger: { trigger: ".puertas", start: "top 82%" } });

// tarjetas de beneficios
if ($(".beneficios")) gsap.from(".beneficio", { y: 80, rotationX: -25, opacity: 0, duration: 1, ease: "expo.out", stagger: .1,
  scrollTrigger: { trigger: ".beneficios", start: "top 85%" } });

// teléfono de Obrera: gira con el scroll y el video se reproduce cuando se ve
if ($("#telObrera")) {
  gsap.fromTo("#telObrera", { rotationY: -28, rotationX: 10, y: 80, transformPerspective: 1400 },
    { rotationY: 14, rotationX: -4, y: -40, ease: "none", scrollTrigger: { trigger: "#telObrera", start: "top bottom", end: "bottom top", scrub: 1 } });
  const vid = $("#vidObrera");
  ScrollTrigger.create({ trigger: "#telObrera", start: "top 90%", end: "bottom 10%",
    onToggle: s => s.isActive ? vid.play().catch(() => {}) : vid.pause() });
  $("#btnSonido").addEventListener("click", e => {
    vid.muted = !vid.muted; if (!vid.muted) { vid.currentTime = 0; vid.play(); }
    e.currentTarget.textContent = vid.muted ? L("🔊 Activar sonido", "🔊 Turn on sound") : L("🔇 Silenciar", "🔇 Mute");
  });
}
// contadores
$$("[data-contar]").forEach(b => {
  const n = +b.dataset.contar, pre = b.dataset.prefijo || "", suf = b.dataset.sufijo || "", o = { v: 0 };
  b.textContent = pre + "0" + suf;
  gsap.to(o, { v: n, duration: 1.6, ease: "power2.out", onUpdate: () => b.textContent = pre + Math.round(o.v) + suf,
    scrollTrigger: { trigger: b, start: "top 92%" } });
});

// carrusel de avispitas: se desliza de lado (dedo, arrastre con mouse o flechas); la página sigue bajando normal
const carril = $("#carril");
if (carril) {
  const pasos = $$(".paso"), ant = $("#carrilAnt"), sig = $("#carrilSig"), prog = $("#rielProg");
  const paso = () => pasos[0].getBoundingClientRect().width + parseFloat(getComputedStyle(carril).columnGap || 26);
  const actualizar = () => {
    const max = carril.scrollWidth - carril.clientWidth, x = carril.scrollLeft;
    prog.style.transform = `scaleX(${max > 0 ? Math.max(.08, x / max) : 1})`;
    const i = Math.min(pasos.length - 1, Math.round(x / paso()));
    pasos.forEach((p, k) => p.classList.toggle("activo", k === i));
    if (ant) ant.disabled = x < 5;
    if (sig) sig.disabled = x > max - 5;
  };
  carril.addEventListener("scroll", actualizar, { passive: true });
  addEventListener("resize", actualizar);
  ant && ant.addEventListener("click", () => carril.scrollBy({ left: -paso(), behavior: "smooth" }));
  sig && sig.addEventListener("click", () => carril.scrollBy({ left: paso(), behavior: "smooth" }));
  // arrastrar con el mouse (en celular ya se desliza con el dedo)
  let abajo = false, x0 = 0, s0 = 0, movio = false;
  carril.addEventListener("pointerdown", e => {
    if (e.pointerType !== "mouse") return;
    abajo = true; movio = false; x0 = e.clientX; s0 = carril.scrollLeft;
  });
  addEventListener("pointermove", e => {
    if (!abajo) return;
    const d = e.clientX - x0;
    if (Math.abs(d) > 4) { movio = true; carril.classList.add("arrastrando"); }
    if (movio) carril.scrollLeft = s0 - d;
  });
  addEventListener("pointerup", () => {
    if (!abajo) return;
    abajo = false;
    if (movio) {
      carril.classList.remove("arrastrando");
      const i = Math.round(carril.scrollLeft / paso());
      carril.scrollTo({ left: i * paso(), behavior: "smooth" });
    }
  });
  carril.addEventListener("dragstart", e => e.preventDefault());
  actualizar();
  // las avispitas entran volando cuando la sección aparece
  gsap.from(".paso", { y: 80, opacity: 0, duration: .9, ease: "expo.out", stagger: .08, scrollTrigger: { trigger: carril, start: "top 85%" } });
  gsap.from(".paso .avispa", { y: -60, rotation: -30, opacity: 0, duration: .8, ease: "back.out(2)", stagger: .08, delay: .2,
    scrollTrigger: { trigger: carril, start: "top 85%" } });
}

// muestras de video: entran en abanico 3D y se reproducen al verse
if ($(".muestras")) {
  gsap.from(".muestra", { y: 140, rotationY: (i) => (i - 1) * -30, rotationX: 20, opacity: 0, duration: 1.2, ease: "expo.out", stagger: .12,
    scrollTrigger: { trigger: ".muestras", start: "top 85%" } });
  $$(".muestra video").forEach(v => ScrollTrigger.create({ trigger: v, start: "top 95%", end: "bottom 5%",
    onToggle: s => s.isActive ? v.play().catch(() => {}) : v.pause() }));
}
if ($(".paquetes")) gsap.from(".paquete", { y: 100, rotationX: -30, opacity: 0, duration: 1.1, ease: "expo.out", stagger: .12,
  scrollTrigger: { trigger: ".paquetes", start: "top 85%" } });

// paquetes de Flow: entran en cascada
if ($(".paq-flow")) gsap.from(".pf", { y: 90, rotationX: -25, opacity: 0, duration: 1, ease: "expo.out", stagger: .1, clearProps: "opacity",
  scrollTrigger: { trigger: ".paq-flow", start: "top 85%" } });

// proceso: la línea se dibuja y los hexágonos aparecen
if ($(".proceso")) {
  gsap.fromTo("#lineaProceso", { attr: { "stroke-dashoffset": 920 }, strokeDasharray: "920 920" }, { attr: { "stroke-dashoffset": 0 }, ease: "none",
    scrollTrigger: { trigger: ".proceso", start: "top 80%", end: "top 30%", scrub: true } });
  gsap.from(".etapa", { y: 60, opacity: 0, duration: .9, ease: "power3.out", stagger: .15, scrollTrigger: { trigger: ".proceso", start: "top 80%" } });
  gsap.from(".etapa .hx", { scale: 0, rotation: -120, duration: 1, ease: "back.out(1.8)", stagger: .15, scrollTrigger: { trigger: ".proceso", start: "top 80%" } });
}

// cierre
if ($("#contacto")) gsap.from("#contacto .btn", { y: 30, opacity: 0, scale: .9, duration: .7, ease: "back.out(2)", stagger: .1,
  scrollTrigger: { trigger: "#contacto .acciones", start: "top 92%" } });
addEventListener("load", () => ScrollTrigger.refresh());

// ---------- formulario de contacto: arma el mensaje y lo manda por WhatsApp o correo ----------
const form = $("#formContacto");
if (form) {
  const NOMBRES = EN ? { flow: "Automate my business (Avispa Flow)", studio: "Edit my videos (Avispa Studio)", ambos: "Automate my business and edit my videos", otro: "Something else" }
    : { flow: "Automatizar mi negocio (Avispa Flow)", studio: "Editar mis videos (Avispa Studio)", ambos: "Automatizar mi negocio y editar mis videos", otro: "Otra cosa" };
  const dFlow = $("#detalleFlow"), dStudio = $("#detalleStudio"), numDatos = $("#numDatos");
  const wa = $("#cWa"), correo = $("#cCorreo"), resumen = $("#cResumen"), aviso = $("#cAviso");
  const marcados = g => $$(`input[name="${g}"]:checked`, form).map(i => i.value);
  const armar = () => {
    const s = (form.querySelector('input[name="servicio"]:checked') || {}).value;
    dFlow.hidden = !(s === "flow" || s === "ambos");
    dStudio.hidden = !(s === "studio" || s === "ambos");
    dStudio.querySelector(".pf-num").textContent = s === "ambos" ? "3" : "2";
    numDatos.textContent = s === "ambos" ? "4" : (s === "flow" || s === "studio") ? "3" : "2";
    const nombre = $("#cNombre").value.trim(), negocio = $("#cNegocio").value.trim(), extra = $("#cMensaje").value.trim();
    if (!s) { resumen.textContent = L("Escoge qué necesitas para armar tu mensaje 🐝", "Choose what you need to build your message 🐝"); wa.classList.add("apagado"); correo.classList.add("apagado"); return null; }
    let t = EN ? `Hi AvispaLabs 🐝${nombre ? `, I'm ${nombre}` : ""}${negocio ? ` from ${negocio}` : ""}.\nI want: ${NOMBRES[s]}.`
      : `Hola AvispaLabs 🐝${nombre ? `, soy ${nombre}` : ""}${negocio ? ` de ${negocio}` : ""}.\nQuiero: ${NOMBRES[s]}.`;
    const f = dFlow.hidden ? [] : marcados("flow"), st = dStudio.hidden ? [] : marcados("studio");
    if (f.length) t += `\n${L("Automatizar", "Automate")}: ${f.join(", ")}.`;
    if (st.length) t += `\nVideo: ${st.join(", ")}.`;
    if (extra) t += `\n${extra}`;
    resumen.textContent = t;
    wa.classList.remove("apagado"); correo.classList.remove("apagado");
    wa.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t)}`;
    correo.href = `mailto:jhon@avispalabs.com?subject=${encodeURIComponent(L("Contacto desde la web · ", "Website contact · ") + NOMBRES[s])}&body=${encodeURIComponent(t)}`;
    return t;
  };
  form.addEventListener("input", armar);
  form.addEventListener("change", () => { armar(); setTimeout(() => ScrollTrigger.refresh(), 50); });
  [wa, correo].forEach(b => b.addEventListener("click", e => {
    if (!armar()) { e.preventDefault(); aviso.textContent = L("Primero escoge qué necesitas (paso 1) 👆", "First choose what you need (step 1) 👆"); return; }
    if (!$("#cAcepto").checked) { e.preventDefault(); aviso.textContent = L("Para enviar, marca la casilla de la Política de tratamiento de datos 👆", "To send, check the Personal Data Policy box 👆"); return; }
    aviso.textContent = "";
  }));
  // si viene desde Avispa Flow o Avispa Studio, dejar marcada esa opción
  const desde = new URLSearchParams(location.search).get("s");
  const pre = desde && form.querySelector(`input[name="servicio"][value="${desde}"]`);
  if (pre) pre.checked = true;
  armar();
  gsap.from(".paso-f:not([hidden]), .resumen", { y: 60, opacity: 0, duration: .9, ease: "expo.out", stagger: .1, delay: .3 });
}

// ---------- Avispa Studio: planes mensuales y calculadora (mismos precios que la web de Avispa Edit) ----------
if ($("#calcPaquete")) {
  // Aquí se cambian todos los precios de Avispa Studio.
  const PRECIOS = {
    basico:  { nombre: "Básico",  suelto: [[1, 5], [2, 4.9], [6, 4.75], [12, 4.5]],
               mensual: { 6: 26, 12: 50, 18: 72, 24: 92, 30: 111 }, regalo: 1 },
    pro:     { nombre: "Pro",     suelto: [[1, 12], [2, 11.9], [6, 11.5], [12, 11]],
               mensual: { 6: 63, 12: 120, 18: 171, 24: 220, 30: 270 }, regalo: 3 },
    premium: { nombre: "Premium", suelto: [[1, 20], [2, 19.8], [6, 19.2], [12, 18.5]],
               mensual: { 6: 105, 12: 200, 18: 288, 24: 372, 30: 450 }, regalo: 3 },
  };
  const MONEDA_POR_PAIS = { CO: "COP", MX: "MXN", PE: "PEN", CL: "CLP", AR: "ARS", ES: "EUR", US: "USD" };
  const calcMoneda = $("#calcMoneda");
  calcMoneda.value = MONEDA_POR_PAIS[(navigator.language.split("-")[1] || "").toUpperCase()] || (EN ? "USD" : "COP");
  let tasas = null;
  const enMoneda = (v, m) => {
    let valor = v * tasas[m];
    if (tasas[m] > 100) valor = Math.round(valor / 100) * 100;
    return new Intl.NumberFormat(L("es-CO", "en-US"), { style: "currency", currency: m, currencyDisplay: "code", maximumFractionDigits: m === "EUR" ? 2 : 0 }).format(valor);
  };
  const usd = n => "$" + (Number.isInteger(n) ? n : EN ? n.toFixed(2) : n.toFixed(2).replace(".", ","));
  const precioSuelto = (tipo, c) => PRECIOS[tipo].suelto.filter(([desde]) => c >= desde).pop()[1];

  let cantMensual = 12;
  const calcular = () => {
    const tipo = $("#calcPaquete").value;
    const cantidad = Math.max(1, Math.min(50, Number($("#calcCantidad").value) || 1));
    const moneda = calcMoneda.value;
    const unitario = precioSuelto(tipo, cantidad);
    const total = Math.round(unitario * cantidad * 100) / 100;
    $("#calcUsd").textContent = `${usd(total)} USD`;
    const tip = $("#calcTip"), p = PRECIOS[tipo];
    const plan = [30, 24, 18, 12, 6].find(c => cantidad >= c);
    tip.hidden = false;
    tip.textContent = EN
      ? (plan ? `${usd(unitario)} each. If it's every month, the ${plan}-video monthly plan costs ${usd(p.mensual[plan])}.` : `${usd(unitario)} per video.` + (cantidad === 1 ? " From 2 videos it gets cheaper." : ""))
      : plan
      ? `${usd(unitario)} c/u. Si es cada mes, con el plan mensual de ${plan} te salen por ${usd(p.mensual[plan])}.`
      : `${usd(unitario)} por video.` + (cantidad === 1 ? " Desde 2 videos te sale más barato." : "");
    const verLocal = tasas && moneda !== "USD";
    $("#calcLocal").textContent = verLocal ? `≈ ${enMoneda(total, moneda)}` : "";
    $$(".mes .local").forEach(el => el.textContent = verLocal ? `≈ ${enMoneda(Number(el.dataset.usd), moneda)}` : "");
  };
  const pintarMensuales = () => {
    $$(".cantidades [data-cant]").forEach(b => b.classList.toggle("activa", Number(b.dataset.cant) === cantMensual));
    $$(".mes").forEach(card => {
      const p = PRECIOS[card.dataset.tipo], total = p.mensual[cantMensual];
      const regalo = cantMensual === 30 ? p.regalo : 0, sueltos = p.suelto[0][1] * cantMensual;
      card.querySelector(".mes-total").textContent = usd(total);
      card.querySelector(".local").dataset.usd = total;
      card.querySelector(".por-video").textContent = `${cantMensual} videos · ${usd(total / cantMensual)} ${L("por video", "per video")}`;
      card.querySelector(".ahorro").textContent = (EN ? `You save ${usd(Math.round(sueltos - total))} a month` : `Ahorras ${usd(Math.round(sueltos - total))} al mes`) + (regalo ? ` + ${regalo} ${L("gratis", "free")}` : "");
      const r = card.querySelector(".regalo"); r.hidden = !regalo; r.textContent = `+${regalo} ${L("GRATIS", "FREE")}`;
      const nombreP = EN && p.nombre === "Básico" ? "Basic" : p.nombre;
      const plan = EN ? `${nombreP} monthly plan: ${cantMensual} videos${regalo ? ` + ${regalo} free` : ""} (${usd(total)} USD/month)` : `Plan mensual ${p.nombre}: ${cantMensual} videos${regalo ? ` + ${regalo} gratis` : ""} (${usd(total)} USD/mes)`;
      card.querySelector(".mes-wa").href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(EN ? `Hi Avispa Studio 🎬 I want the ${plan}.` : `Hola Avispa Studio 🎬 Quiero el ${plan}.`)}`;
    });
    calcular();
  };
  $$(".cantidades [data-cant]").forEach(b => b.addEventListener("click", () => {
    cantMensual = Number(b.dataset.cant); pintarMensuales();
    gsap.fromTo(".mes-total", { scale: .8, opacity: .3 }, { scale: 1, opacity: 1, duration: .45, ease: "back.out(2.5)", stagger: .05 });
  }));
  ["calcPaquete", "calcCantidad", "calcMoneda"].forEach(id => $("#" + id).addEventListener("input", calcular));
  pintarMensuales();
  // Tasa de cambio del día (open.er-api.com, gratis y sin clave). Si falla, solo dólares.
  fetch("https://open.er-api.com/v6/latest/USD").then(r => r.json()).then(d => {
    if (d.result !== "success") throw new Error("sin tasa");
    tasas = d.rates;
    const fecha = new Date(d.time_last_update_unix * 1000).toLocaleDateString(L("es-CO", "en-US"), { day: "numeric", month: "long" });
    $("#calcTasa").textContent = EN ? `Rate as of ${fecha}. We confirm the final amount when you pay.` : `Tasa del ${fecha}. El valor final te lo confirmamos al pagar.`;
    calcular();
  }).catch(() => $("#calcTasa").textContent = L("No pudimos cargar la tasa de hoy; los precios están en dólares.", "We couldn't load today's rate; prices are in US dollars."));

  gsap.from(".ps", { y: 80, rotationX: -25, opacity: 0, duration: 1, ease: "expo.out", stagger: .12, scrollTrigger: { trigger: ".pasos-studio", start: "top 85%" } });
  gsap.from(".mensual, .largos, .calc", { y: 70, opacity: 0, duration: 1, ease: "expo.out", stagger: .12, scrollTrigger: { trigger: ".mensual", start: "top 88%" } });
}

// ---------- aviso de cookies y privacidad (sale la primera vez que alguien entra) ----------
{
  const CLAVE = "avispalabs-aviso-v1";
  let aceptado = false;
  try { aceptado = localStorage.getItem(CLAVE) === "si"; } catch (e) {}
  const enlaces = $$("footer .legal-links a");
  const urlDatos = enlaces[0] ? enlaces[0].getAttribute("href") : "/legal/privacidad/";
  const urlCookies = enlaces[1] ? enlaces[1].getAttribute("href") : "/legal/cookies/";
  if (!aceptado && document.body.dataset.pagina !== "legal") {
    const aviso = document.createElement("div");
    aviso.className = "aviso-cookies";
    aviso.setAttribute("role", "dialog");
    aviso.setAttribute("aria-label", "Aviso de privacidad y cookies");
    aviso.innerHTML = `
      <div class="ac-ico">🍪</div>
      <div class="ac-txt">
        <b>${L("Tu privacidad nos importa", "Your privacy matters to us")}</b>
        <p>${EN ? `We only use what's technically needed for the website to work: <b>no ads and no tracking</b>. By continuing you accept our <a href="${urlDatos}">Personal Data Policy</a> and <a href="${urlCookies}">Cookie Policy</a>.`
          : `Usamos solo lo técnico para que la web funcione: <b>nada de publicidad ni rastreo</b>. Al continuar aceptas nuestra <a href="${urlDatos}">Política de tratamiento de datos</a> y la <a href="${urlCookies}">Política de cookies</a>.`}</p>
      </div>
      <div class="ac-botones">
        <button type="button" class="btn btn-oro" id="acAceptar">${L("Aceptar", "Accept")}</button>
        <a class="btn btn-borde" href="${urlDatos}">${L("Leer más", "Read more")}</a>
      </div>`;
    document.body.appendChild(aviso);
    gsap.fromTo(aviso, { y: 140, opacity: 0, rotationX: -30, transformPerspective: 900 },
      { y: 0, opacity: 1, rotationX: 0, duration: .9, ease: "expo.out", delay: 1.6 });
    $("#acAceptar").addEventListener("click", () => {
      try { localStorage.setItem(CLAVE, "si"); } catch (e) {}
      gsap.to(aviso, { y: 120, opacity: 0, duration: .45, ease: "power3.in", onComplete: () => aviso.remove() });
    });
  }
}
