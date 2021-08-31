import FlowManager from 0x01

pub fun main(): UInt64 {
    let mockedHeight = FlowManager.getBlockHeight();
    let realHeight = getCurrentBlock().height;
    log("Mocked Height: ".concat(mockedHeight.toString()))
    log("Real Height: ".concat(realHeight.toString()))

    return mockedHeight - realHeight;
}
