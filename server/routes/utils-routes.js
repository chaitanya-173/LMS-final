const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { uploadMediaToBunny } = require("../helpers/bunny");
const authenticate = require("../middlewares/auth-middleware");

// Configure multer for temporary file storage
const upload = multer({
  dest: "uploads/temp/", // Temporary storage
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB limit for large videos
  },
  fileFilter: (req, file, cb) => {
    // Allow videos, images, and PDFs
    const allowedTypes = [
      'video/mp4', 'video/avi', 'video/mkv', 'video/mov', 'video/webm',
      'image/jpeg', 'image/png', 'image/jpg', 'image/webp',
      'application/pdf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// ✅ MAIN UPLOAD ENDPOINT
router.post("/upload", authenticate, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No file provided" 
      });
    }

    console.log('📁 File upload request:', {
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // ✅ Upload to BunnyCDN
    const result = await uploadMediaToBunny(req.file.path);
    
    console.log('✅ BunnyCDN upload success:', result);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      url: result.url,        // Public CDN URL
      publicId: result.publicId, // File identifier for deletion
      originalName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Clean up temp file on error
    if (req.file && req.file.path) {
      const fs = require('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: "File upload failed",
      error: error.message
    });
  }
});

module.exports = router;
