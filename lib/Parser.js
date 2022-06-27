const {
    InvalidTypeError,
    UndefinedReferenceError,
    UnusedReferenceError,
    UnreleasedSectionError,
    NoReleaseError,
    InvalidReleaseError,
    InvalidReleaseVersionError,
    InvalidReleaseDateError,
    OutdatedReleaseDateError
} = require('./errors');

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

    references = [];
    referencesAvailable = [];
    releases = [];
    hasUnreleasedSection = false;

    isValid = false;
    errors = [];

    constructor(config)
    {
        this.config = config;
    }

    _addReferences(line)
    {
        for(const match of [...line.matchAll(/\[([^\[\]]+)\]([^(]|$)/g)])
        {
            const [, key, ref] = match;            
            (ref === ':' ? this.referencesAvailable : this.references).push(key);
        }
    }

    _checkType(line)
    {
        const match = line.match(/^###\s(.+)$/);
        if(match && !this.constructor.types.includes(match[1]))
            this.errors.push(new InvalidTypeError(match[1]));
    }

    _addRelease(line)
    {
        const match = line.match(/^##\s\[(\d+\.\d+\.\d+)\]\s-\s(\d{4}-\d{2}-\d{2})/);
        if(match)
        {
            const [, version, date] = match;
            this.releases.push({
                version,
                date
            });
            return;
        }

        const invalidMatch = line.match(/^##\s\[([^\[\]]+)\]/);
        if(invalidMatch)
        {
            const [, version] = invalidMatch;
            if(version === 'Unreleased')
            {
                this.hasUnreleasedSection = true;
                if(this.releases.length)
                    this.errors.push(new UnreleasedSectionError(false));
                return;
            }
            this.errors.push(new InvalidReleaseError(version));
        }
    }

    handle(line)
    {
        this._addReferences(line);
        this._checkType(line);
        this._addRelease(line);

        //TODO check if a release has at least one type of change
        //TODO check if a release has no type of change multiple times (changes need to be grouped)
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

    _validateVersions()
    {
        if(this.releases.length < 2)
            return;
        
        const releases = [...this.releases].reverse();
        const toInt = num => parseInt(num);

        let currentRelease = releases.shift();
        let currentBlocks = currentRelease.version.split('.').map(toInt);
        while(releases.length)
        {
            const latestRelease = releases.shift();
            const latestBlocks = latestRelease.version.split('.').map(toInt);

            let isEqual = true;
            for(let i = 0; i < Math.max(currentBlocks.length, latestBlocks.length); i++)
            {
                if(currentBlocks[i] !== latestBlocks[i])
                {
                    isEqual = false;
                    if(currentBlocks[i] > latestBlocks[i])
                        this.errors.push(new InvalidReleaseVersionError(latestRelease, currentRelease));
                    break;
                }
            }
            if(isEqual)
                this.errors.push(new InvalidReleaseVersionError(latestRelease, currentRelease));

            currentRelease = latestRelease;
            currentBlocks = latestBlocks;
        }
    }

    _validateUpToDateRelease()
    {
        const today = new Date();
        const currentRelease = this.releases[0];
        const releaseDate = new Date(currentRelease.date);
        if(
            isNaN(new Date(releaseDate)) || 
            releaseDate.getDate() !== today.getDate() || 
            releaseDate.getMonth() !== today.getMonth() || 
            releaseDate.getFullYear() !== today.getFullYear()
        )
            this.errors.push(new OutdatedReleaseDateError(currentRelease));
    }

    _validateReleases()
    {
        if(!this.releases.length)
            return this.errors.push(new NoReleaseError());

        // version check
        this._validateVersions();

        // date check
        this.releases.forEach(release => {
            if(isNaN(new Date(release.date)))
                this.errors.push(new InvalidReleaseDateError(release));
        });

        if(this.config.releaseToday)
            this._validateUpToDateRelease();
    }

    _getMissingArrayEntries(source, reference)
    {
        return source.filter(key => !reference.includes(key));
    }

    validate()
    {
        if(!this.hasUnreleasedSection)
            this.errors.push(new UnreleasedSectionError(true));

        this._validateReleases();

        this.errors.push(
            ...this._getMissingArrayEntries(this.references, this.referencesAvailable)
                .map(ref => new UndefinedReferenceError(ref))
        );
        this.errors.push(
            ...this._getMissingArrayEntries(this.referencesAvailable, this.references)
                .map(ref => new UnusedReferenceError(ref))
        );

        return this.isValid = !this.errors.length;
    }
};
