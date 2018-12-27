export default (sDay, eDay) => {
  sDay = new Date(Date.parse(sDay.replace(/-/g, "/")));
  eDay = new Date(Date.parse(eDay.replace(/-/g, "/")));

  // 总相差天数
  let diffDay = (eDay - sDay) / (1000 * 60 * 60 * 24);
  if(parseInt(diffDay) === 0) {
    return parseInt(diffDay);
  }
  // 周末天数
  let weekEnds = 0; 
  for(let i = 0; i < diffDay; i++) { 
    if(sDay.getDay() === 0 || sDay.getDay() === 6) {
      weekEnds ++; 
    }
    sDay = sDay.valueOf(); 
    sDay += 1000 * 60 * 60 * 24; 
    sDay = new Date(sDay); 
  } 
  eDay.setDate(eDay.getDate() - parseInt(diffDay + weekEnds)); 
  return eDay;
}
