const express = require('express')
const router = express.Router()
const Campground = require('../models/campground')
const catchAsync = require('../utilities/catchAsync')
const {isLoggedIn, isAuthor, validatieCampground} = require('../middleware')
const campgroundsController = require('../controllers/campgrounds')
const multer = require('multer')
/* const upload = multer({dest: 'uploads'}) */
const {storage} = require('../cloudinary')
const upload = multer({storage})

router.route('/')
  .get(catchAsync(campgroundsController.index))
  //.post(isLoggedIn, validatieCampground, catchAsync(campgroundsController.createCampground))
/*   .post(upload.array('image'), (req, res) => {
    console.log(req.body, req.file)
    res.send("workded")
  }) */
  .post(isLoggedIn, upload.array('image'), validatieCampground, catchAsync(campgroundsController.createCampground))

router.get('/new', isLoggedIn, campgroundsController.renderNewForm)

router.route('/:id')
  .get(catchAsync(campgroundsController.showCampground))
  .put(isLoggedIn, isAuthor, upload.array('image'), validatieCampground, catchAsync(campgroundsController.updateCampground)) 
  .delete(isLoggedIn, isAuthor, catchAsync(campgroundsController.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgroundsController.renderEditForm))

module.exports = router
