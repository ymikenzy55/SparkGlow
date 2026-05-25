const HeroBanner = require('../models/HeroBanner');
const cloudinary = require('../config/cloudinary');

exports.getHeroBanners = async (req, res) => {
  const banners = await HeroBanner.find({ active: true }).sort({ order: 1, createdAt: -1 }).lean();
  res.json({ success: true, banners });
};

exports.getAllHeroBanners = async (req, res) => {
  const banners = await HeroBanner.find().sort({ order: 1, createdAt: -1 }).lean();
  res.json({ success: true, banners });
};

exports.createHeroBanner = async (req, res) => {
  const bannerData = { ...req.body };

  if (req.file) {
    bannerData.image = req.file.path;
  } else if (req.body.image) {
    bannerData.image = req.body.image;
  } else {
    return res.status(400).json({ success: false, message: 'Image is required' });
  }

  if (bannerData.order !== undefined) {
    bannerData.order = Number(bannerData.order);
  }
  if (bannerData.active !== undefined) {
    bannerData.active = bannerData.active === 'true' || bannerData.active === true;
  }

  const banner = await HeroBanner.create(bannerData);
  
  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.emit('hero-banner-created', banner);
  }
  
  res.status(201).json({ success: true, banner });
};

exports.updateHeroBanner = async (req, res) => {
  const bannerData = { ...req.body };

  if (req.file) {
    // Delete old image from Cloudinary
    const oldBanner = await HeroBanner.findById(req.params.id);
    if (oldBanner && oldBanner.image && oldBanner.image.includes('cloudinary.com')) {
      const publicId = oldBanner.image.split('/').slice(-2).join('/').split('.')[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        // Silent fail
      }
    }
    bannerData.image = req.file.path;
  }

  if (bannerData.order !== undefined) {
    bannerData.order = Number(bannerData.order);
  }
  if (bannerData.active !== undefined) {
    bannerData.active = bannerData.active === 'true' || bannerData.active === true;
  }

  const banner = await HeroBanner.findByIdAndUpdate(req.params.id, bannerData, { new: true, runValidators: true });
  if (!banner) return res.status(404).json({ success: false, message: 'Hero banner not found' });

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.emit('hero-banner-updated', banner);
  }

  res.json({ success: true, banner });
};

exports.deleteHeroBanner = async (req, res) => {
  const banner = await HeroBanner.findByIdAndDelete(req.params.id);
  if (!banner) return res.status(404).json({ success: false, message: 'Hero banner not found' });

  // Delete image from Cloudinary
  if (banner.image && banner.image.includes('cloudinary.com')) {
    const publicId = banner.image.split('/').slice(-2).join('/').split('.')[0];
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      // Silent fail
    }
  }

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.emit('hero-banner-deleted', banner._id);
  }

  res.json({ success: true, message: 'Hero banner deleted' });
};
