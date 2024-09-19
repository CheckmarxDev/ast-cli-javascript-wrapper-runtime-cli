import * as fs from 'fs/promises';
import * as path from 'path';
import AdmZip from 'adm-zip'; // For extracting ZIP files
import * as tar from 'tar';
import axios from 'axios';
import {createWriteStream} from "node:fs";


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
    
    getExecutablePath(): string {
        let executablePath;
        const dirExecutablePath = path.join(__dirname, `../wrapper/resources`);
        if (this.platform === 'win32') {
            executablePath = path.join(dirExecutablePath, 'cx.exe');
        } else {
            executablePath = path.join(dirExecutablePath, 'cx');
        }
        return executablePath;
    }

    getZipPath(): string {
        let executablePath;
        const dirExecutablePath = path.join(__dirname, `../wrapper/resources/`);
        if (this.platform === 'win32') {
            executablePath = path.join(dirExecutablePath, 'cx.zip');
        } else {
            executablePath = path.join(dirExecutablePath, 'cx.tar.gz');
        }
        return executablePath;
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
        
        try {
            console.log(`Downloading from: ${url}`);
            await downloadFile(url, outputPath);
            console.log(`Downloaded to: ${outputPath}`);

            // Now extract the downloaded archive
        } catch (error) {
            console.error(`Error during installation: ${error.message}`);
        }
    }

    // Check if the executable exists
    async checkExecutableExists(): Promise<boolean> {
        let executablePath;
        const dirExecutablePath = path.join(__dirname, `../../wrapper/resources/`);
        if (this.platform === 'win32') {
            executablePath = path.join(dirExecutablePath, 'cx.exe');
        } else {
            executablePath = path.join(dirExecutablePath, 'cx');
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

async function downloadFile(downloadURLPath: string, filePath: string): Promise<void> {
    const fileName = "cx";
    console.log(`Downloading ${fileName} from: ${downloadURLPath}`);

    try {
        // Ensure the directory exists
        await fs.mkdir(path.dirname(downloadURLPath), { recursive: true });

        // Check if filePath is a directory
        try {
            const stats = await fs.stat(filePath);
            if (stats.isDirectory()) {
                // If it's a directory, append the filename from the URL
                filePath = path.join(filePath, path.basename(downloadURLPath));
            }
        } catch (error) {
            // If the path doesn't exist, assume it's meant to be a file
            // The directory has already been created above
        }

        // Perform HTTP GET request
        const response = await axios({
            method: 'GET',
            url: downloadURLPath,
            responseType: 'stream'
        });
        // Create the file stream at the specified filePath
        const fileStream = createWriteStream(process.cwd()+"/src/main/wrapper/resources/cx");

        // Pipe the response data to the file
        response.data.pipe(fileStream);

        // Wait for the file to finish writing
        await new Promise<void>((resolve, reject) => {
            fileStream.on('finish', resolve);
            fileStream.on('error', reject);
        });

        console.log(`File downloaded successfully to ${filePath}`);

    } catch (error) {
        console.log(`Error during file download:` + error.message);
        throw new Error(`Invoking HTTP request to download file failed - ${error.message}`);
    }
}

