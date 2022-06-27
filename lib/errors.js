class InvalidTypeError extends Error
{
    constructor(type)
    {
        super(`Invalid type of change '${type}'.`);
    }
}

class UndefinedReferenceError extends Error
{
    constructor(ref)
    {
        super(`Reference '${ref}' is not defined.`);
    }
}

class UnusedReferenceError extends Error
{
    constructor(ref)
    {
        super(`Reference '${ref}' is defined but never used.`);
    }
}

class UnreleasedSectionError extends Error
{
    constructor(isMissing)
    {
        super(
            isMissing
                ? `There is no 'Unreleased' section. Add '## [Unreleased]' as first release.`
                : `The 'Unreleased' section must be the top most release`
        );
    }
}

class NoReleaseError extends Error
{
    constructor()
    {
        super(`There are no releases specified (format: '## [x.x.x] - YYYY-MM-DD').`);
    }
}

class InvalidReleaseError extends Error
{
    constructor(version)
    {
        super(`Invalid release entry for version '${version}'. Use the format: '## [x.x.x] - YYYY-MM-DD'`);
    }
}

class InvalidReleaseVersionError extends Error
{
    constructor(
        {version}, 
        {version: prevVersion, date}
    )
    {
        super(`Invalid release version '${version}' compared to ${prevVersion} released on ${date}.`);
    }
}

class InvalidReleaseDateError extends Error
{
    constructor({version, date})
    {
        super(`Release ${version} has an invalid date '${date}'.`);
    }
}

class OutdatedReleaseDateError extends Error
{
    constructor({version, date})
    {
        super(`Release date '${date}' of ${version} is in the past.`);
    }
}

module.exports = {
    InvalidTypeError,
    UndefinedReferenceError,
    UnusedReferenceError,
    UnreleasedSectionError,
    NoReleaseError,
    InvalidReleaseError,
    InvalidReleaseVersionError,
    InvalidReleaseDateError,
    OutdatedReleaseDateError
};
