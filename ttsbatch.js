/**
* Nodejs app to invoke TDIL Text To Speech (TTS) service
* in a non-interactive (or batch) mode.
*
* Given a list of text files (assumed to be in UTF-8 encoding), 
* this app will submit each of them in parallel to TDIL TTS services
* and download the generated mp3 files.
*
* Usage: node ttsbatch.js file1.txt file2.txt ...
*
* Downloaded mp3 files will be saved with .mp3 appended to the 
* input file paths. E.g., file1.txt will result in file1.txt.mp3
*
* Default language assumed in Telugu. You can change this by
* modifying the value of language variable in the source below.
* 
* Another variable you may want to tune is the retryinterval.
* TDIL TTS service takes a bit of time, especially for large files.
* Observe the average time your submissions are taking to complete 
* and set the retryinterval accordingly to avoid sending too many 
* pre-mature requests for generated mp3 files.
*
* See http://www.tdil-dc.in/index.php?option=com_vertical&parentid=85&lang=en
* for details on their TTS service.
*
* Author: Prasad Chodavarapu
* This is free and unencumbered software released into the public domain. 
* See UNLICENSE file for more details.
*/

// Module imports
var async = require("async");
var fs = require("fs");
var http = require("http");
var wget = require('wget-improved');
var XMLHttpRequest = require("xhr2");

// Constants
var ttsurl = "http://tdil-dc.in/tts/festival_cs_plugin.php";
var ttsmp3urlprefix = "http://tdil-dc.in/tts/wav_output/fest_out" 
var language = "telugu";
var fixedparams = "Languages=" + language + 
                  "&speed=normal&voice=voice1&ex=execute&op=";
var retryinterval = 60; //in seconds

/** Generates a unique ID for each input file. 
A unique ID is required by TDIL TTS service. TDIL uses the provided ID 
while naming the generated mp3 file. 

This implementation came from 
http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
*/
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

/** Downloads the given url and saves the result at given path.
 * Retries infinitely (until interrupted by a Ctrl-c) after every retyniterval seconds
 */
function downloadmp3(ttsmp3url, mp3path) {
  console.log("Downloading generated mp3 file from " + 
   ttsmp3url + " and saving to " + mp3path);
  var mp3dl = wget.download(ttsmp3url, mp3path);
  mp3dl.on('end', function() {
    console.log("Done downloading generated mp3 to " + mp3path);
  });
  mp3dl.on('error', function(err) {
    console.log("Downloading " + ttsmp3url + " to " + mp3path + 
      " failed. Will retry in " + retryinterval + " seconds");
    setTimeout(downloadmp3, retryinterval*1000, ttsmp3url, mp3path);
  });
}

/** Submits given file to TDIL TTS service and downloads the resulting mp3.
 * 
 */
function convertFile(file, callback) {
  console.log("Reading " + file);
  var text = fs.readFileSync(file, 'utf8');
  var id = Math.abs(text.hashCode()); //TDIL TTS wants a unique ID from the client!
  console.log("Submitting " + file + " with request id: " + id);
  var xhr2 = new XMLHttpRequest();
  request = xhr2.open("POST", ttsurl, true);
  xhr2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  var params = fixedparams + 
               encodeURIComponent(text).replace("%20","+") +
               "&count=" + id;
  xhr2.onreadystatechange = function() {
    if(xhr2.readyState == 4) {
      var ttsmp3url = ttsmp3urlprefix + id + ".mp3";
      var mp3path = file+".mp3"; 
      downloadmp3(ttsmp3url, mp3path);
    }
  }
  xhr2.send(params);
}

/** Function to be called back upon completion of convertFile.
 */
function onCompletion(err) {
  if (err) { return console.error(err);}
  else { console.log("All done.") }
}

// Execution starts here
if (process.argv.length <= 2) {
   console.error("No files provided");
   console.error("Usage: node ttsbatch.js file1.txt file2.txt ...");
}
//Process each file in the arguments
async.each(process.argv.slice(2), convertFile, onCompletion);
