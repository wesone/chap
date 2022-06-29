#!/usr/bin/env node

const handle = require('./lib/handle');

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
            case '--changes':
            case '-c':
                config.diplayChanges = true;
                break;
            case '--today':
                config.releaseToday = true;
                break;
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
        {
            parser.errors.forEach(({message}) => console.error(message));
            return process.exit(1);
        }

        if(config.diplayVersion)
            console.log(parser.latestRelease.version);

        if(config.diplayChanges)
            parser.printLatestChanges();
    });
})(args);
