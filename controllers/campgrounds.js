const { cloudinary } = require('../cloudinary')
const Campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken: mapBoxToken})


//Index
module.exports.index = async(req,res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
}


//Create
module.exports.renderNewForm = (req, res) => { 
    res.render('campgrounds/new') 
}

module.exports.createCampground = async (req, res, next) => { 
  const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send()
    const campground = new Campground(req.body.campground)  
    campground.geometry = geoData.body.features[0].geometry   
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));  
    campground.author = req.user._id  
    await campground.save()   
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}


//Show
module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)  
      .populate({path: 'reviews', populate: {path: 'author'}}).populate('author') 

    if(!campground){
      req.flash('error', 'Cannot find that campground!')
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground})
}


//Edit
module.exports.renderEditForm = async (req, res) => {  
    const { id } = req.params
    const campground = await Campground.findById(id)
    if(!campground){
      req.flash('error', 'Cannot find that campground!')
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })    
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})        
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename })); 
    campground.images.push(...imgs);
    await campground.save()
    if(req.body.deleteImages){
      //delete checked images from cloudinary
      for(let filenameToDelete of req.body.deleteImages){
        console.log('filenameToDelete ', filenameToDelete)
        await cloudinary.uploader.destroy(filenameToDelete)
      }
      //checking checked checkboxes and pull out those images from Mongo
      await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`) 
}


//Delete
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)    
    if(campground.images.length !== null){      
      //delete checked images from cloudinary
      for(let img of campground.images){
        console.log('img',img)
        await cloudinary.uploader.destroy(img.filename)
      }
    }
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}