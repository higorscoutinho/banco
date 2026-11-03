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
        // O Firebase manda só o trecho que mudou (path + data): mantemos o estado completo aqui.
        let cur = {};
        const setPath = (obj, path, val) => {
          const parts = path.split("/").filter(Boolean);
          if (!parts.length) return val;
          let o = obj;
          for (let i = 0; i < parts.length - 1; i++) {
            if (typeof o[parts[i]] !== "object" || o[parts[i]] === null) o[parts[i]] = {};
            o = o[parts[i]];
          }
          const k = parts[parts.length - 1];
          if (val === null || val === undefined) delete o[k]; else o[k] = val;
          return obj;
        };
        const es = new EventSource(url(room));
        const apply = (ev, merge) => {
          try {
            const m = JSON.parse(ev.data);
            if (!m || typeof m.path !== "string") return;
            if (merge && m.data && typeof m.data === "object") {
              Object.keys(m.data).forEach((k) => { cur = setPath(cur, m.path + "/" + k, m.data[k]); });
            } else {
              cur = setPath(cur, m.path, m.data) || {};
            }
            cb(JSON.parse(JSON.stringify(cur)));
          } catch (e) {}
        };
        es.addEventListener("put", (ev) => apply(ev, false));
        es.addEventListener("patch", (ev) => apply(ev, true));
      }
    }
  };
})();
