
$(async () => {

  $('#jstree_demo_div').jstree();

  $('#jstree_demo_div').on("changed.jstree", function (e, data) {
    console.log(data.selected);
  });

  $selectSuperDep.change(e => {
    showDepList(e, null, true);
    filterUserData(false);
  });

  $btnUpdateUser.click(updateUser);

  $('#selectSuperDepUpdate').change((e) => {
    showDepList(e, 'selectDepUpdate');
  });

  $txtFilterUserName.on('input', () => {
    filterUserData(true);
  });

  $txtFilterUserID.on('input', () => {
    filterUserData(true);
  });

  $selectDep.change(() => {
    filterUserData(true);
  });

  $('#btnPrintUserList').click(printUserList);

  await SelectComponent.renderSuperDepartment(null, true);
  SelectComponent.renderSuperDepartment('selectSuperDepUpdate', false);
  SelectComponent.renderPosition();
  showDepListWhenLoad();
  
  showEmployeesListTable();
  console.log(CommonService.removeUnicode('Lê Văn Sơn').toLowerCase())

})

let arrSuperDep = [];

let arrDep = [];
let arrPos = [];
let arrUsers = [];
let arrFilteredUsers = [];

let currentUser = null;

let $txtFilterUserName = $('#txtFilterUserName');
let $txtFilterUserID = $('#txtFilterUserID');
let $selectSuperDep = $('#selectSuperDep');
let $selectDep = $('#selectDep');
let $tblInOutList = $('#tblInOutList');
let $modalInOutList = $('#modalInOutList');
let $btnUpdateUser = $('#btnUpdateUser');

function showDepList(e, className, all){
  let superDepID = e.target.value;
  if(superDepID == 0) return showDepListJustAll();
  let sentData = { iSuperDepartmentID: superDepID };
  SelectComponent.renderDepartment(sentData, className, all);
}

function showDepListJustAll(){
  $('.selectDep').html('');
  $('.selectDep').append(`<option value="0">Tất cả</option>`)
}

function showDepListWhenLoad(){
  let superDepID = $('#selectSuperDep').val();
  showDepListJustAll();
}

function showUpdateModalUser(user){
  currentUser = user;
  fillFormUser(user);
  $('#modalUpdateUser').modal('show');
}

function fillFormUser(user){
  let { sFirstName, sLastName, iSuperDepartmentID, iDepartmentID, iPositionID, sIdNumber } = user;
  $('#txtFirstNameUpdateUser').val(sFirstName);
  $('#txtLastNameUpdateUser').val(sLastName);
  $('#txtIDNumberUpdateUser').val(sIdNumber);
  $('#selectPosUpdate').val(iPositionID);
  $('#selectSuperDepUpdate').val(iSuperDepartmentID);
  $('#selectSuperDepUpdate').trigger('change');
  $('#selectDepUpdate').val(iDepartmentID);
}

function checkUserinput(sFirstName, sLastName, sIdNumber){
  let valid = true;
  let errMsg = '';
  if(!ValidationService.checkNotEmpty(sFirstName)){
    valid = false;
    errMsg += 'Họ không đuọc dể trống\n';
  }
  if(!ValidationService.checkNotEmpty(sLastName)){
    valid = false;
    errMsg += 'Tên không đuọc dể trống\n';
  }
  if(!ValidationService.checkNotEmpty(sIdNumber)){
    valid = false;
    errMsg += 'Mã nhân viên không đuọc dể trống\n';
  }
  return { valid, errMsg };
}

async function updateUser(){
  let { sLogicalCode } = currentUser;
  let sFirstName = $('#txtFirstNameUpdateUser').val();
  let sLastName = $('#txtLastNameUpdateUser').val();
  let sIdNumber = $('#txtIDNumberUpdateUser').val();
  let iPositionID = $('#selectPosUpdate').val();
  let iDepartmentID = $('#selectDepUpdate').val();
  let iSuperDepartmentID = $('#selectSuperDepUpdate').val();
  let { valid, errMsg } = checkUserinput(sFirstName, sLastName, sIdNumber);
  if(!valid) return AlertService.showAlertError('Dũ liệu không đúng', errMsg);
  let sentData = { sLogicalCode, sLastName, sFirstName, sIdNumber, iSuperDepartmentID, iDepartmentID, iPositionID };
  let res = await UserService.updateUser(sentData);
  AlertService.showAlertSuccess('Cập nhật thành công', '', 4000);
}

function filterUserData(filterByDepID){
  let name = $txtFilterUserName.val();
  let id = $txtFilterUserID.val();
  let depID = $selectDep.val();
  let superDepID = $selectSuperDep.val();
  let arr1;
  if(filterByDepID) {
    if(depID == 0 || !depID) arr1 = FilterService.filterByUserSuperDepID(arrUsers, superDepID);
    else arr1 = FilterService.filterByUserDepID(arrUsers, depID);
  }
  else 
    arr1 = FilterService.filterByUserSuperDepID(arrUsers, superDepID);
  let arr2 = FilterService.filterByUserID(arr1, id);
  arrFilteredUsers = FilterService.filterByUserName(arr2, name);
  showPagination(arrFilteredUsers);
}

