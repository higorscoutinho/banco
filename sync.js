// Sincronização painel -> overlay (Firebase REST/SSE, sem SDK; fallback local)
(function () {
  const cfg = window.DIGIPLUS || {};
  const url = (room) => cfg.databaseURL.replace(/\/$/, "") + "/" + (cfg.basePath || "digiplus") + "/" + room + ".json";
  const room = new URLSearchParams(location.search).get("room") || "sala1";
  const remote = !!cfg.databaseURL;
  const bc = "BroadcastChannel" in window ? new BroadcastChannel("digiplus-" + room) : null;
  const LS = "digiplus-state-" + room;

  window.DPSync = {
    room, remote,
    send(state) {
      const body = JSON.stringify(state);
      try { localStorage.setItem(LS, body); } catch (e) {}
      if (bc) bc.postMessage(state);
      if (remote) fetch(url(room), { method: "PUT", body }).catch(() => {});
    },
    listen(cb) {
      try { const s = localStorage.getItem(LS); if (s) cb(JSON.parse(s)); } catch (e) {}
      if (bc) bc.onmessage = (e) => cb(e.data);
      window.addEventListener("storage", (e) => { if (e.key === LS && e.newValue) cb(JSON.parse(e.newValue)); });
      if (remote) {
        const es = new EventSource(url(room));
        const h = (ev) => {
          try {
            const m = JSON.parse(ev.data);
            if (m && m.path === "/" && m.data) cb(m.data);
          } catch (e) {}
        };
        es.addEventListener("put", h);
        es.addEventListener("patch", h);
      }
    }
  };
})();
