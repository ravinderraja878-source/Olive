import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = cloudName && apiKey && apiSecret;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!isCloudinaryConfigured) {
      return NextResponse.json(
        { error: 'Cloudinary credentials are not configured on this server.' },
        { status: 501 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const mediaType = formData.get('type') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using a promise wrapper
    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: mediaType === 'video' ? 'video' : 'image',
          folder: 'olive_prayer_house',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          } else {
            reject(new Error('Cloudinary upload returned empty result'));
          }
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });

  } catch (error: any) {
    console.error('Cloudinary upload route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Server upload failed' },
      { status: 500 }
    );
  }
}
