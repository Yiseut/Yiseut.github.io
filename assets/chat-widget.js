(function(){
  const contact = document.getElementById('contact');
  const fab = document.getElementById('chatFab');
  const panel = document.getElementById('chatPanel');
  const body = document.getElementById('chatBody');
  const chips = document.getElementById('chatChips');
  const form = document.getElementById('chatForm');
  const text = document.getElementById('chatText');
  const closeBtn = document.getElementById('chatClose');
  if (!contact || !fab || !panel || !body || !chips || !form || !text || !closeBtn) return;

  const AESTRAT_CHAT = { endpoint: '/api/chat' };
  const CANNED = [
    { q:'Who is AESTRAT?',
      a:'AESTRAT Consulting (研美咨询) is a boutique strategic advisory — the bridge between global medical-aesthetics brands and China. From insight to impact.' },
    { q:'What do you do?',
      a:'We work both ways across the bridge, for two kinds of client:\n· International — China market entry for manufacturers, sourcing support for buyers of Chinese products\n· Domestic — cross-border partnerships and full product-lifecycle consulting' },
    { q:'How can I reach you?',
      a:'By email at contact@aestrat.co, on LinkedIn, or on WeChat (ID: YanMeiChat — or scan the QR in the footer).' },
    { q:'I’d like to introduce myself',
      a:'Wonderful — tell me your name, your company, and what you’re looking for, and I’ll make sure it reaches the right person.' },
  ];
  const FALLBACK = 'Thanks. The assistant is momentarily unavailable. Meanwhile, reach us at contact@aestrat.co or via WeChat (QR in the footer).';
  let started = false;
  let history = [];

  function setVisible(value) {
    document.body.classList.toggle('contact-chat-visible', value);
    if (!value) close();
  }

  if ('IntersectionObserver' in window) {
    const contactObserver = new IntersectionObserver((entries) => {
      setVisible(entries.some((entry) => entry.isIntersecting));
    }, { threshold: 0.08 });
    contactObserver.observe(contact);
  } else {
    setVisible(true);
  }

  function add(role, msg) {
    const item = document.createElement('div');
    item.className = 'chat-msg ' + role;
    if (msg != null) item.textContent = msg;
    body.appendChild(item);
    body.scrollTop = body.scrollHeight;
    return item;
  }

  async function reply(userMsg, canned) {
    history.push({ role:'user', content:userMsg });
    const item = add('bot', '...');
    let acc = '';
    try {
      const res = await fetch(AESTRAT_CHAT.endpoint, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({ message:userMsg, history:history.slice(0, -1) }),
      });
      if (!res.ok || !res.body) throw new Error('chat_unavailable');
      item.textContent = '';
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream:true });
        item.textContent = acc;
        body.scrollTop = body.scrollHeight;
      }
      if (!acc.trim()) throw new Error('empty_response');
    } catch (error) {
      acc = canned || FALLBACK;
      item.textContent = acc;
    }
    history.push({ role:'assistant', content:acc });
  }

  function start() {
    if (started) return;
    started = true;
    add('bot', 'Hi, I’m AESTRAT’s assistant. Ask me who we are, what we do, or how to connect — in any language. 你好，可以用任何语言和我聊。');
    CANNED.forEach((item) => {
      const button = document.createElement('button');
      button.className = 'chat-chip';
      button.type = 'button';
      button.textContent = item.q;
      button.onclick = () => {
        add('me', item.q);
        reply(item.q, item.a);
      };
      chips.appendChild(button);
    });
  }

  function open() {
    panel.classList.add('open');
    fab.classList.add('open');
    start();
    setTimeout(() => text.focus(), 300);
  }

  function close() {
    panel.classList.remove('open');
    fab.classList.remove('open');
  }

  fab.onclick = () => panel.classList.contains('open') ? close() : open();
  closeBtn.onclick = close;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = text.value.trim();
    if (!value) return;
    add('me', value);
    text.value = '';
    reply(value);
  });
})();
