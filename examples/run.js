const path = require("path");
const fs = require("fs");

// Regexp to match files in folder
const exampleMatcher = /(\.\/)?\w{1,3}-.*\.js/g;

const printTitle = (exampleName, padSymbol) => {
  if (exampleName.endsWith(".js")) {
    exampleName = exampleName.slice(0, -3);
  }
  const fixedName = exampleName
    .split("-")
    .map((item, i) => {
      return i === 0 ? `#${item} -` : item[0].toUpperCase() + item.slice(1);
    })
    .join(" ");
  const title = `Launching Example ${fixedName}`;
  const divider = "".padEnd(title.length + 4, padSymbol);

  console.log(divider);
  console.log(title);
  console.log(divider);
};

fs.readdir(__dirname, (err, files) => {
  const examples = files.filter((file) => file.match(exampleMatcher));
  let [exampleName] = process.argv.slice(2);

  let filepath;
  if (exampleName.match(exampleMatcher)) {
    filepath = path.resolve(__dirname, exampleName);
  } else {
    const name = examples.find((item) => item.includes(exampleName));
    if (!name) {
      filepath = null;
    } else {
      filepath = path.resolve(__dirname, name);
    }
  }

  if (filepath) {
    const title = filepath.match(/\d{1,3}-.*.js$/)[0];
    printTitle(title, "=");
    require("esm")(module /*, options*/)(filepath);
  } else {
    console.log(`Example "${exampleName}" not found!\n`);
    console.log("Try one of available examples:", examples);
  }
});
