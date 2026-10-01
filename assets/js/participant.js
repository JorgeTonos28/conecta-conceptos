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
  const cardChoices = document.getElementById('cardChoices');
  const availableCount = document.getElementById('availableCount');
  const views = [joinView, cardView, conceptView, revealView].filter(Boolean);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let token = localStorage.getItem(tokenKey) || '';
  let currentView = joinView;
  let transitioning = false;
  let currentOptions = new Map();
  let localSelecting = false;

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
    if (!response.ok || data.ok === false) {
      throw new Error(data.error || 'Ocurrió un error.');
    }

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
    if (!view) return;

    if (view === currentView) {
      setViewImmediate(view);
      return;
    }

    if (transitioning) return;

    if (reducedMotion || !currentView?.animate || !view.animate) {
      setViewImmediate(view);
      return;
    }

    transitioning = true;
    const outX = direction === 'forward' ? -34 : 34;
    const inX = direction === 'forward' ? 42 : -42;

    try {
      const outgoing = currentView;
      await outgoing.animate([
        {opacity:1, transform:'translate3d(0,0,0) scale(1)', filter:'blur(0px)'},
        {opacity:0, transform:`translate3d(${outX}px,-8px,-35px) scale(.975)`, filter:'blur(7px)'}
      ], {
        duration:340,
        easing:'cubic-bezier(.4,0,.2,1)',
        fill:'forwards'
      }).finished;

      outgoing.hidden = true;
      outgoing.classList.remove('is-active');
      outgoing.getAnimations().forEach(a => a.cancel());

      view.hidden = false;
      view.classList.add('is-active');
      await view.animate([
        {opacity:0, transform:`translate3d(${inX}px,18px,-50px) scale(.96)`, filter:'blur(8px)'},
        {opacity:1, transform:'translate3d(0,0,0) scale(1)', filter:'blur(0px)'}
      ], {
        duration:560,
        easing:'cubic-bezier(.16,1,.3,1)',
        fill:'both'
      }).finished;

      view.getAnimations().forEach(a => a.cancel());
      currentView = view;
    } finally {
      transitioning = false;
    }
  }

  function renderOptions(state, firstRender = false) {
    const options = Array.isArray(state?.concept_options) ? state.concept_options : [];
    const available = Number(state?.available_count ?? options.filter(option => option.available).length);
    availableCount.textContent = available + ' de ' + options.length;

    const incomingIds = new Set(options.map(option => option.id));

    [...currentOptions.keys()].forEach(id => {
      if (!incomingIds.has(id)) {
        currentOptions.get(id)?.remove();
        currentOptions.delete(id);
      }
    });

    options.forEach((option, index) => {
      let button = currentOptions.get(option.id);

      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'mystery-card concept-choice-card';
        button.dataset.conceptId = option.id;
        button.style.setProperty('--card-index', index);
        button.innerHTML =
          '<span class="choice-card-number">' + String(index + 1).padStart(2, '0') + '</span>' +
          '<span class="choice-card-orb" aria-hidden="true"></span>' +
          '<span class="choice-card-label"></span>' +
          '<span class="choice-card-status"></span>';
        cardChoices.appendChild(button);
        currentOptions.set(option.id, button);
        button.addEventListener('click', () => chooseConcept(button));
      }

      const wasAvailable = !button.classList.contains('is-taken');
      const label = button.querySelector('.choice-card-label');
      const status = button.querySelector('.choice-card-status');

      label.textContent = option.label;
      button.dataset.label = option.label;
      button.setAttribute('aria-label', option.available ? 'Elegir ' + option.label : option.label + ', ya elegido');

      if (option.available) {
        button.disabled = localSelecting;
        button.classList.remove('is-taken');
        status.textContent = 'Disponible';
      } else {
        button.disabled = true;
        button.classList.add('is-taken');
        status.textContent = 'Elegido';

        if (wasAvailable && !firstRender && !reducedMotion && button.animate) {
          button.animate([
            {opacity:1, transform:'translate3d(0,0,0) scale(1)'},
            {opacity:.34, transform:'translate3d(0,7px,-45px) scale(.94)'}
          ], {
            duration:420,
            easing:'cubic-bezier(.4,0,.2,1)'
          });
        }
      }
    });

    if (firstRender) {
      dealCards();
    }
  }

  function dealCards() {
    const cards = [...cardChoices.querySelectorAll('.concept-choice-card')];

    cards.forEach((card, index) => {
      if (reducedMotion || !card.animate) return;

      const side = index % 2 === 0 ? -1 : 1;
      const row = Math.floor(index / 2);

      card.animate([
        {
          opacity:0,
          transform:`translate3d(${side * (150 + row * 22)}px,${90 + row * 22}px,-220px) rotateX(34deg) rotateY(${side * -28}deg) rotateZ(${side * 8}deg) scale(.68)`,
          filter:'blur(6px)'
        },
        {
          opacity:1,
          transform:`translate3d(${side * -8}px,-6px,28px) rotateX(-2deg) rotateY(${side * 2}deg) rotateZ(0deg) scale(1.025)`,
          filter:'blur(0px)',
          offset:.78
        },
        {
          opacity:1,
          transform:'translate3d(0,0,0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)',
          filter:'blur(0px)'
        }
      ], {
        duration:900,
        delay:index * 105,
        easing:'cubic-bezier(.16,1,.3,1)',
        fill:'both'
      });
    });
  }

  async function animateSelectionBridge(card) {
    if (reducedMotion || !card.animate) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const clone = card.cloneNode(true);
    clone.classList.add('selection-clone');
    clone.disabled = true;

    Object.assign(clone.style, {
      position:'fixed',
      left:rect.left + 'px',
      top:rect.top + 'px',
      width:rect.width + 'px',
      height:rect.height + 'px',
      margin:'0',
      zIndex:'9999',
      pointerEvents:'none',
      transformOrigin:'50% 50%'
    });

    document.body.appendChild(clone);
    card.style.visibility = 'hidden';

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const targetWidth = Math.min(390, viewportW - 44);
    const scale = targetWidth / Math.max(rect.width, 1);
    const targetX = viewportW / 2 - (rect.left + rect.width / 2);
    const targetY = viewportH / 2 - (rect.top + rect.height / 2);

    const siblings = [...cardChoices.querySelectorAll('.concept-choice-card')].filter(node => node !== card);
    siblings.forEach((node, index) => {
      if (!node.animate) return;
      node.animate([
        {opacity:1, transform:'translate3d(0,0,0) scale(1)'},
        {opacity:0, transform:`translate3d(${index % 2 ? 70 : -70}px,36px,-100px) scale(.84)`, filter:'blur(5px)'}
      ], {
        duration:520,
        easing:'cubic-bezier(.4,0,.2,1)',
        fill:'forwards'
      });
    });

    const bridge = clone.animate([
      {
        transform:'translate3d(0,0,0) rotateX(0deg) rotateY(0deg) scale(1)',
        boxShadow:'0 10px 0 rgba(7,25,45,.8),0 24px 46px rgba(7,25,45,.22)',
        filter:'brightness(1)'
      },
      {
        transform:`translate3d(${targetX * .76}px,${targetY * .76 - 18}px,120px) rotateX(-8deg) rotateY(14deg) scale(${scale * .94})`,
        boxShadow:'0 18px 0 rgba(7,25,45,.65),0 40px 86px rgba(7,25,45,.34)',
        filter:'brightness(1.18)',
        offset:.62
      },
      {
        transform:`translate3d(${targetX}px,${targetY}px,170px) rotateX(0deg) rotateY(0deg) scale(${scale})`,
        boxShadow:'0 14px 0 rgba(7,25,45,.55),0 48px 100px rgba(7,25,45,.38)',
        filter:'brightness(1.1)'
      }
    ], {
      duration:820,
      easing:'cubic-bezier(.16,1,.3,1)',
      fill:'forwards'
    });

    try {
      await bridge.finished;
    } catch {}

    await clone.animate([
      {opacity:1, transform:getComputedStyle(clone).transform},
      {opacity:0, transform:`translate3d(${targetX}px,${targetY - 12}px,190px) rotateX(-4deg) scale(${scale * 1.05})`, filter:'blur(6px)'}
    ], {
      duration:240,
      easing:'ease-out',
      fill:'forwards'
    }).finished.catch(() => {});

    clone.remove();
    card.style.visibility = '';
  }

  function conceptRevealNodes() {
    return {
      conceptCard:conceptView.querySelector('.concept-card'),
      kicker:conceptView.querySelector('.concept-kicker'),
      label:document.getElementById('conceptLabel'),
      hint:conceptView.querySelector('.hint-box'),
      mission:conceptView.querySelector('.mission-card'),
      name:conceptView.querySelector('.participant-name')
    };
  }

  function prepareConceptReveal() {
    if (reducedMotion) return;

    const {conceptCard,kicker,label,hint,mission,name} = conceptRevealNodes();

    // Keep the destination content hidden while the panel itself transitions in.
    // This prevents the "show → disappear → show again" flash.
    [conceptCard,kicker,label,hint,mission,name].forEach(node => {
      if (!node) return;
      node.getAnimations().forEach(animation => animation.cancel());
      node.style.opacity = '0';
      node.style.visibility = 'hidden';
    });
  }

  function animateConceptReveal() {
    const {conceptCard,kicker,label,hint,mission,name} = conceptRevealNodes();

    if (reducedMotion) {
      [conceptCard,kicker,label,hint,mission,name].forEach(node => {
        if (!node) return;
        node.style.opacity = '';
        node.style.visibility = '';
      });
      window.dispatchEvent(new CustomEvent('concept:revealed'));
      return;
    }

    [conceptCard,kicker,label,hint,mission,name].forEach(node => {
      if (!node) return;
      node.style.visibility = 'visible';
    });

    const cardAnimation = conceptCard?.animate([
      {opacity:0, transform:'perspective(900px) translate3d(0,28px,-100px) rotateX(16deg) scale(.88)', filter:'blur(8px)'},
      {opacity:1, transform:'perspective(900px) translate3d(0,-4px,18px) rotateX(-2deg) scale(1.02)', filter:'blur(0px)', offset:.82},
      {opacity:1, transform:'perspective(900px) translate3d(0,0,0) rotateX(0deg) scale(1)', filter:'blur(0px)'}
    ], {
      duration:760,
      easing:'cubic-bezier(.16,1,.3,1)',
      fill:'forwards'
    });

    if (conceptCard) conceptCard.style.opacity = '';

    const staged = [
      [name, 40],
      [kicker, 120],
      [label, 205],
      [hint, 335],
      [mission, 475]
    ];

    staged.forEach(([node, delay], index) => {
      if (!node?.animate) return;

      node.style.opacity = '';
      node.animate([
        {
          opacity:0,
          transform:index === 2
            ? 'translate3d(0,18px,-60px) scale(.72) rotateX(14deg)'
            : 'translate3d(0,12px,-20px) scale(.96)'
        },
        {
          opacity:1,
          transform:index === 2
            ? 'translate3d(0,-2px,12px) scale(1.035) rotateX(0deg)'
            : 'translate3d(0,0,0) scale(1)'
        },
        {
          opacity:1,
          transform:'translate3d(0,0,0) scale(1)'
        }
      ], {
        duration:index === 2 ? 680 : 460,
        delay,
        easing:'cubic-bezier(.16,1,.3,1)',
        fill:'both'
      });
    });

    cardAnimation?.finished.finally(() => {
      if (conceptCard) {
        conceptCard.style.opacity = '';
        conceptCard.style.visibility = '';
      }
    });

    setTimeout(() => window.dispatchEvent(new CustomEvent('concept:revealed')), 180);
  }

  async function showConcept(participant, animated = true) {
    document.getElementById('participantName').textContent = participant.name || '';
    document.getElementById('conceptLabel').textContent = participant.concept || '';
    document.getElementById('conceptHint').textContent = participant.hint || '';

    if (animated) {
      prepareConceptReveal();
      await transitionTo(conceptView, 'forward');
      animateConceptReveal();
    } else {
      const {conceptCard,kicker,label,hint,mission,name} = conceptRevealNodes();
      [conceptCard,kicker,label,hint,mission,name].forEach(node => {
        if (!node) return;
        node.style.opacity = '';
        node.style.visibility = '';
      });
      setViewImmediate(conceptView);
    }
  }

  async function showReveal(participant, animated = true) {
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

    if (animated) {
      await transitionTo(revealView, 'forward');
    } else {
      setViewImmediate(revealView);
    }

    window.dispatchEvent(new CustomEvent('connections:revealed'));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#039;'
    }[char]));
  }

  async function refreshOptions(firstRender = false) {
    try {
      const data = await api('api/public-state.php');

      if (data.state.revealed) {
        return;
      }

      renderOptions(data.state, firstRender);
    } catch {}
  }

  async function chooseConcept(card) {
    if (!token || localSelecting || transitioning || card.disabled || card.classList.contains('is-taken')) {
      return;
    }

    localSelecting = true;
    error(cardError, '');

    [...cardChoices.querySelectorAll('.concept-choice-card')].forEach(node => {
      node.disabled = true;
    });

    card.classList.add('is-selecting');

    try {
      const request = api('api/choose-card.php', {
        method:'POST',
        body:JSON.stringify({
          token,
          concept_id:card.dataset.conceptId
        })
      });

      const lift = !reducedMotion && card.animate
        ? card.animate([
            {transform:'translate3d(0,0,0) scale(1)'},
            {transform:'translate3d(0,-10px,38px) scale(1.035)'}
          ], {
            duration:320,
            easing:'cubic-bezier(.16,1,.3,1)',
            fill:'forwards'
          }).finished.catch(() => {})
        : Promise.resolve();

      const [data] = await Promise.all([request, lift]);

      await animateSelectionBridge(card);
      await showConcept(data.participant, true);
    } catch (e) {
      localSelecting = false;
      card.classList.remove('is-selecting');
      card.getAnimations().forEach(animation => animation.cancel());
      error(cardError, e.message);
      await refreshOptions(false);

      [...cardChoices.querySelectorAll('.concept-choice-card')].forEach(node => {
        if (!node.classList.contains('is-taken')) node.disabled = false;
      });

      if (!reducedMotion && cardView.animate) {
        cardView.animate([
          {transform:'translateX(0)'},
          {transform:'translateX(-8px)'},
          {transform:'translateX(8px)'},
          {transform:'translateX(0)'}
        ], {
          duration:320,
          easing:'ease-out'
        });
      }

      return;
    }

    localSelecting = false;
  }

  async function restore() {
    if (!token) {
      setViewImmediate(joinView);
      return;
    }

    try {
      const data = await api('api/me.php?token=' + encodeURIComponent(token));

      if (data.participant.revealed) {
        await showReveal(data.participant, false);
      } else if (data.participant.concept) {
        await showConcept(data.participant, false);
      } else {
        setViewImmediate(cardView);
        await refreshOptions(true);
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
      renderOptions(data.state, true);
    } catch (e) {
      error(joinError, e.message);

      if (!reducedMotion && joinView.animate) {
        joinView.animate([
          {transform:'translateX(0)'},
          {transform:'translateX(-8px)'},
          {transform:'translateX(8px)'},
          {transform:'translateX(0)'}
        ], {
          duration:320,
          easing:'ease-out'
        });
      }
    } finally {
      button.disabled = false;
      button.classList.remove('is-loading');
    }
  });

  setInterval(async () => {
    if (!token) return;

    try {
      const data = await api('api/me.php?token=' + encodeURIComponent(token));

      if (data.participant.revealed && revealView.hidden) {
        await showReveal(data.participant, true);
        return;
      }

      if (currentView === cardView && !localSelecting) {
        await refreshOptions(false);
      }
    } catch {}
  }, 900);

  setViewImmediate(joinView);
  restore();
})();