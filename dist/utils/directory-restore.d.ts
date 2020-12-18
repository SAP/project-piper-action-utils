import * as artifact from '@actions/artifact';
/**
 * DirectoryRestore is able to save and restore a directory between jobs by uploading them as an artifact
 */
export declare class DirectoryRestore {
    private readonly directory;
    private readonly artifactName;
    constructor(directory: string, artifactName?: string);
    save(): Promise<artifact.UploadResponse>;
    load(): Promise<artifact.DownloadResponse>;
}
