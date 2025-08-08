const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

// ✅ Updated to match your environment variable names
const BUNNY_CDN_API_KEY = process.env.BUNNY_STORAGE_API_KEY;  // Changed from BUNNY_CDN_API_KEY
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE_NAME;
const UPLOAD_BASE_URL = process.env.BUNNY_UPLOAD_URL; // Using your custom upload URL
const CDN_BASE_URL = process.env.BUNNY_CDN_URL; // Using your custom CDN URL

// ✅ Enhanced validation with your variable names
const validateConfig = () => {
  const missing = [];
  
  if (!BUNNY_CDN_API_KEY) missing.push('BUNNY_STORAGE_API_KEY');
  if (!STORAGE_ZONE) missing.push('BUNNY_STORAGE_ZONE_NAME');
  if (!UPLOAD_BASE_URL) missing.push('BUNNY_UPLOAD_URL');
  if (!CDN_BASE_URL) missing.push('BUNNY_CDN_URL');
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ BunnyCDN config validated:', {
    hasApiKey: !!BUNNY_CDN_API_KEY,
    storageZone: STORAGE_ZONE,
    uploadUrl: UPLOAD_BASE_URL,
    cdnUrl: CDN_BASE_URL
  });
};

// ✅ Upload file to Bunny CDN storage
const uploadMediaToBunny = async (filePath) => {
  validateConfig();
  
  const fileName = path.basename(filePath);
  const uploadUrl = `${UPLOAD_BASE_URL}/${fileName}`;

  console.log('🔄 Uploading to BunnyCDN:', {
    fileName,
    uploadUrl,
    fileExists: fs.existsSync(filePath),
    fileSize: fs.existsSync(filePath) ? fs.statSync(filePath).size : 0
  });

  const fileBuffer = fs.readFileSync(filePath);

  try {
    const response = await axios.put(uploadUrl, fileBuffer, {
      headers: {
        AccessKey: BUNNY_CDN_API_KEY,
        "Content-Type": "application/octet-stream",
      },
    });

    console.log('✅ BunnyCDN upload response:', {
      status: response.status,
      statusText: response.statusText
    });

    // Delete local file after successful upload
    fs.unlinkSync(filePath);

    const result = {
      url: `${CDN_BASE_URL}/${fileName}`, // Using your CDN URL
      publicId: fileName,
    };

    console.log('✅ BunnyCDN upload successful:', result);
    return result;

  } catch (error) {
    console.error("❌ BunnyCDN upload error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      uploadUrl,
      hasApiKey: !!BUNNY_CDN_API_KEY
    });
    throw new Error("Upload to BunnyCDN failed");
  }
};

// ✅ Delete file from Bunny CDN storage
const deleteMediaFromBunny = async (publicId) => {
  validateConfig();
  
  if (!publicId) throw new Error("PublicId is required to delete file from Bunny CDN");

  const deleteUrl = `${UPLOAD_BASE_URL}/${publicId}`;

  try {
    const response = await axios.delete(deleteUrl, {
      headers: {
        AccessKey: BUNNY_CDN_API_KEY,
      },
    });
    
    console.log('✅ BunnyCDN file deleted:', publicId);
  } catch (error) {
    console.error("❌ BunnyCDN delete error:", {
      message: error.message,
      response: error.response?.data,
      publicId,
      deleteUrl
    });
    throw new Error("Delete from BunnyCDN failed");
  }
};

module.exports = {
  uploadMediaToBunny,
  deleteMediaFromBunny,
};
