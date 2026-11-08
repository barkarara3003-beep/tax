(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var menu = document.getElementById('menu-toggle');
  var navigation = document.getElementById('navigation');
  menu.hidden = false;
  function closeMenu() { navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
  menu.addEventListener('click', function () {
    var open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('open', open);
  });
  navigation.addEventListener('click', function (event) { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  var countries = [
    { id: 'us', name: 'United States' }, { id: 'uk', name: 'United Kingdom' },
    { id: 'ca', name: 'Canada (English, excluding Quebec)', short: 'Canada*' },
    { id: 'au', name: 'Australia' }, { id: 'sg', name: 'Singapore' }, { id: 'ae', name: 'United Arab Emirates' }
  ];
  var controls = document.getElementById('country-controls');
  countries.forEach(function (country, index) {
    var button = document.createElement('button'); button.type = 'button'; button.textContent = country.short || country.name;
    button.setAttribute('aria-label', country.name); button.setAttribute('aria-pressed', String(index === 0));
    button.setAttribute('aria-controls', 'country-' + country.id);
    document.getElementById('country-' + country.id).hidden = index !== 0;
    button.addEventListener('click', function () {
      countries.forEach(function (item) { document.getElementById('country-' + item.id).hidden = item.id !== country.id; });
      Array.prototype.forEach.call(controls.querySelectorAll('button'), function (item) { item.setAttribute('aria-pressed', String(item === button)); });
    });
    controls.appendChild(button);
  });
  controls.hidden = false;
  // All wizard state is transient. No storage, network calls, or URL parameters.
  var step = 0;
  var answers = { country: '', sources: [], volume: '' };
  var wizard = document.getElementById('wizard');
  var heading = document.getElementById('wizard-heading');
  var content = document.getElementById('wizard-content');
  var back = document.getElementById('wizard-back');
  var skip = document.getElementById('wizard-skip');
  var next = document.getElementById('wizard-next');
  var error = document.getElementById('wizard-error');
  var sourceOptions = ['Exchange exports', 'Wallet transaction history', 'DeFi / staking / mining / airdrops / NFTs', 'Business crypto payments', 'Missing or incomplete records'];
  var volumes = ['Up to 100 transactions', '101–1,000 transactions', '1,001–10,000 transactions', 'More than 10,000 transactions', 'Not sure yet'];
  function element(tag, text) { var node = document.createElement(tag); if (text) node.textContent = text; return node; }
  function addSelect(labelText, id, options, selected) {
    var label = element('label', labelText); label.htmlFor = id; content.appendChild(label);
    var select = element('select'); select.id = id;
    var placeholder = element('option', 'Select an option'); placeholder.value = ''; select.appendChild(placeholder);
    options.forEach(function (text) { var option = element('option', text); option.value = text; option.selected = text === selected; select.appendChild(option); });
    content.appendChild(select);
  }
  function remember() {
    if (step === 0) answers.country = document.getElementById('guide-country').value;
    if (step === 1) answers.sources = Array.prototype.map.call(content.querySelectorAll('input:checked'), function (input) { return input.value; });
    if (step === 2) answers.volume = document.getElementById('guide-volume').value;
  }
  function render(focus) {
    content.textContent = ''; error.textContent = '';
    document.getElementById('wizard-progress').textContent = step < 3 ? 'QUESTION 0' + (step + 1) + ' / 03 · OPTIONAL' : 'YOUR PROPOSED SCOPE';
    back.hidden = step === 0; skip.hidden = step === 3; next.hidden = step === 3;
    if (step === 0) { heading.textContent = 'Where do you report?'; addSelect('Country', 'guide-country', countries.map(function (c) { return c.name; }), answers.country); }
    if (step === 1) {
      heading.textContent = 'Where are your records?';
      var fieldset = element('fieldset'); fieldset.appendChild(element('legend', 'Select all that apply. You can skip this question.'));
      sourceOptions.forEach(function (source, index) {
        var label = element('label'); label.className = 'choice'; var input = element('input'); input.type = 'checkbox'; input.value = source; input.id = 'source-' + index; input.checked = answers.sources.indexOf(source) !== -1;
        label.appendChild(input); label.appendChild(element('span', source)); fieldset.appendChild(label);
      }); content.appendChild(fieldset);
    }
    if (step === 2) { heading.textContent = 'How much activity?'; addSelect('Approximate transaction count', 'guide-volume', volumes, answers.volume); }
    if (step === 3) {
      heading.textContent = 'Start with a reconciled record.';
      content.appendChild(element('p', (answers.country || 'Country not specified') + ' · ' + (answers.volume || 'Volume not specified')));
      var list = element('ul');
      var recommendations = ['Reconcile available transactions, match transfers and check duplicates.', 'Prepare accountant-ready summaries and a record of unresolved questions.'];
      if (!answers.sources.length) recommendations.push('Confirm your transaction sources before defining a final scope.');
      if (answers.sources.indexOf(sourceOptions[2]) !== -1) recommendations.push('Organize DeFi, staking, mining, airdrop and NFT activity for professional tax review.');
      if (answers.sources.indexOf(sourceOptions[3]) !== -1) recommendations.push('Include business crypto-payment matching and bookkeeping records.');
      if (answers.sources.indexOf(sourceOptions[4]) !== -1) recommendations.push('Include history reconstruction and a review of missing source records.');
      if (answers.volume === volumes[2] || answers.volume === volumes[3]) recommendations.push('Scope a larger-volume review, including source coverage and exception handling.');
      recommendations.forEach(function (text) { list.appendChild(element('li', text)); }); content.appendChild(list);
      content.appendChild(element('p', 'This is a scope suggestion, not a tax calculation, quote or eligibility decision. Country availability and qualified professional support must be confirmed.'));
      var link = element('a', 'Explore the inquiry form ↗'); link.href = '#contact'; link.className = 'text-link'; link.style.color = '#174d3c'; content.appendChild(link);
    }
    next.textContent = step === 2 ? 'See suggested scope →' : 'Continue →';
    if (focus) heading.focus();
  }
  next.addEventListener('click', function () {
    remember(); var empty = step === 0 ? !answers.country : step === 1 ? !answers.sources.length : !answers.volume;
    if (empty) { error.textContent = 'Choose an option, or use Skip to continue without answering.'; return; }
    step += 1; render(true);
  });
  skip.addEventListener('click', function () { if (step === 0) answers.country = ''; if (step === 1) answers.sources = []; if (step === 2) answers.volume = ''; step += 1; render(true); });
  back.addEventListener('click', function () { remember(); step = Math.max(0, step - 1); render(true); });
  document.getElementById('wizard-reset').addEventListener('click', function () { step = 0; answers = { country: '', sources: [], volume: '' }; render(true); });
  wizard.hidden = false; render(false);
  Array.prototype.forEach.call(document.querySelectorAll('[data-service]'), function (link) {
    link.addEventListener('click', function () { document.getElementById('service').value = link.getAttribute('data-service'); });
  });
  // The submit button stays disabled unless this handler has been installed.
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  form.addEventListener('submit', function (event) {
    event.preventDefault(); status.textContent = 'Your request could not be sent. Please try again later'; status.className = 'error';
    Array.prototype.forEach.call(form.querySelectorAll('.field-error'), function (node) { node.remove(); });
    Array.prototype.forEach.call(form.querySelectorAll('input, select, textarea'), function (field) {
      field.removeAttribute('aria-invalid'); if (field.id !== 'message') field.removeAttribute('aria-describedby');
      if (!field.validity.valid || (field.required && !field.value.trim())) {
        field.setAttribute('aria-invalid', 'true'); var message = element('p', field.type === 'email' && field.value ? 'Enter a valid email address.' : 'Please complete this required field.');
        message.className = 'field-error'; message.id = field.id + '-error'; field.setAttribute('aria-describedby', (field.id === 'message' ? 'message-help ' : '') + message.id); field.insertAdjacentElement('afterend', message);
      }
    });
    status.focus();
  });
  // Policy links open the relevant native disclosure, including direct hash navigation.
  function openPolicy() { var id = window.location.hash.slice(1); if (['privacy', 'terms', 'refund', 'cookies'].indexOf(id) !== -1) document.getElementById(id).open = true; }
  window.addEventListener('hashchange', openPolicy); openPolicy();
  var submit = form.querySelector('[type="submit"]'); submit.disabled = false;

  // A real document-ready transition, with immediate exit. No artificial wait,
  // simulated progress, consent collection or persistent preference storage.
  if (!window.location.hash) {
    var previousFocus = document.activeElement;
    var intro = element('div'); intro.className = 'intro-overlay';
    intro.setAttribute('role', 'dialog'); intro.setAttribute('aria-modal', 'true');
    intro.setAttribute('aria-labelledby', 'intro-title');
    intro.innerHTML = '<div class="intro-panel"><div class="intro-top"><span class="intro-wordmark">averno</span><button type="button" class="intro-close" aria-label="Close introduction">×</button></div><div class="intro-emblem" aria-hidden="true"><span>a</span><i></i></div><p class="eyebrow">CRYPTO ACCOUNTING & TAX REPORTING</p><h2 id="intro-title">A little clarity.<br><em>A better starting point.</em></h2><div class="intro-loading"><div class="intro-loading-label"><span id="intro-loading-title">Loading Averno</span><span aria-hidden="true">↗</span></div><div class="intro-progress" aria-hidden="true"><span></span></div><p id="intro-loading-status" role="status">Preparing the page…</p></div><p class="intro-description" id="intro-description">Explore crypto transaction reconciliation, bookkeeping and accountant-ready reporting.</p><div class="intro-facts"><span>Reconcile your transactions</span><span>Organize the missing pieces</span><span>Prepare for your accountant</span></div><p class="intro-note">Online inquiries are currently unavailable. Service availability and local professional qualifications require confirmation.</p><div class="intro-actions"><button type="button" class="button intro-continue">Continue to Averno ↗</button><button type="button" class="text-button intro-skip">Skip introduction</button></div></div>';
    var background = Array.prototype.slice.call(document.body.children);
    var saved = background.map(function (node) { return { node: node, aria: node.getAttribute('aria-hidden'), inert: node.inert }; });
    document.body.appendChild(intro);
    saved.forEach(function (item) { item.node.setAttribute('aria-hidden', 'true'); item.node.inert = true; });
    var oldOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    var firstButton = intro.querySelector('.intro-close');
    function dismissIntro() {
      if (!intro.parentNode) return;
      intro.remove(); document.body.style.overflow = oldOverflow;
      saved.forEach(function (item) { if (item.aria === null) item.node.removeAttribute('aria-hidden'); else item.node.setAttribute('aria-hidden', item.aria); item.node.inert = item.inert; });
      if (previousFocus && previousFocus !== document.body) previousFocus.focus(); else document.querySelector('.header .brand').focus();
    }
    Array.prototype.forEach.call(intro.querySelectorAll('button'), function (button) { button.addEventListener('click', dismissIntro); });
    intro.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { event.preventDefault(); dismissIntro(); }
      if (event.key === 'Tab') {
        var buttons = intro.querySelectorAll('button'); var last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === firstButton) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); firstButton.focus(); }
      }
    });
    firstButton.focus();
    function pageReady() {
      if (!intro.parentNode) return;
      intro.classList.add('intro-ready');
      intro.querySelector('#intro-loading-title').textContent = 'Ready to explore';
      intro.querySelector('#intro-loading-status').textContent = 'Services, country information and reporting options are ready.';
      intro.querySelector('#intro-description').textContent = 'Bring scattered crypto records into one coherent picture. Explore reconciliation, bookkeeping and accountant-ready reporting.';
    }
    if (document.readyState === 'complete') pageReady(); else window.addEventListener('load', pageReady, { once: true });
  }

}());
