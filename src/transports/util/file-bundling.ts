import * as crypto from 'crypto';
import * as os from 'os';
import * as path from 'path';
import * as fs from './fs';
import promisedTempPath from './promised-temp-path';





// TODO: ...
export let getBundleFilename: (globPatterns: string[]) => Promise<string> = async (globPatterns: string[]) => {

    // Get all the filenames that make up this bundle file.
    let filenames = globPatterns.reduce((filenames: string[], globPattern) => {

        // TODO: remove the following restriction if the associated node-glob issue gets resolved favourably.
        // Restrict the allowed characters in the glob pattern to circumvent a node-glob cross-platform issue.
        // See: https://github.com/isaacs/node-glob/issues/212 and https://github.com/isaacs/minimatch/issues/64
        let isValid = globPatternRegex.test(globPattern);
        if (!isValid) throw new Error('getBundleFilename: glob pattern contains disallowed characters: ' + JSON.stringify(globPattern));

        // Strictly use '/' as the path separator, as node-glob requires.
        globPattern = globPattern.split('\\').join('/');

        // Find all matching files.
        let matchingFilenames = fs.globSync(globPattern); // TODO: use async glob method here

        // Sort filenames alphabetically so bundle files can be explicitly ordered using filenames eg '01 ...', '02 ...' etc.
        matchingFilenames.sort();

        // Accumulate the results.
        filenames = filenames.concat(matchingFilenames);
        return filenames;
    }, []);

    // TODO: Can't have empty bundles.
    if (filenames.length === 0) throw new Error('getBundleFilename: bundle contains no files.');

    // TODO: Computing a hash on every request won't scale very nicely. Better would be fs.watch, _.throttle, or simple timer-based polling for changes.
    let hash = await (getBundleHashCode(filenames));
    let targetPath = path.join(await (promisedTempPath), hash) + getBundleExtension(filenames);
    if (!(await (fs.exists(targetPath)))) {
        await (createBundleFile(filenames, targetPath));
    }

    // TODO: All done.
    return targetPath;
};





// TODO: ...
let globPatternRegex = /^[a-zA-Z0-9:/\\. _\-*?]+$/;





// TODO: ...
function getBundleExtension(containedFiles: string[]): string {
    let exts = containedFiles.map(path.extname);
    let firstExt = exts[0];
    return exts.every(ext => ext === firstExt) ? firstExt : '';
}





// TODO: ...
let getBundleHashCode = async (containedFiles: string[]) => {

    // TODO: what if there was a collision? Wrong bundle/file may be served. Investigate risks & implications.
    let stats = await Promise.all(containedFiles.map(p => fs.stat(p)));
    let hash = crypto.createHash('md5');
    for (let i = 0; i < containedFiles.length; ++i) {
        hash.update(containedFiles[i]);
        hash.update(stats[i].mtime.getTime().toString());
    }
    let result: string = hash.digest('hex');
    return result;
};





// TODO: ...
var createBundleFile = async (containedFiles: string[], targetPath: string) => {
    // TODO: there are several inefficiencies in here - eg regex replace to strip BOM, loading file contents all into mem instead of streaming.

    // Create the target file.
    let fd = await (fs.open(targetPath, 'ax', null));
    await (fs.close(fd));

    // TODO: loop over files...
    for (let i = 0; i < containedFiles.length; ++i) {
        let filename = containedFiles[i];

        // Load the file's content.
        let content = await (fs.readFile(filename, 'utf8'));

        // Remove BOM if present.
        content = content.replace(/^\uFEFF/, '');

        // Append the content to the target file.
        await (fs.appendFile(targetPath, content, { encoding: 'utf8' }));
        await (fs.appendFile(targetPath, os.EOL, { encoding: 'utf8' }));
    }
};
