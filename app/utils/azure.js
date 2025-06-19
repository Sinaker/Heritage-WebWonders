const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
const ULID = require('ulid');

exports.uploadFileToAzure = async (userId, file) => {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
    if (!accountName || !containerName) throw new Error('Azure Details not found');

    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);

    if (!file) {
        const err = new Error('No file uploaded.');
        err.httpStatusCode = 400;
        throw err;
    }
    
    
    const fileName = `${userId}-${ULID.ulid()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    
    try {
        await blockBlobClient.upload(
            file.buffer, 
            file.size, 
            {
                blobHTTPHeaders: { blobContentType: file.mimetype }
            }
        );
        
        return `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}`; // Return the URL of the uploaded file
    } catch (error) {
        const err = new Error(error.message || "Failed azure blob upload");
        err.httpStatusCode = 500;
        throw err;
    }
};
exports.editFileToAzure = async (userId, originalFileUrl, newFile) => {
    try {
        const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
        const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
        if (!accountName || !containerName) throw new Error('Azure Details not found');

        const blobServiceClient = new BlobServiceClient(
            `https://${accountName}.blob.core.windows.net`,
            new DefaultAzureCredential()
        );
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const originalFileName = originalFileUrl.split('/').pop();
        let blockBlobClient = containerClient.getBlockBlobClient(originalFileName);
        const newAccessTier = 'Cool';

        // Rehydrate priority: 'High' or 'Standard'
        const rehydratePriority = 'High';

        const result = await blockBlobClient.setAccessTier(
            newAccessTier,
            { rehydratePriority }
        );
        if (result.errorCode) {
            throw new Error(`Failed to set access tier: ${result.errorCode}`);
        }

        const newFileName = `${userId}-${ULID.ulid()}-${newFile.originalname}`;
        blockBlobClient = containerClient.getBlockBlobClient(newFileName);
        // Upload the new file
        await blockBlobClient.upload(newFile.buffer, newFile.size, {
            blobHTTPHeaders: { blobContentType: newFile.mimetype }
        });
        
        return `https://${accountName}.blob.core.windows.net/${containerName}/${newFileName}`;
    } catch (error) {
        console.error("Azure edit error:", error);
        const err = new Error(`Failed to edit file in Azure Blob Storage: ${error.message}`);
        err.httpStatusCode = 500;
        throw err;
    }
};