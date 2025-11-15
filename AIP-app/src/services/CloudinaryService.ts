interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

const parseCloudinaryUrl = (url: string): CloudinaryConfig => {
  const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!match) {
    throw new Error('Invalid CLOUDINARY_URL format');
  }
  return {
    cloudName: match[3],
    apiKey: match[1],
    apiSecret: match[2],
  };
};

const generateSignature = async (params: Record<string, string>, apiSecret: string): Promise<string> => {
  const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
  const stringToSign = sortedParams + apiSecret;

  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;

  if (!CLOUDINARY_URL) {
    throw new Error('CLOUDINARY_URL environment variable is missing.');
  }

  const { cloudName, apiKey, apiSecret } = parseCloudinaryUrl(CLOUDINARY_URL);

  const timestamp = Math.floor(Date.now() / 1000).toString();

  const params: Record<string, string> = {
    timestamp,
    api_key: apiKey,
  };

  const signature = await generateSignature(params, apiSecret);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('timestamp', timestamp);
  formData.append('api_key', apiKey);
  formData.append('signature', signature);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Upload failed');
  }
};
