import {logger} from '../wrapper/loggerConfig';
import * as fs from 'fs';
import {finished} from 'stream/promises';
import {Client} from "./Client";

export class AstClient {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    public async downloadFile(url: string, outputPath: string): Promise<void> {
        logger.info(`Starting download from URL: ${url}`);
        const writer = fs.createWriteStream(outputPath);
        try {
            const response = await this.client.request(url, 'GET', null);
            response.data.pipe(writer);
            await finished(writer);
            logger.info(`Download completed successfully. File saved to: ${outputPath}`);
        } catch (error) {
            logger.error(`Error downloading file from ${url}: ${error.message || error}`);
            throw error;
        } finally {
            writer.close();
            logger.info('Write stream closed.');
        }
    }
}

