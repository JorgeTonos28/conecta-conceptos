(() => {
  const tokenKey = 'conectaConceptosToken';
  const joinView = document.getElementById('joinView');
  const cardView = document.getElementById('cardView');
  const conceptView = document.getElementById('conceptView');
  const revealView = document.getElementById('revealView');
  const joinForm = document.getElementById('joinForm');
  const firstName = document.getElementById('firstName');
  const joinError = document.getElementById('joinError');
  const cardError = document.getElementById('cardError');

  let token = localStorage.getItem(tokenKey) || '';

  function show(view) {
    [joinView, cardView, conceptView, revealView].forEach(v => {
      const isActive = v === view;
      v.hidden = !isActive;
      v.classList.toggle('is-active', isActive);
    });
  }

  function error(el, message) {
    el.textContent = message;
    el.hidden = !message;
  }

  async function api(url, options = {}) {
    const response = await fetch(url, {
      headers: {'Content-Type': 'application/json', ...(options.headers || {})},
      cache: 'no-store',
      ...options
    });
    const data = await response.json();
    if (!response.ok || data.ok === false) throw new Error(data.error || 'Ocurrió un error.');
    return data;
  }

  function renderConcept(participant) {
    document.getElementById('participantName').textContent = participant.name || '';
    document.getElementById('conceptLabel').textContent = participant.concept || '';
    document.getElementById('conceptHint').textContent = participant.hint || '';
    show(conceptView);
    window.dispatchEvent(new CustomEvent('concept:revealed'));
  }

  function renderReveal(participant) {
    document.getElementById('connectionName').textContent = participant.connection_name || 'Conexión';
    const list = document.getElementById('partnerList');
    list.innerHTML = '';

    const self = document.createElement('div');
    self.className = 'partner-chip self';
    self.innerHTML = '<span>Tú</span><strong>' + escapeHtml(participant.name || '') + '</strong><em>' + escapeHtml(participant.concept || '') + '</em>';
    list.appendChild(self);

    (participant.partners || []).forEach(partner => {
      const node = document.createElement('div');
      node.className = 'partner-chip';
      node.innerHTML = '<span>Tu conexión</span><strong>' + escapeHtml(partner.name) + '</strong><em>' + escapeHtml(partner.concept) + '</em>';
      list.appendChild(node);
    });

    show(revealView);
    window.dispatchEvent(new CustomEvent('connections:revealed'));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  async function restore() {
    if (!token) return;
    try {
      const data = await api('api/me.php?token=' + encodeURIComponent(token));
      if (data.participant.revealed) {
        renderReveal(data.participant);
      } else if (data.participant.concept) {
        renderConcept(data.participant);
      } else {
        show(cardView);
      }
    } catch {
      localStorage.removeItem(tokenKey);
      token = '';
      show(joinView);
    }
  }

  joinForm?.addEventListener('submit', async event => {
    event.preventDefault();
    error(joinError, '');
    const button = joinForm.querySelector('button[type=submit]');
    button.disabled = true;
    button.classList.add('is-loading');

    try {
      const data = await api('api/join.php', {
        method: 'POST',
        body: JSON.stringify({name: firstName.value})
      });
      token = data.token;
      localStorage.setItem(tokenKey, token);
      show(cardView);
    } catch (e) {
      error(joinError, e.message);
    } finally {
      button.disabled = false;
      button.classList.remove('is-loading');
    }
  });

  document.querySelectorAll('.mystery-card').forEach((card, index) => {
    card.addEventListener('click', async () => {
      if (!token || card.classList.contains('picked')) return;

      const allCards = [...document.querySelectorAll('.mystery-card')];
      allCards.forEach(c => c.disabled = true);
      card.classList.add('picked');
      card.parentElement.classList.add('has-selection');
      error(cardError, '');

      try {
        const data = await api('api/choose-card.php', {
          method: 'POST',
          body: JSON.stringify({token, card: index + 1})
        });

        setTimeout(() => renderConcept(data.participant), 760);
      } catch (e) {
        error(cardError, e.message);
        allCards.forEach(c => c.disabled = false);
        card.classList.remove('picked');
        card.parentElement.classList.remove('has-selection');
      }
    });
  });

  setInterval(async () => {
    if (!token) return;
    try {
      const data = await api('api/me.php?token=' + encodeURIComponent(token));
      if (data.participant.revealed && revealView.hidden) renderReveal(data.participant);
    } catch {}
  }, 1200);

  show(joinView);
  restore();
})();