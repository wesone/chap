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
                ? `There is no 'Unreleased' section. Add '## [Unreleased]' above the first release.`
                : `The 'Unreleased' section must be above the top most release.`
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
    constructor(version, line)
    {
        super(`Invalid release entry for version '${version}'. Use the format: '## [x.x.x] - YYYY-MM-DD' (:${line}).`);
    }
}

class InvalidReleaseVersionError extends Error
{
    constructor(
        {version, line}, 
        {version: prevVersion, date}
    )
    {
        super(`Invalid release version '${version}' compared to ${prevVersion} released on ${date} (:${line}).`);
    }
}

class InvalidReleaseDateError extends Error
{
    constructor({version, date, line})
    {
        super(`Release ${version} has an invalid date '${date}' (:${line}).`);
    }
}

class OutdatedReleaseDateError extends Error
{
    constructor({version, date, line})
    {
        super(`Release date '${date}' of ${version} is in the past (:${line}).`);
    }
}

class EmptyReleaseError extends Error
{
    constructor({version, line})
    {
        super(`Release ${version} has no changes (:${line}).`);
    }
}

class InvalidTypeError extends Error
{
    constructor(type, line)
    {
        super(`Invalid type of change '${type}' (:${line}).`);
    }
}

class UngroupedTypeError extends Error
{
    constructor({version}, type, line)
    {
        super(`Type of change '${type}' already exists inside release ${version} (:${line}).`);
    }
}

class MissingTypeError extends Error
{
    constructor({version}, line)
    {
        super(`Change is not assigned to a type of change inside release ${version} (:${line}).`);
    }
}

class EmptyTypeError extends Error
{
    constructor({version}, type, line)
    {
        super(`Type '${type}' inside release ${version} has no entries (:${line}).`);
    }
}

module.exports = {
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
};
