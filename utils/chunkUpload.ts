export async function uploadInChunks(file: File, chunkSize: number = 1024 * 1024 * 5) {
    const chunks: Blob[] = [];
    let startPointer = 0;
    
    while (startPointer < file.size) {
      const chunk = file.slice(startPointer, startPointer + chunkSize);
      chunks.push(chunk);
      startPointer += chunkSize;
    }
    
    return chunks;
  }