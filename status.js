(() => {
  const banner = document.querySelector('.status-banner');
  const state = document.getElementById('server-state');
  const count = document.getElementById('player-count');
  let pending = false;
  function render(data) {
    const valid = ['online', 'offline'].includes(data.status) && Number.isInteger(data.players) && data.players >= 0;
    const status = valid ? data.status : 'unknown';
    banner.classList.toggle('online', status === 'online');
    banner.classList.toggle('offline', status === 'offline');
    state.textContent = status === 'online' ? 'Server online' : status === 'offline' ? 'Server offline' : 'Stato non disponibile';
    count.textContent = status === 'unknown' ? '—' : status === 'offline' ? '0' : String(data.players);
  }
  async function refresh() {
    if (pending) return;
    pending = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch('/.netlify/functions/shard-status', { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('Status unavailable');
      render(await response.json());
    } catch { render({ status: 'unknown' }); }
    finally { clearTimeout(timeout); pending = false; }
  }
  refresh();
  setInterval(() => { if (!document.hidden) refresh(); }, 15000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
