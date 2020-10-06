pub fun main() {
  let message = getAccount(0x01cf0e2f2f715450).getCapability(/public/testTest)!.borrow<&[String]>()!
  log(message[0])

  let singleMessage = getAccount(0x01cf0e2f2f715450).getCapability(/public/singleMessage)!.borrow<&String>()!
  log(singleMessage)
}