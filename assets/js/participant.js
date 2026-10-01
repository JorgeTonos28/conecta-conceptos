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
  const views = [joinView, cardView, conceptView, revealView].filter(Boolean);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let token = localStorage.getItem(tokenKey) || '';
  let currentView = joinView;
  let transitioning = false;

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

  function setViewImmediate(view) {
    views.forEach(v => {
      const active = v === view;
      v.hidden = !active;
      v.classList.toggle('is-active', active);
    });
    currentView = view;
  }

  async function transitionTo(view, direction = 'forward') {
    if (!view || view === currentView || transitioning) {
      if (view && view !== currentView) setViewImmediate(view);
      return;
    }

    if (reducedMotion || !currentView?.animate || !view.animate) {
      setViewImmediate(view);
      return;
    }

    transitioning = true;
    const outX = direction === 'forward' ? -28 : 28;
    const inX = direction === 'forward' ? 34 : -34;

    try {
      await currentView.animate([
        {opacity:1, transform:'translate3d(0,0,0) scale(1)', filter:'blur(0px)'},
        {opacity:0, transform:`translate3d(${outX}px,-6px,0) scale(.985)`, filter:'blur(5px)'}
      ], {
        duration:300,
        easing:'cubic-bezier(.4,0,.2,1)',
        fill:'forwards'
      }).finished;

      currentView.hidden = true;
      currentView.classList.remove('is-active');
      currentView.getAnimations().forEach(a => a.cancel());

      view.hidden = false;
      view.classList.add('is-active');
      view.animate([
        {opacity:0, transform:`translate3d(${inX}px,12px,0) scale(.975)`, filter:'blur(6px)'},
        {opacity:1, transform:'translate3d(0,0,0) scale(1)', filter:'blur(0px)'}
      ], {
        duration:520,
        easing:'cubic-bezier(.16,1,.3,1)',
        fill:'both'
      });

      currentView = view;
    } finally {
      setTimeout(() => { transitioning = false; }, 520);
    }
  }

  function dealCards() {
    const cards = [...document.querySelectorAll('.mystery-card')];
    cards.forEach((card, index) => {
      card.classList.remove('picked');
      card.disabled = false;
      if (reducedMotion || !card.animate) return;

      card.animate([
        {
          opacity:0,
          transform:`translate3d(${index % 2 ? 120 : -120}px,90px,-160px) rotateY(${index % 2 ? -32 : 32}deg) rotateZ(${index % 2 ? 8 : -8}deg) scale(.72)`
        },
        {
          opacity:1,
          transform:'translate3d(0,0,0) rotateY(0deg) rotateZ(0deg) scale(1)'
        }
      ], {
        duration:760,
        delay:index * 115,
        easing:'cubic-bezier(.16,1,.3,1)',
        fill:'both'
      });
    });
  }

  function renderConcept(participant, animate = true) {
    document.getElementById('participantName').textContent = participant.name || '';
    document.getElementById('conceptLabel').textContent = participant.concept || '';
    document.getElementById('conceptHint').textContent = participant.hint || '';

    const action = animate ? transitionTo(conceptView, 'forward') : Promise.resolve(setViewImmediate(conceptView));
    action.then(() => {
      window.dispatchEvent(new CustomEvent('concept:revealed'));
      const label = document.getElementById('conceptLabel');
      if (!reducedMotion && label?.animate) {
        label.animate([
          {opacity:0, transform:'translateZ(-60px) scale(.72) rotateX(18deg)', letterSpacing:'.12em'},
          {opacity:1, transform:'translateZ(0) scale(1.04) rotateX(0deg)', letterSpacing:'-.05em'},
          {opacity:1, transform:'translateZ(0) scale(1)', letterSpacing:'-.05em'}
        ], {
          duration:880,
          easing:'cubic-bezier(.16,1,.3,1)'
        });
      }
    });
  }

  function renderReveal(participant, animate = true) {
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

    const action = animate ? transitionTo(revealView, 'forward') : Promise.resolve(setViewImmediate(revealView));
    action.then(() => window.dispatchEvent(new CustomEvent('connections:revealed')));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  async function restore() {
    if (!token) {
      setViewImmediate(joinView);
      return;
    }

    try {
      const data = await api('api/me.php?token=' + encodeURIComponent(token));
      if (data.participant.revealed) {
        renderReveal(data.participant, false);
      } else if (data.participant.concept) {
        renderConcept(data.participant, false);
      } else {
        setViewImmediate(cardView);
        requestAnimationFrame(dealCards);
      }
    } catch {
      localStorage.removeItem(tokenKey);
      token = '';
      setViewImmediate(joinView);
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
        method:'POST',
        body:JSON.stringify({name:firstName.value})
      });

      token = data.token;
      localStorage.setItem(tokenKey, token);
      await transitionTo(cardView, 'forward');
      setTimeout(dealCards, 100);
    } catch (e) {
      error(joinError, e.message);
      if (!reducedMotion && joinView.animate) {
        joinView.animate([
          {transform:'translateX(0)'},
          {transform:'translateX(-8px)'},
          {transform:'translateX(8px)'},
          {transform:'translateX(0)'}
        ], {duration:320,easing:'ease-out'});
      }
    } finally {
      button.disabled = false;
      button.classList.remove('is-loading');
    }
  });

  document.querySelectorAll('.mystery-card').forEach((card, index) => {
    card.addEventListener('click', async () => {
      if (!token || transitioning || card.classList.contains('picked')) return;

      const allCards = [...document.querySelectorAll('.mystery-card')];
      allCards.forEach(c => c.disabled = true);
      card.classList.add('picked');
      card.parentElement.classList.add('has-selection');
      error(cardError, '');

      const selectionAnimation = !reducedMotion && card.animate
        ? card.animate([
            {transform:'translate3d(0,0,0) rotateY(0deg) scale(1)', filter:'brightness(1)'},
            {transform:'translate3d(0,-18px,80px) rotateY(180deg) scale(1.08)', filter:'brightness(1.18)'},
            {transform:'translate3d(0,-5px,20px) rotateY(360deg) scale(.98)', filter:'brightness(1.04)'}
          ], {
            duration:920,
            easing:'cubic-bezier(.2,.82,.2,1)',
            fill:'forwards'
          })
        : null;

      allCards.filter(c => c !== card).forEach((other, otherIndex) => {
        if (!reducedMotion && other.animate) {
          other.animate([
            {opacity:1, transform:'translate3d(0,0,0) scale(1)'},
            {opacity:0, transform:`translate3d(${otherIndex % 2 ? 45 : -45}px,30px,-80px) scale(.86)`}
          ], {
            duration:520,
            easing:'cubic-bezier(.4,0,.2,1)',
            fill:'forwards'
          });
        }
      });

      try {
        const data = await api('api/choose-card.php', {
          method:'POST',
          body:JSON.stringify({token,card:index + 1})
        });

        if (selectionAnimation) {
          try { await selectionAnimation.finished; } catch {}
        } else {
          await new Promise(resolve => setTimeout(resolve, 420));
        }

        renderConcept(data.participant, true);
      } catch (e) {
        error(cardError, e.message);
        allCards.forEach(c => {
          c.disabled = false;
          c.getAnimations().forEach(a => a.cancel());
          c.style.removeProperty('opacity');
          c.style.removeProperty('transform');
        });
        card.classList.remove('picked');
        card.parentElement.classList.remove('has-selection');
      }
    });
  });

  setInterval(async () => {
    if (!token) return;
    try {
      const data = await api('api/me.php?token=' + encodeURIComponent(token));
      if (data.participant.revealed && revealView.hidden) renderReveal(data.participant, true);
    } catch {}
  }, 1200);

  setViewImmediate(joinView);
  restore();
})();