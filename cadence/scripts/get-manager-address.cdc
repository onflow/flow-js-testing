access(all) fun main(serviceAddress: Address): Address? {
    let account = getAccount(serviceAddress)

    let ref = account.capabilities.borrow<&[Address]>(/public/flowManagerAddress)!

    return ref[0]
}
