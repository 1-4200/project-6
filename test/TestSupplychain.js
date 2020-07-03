// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
let SupplyChain = artifacts.require('SupplyChain')
let FarmerRole = artifacts.require("FarmerRole");
let DistributorRole = artifacts.require("DistributorRole");
let RetailerRole = artifacts.require("RetailerRole");
let ConsumerRole = artifacts.require("ConsumerRole");
let web3 = require('web3')

contract('SupplyChain', function (accounts) {
    let supplyChain;
    let farmerRole;
    let distributorRole;
    let retailerRole;
    let consumerRole;
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    let sku = 1
    let upc = 1
    const [ownerID, originFarmerID, distributorID, retailerID, consumerID] = accounts
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    let productID = sku + upc
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.utils.toWei("1", "ether")
    let itemState = 0
    const emptyAddress = '0x00000000000000000000000000000000000000'

    // State
    const StateHarvested = 0;
    const StateProcessed = 1;
    const StatePacked = 2;
    const StateForSale = 3;
    const StateSold = 4;
    const StateShipped = 5;
    const StateReceived = 6;
    const StatePurchased = 7;

    ///Available Accounts
    ///==================
    ///(0) 0x27d8d15cbc94527cadf5ec14b69519ae23288b95
    ///(1) 0x018c2dabef4904ecbd7118350a0c54dbeae3549a
    ///(2) 0xce5144391b4ab80668965f2cc4f2cc102380ef0a
    ///(3) 0x460c31107dd048e34971e57da2f99f659add4f02
    ///(4) 0xd37b7b8c62be2fdde8daa9816483aebdbd356088
    ///(5) 0x27f184bdc0e7a931b507ddd689d76dba10514bcb
    ///(6) 0xfe0df793060c49edca5ac9c104dd8e3375349978
    ///(7) 0xbd58a85c96cc6727859d853086fe8560bc137632
    ///(8) 0xe07b5ee5f738b2f87f88b99aac9c64ff1e0c7917
    ///(9) 0xbd3ff2e3aded055244d66544c9c059fa0851da44

    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    before(async () => {
        supplyChain = await SupplyChain.deployed()
        farmerRole = await FarmerRole.deployed()
        distributorRole = await DistributorRole.deployed()
        retailerRole = await RetailerRole.deployed()
        consumerRole = await ConsumerRole.deployed()
    })

    it("Testing set role functions", async () => {

        let eventFarmerAddedEmitted = false,
            eventDistributorAddedEmitted = false,
            eventRetailerAddedEmitted = false,
            eventConsumerAddedEmitted = false;

        // farmer
        await farmerRole.addFarmer(originFarmerID, {from: ownerID})
        await farmerRole.contract.events.FarmerAdded((error, event) => {
            eventFarmerAddedEmitted = true
        })

        // distributor
        await distributorRole.addDistributor(distributorID, {from: ownerID})
        await distributorRole.contract.events.DistributorAdded((error, event) => {
            eventDistributorAddedEmitted = true
        })

        // retailer
        await retailerRole.addRetailer(retailerID, {from: ownerID})
        await retailerRole.contract.events.RetailerAdded((error, event) => {
            eventRetailerAddedEmitted = true
        })

        // consumer
        await consumerRole.addConsumer(consumerID, {from: ownerID})
        await consumerRole.contract.events.ConsumerAdded((error, event) => {
            eventConsumerAddedEmitted = true
        })

        assert.equal(eventFarmerAddedEmitted, true, 'Invalid add farmer event emitted')
        assert.equal(eventDistributorAddedEmitted, true, 'Invalid add distributor event emitted')
        assert.equal(eventRetailerAddedEmitted, true, 'Invalid add retailer event emitted')
        assert.equal(eventConsumerAddedEmitted, true, 'Invalid add consumer event emitted')
    })

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async () => {

        // Declare and Initialize a variable for event
        let eventEmitted = false

        // Watch the emitted event Harvested()
        await supplyChain.contract.events.Harvested((error, event) => {
            eventEmitted = true
        })
        // Mark an item as Harvested by calling function harvestItem()
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes)

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], ownerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], StateHarvested, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async () => {
        // Declare and Initialize a variable for event
        let eventEmitted = false;

        // Watch the emitted event Processed()
        await supplyChain.contract.events.Processed((error, event) => {
            eventEmitted = true
        })

        // Mark an item as Processed by calling function processItem()
        await supplyChain.processItem(upc)

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], ownerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], StateProcessed, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async () => {
        // Declare and Initialize a variable for event
        let eventEmitted = false

        // Watch the emitted event Packed()
        await supplyChain.contract.events.Packed((error, event) => {
            eventEmitted = true
        })

        // Mark an item as Packed by calling function packItem()
        await supplyChain.packItem(upc)

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], ownerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], StatePacked, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async () => {
        // Declare and Initialize a variable for event
        let eventEmitted = false

        // Watch the emitted event ForSale()
        await supplyChain.contract.events.ForSale((error, event) => {
            eventEmitted = true
        })

        // Mark an item as ForSale by calling function sellItem()
        await supplyChain.sellItem(upc, productPrice)

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], ownerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Missing or Invalid productPrice')
        assert.equal(resultBufferTwo[5], StateForSale, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async () => {
        // Declare and Initialize a variable for event
        let eventEmitted = false

        // Watch the emitted event Sold()
        await supplyChain.contract.events.Sold((error, event) => {
            eventEmitted = true
        })

        // Mark an item as Sold by calling function buyItem()
        await supplyChain.buyItem(upc, {value: productPrice})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], ownerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Missing or Invalid productPrice')
        assert.equal(resultBufferTwo[5], StateSold, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[6], ownerID, 'Error: Missing or Invalid distributorID')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async () => {
        // Declare and Initialize a variable for event
        let eventEmitted = false

        // Watch the emitted event Shipped()
        await supplyChain.contract.events.Shipped((error, event) => {
            eventEmitted = true
        })

        // Mark an item as Sold by calling function shipItem()
        await supplyChain.shipItem(upc)

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], ownerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Missing or Invalid productPrice')
        assert.equal(resultBufferTwo[5], StateShipped, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[6], ownerID, 'Error: Missing or Invalid distributorID')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async () => {
        // Declare and Initialize a variable for event
        let eventEmitted = false

        // Watch the emitted event Received()
        await supplyChain.contract.events.Received((error, event) => {
            eventEmitted = true
        })

        // Mark an item as Sold by calling function receiveItem()
        await supplyChain.receiveItem(upc)

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], ownerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Missing or Invalid productPrice')
        assert.equal(resultBufferTwo[5], StateReceived, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[6], ownerID, 'Error: Missing or Invalid distributorID')
        assert.equal(resultBufferTwo[7], ownerID, 'Error: Missing or Invalid retailerID')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async () => {
        // Declare and Initialize a variable for event
        let eventEmitted = false

        // Watch the emitted event Purchased()
        await supplyChain.contract.events.Purchased((error, event) => {
            eventEmitted = true
        })

        // Mark an item as Sold by calling function purchaseItem()
        await supplyChain.purchaseItem(upc)

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], ownerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Missing or Invalid productPrice')
        assert.equal(resultBufferTwo[5], StatePurchased, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[6], ownerID, 'Error: Missing or Invalid distributorID')
        assert.equal(resultBufferTwo[7], ownerID, 'Error: Missing or Invalid retailerID')
        assert.equal(resultBufferTwo[8], ownerID, 'Error: Missing or Invalid consumerID')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async () => {
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], ownerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
    })

    // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async () => {
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferTwo[2], productID, 'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[3], productNotes, 'Error: Missing or Invalid productNotes')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Missing or Invalid productPrice')
        assert.equal(resultBufferTwo[5], StatePurchased, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[6], ownerID, 'Error: Missing or Invalid distributorID')
        assert.equal(resultBufferTwo[7], ownerID, 'Error: Missing or Invalid retailerID')
        assert.equal(resultBufferTwo[8], ownerID, 'Error: Missing or Invalid consumerID')
    })

});

