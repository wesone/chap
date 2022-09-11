const {
    UndefinedReferenceError,
    UnusedReferenceError,
    UnreleasedSectionError,
    NoReleaseError,
    InvalidReleaseError,
    InvalidReleaseVersionError,
    InvalidReleaseDateError,
    OutdatedReleaseDateError,
    EmptyReleaseError,
    InvalidTypeError,
    UngroupedTypeError,
    MissingTypeError,
    EmptyTypeError
} = require('./errors');
const Release = require('./Release');

module.exports = class Parser
{
    static types = [
        'Added', // for new features.
        'Changed', // for changes in existing functionality.
        'Deprecated', // for soon-to-be removed features.
        'Removed', // for now removed features.
        'Fixed', // for any bug fixes.
        'Security', // in case of vulnerabilities.
    ];

    _line = 0;
    _currentRelease = null;
    _activeBlockComment = false;

    latestRelease = null;
    references = [];
    referencesAvailable = {};
    hasUnreleasedSection = false;

    isValid = false;
    errors = [];

    constructor(config)
    {
        this.config = config;
    }

    _sanitizeLine(line)
    {
        if(this._activeBlockComment)
        {
            // ignore whole line
            if(!line.includes('-->'))
                return '';

            // end of multiline comment
            line = line.replace(/^(?:.|\n|\r\n)*?-->/g, '');
            this._activeBlockComment = false;
        }

        // remove single line comments
        line = line.replace(/<!--(?:.|\n|\r\n)*?-->/g, '');

        // detect the start of a multiline comment
        if(line.includes('<!--'))
        {
            line = line.replace(/<!--(?:.|\n|\r\n)*$/g, '');
            this._activeBlockComment = true;
        }

        return line;
    }

    _addReferences(line)
    {
        for(const match of [...line.matchAll(/\[([^\[\]]+)\]([^(]|$)\s*([^\s]+)?/g)])
        {
            const [, key, ref, source] = match;
            if(ref === ':')
            {
                this.referencesAvailable[key] = source;
                continue;
            }
            this.references.push(key);
            if(this._currentRelease && this._currentRelease.type)
                this._currentRelease.references.push(key);
        }
    }

    _validateVersions(prevRelease)
    {
        const toInt = num => parseInt(num);

        const latestRelease = this._currentRelease;
        const latestBlocks = latestRelease.version.split('.').map(toInt);

        const release = prevRelease;
        const blocks = release.version.split('.').map(toInt);
            
        let isEqual = true;
        for(let i = 0; i < Math.max(blocks.length, latestBlocks.length); i++)
        {
            if(blocks[i] !== latestBlocks[i])
            {
                isEqual = false;
                if(blocks[i] > latestBlocks[i])
                    this.errors.push(new InvalidReleaseVersionError(latestRelease, release));
                break;
            }
        }
        if(isEqual)
            this.errors.push(new InvalidReleaseVersionError(latestRelease, release));
    }

    _validateChanges()
    {
        const changes = Object.entries(this._currentRelease.changes);

        if(!changes.length)
            this.errors.push(new EmptyReleaseError(this._currentRelease));

        changes.forEach(([type, {line, entries}]) => {
            if(!entries.length)
                this.errors.push(new EmptyTypeError(this._currentRelease, type, line));
        });
    }

    _onRelease(release)
    {
        if(!this.latestRelease)
            this.latestRelease = release;

        if(this._currentRelease)
        {
            this._validateVersions(release);
            this._validateChanges();
        }

        this._currentRelease = release;
    }

    _addRelease(line)
    {
        const match = line.match(/^##\s\[(\d+\.\d+\.\d+)\]\s-\s(\d{4}-\d{2}-\d{2})/);
        if(match)
        {
            const [, version, date] = match;
            const release = new Release(version, date, this._line);

            if(isNaN(new Date(date)))
                this.errors.push(new InvalidReleaseDateError(release));

            this._onRelease(release);
            return true;
        }

        const invalidMatch = line.match(/^##\s\[([^\[\]]+)\]/);
        if(invalidMatch)
        {
            const [, version] = invalidMatch;
            if(version !== 'Unreleased')
            {
                this.errors.push(new InvalidReleaseError(version, this._line));
                return true;
            }
            this.hasUnreleasedSection = true;
            if(this.latestRelease)
                this.errors.push(new UnreleasedSectionError(false));
            return true;
        }

        return false;
    }

    _addType(line)
    {
        const match = line.match(/^###\s(.+)$/);
        if(match)
        {
            const [, type] = match;
            if(!this.constructor.types.includes(type))
            {    
                this.errors.push(new InvalidTypeError(type, this._line));
                return true;
            }

            if(this._currentRelease)
            {
                if(this._currentRelease.hasType(type))
                    this.errors.push(new UngroupedTypeError(this._currentRelease, type, this._line));
                this._currentRelease.setType(type, this._line);
            }
        }
        return !!match;
    }

    _addLine(line)
    {
        if(!line.trim().length)
            return true;

        if(this._currentRelease)
        {
            if(this._currentRelease.type)
            {
                this._currentRelease.add(line);
                return true;
            }
            this.errors.push(new MissingTypeError(this._currentRelease, this._line));
        }
        return false;
    }

    handle(line)
    {
        this._line++;

        line = this._sanitizeLine(line);

        const lineHandled = [
            this._addRelease,
            this._addType,
            this._addLine
        ].some(fn => fn.bind(this)(line));

        this._addReferences(line);

        return lineHandled;
    }

    process(lines)
    {
        if(!Array.isArray(lines))
        {
            this.handle(lines);
            return;
        }

        for(const line of lines)
            this.handle(line);
    }

    _validateUpToDateRelease()
    {
        const today = new Date();
        const releaseDate = new Date(this.latestRelease.date);
        if(
            isNaN(new Date(releaseDate)) || 
            releaseDate.getDate() !== today.getDate() || 
            releaseDate.getMonth() !== today.getMonth() || 
            releaseDate.getFullYear() !== today.getFullYear()
        )
            this.errors.push(new OutdatedReleaseDateError(this.latestRelease));
    }

    _getMissingArrayEntries(source, reference)
    {
        return source.filter(key => !reference.includes(key));
    }

    validate()
    {
        // validate changes of last release
        if(this._currentRelease)
            this._validateChanges();

        if(!this.hasUnreleasedSection)
            this.errors.push(new UnreleasedSectionError(true));

        if(!this.latestRelease)
            return this.errors.push(new NoReleaseError());

        if(this.config.releaseToday)
            this._validateUpToDateRelease();

        const availableReferenceKeys = Object.keys(this.referencesAvailable);
        this.errors.push(
            ...this._getMissingArrayEntries(this.references, availableReferenceKeys)
                .map(ref => new UndefinedReferenceError(ref))
        );
        this.errors.push(
            ...this._getMissingArrayEntries(availableReferenceKeys, this.references)
                .map(ref => new UnusedReferenceError(ref))
        );

        return this.isValid = !this.errors.length;
    }

    getLatestChanges()
    {
        const output = [];
        Object.entries(this.latestRelease.changes).forEach(([type, {entries}]) => {
            output.push(`### ${type}`);
            entries.forEach(entry => {
                // remove reference definitions
                const line = entry.replace(/\[[^\[\]]+\]:\s*[^\s]+/g, '').trim();
                if(line.length)
                    output.push(line);
            });
            output.push('');
        });

        // add used reference definitions
        this.latestRelease.references.forEach(key => output.push(`[${key}]: ${this.referencesAvailable[key]}`));

        return output.join('\n');
    }
};
