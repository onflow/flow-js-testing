transaction(message: String){
  prepare(first: AuthAccount, second: AuthAccount){
      log(message)
      log(first.address)
      log(second.address)
  }
}