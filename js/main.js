const $ = s => document.querySelector(s);
const money = n => new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(n)+' ₽';
const range = (lo,hi) => lo===hi?money(lo):`${money(lo)} – ${money(hi)}`;
const ids=['teplitsa','terrace','prichal','radisson','petrov'];
const capacity={teplitsa:35,terrace:50,prichal:55,radisson:50,petrov:50};
let photosAt=Object.fromEntries(ids.map(id=>[id,0])),activeGallery=null;
function updatePrices(){
 const inputs=[...document.querySelectorAll('.settings input')];
 if(inputs.some(e=>!e.checkValidity())){$('#input-message').textContent='Укажите от 21 до 50 гостей и неотрицательные суммы.';return;}
 const n=Number($('#guests').value),weekend=$('#day').value==='weekend';
 const extras=[...document.querySelectorAll('.extra')].reduce((s,e)=>s+Number(e.value),0);
 const budget=Number($('#budget').value)*n;
 const showBudget=$('.extra-settings').open;
 $('#input-message').textContent='';
 document.querySelectorAll('.guest-count').forEach(e=>e.textContent=n);
 ids.forEach(id=>{
  const r=calculateVenue(id,n,weekend,extras);
  $('#total-'+id).textContent='≈ '+range(r.low,r.high);
  $('#person-'+id).textContent=range(Math.round(r.low/n),Math.round(r.high/n))+' на человека';
  $('#pending-'+id).textContent=(id==='petrov'||id==='prichal')?'Закрытие зала и возможные сборы — сверх этой оценки.':'Другие обязательные доплаты пока не подтверждены.';
  if(extras)$('#pending-'+id).textContent+=` Дополнительные пожелания: ${money(extras)} уже учтены.`;
  const fit=$('#fit-'+id);fit.hidden=n<=capacity[id];fit.textContent=`В этот зал помещается до ${capacity[id]} гостей. Для ${n} человек нужен другой зал.`;
  const service=$('#service-'+id);
  if(service)service.textContent=`Если ресторан подтвердит обслуживание 10%: ${range(r.serviceScenario[0],r.serviceScenario.at(-1))} всего.`;
  const balance=$('#balance-'+id);
  const delta=t=>t>budget?`Сверх бюджета: ${money(t-budget)}`:`Остаётся: ${money(budget-t)}`;
  balance.hidden=!showBudget;
  balance.textContent=r.low===r.high?delta(r.low):`${delta(r.low)}; по верхней оценке — ${delta(r.high).toLowerCase()}`;
 });
}
function setPhoto(id,index){
 const list=GALLERIES[id];photosAt[id]=(index+list.length)%list.length;
 const p=list[photosAt[id]],img=$('#cover-'+id);
 img.src=p.file;img.alt=p.caption;
 $('#caption-'+id).textContent=p.caption;
 document.querySelectorAll(`[data-gallery="${id}"]`).forEach(b=>{const active=Number(b.dataset.index)===photosAt[id];b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 if(activeGallery===id){$('#large-photo').src=p.file;$('#large-photo').alt=p.caption;$('#large-caption').textContent=`${p.caption} · ${photosAt[id]+1} / ${list.length}`;$('#prev-photo').disabled=$('#next-photo').disabled=list.length===1;}
}
$('.settings').addEventListener('input',updatePrices);
$('.extra-settings').addEventListener('toggle',updatePrices);
$('.settings').addEventListener('change',updatePrices);
updatePrices();
// No-JS visitors still see all photographs and initial amounts.
// Tabs and main photo buttons use native keyboard button behavior.
let opener=null;
const dialog=$('#photo-dialog');
ids.forEach(id=>{
 document.querySelectorAll(`[data-gallery="${id}"]`).forEach(b=>b.addEventListener('click',()=>setPhoto(id,Number(b.dataset.index))));
 const open=$(`[data-open="${id}"]`);
 open.addEventListener('click',()=>{activeGallery=id;opener=open;setPhoto(id,photosAt[id]);dialog.showModal();});
});
$('#prev-photo').addEventListener('click',()=>setPhoto(activeGallery,photosAt[activeGallery]-1));
$('#next-photo').addEventListener('click',()=>setPhoto(activeGallery,photosAt[activeGallery]+1));
$('#close-photo').addEventListener('click',()=>dialog.close());
const movePhoto=e=>{if(!dialog.open)return;if(e.key==='ArrowLeft')setPhoto(activeGallery,photosAt[activeGallery]-1);if(e.key==='ArrowRight')setPhoto(activeGallery,photosAt[activeGallery]+1);};
window.addEventListener('keydown',movePhoto);
dialog.addEventListener('close',()=>{activeGallery=null;opener?.focus();});
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.alt='Не удалось загрузить фотографию. Откройте сайт ресторана по ссылке ниже.';img.classList.add('image-failed');}));
$('#share').addEventListener('click',async()=>{const url='https://annacfr.github.io/vypusknoi-2027/';try{await navigator.clipboard.writeText(url);$('#share-status').textContent='Ссылка скопирована.';}catch{$('#share-status').textContent=url;}});
let closed=[];
window.addEventListener('beforeprint',()=>{closed=[...document.querySelectorAll('.sources details,.sources,.menu-examples')].filter(d=>!d.open);closed.forEach(d=>d.open=true);});
window.addEventListener('afterprint',()=>closed.forEach(d=>d.open=false));
$('#print').addEventListener('click',()=>window.print());
