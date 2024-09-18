import * as fs from 'fs/promises';
import * as path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { createWriteStream } from 'node:fs';
import fetch from 'node-fetch';
import AdmZip from 'adm-zip'; // For extracting ZIP files
import * as tar from 'tar';   // For extracting tar.gz files

const streamPipeline = promisify(pipeline);

export class CxInstaller {
    private readonly platform: string;
    private cliVersion: string;

    constructor(platform: string) {
        this.platform = platform;
    }

    // Method to get the download URL based on OS and architecture
    async getDownloadURL(): Promise<string> {
        const cliVersion = await this.readASTCLIVersion();
        let platformString: string;
        let archiveExtension: string;

        switch (this.platform) {
            case 'win32':
                platformString = 'windows';
                archiveExtension = 'zip';
                break;
            case 'darwin':
                archiveExtension = 'tar.gz';
                platformString = 'darwin';
                break;
            case 'linux':
                archiveExtension = 'tar.gz';
                platformString = 'linux';
                break;
            default:
                throw new Error('Unsupported platform or architecture');
        }

        return `https://download.checkmarx.com/CxOne/CLI/${cliVersion}/ast-cli_${cliVersion}_${platformString}_x64.${archiveExtension}`;
    }
    
    async getCLIExecutableName(): Promise<string> {
        let platformString: string;
        let archiveExtension: string;
        this.cliVersion = await this.readASTCLIVersion();

        switch (this.platform) {
            case 'win32':
                platformString = 'windows';
                archiveExtension = 'zip';
                break;
            case 'darwin':
                archiveExtension = 'tar.gz';
                platformString = 'darwin';
                break;
            case 'linux':
                archiveExtension = 'tar.gz';
                platformString = 'linux';
                break;
            default:
                throw new Error('Unsupported platform or architecture');
        }

        return `ast-cli_${this.cliVersion}_${platformString}_x64.${archiveExtension}`;
    }

    removeExtension(fileName: string): string {
        if (fileName.endsWith('.tar.gz')) {
            return fileName.slice(0, -7); // Remove '.tar.gz'
        }
        return fileName.replace(/\.[^/.]+$/, ''); // Remove other extensions like '.zip'
    }
    
    // Method to download the file
    async downloadFile(url: string, outputPath: string): Promise<void> {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`);
        }

        await streamPipeline(response.body, createWriteStream(outputPath));
        console.log(`Downloaded to ${outputPath}`);
    }

    // Method to extract the file (ZIP or tar.gz)
    async extractFile(filePath: string, outputDir: string): Promise<void> {
        if (filePath.endsWith('.zip')) {
            // Extract ZIP file
            const zip = new AdmZip(filePath);
            zip.extractAllTo(outputDir, true); // Extract to outputDir
            console.log(`Extracted ZIP to ${outputDir}`);
        } else if (filePath.endsWith('.tar.gz')) {
            // Extract tar.gz file
            await tar.extract({
                file: filePath,
                cwd: outputDir, // Extract to the outputDir
            });
            console.log(`Extracted tar.gz to ${outputDir}`);
        } else {
            throw new Error('Unsupported archive format');
        }
    }

    // Method to execute the installation
    async install(outputPath: string): Promise<void> {
        const exists = await this.checkExecutableExists();
        if (exists) {
            console.log('Executable already exists. Skipping installation.');
            return;
        }

        const url = await this.getDownloadURL();
        if (!url) {
            console.error('No valid download URL available for this platform.');
            return;
        }

        const archivePath = path.join(outputPath, await this.getCLIExecutableName());

        try {
            await this.downloadFile(url, archivePath);

            // Now extract the downloaded archive
            await this.extractFile(archivePath, outputPath);
        } catch (error) {
            console.error(`Error during installation: ${error.message}`);
        }
    }

    // Check if the executable exists
    async checkExecutableExists(): Promise<boolean> {
        let executablePath;
        let dirExecutablePath = path.join(__dirname, `/resources/${this.removeExtension(await this.getCLIExecutableName())}`);
        if (this.platform === 'win32') {
            executablePath = path.join(dirExecutablePath, 'cx.exe');
        } else {
            executablePath = path.join(dirExecutablePath, '/cx');
        }
        try {
            await fs.access(executablePath);
            console.log(`Executable exists at: ${executablePath}`);
            return true;
        } catch (error) {
            console.error(`Executable does not exist at: ${executablePath}`);
            return false;
        }
    }

    // Method to read the AST CLI version from the file
    async readASTCLIVersion(): Promise<string> {
        if (this.cliVersion) {
            return this.cliVersion;
        }
        try {
            const versionFilePath = path.join(process.cwd(), 'checkmarx-ast-cli.version');
            const versionContent = await fs.readFile(versionFilePath, 'utf-8');
            return versionContent.trim();
        } catch (error) {
            console.error('Error reading AST CLI version:', error);
            throw error;
        }
    }
}
