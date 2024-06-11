import ACCESS_ENUM from "@/access/accessEnum";

/**
 * 检查权限
 * @param loginUser
 * @param needAccess
 */
const checkAccess = (loginUser: any, needAccess = ACCESS_ENUM.NOT_LOGIN) => {
  const loginUserAccess =loginUser?.userRole ?? ACCESS_ENUM.NOT_LOGIN;
  if(needAccess === ACCESS_ENUM.NOT_LOGIN) {
    return true;
  }
  if(needAccess === ACCESS_ENUM.USER){
    if(loginUserAccess === ACCESS_ENUM.NOT_LOGIN){
      return false;
    }
  }
  if(needAccess === ACCESS_ENUM.ADMIN){
    if(loginUserAccess !== ACCESS_ENUM.ADMIN){
      return false;
    }
  }
  return true;
}

export default checkAccess;