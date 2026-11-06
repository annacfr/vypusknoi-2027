const $ = s => document.querySelector(s);
const money = n => new Intl.NumberFormat('ru-RU', { maximumFractionDigits:2 }).format(n) + ' ₽';
const external = (url, label) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
const statusNames = {official:'Подтверждено официальным источником',catalog:'Указано в стороннем каталоге',unknown:'Требует уточнения у менеджера'};
const sourceLinks = v => `<a href="#sources-${v.id}">Источники и границы проверки ↓</a>`;
const range = (lo, hi) => lo === hi ? money(lo) : `${money(lo)} – ${money(hi)}`;

function renderTable(ids = []) {
  const rows = VENUES.filter(v => !ids.length || ids.includes(v.id)).map(v => {
    const r = calculateVenue(v.id,21);
    const cells = [`<a href="#${v.id}">${v.name} ↗</a>`,v.hall,v.capacityText,v.rate,v.minimum,v.service,`От ${range(r.low,r.high)} + неуточнённые расходы`, 'Требует уточнения у менеджера', `Условия 2027 не подтверждены. ${sourceLinks(v)}`];
    const labels = ['Ресторан','Подходящий зал','Вместимость','Банкет на гостя','Минимум: будни / выходные','Дополнительные сборы','Ориентир на 21 гостя, будни','Кондиционер','Статус проверки'];
    return `<tr>${cells.map((c,i)=>`<td data-label="${labels[i]}">${c}</td>`).join('')}</tr>`;
  }).join('');
  $('#comparison-table').innerHTML = `<table><caption>Опубликованные ориентиры, проверка 06.11.2026</caption><thead><tr>${['Ресторан','Зал','Вместимость','На гостя','Минимум: будни / выходные','Сборы','Итого: 21 гость, будни','Кондиционер','Проверка'].map(t=>`<th scope="col">${t}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
}

function renderVenues() {
  $('#restaurant-list').innerHTML = VENUES.map((v,i)=>`<article class="venue" id="${v.id}">
    <div class="venue-title"><span class="index">0${i+1}</span><div><p class="eyebrow">${v.category}</p><h3>${v.name}</h3><p class="address">Ростов-на-Дону · ${v.address}</p></div></div>
    <div class="venue-layout"><div><div class="gallery-placeholder tone-${i}"><span class="placeholder-number">0${i+1}</span><span class="placeholder-label">${v.hall}</span><span class="placeholder-note">Фотографии интерьера — у первоисточника<br>Обложка не изображает реальный зал</span></div><div class="gallery-links">${v.galleries.map(g=>external(g[1],g[0])).join('')}</div><p class="caption">Разрешение на перепубликацию не установлено. Ссылки открывают реальные фотографии; актуальность обстановки подтвердите на просмотре.</p></div>
    <div class="venue-copy"><p class="intro">${v.atmosphere}</p><dl class="specs"><div><dt>Закрытый зал</dt><dd>${v.hall}</dd></div><div><dt>Вместимость</dt><dd>${v.capacityText}</dd></div><div><dt>Кондиционер</dt><dd>Требует уточнения у менеджера</dd></div><div><dt>Стартовый тариф</dt><dd>${v.rate}</dd></div></dl><p class="status">${sourceLinks(v)} · Проверка 06.11.2026</p><h4>Что подтверждено</h4><p>${v.confirmed}</p><div class="official-link">${external(v.official,'Официальная страница')}</div></div></div>
    <div class="venue-details"><div><h4>Кухня и меню</h4><p>${v.kitchen}</p><p>${v.menuNote}</p>${v.dishes.length?`<ul class="dishes">${v.dishes.map(d=>`<li><b>${d[0]}</b><span>${d[1]} · ${d[2]}</span></li>`).join('')}</ul><p class="caption">Источник каждой позиции — официальные страницы меню, перечисленные ниже. Десерт и торт не включены автоматически.</p>`:''}<p>${external(v.menu,v.menuLabel)}</p><p class="caption">Точный состав банкетного меню необходимо согласовать с менеджером.</p></div><div><h4>Предварительный бюджет</h4><p class="formula">${v.formula}</p><p><b>Что входит:</b> ${v.included}</p><p><b>Отдельно:</b> выбранные пожелания, торт и иные услуги по согласованию; обязательные платежи, не раскрытые источником, не оценены.</p><h4>Подводные камни</h4><p>${v.unknown}</p><a href="#questions-${v.id}">Все 11 вопросов перед бронью →</a></div></div><p class="verdict"><span>ДЛЯ КАКОГО ФОРМАТА</span>${v.verdict}</p>
    </article>`).join('');
}

function renderSources() {
  $('#source-list').innerHTML = VENUES.map(v=>`<article id="sources-${v.id}" class="source-card"><h3>${v.name}</h3><ul>${v.sources.map(s=>`<li>${external(s[1],s[0])}<p>${s[2]} <small>Проверка: 06.11.2026.</small></p></li>`).join('')}</ul></article>`).join('');
  $('#question-list').innerHTML = VENUES.map(v=>`<details id="questions-${v.id}" class="question"><summary>${v.name}<span>11 условий <b>+</b></span></summary><ol>${CHECKS.map((q,i)=>{const s=v.checks[i]||['unknown',q[1]];return `<li><div><b>${q[0]}</b><span class="badge ${s[0]}">${statusNames[s[0]]}</span></div><p>${s[1]}</p>${s[0]!=='unknown'?sourceLinks(v):''}</li>`;}).join('')}</ol></details>`).join('');
}

