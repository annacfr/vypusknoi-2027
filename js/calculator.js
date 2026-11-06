/* Чистые расчёты отдельно от представления. Неизвестные сборы не равны нулю. */
function calculateVenue(id, n, weekend = false, extras = 0) {
  if (!Number.isInteger(n) || n < 21 || n > 50 || !Number.isFinite(extras) || extras < 0) throw new RangeError('Некорректные параметры');
  let low, high, serviceScenario = null;
  if (id === 'teplitsa') low = high = Math.round(Math.max(weekend ? 150000 : 100000, n * 3500) * 1.05);
  else if (id === 'terrace') low = high = Math.round(Math.max(weekend ? 140000 : 120000, n * 4500) * 1.10);
  else if (id === 'prichal') { low = high = n * 4500; serviceScenario = [Math.round(low * 1.10) + extras]; }
  else if (id === 'radisson') low = high = n * 5000 + 40000;
  else if (id === 'petrov') { low = n * 3500; high = n * 5000; serviceScenario = [Math.round(low * 1.10) + extras, Math.round(high * 1.10) + extras]; }
  else throw new RangeError('Неизвестная площадка');
  return { low:low + extras, high:high + extras, serviceScenario };
}
if (typeof module !== 'undefined') module.exports = { calculateVenue };
