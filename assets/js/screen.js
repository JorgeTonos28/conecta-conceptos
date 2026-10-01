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
      card.style.setProperty('--delay', (groupIndex * 170) + 'ms');

      const members = (group.members || []).map((m, index) =>
        '<div class="connection-member">' +
          '<div><small>' + (index === 0 ? 'CONCEPTO A' : 'CONCEPTO B') + '</small><strong>' + escapeHtml(m.concept) + '</strong></div>' +
          '<span>' + escapeHtml(m.name) + '</span>' +
        '</div>' +
        (index === 0 ? '<div class="connection-line"><span></span><i>+</i><span></span></div>' : '')
      ).join('');

      card.innerHTML =
        '<div class="connection-card-head"><small>CONEXIÓN ' + String(groupIndex + 1).padStart(2, '0') + '</small><span>●</span></div>' +
        '<h3>' + escapeHtml(group.name) + '</h3>' +
        '<div class="connection-members">' + members + '</div>';

      grid.appendChild(card);
    });
  }

  function showWaiting() {
    revealed.hidden = true;
    waiting.hidden = false;
    waiting.classList.add('is-active');
    revealed.classList.remove('is-active');
  }

  function showReveal(groups) {
    renderGroups(groups);
    waiting.hidden = true;
    revealed.hidden = false;
    waiting.classList.remove('is-active');
    revealed.classList.add('is-active');
    requestAnimationFrame(() => window.dispatchEvent(new CustomEvent('connections:revealed')));
  }

  async function refresh() {
    try {
      const response = await fetch('api/public-state.php', {cache: 'no-store'});
      const data = await response.json();
      if (!data.ok) return;
      const state = data.state;

      count.textContent = state.count;
      target.textContent = state.target;

      if (state.revealed && !lastRevealed) {
        showReveal(state.groups);
        lastRevealed = true;
      } else if (!state.revealed && lastRevealed) {
        showWaiting();
        window.dispatchEvent(new CustomEvent('experience:reset'));
        lastRevealed = false;
      }
    } catch {}
  }

  showWaiting();
  refresh();
  setInterval(refresh, 900);
})();