import Profile from 0xProfile

transaction(message: String){
  prepare(first: AuthAccount, second: AuthAccount){
      log(message)
      log(first.address)
      log(second.address)
  }
}