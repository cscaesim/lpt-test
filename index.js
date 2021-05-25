// Caine Simpson
// CaineESimpson@gmail.com
// Time for setup: 30 minutes
// Time for JS (The parsing of the data and getting it ready to display) Section: 2 hours
// Time for Front End: 
// Total Time: 

var mysql = require('mysql')
var express = require('express')
var port = 8080


const app = express()

app.get('/', (req, res) => {
    res.send("Hello Work");
})

app.listen(port, () => {
    console.log(`Listening ${port}`)
})

console.log("We run")

// Hard coding these values just for quickness, if I was creating this as a full industry application theses values would come from environment variables.
var connection = mysql.createConnection({
    host: "127.0.0.1",
    user: 'root',
    password: 'toor',
    database: 'lpl'
})

// Try connecting
connection.connect(function (error) {
    if (error) {
        throw error;
    }

    console.log("Connection Successful")
});

connection.query('SELECT trace_id, trace_data FROM test', function(error, results, fields) {
    if (error) throw error;
    

    // let data = results[0].trace_data

    let graph_set = []

    // Loop through each set of BLOBS, to conver the values into a data set of signed ints
    results.forEach(element => {
        let data_set = create_data_set(element.trace_data)
        graph_set.push(data_set)
        // console.log(`DATASET VALUE: ${element.trace_id}`, data_set)
    });

    // console.log("Completed Graph set: ", graph_set)
    // let data_set_one = create_data_set(data)

    // console.log("datasettest", data_set_one)

    run_test(['ff','ff','33','01'])
    run_test(['c3', 'bf', '23', '2e'])
    // console.log('hextoInt?', parsInt(packet.join(''), 16))

    // console.log(set)

})

function create_data_set(data) {
    let count = 0;
    let packet = [];
    let packet_size = 4;
    let set = [];
    let step = 1;
    let trace_data_size = data.length;

    // A while loop to step through each value in the list, because the list is so large,
    // Using a while loop will get through each value in the "packet"
    while (count < trace_data_size) {

        // We use a check to partition each value into sets of 4 (or less), in order to convert to the numbers we need.
        if (step <= packet_size) {

            // console.log("pushing ", data[count])

            packet.push(data[count].toString(16))
            // console.log("step size", step)
            // packet = packet.join('')
            // console.log(packet.join(''))
            console.log(packet)
            // console.log("Packet Size", packet.length)
            step++
            // console.log("back to number", parseInt(packet, 32))
        } else {
            // console.log('packet', packet.join(''))
            
            let new_packet = convertToHex(packet)
            let complement = convertHexToSigned(new_packet)

            // console.log("new_int", complement)
            let reading = convertToReading(complement)
            // console.log("convert to reading", reading)
            set.push(reading)
            step = 1;
            packet = [];
        }
        // console.log("count", count)
        count++
        // console.log("set", set)
    }

    return set;
}


// MARK:- This is a quick function to test my convertions, had to quadruple check to make sure they worked :) 
function run_test(packet) {
    let hex = convertToHex(packet)
    console.log("hexTest", hex)

    let comp = convertHexToSigned(hex)
    console.log("signed text", comp)

    let reading = convertToReading(comp)
    console.log("reading test", reading)
}


// Going to need to get chunks of 4 at a time, convert to int, then get signed 32 bit
// MARK:- Functions to create our hex values, then convert them to our signed 32bit integer values. And one function to convert to our reading values.
function convertToHex(packet) {
    let hex = packet.join('')

    return hex
}

// Function to convert from the hex above to signed integers.
// I was going to use a fancy algorithm to do so, but reading over some code on others attempts, this might be enough (?)
function convertHexToSigned(hexString) {
    let value = parseInt(hexString, 16)
    // This should convert 2's complement but we shall see :)
    return -(~value + 1)
}

// Convert it to reading to use.
function convertToReading(value) {
    return (value / 1000)
}


