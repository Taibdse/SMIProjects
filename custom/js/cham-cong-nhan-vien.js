$(async () => {

  $('#jstree_demo_div').jstree();

  $('#jstree_demo_div').on("changed.jstree", function (e, data) {
    console.log(data.selected);
  });

  $btnViewAttendance.click(() => {
    currentReportType = $selectReportType.val();
    if(currentReportType == 1) return showAttendanceInOutTime();
    if(currentReportType == 2) return showAttendanceWorkMoreTime();
    if(currentReportType == 3) return showAttendanceLateSoon();
  });

  $btnPrintAttendance.click(printAttendanceData);
  $selectSuperDep.change(e => {
    showDepList(e);
    // filterUserData(false);
  });

  $selectDep.change(() => {
    // filterUserData(true);
  })

  SelectComponent.renderMonths();

  $txtLateMin.val('15');
  $txtYear.val(new Date().getFullYear());
  $selectMonth.val(new Date().getMonth() + 1);
  
  showDepListJustAll();
  SelectComponent.renderPosition();
  SelectComponent.renderSuperDepartment(null, true);
  showAttendanceInOutTime();

})

let $selectSuperDep = $('#selectSuperDep');
let $selectDep = $('#selectDep');
let $selectMonth = $('#selectMonth');
let $txtLateMin = $('#txtLateMin');
let $txtYear = $('#txtYear');
let $btnPrintAttendance = $('#btnPrintAttendance');
let $btnViewAttendance = $('#btnViewAttendance');
let $selectReportType = $('#selectReportType');

let arrOnSites = [];
let arrFilteredOnSites = [];
let currentReportType = 1;

function filterUserData(filterByDep){
  let depID = $selectDep.val();
  let superDepID = $selectSuperDep.val();
  if(!arrOnSites || arrOnSites.length == 0) return;
  if(filterByDep) arrFilteredOnSites = FilterService.filterByDep(depID);
  else arrFilteredOnSites = FilterService.filterBySuperDep(superDepID);
  showPagination(arrFilteredOnSites);
}

function showDepListJustAll(){
  $('.selectDep').html('');
  $('.selectDep').append(`<option value="0">Tất cả</option>`)
}

function showDepList(e, className){
  let superDepID = e.target.value;
  if(superDepID == 0) return showDepListJustAll();
  let sentData = {iSuperDepartmentID: superDepID};
  SelectComponent.renderDepartment(sentData, className);
}

function getClassNameHighLightCol(y, m, d){
  let weekend = TimeService.checkWeekendInMonth(y, m, d);
  let className = '';
  if(weekend) className = 'highlight-td-th';
  return className;
}

function getInOutArr(data){
  let arrTemp = [];
  let m = +$selectMonth.val();
  let y = +$txtYear.val();
  let l = TimeService.getNumOfDayInMonth(m, y);
  for(let i = 1; i <= l; i++){
    arrTemp.push({});
  }
  data.forEach(item => {
    let { dTimeIN, dTimeOUT, dDate } = item;
    arrTemp[Number(dDate) - 1] = { dTimeIN, dTimeOUT };
  });
  return arrTemp;
}

function getTimeOfTimeStr(timeStr){
  let arr = timeStr.split(':');
  let hour = Number(arr[0].trim());
  let min = Number(arr[1].trim());
  let time = getTimeStamp(hour, min);
  return time;
}

function getTimeStamp(hour, min){
  return hour*3600 + min*60;
}

function getTimeSpanString(timeStr1, timeStr2){
  let stamp1 = getTimeOfTimeStr(timeStr1);
  let stamp2 = getTimeOfTimeStr(timeStr2);
  let span = stamp1 - stamp2;
  if(span < 60) return null;
  return getTimeStringFromSeconds(span);
}

function getTimeStringFromSeconds(sec){
  let h, m;
  if(sec < 60*60) {
    h = 0;
    m = Math.floor(sec/60);
  }
  else if(sec >= 60*60) {
    h = Math.floor(sec/3600);
    m = Math.floor((sec%3600)/60);
  }
  return (h >= 10 ? h : `0${h}`) + ':' + (m >= 10 ? m : `0${m}`);
}

