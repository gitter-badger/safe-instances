/* by Oratio.io */

//Modules
var vm = require('vm');
var assert = require('assert');

var filename = process.argv[2] || 'child.js';
var file = process.argv[3];
var timeout = new Date(process.argv[4]);

console.log(file);
vm.runInThisContext(file, {filename: filename, timeout: timeout}); //Runs for an hour, LOL.