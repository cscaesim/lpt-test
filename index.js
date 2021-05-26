// Caine Simpson
// CaineESimpson@gmail.com
// Time for setup: 30 minutes
// Time for JS (The parsing of the data and getting it ready to display) Section: 2 hours
// Time for Front End: 
// Total Time: 

var mysql = require('mysql');
var bodyParser = require('body-parser');
var express = require('express');
var port = 8080;
var path = require('path');


const app = express()
// var data_set = []

app.use(express.static(path.join(__dirname, '/lpt')))
app.use(bodyParser.urlencoded({extended: true}))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    connect_database()
    var data_set = []
    get_data_set( function(err, results) {
        if (err) {
            return null
        } else {
        // let data = results[0].trace_data

        let data = results
    
        let graph_set = []
    
        // Loop through each set of BLOBS, to conver the values into a data set of signed ints
    
        results.forEach(element => {
            let data_set = create_data_set(element.trace_data)
            graph_set.push(data_set)
            // console.log(`DATASET VALUE: ${element.trace_id}`, data_set)
        });
    
        // console.log("Completed Graph set: ", graph_set)
        // let data_set_one = create_data_set(data);
        // let data_set_one = alternative_data_set(data);
        console.log("graph_set", graph_set)
    
        run_test(['ff','ff','33','01'])
        run_test(['c3', 'bf', '23', '2e'])
        // console.log('hextoInt?', parsInt(packet.join(''), 16))

        data_set = graph_set
        // console.log(set)
        
        }
    console.log('data set', data_set)
    res.render('./main.ejs', { data: data_set })
    // return data_set
    })
    console.log("GRAPH DATA", data_set)

   
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
function connect_database() {
    connection.connect(function (error) {
        if (error) {
            throw error;
        }
    
        console.log("Connection Successful")
    });
}

function get_data_set(callback) {
    
    connection.query('SELECT trace_id, trace_data FROM test', function(error, results) {
        if (error) {
            callback(error,null)
        } else {
            return callback(null, results)
        }
  
    })
}

function create_data_set(data) {
    let count = 0;
    let packet = [];
    let packet_size = 4;
    let set = [];
    let step = 0;
    let trace_data_size = data.length;

    // A while loop to step through each value in the list, because the list is so large,
    // Using a while loop will get through each value in the "packet"
    while (count < trace_data_size) {

        // We use a check to partition each value into sets of 4 (or less), in order to convert to the numbers we need.
        if (step < packet_size) {

            // console.log("pushing ", data[count])
            let hexValue = checkAndHandleSingleDigit(data[count].toString(16))
            // let hexValue = data[count].toString(16)
            // packet.push(data[count].toString(16))
            packet.push(hexValue)
            step++

            // console.log("back to number", parseInt(packet, 32))
        } else {
            // console.log('packet', packet)
            
            let new_packet = convertToHex(packet)
            let complement = convertHexToSigned(new_packet)

            // console.log("new_int", complement)
            let reading = convertToReading(complement)
            // console.log("convert to reading", reading)
            set.push(reading)
            step = 1;
            packet = [];
            packet.push(checkAndHandleSingleDigit(data[count].toString(16)));
        }
        // console.log("count", count)
        count++
        // console.log("set", set)
    }

    return set;
}


function alternative_data_set(data) {
    let step = 0;
    let packet_size = 4;
    let packet = [];
    let set = [];

    while (data.length !== 0) {
        if (step < packet_size) {
            let test = data.shift()
            let hexValue = checkAndHandleSingleDigit(test.toString(16))
            packet.push(hexValue);
            step++;
        } else {
            let new_packet = convertToHex(packet)
            let complement = convertHexToSigned(new_packet)
            let reading = convertToReading(complement)
            set.push(reading)
            step = 1;
            packet = []
            let test = data.shift()
            let hexValue = checkAndHandleSingleDigit(test.toString(16))
            packet.push(hexValue)
        }
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

// Little function to deal with single digts, like '1' or '2', converts them into '01', '02'
function checkAndHandleSingleDigit(entry) {
    if (entry.length === 1) {
        return `0${entry}`
    } else {
        return entry
    }
}

