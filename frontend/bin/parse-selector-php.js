const path = require('path');
const fs = require('fs');
const readline = require('readline');

const ROOT = path.resolve(__dirname, '../../');
const inputFile = path.join(ROOT, 'backend/config/selectors.php');
const outputFile = path.join(ROOT, 'frontend/src/config/request-filter.ts');

async function run () {
  const fileStream = fs.createReadStream(inputFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const result = {};
  let start = false;
  let onNamespace = '';
  let onEnum = '';
  for await (const line of rl) {
    if (!start && /return \[/g.test(line)) {
      start = true;
      continue;
    }
    if (!start) { continue; }
    if (!/\w|\[|\]/g.test(line)) { continue; }

    if (onEnum) {
      if (line.includes(']')) {
        onEnum = '';
        continue;
      }
      const words = line.match(/[\w\u4e00-\u9fa5]+/g);
      if (!words.length) { continue; }
      result[onNamespace][onEnum].push({
        name: words[0],
        comment: words[1],
      }); 
    } else if (onNamespace) {
      if (line.includes(']')) {
        onNamespace = '';
        continue;
      }
      if (!line.includes('[')) { continue; }
      const words = line.match(/[\w]+/g);
      if (!words.length) { continue; }
      onEnum = words[0];
      result[onNamespace][onEnum] = [];
    } else {
      if (!line.includes('[')) { continue; }
      const words = line.match(/[\w]+/g);
      if (!words.length) { continue; }
      onNamespace = words[0].split('_')[0];
      result[onNamespace] = {};
    }
  }

  

  let outputText = '';
  outputText += `export namespace RequestFilter {\n`;
  for (const namespace in result) {
    outputText += `  export namespace ${namespace} {\n`;
    for (const enumName in result[namespace]) {
      outputText += `    export enum ${enumName} {\n`;
      for (const enums of result[namespace][enumName]) {
        outputText += `      ${enums.name} = '${enums.name}', // ${enums.comment}\n`;
      }
      outputText += `    }\n`;
    }
    outputText += `  }\n\n`;
  }
  outputText += '}';

  console.log(outputText);
  fs.writeFileSync(outputFile, outputText, 'utf8');
}

run().catch(console.error);