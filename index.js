// Caine Simpson
// CaineESimpson@gmail.com
// Time taken: Roughly a day and a half of coding and problem solving (and re-learning some stuff).

var mysql = require('mysql');
var bodyParser = require('body-parser');
var express = require('express');
var port = 8080;
var path = require('path');


const app = express()
// var data_set = []

app.use(express.static(path.join(__dirname, '/lpt')));
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

// Our express code to launch backend and do server side stuff.
// Switched from html to ejs view engine in order to easily get our data_set into the front end script
app.get('/', (req, res) =>
{
    connect_database();
    var data_set = [];
    var time_set = [];

    get_data_set(function (err, results)
    {
        if (err)
        {
            return null;
        } else {
            
            let graph_set = [];

            time_set = create_time_set(results);
            console.log("TIME SET", time_set);

            // Loop through each set of BLOBS, to conver the values into a data set of signed ints
            results.forEach(element =>
            {
                let set = create_data_set(element.trace_data);
                // console.log("elements here", element.trace_time);
                graph_set.push(set);
                // time_set.push(time_array)
                // console.log(`DATASET VALUE: ${element.trace_id}`, data_set)
            });


            // console.log("graph_set", graph_set)

            // Some test code to check if convertions are working.
            run_test(['ff', 'ff', '33', '01']);
            run_test(['c3', 'bf', '23', '2e']);
            // console.log('hextoInt?', parsInt(packet.join(''), 16))
            close_database_connection();
            data_set = graph_set;
            // console.log(set)
            // console.log("data set length: ", data_set.length);
            // console.log("data set", data_set);
4
            var json = JSON.stringify(data_set);
            // var time_json = JSON.stringify(time_set);

            res.render('./main.ejs', { data: json, time_data: time_set });
        }
        // console.log('data set', data_set)

        
        // return data_set
    });
});

app.listen(port, () =>
{
    console.log(`Listening ${port}`);
});

// Hard coding these values just for quickness, if I was creating this as a full industry application theses values would come from environment variables.
var connection = mysql.createConnection({
    host: "127.0.0.1",
    user: 'root',
    password: 'toor',
    database: 'lpl'
});

// Database function to connect to the database.
function connect_database()
{
    connection.connect(function (error)
    {
        if (error)
        {
            throw error;
        }

        console.log("Connection Successful")
    });
}

// MARK:- Close Database Connection
function close_database_connection()
{
    console.log("Closing database");
    connection.end();
}

// Our query function to get the database values.
// Callback to get the value from the query, into a global set for parsing
function get_data_set(callback)
{
    connection.query('SELECT trace_id, trace_data, trace_time FROM test', function (error, results)
    {
        if (error)
        {
            callback(error, null);
        } else
        {
            return callback(null, results);
        }

    })
}

// MARK:- Our primary functino for converting values.
// Our main data set function, it loops through the values of the trace, by sets of 4 (while converting them into hex for each one),
// Then the function converts it from 4 blocks of hex -> to unsigned value -> to signed value (by getting complement) -> then to a reading (where we divide by 1000)
// To push into the graph.
function create_data_set(data)
{
    // count to loop through to the end of our data list
    let count = 0;
    // packet for getting our 4 'byte' sets of hex code
    let packet = [];
    // constant variable to refer to packet size
    const packet_size = 4;
    // where we put our completed packets
    let set = [];
    // step to count up to packet size.
    let step = 0;
    // our data size
    const trace_data_size = data.length;

    // A while loop to step through each value in the list, because the list is so large,
    // Using a while loop will get through each value in the "packet"
    while (count < trace_data_size)
    {

        // We use a check to partition each value into sets of 4 (or less), in order to convert to the numbers we need.
        if (step < packet_size)
        {

            // console.log("pushing ", data[count])
            // We check if our hex code is single digit, such as '1', and convert it to '01'
            let hexValue = checkAndHandleSingleDigit(data[count].toString(16));
            packet.push(hexValue);
            step++;

            // console.log("back to number", parseInt(packet, 32))
        } else
        {
            // console.log('packet', packet)

            let new_packet = convertToHex(packet);
            let complement = convertHexToSigned(new_packet);
            let reading = convertToReading(complement);

            set.push(reading);
            // We set our packet to one here, and add the value data[count] is currently pointing at
            // because I found that resetting to 0 would skip a value, so adding it here will stop that :)
            step = 1;
            packet = [];
            packet.push(checkAndHandleSingleDigit(data[count].toString(16)));
        }
        count++;
    }

    return set;
}

// MARK:- Create our lists of times, matching with our datasets, in order to display our times.
function create_time_set(times) {
    let count = 0;
    let time_array = [];

    while (count < times.length) {
        time_array.push(times[count].trace_time)
        count++;
    }

    // console.log("time array ", time_array);

    return time_array;
}

// MARK:- This is a quick function to test my convertions, had to quadruple check to make sure they worked :) 
function run_test(packet)
{
    let hex = convertToHex(packet);
    console.log("hexTest", hex);

    let comp = convertHexToSigned(hex);
    console.log("signed text", comp);

    let reading = convertToReading(comp);
    console.log("reading test", reading);
}


// Going to need to get chunks of 4 at a time, convert to int, then get signed 32 bit
// MARK:- Functions to create our hex values, then convert them to our signed 32bit integer values. And one function to convert to our reading values.
function convertToHex(packet)
{
    let hex = packet.join('');

    return hex;
}

// MARK:- Function to convert from the hex above to signed integers.
// I was going to use a fancy algorithm to do so, but reading over some code on others attempts, this might be enough (?)
function convertHexToSigned(hexString)
{
    let value = parseInt(hexString, 16);
    // This should convert 2's complement but we shall see :)
    return -(~value + 1);
}

// MARK:- Functino to convert signed value to 'reading' to use.
function convertToReading(value)
{
    // I'm dividing by 10 million basically to to make the numbers small enough to display easily,
    // The massive numbers were crippling the data set
    return (value / 100000000);
}

function convertToTimeArray(string) {
    var stringArray = string.split(',');

    return stringArray;
}

//MARK:- Little function to deal with single digts, like '1' or '2', converts them into '01', '02'
function checkAndHandleSingleDigit(entry)
{
    if (entry.length === 1)
    {
        return `0${entry}`;
    } else
    {
        return entry;
    }
}

