    /* ---- Nav scroll state ---- */
    const nav = document.getElementById('nav');
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

    /* ---- Mobile menu ---- */
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const mobileClose = document.getElementById('mobileClose');
    const openMenu = () => { mobileNav.classList.add('open'); hamburger.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; };
    const closeMenu = () => { mobileNav.classList.remove('open'); hamburger.setAttribute('aria-expanded','false'); document.body.style.overflow=''; };
    hamburger.addEventListener('click', openMenu);
    mobileClose.addEventListener('click', closeMenu);
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    /* ---- Testimonials carousel ---- */
    (function(){
      if (!document.getElementById('carousel')) return; // not on this page
      const cards = Array.from(document.querySelectorAll('#carousel .testi-card'));
      const dotsWrap = document.getElementById('cDots');
      let i = 0, timer;
      cards.forEach((_, idx) => {
        const b = document.createElement('button');
        b.setAttribute('aria-label', 'Go to testimonial ' + (idx+1));
        if (idx === 0) b.classList.add('active');
        b.addEventListener('click', () => { go(idx); reset(); });
        dotsWrap.appendChild(b);
      });
      const dots = Array.from(dotsWrap.children);
      function go(n){
        cards[i].classList.remove('active'); dots[i].classList.remove('active');
        i = (n + cards.length) % cards.length;
        cards[i].classList.add('active'); dots[i].classList.add('active');
      }
      function next(){ go(i+1); } function prev(){ go(i-1); }
      function start(){ timer = setInterval(next, 5000); }
      function reset(){ clearInterval(timer); start(); }
      document.getElementById('cNext').addEventListener('click', () => { next(); reset(); });
      document.getElementById('cPrev').addEventListener('click', () => { prev(); reset(); });
      const carousel = document.getElementById('carousel');
      carousel.addEventListener('mouseenter', () => clearInterval(timer));
      carousel.addEventListener('mouseleave', start);
      start();
    })();

    /* ---- FAQ accordion ---- */
    document.querySelectorAll('#faqList .faq-item').forEach(item => {
      const q = item.querySelector('.faq-q');
      const a = item.querySelector('.faq-a');
      q.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('#faqList .faq-item').forEach(o => { o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null; });
        if (!isOpen) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
      });
    });

    /* ---- Founder bio dropdown (mobile) ---- */
    document.querySelectorAll('.bio-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.founder-card');
        const open = card.classList.toggle('bio-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.textContent = open ? 'Hide Bio' : 'Read Bio';
      });
    });

    /* ---- Scroll reveal ---- */
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    /* ---- Fire mouse trail ---- */
    (function(){
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const fine = window.matchMedia('(pointer: fine)').matches;
      if (reduce || !fine) return;

      const canvas = document.getElementById('fireCanvas');
      const ctx = canvas.getContext('2d');
      let W, H, dpr;
      function resize(){
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = canvas.width = innerWidth * dpr; H = canvas.height = innerHeight * dpr;
        canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px';
        ctx.setTransform(dpr,0,0,dpr,0,0);
      }
      resize(); window.addEventListener('resize', resize);

      // target = real mouse, trail eases toward it for a short delay/follow feel
      let mx = innerWidth/2, my = innerHeight/2, tx = mx, ty = my, moving = false, lastMove = 0;
      window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; moving = true; lastMove = performance.now(); });

      const flame = ['255,243,196','232,184,75','201,168,76','123,29,29'];
      const parts = [];
      function spawn(x, y, speed){
        const n = 2 + Math.floor(speed*0.12);
        for (let k=0; k<n; k++){
          parts.push({
            x: x + (Math.random()-0.5)*10,
            y: y + (Math.random()-0.5)*10,
            vx: (Math.random()-0.5)*0.7,
            vy: -0.6 - Math.random()*1.1,
            life: 1, decay: 0.018 + Math.random()*0.022,
            size: 5 + Math.random()*6,
            c: flame[Math.floor(Math.random()*flame.length)]
          });
        }
      }

      function frame(){
        // ease the trail point toward the mouse -> "follows with a short delay"
        const px = tx, py = ty;
        tx += (mx - tx) * 0.18; ty += (my - ty) * 0.18;
        const dx = tx - px, dy = ty - py;
        const speed = Math.min(Math.hypot(dx, dy), 40);

        if (moving && performance.now() - lastMove < 120) spawn(tx, ty, speed + 2);
        else if (Math.random() < 0.4) spawn(tx, ty, 1); // gentle idle ember

        // fade canvas slightly for trailing glow
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(0,0,innerWidth,innerHeight);

        ctx.globalCompositeOperation = 'lighter';
        for (let i = parts.length-1; i>=0; i--){
          const p = parts[i];
          p.x += p.vx; p.y += p.vy; p.vy -= 0.01; p.life -= p.decay;
          if (p.life <= 0){ parts.splice(i,1); continue; }
          const r = p.size * p.life;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
          g.addColorStop(0, 'rgba('+p.c+','+(0.55*p.life)+')');
          g.addColorStop(1, 'rgba('+p.c+',0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI*2); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    })();
