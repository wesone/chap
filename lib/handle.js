const fs = require('fs');
const Parser = require('./Parser');

const handle = async config => {
    const parser = new Parser(config);
    let pendingLine = null;

    const stream = fs.createReadStream(config.path, 'utf8');

    stream.on('error', error => {
        console.log(`ERROR: ${error.message}`, error);
    });

    stream.on('data', chunk => {
        const lines = chunk.split(/\r?\n/);
        if(pendingLine)
        {
            lines[0] = pendingLine + lines[0];
            pendingLine = null;
        }

        if(lines[lines.length - 1].length)
            pendingLine = lines.pop();
            
        parser.process(lines);
    });

    return new Promise(resolve => stream.on('close', () => {
        if(pendingLine)
            parser.process(pendingLine);

        parser.validate();
    
        resolve(parser);
    }));
};

module.exports = handle;
