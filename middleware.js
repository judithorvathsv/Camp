const Campground = require('./models/campground')
const Review = require('./models/review')

//check user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){      
        req.flash('error', 'You must be signed in first!')
        req.session.returnTo = req.originalUrl
        return res.redirect('/login')
      } 
      next()
}


//Route back
module.exports.storeReturnTo = (req, res, next) =>{
  if(req.session.returnTo){
      res.locals.returnTo = req.session.returnTo
  }
  next()
} 


//Validations
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const ExpressError = require('./utilities/ExpressError')

module.exports.validatieCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

module.exports.validatieReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
    } else {
      next()
    }
  }


//Check author to edit, delete
module.exports.isAuthor = async(req, res, next)=>{
  const { id } = req.params
  const campground = await Campground.findById(id)
  if(!campground.author.equals(req.user._id)){
    req.flash('error', 'You do not have permission to do that!')
    return res.redirect(`/campgrounds/${campground._id}`)
  }
  next()
}


//Check review author to delete
module.exports.isReviewAuthor = async(req, res, next)=>{
  const { id, reviewId } = req.params
  const review = await Review.findById(reviewId)
  if(!review.author.equals(req.user._id)){
    req.flash('error', 'You do not have permission to do that!')
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}
