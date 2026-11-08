/* a carteirinha do clube (depois do cadastro):
   · em cima, a faixa com o nome ● umbigo da pessoa passando
   · o cartão 3D (componente da Dra Lê) com as fotos da pessoa; enquanto ela não manda as 8 fotos, roda com fotos da comunidade
   · as fotos que no componente entram de cabeça para baixo (a 3ª e a 4ª: variantes 5-6 e 7-8) são giradas aqui também */
(function () {
  var SB = 'https://gqeipjiidtrcbmnrnknc.supabase.co', PUB = 'sb_publishable_5PMV1M5XkgU6xzdnwCcWgQ_xy-9fLLV', BUCKET = 'meu-umbig-ooo', SCHEMA = 'meu_umbig_ooo';
  // as 5 fotos, na ordem em que o cartão passa por elas: 1-2, 3-4, 5-6 (de cabeça para baixo), 7-8 (de cabeça para baixo), 9-10; o 11 é o 1 de novo
  var LUGARES = ['0tfyyn5MP8bPWxhdTAOayckjMAI', 'mJxic17qLC0g2nnjjqW2SSwDRMc', 'DUfNplnJts3ya9RS3YOzv7bcA', 'Ag8Z1l9fQhS4MVTXsKdageWNOi4', 'bapzhbYsXGkEO9rnhzFznWkAW54'];
  var DE_PONTA_CABECA = { DUfNplnJts3ya9RS3YOzv7bcA: 1, Ag8Z1l9fQhS4MVTXsKdageWNOi4: 1 };
  var TESTE = [1, 2, 3, 4, 5].map(function (k) { return '/teste/sq-' + k + '.jpg' });
  var s = null; try { s = JSON.parse(localStorage.getItem('sb-gqeipjiidtrcbmnrnknc-auth-token') || 'null') } catch (e) {}
  if (s && s.currentSession) s = s.currentSession;
  var u = s && s.user, meta = (u && u.user_metadata) || {};
  var nome = (meta.nome || 'squircles').trim(), umbigo = (meta.usuario || 'umbigo').trim();
  // a faixa
  var tr = document.querySelector('#faixa .trilho'), um = '';
  for (var i = 0; i < 8; i++) um += '<span>' + nome + '</span><span>●</span><span>' + umbigo + '</span><span>●</span>';
  tr.innerHTML = um + um;
  // troca as fotos do componente pelas escolhidas (e continua trocando quando o componente muda de variante)
  var fotos = TESTE;
  function troca() {
    [].forEach.call(document.querySelectorAll('img[src*="framerusercontent.com/images/"], img[data-sq]'), function (im) {
      // o id vem da foto que o componente acabou de colocar (quando ele troca de variante); senão, do que já trocamos
      var doFramer = (im.getAttribute('src') || '').match(/framerusercontent\.com\/images\/([A-Za-z0-9]+)/);
      var id = doFramer ? doFramer[1] : im.getAttribute('data-sq');
      var k = LUGARES.indexOf(id); if (k < 0) return;
      var nova = fotos[k % fotos.length];
      if (im.getAttribute('data-sq') !== id || im.getAttribute('src') !== nova) {
        im.setAttribute('data-sq', id); im.removeAttribute('srcset'); im.setAttribute('src', nova);
        im.style.transform = DE_PONTA_CABECA[id] ? 'rotate(180deg)' : '';
      }
    });
  }
  // só começa a trocar depois que o componente acordou (trocar antes quebra a animação do Framer)
  function comeca() { troca(); document.documentElement.classList.add('fotos-prontas'); new MutationObserver(troca).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] }) }
  if (document.readyState === 'complete') setTimeout(comeca, 1200); else addEventListener('load', function () { setTimeout(comeca, 1200) });
  function comAuth(o) { o = o || {}; o.headers = Object.assign({ apikey: PUB, Authorization: 'Bearer ' + (s ? s.access_token : PUB) }, o.headers || {}); return o }
  // as fotos da pessoa (5); se ainda não mandou, as carinhas da comunidade; se não tem ninguém, as de teste
  function carrega() {
    var minhas = u ? fetch(SB + '/storage/v1/object/list/' + BUCKET, comAuth({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prefix: u.id + '/fotos/', limit: 20, sortBy: { column: 'name', order: 'asc' } }) }))
      .then(function (r) { return r.ok ? r.json() : [] }).catch(function () { return [] }) : Promise.resolve([]);
    minhas.then(function (l) {
      l = (l || []).filter(function (x) { return x && x.name && /\.(jpe?g|png|webp|heic)$/i.test(x.name) });
      if (l.length) { fotos = l.map(function (x) { return SB + '/storage/v1/object/public/' + BUCKET + '/' + u.id + '/fotos/' + x.name }); troca(); document.getElementById('mandar').hidden = l.length >= 5; return }
      if (u) document.getElementById('mandar').hidden = false;
      fetch(SB + '/rest/v1/rostos?select=url&order=criado.desc&limit=20', comAuth({ headers: { 'Accept-Profile': SCHEMA } })).then(function (r) { return r.ok ? r.json() : [] }).then(function (d) { if (d && d.length) { fotos = d.map(function (x) { return x.url }); troca() } }).catch(function () {});
    });
  }
  carrega();
  // mandar as 5 fotos
  var inp = document.getElementById('fotos');
  document.getElementById('mandar').onclick = function () { inp.click() };
  inp.onchange = function () {
    var fs = [].slice.call(inp.files || []).slice(0, 5); if (!fs.length || !u) return;
    var b = document.getElementById('mandar'); b.textContent = 'MANDANDO…';
    Promise.all(fs.map(function (f, k) {
      return fetch(SB + '/storage/v1/object/' + BUCKET + '/' + u.id + '/fotos/' + (k + 1) + '.jpg', comAuth({ method: 'POST', headers: { 'Content-Type': f.type || 'image/jpeg', 'x-upsert': 'true' }, body: f }));
    })).then(function () { b.textContent = 'MANDAR 5 FOTOS'; carrega() });
    inp.value = '';
  };
})();
