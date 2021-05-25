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
var connection = mysql.createConnection({
    host: "127.0.0.1",
    user: 'root',
    password: 'toor',
    database: 'lpl'
})

connection.connect(function (error) {
    if (error) {
        throw error;
    }

    console.log("Connection Successful")
});

connection.query('SELECT trace_id, trace_data FROM test', function(error, results, fields) {
    if (error) throw error;
    let count = 0;
    let packet_size = 4;
    let set = [];

    let data = results[0].trace_data

    // let trace_data_size = data.length;
    let trace_data_size = 5;
    console.log("lenght", trace_data_size)

    // console.log("trace_id: ", results[count].trace_id)
    // console.log("trace_id: ", results[count].trace_data)
    let step = 1;
    let packet = [];

    while (count < trace_data_size) {
        
        if (step <= packet_size) {
            // console.log("pushing ", data[count])
            packet.push(data[count].toString(16))
            // packet = packet.join('')
            // console.log(packet.join(''))
            console.log(packet)
            // console.log("back to number", parseInt(packet, 32))
            step++
        } else {
            set.push(packet)
            // console.log("reset step")
            // console.log("Check: ", set)
            step = 1;
            // packet = [];
        }
        console.log('packet', packet.join(''))
        // packet = packet.join('')
        
        // console.log("count", count)
        count++
    }
    // console.log('hextoInt?', parsInt(packet.join(''), 16))

    // console.log(set)

})


// Going to need to get chunks of 4 at a time, convert to int, then get signed 32 bit