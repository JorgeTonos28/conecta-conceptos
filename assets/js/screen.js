(() => {
  const waiting = document.getElementById('waitingScreen');
  const revealed = document.getElementById('revealedScreen');
  const count = document.getElementById('screenCount');
  const target = document.getElementById('screenTarget');
  const grid = document.getElementById('connectionGrid');
  let lastRevealed = false;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  function renderGroups(groups) {
    grid.innerHTML = '';
    (groups || []).forEach((group, groupIndex) => {
      const card = document.createElement('article');
      card.className = 'connection-card';
      card.style.setProperty('--delay', (groupIndex * 120) + 'ms');

      const members = (group.members || []).map((m, index) =>
        '<div class="connection-member"><strong>' + escapeHtml(m.concept) + '</strong><span>' + escapeHtml(m.name) + '</span></div>' +
        (index === 0 ? '<div class="connection-line"><span></span><i>+</i><span></span></div>' : '')
      ).join('');

      card.innerHTML = '<small>CONEXIÓN ' + String(groupIndex + 1).padStart(2, '0') + '</small>' +
        '<h3>' + escapeHtml(group.name) + '</h3><div class="connection-members">' + members + '</div>';
      grid.appendChild(card);
    });
  }

  async function refresh() {
    try {
      const response = await fetch('api/public-state.php', {cache: 'no-store'});
      const data = await response.json();
      if (!data.ok) return;
      const state = data.state;
      count.textContent = state.count;
      target.textContent = state.target;

      if (state.revealed) {
        if (!lastRevealed) {
          renderGroups(state.groups);
          waiting.hidden = true;
          revealed.hidden = false;
          lastRevealed = true;
        }
      } else if (lastRevealed) {
        revealed.hidden = true;
        waiting.hidden = false;
        lastRevealed = false;
      }
    } catch {}
  }

  refresh();
  setInterval(refresh, 1000);
})();
