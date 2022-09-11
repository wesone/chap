const {
    UnreleasedSectionError,

    UndefinedReferenceError,
    UnusedReferenceError,

    InvalidTypeError,
    EmptyTypeError,
    UngroupedTypeError,
    MissingTypeError,

    InvalidReleaseError,
    InvalidReleaseVersionError,
    InvalidReleaseDateError,
    EmptyReleaseError,

    OutdatedReleaseDateError,
} = require('../../lib/errors');
const handle = require('../../lib/handle');

const CHANGELOGS_PATH = __dirname + '/../_changelogs/';

describe('handle.js', () => {
    test('validation succeeds for a valid changelog', async () => {
        const parser = await handle({
            path: `${CHANGELOGS_PATH}VALID.md`
        });

        expect(parser.isValid).toBe(true);
        expect(parser.latestRelease.version).toBe('1.0.0');
        expect(parser.errors.length).toBe(0);
    });
    describe('invalid changelogs', () => {
        test('detect missing \'Unreleased\' section', async () => {
            const parser = await handle({
                path: `${CHANGELOGS_PATH}INVALID_UNRELEASED_MISSING.md` 
            });

            expect(parser.isValid).toBe(false);
            expect(parser.errors).toStrictEqual(
                expect.arrayContaining([new UnreleasedSectionError(true)])
            );
        });
        test('detect unused and undefined references', async () => {
            const parser = await handle({
                path: `${CHANGELOGS_PATH}INVALID_REFERENCES.md` 
            });

            expect(parser.isValid).toBe(false);
            expect(parser.errors).toStrictEqual(
                expect.arrayContaining([
                    new UndefinedReferenceError('0.0.5'),
                    new UnusedReferenceError('0.0.4')
                ])
            );
        });
        test('detect misuse of type of changes', async () => {
            const parser = await handle({
                path: `${CHANGELOGS_PATH}INVALID_TYPES_OF_CHANGES.md` 
            });

            expect(parser.isValid).toBe(false);
            expect(parser.errors).toStrictEqual(
                expect.arrayContaining([
                    new EmptyTypeError({version: '0.0.3'}, 'Changed', 14),
                    new InvalidTypeError('Invalid', 18),
                    new UngroupedTypeError({version: '0.0.1'}, 'Added', 31),
                    new MissingTypeError({version: '0.0.3'}, 10)
                ])
            );
        });
        test('detect invalid releases', async () => {
            const parser = await handle({
                path: `${CHANGELOGS_PATH}INVALID_RELEASES.md` 
            });

            expect(parser.isValid).toBe(false);
            expect(parser.errors).toStrictEqual(
                expect.arrayContaining([
                    new InvalidReleaseError('0.0.5', 9),
                    new EmptyReleaseError({version: '0.0.4', line: 13}),
                    new InvalidReleaseDateError({version: '0.0.3', date: '2014-13-01', line: 15}),
                    new InvalidReleaseVersionError({version: '0.0.2', line: 19}, {version: '0.0.2', date: '2014-07-10'}),
                    new InvalidReleaseVersionError({version: '0.0.2', line: 23}, {version: '0.1.0', date: '2014-05-31'})
                ])
            );
        });
        test('date of latest release must be today for --today flag', async () => {
            const parse = () => handle({
                path: `${CHANGELOGS_PATH}VALID.md`,
                releaseToday: true
            });

            let parser = await parse();
            expect(parser.isValid).toBe(false);
            expect(parser.errors).toStrictEqual(
                expect.arrayContaining([
                    new OutdatedReleaseDateError({version: '1.0.0', date: '2017-06-20', line: 9})
                ])
            );

            jest
                .useFakeTimers()
                .setSystemTime(new Date('2017-06-20'));
            parser = await parse();
            expect(parser.isValid).toBe(true);
            expect(parser.latestRelease.version).toBe('1.0.0');
            expect(parser.errors.length).toBe(0);
        });
    });
    describe('ignores comments', () => {
        test('single line comment', async () => {
            const parser = await handle({
                path: `${CHANGELOGS_PATH}VALID_COMMENT.md` 
            });
    
            expect(parser.isValid).toBe(true);
            expect(parser.latestRelease.version).toBe('1.0.0');
            expect(parser.errors.length).toBe(0);
        });
        test('multiline comment', async () => {
            const parser = await handle({
                path: `${CHANGELOGS_PATH}VALID_COMMENT_MULTILINE.md` 
            });
    
            expect(parser.isValid).toBe(true);
            expect(parser.latestRelease.version).toBe('1.0.0');
            expect(parser.errors.length).toBe(0);
        });
    });
});
