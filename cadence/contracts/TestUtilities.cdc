pub contract TestUtilities{

    pub struct MockBlock {
        pub let id: [UInt8; 32]
        pub let height: UInt64
        pub let view: UInt64
        pub let timestamp: UFix64

        init(_ id: [UInt8; 32], _ height: UInt64, _ view: UInt64, _ timestamp: UFix64){
            self.id = id
            self.height = height
            self.view = view
            self.timestamp = timestamp
        }
    }

    pub var blockOffset: UInt64;

    pub fun setBlockOffset(_ offset: UInt64){
        self.blockOffset = offset
    }

    pub fun getBlockHeight(): UInt64 {
        var block =  getCurrentBlock()
        return block.height + self.blockOffset
    }

    pub fun getBlock(): MockBlock {
        var block =  getCurrentBlock()
        let mockBlock = MockBlock(block.id, block.height, block.view, block.timestamp);
        return mockBlock
    }

    init(){
        self.blockOffset = 0;
    }
}