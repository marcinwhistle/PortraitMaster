const Photo = require('../models/photo.model');
const sanitizeHtml = require('sanitize-html');

// Function to validate email using regex
const isEmailValid = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {
  try {
    // Extract input fields
    const { title, author, email } = req.fields;
    const file = req.files.file;

    // Perform length validation on original input
    if (title.length >= 25) {
      throw new Error('Title is too long');
    }

    if (author.length >= 50) {
      throw new Error('Author name is too long');
    }

    // Sanitize input fields
    const sanitizedTitle = sanitizeHtml(title, {
      allowedTags: [], // Disallow all HTML tags
      allowedAttributes: {}, // Disallow all HTML attributes
    });
    const sanitizedAuthor = sanitizeHtml(author, {
      allowedTags: [], // Disallow all HTML tags
      allowedAttributes: {}, // Disallow all HTML attributes
    });
    const sanitizedEmail = sanitizeHtml(email, {
      allowedTags: [], // Disallow all HTML tags
      allowedAttributes: {}, // Disallow all HTML attributes
    });

    if (sanitizedTitle && sanitizedAuthor && sanitizedEmail && file) {
      // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0];
      if (fileExt === 'jpg' || fileExt === 'png' || fileExt === 'gif') {
        // Validate email using regex
        if (!isEmailValid(sanitizedEmail)) {
          throw new Error('Wrong email format');
        }

        const newPhoto = new Photo({
          title: sanitizedTitle,
          author: sanitizedAuthor,
          email: sanitizedEmail,
          src: fileName,
          votes: 0,
        });

        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);
      } else {
        throw new Error('Wrong file type');
      }
    } else {
      throw new Error('Wrong input!');
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {
  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if (!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
