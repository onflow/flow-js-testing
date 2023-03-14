import FlowManager from 0x01

pub fun main(): UFix64 {
    let mockedTimestamp = FlowManager.getBlockTimestamp();
    let realTimestamp = getCurrentBlock().timestamp;
    log("Mocked Height: ".concat(mockedTimestamp.toString()))
    log("Real Height: ".concat(realTimestamp.toString()))

    return mockedTimestamp - realTimestamp;
}
