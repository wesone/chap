const indexPath = '../';

jest.mock('../lib/handle', () => {
    return jest.fn(() => Promise.resolve({
        isValid: true,
        errors: [],
        latestRelease: {
            version: '1.0.0',
            date: '2017-06-20',
            line: 9,
            type: 'Added',
            references: [],
            changes: {
                Added: {
                    line: 10,
                    entries: [
                        '- Stuff added',
                        '- Other stuff added'
                    ]
                }
            }
        },
        getLatestChanges()
        {
            return [
                '### Added',
                '- Stuff added',
                '- Other stuff added',
                ''
            ].join('\n');
        }
    }));
});

let handle;
beforeEach(() => {
    jest.spyOn(console, 'log').mockReturnValue();
    process.argv = [
        'node',
        '/index.js'
    ];
    handle = require('../lib/handle');
});

afterEach(() => {
    jest.resetModules();
});

describe('index.js', () => {
    test('needs the path to a changelog file', async () => {
        const spyError = jest.spyOn(console, 'error').mockReturnValue();
        process.argv.push('--version');
        require(indexPath);

        expect(spyError).toHaveBeenCalled();
        expect(handle).not.toHaveBeenCalled();
    });
    describe('detects \'version\' option', () => {
        test('--version', async () => {
            process.argv.push(
                '--version',
                '/CHANGELOG.md'
            );
            require(indexPath);

            expect(handle).toHaveBeenCalledWith({
                path: '/CHANGELOG.md',
                diplayVersion: true
            });
        });
        test('-v', async () => {
            process.argv.push(
                '-v',
                '/CHANGELOG.md'
            );
            require(indexPath);

            expect(handle).toHaveBeenCalledWith({
                path: '/CHANGELOG.md',
                diplayVersion: true
            });
        });
    });
    describe('detects \'changes\' option', () => {
        test('--changes', async () => {
            process.argv.push(
                '--changes',
                '/CHANGELOG.md'
            );
            require(indexPath);

            expect(handle).toHaveBeenCalledWith({
                path: '/CHANGELOG.md',
                diplayChanges: true
            });
        });
        test('-c', async () => {
            process.argv.push(
                '-c',
                '/CHANGELOG.md'
            );
            require(indexPath);

            expect(handle).toHaveBeenCalledWith({
                path: '/CHANGELOG.md',
                diplayChanges: true
            });
        });
    });
    test('detects \'--today\' option', async () => {
        process.argv.push(
            '--today',
            '/CHANGELOG.md'
        );
        require(indexPath);

        expect(handle).toHaveBeenCalledWith({
            path: '/CHANGELOG.md',
            releaseToday: true
        });
    });
    test('detects combined options', async () => {
        process.argv.push(
            '-v',
            '--today',
            '/CHANGELOG.md'
        );
        require(indexPath);

        expect(handle).toHaveBeenCalledWith({
            path: '/CHANGELOG.md',
            diplayVersion: true,
            releaseToday: true
        });
    });
});