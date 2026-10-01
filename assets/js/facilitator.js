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
  const restoreSetupButton = document.getElementById('restoreSetupButton');
  const suggestPairsButton = document.getElementById('suggestPairsButton');
  const targetSelect = document.getElementById('targetSelect');
  const pairOptions = [...document.querySelectorAll('#pairOptions input[type=checkbox]')];
  const messageEl = document.getElementById('adminMessage');
  const setupHint = document.getElementById('setupHint');
  const selectedPairsCount = document.getElementById('selectedPairsCount');
  const setupState = document.getElementById('setupState');

  let latest = null;
  let setupHydrated = false;

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

  function selectedPairIds() {
    return pairOptions.filter(cb => cb.checked).map(cb => cb.value);
  }

  function activeMatchesDraft() {
    if (!latest) return true;
    const active = latest.state;
    const selected = selectedPairIds().slice().sort();
    const current = [...active.pair_ids].sort();
    return Number(targetSelect.value) === Number(active.target) &&
      selected.length === current.length &&
      selected.every((id, index) => id === current[index]);
  }

  function updateSetupValidation() {
    const target = Number(targetSelect.value);
    const needed = target / 2;
    const selected = selectedPairIds().length;
    const valid = Number.isInteger(needed) && selected === needed;

    selectedPairsCount.textContent = selected + ' / ' + needed;
    setupHint.textContent = valid
      ? 'Configuración lista: ' + target + ' participantes y ' + selected + ' pares conceptuales.'
      : 'Selecciona exactamente ' + needed + ' pares conceptuales para ' + target + ' participantes.';

    const dirty = latest ? !activeMatchesDraft() : false;
    setupState.textContent = dirty ? 'Cambios sin aplicar' : 'Configuración activa';
    setupState.classList.toggle('pending', dirty);

    resetButton.disabled = !valid;
    resetButton.textContent = dirty ? 'Aplicar configuración e iniciar' : 'Reiniciar experiencia';
  }

  function hydrateSetupFromActive(force = false) {
    if (!latest || (setupHydrated && !force)) return;
    const state = latest.state;
    targetSelect.value = String(state.target);
    pairOptions.forEach(cb => cb.checked = state.pair_ids.includes(cb.value));
    setupHydrated = true;
    updateSetupValidation();
  }

  function render(data, forceSetupSync = false) {
    latest = data;
    const state = data.state;
    const pub = data.public;

    countEl.textContent = pub.count + ' / ' + pub.target;
    assignedEl.textContent = pub.assigned_count;
    statusEl.textContent = pub.revealed ? 'Revelado' : (pub.count >= pub.target ? 'Todos listos' : 'Preparando');
    sessionEl.textContent = state.session_id;

    hydrateSetupFromActive(forceSetupSync);
    updateSetupValidation();

    revealButton.disabled = pub.revealed || pub.assigned_count < 2;
    revealButton.textContent = pub.revealed ? 'Conexiones reveladas' : 'Revelar conexiones';

    if (!state.participants.length) {
      tableEl.innerHTML = '<div class="empty-state"><strong>Esperando participantes</strong><span>Cuando alguien ingrese desde el QR aparecerá aquí.</span></div>';
      return;
    }

    tableEl.innerHTML = state.participants.map((p, i) => {
      const concept = showConcepts.checked ? (p.concept_label || 'Sin elegir') : (p.concept_id ? 'Concepto oculto' : 'Sin elegir');
      const conceptClass = showConcepts.checked && p.concept_id ? 'concept-pill visible' : 'concept-pill';
      const stateClass = p.concept_id ? 'ready' : 'waiting';
      return '<div class="participant-row">' +
        '<span class="row-number">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<div class="participant-meta"><strong>' + escapeHtml(p.name) + '</strong><small class="' + stateClass + '">' + (p.concept_id ? 'Tarjeta revelada' : 'Eligiendo tarjeta') + '</small></div>' +
        '<span class="row-concept"><span class="' + conceptClass + '">' + escapeHtml(concept) + '</span></span>' +
        '<button class="remove-button" type="button" data-id="' + escapeHtml(p.id) + '"' + (state.revealed ? ' disabled' : '') + '>Eliminar</button>' +
      '</div>';
    }).join('');

    tableEl.querySelectorAll('.remove-button').forEach(button => {
      button.addEventListener('click', () => removeParticipant(button.dataset.id));
    });
  }

  async function refresh(forceSetupSync = false) {
    try {
      render(await api('../api/admin-state.php'), forceSetupSync);
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
    const selected = selectedPairIds();
    const needed = target / 2;

    if (selected.length !== needed) {
      msg('Para ' + target + ' participantes selecciona exactamente ' + needed + ' pares conceptuales.', true);
      return;
    }

    const verb = activeMatchesDraft() ? 'reiniciar' : 'aplicar esta configuración e iniciar';
    if (!confirm('¿Deseas ' + verb + ' la experiencia? Se borrarán los nombres actuales y se mezclarán nuevamente las tarjetas.')) return;

    try {
      await api('../api/reset.php', {csrf, target, pair_ids: selected});
      msg('Configuración aplicada. La experiencia está limpia y lista.');
      await refresh(true);
    } catch (e) {
      msg(e.message, true);
    }
  });

  restoreSetupButton.addEventListener('click', () => {
    hydrateSetupFromActive(true);
    msg('Se restauró la configuración activa.');
  });

  suggestPairsButton.addEventListener('click', () => {
    const needed = Number(targetSelect.value) / 2;
    pairOptions.forEach((cb, index) => cb.checked = index < needed);
    updateSetupValidation();
  });

  showConcepts.addEventListener('change', () => {
    if (latest) render(latest);
    showConcepts.closest('.toggle-line')?.classList.toggle('is-on', showConcepts.checked);
  });
  targetSelect.addEventListener('change', updateSetupValidation);
  pairOptions.forEach(cb => cb.addEventListener('change', updateSetupValidation));

  refresh(true);
  setInterval(() => refresh(false), 1200);
})();