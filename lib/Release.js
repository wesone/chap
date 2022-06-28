module.exports = class Release
{
    changes = {};
    type = null;

    references = [];

    constructor(version, date, line)
    {
        this.version = version;
        this.date = date;
        this.line = line;
    }

    hasType(type)
    {
        return !!this.changes[type];
    }

    setType(type, line)
    {
        if(!this.hasType(type))
            this.changes[type] = {
                line,
                entries: []
            };
        this.type = type;
    }

    add(line)
    {
        this.changes[this.type].entries.push(line);
    }
};
