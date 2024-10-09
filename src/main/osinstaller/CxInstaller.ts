import * as fsPromises from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import * as tar from 'tar';
import axios from 'axios';
import * as unzipper from 'unzipper';
import {logger} from "../wrapper/loggerConfig";
import {finished} from 'stream/promises';

type SupportedPlatforms = 'win32' | 'darwin' | 'linux';

export class CxInstaller {
    private readonly platform: string;
    private cliVersion: string;
    private readonly resourceDirPath: string;
    private readonly cliDefaultVersion = '2.3.0'; // This will be used if the version file is not found. Should be updated with the latest version.

    constructor(platform: string) {
        this.platform = platform;
        this.resourceDirPath = path.join(__dirname, `../wrapper/resources`);
    }

    private async getDownloadURL(): Promise<string> {
        const cliVersion = await this.readASTCLIVersion();

        const platforms: Record<SupportedPlatforms, { platform: string; extension: string }> = {
            win32: {platform: 'windows', extension: 'zip'},
            darwin: {platform: 'darwin', extension: 'tar.gz'},
            linux: {platform: 'linux', extension: 'tar.gz'}
        };

        const platformKey = this.platform as SupportedPlatforms;

        const platformData = platforms[platformKey];
        if (!platformData) {
            throw new Error('Unsupported platform or architecture');
        }

        return `https://download.checkmarx.com/CxOne/CLI/${cliVersion}/ast-cli_${cliVersion}_${platformData.platform}_x64.${platformData.extension}`;
    }

    public getExecutablePath(): string {
        const executableName = this.platform === 'win32' ? 'cx.exe' : 'cx';
        return path.join(this.resourceDirPath, executableName);
    }

    public async downloadIfNotInstalledCLI(): Promise<void> {
        try {
            await fs.promises.mkdir(this.resourceDirPath, {recursive: true});

            if (this.checkExecutableExists()) {
                logger.info('Executable already installed.');
                return;
            }
            const url = await this.getDownloadURL();
            const zipPath = path.join(this.resourceDirPath, this.getCompressFolderName());

            await this.downloadFile(url, zipPath);
            logger.info('Downloaded CLI to:', zipPath);

            await this.extractArchive(zipPath, this.resourceDirPath);

            fs.unlink(zipPath, (err) => {
                if (err) {
                    logger.warn('Error deleting the file:', err);
                } else {
                    logger.info('File deleted successfully!');
                }
            });

            fs.chmodSync(this.getExecutablePath(), 0o755);
            logger.info('Extracted CLI to:', this.resourceDirPath);
        } catch (error) {
            logger.error('Error during installation:', error);
        }
    }

    private async extractArchive(zipPath: string, extractPath: string): Promise<void> {
        if (zipPath.endsWith('.zip')) {
            await unzipper.Open.file(zipPath)
                .then(d => d.extract({path: extractPath}));
        } else if (zipPath.endsWith('.tar.gz')) {
            await tar.extract({file: zipPath, cwd: extractPath});
        } else {
            logger.error('Unsupported file type. Only .zip and .tar.gz are supported.');
        }
    }

    private async downloadFile(url: string, outputPath: string) {
        logger.info('Downloading file from:', url);
        const writer = fs.createWriteStream(outputPath);

        try {
            const response = await axios({url, responseType: 'stream'});
            response.data.pipe(writer);

            await finished(writer); // Use stream promises to await the writer
            logger.info('Download finished');
        } catch (error) {
            logger.error('Error downloading file:', error.message || error);
        } finally {
            writer.close();
        }
    }
    
    private checkExecutableExists(): boolean {
        return fs.existsSync(this.getExecutablePath());
    }

    private async readASTCLIVersion(): Promise<string> {
        if (this.cliVersion) {
            return this.cliVersion;
        }
        try {
            const versionFilePath = this.getVersionFilePath();
            const versionContent = await fsPromises.readFile(versionFilePath, 'utf-8');
            return versionContent.trim();
        } catch (error) {
            logger.warn('Error reading AST CLI version: ' + error.message);
            return this.cliDefaultVersion;
        }
    }

    private getVersionFilePath(): string {
        return path.join(__dirname,'../../../checkmarx-ast-cli.version');
    }

    private getCompressFolderName(): string {
        return `ast-cli.${this.platform === 'win32' ? 'zip' : 'tar.gz'}`;
    }
}