function renderBudget() {
  const form = $('#budget-form');
  if (!form.checkValidity()) { $('#budget-summary').textContent='Введите целое число гостей от 21 до 50 и неотрицательные суммы в пределах полей.'; $('#budget-results').innerHTML=''; return; }
  const n = Number($('#guests').value), budget = Number($('#budget').value) * n;
  const extras = [...document.querySelectorAll('.extra')].reduce((s,e)=>s+Number(e.value),0);
  const weekend = $('#day').value === 'weekend';
  $('#budget-summary').innerHTML = `<div><small>ОБЩИЙ БЮДЖЕТ</small><strong>${money(budget)}</strong></div><p>${n} гостей · ${weekend?'выходной / праздник':'будний день'}<br>Из них дополнительные пожелания: ${money(extras)}</p>`;
  $('#budget-results').innerHTML = VENUES.map(v=>{
    const r = calculateVenue(v.id,n,weekend,extras);
    const delta = value => value > budget ? `Превышение: ${money(value-budget)}` : `Условный остаток: ${money(budget-value)}`;
    const extraNote = v.id==='petrov'?'Стоимость предварительная. Минимальный заказ, сервисный сбор и условия закрытия зала требуют подтверждения у ресторана.':v.id==='prichal'?'Минимальный заказ, закрытие, применимость сервиса и другие обязательные расходы не подтверждены.':v.id==='radisson'?'Только ресторанный сценарий. Не является расчётом конференц-залов; аренда, минимум и сервис требуют подтверждения.':'Модель включает каталожный минимум и сервис. Дополнительная аренда, состав заказа и применимость тарифов в 2027 требуют подтверждения.';
    return `<article class="result"><p class="eyebrow">${v.name}</p><h3>От ${range(r.low,r.high)}</h3><p>+ неподтверждённые расходы</p><p>${range(r.low/n,r.high/n)} / гость</p><div class="balance">${r.low===r.high?delta(r.low):`Нижняя оценка: ${delta(r.low)}<br>Верхняя оценка: ${delta(r.high)}`}</div>${n>v.capacity?`<p class="capacity-warning">Не подходит: ${n} гостей больше вместимости ${v.capacity}.</p>`:''}${v.id==='radisson'?'<p class="caption">Для отдельных залов банкетная вместимость не установлена. Ресторан до 50 — только по каталогу.</p>':''}${v.id==='teplitsa'&&n>=35?'<p class="caption">При предельной посадке место для танцев не подтверждено.</p>':''}${r.serviceScenario?`<details><summary>Если подтвердится сервис 10%</summary><p>${range(r.serviceScenario[0],r.serviceScenario.at(-1))} всего; ${range(r.serviceScenario[0]/n,r.serviceScenario.at(-1)/n)} / гость.</p><p>${delta(r.serviceScenario[0])}${r.serviceScenario.length>1?`; верхняя оценка: ${delta(r.serviceScenario[1])}`:''}</p><small>10% начислено только на ресторанную часть. Дополнительные пожелания добавлены после сервиса.</small></details>`:''}<p class="caption">${extraNote}</p><p class="caption">Формула: ${v.formula}. Затем + ${money(extras)} пожеланий.</p>${sourceLinks(v)}</article>`;
  }).join('');
}

renderTable(); renderVenues(); renderSources(); renderBudget();
$('#budget-form').addEventListener('input',renderBudget);
$('#budget-form').addEventListener('submit',e=>e.preventDefault());
$('#compare-picks').innerHTML=VENUES.map(v=>`<label><input type="checkbox" value="${v.id}"> ${v.name}</label>`).join('');
$('#compare-picks').addEventListener('change',e=>{
  const selected=[...document.querySelectorAll('#compare-picks input:checked')];
  if(selected.length>3){e.target.checked=false;$('#compare-message').textContent='Можно сравнить до трёх ресторанов.';return;}
  $('#compare-message').textContent=selected.length===1?'Выберите ещё одно место для сравнения.':selected.length?`Выбрано: ${selected.length}`:'';
  renderTable(selected.length>=2?selected.map(e=>e.value):[]);
});
$('#reset-compare').addEventListener('click',()=>{document.querySelectorAll('#compare-picks input').forEach(e=>e.checked=false);$('#compare-message').textContent='';renderTable();});
$('#share').addEventListener('click',async()=>{
  const url='https://annacfr.github.io/vypusknoi-2027/';
  try{await navigator.clipboard.writeText(url);$('#share-status').textContent='Ссылка скопирована.';}catch{$('#share-status').textContent=`Скопируйте ссылку: ${url}`;}
});
let openedDetails=[];
window.addEventListener('beforeprint',()=>{openedDetails=[...document.querySelectorAll('details')].filter(d=>!d.open);openedDetails.forEach(d=>d.open=true);});
window.addEventListener('afterprint',()=>openedDetails.forEach(d=>d.open=false));
$('#print').addEventListener('click',()=>window.print());
