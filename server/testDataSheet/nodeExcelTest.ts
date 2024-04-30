import fs from "fs";


const data = fs.readFileSync("./INKTotal.xlsx", {encoding:"base64"});
console.log(data);

