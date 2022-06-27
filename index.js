const fs = require('fs');
const Parser = require('./lib/Parser');

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

const args = process.argv;
args.splice(0, 2);
(args => {
    const config = {};

    while(args.length)
    {
        const arg = args.shift();
        switch(arg)
        {
            case '--version':
            case '-v':
                config.diplayVersion = true;
                break;
            case '--today':
                config.releaseToday = true;
            // case '--strict':
            //     config.strict = true;
            //     break;
            default:
                config.path = arg;
        }
    }

    if(!config.path)
        return console.error('Please specify the path to a changelog file.');

    handle(config).then(parser => {
        if(!parser.isValid)
            return parser.errors.forEach(({message}) => console.error(message));

        if(config.diplayVersion)
            console.log(parser.releases[0].version);
    });
})(args);