async function showInOutModal(user){
  let { sLogicalCode } = user;
  let sentData = { sLogicalCode };
  let arrInOutList = await UserService.getUserInOut(sentData);
  if(!arrInOutList) return AlertService.showAlertError('Không có dữ liệu', '', 5000);
  renderTblInOutList(arrInOutList);
  $modalInOutList.modal('show');

}

function renderTblInOutList(data){
  $tblInOutList.html('');
  let $thead = $('<thead></thead>');
  let $tbody = $('<tbody></tbody>');
  $thead.html(
    `
    <tr>
      <th>STT</th>
      <th>Họ tên</th>
      <th>Thời gian ra vào</th>
      <th>SMI</th>
    </tr>
    `
  )
  if(data){
    data.forEach((item, index) => {
      let { DateTimeInOut, RefLecteur, SMI, sFirstName } = item;
      let fullname = sFirstName + ' ' + RefLecteur;
      $tbody.append(`
        <tr>
          <td>${index + 1}</td>
          <td>${fullname}</td>
          <td>${DateTimeInOut}</td>
          <td>${SMI}</td>
        </tr>
      `)
    })
  }
  $tblInOutList.append($thead).append($tbody);
}

async function showEmployeesListTable(){
  arrUsers = await UserService.getUsersData();
  if(!arrUsers) {
    AlertService.showAlertError('Không có dữ liệu', '', 4000);
    arrFilteredUsers = [];
  }
  else arrFilteredUsers = arrUsers.slice();
  showPagination(arrUsers);
}

function renderUsersTbl(data) {
  let $table = $(`<table class="table table-hover table-striped table-condensed text-center custom-table" id="tblUsers"></table>`)
  let $thead = $('<thead></thead>');
  let $tbody = $('<tbody></tbody>');
  $thead.html(
    `
    <tr>
      <th class="font-weight-bold">STT</th>
      <th class="font-weight-bold">Mã nhân viên</th>
      <th class="font-weight-bold">Họ và tên</th>
      <th class="font-weight-bold">Vụ</th>
      <th class="font-weight-bold">Phòng ban</th>
      <th class="font-weight-bold">Chức vụ</th>
      <th class="font-weight-bold"></th>
    </tr>
    `
  )
  if (data) {
    data.forEach((user, index) => {
      const { sLastName, sFirstName, sIdNumber, sPositionName, sDepartmentName, sSuperDepartmentName, sSubDepartmentName } = user;
      let fullname = sFirstName + ' ' + sLastName;
      $tbody.append(`
        <tr>
          <td>${index + 1}</td>
          <td>${sIdNumber}</td>
          <td>${fullname}</td>
          <td>${sSuperDepartmentName}</td>
          <td>${sDepartmentName}</td>
          <td>${sPositionName}</td>
          <td>
            <button class="btn btn-custom btn-view-inout border-radius-custom" style="margin: 5px 0; text-transform: none;background-color: #6785b2">Xem ra vào</button>
            <button class="btn btn-custom btn-update border-radius-custom" style="margin: 0; text-transform: none; background-color: #353e4c">Cập nhật</button>
          </td>
        </tr>
      `)
      $tbody.find('.btn.btn-update').last().click(() => {
        showUpdateModalUser(user);
      })
      $tbody.find('.btn.btn-view-inout').last().click(() => {
        showInOutModal(user);
      })
    })
  }

  $table.append($thead).append($tbody);
  return $table;
}

function showPagination(data){
  if(!data) return clearPagination();
  $('#pagingTotal').html(`<strong>Tổng số nhân viên:</strong> ${data.length}`)
  $('#pagingControl').pagination({
    dataSource: data,
    pageSize: 10,
    showGoInput: true,
    showGoButton: true,
    callback: function (data, pagination) {
      let $table = renderUsersTbl(data);
      $('#usersListArea.table-responsive').html($table);
    }
  })
}

function clearPagination(){
  $('#pagingTotal').html('');
  $('#pagingControl').html('');
  $('#usersListArea').html('');
}

function renderTblPrintUsersList(data){
  let $table = $(`#tblPrintUsers`);
  let $thead = $('<thead></thead>');
  let $tbody = $('<tbody></tbody>');
  $thead.html(
    `
    <tr>
      <th class="font-weight-bold">STT</th>
      <th class="font-weight-bold">Mã nhân viên</th>
      <th class="font-weight-bold">Họ và tên</th>
      <th class="font-weight-bold">Vụ</th>
      <th class="font-weight-bold">Phòng ban</th>
      <th class="font-weight-bold">Chức vụ</th>
    </tr>
    `
  )
  if (data) {
    data.forEach((user, index) => {
      const { sLastName, sFirstName, sIdNumber, sPositionName, sDepartmentName, sSuperDepartmentName, sSubDepartmentName } = user;
      let fullname = sFirstName + ' ' + sLastName;
      $tbody.append(`
        <tr>
          <td>${index + 1}</td>
          <td>${sIdNumber}</td>
          <td>${fullname}</td>
          <td>${sSuperDepartmentName}</td>
          <td>${sDepartmentName}</td>
          <td>${sPositionName}</td>
        </tr>
      `)
    })
  }

  $table.append($thead).append($tbody);
}

function printUserList(){
  renderTblPrintUsersList(arrFilteredUsers);
  let $table = $('#tblPrintUsers');
  let filename = "danh-sach-nhan-vien";
  Export2ExcelService.export2Excel($table, filename);
}
