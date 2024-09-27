transaction(message: String){
  prepare(first: &Account, second: &Account){
      log(message)
      log(first.address)
      log(second.address)
  }
}
