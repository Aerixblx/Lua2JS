// code


class lua {
  static run(log='', luaCode) {
    let jsCode = "";
    const tableRegex = /\{([^}]*)\}/g;
    const lines = luaCode.split("\n");
    let insideMultiLineComment = false;

    lines.forEach((line) => {
        jsCode = jsCode.replaceAll("end", "}");

        if (line.includes('--[[')) {
            insideMultiLineComment = true
            jsCode += `/* ${line.slice(line.indexOf('--[[') + 4).trim()} `
        } 
        else if (line.includes(']]--') && insideMultiLineComment) {
            insideMultiLineComment = false
            jsCode += `${line.slice(0, line.indexOf(']]--')).trim()} */\n`
        } 
        else if (insideMultiLineComment) {
            jsCode += ` ${line.trim()}\n`
        }  else if (/^\s*for\s+\S+\s*=\s*\d+,\s*\d+\s*do/.test(line)) {
            let parts = line.match(/for\s+(\w+)\s*=\s*(\d+),\s*(\d+)\s*do/);
            if (parts) {
                let variable = parts[1];
                let start = parts[2];
                let end = parts[3];
                jsCode += `\nfor (let ${variable} = ${start}; ${variable} <= ${end}; ${variable}++) {\n`;
                line = ""
                jsCode = jsCode.replaceAll(`for ${variable} = ${start}, ${variable} do`, '')
                
            }
        } else if (/^\s*if/.test(line)) {
            line = line.trim();
            line = line.replace("if ", "");
            line = line.replace(" == '", " == '");
            if (!line.startsWith("if ")) {
                line = "if (" + line.replace(" then", ") {");
            }
            jsCode = jsCode.replaceAll(line, "if" + line);
        } else if (/^\s*while/.test(line)) {
            line = line.trim();

            line = line.replace(/^while\s+/i, "while ");
            line = line.replace(/\s+do$/, "");
            if (!line.includes("(")) {
                line = line.replace("while", "while (") + ") {";
            }

            jsCode = jsCode.replaceAll(line, line);
        } else if (insideMultiLineComment) {
            if (line.includes("]]--")) {
                insideMultiLineComment = false;
                jsCode += ` ${line.slice(0, line.indexOf("]]--")).trim()} */\n`;
            } else {
                jsCode += ` ${line.trim()}\n`;
            }
        }
        if (line.startsWith("--")) {
            jsCode += `// ${line.slice(2).trim()}\n`;
        } else if (/^\s*function/.test(line)) {
            line = line.trim();
            let funcName = line.split(" ")[1];
            jsCode += `function ${funcName}{\n`;
        } else if (
            line.includes("=") &&
            !line.includes("for (") &&
            line.includes("local ") &&
            !line.includes("if ") &&
            !line.includes("{") &&
            !line.includes("}")
        ) {
            let [variable, value] = line.split("=").map((str) => str.trim());
            jsCode += `let ${variable.replaceAll("local", "")} = ${value};\n`;
        } else if (
            tableRegex.test(line) &&
            !line.includes("if") &&
            !line.includes("function")
        ) {
            jsCode +=
                line
                    .replace("local", "let")
                    .replace(tableRegex, (match, p1) => {
                        return `{${p1
                            .split(",")
                            .map((pair) => {
                                return pair
                                    .trim()
                                    .replace(/(\w+)=(\S+)/g, (m, key, val) => {
                                        if (val[0] === "'" || val[0] === '"') {
                                            return `${key}:${val}`;
                                        }
                                        return `${key}:${val}`;
                                    });
                            })
                            .join(",")}}`;
                    }) + "\n";
        } else if (line.includes("..")) {
            jsCode += line.replace(/\.\./g, "+") + "\n";
        } else if (line.includes("local function")) {
            jsCode += line.replaceAll("local ", "") + "{";
        } else if (line === "end") {
            jsCode += "}\n";
        } else {
            jsCode += `${line}\n`;
        }
    });

    jsCode = jsCode.replaceAll("nil", "null");
    try {
      if (log == '') {
          eval(jsCode);
      } else {
        console.log(jsCode)
      }
    } catch (err) {
      console.log(err.message)
      if (err instanceof SyntaxError) {
        if (err.message.includes('Unexpected end of input')) {
          console.log('lua: unexpected end of input at h');
        } 
      } 
    }

  }
}
const print = (e) => {
    if (e === null) {
        console.log("nil");
    } else if (typeof e === "string") {
        console.log(e.replaceAll("null", "nil"));
    } else {
        console.log(e);
    }
};


// how to use
let luaCode = `
print('Hello world')
`
lua('', luaCode)
