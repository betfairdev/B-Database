import * as sharp from 'sharp';

export class ThumbnailService {
  private readonly defaultSizes = [64, 128, 256];

  async generate(imageBuffer: Buffer, sizes: number[] = this.defaultSizes): Promise<string> {
    try {
      // Generate thumbnail at the largest size (usually 256px)
      const maxSize = Math.max(...sizes);
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(maxSize, maxSize, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Convert to base64 for storage
      return `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      return '';
    }
  }

  async generateMultipleSizes(imageBuffer: Buffer, sizes: number[] = this.defaultSizes): Promise<Record<number, string>> {
    const thumbnails: Record<number, string> = {};

    for (const size of sizes) {
      try {
        const thumbnailBuffer = await sharp(imageBuffer)
          .resize(size, size, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 80 })
          .toBuffer();

        thumbnails[size] = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;
      } catch (error) {
        console.error(`Failed to generate ${size}px thumbnail:`, error);
      }
    }

    return thumbnails;
  }
}