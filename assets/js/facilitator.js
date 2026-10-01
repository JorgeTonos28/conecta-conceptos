(() => {
  const shell = document.querySelector('.admin-shell');
  if (!shell) return;

  const csrf = shell.dataset.csrf;
  const countEl = document.getElementById('adminCount');
  const assignedEl = document.getElementById('adminAssigned');
  const statusEl = document.getElementById('adminStatus');
  const sessionEl = document.getElementById('adminSession');
  const tableEl = document.getElementById('participantsTable');
  const showConcepts = document.getElementById('showConcepts');
  const revealButton = document.getElementById('revealButton');
  const resetButton = document.getElementById('resetButton');
  const targetSelect = document.getElementById('targetSelect');
  const pairOptions = [...document.querySelectorAll('#pairOptions input[type=checkbox]')];
  const messageEl = document.getElementById('adminMessage');

  let latest = null;

  async function api(url, body) {
    const response = await fetch(url, {
      method: body ? 'POST' : 'GET',
      headers: {'Content-Type': 'application/json'},
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store'
    });
    const data = await response.json();
    if (!response.ok || data.ok === false) throw new Error(data.error || 'Ocurrió un error.');
    return data;
  }

  function msg(text, error = false) {
    messageEl.textContent = text || '';
    messageEl.classList.toggle('error', error);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  function render(data) {
    latest = data;
    const state = data.state;
    const pub = data.public;

    countEl.textContent = pub.count + ' / ' + pub.target;
    assignedEl.textContent = pub.assigned_count;
    statusEl.textContent = pub.revealed ? 'Revelado' : (pub.count >= pub.target ? 'Todos listos' : 'Preparando');
    sessionEl.textContent = state.session_id;

    targetSelect.value = String(state.target);
    pairOptions.forEach(cb => cb.checked = state.pair_ids.includes(cb.value));

    revealButton.disabled = pub.revealed || pub.assigned_count < 2;
    revealButton.textContent = pub.revealed ? 'Conexiones reveladas' : 'Revelar conexiones';

    if (!state.participants.length) {
      tableEl.innerHTML = '<div class="empty-state">Aún no hay participantes registrados.</div>';
      return;
    }

    tableEl.innerHTML = state.participants.map((p, i) => {
      const concept = showConcepts.checked ? (p.concept_label || 'Sin elegir') : (p.concept_id ? '••••••••' : 'Sin elegir');
      return '<div class="participant-row">' +
        '<span class="row-number">' + (i + 1) + '</span>' +
        '<strong>' + escapeHtml(p.name) + '</strong>' +
        '<span class="row-concept">' + escapeHtml(concept) + '</span>' +
        '<button class="remove-button" type="button" data-id="' + escapeHtml(p.id) + '"' + (state.revealed ? ' disabled' : '') + '>Eliminar</button>' +
      '</div>';
    }).join('');

    tableEl.querySelectorAll('.remove-button').forEach(button => {
      button.addEventListener('click', () => removeParticipant(button.dataset.id));
    });
  }

  async function refresh() {
    try {
      render(await api('../api/admin-state.php'));
    } catch (e) {
      msg(e.message, true);
    }
  }

  async function removeParticipant(id) {
    if (!confirm('¿Eliminar este participante? Su tarjeta volverá a quedar disponible.')) return;
    try {
      await api('../api/remove-participant.php', {csrf, id});
      msg('Participante eliminado.');
      refresh();
    } catch (e) {
      msg(e.message, true);
    }
  }

  revealButton.addEventListener('click', async () => {
    const count = latest?.public?.assigned_count || 0;
    const target = latest?.public?.target || 0;
    const warning = count < target
      ? 'Aún no todas las tarjetas están asignadas. ¿Deseas revelar las conexiones disponibles de todos modos?'
      : '¿Revelar las conexiones ahora? Este es el momento sorpresa de la dinámica.';

    if (!confirm(warning)) return;

    try {
      await api('../api/reveal.php', {csrf});
      msg('Conexiones reveladas.');
      refresh();
    } catch (e) {
      msg(e.message, true);
    }
  });

  resetButton.addEventListener('click', async () => {
    const target = Number(targetSelect.value);
    const selected = pairOptions.filter(cb => cb.checked).map(cb => cb.value);
    const needed = target / 2;

    if (selected.length !== needed) {
      msg('Para ' + target + ' participantes selecciona exactamente ' + needed + ' pares conceptuales.', true);
      return;
    }

    if (!confirm('Esto borrará todos los nombres actuales y mezclará de nuevo las tarjetas. ¿Continuar?')) return;

    try {
      await api('../api/reset.php', {csrf, target, pair_ids: selected});
      msg('Experiencia reiniciada. Ya puedes abrir el acceso a los participantes.');
      refresh();
    } catch (e) {
      msg(e.message, true);
    }
  });

  showConcepts.addEventListener('change', () => latest && render(latest));

  targetSelect.addEventListener('change', () => {
    const needed = Number(targetSelect.value) / 2;
    pairOptions.forEach((cb, index) => cb.checked = index < needed);
  });

  refresh();
  setInterval(refresh, 1200);
})();