async function getDataAttendance(){
  let iMonth = $selectMonth.val();
  let iYear = $txtYear.val();
  let lateMin = $txtLateMin.val();
  
  if(!ValidationService.checkPositiveNumber(iYear)) return AlertService.showAlertError('Năm không hợp lệ', '', 5000);

  if(!ValidationService.checkPositiveNumber(lateMin)) return AlertService.showAlertError('Phút tính đi muộn không đúng', 'Vui lòng nhập lại', 5000);
  
  let sentData = { iMonth, iYear };
  let data = await UserService.getAttendance(sentData);
  console.log(data);
  return data;
}

function checkTimeInOutInput(start, end){
  let valid = true;
  let errMsg = '';
  if(!ValidationService.checkFormatTimeStr(start)){
    valid = false;
    errMsg += 'Thời gian làm bắt đầu không họp lệ\n';
  }
  if(!ValidationService.checkFormatTimeStr(end)){
    valid = false;
    errMsg += 'Thời gian làm kết thúc không họp lệ\n';
  }
  return { valid, errMsg };
}

// Tbl In Late Soon
async function showAttendanceLateSoon() {
  arrOnSites = await getDataAttendance();
  if(!arrOnSites) {
    AlertService.showAlertError('Không có dữ liệu', '', 4000);
    arrFilteredOnSites = [];
  }
  else arrFilteredOnSites = arrOnSites.slice();
  showPagination(arrOnSites, 3);
}

function renderTblAttendance(data) {
  let $table = $(`<table class="table custom-table"></table>`)
  let $thead = $('<thead></thead>');
  let $tbody = $('<tbody></tbody>');
  renderTheadAttendance($thead);
  if(data) renderTbodyAttendance(data, $tbody);

  $table.append($thead).append($tbody);
  return $table;
}

function renderTheadAttendance($thead){
  $thead.html(
    `
      <tr>
        <th class="trn">STT</th>
        <th class="trn">Họ Tên</th>
        <th>Ra vào</th>
      </tr>
    `
  )
  let m = +$selectMonth.val();
  let y = +$txtYear.val();
  let arrMonthHeaders = TimeService.getDayInMonth(m, y);
  arrMonthHeaders.forEach(item => {
    let className = getClassNameHighLightCol(y, m, item);
    $thead.find('tr').append(`<th class=${className}>${item}</th>`);
  })
}

function renderTbodyAttendance(data, $tbody){
  let m = +$selectMonth.val();
  let y = +$txtYear.val();
  data.forEach((item, index) => {
    let user = JSON.parse(item.TimeAttendanceAll);

    let { sLogicalCode, sFullname, Attendance } = user;
    let arrInOut = getInOutArr(Attendance);
    let lateMin = Math.floor($txtLateMin.val()) + '';
    let startStr = `08:${lateMin}`;
    let endStr = `17:00`;

    $tbody.append(`
      <tr>
        <td rowspan="2">${index + 1}</td>
        <td rowspan="2">${sFullname} <br> ${sLogicalCode}</td>
        <td>Đi trễ</td>
      </tr>
    `)

    arrInOut.forEach((item, index) => {
      let val = '';
      if(item.dTimeIN)  {
        val = getTimeSpanString(item.dTimeIN, startStr);
        if(!val) val = '';
      }
      let className = getClassNameHighLightCol(y, m, index + 1);
      $tbody.find('tr').last().append(`<td class="${className}">${val}</td>`)
    })

    $tbody.append(`
      <tr>
        <td>Về sớm</td>
      </tr>
    `)
    arrInOut.forEach((item, index) => {
      let val = '';
      if(item.dTimeOUT)  {
        val = getTimeSpanString(endStr, item.dTimeOUT);
        if(!val) val = '';
      }
      let className = getClassNameHighLightCol(y, m, index + 1);
      $tbody.find('tr').last().append(`<td class="${className}">${val}</td>`)
    })
  })
}

// Tbl In Out Time
async function showAttendanceInOutTime(){
  arrOnSites = await getDataAttendance();
  if(!arrOnSites) {
    AlertService.showAlertError('Không có dữ liệu', '', 4000);
    arrFilteredOnSites = [];
  }
  else arrFilteredOnSites = arrOnSites.slice();
  showPagination(arrOnSites, 1);
}

function renderTblAttendanceInOutTime(data) {
  let $table = $(`<table class="table custom-table"></table>`)
  let $thead = $('<thead></thead>');
  let $tbody = $('<tbody></tbody>');
  renderTheadAttendance($thead);
  if(data) renderTbodyAttendanceInOutTime(data, $tbody);

  $table.append($thead).append($tbody);
  return $table;
}

