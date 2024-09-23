import * as fs from 'fs';
import * as path from 'path';
import * as tar from 'tar';
import axios from 'axios';
import * as unzipper from 'unzipper';
import {Semaphore} from 'async-mutex';
import {logger} from "../wrapper/loggerConfig";
import {finished} from 'stream/promises';

type SupportedPlatforms = 'win32' | 'darwin' | 'linux';

export class CxInstaller {
    private readonly platform: string;
    private cliVersion = '2.2.6';
    private readonly resourceDirPath: string;
    private static installSemaphore = new Semaphore(1);  // Semaphore with 1 slot

    constructor(platform: string) {
        this.platform = platform;
        this.resourceDirPath = path.join(__dirname, `../wrapper/resources`);
    }

    getDownloadURL(): string {
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

        return `https://download.checkmarx.com/CxOne/CLI/${this.cliVersion}/ast-cli_${this.cliVersion}_${platformData.platform}_x64.${platformData.extension}`;
    }

    getExecutablePath(): string {
        const executableName = this.platform === 'win32' ? 'cx.exe' : 'cx';
        return path.join(this.resourceDirPath, executableName);
    }


    async downloadIfNotInstalledCLI(): Promise<void> {
        const [_, release] = await CxInstaller.installSemaphore.acquire();
        try {
            await fs.promises.mkdir(this.resourceDirPath, { recursive: true });
            
            if (this.checkExecutableExists()) {
                logger.info('Executable already installed.');
                return;
            }
            const url = this.getDownloadURL();
            const zipPath = path.join(this.resourceDirPath, this.getCompressFolderName());

            await this.downloadFile(url, zipPath);
            logger.info('Downloaded CLI to:', zipPath);

            await this.extractArchive(zipPath, this.resourceDirPath);
            
            fs.unlink(zipPath, (err) => {
                if (err) {
                    logger.error('Error deleting the file:', err);
                } else {
                    logger.info('File deleted successfully!');
                }
            });
            
            fs.chmodSync(this.getExecutablePath(), 0o755);
            logger.info('Extracted CLI to:', this.resourceDirPath);
        } catch (error) {
            logger.error('Error during installation:', error);
        } finally {
            release();
        }
    }

    async extractArchive(zipPath: string, extractPath: string): Promise<void> {
        if (zipPath.endsWith('.zip')) {
            await unzipper.Open.file(zipPath)
                .then(d => d.extract({path: extractPath}));
        } else if (zipPath.endsWith('.tar.gz')) {
            await tar.extract({file: zipPath, cwd: extractPath});
        } else {
            logger.error('Unsupported file type. Only .zip and .tar.gz are supported.');
        }
    }

    async downloadFile(url: string, outputPath: string) {
        logger.info('Downloading file from:', url);
        const writer = fs.createWriteStream(outputPath);
        const response = await axios({url, responseType: 'stream'});
        response.data.pipe(writer);

        await finished(writer); // Use stream promises to await the writer
        logger.info('Download finished');
    }

    checkExecutableExists(): boolean {
        return fs.existsSync(this.getExecutablePath());
    }
    
    getCompressFolderName(): string {
        return `ast-cli.${this.platform === 'win32' ? 'zip' : 'tar.gz'}`;
    }
}
