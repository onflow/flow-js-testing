transaction{
  prepare(signer: auth(BorrowValue, Capabilities) &Account){
    log("Signer Address:".concat(signer.address.toString()))
  }
}