function renderTbodyAttendanceInOutTime(data, $tbody){
  let m = +$selectMonth.val();
  let y = +$txtYear.val();
  data.forEach((item, index) => {
    let user = JSON.parse(item.TimeAttendanceAll);

    let { sLogicalCode, sFullname, Attendance } = user;
    let arrInOut = getInOutArr(Attendance);

    $tbody.append(`
      <tr>
        <td rowspan="2">${index + 1}</td>
        <td rowspan="2">${sFullname} <br> ${sLogicalCode}</td>
        <td>Đi trễ</td>
      </tr>
    `)
    
    arrInOut.forEach((item, index) => {
      let { dTimeIN } = item;
      let val = dTimeIN ? dTimeIN : '';
      let className = getClassNameHighLightCol(y, m, index + 1);
      $tbody.find('tr').last().append(`<td class="${className}">${val}</td>`)
    })

    $tbody.append(`<tr><td>Về sớm</td></tr>`)
    arrInOut.forEach((item, index) => {
      let { dTimeOUT } = item;
      let val = dTimeOUT ? dTimeOUT : '';
      let className = getClassNameHighLightCol(y, m, index + 1);
      $tbody.find('tr').last().append(`<td class="${className}">${val}</td>`)
    })
  })
}


//Tbl Work more time
async function showAttendanceWorkMoreTime(){
  arrOnSites = await getDataAttendance();
  if(!arrOnSites) {
    AlertService.showAlertError('Không có dữ liệu', '', 4000);
    arrFilteredOnSites = [];
  }
  else arrFilteredOnSites = arrOnSites.slice();
  showPagination(arrOnSites, 2);
}

function renderTblAttendanceWorkMoreTime(data) {
  let $table = $(`<table class="table custom-table"></table>`)
  let $thead = $('<thead></thead>');
  let $tbody = $('<tbody></tbody>');
  renderTheadAttendance($thead);
  if(data) renderTbodyAttendanceWorkMoreTime(data, $tbody);

  $table.append($thead).append($tbody);
  return $table;
}

function renderTbodyAttendanceWorkMoreTime(data, $tbody){
  let m = +$selectMonth.val();
  let y = +$txtYear.val();
  data.forEach((item, index) => {
    let user = JSON.parse(item.TimeAttendanceAll);

    let { sLogicalCode, sFullname, Attendance } = user;
    let arrInOut = getInOutArr(Attendance);
    let endStr = `18:00`;

    $tbody.append(`
      <tr>
        <td>${index + 1}</td>
        <td>${sFullname} <br> ${sLogicalCode}</td>
        <td>Làm thêm giờ</td>
      </tr>
    `)

    arrInOut.forEach((item, index) => {
      let val = '';
      if(item.dTimeOUT)  {
        val = getTimeSpanString(item.dTimeOUT, endStr);
        if(!val) val = '';
      }
      let className = getClassNameHighLightCol(y, m, index + 1);
      $tbody.find('tr').last().append(`<td class="${className}">${val}</td>`)
    })
  })
}

//pagination
function clearPagination(){
  $('#pagingTotal').html('');
  $('#pagingControl').html('');
  $('#chamCongArea').html('');
}

function showPagination(data, type){
  if(!data) return clearPagination();
  $('#pagingTotal').html(`<strong>Tổng số nhân viên:</strong> ${data.length}`)
  $('#pagingControl').pagination({
    dataSource: data,
    pageSize: 10,
    showGoInput: true,
    showGoButton: true,
    callback: function (data, pagination) {
      let $table;
      console.log(123);
      if(type == 1) $table = renderTblAttendanceInOutTime(data);
      if(type == 2) $table = renderTblAttendanceWorkMoreTime(data);
      if(type == 3) $table = renderTblAttendance(data);
      $('#chamCongArea.table-responsive').html($table);
    }
  })
}

function printAttendanceData(){
  if(!arrFilteredOnSites || arrFilteredOnSites.length == 0) return AlertService.showAlertError('Không có dữ liệu để in', '', 5000);
  let $table, arrTemp = arrFilteredOnSites;
  if(currentReportType == 1) $table = renderTblAttendanceInOutTime(arrTemp)
  if(currentReportType == 3) $table = renderTblAttendance(arrTemp);
  let filename = "danh-sach-cham-cong";
  Export2ExcelService.export2Excel($table, filename);
}


