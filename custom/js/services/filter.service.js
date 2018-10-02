class FilterService{

  static filterByUserName(arr, filterVal){
    if(!ValidationService.checkNotEmpty(filterVal)) return arr;
    return arr.filter(user => {
      let {sLastName, sFirstName} = user;
      sFirstName = VNAccents.removeAccents(sFirstName).toLowerCase();
      sLastName = VNAccents.removeAccents(sLastName).toLowerCase();
      // console.log(sFirstName, sLastName);
      let fullname = sFirstName.trim() + ' ' + sLastName.trim();
      // console.log(fullname);
      // console.log(fullname);
      filterVal = CommonService.removeUnicode(filterVal).toLowerCase();
      // console.log(user.fullname);
      return fullname.indexOf(filterVal) > -1;
    })
  }
  
  static filterByUserID(arr, filterVal){
    if(!ValidationService.checkNotEmpty(filterVal)) return arr;
    return arr.filter(user => {
      let { sIdNumber } = user;
      sIdNumber = (sIdNumber+'').toLowerCase();
      filterVal = CommonService.removeUnicode(filterVal).toLowerCase();
      return sIdNumber.indexOf(filterVal) > -1;
    })
  }
  
  static filterByUserDepID(arr, depID){
    if(depID == 0) return arr;
    return arr.filter(user => {
      let { iDepartmentID } = user;
      return depID == iDepartmentID;
    })
  }

  static filterByUserSuperDepID(arr, superDepID){
    if(superDepID == 0) return arr;
    return arr.filter(user => {
      let { iSuperDepartmentID } = user;
      return superDepID == iSuperDepartmentID;
    })
  }

}