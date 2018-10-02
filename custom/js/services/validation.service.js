class ValidationService{

  static checkDate(from, to){
    let valid = true;
    let msgErr = '';
    if(!ValidationService.checkNotEmpty(from)){
      valid = false;
      msgErr += 'Ngày bắt đầu không được để trống\n'
    }
    if(!ValidationService.checkNotEmpty(to)){
      valid = false;
      msgErr += 'Ngày kết thúc không được để trống\n'
    }
    return { valid, msgErr };
  }

  static checkTimeStartVsTimeEnd(from, to){
    let start = new Date(from).getTime();
    let end = new Date(to).getTime();
    if(start >= end) return false;
    return true;
  }

  static checkNotEmpty(value){
    if(value == null || value == undefined) return false;
    if(value.trim() == '') return false;
    return true;
  }

  static checkBeNumber(val){
    if(val == '') return false;
    if(isNaN(val)) return false;
    return true;
  }
  
  static checkPositiveNumber(val){
    if(!ValidationService.checkBeNumber(val)) return false;
    if(Number(val) < 0) return false;
    return true;
  }

  //hh:mm
  static checkFormatTimeStr(timeStr){
    let pattern = /^[0-9]{1,2}:[0-9]{1,2}$/;
    if(!pattern.test(timeStr)) return false;
    let arr = timeStr.split(':');
    let hour = Number(arr[0]);
    let min = Number(arr[1]);
    if(hour > 23) return false;
    if(min > 59) return false;
    return true;
  }
}