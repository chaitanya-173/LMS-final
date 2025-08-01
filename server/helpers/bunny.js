const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

const BUNNY_CDN_API_KEY = process.env.BUNNY_CDN_API_KEY;
const STORAGE_ZONE = process.env.BUNNY_CDN_STORAGE_ZONE_NAME;
const REGION = process.env.BUNNY_CDN_REGION;

// Upload file to Bunny CDN storage
const uploadMediaToBunny = async (filePath) => {
  const fileName = path.basename(filePath);
  const uploadUrl = `https://${REGION}.storage.bunnycdn.com/${STORAGE_ZONE}/${fileName}`;

  const fileBuffer = fs.readFileSync(filePath);

  try {
    const response = await axios.put(uploadUrl, fileBuffer, {
      headers: {
        AccessKey: BUNNY_CDN_API_KEY,
        "Content-Type": "application/octet-stream",
      },
    });

    // Delete local file after successful upload, optional but recommended
    fs.unlinkSync(filePath);

    return {
      url: `https://${REGION}.b-cdn.net/${fileName}`, // This is the public CDN URL
      publicId: fileName, // Rename fileName to publicId for clarity in DB
    };
  } catch (error) {
    console.error("Error uploading to BunnyCDN:", error?.response?.data || error.message);
    throw new Error("Upload to BunnyCDN failed");
  }
};

// Delete file from Bunny CDN storage by publicId (fileName)
const deleteMediaFromBunny = async (publicId) => {
  if (!publicId) throw new Error("PublicId is required to delete file from Bunny CDN");

  const deleteUrl = `https://${REGION}.storage.bunnycdn.com/${STORAGE_ZONE}/${publicId}`;

  try {
    await axios.delete(deleteUrl, {
      headers: {
        AccessKey: BUNNY_CDN_API_KEY,
      },
    });
  } catch (error) {
    console.error("Error deleting from BunnyCDN:", error?.response?.data || error.message);
    throw new Error("Delete from BunnyCDN failed");
  }
};

module.exports = {
  uploadMediaToBunny,
  deleteMediaFromBunny,
};
