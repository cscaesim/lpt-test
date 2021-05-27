# lpt-test

README

Time Taken: A day and a half (roughly 6-8 hours spread over 2-3 days)

Node packages you’ll need:

ejs
Express
Mysql

npm init and npm install to get it setup. Node index.js to run

First of all, apologies for not doing as many commit’s as you probably wanted to, I got focused and tend to commit when I do very big changes or stop for the day. I also apologize for the simpler coding possibly in comparison to others, bit rusty with JavaScript and prefer to have my code be simple/easy to read. I also am slightly unsure about my dataset, the test file did mention that all the values would be negative, but multiple checks cause me to think that there would be positive numbers at least once or twice in the data set.

This is a challenge project for the LP Technologies test, and this readme will have general thoughts and clarifications.

For the project, I decided to use NPM and Express to create our server backend to handle getting data from database, with a front end script to handle converting the data and displaying the blobs in graphs, NPM and Express allowed easy startup with node, and express handled passing the data to the front end.

I decided to EJS as well as the rendering engine after first having plain html, because passing data from Express to EJS is significantly easier than to HTML with the <%= %> tag for passing the data from render.

ChartJS was the decided upon graphing framework to use, at first I tried Google Graphs, but was having an issue with getting the data passed (mainly because I didn’t get it properly set up first :) ). But ChartJS ended up being simpler to get running, and allowed for a little more customization to make the graph decent. Unfortunately, because it’s a CDN pulled framework, it could not handle the data inputs in the large format, so to make it run performant, I changed the values to be divided by quite a few more factors, so instead of -100100, we have -10.01 for a value in the graph, it makes the graph run significantly better and has the values be readable. I do apologize that the graph isn’t a 100% match to the graph in the test file, I tried as much as possible to get it looking decent, but didn’t want to take too much time on it.

If there are any questions or concerns about the code please feel free to ask!
