#Enabling use of TDIL Text To Speech (TTS) service in batch mode

This is a [Nodejs](https://nodejs.org/en/) app to invoke 
[TDIL Text To Speech (TTS) service](http://www.tdil-dc.in/index.php?option=com_vertical&parentid=85&lang=en) 
in a non-interactive (batch/bulk) mode.

## Pre-requisites
* [Nodejs] (https://nodejs.org/)
* Node modules that can be installed by running `npm install`. 
  The modules to be insatlled are listed under `dependencies` in 
  `package.json`[package.json]

## Usage
Given a list of text files (assumed to be in UTF-8 encoding),
this app will submit each of them in parallel to TDIL TTS services
and download the generated mp3 files.

Usage: `node ttsbatch.js file1.txt file2.txt ...`

Downloaded mp3 files will be saved with `.mp3` appended to the
input file paths. E.g., file1.txt will result in file1.txt.mp3

Default language assumed is Telugu. You can change this by
modifying the value of language variable in [`ttsbatch.js`](ttsbatch.js).

Another variable you may want to tune is the `retryinterval`.
TDIL TTS service takes a bit of time, especially for large files.
Observe the average time your submissions are taking to complete
and set the `retryinterval` accordingly to avoid sending too many
pre-mature requests for generated mp3 files.

## Unlicense
This is free and unencumbered software released into the public domain.
See [UNLICENSE file](UNLICENSE) for more details.
